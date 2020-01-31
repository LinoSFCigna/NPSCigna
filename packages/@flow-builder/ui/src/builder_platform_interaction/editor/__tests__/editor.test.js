import { createElement } from 'lwc';

import { ELEMENT_TYPE } from 'builder_platform_interaction/flowMetadata';
import { addElement, updateElement } from 'builder_platform_interaction/actions';
import { PROPERTY_EDITOR, invokePropertyEditor } from 'builder_platform_interaction/builderUtils';
import Editor from '../editor';
import {
    CANVAS_EVENT,
    AddElementEvent,
    AddNodeEvent,
    UpdateNodeEvent,
    ClosePropertyEditorEvent
} from 'builder_platform_interaction/events';
import { Store } from 'builder_platform_interaction/storeLib';
import { translateUIModelToFlow } from 'builder_platform_interaction/translatorLib';
import { fetch, SERVER_ACTION_TYPE } from 'builder_platform_interaction/serverDataLib';
import { getElementForPropertyEditor, getElementForStore } from 'builder_platform_interaction/propertyEditorFactory';
import { ticks } from 'builder_platform_interaction/builderTestUtils';

jest.mock('builder_platform_interaction/preloadLib', () => {
    return {
        loadFieldsForComplexTypesInFlow: jest.fn(),
        loadParametersForInvocableApexActionsInFlowFromMetadata: jest.fn(),
        loadReferencesIn: jest.fn(),
        loadOnStart: jest.fn(),
        loadOnProcessTypeChange: jest.fn(),
        initializeLoader: jest.fn()
    };
});

jest.mock('builder_platform_interaction/elementConfig', () => {
    return Object.assign(require.requireActual('builder_platform_interaction/elementConfig'), {
        getConfigForElementType: jest.fn().mockImplementation(() => {
            return {
                descriptor: 'test descriptor',
                canBeDuplicated: false,
                isDeletable: false,
                nodeConfig: { isSelectable: false },
                labels: {
                    singular: 'a'
                }
            };
        })
    });
});

jest.mock('builder_platform_interaction/elementLabelLib', () => {
    return {
        getResourceLabel: jest.fn(element => {
            return element.label;
        }),
        getResourceCategory: jest.fn()
    };
});

jest.mock('builder_platform_interaction/builderUtils', () => {
    return Object.assign(require.requireActual('builder_platform_interaction/builderUtils'), {
        invokePropertyEditor: jest.fn()
    });
});

jest.mock('builder_platform_interaction/propertyEditorFactory', () => {
    const elementMock = { a: 1 };

    return Object.assign(require.requireActual('builder_platform_interaction/propertyEditorFactory'), {
        getElementForPropertyEditor: jest.fn(() => {
            return elementMock;
        }),
        getElementForStore: jest.fn(node => {
            return node;
        })
    });
});

jest.mock('builder_platform_interaction/drawingLib', () => require('builder_platform_interaction_mocks/drawingLib'));

jest.mock('builder_platform_interaction/keyboardInteractionUtils', () =>
    require('builder_platform_interaction_mocks/keyboardInteractionUtils')
);

jest.mock('builder_platform_interaction/translatorLib', () => {
    return {
        translateUIModelToFlow: jest.fn()
    };
});

jest.mock('builder_platform_interaction/serverDataLib', () => {
    return {
        fetch: jest.fn(),
        fetchOnce: jest.fn(action => {
            if (action === 'getBuilderConfigs') {
                return Promise.resolve({});
            }
            return {
                then: () => {}
            };
        }),
        SERVER_ACTION_TYPE: require.requireActual('builder_platform_interaction/serverDataLib').SERVER_ACTION_TYPE
    };
});

jest.mock('builder_platform_interaction/systemLib', () => {
    const actual = require.requireActual('builder_platform_interaction/systemLib');

    return Object.assign({}, actual, {
        getBuilderConfig: builderType => {
            return builderType === 'old'
                ? {
                      supportedProcessTypes: ['right']
                  }
                : {
                      supportedProcessTypes: ['right'],
                      usePanelForPropertyEditor: true
                  };
        }
    });
});

jest.mock('builder_platform_interaction/actions', () => {
    return {
        addElement: jest.fn(element => {
            return {
                value: element
            };
        }),
        updateElement: jest.fn(element => {
            return {
                updateValue: element
            };
        })
    };
});
const createComponentUnderTest = (props = { builderType: 'old' }) => {
    const el = createElement('builder_platform_interaction-editor', {
        is: Editor
    });
    Object.assign(el, props);
    document.body.appendChild(el);
    return el;
};

