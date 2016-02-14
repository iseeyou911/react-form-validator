'use strict';

/**
 * Created by Timofey Novitskiy on 13.02.2016.
 */

var _ = require('lodash');

function lengthValidator(node) {
    var maxLength = node.getAttribute('data-max-length'),
        minLength = node.getAttribute('data-min-length'),
        hasMaxLength, hasMinLength = false;

    if (!_.isEmpty(maxLength)){
        maxLength = +maxLength;
        hasMaxLength = !_.isNaN(maxLength) && _.isNumber(maxLength);
    }

    if (!_.isEmpty(minLength)) {
        minLength = +minLength;
        hasMinLength = !_.isNaN(minLength) && _.isNumber(minLength);
    }

    if (!hasMinLength || !hasMaxLength) {
        return false;
    }

    return function lengthValidator (value) {
        if (_.isEmpty(value)) {
            return {};
        }

        return {
            minLength: hasMinLength && value.length < minLength,
            maxLength: hasMaxLength && value.length > maxLength
        };
    }
}

module.exports = lengthValidator;