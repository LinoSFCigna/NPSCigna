import reducer, * as actions from '../reducer';
import {
    START_ELEMENT_GUID,
    END_ELEMENT_GUID,
    SCREEN_ELEMENT_GUID,
    BRANCH_ELEMENT_GUID,
    ACTION_ELEMENT_GUID
} from './testUtils';
import {
    initFlowModel,
    addElement,
    deleteElement,
    deleteFault,
    connectToElement,
    addFault,
    updateChildren
} from '../modelUtils';

import NodeType from '../NodeType';

jest.mock('../modelUtils');

const elementService = {};

const configuredReducer = reducer(elementService);

describe('reducer', () => {
    describe('initAction', () => {
        it('delegates to initFlowModel', () => {
            const flowModel = {};
            const action = actions.initAction(START_ELEMENT_GUID, END_ELEMENT_GUID);
            configuredReducer(flowModel, action);
            expect(initFlowModel).toHaveBeenLastCalledWith(flowModel, START_ELEMENT_GUID, END_ELEMENT_GUID);
        });
    });

    describe('addElementAction', () => {
        it('delegates to addElement', () => {
            const flowModel = {};
            const elementGuid = 'add-element-guid';
            const nodeType = NodeType.DEFAULT;
            const insertAt = { prev: 'prev-element' };
            const action = actions.addElementAction(elementGuid, nodeType, insertAt);
            configuredReducer(flowModel, action);
            expect(addElement).toHaveBeenLastCalledWith(flowModel, elementGuid, nodeType, insertAt);
        });
    });

    describe('deleteElementAction', () => {
        it('delegates to deleteElement with no childIndexToKeep', () => {
            const flowModel = {};
            const action = actions.deleteElementAction(SCREEN_ELEMENT_GUID);
            configuredReducer(flowModel, action);
            expect(deleteElement).toHaveBeenLastCalledWith(elementService, flowModel, SCREEN_ELEMENT_GUID, {
                childIndexToKeep: undefined
            });
        });

        it('delegates to deleteElement with childIndexToKeep', () => {
            const flowModel = {};
            const childIndexToKeep = 0;
            const action = actions.deleteElementAction(BRANCH_ELEMENT_GUID, childIndexToKeep);
            configuredReducer(flowModel, action);
            expect(deleteElement).toHaveBeenLastCalledWith(elementService, flowModel, BRANCH_ELEMENT_GUID, {
                childIndexToKeep
            });
        });
    });

    describe('deleteFaultAction', () => {
        it('delegates to deleteFault', () => {
            const flowModel = {};
            const action = actions.deleteFaultAction(ACTION_ELEMENT_GUID);
            configuredReducer(flowModel, action);
            expect(deleteFault).toHaveBeenLastCalledWith(elementService, flowModel, ACTION_ELEMENT_GUID);
        });
    });

    describe('connectToElementAction', () => {
        it('delegates to connectToElement', () => {
            const flowModel = {};
            const targetGuid = 'target-guid';
            const fromInsertAt = { prev: 'prev-element' };
            const action = actions.connectToElementAction(fromInsertAt, targetGuid);
            configuredReducer(flowModel, action);
            expect(connectToElement).toHaveBeenLastCalledWith(elementService, flowModel, fromInsertAt, targetGuid);
        });
    });

    describe('addFaultAction', () => {
        it('delegates to addFault', () => {
            const flowModel = {};

            const action = actions.addFaultAction(ACTION_ELEMENT_GUID);
            configuredReducer(flowModel, action);
            expect(addFault).toHaveBeenLastCalledWith(elementService, flowModel, ACTION_ELEMENT_GUID);
        });
    });

    describe('updateChildren', () => {
        it('delegates to updateChildren', () => {
            const flowModel = {};
            const updatedChildrenGuids = ['child-guid', null, 'child3-guid'];
            const action = actions.updateChildrenAction(BRANCH_ELEMENT_GUID, updatedChildrenGuids);
            configuredReducer(flowModel, action);
            expect(updateChildren).toHaveBeenLastCalledWith(
                elementService,
                flowModel,
                BRANCH_ELEMENT_GUID,
                updatedChildrenGuids
            );
        });
    });
});