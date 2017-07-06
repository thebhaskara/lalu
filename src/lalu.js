(function(root, factory) {
    if (typeof define === "function" && define.amd) {
        define(['lodash'], factory);
    } else if (typeof module === "object" && module.exports) {
        var lodash = require('lodash');
        module.exports = factory(lodash);
    } else {
        root.lalu = factory(_);
    }
}(this, function(lodash) {
	return {};
}));