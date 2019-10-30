import {
    writableElementsSelector,
    readableElementsSelector,
    collectionElementsSelector,
    byTypeWritableElementsSelector,
    sObjectOrSObjectCollectionByEntitySelector,
    choiceSelector
} from 'builder_platform_interaction/selectors';
import { ELEMENT_TYPE } from 'builder_platform_interaction/flowMetadata';
import { getScreenElement } from './resourceUtils';

/**
 * @typedef FilterInformation
 * @property {Function} selector    the selector that can be used to get items for this filter from the store
 * @property {boolean} isWritable  whether or not everything allowed by this filter must be writable
 */

/**
 * @typedef ElementFilterConfig
 * @property {boolean} shouldBeWritable    if this is set, only writable elements will be returned
 * @property {string}  elementType         the element type this expression builder lives in
 * @property {boolean} isCollection        true if using selector to retrieve collection variables
 * @property {String} dataType             data type for menu data items
 * @property {String} entityName           optional: name of the sobject, used to retrieve a list of sobject/sobject collection variables. If it's empty or null, retrieve all the sobject/sobject collection variables.
 * @property {Boolean} sObjectSelector     optional: true if using selector to retrieve sobject/sobject collection variables
 */

// TODO: all of this regarding filtering & selectors will be revisited with W-5462144

/**
 * @param {Boolean} shouldBeWritable    if true, only writable elements will be returned
 * @returns {FilterInformation}
 */
function writableOrReadableElement(shouldBeWritable) {
    return {
        selector: shouldBeWritable
            ? writableElementsSelector
            : readableElementsSelector,
        isWritable: shouldBeWritable
    };
}

/**
 * @param {Boolean} shouldBeWritable    if true, only writable elements will be returned
 * @param {Boolean} sObjectSelector     optional: true if using selector to retrieve sobject/sobject collection variables
 * @param {Object} retrieveOptions      Object containing the parameter of the sObjectOrSObjectCollectionByEntitySelector
 * @returns {Function}
 */
function buildCludSelector(shouldBeWritable, sObjectSelector) {
    return function (retrieveOptions) {
        const selector = sObjectSelector
            ? sObjectOrSObjectCollectionByEntitySelector(retrieveOptions)
            : shouldBeWritable
            ? writableElementsSelector
            : readableElementsSelector;
        return {
            selector,
            isWritable: !sObjectSelector && shouldBeWritable
        };
    };
}

/**
 * @param {Boolean} shouldBeWritable    if true, only writable elements will be returned
 * @param {Object} elementType          the element type this expression builder lives in
 * @param {Boolean} isCollection        true if using selector to retrieve collection variables
 * @param {String} dataType             data type for menu data items
 * @param {String} entityName           optional: name of the sobject, used to retrieve a list of sobject/sobject collection variables. If it's empty or null, retrieve all the sobject/sobject collection variables.
 * @param {Boolean} sObjectSelector     optional: true if using selector to retrieve sobject/sobject collection variables
 * @returns {FilterInformation}
 */
function sObjectOrByTypeElements(
    shouldBeWritable,
    elementType,
    isCollection,
    dataType,
    entityName,
    sObjectSelector
) {
    return {
        selector: isCollection
            ? collectionElementsSelector
            : sObjectSelector
            ? sObjectOrSObjectCollectionByEntitySelector({ entityName })
            : byTypeWritableElementsSelector(dataType)
    };
}

/**
 * @param {Boolean} shouldBeWritable    if true, only writable elements will be returned
 * @param {Boolean} choices             optional: should this menu data only contain choices
 * @param {String} dataType             data type for menu data items
 * @returns {FilterInformation}
 */
function screenSelectors(shouldBeWritable, choices, dataType) {
    if (shouldBeWritable) {
        return {
            selector: writableElementsSelector,
            isWritable: shouldBeWritable
        };
    }

    return {
        selector: choices ? choiceSelector(dataType) : readableElementsSelector
    };
}

