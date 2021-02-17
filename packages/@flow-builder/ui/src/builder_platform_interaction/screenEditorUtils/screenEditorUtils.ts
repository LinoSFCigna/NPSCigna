// @ts-nocheck
import { ELEMENT_TYPE } from 'builder_platform_interaction/flowMetadata';
export * from './screenEditorFieldTypeUtils';
export * from './screenEditorExtensionUtils';

export const CURRENCY_FORMAT = 'currency';

export const LIGHTNING_INPUT_TYPES = {
    CHECKBOX: 'checkbox',
    DATE: 'date',
    DATE_TIME: 'datetime-local',
    NUMBER: 'number',
    PASSWORD: 'password'
};

export const LIGHTNING_INPUT_VARIANTS = {
    STANDARD: 'standard',
    LABEL_HIDDEN: 'label-hidden'
};

export const SCREEN_EDITOR_GUIDS = {
    PALETTE: 'palette'
};

export const CANVAS_SCREEN_GUIDS = {
    HEADER_GUID: 'showHeader',
    FOOTER_GUID: 'showFooter'
};

export const EXTENSION_PARAM_PREFIX = {
    INPUT: '$$input$$',
    OUTPUT: '$$output$$'
};

export const SELECTED_CLASS = 'selected';
export const HOVERING_CLASS = 'hovering';
export const DRAGGING_CLASS = 'dragging';
export const CONTAINER_DIV_SELECTOR = 'div.highlight';
export const FRAME_DIV_SELECTOR = '.highlight-frame';
export const VISIBILITY_ICON = '.visibility-icon';
export const VISIBILITY_ICON_CONTAINER = '.visibility-icon-container';
export const HIGHLIGHT_DIV_HEADER = '.highlight-header';

export enum InputsOnNextNavToAssocScrnOption {
    USE_STORED_VALUES = 'UseStoredValues',
    RESET_VALUES = 'ResetValues'
}

export function isScreen(element) {
    return element && element.elementType && element.elementType === ELEMENT_TYPE.SCREEN;
}

export function getVariant(label) {
    // field labels are not required in flow, but they are required by the lightning component
    // we're using to preview them. Hide the label if the label is an empty string or equivalent.
    const displayText = typeof label === 'string' ? label : label.value;
    return displayText && displayText.trim().length > 0
        ? LIGHTNING_INPUT_VARIANTS.STANDARD
        : LIGHTNING_INPUT_VARIANTS.LABEL_HIDDEN;
}

export function booleanAttributeValue(element, property) {
    if (element && property) {
        return booleanValue(element[property], property);
    }

    return false;
}

export function booleanValue(value, name?) {
    return value && (value === 'true' || value === true || value === name);
}

function getNormalizedValue(value, propertyName = 'value') {
    const hydrated = value && value.hasOwnProperty('value');
    const val = hydrated ? value[propertyName] : value;
    // note: should differentiate boolean and number type
    return val === undefined || val === null || val === '' ? null : val;
}

/**
 * Compares two values and returns true if they are different.
 * null, undefined and empty strings are considered to be equal.
 *
 * @param {*} value1 - The first value
 * @param {*} value2 - The second value
 * @param {*} includeErrors - Should errors be considered in the equality check
 * @returns true if values are different
 */
export function compareValues(value1, value2, includeErrors = false) {
    const normValue1 = getNormalizedValue(value1, 'value');
    const normValue2 = getNormalizedValue(value2, 'value');
    const result = normValue1 !== normValue2;
    if (!result && includeErrors) {
        const err1 = getNormalizedValue(value1, 'error');
        const err2 = getNormalizedValue(value2, 'error');
        return err1 !== err2;
    }

    return result;
}

/**
 * Sets the value of the field being dragged from the palette or screen canvas
 *
 * @param {*} field - The field value
 */
export function setDragFieldValue(field) {
    this._draggedFieldValue = field;
}

/**
 * Returns the value of the field being dragged from the palette or screen canvas
 *
 * @returns The field value
 */
export function getDragFieldValue() {
    return this._draggedFieldValue;
}

/**
 * Gets a field with the given guid in the given sections
 * @param {Array<ScreenPaletteSection>} sections parent sections containing fields
 * @param {string} guid guid we're looking for
 * @returns {ScreenPaletteItem} the corresponding field if found
 * @throws if field not found
 */
export function getFieldByGuid(sections: Array<ScreenPaletteSection>, guid: string): ScreenPaletteItem {
    const field = ([] as Array<ScreenPaletteItem>)
        .concat(...sections.map(({ _children }) => _children))
        .find((field) => field.guid === guid);
    if (field) {
        return field;
    }
    throw new Error('Unable to find field type by guid');
}

export function attributesHaveChanged(oldAttributes, newAttributes) {
    if (!(oldAttributes instanceof Object) || !(newAttributes instanceof Object)) {
        return true;
    }
    // If the number of elements in the attributes set is different, attributes have changed.
    if (Object.keys(newAttributes).length !== Object.keys(oldAttributes).length) {
        return true;
    }
    // Otherwise, check each attribute individually.
    const diffKeys = Object.keys(newAttributes).filter((key) => newAttributes[key] !== oldAttributes[key]);
    return diffKeys && diffKeys.length > 0;
}
