(function(root, factory) {
    if (typeof define === "function" && define.amd) {
        define(['lodash', 'lalu', 'lalu.model'], factory);
    } else if (typeof module === "object" && module.exports) {
        var lodash = require('lodash');
        var lalu = require('./lalu');
        var model = require('./model');
        module.exports = factory(lodash, lalu, model);
    } else {
        factory(_, root.lalu, root.lalu.model);
    }
}(this, function(lodash, lalu) {

    var each = lodash.each,
        isNil = lodash.isNil,
        isString = lodash.isString,
        defaults = lodash.defaults,
        map = lodash.map,
        uniq = lodash.uniq,
        uniqueId = lodash.uniqueId;

    var View = function(options) {
        var that = this;

        options = defaultOptions(options, that);

        that.elements = makeElements(options, that);

        that.binders = {};
        attachBinders(options, that.binders, that);

        that.setCss(options.css);
    };

    var defaultOptions = function(options, that) {
        options = options || {};

        options = defaults({}, options, {
            elements: that.elements,
            elementsSelector: that.elementsSelector,
            html: that.html,
            css: that.css || '',
        });

        return options;
    }

    var makeElements = function(options, that) {
        if (options.elements) {
            return options.elements;
        } else if (isString(options.elementsSelector)) {
            return document.querySelectorAll(options.elementsSelector);
        } else {
            return setHtml.call(that, options.html, true);
        }
    }

    var ViewPrototype = View.prototype;

    var body = document.body;
    var viewNameText = 'view-name';
    var viewIdText = 'view-id';
    var setCss = ViewPrototype.setCss = function(css) {
        css = css || '';

        var id;
        if (css.indexOf(viewNameText) > -1) {
            css = css.replace(new RegExp(viewNameText, 'g'), this.name);
            id = this.name;
        }
        if (css.indexOf(viewIdText) > -1) {
            css = css.replace(new RegExp(viewIdText, 'g'), this.id);
            id = this.id;
        }

        var styleEl = document.getElementById(id);
        if (isNil(styleEl)) {
            styleEl = document.createElement('style');
            styleEl.setAttribute('id', id);
            body.appendChild(styleEl);
        }

        styleEl.innerHTML = css;

        return styleEl;
    };

    var setHtml = ViewPrototype.setHtml = function(html, isAuto) {
        // Todo remove elements that were attached before this.
        var div = document.createElement('div');
        div.innerHTML = html || '<div></div>';

        var result = [];
        each(div.children, function(element) {
            result.push(element);
        });

        var that = this;
        that.elements = result;

        if (isAuto != true) {
            // that.binders = {};
            attachBinders(that.options, that.binders, that);
        }

        return result;
    }

    ViewPrototype.destroy = function() {
        var els = this.elements;
        each(els, function(el) {
            el.remove();
        })
    }

    ViewPrototype.clone = function(settings) {
        var that = this,
            options = {};

        options.name = that.name;
        options.attributes = that.attributes;
        options.watches = that.watches;
        options.binders = that.binders;

        if (settings.html || settings.elements || settings.elementsSelector) {
            options.elements = makeElements(settings);
        } else {
            options.elements = map(that.elements, function(el) {
                return el.cloneNode(true);
            });
        }

        return new lalu.view(options);
    }

    var globalBinders = {};

    View.addBinder = ViewPrototype.addBinder = function(binder, callback, options) {

        var modes = (options && isString(options.modes) && options.modes) || 'a';
        modes = modes.toLowerCase().replace(/[^a|^e|^c]/g, '').split();
        modes = uniq(modes);
        var hasAttributeMode;
        var selectors = map(modes, function(mode) {
            // attribute selector
            if (mode == 'a') {
                hasAttributeMode = true;
                return '[' + binder + ']';
            }
            // element selector
            else if (mode == 'e') {
                return binder;
            }
            // class selector
            else if (mode == 'c') {
                return '.' + binder;
            }
        });

        var binderId = uniqueId('binder');
        var binders = (this && this.binders) || globalBinders;
        binders[binderId] = {
            binder: binder,
            modes: modes,
            hasAttributeMode: hasAttributeMode,
            selector: selectors.join(','),
            callback: callback,
            options: options
        };

        var groupName = (options && isString(options.groupName) && options.groupName) ||
            'activities';
        var group = binders[groupName] || (binders[groupName] = []);
        group.push(binderId);

        return binderId;
    };

    View.removeBinder = ViewPrototype.removeBinder = function(binderId) {
        var binders = (this && this.binders) || globalBinders;
        delete binder[binderId];
    };

    var attachBinders = function(options, binders, that) {
        var includeBinderGroups = options.includeBinderGroups;
        var includeBinders = options.includeBinders;

        var binders = [];
        if ((!includeBinders || includeBinders.length == 0) &&
            (!includeBinderGroups || includeBinderGroups.length == 0)) {
            binders = globalBinders;
        } else {
            if (includeBinderGroups) {
                each(includeBinderGroups, function(groupName) {
                    each(binders, function(binder, id) {
                        if (binder.options.groupName == groupName) {
                            binders[id] = binder;
                        }
                    });
                });
            }
            if (includeBinders) {
                each(includeBinders, function(binderName) {
                    each(binders, function(binder, id) {
                        if (binder.binder == binderName) {
                            binders[id] = binder;
                        }
                    });
                });
            }

        }
        each(binders, attachBinder(options, binders, that));
    };

    var attachBinder = function(options, binders, that) {
        return function(binderObject, binderId) {
            each(that.elements, function(el) {
                var els = el.querySelectorAll(binderObject.selector);
                each(els, function(el) {
                    callBinder(el, binderObject, that);
                });

                var isQualified;
                each(binderObject.modes, function(mode) {
                    if ((mode == 'a' && el.hasAttribute(binderObject.binder)) ||
                        (mode == 'e' && el.tagName == binderObject.binder)) {
                        isQualified = true;
                        return false;
                    }
                });
                if (isQualified) {
                    callBinder(el, binderObject, that);
                }
            });
        };
    };

    var callBinder = function(el, binderObject, that) {

        var property;
        if (binderObject.hasAttributeMode) {
            property = el.getAttribute(binderObject.binder);
        }
        binderObject.callback.call(that, el, property);
    };

    return (lalu.view = lalu.extend(View, lalu.model));
}));