const filterInformationProviderMap = {
    [ELEMENT_TYPE.EXTERNAL_SERVICE]: ({ shouldBeWritable }) =>
        writableOrReadableElement(shouldBeWritable),
    [ELEMENT_TYPE.ACTION_CALL]: ({ shouldBeWritable }) =>
        writableOrReadableElement(shouldBeWritable),
    [ELEMENT_TYPE.APEX_CALL]: ({ shouldBeWritable }) =>
        writableOrReadableElement(shouldBeWritable),
    [ELEMENT_TYPE.APEX_PLUGIN_CALL]: ({ shouldBeWritable }) =>
        writableOrReadableElement(shouldBeWritable),
    [ELEMENT_TYPE.ASSIGNMENT]: ({ shouldBeWritable }) =>
        writableOrReadableElement(shouldBeWritable),
    [ELEMENT_TYPE.EMAIL_ALERT]: ({ shouldBeWritable }) =>
        writableOrReadableElement(shouldBeWritable),
    [ELEMENT_TYPE.SUBFLOW]: ({ shouldBeWritable }) =>
        writableOrReadableElement(shouldBeWritable),
    [ELEMENT_TYPE.VARIABLE]: ({ shouldBeWritable }) =>
        writableOrReadableElement(shouldBeWritable),
    [ELEMENT_TYPE.CHOICE]: ({ shouldBeWritable }) =>
        writableOrReadableElement(shouldBeWritable),
    [ELEMENT_TYPE.RECORD_CHOICE_SET]: ({ shouldBeWritable }) =>
        writableOrReadableElement(shouldBeWritable),
    [ELEMENT_TYPE.DECISION]: () => writableOrReadableElement(),
    [ELEMENT_TYPE.WAIT]: ({ shouldBeWritable }) =>
        writableOrReadableElement(shouldBeWritable),
    [ELEMENT_TYPE.SCREEN]: ({ shouldBeWritable, dataType, choices }) =>
        screenSelectors(shouldBeWritable, choices, dataType),
    [ELEMENT_TYPE.RECORD_CREATE]: ({
        shouldBeWritable,
        isCollection,
        entityName,
        sObjectSelector
    }) =>
        buildCludSelector(shouldBeWritable, sObjectSelector)({
            isCollection,
            entityName,
            createable: true
        }),
    [ELEMENT_TYPE.RECORD_UPDATE]: ({ shouldBeWritable, sObjectSelector }) =>
        buildCludSelector(shouldBeWritable, sObjectSelector)({
            allSObjectsAndSObjectCollections: true,
            updateable: true
        }),
    [ELEMENT_TYPE.RECORD_DELETE]: ({ shouldBeWritable, sObjectSelector }) =>
        buildCludSelector(shouldBeWritable, sObjectSelector)({
            allSObjectsAndSObjectCollections: true,
            deleteable: true
        }),
    [ELEMENT_TYPE.RECORD_LOOKUP]: ({
        shouldBeWritable,
        isCollection,
        entityName,
        sObjectSelector
    }) =>
        buildCludSelector(shouldBeWritable, sObjectSelector)({
            isCollection,
            entityName,
            queryable: true
        }),
    [ELEMENT_TYPE.LOOP]: ({
        shouldBeWritable,
        elementType,
        isCollection,
        dataType,
        entityName,
        sObjectSelector
    }) =>
        sObjectOrByTypeElements(
            shouldBeWritable,
            elementType,
            isCollection,
            dataType,
            entityName,
            sObjectSelector
        )
};

function getFilterInformation(config = {}) {
    const { elementType } = config;
    return filterInformationProviderMap[elementType]
        ? filterInformationProviderMap[elementType](config)
        : {};
}

/*
 * Add uncommitted elements to the list of elements retrieved from store
 * */
function addUncommittedElementsFromLocalStorage(elements) {
    const screen = getScreenElement();
    if (screen && screen.fields) {
        elements = elements.concat(
            screen.fields.filter(
                field => field.isNewField && field.name.value !== ''
            )
        );
    }
    return elements;
}

/**
 * This method returns the selector that should be used to find elements for the menuData
 * @param {Object} storeInstance reference to the storeInstance
 * @param {ElementFilterConfig} config contains necessary context to return the filterInformation
 * @returns {array} retrieves elements from store
 */
export function getStoreElements(storeInstance, config) {
    let elements = [];

    const { selector } = getFilterInformation(config);
    if (selector) {
        elements = selector(storeInstance);
    }
    if (config.choices) {
        return elements;
    }
    return addUncommittedElementsFromLocalStorage(elements);
}