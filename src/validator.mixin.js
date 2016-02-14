'use strict';

/**
 * Created by Timofey Novitskiy on 11.01.2016.
 */
var React = require('react');
var ReactDOM = require('react-dom');
var _ = require('lodash');
var classnames = require('classnames');
var isJsonValidator = require('./validators/is-json.validator');
var lengthValidator = require('./validators/length.validator');
var numberValidator = require('./validators/number.validator');
var rangeValidator = require('./validators/range.validator');
var regexpValidator = require('./validators/regexp.validator');
var requiredValidator = require('./validators/required.validator');
var sameAsValidator = require('./validators/same-as.validator');

function Validator(validatorPrefix) {
    this.fields = [];
    this.validatorState = {};
    this.validatorPrefix = validatorPrefix || '$';
}

Validator.validators = [isJsonValidator, lengthValidator, numberValidator, rangeValidator, regexpValidator, requiredValidator, sameAsValidator];

/**
 *
 * get validator name by field name
 *
 * @param {String} fieldName
 * @returns {*}
 */
Validator.prototype.getValidatorName = function (fieldName) {
    return `${this.validatorPrefix}${fieldName}`;
};

/**
 *
 * Attach listeners to dom node
 *
 * @param {DomNode} node
 * @param {Strgin} validatorName
 * @param {Function} $validate
 * @returns {Function}
 */
Validator.prototype.addEventListeners = function (node, validatorName, $validate, component) {
    return () => {
        var type = node.getAttribute('type'),
            onChangeHandler = (event) => {
                var prevState = component.state[validatorName];
                component.setState($validate(prevState.$pristine));
            },
            onBlurHandler = (event) => {
                var prevState = component.state[validatorName],
                    pristine = prevState.$pristine && _.isEmpty(node.value);

                if (!pristine) {
                    component.setState($validate(pristine));
                }
            };

        if (type == 'text' ||
            type == 'number' ||
            type == 'password' ||
            type == 'email') {
            node.addEventListener('keyup', onChangeHandler);
        }

        node.addEventListener('change', onChangeHandler);

        node.addEventListener('blur', onBlurHandler);

        return function unsubscribe() {
            node.removeEventListener('keyup', onChangeHandler);
            node.removeEventListener('change', onChangeHandler);
            node.removeEventListener('blur', onBlurHandler);
        };
    }
};

/**
 * initialization of validator state
 *
 * @param component
 */
Validator.prototype.init = function (component) {
    component.setState(_.mapValues(this.validatorState, (value)=> {
        value.$unsubscribe = value.$subscribe();
        value.$inited = true;
        return {
            $pristine: value.$pristine,
            $dirty: value.$dirty,
            $error: _.assign({}, value.$error)
        };
    }));
};

/**
 * Updating component state,
 * remove old validators, add event listeners to new ones
 *
 * @param component
 */
Validator.prototype.update = function (component) {
    var newState = _.assign({}, component.state),
        needUpdate = false,
        omit = [];

    _.forEach(this.validatorState, (value, validatorName)=> {
        if (value.$removed) {
            value.$unsubscribe();
            delete newState[validatorName];
            omit.push(validatorName);
            needUpdate = true;
        } else if (!value.$inited) {
            value.$unsubscribe = value.$subscribe();
            value.$inited = true;
            newState[validatorName] = {
                $pristine: value.$pristine,
                $dirty: value.$dirty,
                $error: _.assign({}, value.$error)
            };
            needUpdate = true;
        }
    });

    this.validatorState = _.omit(this.validatorState, omit);
    needUpdate && component.replaceState(newState);
};

/**
 * Updating component state,
 * remove old validators, add event listeners to new ones
 *
 * @param component
 */
Validator.prototype.clear = function (component) {
    var newState = _.assign({}, component.state),
        needUpdate = false,
        omit = [];

    _.forEach(this.validatorState, (value)=> {
        value.$unsubscribe();
    });

    this.validatorState = [];
};
/**
 *
 * Create new validator for field
 *
 * @param name field name !WARNING SHOULD TO BE UNIQUE
 * @returns {Function}
 */
