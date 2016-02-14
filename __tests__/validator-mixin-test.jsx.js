/**
 * Created by Timofey Novitskiy on 27.01.2016.
 */

jest
    .dontMock('lodash')
    .dontMock('jquery')
    .dontMock('classnames')
    .dontMock('../src/consts')
    .dontMock('../src/validator.mixin.js');

import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-addons-test-utils';

var $ = require('jquery');
var ValidatorMixin = require('../src/validator.mixin.js');

var TestForm = React.createClass({
    mixins: [ValidatorMixin()],
    getInitialState(){
        return {
            field1: ''
        }
    },

    render (){
        return <form>
            <input
                type="text"
                name="requiredField"
                defaultValue={this.state.requiredField}
                data-required={true}
                ref={this.validator('requiredField')}
            />
            <input
                type="text"
                name="numberField"
                defaultValue={this.state.numberField}
                data-number="true"
                ref={this.validator('numberField')}
            />
            <input
                type="text"
                name="minLengthField"
                defaultValue={this.state.minLengthField}
                data-min-length="4"
                ref={this.validator('minLengthField')}
            />
            <input
                type="text"
                name="maxLengthField"
                defaultValue={this.state.maxLengthField}
                data-max-length="8"
                ref={this.validator('maxLengthField')}
            />
            <input
                type="text"
                name="minMaxLengthField"
                defaultValue={this.state.minMaxLengthField}
                data-min-length="4"
                data-max-length="8"
                ref={this.validator('minMaxLengthField')}
            />
        </form>
    }
});

describe('validator', () => {
    var form = TestUtils.renderIntoDocument(
        <TestForm/>
    );
    var formNode = ReactDOM.findDOMNode(form),
        requiredField = formNode.querySelector('[name="requiredField"]'),
        numberField = formNode.querySelector('[name="numberField"]'),
        maxLengthField = formNode.querySelector('[name="maxLengthField"]'),
        minMaxLengthField = formNode.querySelector('[name="minMaxLengthField"]'),
        minLengthField = formNode.querySelector('[name="minLengthField"]');


    it('static field required', () => {

        expect(requiredField.value).toEqual('');
        dispatchEvent('change', requiredField);

        requiredField.value = 'test';
        dispatchEvent('blur', requiredField);

        requiredField.value = '';
        dispatchEvent('blur', requiredField);

        expect(form.state.$requiredField.$error.required).toEqual(true);

    });

    it('static field is number', () => {
        numberField.value = 'test';
        dispatchEvent('blur', numberField);

        expect(form.state.$numberField.$error.number).toBe(true);

        numberField.value = '4';
        dispatchKeyBordEvent('keyup', numberField);

        expect(form.state.$numberField.$error.number).toBe(false);
    });

    it('static field min length 4', () => {
        minLengthField.value = 'te';
        dispatchEvent('blur', minLengthField);

        expect(form.state.$minLengthField.$error.minLength).toBe(true);

        minLengthField.value = '4sasd';
        dispatchKeyBordEvent('keyup', minLengthField);

        expect(form.state.$minLengthField.$error.minLength).toBe(false);
    });

    it('static field max length 8', () => {
        maxLengthField.value = 'small';
        dispatchEvent('blur', maxLengthField);

        expect(form.state.$maxLengthField.$error.maxLength).toBe(false);

        maxLengthField.value = 'super long string';
        dispatchKeyBordEvent('keyup', maxLengthField);

        expect(form.state.$maxLengthField.$error.maxLength).toBe(true);
    });
});

function dispatchKeyBordEvent(type, element, event) {
    var evt = document.createEvent("KeyboardEvent");
    evt.initEvent(type, false, true);
    element.dispatchEvent(evt);
}

function dispatchEvent(type, element) {
    var evt = document.createEvent("HTMLEvents");
    evt.initEvent(type, false, true);
    element.dispatchEvent(evt);
}