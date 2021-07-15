// @ts-nocheck
import { FEROV_DATA_TYPE, FLOW_DATA_TYPE } from 'builder_platform_interaction/dataTypeLib';
// import { mutateTextWithMergeFields } from './mergeFieldsMutation';
import { getElementByGuid } from 'builder_platform_interaction/storeUtils';
import { addCurlyBraces, splitStringBySeparator, isValidNumber } from 'builder_platform_interaction/commonUtils';
import { isValidMetadataDateTime } from 'builder_platform_interaction/dateTimeUtils';
import { GLOBAL_CONSTANTS } from 'builder_platform_interaction/systemLib';

// keys are flow builder ferov data types, values are the types we find in our ferov objects
const FEROV_TYPES_TO_METADATA_KEYS = {
    [FEROV_DATA_TYPE.STRING]: 'stringValue',
    [FEROV_DATA_TYPE.NUMBER]: 'numberValue',
    [FEROV_DATA_TYPE.DATE]: 'dateValue',
    [FEROV_DATA_TYPE.DATETIME]: 'dateTimeValue',
    [FEROV_DATA_TYPE.BOOLEAN]: 'booleanValue',
    [FEROV_DATA_TYPE.REFERENCE]: 'elementReference',
    [FEROV_DATA_TYPE.SOBJECT]: 'sobjectValue',
    [FEROV_DATA_TYPE.APEX]: 'apexValue'
};

// guid suffix to add to defaultValue when ferov object value is a reference
export const GUID_SUFFIX = 'Guid';

/**
 * Returns true if ferov is type reference
 *
 * @param {string}      metaDataType ferov object meta data type
 * @returns {boolean}    true if metaDataType is reference otherwise false
 */
function isFerovReference(metaDataType) {
    return FEROV_TYPES_TO_METADATA_KEYS[FEROV_DATA_TYPE.REFERENCE] === metaDataType;
}

/**
 * Returns true if ferov is type boolean
 *
 * @param {string}      metaDataType ferov object meta data type
 * @returns {boolean}    true if metaDataType is boolean otherwise false
 */
function isFerovBoolean(metaDataType) {
    return FEROV_TYPES_TO_METADATA_KEYS[FEROV_DATA_TYPE.BOOLEAN] === metaDataType;
}

/**
 * Returns true if ferov is type string
 *
 * @param {string}      metaDataType ferov object meta data type
 * @returns {boolean}    true if metaDataType is string otherwise false
 */
function isFerovString(metaDataType) {
    return FEROV_TYPES_TO_METADATA_KEYS[FEROV_DATA_TYPE.STRING] === metaDataType;
}

/**
 * Returns true if ferov is type reference
 *
 * @param {string}      metaDataType ferov object meta data type
 * @returns {boolean}    true if metaDataType is reference otherwise false
 */
function isFerovNumber(metaDataType) {
    return FEROV_TYPES_TO_METADATA_KEYS[FEROV_DATA_TYPE.NUMBER] === metaDataType;
}

/**
 * Convert the guids in the value to return dev name and guid object
 * Eg: VARIABLE_12 -> { value: {!var1}, guid: 'VARIABLE_12' }
 * Eg: VARIABLE_12.AccountSource -> { value: {!myAccount.AccountSource}, guid: 'VARIABLE_12' }
 * Note: Does not handle merge fields, needs more spiking.
 * merge field - 'Flow Builder is going pilot in {!releasePilot} and GA in {!releaseGA}'
 *
 * @param {string}      value input
 * @returns {Object}     object with value and guid if the corresponding flow element exists
 */
function convertGuidToDevName(value) {
    if (!value) {
        throw new Error(`Input value must be a guid but instead was ${value}`);
    }

    const ferovObjectValueParts = splitStringBySeparator(value);
    const guid = value;
    const elementUi: UI.Element = getElementByGuid(ferovObjectValueParts[0]);

    if (elementUi) {
        ferovObjectValueParts[0] = elementUi.name;
        value = addCurlyBraces(ferovObjectValueParts.join('.'));
        return { value, guid };
    }

    return { value };
}

