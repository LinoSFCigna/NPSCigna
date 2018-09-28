import { ELEMENT_TYPE } from "builder_platform_interaction/flowMetadata";
import { Store } from "builder_platform_interaction/storeLib";
import {
    swapUidsForDevNames,
    swapDevNamesToGuids
} from "builder_platform_interaction/translatorLib";
import {
    createActionCall,
    createApexPlugin,
    createAssignment,
    createChoice,
    createConstant,
    createFlowProperties,
    createFormula,
    createLoop,
    createDecisionWithOutcomes,
    createWaitWithWaitEvents,
    createVariable,
    createTextTemplate,
    createRecordCreate,
    createRecordUpdate,
    createRecordLookup,
    createRecordDelete,
    createScreen,
    createSubflow,
    FACTORY_CONFIG,
    createDecisionWithOutcomeReferencesWhenUpdatingFromPropertyEditor,
    createWaitWithWaitEventReferencesWhenUpdatingFromPropertyEditor,
    createStage,
    createStep,
    createPicklistChoiceGroup,
    createRecordChoiceGroup
} from "builder_platform_interaction/elementFactory";

/**
 * Element factory to create new objects for each element type for the property editors
 *
 * @param {Object} element        Element to be used as the base for copying information
 * @param {Object} config         Config for element creation
 * @return {Object} newElement    New element object with all relevant data
 */
/* eslint-disable-next-line complexity */
export const propertyEditorFactory = (element, config = {}) => {
    let newElement;

    switch (element.elementType) {
        case ELEMENT_TYPE.ACTION_CALL:
            newElement = createActionCall(element);
            break;
        case ELEMENT_TYPE.APEX_CALL:
            newElement = createActionCall(element, ELEMENT_TYPE.APEX_CALL);
            break;
        case ELEMENT_TYPE.APEX_PLUGIN_CALL:
            newElement = createApexPlugin(element);
            break;
        case ELEMENT_TYPE.ASSIGNMENT:
            newElement = createAssignment(element);
            break;
        case ELEMENT_TYPE.CHOICE:
            newElement = createChoice(element);
            break;
        case ELEMENT_TYPE.CONSTANT:
            newElement = createConstant(element);
            break;
        case ELEMENT_TYPE.RECORD_CHOICE_GROUP:
            newElement = createRecordChoiceGroup(element);
            break;
        case ELEMENT_TYPE.PICKLIST_CHOICE_GROUP:
            newElement = createPicklistChoiceGroup(element);
            break;
        case ELEMENT_TYPE.EMAIL_ALERT:
            newElement = createActionCall(element, ELEMENT_TYPE.EMAIL_ALERT);
            break;
        case ELEMENT_TYPE.FLOW_PROPERTIES:
            newElement = createFlowProperties(element);
            break;
        case ELEMENT_TYPE.FORMULA:
            newElement = createFormula(element);
            break;
        case ELEMENT_TYPE.LOOP:
            newElement = createLoop(element);
            break;
        case ELEMENT_TYPE.DECISION:
            if (config[FACTORY_CONFIG.SWAP_DEV_NAME_TO_GUID]) {
                newElement = createDecisionWithOutcomeReferencesWhenUpdatingFromPropertyEditor(element);
            } else {
                newElement = createDecisionWithOutcomes(element);
            }
            break;
        case ELEMENT_TYPE.WAIT:
            if (config[FACTORY_CONFIG.SWAP_DEV_NAME_TO_GUID]) {
                newElement = createWaitWithWaitEventReferencesWhenUpdatingFromPropertyEditor(element);
            } else {
                newElement = createWaitWithWaitEvents(element);
            }
            break;
        case ELEMENT_TYPE.RECORD_CREATE:
            newElement = createRecordCreate(element);
            break;
        case ELEMENT_TYPE.RECORD_UPDATE:
            newElement = createRecordUpdate(element);
            break;
        case ELEMENT_TYPE.RECORD_LOOKUP:
            newElement = createRecordLookup(element);
            break;
        case ELEMENT_TYPE.RECORD_DELETE:
            newElement = createRecordDelete(element);
            break;
        case ELEMENT_TYPE.SCREEN:
            newElement = createScreen(element);
            break;
        case ELEMENT_TYPE.SUBFLOW:
            newElement = createSubflow(element);
            break;
        case ELEMENT_TYPE.VARIABLE:
            newElement = createVariable(element);
            break;
        case ELEMENT_TYPE.TEXT_TEMPLATE:
            newElement = createTextTemplate(element);
            break;
        case ELEMENT_TYPE.STAGE:
            newElement = createStage(element);
            break;
        case ELEMENT_TYPE.STEP:
            newElement = createStep(element);
            break;
        default:
            break;
    }

    if (config[FACTORY_CONFIG.SWAP_GUID_TO_DEV_NAME]) {
        const elements = Store.getStore().getCurrentState().elements;
        swapUidsForDevNames(elements, { [newElement.guid]: newElement }, {enableGuidToDevnameSwappingForReferenceFields: false});
    } else if (config[FACTORY_CONFIG.SWAP_DEV_NAME_TO_GUID]) {
        const elements = Store.getStore().getCurrentState().elements;
        swapDevNamesToGuids(elements, { [newElement.guid]: newElement });
    }

    return newElement;
};