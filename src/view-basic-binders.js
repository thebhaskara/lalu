(function(root, factory) {
    if (typeof define === "function" && define.amd) {
        define(['lodash', 'lalu', 'view'], factory);
    } else if (typeof module === "object" && module.exports) {
        var lodash = require('lodash');
        var lalu = require('./lalu');
        var view = require('./view');
        module.exports = factory(lodash, lalu, view);
    } else {
        factory(_, root.lalu, root.lalu.view);
    }
}(this, function(lodash, lalu) {

    var View = lalu.view;

    var each = lodash.each,
        isNil = lodash.isNil,
        isArray = lodash.isArray,
        isString = lodash.isString,
        isObject = lodash.isObject,
        throttle = lodash.throttle;

    View.addBinder('bind-text', function(el, property) {
        this.watch(property, function(text) {
            el.innerText = text;
        });
    }, {
        modes: 'a',
        groupName: 'basic'
    });

    View.addBinder('bind-html', function(el, property) {
        var personalView;
        var that = this;
        that.watch(property, function(text) {
            if (personalView) personalView.destroy();
            personalView = that.clone({
                html: text
            });
            el.innerHTML = '';
            each(personalView.elements, function(ele) {
                el.appendChild(ele);
            });
        });
    }, {
        modes: 'a',
        groupName: 'basic'
    });

    var getValue = function(el, prop) {
        return el[prop];
    };
    var setValue = function(el, prop, val) {
        el[prop] = val;
    }
    View.addBinder('bind-value', function(el, property) {
        var that = this,
            isHandlerCalled = false;
        var handler = function(event) {
            var key = event.keyCode;
            if (key != 16 && key != 17 && key != 18) {
                isHandlerCalled = true;
                that.set(property, getValue(el, valueProperty, event.target));
            }
        }

        var valueProperty = 'value';
        if (el.tagName == "INPUT") {
            var type = el.getAttribute('type').toLowerCase();
            if (type == 'checkbox') {
                valueProperty = "checked";
            }
        } else if (el.tagName == "SELECT") {
            valueProperty = 'values';
        } else if (el.tagName == "DIV") {
            valueProperty = 'innerText';
        }

        each(['change', 'keyup'], function(eventName) {
            View.attachEvent(eventName, el, throttle(handler, 100));
        });

        that.watch(property, function(value) {
            // fix for firefox
            if (isHandlerCalled) {
                isHandlerCalled = false;
            } else {
                if (!isNil(value)) {
                    setValue(el, valueProperty, value);
                }
            }
        });

    }, {
        modes: 'a',
        groupName: 'basic'
    });

    View.addBinder('bind-element', function(el, property) {
        this.set(property, el);
    }, {
        modes: 'a',
        groupName: 'basic'
    });

    var empty = View.empty = function(el) {
        while (el.firstChild) {
            el.removeChild(el.firstChild);
        }
    };

    View.addBinder('bind-component', function(el, property) {
        this.watch(property, function(component) {
            empty(el);
            if (component && component.elements) {
                each(component.elements, function(element) {
                    el.appendChild(element);
                });
            }
        });
    }, {
        modes: 'a',
        groupName: 'basic'
    });

    View.addBinder('bind-components', function(el, property) {
        var _map = {};
        empty(el);
        this.watch(property, function(components) {
            if (isNil(components) || !isArray(components)) {
                components = [];
                // return;
            }
            var map = {};
            each(components, function(component) {
                var id = component.id;
                delete _map[id];
                map[id] = component;
                each(component.elements, function(element) {
                    el.appendChild(element);
                });
            });
            each(_map, function(component) {
                each(component.elements, function(element) {
                    el.removeChild(element);
                });
            });
            _map = map;
        });
    }, {
        modes: 'a',
        groupName: 'basic'
    });

    var addClass;
    if (document.body.classList) {
        addClass = View.addClass = function(el, className) {
            el.classList.add(className);
        }
    } else {
        addClass = View.addClass = function(el, className) {
            el.className += ' ' + className;
        }
    }

    var removeClass;
    if (document.body.classList) {
        removeClass = View.removeClass = function(el, className) {
            el.classList.remove(className);
        }
    } else {
        removeClass = View.removeClass = function(el, className) {
            el.className = el.className.replace(new RegExp('(^|\\b)' +
                className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
        }
    }

    View.addBinder('bind-class', function(el, property) {
        var classesMap = {};
        this.watch(property, function(value) {
            each(classesMap, function(v, key) {
                classesMap[key] = false;
            })
            if(isNil(value)) value = [];
            if (isArray(value)) {
                each(value, function(item) {
                    classesMap[item] = true;
                })
            } else if (isString(value)) {
                classesMap[value] = true;
            } else if (isObject(value)) {
                each(value, function(v, key) {
                    classesMap[key] = v;
                });
            }
            each(classesMap, function(isTrue, key) {
                if (isTrue === true) {
                    addClass(el, key);
                } else {
                    removeClass(el, key);
                }
            })
        });
    }, {
        modes: 'a',
        groupName: 'basic'
    });

    return lalu.view;
}));