/**
 * Get the ferov object value and optionally guid for a reference metaDataType.
 * Eg: { stringValue: 'Test String' } -> { value:'Test String' }
 * Eg: { elementReference: 'VARIABLE_12' } -> { value:'{var1}', guid:'VARIABLE_12' }
 *
 * @param {Object}      ferovObject input ferov object
 * @returns {*}          returns object with ferov value and optionally guid for a reference type
 */
function getFerovObjectValue(ferovObject) {
    // find the element's ferov meta data type
    const metaDataType = getMetaDataType(ferovObject);

    // set the value of the ferov to the given property on the element
    // store the value inside the ferov object in case we need to delete (handles edge case where FEROV object prop name is same as valueProperty)
    const value = ferovObject[metaDataType];

    if (isFerovReference(metaDataType)) {
        return convertGuidToDevName(value);
    }
    return { value };
}

/**
 * Get the Ferov object meta data type.
 *
 * @param {Object}      ferovObject input
 * @returns {string}     returns the metadataType
 */
function getMetaDataType(ferovObject) {
    return Object.values(FEROV_TYPES_TO_METADATA_KEYS).find((type) => {
        return ferovObject.hasOwnProperty(type);
    });
}

/**
 * Returns true if the input value is undefined.
 * Note: This will be moved to utils lib once we have one.
 *
 * @param {Object} value input
 * @returns {boolean} true if undefined otherwise false.
 */
function isUndefined(value) {
    return value === undefined;
}

/**
 * Converts Flow datatypes to FEROV compatible datatype
 *
 * @param {string} value The string representation of the Flow datatype
 * @returns {string} The FEROF compatible datatype
 */
function getFerovDataTypeValue(value) {
    let dataType;
    switch (value && value.toLowerCase()) {
        case FLOW_DATA_TYPE.CURRENCY.value.toLowerCase():
            dataType = FLOW_DATA_TYPE.NUMBER.value;
            break;
        case FLOW_DATA_TYPE.PICKLIST.value.toLowerCase():
        case FLOW_DATA_TYPE.MULTI_PICKLIST.value.toLowerCase():
            dataType = FLOW_DATA_TYPE.STRING.value;
            break;
        default:
            dataType = value;
    }

    return dataType;
}

/**
 *
 * @param object - key/value object to be searched
 * @param key - key that we compare to
 * @returns the value of that key ignoring case sensitivity
 */
function getFerovDataTypeKeyCaseInsensitive(object, key) {
    return Object.entries(object).find((pair) => pair[0].toLowerCase() === key.toLowerCase())[1];
}

/**
 * Sanity checks on the mutate and deMutate params
 *
 * @param {string} valueProperty        The name of scalar we want to set in our element. This is the property that replaces the ferov object
 * @param {string} dataTypeProperty     The name of the data type property we want to set in our element
 */
function validateParams(valueProperty, dataTypeProperty) {
    if (!valueProperty) {
        throw new Error('value property cannot be undefined or null');
    }

    // if the data type property is not specified the deMutation will fail
    if (!dataTypeProperty) {
        throw new Error('data type property cannot be undefined or null');
    }
}

/**
 * Returns the dataType key of the field passed in
 *
 * @param {string} fieldName the key of the field
 * @returns {string} the dataType key
 */
export const getDataTypeKey = (fieldName) => {
    return fieldName + 'DataType';
};

/**
 * Creates a ferov object in the shape that the store expects
 *
 * @param {Object} ferovObject        The name of the flow metadata Ferov object inside the element (eg. 'value' which is the RHS of a condition). This object will be changed into a scalar and placed inside @param valueProperty
 * @param {string} valueProperty      The name of scalar we want to set in our element. This is the property that replaces the ferov object
 * @param {string} dataTypeProperty   The name of the data type property we want to set in our element
 * @returns {Object}                  The element with ferov object and props based on @param valueProperty & @param dataTypeProperty
 */
