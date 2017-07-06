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

    var segregateProperties = function(src) {

        var srcCtr = function() {},
            srcProto = {},
            srcStatic = {};
        if (lodash.isFunction(src)) {
            srcCtr = src;
            srcProto = src.prototype;
            srcStatic = src;
        } else {
            lodash.isFunction(src.init) && (srcCtr = src.init);
            srcProto = src;
        }

        return {
            constr: srcCtr,
            proto: srcProto,
            stat: srcStatic
        }
    }

    var extendProperties = function(desProps, srcProps) {
        lodash.each(srcProps, function(value, prop) {
            var desProp = desProps[prop];
            if (lodash.isFunction(value) && lodash.isFunction(desProps[prop])) {
                desProps[prop] = function() {
                    value.apply(this, arguments);
                    return desProp.apply(this, arguments);
                }
            } else {
                desProps[prop] = value;
            }
        });
    }

    var extendSpecial = function(des, src) {

        var srcStuff = segregateProperties(src);
        var desStuff = segregateProperties(des);

        var Component = function() {
            srcStuff.constr.apply(this, arguments);
            desStuff.constr.apply(this, arguments);
        }

        extendProperties(Component, desStuff.stat);
        extendProperties(Component, srcStuff.stat);

        extendProperties(Component.prototype, desStuff.proto);
        extendProperties(Component.prototype, srcStuff.proto);

        return Component;
    };

    var extend = lalu.extend = function() {

        var Component = function() {};

        for (var i = 0; i < arguments.length; i++) {
            Component = extendSpecial(Component, arguments[i]);
        }

        return Component;
    };


    return extend;
}));
