'use strict';

/**
 * Created by Timofey Novitskiy on 13.02.2016.
 */

var _ = require('lodash');

function rangeValidator(node) {
    var max = node.getAttribute('data-max'),
        min = node.getAttribute('data-min'),
        hasMax, hasMin = false;

    if (!_.isEmpty(max)){
        max = +max;
        hasMax = !_.isNaN(max) && _.isNumber(max);
    }

    if (!_.isEmpty(min)) {
        min = +min;
        hasMin = !_.isNaN(min) && _.isNumber(min);
    }

    if (!hasMin || !hasMax) {
        return false;
    }

    return function RangeValidator(value) {
        return {
            max: hasMax && value > max,
            min: hasMin && value < min
        }
    };
}

module.exports = rangeValidator;