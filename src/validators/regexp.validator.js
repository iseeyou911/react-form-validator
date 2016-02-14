/**
 * Created by Timofey Novitskiy on 13.02.2016.
 */

var _regexpCache = {};
var _ = require('lodash');
var {EMAIL_REGEXP, PHONE_REGEXP} = require('../consts');

function regexpValidator(node) {
    var tmp,
        type = node.getAttribute('type'),
        isEmail = type === 'email',
        isPhone = type === 'tel',
        regexp = isEmail ? EMAIL_REGEXP : isPhone ? PHONE_REGEXP : node.getAttribute('data-regexp'),
        regexpProps = isEmail || isPhone ? 'i' : node.getAttribute('data-regexp-props') || '';

    if (!_.isEmpty(regexp)) {
        tmp = `${regexp}_${regexpProps}`;
        if (_regexpCache[tmp]) {
            regexp = _regexpCache[tmp];
        } else {
            regexp = _regexpCache[tmp] = RegExp(regexp, regexpProps);
        }
    } else {
        return false;
    }

    return function RegexpValidator (value) {
        if (_.isEmpty(value)) {
            return {};
        }


        return {
            regexp: !!(_.isRegExp(regexp) && !regexp.test(value || ''))
        }
    }
}

module.exports = regexpValidator;