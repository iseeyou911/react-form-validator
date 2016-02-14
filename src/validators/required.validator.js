'use strict';

/**
 * Created by Timofey Novitskiy on 13.02.2016.
 */

var _ = require('lodash');

function requiredValidator(node) {
    var isRequired = node.getAttribute('data-required'),
        isCondition = !_.isEmpty(isRequired) && isRequired !== 'true',
        self = this;

    if (isRequired !== 'true' && !isCondition) {
        return false;
    }

    return function RequiredValidator(value) {
        var refValue, _isRequired = true;

        if (isCondition) {
            refValue = _.get(self.state, isRequired);
            _isRequired = refValue !== false && !_.isEmpty(refValue);
        }

        return {
            required: _isRequired && _.isEmpty(value)
        };
    }
}

module.exports = requiredValidator;