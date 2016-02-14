'use strict';

/**
 * Created by Timofey Novitskiy on 14.02.2016.
 */

var _ = require('lodash');

function isJsonValidator(node) {
    var isJson = node.getAttribute('data-json') === 'true';

    if (!isJson) {
        return false;
    }

    return function isJsonValidator(value) {
        var isJson = false;

        if (_.isEmpty(value)) {
            return {};
        }

        try {
            isJson = JSON.parse(value);
        } catch (e) {
            isJson = false;
        }

        return {
            isJson: !isJson
        }
    };
}

module.exports = isJsonValidator;