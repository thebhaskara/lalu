(function(root, factory) {
    if (typeof define === "function" && define.amd) {
        define(['lodash', 'lalu', 'model'], factory);
    } else if (typeof module === "object" && module.exports) {
        var lodash = require('lodash');
        var lalu = require('./lalu');
        var model = require('./model');
        module.exports = factory(lodash, lalu, model);
    } else {
        factory(_, root.lalu, root.lalu.model);
    }
}(this, function(lodash, lalu) {

    var View = lalu.view;

    var attachEvent;
    if (document.body.addEventListener) { // standard DOM
        attachEvent = function(event, element, handler) {
            element.addEventListener(event, handler, false)
        }
    } else if (document.body.attachEvent) { // IE
        attachEvent = function(event, element, handler) {
            element.attachEvent('on' + event, handler);
        }
    }
    View.attachEvent = attachEvent;

    var detachEvent;
    if (document.body.removeEventListener) { // standard DOM
        detachEvent = function(event, element, handler) {
            element.removeEventListener(event, handler, false)
        }
    } else if (document.body.detachEvent) { // IE
        detachEvent = function(event, element, handler) {
            element.attachEvent('on' + event, handler);
        }
    }
    View.detachEvent = detachEvent;

    lodash.each([
        // keyboard events
        "keydown", "keypress", "keyup",
        // mouse events
        "click", "dblclick", "mousedown", "mouseenter",
        "mouseleave", "mousemove", "mouseout",
        "mouseover", "mouseup", "mousewheel",
        // input events
        "focus", "blur", "change", "submit", "paste",
        // touch events
        "touchstart", "touchend", "touchmove", "touchcancel",
    ], function(event) {
        View.addBinder('bind-' + event, function(el, property) {
            var that = this;
            var handler = function(e) {
                that.set(property, e);
                that.set(property, undefined);
            };
            attachEvent(event, el, handler);
            that.addDestroyCallback(function() {
                detachEvent(event, el, handler);
            })
        }, {
            modes: 'a',
            groupName: 'events'
        });
    });

    return lalu.view;
}));