const selectors = {
    root: '.editor',
    save: '.toolbar-save',
    addnewresource: '.test-left-panel-add-resource'
};

const mockStoreState = {
    elements: {
        '1': {
            guid: '1',
            locationX: '20',
            locationY: '40',
            elementType: 'ASSIGNMENT',
            label: 'First Node',
            description: 'My first test node',
            config: { isSelected: false }
        },
        '2': {
            guid: '2',
            locationX: '50',
            locationY: '40',
            elementType: 'ASSIGNMENT',
            label: 'Second Node',
            description: 'My second test node',
            config: { isSelected: true }
        },
        '3': {
            guid: '3',
            locationX: '100',
            locationY: '240',
            elementType: 'DECISION',
            label: 'Third Node',
            description: 'My third test node',
            outcomeReferences: [
                {
                    outcomeReference: '4'
                }
            ],
            config: { isSelected: false }
        },
        '4': {
            guid: '4',
            elementType: 'OUTCOME',
            label: 'Fourth Node',
            description: 'My fourth test node'
        },
        '5': {
            guid: '5',
            locationX: '250',
            locationY: '240',
            elementType: 'ASSIGNMENT',
            label: 'Fifth Node',
            description: 'My fifth test node',
            config: { isSelected: false }
        }
    },
    canvasElements: [{ guid: '1' }, { guid: '2' }, { guid: '3' }, { guid: '5' }],
    connectors: [
        {
            guid: 'c1',
            source: '1',
            target: '2',
            label: 'label',
            config: { isSelected: false }
        },
        {
            guid: 'c2',
            source: '2',
            target: '1',
            label: 'label',
            config: { isSelected: true }
        },
        {
            guid: 'c3',
            source: '3',
            target: '5',
            label: 'label',
            config: { isSelected: false }
        },
        {
            guid: 'c4',
            source: '5',
            target: '3',
            label: 'label',
            config: { isSelected: false }
        }
    ],
    properties: {
        label: 'Flow Name',
        versionNumber: '1',
        processType: 'dummyProcessType'
    }
};

jest.mock('builder_platform_interaction/storeLib', () => {
    const dispatchSpy = jest.fn().mockImplementation(() => {});

    return {
        Store: {
            getStore: () => {
                return {
                    subscribe: mapAppStateToStore => {
                        mapAppStateToStore(mockStoreState);
                        return jest.fn().mockImplementation(() => {
                            return 'Testing';
                        });
                    },
                    dispatch: dispatchSpy,
                    getCurrentState: () => {
                        return mockStoreState;
                    }
                };
            }
        },
        deepCopy: jest.fn().mockImplementation(obj => {
            return obj;
        }),
        generateGuid: jest.fn().mockImplementation(prefix => {
            return prefix;
        }),
        combinedReducer: jest.fn(),
        createSelector: jest.fn().mockImplementation(() => {
            return () => {
                return mockStoreState.canvasElements.map(canvasElement => {
                    return mockStoreState.elements[canvasElement.guid];
                });
            };
        })
    };
});

const element = (guid, type) => {
    return {
        payload: {
            guid
        },
        type
    };
};

const deselectionAction = {
    payload: {},
    type: 'DESELECT_ON_CANVAS'
};

const deleteElementByGuid = {
    payload: {
        selectedCanvasElementGUIDs: ['2'],
        connectorGUIDs: ['c1', 'c2'],
        canvasElementsToUpdate: ['1'],
        elementType: ELEMENT_TYPE.ASSIGNMENT
    },
    type: 'DELETE_CANVAS_ELEMENT'
};

const deleteElementByIsSelected = {
    payload: {
        selectedCanvasElementGUIDs: ['2'],
        connectorGUIDs: ['c2', 'c1'],
        canvasElementsToUpdate: ['1'],
        elementType: ELEMENT_TYPE.ASSIGNMENT
    },
    type: 'DELETE_CANVAS_ELEMENT'
};

const deleteDecision = {
    payload: {
        selectedCanvasElementGUIDs: ['3'],
        connectorGUIDs: ['c4'],
        canvasElementsToUpdate: ['5'],
        // Event currently always thrown with 'assignment'
        elementType: ELEMENT_TYPE.ASSIGNMENT
    },
    type: 'DELETE_CANVAS_ELEMENT'
};

