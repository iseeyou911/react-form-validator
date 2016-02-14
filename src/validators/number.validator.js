'use strict';

/**
 * Created by Timofey Novitskiy on 14.02.2016.
 */

var _ = require('lodash');

function numberValidator (node) {
    var isNumber = node.getAttribute('data-number') === 'true';

    if (!isNumber) {
        return false;
    }

    return function numberValidator(value) {
        if (_.isEmpty(value)) {
            return {};
        }

        return {
            number: isNaN(+value) || !_.isNumber(+value)
        };
    }
}

module.exports = numberValidator;