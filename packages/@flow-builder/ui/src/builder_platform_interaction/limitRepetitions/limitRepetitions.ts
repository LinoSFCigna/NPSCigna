import { getErrorsFromHydratedElement } from 'builder_platform_interaction/dataMutationLib';
import { ConfigurationEditorChangeEvent } from 'builder_platform_interaction/events';
import { RECOMMENDATION_STRATEGY } from 'builder_platform_interaction/flowMetadata';
import {
    DEFAULT_INPUT_VALUE,
    ELEMENT_PROPS,
    LimitRepetitionsInput
} from 'builder_platform_interaction/limitRepetitionsLib';
import { deepCopy, Store } from 'builder_platform_interaction/storeLib';
import { swapDevNamesToGuids } from 'builder_platform_interaction/translatorLib';
import { api, LightningElement, track } from 'lwc';
import { LABELS } from './limitRepetitionsLabels';
import { getRules, limitRepetitionsValidation } from './limitRepetitionsValidation';

export default class LimitRepetitions extends LightningElement {
    supportedObjectType = RECOMMENDATION_STRATEGY.OBJECT_NAME;

    @track
    state = deepCopy(DEFAULT_INPUT_VALUE);

    /**
     * array of object containing name-value of a input parameter.
     * e.g:
     * [{name: 'recordId', value: '', valueDataType: ''},
     *  {name: 'inputRecommendations', value: '', valueDataType: ''},
     *  {name: 'withinDays', value: '', valueDataType: ''},
     *  {name: 'maxResponses', value: '', valueDataType: ''},
     *  {name: 'responseTypeToLimit', value: '', valueDataType: ''}]
     */
    @api inputVariables: LimitRepetitionsInput[] = [];

    /**
     * validate component input fields on done
     *
     * @returns validation errors
     */
    @api validate() {
        this.state = limitRepetitionsValidation.validateAll(this.state, getRules());
        return getErrorsFromHydratedElement(this.state);
    }

    get labels() {
        return LABELS;
    }

    connectedCallback() {
        this.prepopulateInputValues();
    }

    handlePropertyChangedEvent(event: CustomEvent) {
        event.stopPropagation();
        const { propertyName, value, error } = event.detail;
        this.updateCpe(ELEMENT_PROPS[propertyName], value, error);
    }

    handleInputResourceChange(event: CustomEvent) {
        event.stopPropagation();
        const { value, error } = event.detail; // guid

        this.updateCpe(ELEMENT_PROPS.inputRecommendations, value, error);
    }

    /**
     * Assign component state with incoming inputVariable values, if any
     * otherwise, assign each input variable with state default value
     */
    prepopulateInputValues(): void {
        this.inputVariables.forEach((input: LimitRepetitionsInput) => {
            if (input.value) {
                // update UI input fields
                if (input.name === ELEMENT_PROPS.inputRecommendations.name) {
                    const obj = {
                        isInput: true,
                        valueDataType: input.valueDataType,
                        value: input.value,
                        error: null
                    };
                    swapDevNamesToGuids(Store.getStore().getCurrentState().elements, obj);
                    this.state.inputRecommendations.value = obj.value;
                } else {
                    this.state[input.name].value = input.value;
                }
            } else {
                // set default value to each input variable, and register that the field has been set.
                this.updateCpe(ELEMENT_PROPS[input.name], DEFAULT_INPUT_VALUE[input.name].value);
            }
        });
        // making sure recordId is set
        this.updateCpe(ELEMENT_PROPS.recordId, this.state.recordId?.value || DEFAULT_INPUT_VALUE.recordId.value);
    }

    /**
     * Update component state and inputVariable changes in action metadata
     *
     * @param inputVariable input
     * @param inputVariable.name input name
     * @param inputVariable.dataType input data type
     * @param inputValue new Value of the input parameter.
     * @param error the error associated with new val, if nay.
     */
    updateCpe(inputVariable: { name: string; dataType: string }, inputValue: string | number, error = null): void {
        const { name, dataType } = inputVariable;
        this.state[name].value = inputValue;
        this.state[name].error = error;

        this.dispatchEvent(new ConfigurationEditorChangeEvent(name, inputValue, dataType));
    }

    resetWithDefaultValues(): void {
        Object.entries(ELEMENT_PROPS).forEach(([propertyName, inputVariable]) => {
            const defaultValue = DEFAULT_INPUT_VALUE[propertyName].value;
            this.updateCpe(inputVariable, defaultValue);
        });
    }
}