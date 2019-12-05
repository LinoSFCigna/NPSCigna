import { createElement } from 'lwc';
import FieldPicker from '../fieldPicker';
import BaseResourcePicker from 'builder_platform_interaction/baseResourcePicker';
import { filterFieldsForChosenElement } from 'builder_platform_interaction/expressionUtils';
import { isLookupTraversalSupported } from 'builder_platform_interaction/processTypeLib';
import { Store } from 'builder_platform_interaction/storeLib';
import { flowWithAllElementsUIModel } from 'mock/storeData';

jest.mock('builder_platform_interaction/expressionUtils', () => {
    return {
        filterFieldsForChosenElement: jest.fn()
    };
});

jest.mock('builder_platform_interaction/storeLib', () => {
    function createSelector() {
        const actual = require.requireActual(
            'builder_platform_interaction/storeLib'
        );
        return actual.createSelector;
    }
    const storeMockLib = require('builder_platform_interaction_mocks/storeLib');
    storeMockLib.createSelector = createSelector;
    return storeMockLib;
});

jest.mock('builder_platform_interaction/processTypeLib');

const setupComponentUnderTest = props => {
    const element = createElement('builder_platform_interaction-field-picker', {
        is: FieldPicker
    });
    Object.assign(element, props);
    document.body.appendChild(element);
    return element;
};

describe('field-picker', () => {
    beforeAll(() => {
        Store.setMockState(flowWithAllElementsUIModel);
    });
    afterAll(() => {
        Store.resetStore();
    });
    it('defaults requiredness to false', () => {
        const fieldPicker = setupComponentUnderTest();
        return Promise.resolve().then(() => {
            const baseResourcePicker = fieldPicker.shadowRoot.querySelector(
                BaseResourcePicker.SELECTOR
            );
            expect(baseResourcePicker.comboboxConfig.required).toBe(false);
        });
    });
    it('sets requiredness to true', () => {
        const fieldPicker = setupComponentUnderTest({
            required: true
        });
        return Promise.resolve().then(() => {
            const baseResourcePicker = fieldPicker.shadowRoot.querySelector(
                BaseResourcePicker.SELECTOR
            );
            expect(baseResourcePicker.comboboxConfig.required).toBe(true);
        });
    });
    it('sets label', () => {
        const label = 'label';
        const fieldPicker = setupComponentUnderTest({
            label
        });
        return Promise.resolve().then(() => {
            const baseResourcePicker = fieldPicker.shadowRoot.querySelector(
                BaseResourcePicker.SELECTOR
            );
            expect(baseResourcePicker.comboboxConfig.label).toBe(label);
        });
    });
    it('sets placeholder', () => {
        const placeholder = 'placeholder';
        const fieldPicker = setupComponentUnderTest({
            placeholder
        });
        return Promise.resolve().then(() => {
            const baseResourcePicker = fieldPicker.shadowRoot.querySelector(
                BaseResourcePicker.SELECTOR
            );
            expect(baseResourcePicker.comboboxConfig.placeholder).toBe(
                placeholder
            );
        });
    });
    it('sets error message', () => {
        const errorMessage = 'bah humbug';
        const fieldPicker = setupComponentUnderTest({
            errorMessage
        });
        return Promise.resolve().then(() => {
            const baseResourcePicker = fieldPicker.shadowRoot.querySelector(
                BaseResourcePicker.SELECTOR
            );
            expect(baseResourcePicker.errorMessage).toBe(errorMessage);
        });
    });
    it('populates menuData with passed in fields', () => {
        const fields = ['field'];
        isLookupTraversalSupported.mockImplementation(() => true);
        setupComponentUnderTest({
            fields
        });
        return Promise.resolve().then(() => {
            expect(filterFieldsForChosenElement).toHaveBeenCalledWith(
                null,
                fields,
                {
                    showAsFieldReference: false,
                    showSubText: true,
                    allowSObjectFieldsTraversal: true
                }
            );
        });
    });
    it('populates menuData with passed in fields no traversal support', () => {
        const fields = ['field'];
        isLookupTraversalSupported.mockImplementation(() => false);
        setupComponentUnderTest({
            fields
        });
        return Promise.resolve().then(() => {
            expect(filterFieldsForChosenElement).toHaveBeenCalledWith(
                null,
                fields,
                {
                    showAsFieldReference: false,
                    showSubText: true,
                    allowSObjectFieldsTraversal: false
                }
            );
        });
    });
    it('does not attempt to process menu data if no fields are passed', () => {
        setupComponentUnderTest();
        return Promise.resolve().then(() => {
            expect(filterFieldsForChosenElement).not.toHaveBeenCalled();
        });
    });
});