const updateElementAction = {
    payload: {
        guid: '1',
        elementType: ELEMENT_TYPE.ASSIGNMENT,
        locationX: '80',
        locationY: '70'
    },
    type: 'UPDATE_CANVAS_ELEMENT'
};

const connectorElement = {
    payload: {
        guid: 'CONNECTOR',
        source: '1',
        target: '2',
        label: 'Label',
        config: { isSelected: false }
    },
    type: 'ADD_CONNECTOR'
};

// TODO: Since we are doing lot of refactoring in canvas, commenting these tests. Will clean up as part of this work item:
// https://gus.my.salesforce.com/apex/ADM_WorkView?id=a07B00000058VlnIAE&sfdc.override=1
const describeSkip = describe.skip;
describeSkip('editor', () => {
    describe('saving', () => {
        it('translates the ui model to flow data', () => {
            const editorComponent = createComponentUnderTest();
            return Promise.resolve().then(() => {
                editorComponent.shadowRoot.querySelector(selectors.save).click();

                expect(translateUIModelToFlow.mock.calls).toHaveLength(1);
                expect(translateUIModelToFlow.mock.calls[0][0]).toEqual(Store.getStore().getCurrentState());
            });
        });

        it('passes the translated value to fetch', () => {
            const editorComponent = createComponentUnderTest();
            return Promise.resolve().then(() => {
                const flow = { x: 1 };

                translateUIModelToFlow.mockReturnValue(flow);

                editorComponent.shadowRoot.querySelector(selectors.save).click();
                // Check against the last call to fetch.  The first is in editor.js constructor and thus
                // unavoidable and other components included via editor.html may also have fetch calls
                // (for example left-panel-elements
                const saveFetchCallIndex = fetch.mock.calls.length - 1;

                expect(fetch.mock.calls[saveFetchCallIndex][0]).toEqual(SERVER_ACTION_TYPE.SAVE_FLOW);
                expect(fetch.mock.calls[saveFetchCallIndex][2]).toEqual({
                    flow
                });
            });
        });
    });

    describe('Server side fetch', () => {
        it('getting rules', () => {
            createComponentUnderTest();
            return Promise.resolve().then(() => {
                expect(fetch.mock.calls).toHaveLength(4);
                expect(fetch.mock.calls[0][0]).toEqual(SERVER_ACTION_TYPE.GET_RULES);
            });
        });
        it('getting flow metadata', () => {
            createComponentUnderTest({
                flowId: 'flow 123'
            });
            return Promise.resolve().then(() => {
                expect(fetch.mock.calls).toHaveLength(5);
                expect(fetch.mock.calls[3][0]).toEqual(SERVER_ACTION_TYPE.GET_FLOW);
            });
        });
        it('getting header urls', () => {
            createComponentUnderTest();
            return Promise.resolve().then(() => {
                expect(fetch.mock.calls).toHaveLength(4);
                expect(fetch.mock.calls[2][0]).toEqual(SERVER_ACTION_TYPE.GET_HEADER_URLS);
            });
        });

        // TODO: W-5403092 Add test case for fetching of sObject variable fields
    });

    describe('Canvas', () => {
        it('Checks if node selection is handled correctly when an unselected node is clicked without multiSelect key', () => {
            const editorComponent = createComponentUnderTest();
            const event = new CustomEvent(CANVAS_EVENT.NODE_SELECTED, {
                bubbles: true,
                composed: true,
                cancelable: true,
                detail: {
                    canvasElementGUID: '1',
                    isMultiSelectKeyPressed: false
                }
            });
            editorComponent.shadowRoot.querySelector('builder_platform_interaction-canvas').dispatchEvent(event);
            return Promise.resolve().then(() => {
                const spy = Store.getStore().dispatch;
                expect(spy).toHaveBeenCalled();
                expect(spy.mock.calls[0][0]).toEqual(element('1', 'SELECT_ON_CANVAS'));
            });
        });

        it('Checks if node selection is handled correctly when a selected node is clicked without multiSelect key', () => {
            const editorComponent = createComponentUnderTest();
            const event = new CustomEvent(CANVAS_EVENT.NODE_SELECTED, {
                bubbles: true,
                composed: true,
                cancelable: true,
                detail: {
                    canvasElementGUID: '2',
                    isMultiSelectKeyPressed: false
                }
            });
            editorComponent.shadowRoot.querySelector('builder_platform_interaction-canvas').dispatchEvent(event);
            return Promise.resolve().then(() => {
                const spy = Store.getStore().dispatch;
                expect(spy).toHaveBeenCalled();
                expect(spy.mock.calls[0][0]).toEqual(element('2', 'SELECT_ON_CANVAS'));
            });
        });

        it('Checks if node selection is handled correctly when an unselected node is clicked with multiSelect key', () => {
            const editorComponent = createComponentUnderTest();
            const event = new CustomEvent(CANVAS_EVENT.NODE_SELECTED, {
                bubbles: true,
                composed: true,
                cancelable: true,
                detail: {
                    canvasElementGUID: '1',
                    isMultiSelectKeyPressed: true
                }
            });
            editorComponent.shadowRoot.querySelector('builder_platform_interaction-canvas').dispatchEvent(event);
            return Promise.resolve().then(() => {
                const spy = Store.getStore().dispatch;
                expect(spy).toHaveBeenCalled();
                expect(spy.mock.calls[0][0]).toEqual(element('1', 'TOGGLE_ON_CANVAS'));
            });
        });

        it('Checks if node selection is handled correctly when a selected node is clicked with multiSelect key', () => {
            const editorComponent = createComponentUnderTest();
            const event = new CustomEvent(CANVAS_EVENT.NODE_SELECTED, {
                bubbles: true,
                composed: true,
                cancelable: true,
                detail: {
                    canvasElementGUID: '2',
                    isMultiSelectKeyPressed: true
                }
            });
            editorComponent.shadowRoot.querySelector('builder_platform_interaction-canvas').dispatchEvent(event);
            return Promise.resolve().then(() => {
                const spy = Store.getStore().dispatch;
                expect(spy).toHaveBeenCalled();
                expect(spy.mock.calls[0][0]).toEqual(element('2', 'TOGGLE_ON_CANVAS'));
            });
        });

        it('Checks if node and connector deselection is handled correctly when a canvas is clicked', () => {
            const editorComponent = createComponentUnderTest();
            const event = new CustomEvent(CANVAS_EVENT.CANVAS_MOUSEUP, {
                bubbles: true,
                composed: true,
                cancelable: true
            });
            editorComponent.shadowRoot.querySelector('builder_platform_interaction-canvas').dispatchEvent(event);
            return Promise.resolve().then(() => {
                const spy = Store.getStore().dispatch;
                expect(spy).toHaveBeenCalled();
                expect(spy.mock.calls[0][0]).toEqual(deselectionAction);
            });
        });

        it('Checks if connector selection is handled correctly when an unselected connector is clicked without multiSelect key', () => {
            const editorComponent = createComponentUnderTest();
            const event = new CustomEvent(CANVAS_EVENT.CONNECTOR_SELECTED, {
                bubbles: true,
                composed: true,
                cancelable: true,
                detail: {
                    connectorGUID: 'c1',
                    isMultiSelectKeyPressed: false
                }
            });
            editorComponent.shadowRoot.querySelector('builder_platform_interaction-canvas').dispatchEvent(event);
            return Promise.resolve().then(() => {
                const spy = Store.getStore().dispatch;
                expect(spy).toHaveBeenCalled();
                expect(spy.mock.calls[0][0]).toEqual(element('c1', 'SELECT_ON_CANVAS'));
            });
        });

        it('Checks if connector selection is handled correctly when a selected connector is clicked without multiSelect key', () => {
            const editorComponent = createComponentUnderTest();
            const event = new CustomEvent(CANVAS_EVENT.CONNECTOR_SELECTED, {
                bubbles: true,
                composed: true,
                cancelable: true,
                detail: {
                    connectorGUID: 'c2',
                    isMultiSelectKeyPressed: false
                }
            });
            editorComponent.shadowRoot.querySelector('builder_platform_interaction-canvas').dispatchEvent(event);
            return Promise.resolve().then(() => {
                const spy = Store.getStore().dispatch;
                expect(spy).toHaveBeenCalled();
                expect(spy.mock.calls[0][0]).toEqual(element('c2', 'SELECT_ON_CANVAS'));
            });
        });

        it('Checks if connector selection is handled correctly when an unselected connector is clicked with multiSelect key', () => {
            const editorComponent = createComponentUnderTest();
            const event = new CustomEvent(CANVAS_EVENT.CONNECTOR_SELECTED, {
                bubbles: true,
                composed: true,
                cancelable: true,
                detail: {
                    connectorGUID: 'c1',
                    isMultiSelectKeyPressed: true
                }
            });
            editorComponent.shadowRoot.querySelector('builder_platform_interaction-canvas').dispatchEvent(event);
            return Promise.resolve().then(() => {
                const spy = Store.getStore().dispatch;
                expect(spy).toHaveBeenCalled();
                expect(spy.mock.calls[0][0]).toEqual(element('c1', 'TOGGLE_ON_CANVAS'));
            });
        });

        it('Checks if connector selection is handled correctly when a selected connector is clicked with multiSelect key', () => {
            const editorComponent = createComponentUnderTest();
            const event = new CustomEvent(CANVAS_EVENT.CONNECTOR_SELECTED, {
                bubbles: true,
                composed: true,
                cancelable: true,
                detail: {
                    connectorGUID: 'c2',
                    isMultiSelectKeyPressed: true
                }
            });
            editorComponent.shadowRoot.querySelector('builder_platform_interaction-canvas').dispatchEvent(event);
            return Promise.resolve().then(() => {
                const spy = Store.getStore().dispatch;
                expect(spy).toHaveBeenCalled();
                expect(spy.mock.calls[0][0]).toEqual(element('c2', 'TOGGLE_ON_CANVAS'));
            });
        });

        describe('delete of a single element', () => {
            it('deletes associated connectors and updates associated nodes', () => {
                const editorComponent = createComponentUnderTest();
                const event = new CustomEvent(CANVAS_EVENT.DELETE_ON_CANVAS, {
                    bubbles: true,
                    composed: true,
                    cancelable: true,
                    detail: {
                        selectedCanvasElementGUIDs: ['2']
                    }
                });
                editorComponent.shadowRoot.querySelector('builder_platform_interaction-canvas').dispatchEvent(event);
                return Promise.resolve().then(() => {
                    const spy = Store.getStore().dispatch;
                    expect(spy).toHaveBeenCalled();
                    expect(spy.mock.calls[0][0]).toEqual(deleteElementByGuid);
                });
            });

            it('decision with outcomes deletes associated connectors and updates associated nodes', () => {
                const editorComponent = createComponentUnderTest();
                const event = new CustomEvent(CANVAS_EVENT.DELETE_ON_CANVAS, {
                    bubbles: true,
                    composed: true,
                    cancelable: true,
                    detail: {
                        selectedCanvasElementGUIDs: ['3']
                    }
                });
                editorComponent.shadowRoot.querySelector('builder_platform_interaction-canvas').dispatchEvent(event);
                return Promise.resolve().then(() => {
                    const spy = Store.getStore().dispatch;
                    expect(spy).toHaveBeenCalled();
                    expect(spy.mock.calls[0][0]).toEqual(deleteDecision);
                });
            });
        });

        it('Checks if node and connector deletion is handled correctly when delete key is pressed', () => {
            const editorComponent = createComponentUnderTest();
            const event = new CustomEvent(CANVAS_EVENT.DELETE_ON_CANVAS, {
                bubbles: true,
                composed: true,
                cancelable: true,
                detail: {}
            });
            editorComponent.shadowRoot.querySelector('builder_platform_interaction-canvas').dispatchEvent(event);
            return Promise.resolve().then(() => {
                const spy = Store.getStore().dispatch;
                expect(spy).toHaveBeenCalled();
                expect(spy.mock.calls[0][0]).toEqual(deleteElementByIsSelected);
            });
        });

        it('Checks if node location is updated correctly when a node stops dragging', () => {
            const editorComponent = createComponentUnderTest();
            const event = new CustomEvent(CANVAS_EVENT.DRAG_STOP, {
                bubbles: true,
                composed: true,
                cancelable: true,
                detail: {
                    canvasElementGUID: '1',
                    elementType: ELEMENT_TYPE.ASSIGNMENT,
                    locationX: '80',
                    locationY: '70'
                }
            });
            editorComponent.shadowRoot.querySelector('builder_platform_interaction-canvas').dispatchEvent(event);
            return Promise.resolve().then(() => {
                const spy = Store.getStore().dispatch;
                expect(spy).toHaveBeenCalled();
                expect(spy.mock.calls[0][0]).toEqual(updateElementAction);
            });
        });

        it('Checks if connections are added correctly', () => {
            const editorComponent = createComponentUnderTest();
            const event = new CustomEvent(CANVAS_EVENT.ADD_CONNECTION, {
                bubbles: true,
                composed: true,
                detail: {
                    source: '1',
                    target: '2',
                    label: 'Label'
                }
            });
            editorComponent.shadowRoot.querySelector('builder_platform_interaction-canvas').dispatchEvent(event);
            return Promise.resolve().then(() => {
                const spy = Store.getStore().dispatch;
                expect(spy).toHaveBeenCalled();
                expect(spy.mock.calls[0][0]).toEqual(connectorElement);
            });
        });
    });
});

