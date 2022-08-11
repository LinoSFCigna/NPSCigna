import { hydrateWithErrors, updateProperties } from 'builder_platform_interaction/dataMutationLib';
import { createEmptyTestAssertion } from 'builder_platform_interaction/elementFactory';
import {
    AddListItemEvent,
    DeleteListItemEvent,
    FlowTestClearRecordFormEvent,
    PropertyChangedEvent,
    UpdateTestAssertionEvent,
    UpdateTestRecordDataEvent
} from 'builder_platform_interaction/events';
import { RECORD_DATA_ERROR } from 'builder_platform_interaction/flowTestTriggerRecordEditForm';
import { VALIDATE_ALL } from 'builder_platform_interaction/validationRules';
import { flowTestValidation, getRules } from './flowTestValidation';

const flowTestEditorPropertyChanged = (state, event) => {
    if (event.detail.error === null) {
        event.detail.error = flowTestValidation.validateProperty(event.detail.propertyName, event.detail.value, null);
    }

    return updateProperties(state, {
        [event.detail.propertyName]: {
            error: event.detail.error,
            value: event.detail.value
        }
    });
};

const flowTestEditorAssertionAdded = (state) => {
    const emptyAssertion = createEmptyTestAssertion();
    const assertions = [...state.testAssertions, hydrateWithErrors(emptyAssertion)];
    return updateTestAssertions(state, assertions);
};

const flowTestEditorAssertionDeleted = (state, event) => {
    const listIndex = event.detail.index;
    let assertions = [...state.testAssertions];
    assertions = assertions.filter((assertion, index) => {
        return index !== listIndex;
    });
    return updateTestAssertions(state, assertions);
};

const flowTestEditorAssertionUpdated = (state, event) => {
    const listIndex = event.detail.index;
    const assertions = [...state.testAssertions];
    if (event.detail.isMessageChanged) {
        const message = event.detail.message;
        let newMessage;
        if (message !== undefined) {
            newMessage = {
                value: message,
                error: null
            };
        }
        assertions[listIndex] = { ...assertions[listIndex], message: newMessage };
    }
    if (event.detail.isExpressionChanged) {
        const newExpression = event.detail.expression;
        assertions[listIndex] = { ...assertions[listIndex], expression: newExpression };
    }
    return updateTestAssertions(state, assertions);
};

const flowTestEditorTriggerRecordUpdated = (state, event) => {
    const recordData = {
        value: event.detail.recordData,
        error: event.detail.hasError ? RECORD_DATA_ERROR : null
    };
    if (event.detail.isUpdatedRecord) {
        return updateProperties(state, { testUpdatedRecordData: recordData });
    }
    return updateProperties(state, { testInitialRecordData: recordData });
};

const flowTestEditorClearTriggerRecord = (state, event) => {
    if (event.detail.isUpdatedRecord) {
        return updateProperties(state, { testUpdatedRecordData: {} });
    }
    return updateProperties(state, { testInitialRecordData: {} });
};

const updateTestAssertions = (state, assertions) => {
    return updateProperties(state, {
        testAssertions: assertions
    });
};
/**
 * Flow Test editor reducer function runs validation rules and returns back the updated element
 *
 * @param state - flow test editor
 * @param event - object containing type and payload eg: {type:'xyz', payload: {propertyName: '', value: '' , error: ''}}
 * @returns  updated flow test editor
 */
export const flowTestEditorReducer = (state, event) => {
    switch (event.type) {
        case PropertyChangedEvent.EVENT_NAME:
            return flowTestEditorPropertyChanged(state, event);
        case AddListItemEvent.EVENT_NAME:
            return flowTestEditorAssertionAdded(state);
        case DeleteListItemEvent.EVENT_NAME:
            return flowTestEditorAssertionDeleted(state, event);
        case UpdateTestAssertionEvent.EVENT_NAME:
            return flowTestEditorAssertionUpdated(state, event);
        case UpdateTestRecordDataEvent.EVENT_NAME:
            return flowTestEditorTriggerRecordUpdated(state, event);
        case FlowTestClearRecordFormEvent.EVENT_NAME:
            return flowTestEditorClearTriggerRecord(state, event);
        case VALIDATE_ALL:
            return flowTestValidation.validateAll(state, getRules(event.mode));
        default:
            return state;
    }
};