Validator.prototype.create = function create(name, component) {
    var validatorName = this.getValidatorName(name);

    return (node) => {
        var validator = this.validatorState[validatorName];
        if (node) {
            node = ReactDOM.findDOMNode(node);
        }


        _.remove(this.fields, (field)=>field === name);
        node && this.fields.push(name);

        if (!node) {
            if (validator) {
                validator.$removed = true;
            }
            return;
        } else if (validator) {
            validator.$removed = false;
            return;
        }

        var $pristine = _.isEmpty(node.value),
            $validate = this.validateField(node, name, component),
            defaultProps = {
                $fieldName: name,
                $pristine: $pristine,
                $dirty: !$pristine,
                $error: {},
                $validate: $validate,
                $unsubscribe: function () {
                },
                $subscribe: this.addEventListeners(node, validatorName, $validate, component)
            };

        this.validatorState[validatorName] = defaultProps;
    }
};

/**
 *
 * Validate single field
 *
 * @param {JQueryDomNodeWrapper} node
 * @param {String} name field name
 * @returns {Function}
 */
Validator.prototype.validateField = function validateField(node, name, component) {
    var validators = _(Validator.validators)
        .map((validator)=>validator.bind(component)(node))
        .filter((validator)=>validator)
        .value();

    /**
     *
     * Validate single field
     *
     * @param {Boolean} pristine is field pristine
     * @returns {{$pristine, $dirty, $error}}
     */
    return (pristine) => {
        var validatorName = this.getValidatorName(name),
            value = node.value,
            props = {
                $error: {},
                $pristine: pristine,
                $dirty: !pristine
            };

        validators.forEach((_validator) => {
            _.assign(props.$error, _validator(value));
        });

        _.assign(this.validatorState[validatorName], props);
        return {[validatorName]: props};
    };
};

/**
 * Get field validator by field name
 *
 * @param {String} name
 * @returns {*}
 */
Validator.prototype.getValidator = function getValidator(name) {
    return this.validatorState[this.getValidatorName(name)];
};

/**
 *
 * Validate all fields
 *
 * @param {Boolean} force if true then pristine fields will be validated too
 * @returns {{$pristine, $dirty, $error}} New validator state
 */
Validator.prototype.validateAllFields = function validateAllFields(force) {
    var newState = {};

    this.fields
        .forEach((name)=> {
            var result, state = this.getValidator(name);
            if (!state) {
                return;
            }

            result = state.$validate(force ? false : state.$pristine);
            _.assign(newState, result);
        }, this);

    return newState;
};

function ValidatorMixin(validatorPrefix) {
    return {
        $validator: new Validator(validatorPrefix),
        componentDidMount(){
            this.$validator.init(this);
        },

        componentWillUnmount() {
            this.$validator.clear(this);
        },

        componentDidUpdate(prevProps, prevState) {
            this.$validator.update(this);
        },

        /**
         * Use ref={this.validator(field name)}
         *
         * @param node
         */
        validator(name) {
            return this.$validator.create(name, this);
        },

        getValidatorClasses(name, staticClasses){
            var validator = this.$validator.getValidator(name);
            if (!validator) {
                return classnames('pristine');
            }
            return classnames(staticClasses || '', {
                pristine: validator.$pristine,
                dirty: validator.$dirty,
                'has-error': validator.$dirty && _.some(validator.$error, (error) => {
                    return error;
                })
            });
        },

        validateForm(force, validateChild){
            var isChildrenValid = true,
                newState = this.$validator.validateAllFields(force);

            this.setState(newState);

            if (validateChild) {
                isChildrenValid = _(this.refs)
                    .map((value)=> {
                        if (!value.validateForm) {
                            return true;
                        } else {
                            return value.validateForm(force, true);
                        }
                    })
                    .every((value)=>value);
            }

            return _.every(newState, (state)=> {
                    return !_.some(state.$error, (error) => {
                        return error;
                    });
                }) && isChildrenValid;
        },

        isValid(force)
        {
            var newState = this.$validator.validateAllFields(force);

            return _.every(newState, (state)=> {
                return !_.some(state.$error, (error) => {
                    return error;
                });
            });
        }
    };
}

module.exports = ValidatorMixin;