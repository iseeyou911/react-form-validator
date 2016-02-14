'use strict';

/**
 * Created by Timofey Novitskiy on 14.02.2016.
 */

var _ = require('lodash');

function sameAsValidator(node) {
    var sameAs = node.getAttribute('data-same-as'),
        self = this;

    if (!_.isString(sameAs)) {
        return false;
    }

    return function sameAsValidator(value) {
        var refValue = _.get(self.state, sameAs),
            _sameAs = !_.isEmpty(refValue);

        return {
            sameAs: _sameAs && value != refValue
        }
    }
}

module.exports = sameAsValidator;