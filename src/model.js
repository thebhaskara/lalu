(function(root, factory) {
    if (typeof define === "function" && define.amd) {
        define(['lodash', 'lalu'], factory);
    } else if (typeof module === "object" && module.exports) {
        var lodash = require('lodash');
        var lalu = require('./lalu');
        module.exports = factory(lodash, lalu);
    } else {
        factory(_, root.lalu);
    }
}(this, function(lodash, lalu) {

    var each = lodash.each,
        isNil = lodash.isNil,
        isArray = lodash.isArray,
        isString = lodash.isString,
        isObject = lodash.isObject,
        isFunction = lodash.isFunction,
        isUndefined = lodash.isUndefined,
        defaults = lodash.defaults,
        uniqueId = lodash.uniqueId,
        find = lodash.find,
        map = lodash.map,
        get = lodash.get,
        set = lodash.set;

    var Model = lalu.model = function(options) {
        // console.log('Model constructor called');
        var that = this;
        that.options = options = options || {};

        that.name = options.name || that.name || uniqueId('lalu-');
        that.id = uniqueId(that.name + '-');
        that.attributes = options.attributes || that.attributes || {};
        that.watches = options.watches || that.watches || {};
        that.destroyCallbacks = [];

        initWatches(that.initWatches, that);
        initWatches(options.initWatches, that);
    };

    var initWatches = function(watches, that) {
        if (isArray(watches)) {
            each(watches, function(set) {
                that.watch(set.path, set.callback);
            });
        } else if (isObject(watches)) {
            each(watches, function(callback, path) {
                that.watch(path, callback);
            });
        }
    }

    var ModelPrototype = Model.prototype;

    ModelPrototype.get = function(path) {
        if (isString(path)) {
            return get(this.attributes, path);
        } else {
            return this.attributes;
        }
    };

    ModelPrototype.set = function(path, value, options) {
        if (isString(path) && arguments.length > 1) {
            set(this.attributes, path, value);
        } else if (arguments.length == 1) {
            this.attributes = path;
            path = undefined;
        }
        this.trigger(path, defaults(options || {}, {
            propagateToParent: true,
            propagateToChildren: true
        }));
        return this;
    };

    ModelPrototype.trigger = function(path, options) {
        var that = this;
        var watches = [];
        var parentwatches = [];
        var childwatches = [];
        var parentPaths = [];

        var executeWatch = function(watch) {
            watch.callback.call(that, that.get(watch.path));
        }

        if (path == undefined) {

            watches = this.watches;
            each(watches, executeWatch);

        } else {

            // generating a list of possible parents.
            if (options.propagateToParent) {
                var split = path && path.split('.') || ['ya'];
                split.pop();
                var len = split.length
                for (var i = 0; i < len; i++) {
                    parentPaths.push(split.join('.'));
                    split.pop();
                }
            }

            // figuring out all the watches that need to be executed.
            each(this.watches, function(watch) {

                if (watch.path == path) {
                    watches.push(watch);
                    return true;
                } else if (options.propagateToChildren && watch.path && watch.path.indexOf(path) == 0) {
                    childwatches.push(watch);
                } else if (options.propagateToParent) {
                    if (watch.path == undefined) {
                        parentwatches.push(watch)
                    } else {
                        var hasParentPath = find(parentPaths, function(p) {
                            return p == watch.path
                        });
                        if (hasParentPath) {
                            parentwatches.push(watch);
                        }
                    }
                }
            });

            // executing all the watches, that were figured out
            each(watches, executeWatch);
            each(childwatches, executeWatch);
            each(parentwatches, executeWatch);
        }
    };

    ModelPrototype.watch = function(component, path, callback) {
        if (isFunction(component)) {
            callback = component;
            path = undefined;
            component = this;
        } else if (isString(component)) {
            callback = path;
            path = component;
            component = this;
        } else if (isFunction(path)) {
            callback = path;
            path = undefined;
        }
        var id = uniqueId('watch-');

        this.watches[id] = component.watches[id] = {
            component: component,
            path: path,
            callback: callback
        }

        return id;
    };

    ModelPrototype.unwatch = function(id) {
        var that = this,
            watches = this.watches,
            watch = watches[id];
        if (arguments.length > 0) {
            if (watch) {
                deleteModelWatch(watch, id, that);
            } else {
                var path = id;
                each(watches, function(watch, id) {
                    if (watch.path == path) {
                        deleteModelWatch(watch, id, that);
                    }
                });
            }
        } else {
            each(watches, function(watch, id) {
                deleteModelWatch(watch, id, that);
            });
        }
        return this;
    };

    var deleteModelWatch = function(watch, id, that) {
        delete watch.component.watches[id];
        if (watch.component != that) {
            delete that.watches[id];
        }
    };

    ModelPrototype.watchAll = function(params) {
        var that = this,
            watchIds = [],
            watchProps = [],
            actualCallback,
            callback = function() {
                var isFineToExecute = true;
                var res = [];
                each(watchProps, function(prop) {
                    var val = that.get(prop);
                    if (isUndefined(val)) {
                        isFineToExecute = false;
                    } else {
                        res.push(val);
                    }
                });

                isFineToExecute && actualCallback.apply(that, res);
            }, list;

        if (arguments.length > 1) list = arguments;
        else list = params;
        
        each(list, function(param, index) {
            if (isString(param)) {
                watchProps.push(param);
                watchIds.push(that.watch(param, callback));
            } else if (isFunction(param)) {
                actualCallback = param;
            }
        });

        return watchIds;
    };

    ModelPrototype.unwatchAll = function(list) {
        var that = this;
        each(list, function(id) {
            that.unwatch(id);
        });
    };

    ModelPrototype.destroy = function() {
        var that = this;
        each(that.destroyCallbacks, function(callback) {
            callback.call(that);
        });
        that.unwatch();
        delete that.watches;
        delete that.attributes;
        delete that.options;
    };

    ModelPrototype.addDestroyCallback = function(callback) {
        this.destroyCallbacks.push(callback);
    };

    // sugar functions
    ModelPrototype.getSet = function(prop, callback) {
        if (isFunction(callback)) {
            var val = callback(this.get(prop));
            this.set(val);
        }
        return this;
    };

    ModelPrototype.getWatch = function(component, path, callback) {
        if (isString(component)) {
            callback = path;
            path = component;
            component = this;
        }
        callback(component.get(path));
        return this.watch(component, path, callback);
    };

    ModelPrototype.syncronize = function(component, props) {
        var that = this;
        if (isArray(props)) {
            return map(props, function(prop) {
                return actualSyncronize(that, component, prop);
            });
        } else if (isString(props)) {
            return actualSyncronize(that, component, props);
        } else {
            return actualSyncronize(that, component);
        }
    };

    var actualSyncronize = function(that, component, prop, mode) {
        var bypass = false;
        if (prop !== undefined) {
            component.watch(prop, function(val) {
                if (bypass == true) {
                    bypass = false;
                    return;
                } else {
                    bypass = true;
                }
                that.set(prop, val);
            })
            return that.watch(prop, function(val) {
                if (bypass == true) {
                    bypass = false;
                    return;
                } else {
                    bypass = true;
                }
                component.set(prop, val);
            });
        } else {
            component.watch(function(val) {
                if (bypass == true) {
                    bypass = false;
                    return;
                } else {
                    bypass = true;
                }
                that.set(val);
            })
            return that.watch(function(val) {
                if (bypass == true) {
                    bypass = false;
                    return;
                } else {
                    bypass = true;
                }
                component.set(val);
            });
        }
    };

    return Model;
}));