describe('editor property editor', () => {
    it('is opened in a modal by default', () => {
        const editorComponent = createComponentUnderTest();

        const elementType = 'ASSIGNMENT';

        const event = new AddElementEvent(elementType, 0, 0);

        return Promise.resolve().then(() => {
            editorComponent.shadowRoot.querySelector('builder_platform_interaction-left-panel').dispatchEvent(event);

            return ticks().then(() => {
                expect(invokePropertyEditor).toHaveBeenCalledWith(PROPERTY_EDITOR, {
                    mode: 'addelement',
                    node: getElementForPropertyEditor(),
                    nodeUpdate: expect.anything(),
                    newResourceCallback: expect.anything(),
                    processType: 'dummyProcessType'
                });
            });
        });
    });

    it('is opened in the right panel when builderConfig.usePanelForPropertyEditor = true', () => {
        mockStoreState.properties.processType = 'right';

        const editorComponent = createComponentUnderTest({
            builderType: 'new'
        });

        const elementType = 'ASSIGNMENT';

        const event = new AddElementEvent(elementType, 0, 0);

        return Promise.resolve().then(() => {
            editorComponent.shadowRoot.querySelector('builder_platform_interaction-left-panel').dispatchEvent(event);

            return ticks().then(() => {
                const rightPanel = editorComponent.shadowRoot.querySelector('builder_platform_interaction-right-panel');
                expect(rightPanel).not.toBeNull();
            });
        });
    });

    describe('in right panel', () => {
        let editorComponent;
        let rightPanel;

        beforeEach(() => {
            mockStoreState.properties.processType = 'right';

            editorComponent = createComponentUnderTest({
                builderType: 'new'
            });

            return Promise.resolve().then(() => {
                const elementType = 'ASSIGNMENT';
                const event = new AddElementEvent(elementType, 0, 0);

                return Promise.resolve().then(() => {
                    editorComponent.shadowRoot
                        .querySelector('builder_platform_interaction-left-panel')
                        .dispatchEvent(event);

                    return ticks().then(() => {
                        rightPanel = editorComponent.shadowRoot.querySelector(
                            'builder_platform_interaction-right-panel'
                        );
                    });
                });
            });
        });

        it('closepropertyeditorevent closes the property editor', () => {
            const event = new ClosePropertyEditorEvent();

            return Promise.resolve().then(() => {
                rightPanel.dispatchEvent(event);

                return Promise.resolve().then(() => {
                    rightPanel = editorComponent.shadowRoot.querySelector('builder_platform_interaction-right-panel');

                    expect(rightPanel).toBeNull();
                });
            });
        });

        it('addnodeevent dispatches addElement to the store', () => {
            const elementToAdd = { a: 1 };
            const event = new AddNodeEvent(elementToAdd);

            return Promise.resolve().then(() => {
                rightPanel.dispatchEvent(event);

                expect(getElementForStore).toHaveBeenCalledWith(elementToAdd);
                expect(addElement).toHaveBeenCalledWith(elementToAdd);
                expect(Store.getStore().dispatch).toHaveBeenCalledWith({
                    value: elementToAdd
                });
            });
        });

        it('updatenodeevent dispatches updateElement to the store', () => {
            const elementToUpdate = { a: 1 };
            const event = new UpdateNodeEvent(elementToUpdate);

            return Promise.resolve().then(() => {
                rightPanel.dispatchEvent(event);

                expect(getElementForStore).toHaveBeenCalledWith(elementToUpdate);
                expect(updateElement).toHaveBeenCalledWith(elementToUpdate);
                expect(Store.getStore().dispatch).toHaveBeenCalledWith({
                    updateValue: elementToUpdate
                });
            });
        });
    });
});