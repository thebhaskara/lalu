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

    View.addBinder('bind-view-mode', function(el, property) {
        var viewModeElements = {};

        // ":scope >[view-mode]" makes sure only immediate children are taken.
        // https://stackoverflow.com/questions/6481612/queryselector-search-immediate-children
        each(el.querySelectorAll(":scope >[view-mode]"), function(element){
            var mode = element.getAttribute('view-mode');
            var vmes = viewModeElements[mode];
            if(!vmes){
                vmes = viewModeElements[mode] = [];
            }
            vmes.push(element);
        })

        var setViewMode = function(mode) {
            each(viewModeElements, function(elements, key){
                if(key == mode){
                    each(elements, function(element){
                        var style = element.style;
                        delete style.display;
                        element.style = style;
                    });
                } else {
                    each(elements, function(element){
                        element.style.display = "none";
                    });
                }
            })
        }

        this.watch(property, setViewMode);
        
        var defaultViewMode = el.getAttribute('default-view-mode');
        if(defaultViewMode){
            setViewMode(defaultViewMode);
        }
    }, {
        modes: 'a',
        groupName: 'adv'
    });

    return lalu.view;
}));