export const createFEROV = (ferovObject, valueProperty, dataTypeProperty) => {
    // TODO: W-5494171 Use getDataTypeKey instead of passing in dataTypeProperty
    validateParams(valueProperty, dataTypeProperty);

    const props = { [valueProperty]: '' };

    if (ferovObject) {
        const { value, guid } = getFerovObjectValue(ferovObject);

        if (!isUndefined(value)) {
            const metadataType = getMetaDataType(ferovObject);
            props[dataTypeProperty] = Object.keys(FEROV_TYPES_TO_METADATA_KEYS).find((type) => {
                return metadataType === FEROV_TYPES_TO_METADATA_KEYS[type];
            });
            if (isFerovBoolean(metadataType)) {
                if (value === true) {
                    props[valueProperty] = GLOBAL_CONSTANTS.BOOLEAN_TRUE;
                } else {
                    props[valueProperty] = GLOBAL_CONSTANTS.BOOLEAN_FALSE;
                }
            } else if (isFerovNumber(metadataType)) {
                props[valueProperty] = value.toString();
            } else if (isFerovString(metadataType) && value === '') {
                props[valueProperty] = GLOBAL_CONSTANTS.EMPTY_STRING;
            } else {
                props[valueProperty] = value;
            }
            if (guid) {
                props[valueProperty + GUID_SUFFIX] = guid;
            }
        }
    }

    return props;
};

/**
 * Creates a ferov object in the shape that the flow metadata expects
 *
 * @param {Object} element              Store element with ferov (eg. condition or variable)
 * @param {string} valueProperty        The name of the value property of the ferov
 * @param {string} dataTypeProperty     The name of the data type property of the ferov
 * @returns {Object} ferovObject        The ferov object in the shape that the flow metadata expects
 */
export const createFEROVMetadataObject = (element, valueProperty, dataTypeProperty) => {
    validateParams(valueProperty, dataTypeProperty);

    let ferovObject;
    if (element.hasOwnProperty(valueProperty)) {
        const value = element[valueProperty];
        const dataType = element[dataTypeProperty];
        const valuePropertyGuid = valueProperty + GUID_SUFFIX;

        if (dataType && value !== '' && value !== undefined && value !== null) {
            // if the ferov is invalid for it's specified data type, we'll store it as the string value of the ferov
            const stringDataTypeKey = FEROV_TYPES_TO_METADATA_KEYS[FEROV_DATA_TYPE.STRING];
            const ferovDataTypeValue = getFerovDataTypeValue(dataType);

            // determine where it will be stored in the ferov if it is valid
            let ferovDataTypeKey = getFerovDataTypeKeyCaseInsensitive(FEROV_TYPES_TO_METADATA_KEYS, ferovDataTypeValue);

            // set the value of the ferov to the given property or its guid on the element
            let ferovValue;
            if (isFerovReference(ferovDataTypeKey)) {
                ferovValue = element[valuePropertyGuid] || value;
            } else if (isFerovString(ferovDataTypeKey) && (value === GLOBAL_CONSTANTS.EMPTY_STRING || value === '')) {
                ferovValue = '';
            } else if (isFerovBoolean(ferovDataTypeKey)) {
                if (value === GLOBAL_CONSTANTS.BOOLEAN_TRUE || value === true) {
                    ferovValue = true;
                } else if (value === GLOBAL_CONSTANTS.BOOLEAN_FALSE || value === false) {
                    ferovValue = false;
                } else {
                    // if it isn't true or false it isn't a valid boolean, preserve the given value but store it as a string
                    ferovValue = value;
                    ferovDataTypeKey = stringDataTypeKey;
                }
            } else {
                // validate that the value is valid for the given data type, if not we'll store it as a stringValue in the FEROV
                switch (dataType) {
                    case FLOW_DATA_TYPE.NUMBER.value:
                    case FLOW_DATA_TYPE.CURRENCY.value:
                        if (!isValidNumber(value)) {
                            ferovDataTypeKey = stringDataTypeKey;
                        }
                        break;
                    case FLOW_DATA_TYPE.DATE.value:
                    case FLOW_DATA_TYPE.DATE_TIME.value:
                        if (!isValidMetadataDateTime(value, dataType === FLOW_DATA_TYPE.DATE_TIME.value)) {
                            ferovDataTypeKey = stringDataTypeKey;
                        }
                        break;
                    default:
                        break;
                }
                ferovValue = value;
            }

            ferovObject = Object.assign({}, { [ferovDataTypeKey]: ferovValue });
        }
    }

    return ferovObject;
};
