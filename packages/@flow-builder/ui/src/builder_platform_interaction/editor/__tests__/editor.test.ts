// @ts-nocheck
import { createElement } from 'lwc';
import { ELEMENT_TYPE } from 'builder_platform_interaction/flowMetadata';
import { PROPERTY_EDITOR, invokePropertyEditor } from 'builder_platform_interaction/builderUtils';
import Editor from '../editor';
import { isGuardrailsEnabled } from '../editorUtils';
import {
    CANVAS_EVENT,
    AddElementEvent,
    NewResourceEvent,
    ClosePropertyEditorEvent,
    AddNodeEvent,
    UpdateNodeEvent,
    DeleteElementEvent,
    EditElementEvent,
    ToggleMarqueeOnEvent,
    SelectNodeEvent,
    DuplicateEvent,
    ToggleSelectionModeEvent
} from 'builder_platform_interaction/events';
import { addElement, updateCanvasElementLocation, updateElement } from 'builder_platform_interaction/actions';
import { Store, generateGuid } from 'builder_platform_interaction/storeLib';
import { translateUIModelToFlow } from 'builder_platform_interaction/translatorLib';
import { fetch, SERVER_ACTION_TYPE } from 'builder_platform_interaction/serverDataLib';
import { getElementForPropertyEditor, getElementForStore } from 'builder_platform_interaction/propertyEditorFactory';
import { setDocumentBodyChildren, ticks } from 'builder_platform_interaction/builderTestUtils';
import { mockEngineExecute } from 'analyzer_framework/engine';
import { BUILDER_MODE } from 'builder_platform_interaction/systemLib';

jest.mock('builder_platform_interaction/flcBuilder', () => require('builder_platform_interaction_mocks/flcBuilder'));

let mockSubscribers = [];
let mockStoreState;

jest.mock('builder_platform_interaction/preloadLib', () => {
    return {
        loadAllSupportedFeatures: jest.fn(),
        loadFieldsForComplexTypesInFlow: jest.fn(),
        loadParametersForInvocableApexActionsInFlowFromMetadata: jest.fn(),
        loadOnStart: jest.fn().mockResolvedValue({}),
        loadOnProcessTypeChange: jest.fn().mockImplementation(() => {
            return {
                loadActionsPromise: Promise.resolve({}),
                loadPeripheralMetadataPromise: Promise.resolve({}),
                loadPalettePromise: Promise.resolve({})
            };
        }),
        loadOperatorsAndRulesOnTriggerTypeChange: jest.fn(),
        initializeLoader: jest.fn(),
        loadVersioningData: jest.fn()
    };
});

jest.mock('builder_platform_interaction/elementConfig', () => {
    return Object.assign(jest.requireActual('builder_platform_interaction/elementConfig'), {
        getConfigForElementType: jest.fn().mockImplementation(() => {
            return {
                descriptor: 'builder_platform_interaction:assignmentEditor',
                canBeDuplicated: true,
                isDeletable: false,
                nodeConfig: {},
                labels: {
                    singular: 'a'
                }
            };
        })
    });
});

jest.mock('builder_platform_interaction/elementLabelLib', () => {
    return {
        getResourceLabel: jest.fn((el) => {
            return el.label;
        }),
        getResourceCategory: jest.fn()
    };
});

jest.mock('builder_platform_interaction/builderUtils', () => {
    return Object.assign(jest.requireActual('builder_platform_interaction/builderUtils'), {
        invokePropertyEditor: jest.fn()
    });
});

jest.mock('../editorUtils', () => {
    return Object.assign(jest.requireActual('../editorUtils'), {
        isGuardrailsEnabled: jest.fn(),
        getElementsMetadata: () => []
    });
});

jest.mock('builder_platform_interaction/propertyEditorFactory', () => {
    return Object.assign(jest.requireActual('builder_platform_interaction/propertyEditorFactory'), {
        getElementForPropertyEditor: jest.fn((node) => {
            if (node == null) {
                throw new Error('Node must not be null');
            }
            return node;
        }),
        getElementForStore: jest.fn((node) => {
            return node;
        })
    });
});

jest.mock('builder_platform_interaction/drawingLib', () => require('builder_platform_interaction_mocks/drawingLib'));

let mockIsAutolayoutCanvas = false;
jest.mock('builder_platform_interaction/processTypeLib', () => {
    return Object.assign({}, jest.requireActual('builder_platform_interaction/processTypeLib'), {
        isAutoLayoutCanvasOnly: jest.fn().mockImplementation(() => {
            return mockIsAutolayoutCanvas;
        })
    });
});
jest.mock('builder_platform_interaction/sharedUtils', () => require('builder_platform_interaction_mocks/sharedUtils'));

jest.mock('builder_platform_interaction/translatorLib', () => {
    return {
        translateUIModelToFlow: jest.fn()
    };
});

jest.mock('builder_platform_interaction/serverDataLib', () => {
    const actual = jest.requireActual('builder_platform_interaction/serverDataLib');
    return {
        fetch: jest.fn().mockImplementation((actionType, callback, params) => {
            if (actionType === actual.SERVER_ACTION_TYPE.SAVE_FLOW) {
                if (params.flow.fullName === 'FAIL') {
                    callback({
                        data: { isSuccess: false }
                    });
                } else if (params.flow.fullName === 'ERROR') {
                    callback({
                        error: { error: 'Something Wrong' }
                    });
                } else {
                    jest.fn().mockResolvedValue({});
                }
            } else {
                jest.fn().mockResolvedValue({});
            }
        }),
        fetchOnce: jest.fn().mockResolvedValue({}),
        SERVER_ACTION_TYPE: actual.SERVER_ACTION_TYPE
    };
});

jest.mock('builder_platform_interaction/actions', () => {
    return {
        addElement: jest.fn((el) => {
            return {
                value: el
            };
        }),
        updateElement: jest.fn((el) => {
            return {
                updateValue: el
            };
        }),
        deleteElements: jest.fn().mockImplementation((payload) => {
            return {
                type: 'deleteElement',
                payload
            };
        }),
        updateCanvasElementLocation: jest.fn().mockImplementation((payload) => {
            return {
                type: 'updateCanvasElementLocation',
                payload
            };
        }),
        doDuplicate: jest.fn().mockImplementation((payload) => {
            return {
                type: 'doDuplicate',
                payload
            };
        })
    };
});

jest.mock('builder_platform_interaction/storeLib', () => {
    const dispatchSpy = jest.fn().mockImplementation(() => {
        mockSubscribers.forEach((subscriber) => {
            subscriber();
        });
    });
    let currentGuid = 1;
    return {
        Store: {
            getStore: () => {
                return {
                    subscribe: (mapAppStateToStore) => {
                        mockSubscribers.push(mapAppStateToStore);
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
        deepCopy: jest.fn().mockImplementation((obj) => {
            return obj;
        }),
        generateGuid: jest.fn().mockImplementation(() => {
            return currentGuid++;
        }),
        combinedReducer: jest.fn(),
        createSelector: jest.fn().mockImplementation(() => {
            return () => {
                return mockStoreState.canvasElements.map((canvasElementGUID) => {
                    return mockStoreState.elements[canvasElementGUID];
                });
            };
        }),
        isPlainObject: jest.fn().mockImplementation(() => {
            return false;
        })
    };
});

jest.mock('builder_platform_interaction/screenFieldTypeLib', () => {
    return {
        setSupportedScreenFieldTypes: jest.fn()
    };
});
jest.mock('builder_platform_interaction/mergeFieldLib', () => {
    return {
        loadReferencesIn: jest.fn().mockResolvedValue({})
    };
});

const createComponentUnderTest = (
    props = {
        builderType: 'old',
        builderMode: 'editMode',
        builderConfig: {
            supportedProcessTypes: ['right'],
            componentConfigs: {
                editMode: {
                    leftPanelConfig: { showLeftPanel: true },
                    toolbarConfig: {
                        showCanvasModeToggle: true
                    }
                }
            }
        }
    }
) => {
    const el = createElement('builder_platform_interaction-editor', {
        is: Editor
    });
    Object.assign(el, props);
    setDocumentBodyChildren(el);
    return el;
};

const selectors = {
    root: '.editor',
    save: '.test-toolbar-save',
    addnewresource: '.test-left-panel-add-resource',
    propertyEditorPanel: 'builder_platform_interaction-property-editor-panel',
    canvasContainer: 'builder_platform_interaction-canvas-container',
    leftPanel: 'builder_platform_interaction-left-panel',
    rightPanel: 'builder_platform_interaction-right-panel',
    debugPanel: 'builder_platform_interaction-debug-panel',
    flcBuilderContainer: 'builder_platform_interaction-flc-builder-container',
    toolbar: 'builder_platform_interaction-toolbar',
    canvasToggle: '.canvas-mode-toggle'
};

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

beforeEach(() => {
    mockStoreState = {
        elements: {
            '1': {
                guid: '1',
                locationX: '20',
                locationY: '40',
                elementType: ELEMENT_TYPE.ASSIGNMENT,
                label: 'First Node',
                description: 'My first test node',
                config: { isSelected: false },
                assignmentItems: []
            },
            '2': {
                guid: '2',
                locationX: '50',
                locationY: '40',
                elementType: ELEMENT_TYPE.ASSIGNMENT,
                label: 'Second Node',
                description: 'My second test node',
                config: { isSelected: true }
            },
            '3': {
                guid: '3',
                locationX: '100',
                locationY: '240',
                elementType: ELEMENT_TYPE.DECISION,
                label: 'Third Node',
                description: 'My third test node',
                childReferences: [
                    {
                        childReference: '4'
                    }
                ],
                config: { isSelected: false }
            },
            '4': {
                guid: '4',
                elementType: ELEMENT_TYPE.OUTCOME,
                label: 'Fourth Node',
                description: 'My fourth test node'
            },
            '5': {
                guid: '5',
                locationX: '250',
                locationY: '240',
                elementType: ELEMENT_TYPE.ASSIGNMENT,
                label: 'Fifth Node',
                description: 'My fifth test node',
                config: { isSelected: false },
                assignmentItems: []
            }
        },
        canvasElements: ['1', '2', '3', '5'],
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
            processType: 'dummyProcessType',
            isAutoLayoutCanvas: false
        }
    };
    mockSubscribers = [];
});

// TODO: Since we are doing lot of refactoring in canvas, commenting these tests. Will clean up as part of this work item:
// https://gus.my.salesforce.com/apex/ADM_WorkView?id=a07B00000058VlnIAE&sfdc.override=1
const describeSkip = describe.skip;
describeSkip('editor', () => {
    describe('saving', () => {
        it('translates the ui model to flow data', async () => {
            const editorComponent = createComponentUnderTest();
            await ticks(1);
            editorComponent.shadowRoot.querySelector(selectors.save).click();
            expect(translateUIModelToFlow.mock.calls).toHaveLength(1);
            expect(translateUIModelToFlow.mock.calls[0][0]).toEqual(Store.getStore().getCurrentState());
        });

        it('passes the translated value to fetch', async () => {
            const editorComponent = createComponentUnderTest();
            await ticks(1);
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

    describe('Server side fetch', () => {
        it('getting rules', async () => {
            createComponentUnderTest();
            await ticks(1);
            expect(fetch.mock.calls).toHaveLength(4);
            expect(fetch.mock.calls[0][0]).toEqual(SERVER_ACTION_TYPE.GET_RULES);
        });
        it('getting flow metadata', async () => {
            createComponentUnderTest({
                flowId: 'flow 123'
            });
            await ticks(1);
            expect(fetch.mock.calls).toHaveLength(5);
            expect(fetch.mock.calls[3][0]).toEqual(SERVER_ACTION_TYPE.GET_FLOW);
        });
        it('getting header urls', async () => {
            createComponentUnderTest();
            await ticks(1);
            expect(fetch.mock.calls).toHaveLength(4);
            expect(fetch.mock.calls[2][0]).toEqual(SERVER_ACTION_TYPE.GET_HEADER_URLS);
        });

        // TODO: W-5403092 Add test case for fetching of sObject variable fields
    });

    describe('Canvas', () => {
        it('Checks if node selection is handled correctly when an unselected node is clicked without multiSelect key', async () => {
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
            await ticks(1);
            const spy = Store.getStore().dispatch;
            expect(spy).toHaveBeenCalled();
            expect(spy.mock.calls[0][0]).toEqual(element('1', 'SELECT_ON_CANVAS'));
        });

        it('Checks if node selection is handled correctly when a selected node is clicked without multiSelect key', async () => {
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
            await ticks(1);
            const spy = Store.getStore().dispatch;
            expect(spy).toHaveBeenCalled();
            expect(spy.mock.calls[0][0]).toEqual(element('2', 'SELECT_ON_CANVAS'));
        });

        it('Checks if node selection is handled correctly when an unselected node is clicked with multiSelect key', async () => {
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
            await ticks(1);
            const spy = Store.getStore().dispatch;
            expect(spy).toHaveBeenCalled();
            expect(spy.mock.calls[0][0]).toEqual(element('1', 'TOGGLE_ON_CANVAS'));
        });

        it('Checks if node selection is handled correctly when a selected node is clicked with multiSelect key', async () => {
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
            await ticks(1);
            const spy = Store.getStore().dispatch;
            expect(spy).toHaveBeenCalled();
            expect(spy.mock.calls[0][0]).toEqual(element('2', 'TOGGLE_ON_CANVAS'));
        });

        it('Checks if node and connector deselection is handled correctly when a canvas is clicked', async () => {
            const editorComponent = createComponentUnderTest();
            const event = new CustomEvent(CANVAS_EVENT.CANVAS_MOUSEUP, {
                bubbles: true,
                composed: true,
                cancelable: true
            });
            editorComponent.shadowRoot.querySelector('builder_platform_interaction-canvas').dispatchEvent(event);
            await ticks(1);
            const spy = Store.getStore().dispatch;
            expect(spy).toHaveBeenCalled();
            expect(spy.mock.calls[0][0]).toEqual(deselectionAction);
        });

        it('Checks if connector selection is handled correctly when an unselected connector is clicked without multiSelect key', async () => {
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
            await ticks(1);
            const spy = Store.getStore().dispatch;
            expect(spy).toHaveBeenCalled();
            expect(spy.mock.calls[0][0]).toEqual(element('c1', 'SELECT_ON_CANVAS'));
        });

        it('Checks if connector selection is handled correctly when a selected connector is clicked without multiSelect key', async () => {
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
            await ticks(1);
            const spy = Store.getStore().dispatch;
            expect(spy).toHaveBeenCalled();
            expect(spy.mock.calls[0][0]).toEqual(element('c2', 'SELECT_ON_CANVAS'));
        });

        it('Checks if connector selection is handled correctly when an unselected connector is clicked with multiSelect key', async () => {
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
            await ticks(1);
            const spy = Store.getStore().dispatch;
            expect(spy).toHaveBeenCalled();
            expect(spy.mock.calls[0][0]).toEqual(element('c1', 'TOGGLE_ON_CANVAS'));
        });

        it('Checks if connector selection is handled correctly when a selected connector is clicked with multiSelect key', async () => {
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
            await ticks(1);
            const spy = Store.getStore().dispatch;
            expect(spy).toHaveBeenCalled();
            expect(spy.mock.calls[0][0]).toEqual(element('c2', 'TOGGLE_ON_CANVAS'));
        });

        describe('delete of a single element', () => {
            it('deletes associated connectors and updates associated nodes', async () => {
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
                await ticks(1);
                const spy = Store.getStore().dispatch;
                expect(spy).toHaveBeenCalled();
                expect(spy.mock.calls[0][0]).toEqual(deleteElementByGuid);
            });

            it('decision with outcomes deletes associated connectors and updates associated nodes', async () => {
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
                await ticks(1);
                const spy = Store.getStore().dispatch;
                expect(spy).toHaveBeenCalled();
                expect(spy.mock.calls[0][0]).toEqual(deleteDecision);
            });
        });

        it('Checks if node and connector deletion is handled correctly when delete key is pressed', async () => {
            const editorComponent = createComponentUnderTest();
            const event = new CustomEvent(CANVAS_EVENT.DELETE_ON_CANVAS, {
                bubbles: true,
                composed: true,
                cancelable: true,
                detail: {}
            });
            editorComponent.shadowRoot.querySelector('builder_platform_interaction-canvas').dispatchEvent(event);
            await ticks(1);
            const spy = Store.getStore().dispatch;
            expect(spy).toHaveBeenCalled();
            expect(spy.mock.calls[0][0]).toEqual(deleteElementByIsSelected);
        });

        it('Checks if node location is updated correctly when a node stops dragging', async () => {
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
            await ticks(1);
            const spy = Store.getStore().dispatch;
            expect(spy).toHaveBeenCalled();
            expect(spy.mock.calls[0][0]).toEqual(updateElementAction);
        });

        it('Checks if connections are added correctly', async () => {
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
            await ticks(1);
            const spy = Store.getStore().dispatch;
            expect(spy).toHaveBeenCalled();
            expect(spy.mock.calls[0][0]).toEqual(connectorElement);
        });
    });
});

describe('toolbar', () => {
    describe('showCanvasModeToggle', () => {
        it('is not shown if isAutoLayoutCanvasOnly', async () => {
            mockIsAutolayoutCanvas = true;

            const editorComponent = createComponentUnderTest();

            const toolbar = editorComponent.shadowRoot.querySelector(selectors.toolbar);
            const canvasToggle = toolbar.shadowRoot.querySelector(selectors.canvasToggle);

            expect(canvasToggle).toBeNull();

            mockIsAutolayoutCanvas = false;
        });
        it('is shown if not isAutoLayoutCanvasOnly', async () => {
            const editorComponent = createComponentUnderTest();

            const toolbar = editorComponent.shadowRoot.querySelector(selectors.toolbar);
            const canvasToggle = toolbar.shadowRoot.querySelector(selectors.canvasToggle);
            expect(canvasToggle).toBeTruthy();
        });
    });
});

describe('property editor', () => {
    it('is opened in a modal by default', async () => {
        expect.assertions(1);

        const editorComponent = createComponentUnderTest();

        const editElementEvent = new EditElementEvent('1');
        const canvasContainer = editorComponent.shadowRoot.querySelector(selectors.canvasContainer);
        canvasContainer.dispatchEvent(editElementEvent);

        await ticks();
        expect(invokePropertyEditor).toHaveBeenCalledWith(PROPERTY_EDITOR, {
            mode: 'editelement',
            node: getElementForPropertyEditor(mockStoreState.elements['1']),
            nodeUpdate: expect.anything(),
            newResourceCallback: expect.anything(),
            processType: undefined,
            panelConfig: undefined
        });
    });

    it('is opened in the right panel when builderConfig.usePanelForPropertyEditor = true', async () => {
        expect.assertions(1);

        mockStoreState.properties.processType = 'right';

        const editorComponent = createComponentUnderTest({
            builderType: 'new',
            builderConfig: { supportedProcessTypes: ['right'], usePanelForPropertyEditor: true }
        });

        const editElementEvent = new EditElementEvent('1');
        const canvasContainer = editorComponent.shadowRoot.querySelector(selectors.canvasContainer);
        canvasContainer.dispatchEvent(editElementEvent);

        await ticks(1);
        const rightPanel = editorComponent.shadowRoot.querySelector(selectors.rightPanel);
        expect(rightPanel).not.toBeNull();
    });

    it('for new resource is always opened in a modal', async () => {
        expect.assertions(1);

        mockStoreState.properties.processType = 'right';

        const editorComponent = createComponentUnderTest({
            builderType: 'new',
            builderMode: 'editMode',
            builderConfig: {
                supportedProcessTypes: ['right'],
                usePanelForPropertyEditor: true,
                componentConfigs: { editMode: { leftPanelConfig: { showLeftPanel: true } } }
            }
        });

        const event = new NewResourceEvent();

        await ticks(1);
        editorComponent.shadowRoot.querySelector('builder_platform_interaction-left-panel').dispatchEvent(event);

        await ticks(1);

        expect(invokePropertyEditor).toHaveBeenCalledWith(PROPERTY_EDITOR, {
            mode: 'addnewresource',
            nodeUpdate: expect.anything()
        });
    });

    it('for edit resource is always opened in a modal', async () => {
        expect.assertions(1);

        mockStoreState.properties.processType = 'right';

        const editorComponent = createComponentUnderTest({
            builderType: 'new',
            builderMode: 'editMode',
            builderConfig: {
                supportedProcessTypes: ['right'],
                usePanelForPropertyEditor: true,
                componentConfigs: { editMode: { leftPanelConfig: { showLeftPanel: true } } }
            }
        });

        const event = new EditElementEvent('1', EditElementEvent.EVENT_NAME, ELEMENT_TYPE.CONSTANT);

        await ticks(1);
        editorComponent.shadowRoot.querySelector('builder_platform_interaction-left-panel').dispatchEvent(event);

        await ticks(1);

        expect(invokePropertyEditor).toHaveBeenCalledWith(
            PROPERTY_EDITOR,
            expect.objectContaining({
                mode: 'editelement',
                node: mockStoreState.elements['1'],
                nodeUpdate: expect.anything(),
                newResourceCallback: expect.anything()
            })
        );
    });

    describe('in modal', () => {
        it('addelement nodeUpdate dispatches addElement to store', async () => {
            expect.assertions(5);

            const editorComponent = createComponentUnderTest();

            const addElementEvent = new AddElementEvent('ASSIGNMENT');
            editorComponent.shadowRoot
                .querySelector('builder_platform_interaction-left-panel')
                .dispatchEvent(addElementEvent);

            await ticks();

            // Confirm that the element is *NOT* added upon the initial event
            expect(addElement).not.toHaveBeenCalledWith();
            expect(Store.getStore().dispatch).not.toHaveBeenCalled();

            const elementToAdd = { a: 1 };

            const nodeUpdate = invokePropertyEditor.mock.calls[0][1].nodeUpdate;
            nodeUpdate(elementToAdd);

            // element is only added after nodeUpdate is called (modal closed)
            expect(getElementForStore).toHaveBeenCalledWith(elementToAdd);
            expect(addElement).toHaveBeenCalledWith(elementToAdd);
            expect(Store.getStore().dispatch).toHaveBeenCalledWith({
                value: elementToAdd
            });
        });
        // W-7682849: Fix for duplicating elements on canvas causes property editor modal to open automatically
        it("doesn't open the property editor modal for new element on duplication", async () => {
            expect.assertions(1);

            const editorComponent = createComponentUnderTest();

            const addElementEvent = new AddElementEvent('ASSIGNMENT');
            editorComponent.shadowRoot
                .querySelector('builder_platform_interaction-left-panel')
                .dispatchEvent(addElementEvent);

            await ticks();

            const toolbar = editorComponent.shadowRoot.querySelector('builder_platform_interaction-toolbar');

            const duplicateEvent = new DuplicateEvent();
            toolbar.dispatchEvent(duplicateEvent);

            await ticks(1);
            expect(invokePropertyEditor).toHaveBeenCalledTimes(1);
        });
    });

    describe('in right panel', () => {
        let editorComponent;
        let rightPanel;

        beforeEach(async () => {
            mockStoreState.properties.processType = 'right';

            editorComponent = createComponentUnderTest({
                builderType: 'new',
                builderConfig: { supportedProcessTypes: ['right'], usePanelForPropertyEditor: true }
            });

            const editElementEvent = new EditElementEvent('1');
            const canvasContainer = editorComponent.shadowRoot.querySelector(selectors.canvasContainer);
            canvasContainer.dispatchEvent(editElementEvent);

            await ticks();
            rightPanel = editorComponent.shadowRoot.querySelector(selectors.rightPanel);
        });

        it('closepropertyeditorevent closes the property editor', async () => {
            expect.assertions(2);
            expect(rightPanel).not.toBeNull();

            const event = new ClosePropertyEditorEvent();

            await ticks(2);
            rightPanel.dispatchEvent(event);

            await ticks(1);
            rightPanel = editorComponent.shadowRoot.querySelector(selectors.rightPanel);

            expect(rightPanel).toBeNull();
        });

        it('addnodeevent dispatches addElement to the store', async () => {
            expect.assertions(4);
            expect(rightPanel).not.toBeNull();

            const elementToAdd = { a: 1 };
            const event = new AddNodeEvent(elementToAdd);

            await ticks(1);
            rightPanel.dispatchEvent(event);

            expect(getElementForStore).toHaveBeenCalledWith(elementToAdd);
            expect(addElement).toHaveBeenCalledWith(elementToAdd);
            expect(Store.getStore().dispatch).toHaveBeenCalledWith({
                value: elementToAdd
            });
        });

        it('addnodeevent for child element dispatches addElement with parentGuid', async () => {
            expect.assertions(4);
            expect(rightPanel).not.toBeNull();

            const payload = {
                elementType: 'foo',
                parent: 'p',
                element: { a: 1 }
            };
            const event = new AddNodeEvent(payload);

            await ticks(1);
            rightPanel.dispatchEvent(event);

            expect(getElementForStore).toHaveBeenCalledWith(payload);
            expect(addElement).toHaveBeenCalledWith(payload);
            expect(Store.getStore().dispatch).toHaveBeenCalledWith({
                value: payload
            });
        });
        it('updatenodeevent dispatches updateElement to the store', async () => {
            expect.assertions(4);
            expect(rightPanel).not.toBeNull();

            const elementToUpdate = { a: 1 };
            const event = new UpdateNodeEvent(elementToUpdate);

            await ticks(1);
            rightPanel.dispatchEvent(event);

            expect(getElementForStore).toHaveBeenCalledWith(elementToUpdate);
            expect(updateElement).toHaveBeenCalledWith(elementToUpdate);
            expect(Store.getStore().dispatch).toHaveBeenCalledWith({
                updateValue: elementToUpdate
            });
        });

        it('closes the property editor when element is deleted', async () => {
            expect.assertions(2);
            expect(rightPanel).not.toBeNull();

            const event = new DeleteElementEvent(['1'], 'ASSIGNMENT');
            const canvasContainer = editorComponent.shadowRoot.querySelector(selectors.canvasContainer);

            // make sure mockStoreState matches expected state
            mockStoreState.connectors = mockStoreState.connectors.filter(
                (conn) => conn.target !== '1' && conn.source !== '1'
            );
            mockStoreState.canvasElements = mockStoreState.canvasElements.filter((el) => el !== '1');
            delete mockStoreState.elements['1'];

            canvasContainer.dispatchEvent(event);

            await ticks(1);
            rightPanel = editorComponent.shadowRoot.querySelector(selectors.rightPanel);
            expect(rightPanel).toBeNull();
        });

        it('closes the property editor when multiselect is activated', async () => {
            expect.assertions(2);
            expect(rightPanel).not.toBeNull();

            const event = new ToggleMarqueeOnEvent();
            const canvasContainer = editorComponent.shadowRoot.querySelector(selectors.canvasContainer);
            canvasContainer.dispatchEvent(event);

            await ticks(1);
            rightPanel = editorComponent.shadowRoot.querySelector(selectors.rightPanel);
            expect(rightPanel).toBeNull();
        });

        it('closes property editor panel when canvas fire close property editor event', async () => {
            expect.assertions(2);
            expect(rightPanel).not.toBeNull();

            const event = new ClosePropertyEditorEvent();
            const canvasContainer = editorComponent.shadowRoot.querySelector(selectors.canvasContainer);
            canvasContainer.dispatchEvent(event);

            await ticks(1);
            rightPanel = editorComponent.shadowRoot.querySelector(selectors.rightPanel);
            expect(rightPanel).toBeNull();
        });

        it('SelectNodeEvent from node not selected closes the property editor', async () => {
            expect.assertions(2);
            expect(rightPanel).not.toBeNull();

            const event = new SelectNodeEvent('1', false, false);
            const canvasContainer = editorComponent.shadowRoot.querySelector(selectors.canvasContainer);
            canvasContainer.dispatchEvent(event);

            await ticks(1);
            rightPanel = editorComponent.shadowRoot.querySelector(selectors.rightPanel);
            expect(rightPanel).toBeNull();
        });

        it('SelectNodeEvent from node already selected does not close the property editor', async () => {
            expect.assertions(2);
            expect(rightPanel).not.toBeNull();

            const event = new SelectNodeEvent('2', false, true);
            const canvasContainer = editorComponent.shadowRoot.querySelector(selectors.canvasContainer);
            canvasContainer.dispatchEvent(event);

            await ticks(1);
            rightPanel = editorComponent.shadowRoot.querySelector(selectors.rightPanel);
            const propertyEditorPanel = rightPanel.querySelector('builder_platform_interaction-property-editor-panel');
            expect(propertyEditorPanel.element.guid).toEqual('1');
        });

        it('opens the property editor panel for new element on duplication', async () => {
            expect.assertions(3);
            expect(rightPanel).not.toBeNull();

            generateGuid.mockReturnValue('5');

            const closePropertyEditorEvent = new ClosePropertyEditorEvent();
            const toolbar = editorComponent.shadowRoot.querySelector('builder_platform_interaction-toolbar');
            toolbar.dispatchEvent(closePropertyEditorEvent);

            await ticks(1);
            rightPanel = editorComponent.shadowRoot.querySelector(selectors.rightPanel);
            expect(rightPanel).toBeNull();

            const duplicateEvent = new DuplicateEvent();
            toolbar.dispatchEvent(duplicateEvent);

            await ticks(1);
            rightPanel = editorComponent.shadowRoot.querySelector(selectors.rightPanel);
            const propertyEditorPanel = rightPanel.querySelector('builder_platform_interaction-property-editor-panel');
            expect(propertyEditorPanel.element.guid).toEqual('5');
        });

        it('receives updates from store when other subsystems make changes', async () => {
            expect.assertions(3);
            expect(rightPanel).not.toBeNull();

            const editElementEvent = new EditElementEvent('1');
            const canvasContainer = editorComponent.shadowRoot.querySelector(selectors.canvasContainer);
            canvasContainer.dispatchEvent(editElementEvent);

            const storeInstance = Store.getStore();

            const newX = 50;
            const newY = 75;

            const payload = [
                {
                    canvasElementGuid: 1,
                    locationX: newX,
                    locationY: newY
                }
            ];

            mockStoreState.elements['1'].locationX = newX;
            mockStoreState.elements['1'].locationY = newY;

            storeInstance.dispatch(updateCanvasElementLocation(payload));

            await ticks(1);

            const propertyEditorPanel = editorComponent.shadowRoot.querySelector(selectors.propertyEditorPanel);

            expect(propertyEditorPanel.element.locationX).toEqual(newX);
            expect(propertyEditorPanel.element.locationY).toEqual(newY);
        });

        it('Panel Config isLabelCollapsibleToHeader is set to true', async () => {
            expect.assertions(2);
            expect(rightPanel).not.toBeNull();

            const editElementEvent = new EditElementEvent('1');
            const canvasContainer = editorComponent.shadowRoot.querySelector(selectors.canvasContainer);
            canvasContainer.dispatchEvent(editElementEvent);

            await ticks(1);

            const propertyEditorPanel = editorComponent.shadowRoot.querySelector(selectors.propertyEditorPanel);
            expect(propertyEditorPanel.params.panelConfig.isLabelCollapsibleToHeader).toEqual(true);
        });
        it('Panel Config isFieldLevelCommitEnabled is set to true', async () => {
            expect.assertions(1);

            const editElementEvent = new EditElementEvent('1');
            const canvasContainer = editorComponent.shadowRoot.querySelector(selectors.canvasContainer);
            canvasContainer.dispatchEvent(editElementEvent);

            await ticks(1);

            const propertyEditorPanel = editorComponent.shadowRoot.querySelector(selectors.propertyEditorPanel);
            expect(propertyEditorPanel.params.panelConfig.isFieldLevelCommitEnabled).toEqual(true);
        });
    });
});

describeSkip('auto-layout', () => {
    describe('use auto layout canvas', () => {
        beforeAll(() => {
            mockStoreState.properties.isAutoLayoutCanvas = true;
        });

        afterAll(() => {
            mockStoreState.properties.isAutoLayoutCanvas = true;
        });

        describe('in right panel', () => {
            let editorComponent;
            let rightPanel;

            beforeEach(async () => {
                mockStoreState.properties.isAutoLayoutCanvas = true;
                mockStoreState.properties.processType = 'right';

                editorComponent = createComponentUnderTest({
                    builderType: 'new',
                    builderConfig: { supportedProcessTypes: ['right'], usePanelForPropertyEditor: true }
                });

                const editElementEvent = new EditElementEvent('1');
                const flcBuilderContainer = editorComponent.shadowRoot.querySelector(selectors.flcBuilderContainer);
                flcBuilderContainer.dispatchEvent(editElementEvent);

                await ticks(1);
                rightPanel = editorComponent.shadowRoot.querySelector(selectors.rightPanel);
            });

            it('closes the property editor when flcBuilder fire close property editor event', async () => {
                expect.assertions(2);
                expect(rightPanel).not.toBeNull();

                const event = new ClosePropertyEditorEvent();
                const flcBuilderContainer = editorComponent.shadowRoot.querySelector(selectors.flcBuilderContainer);
                flcBuilderContainer.dispatchEvent(event);

                await ticks(1);
                rightPanel = editorComponent.shadowRoot.querySelector(selectors.rightPanel);
                expect(rightPanel).toBeNull();
            });

            it('closes the property editor on when toolbar fires toggle selection mode event', async () => {
                expect.assertions(2);
                expect(rightPanel).not.toBeNull();

                const event = new ToggleSelectionModeEvent();
                const toolbar = editorComponent.shadowRoot.querySelector('builder_platform_interaction-toolbar');
                toolbar.dispatchEvent(event);

                await ticks(1);
                rightPanel = editorComponent.shadowRoot.querySelector(selectors.rightPanel);
                expect(rightPanel).toBeNull();
            });

            it('closes and reopens the property editor when another element is clicked', async () => {
                // TODO: Right now the property editor closing and opening seems to happen in one tick,
                // and thus the close never actually happens
                // Need to refactor the test to make sure the property editor panel closes before
                // it opens for new element when the following story is being implemented
                // https://gus.lightning.force.com/lightning/r/ADM_Work__c/a07B00000078hChIAI/view

                expect.assertions(2);
                expect(rightPanel).not.toBeNull();

                const event = new SelectNodeEvent('5', undefined, false);
                const flcBuilderContainer = editorComponent.shadowRoot.querySelector(selectors.flcBuilderContainer);
                flcBuilderContainer.dispatchEvent(event);

                await ticks(1);
                rightPanel = editorComponent.shadowRoot.querySelector(selectors.rightPanel);
                const propertyEditorPanel = rightPanel.querySelector(
                    'builder_platform_interaction-property-editor-panel'
                );
                expect(propertyEditorPanel.element.guid).toEqual('5');
            });

            it('should not close the property editor when currently selected element is clicked', async () => {
                expect.assertions(2);
                expect(rightPanel).not.toBeNull();

                const event = new SelectNodeEvent('5', undefined, true);
                const flcBuilderContainer = editorComponent.shadowRoot.querySelector(selectors.flcBuilderContainer);
                flcBuilderContainer.dispatchEvent(event);

                await ticks(1);
                rightPanel = editorComponent.shadowRoot.querySelector(selectors.rightPanel);
                const propertyEditorPanel = rightPanel.querySelector(
                    'builder_platform_interaction-property-editor-panel'
                );
                expect(propertyEditorPanel.element.guid).toEqual('1');
            });
        });
    });
});

describe('editor guardrails', () => {
    let storeInstance;
    const guardrailResult = jest.fn();
    const FLOW_ID = 'flowId';

    beforeEach(() => {
        jest.clearAllMocks();
        storeInstance = Store.getStore();

        const flow = { fullName: FLOW_ID };
        translateUIModelToFlow.mockReturnValue(flow);

        isGuardrailsEnabled.mockReturnValue(true);
    });

    const setupGuardrails = function (running, mockResult = []) {
        const editorComponent = createComponentUnderTest({
            guardrailsParams: {
                running
            }
        });

        const results = new Map();
        results.set(FLOW_ID, mockResult);
        mockEngineExecute.mockReturnValue({ results });

        return editorComponent;
    };

    it('guardrails disabled', async () => {
        expect.assertions(1);

        isGuardrailsEnabled.mockReturnValue(false);
        setupGuardrails(true);

        storeInstance.dispatch({
            type: 'actionThatTriggerGuardrails'
        });

        await ticks(2);
        await ticks(1);
        expect(guardrailResult).toHaveBeenCalledTimes(0);
    });

    it('guardrails enabled but not running', async () => {
        expect.assertions(1);

        setupGuardrails(false);

        storeInstance.dispatch({
            type: 'actionThatTriggerGuardrails'
        });

        await ticks(2);
        await ticks(1);
        expect(guardrailResult).toHaveBeenCalledTimes(0);
    });

    it('guardrails running - no result', async () => {
        expect.assertions(2);

        const editorComponent = setupGuardrails(true, []);

        await ticks(2);
        editorComponent.addEventListener('guardrailresult', guardrailResult);
        storeInstance.dispatch({
            type: 'actionThatTriggerGuardrails'
        });

        await ticks(1);
        expect(guardrailResult).toHaveBeenCalledTimes(1);
        const actualResult = guardrailResult.mock.calls[0][0].detail.guardrailsResult;
        expect(actualResult.results.get(FLOW_ID)).toEqual([]);
    });

    it('guardrails running - result', async () => {
        expect.assertions(2);

        const mockResult = [{ data: 'result1' }, { data: 'result2' }];
        const editorComponent = setupGuardrails(true, mockResult);

        await ticks(2);
        editorComponent.addEventListener('guardrailresult', guardrailResult);
        storeInstance.dispatch({
            type: 'actionThatTriggerGuardrails'
        });

        await ticks(1);
        expect(guardrailResult).toHaveBeenCalledTimes(1);
        const actualResult = guardrailResult.mock.calls[0][0].detail.guardrailsResult;
        expect(actualResult.results.get(FLOW_ID)).toEqual([{ data: 'result1' }, { data: 'result2' }]);
    });

    it('guardrails unmuted - no result', async () => {
        expect.assertions(2);

        const editorComponent = setupGuardrails(false, []);

        await ticks(2);
        editorComponent.addEventListener('guardrailresult', guardrailResult);
        editorComponent.guardrailsParams = { running: true };

        await ticks(2);
        expect(guardrailResult).toHaveBeenCalledTimes(1);
        const actualResult = guardrailResult.mock.calls[0][0].detail.guardrailsResult;
        expect(actualResult.results.get(FLOW_ID)).toEqual([]);
    });

    it('guardrails unmuted - result', async () => {
        expect.assertions(2);

        const mockResult = [{ data: 'result1' }, { data: 'result2' }];
        const editorComponent = setupGuardrails(false, mockResult);

        await ticks(2);
        editorComponent.addEventListener('guardrailresult', guardrailResult);
        editorComponent.guardrailsParams = { running: true };

        await ticks(1);
        expect(guardrailResult).toHaveBeenCalledTimes(1);
        const actualResult = guardrailResult.mock.calls[0][0].detail.guardrailsResult;
        expect(actualResult.results.get(FLOW_ID)).toEqual([{ data: 'result1' }, { data: 'result2' }]);
    });
});
describe('in edit mode', () => {
    it('left panel is displayed', async () => {
        expect.assertions(1);
        const editorComponent = createComponentUnderTest({
            builderType: 'new',
            builderConfig: {
                supportedProcessTypes: ['right'],
                componentConfigs: { [BUILDER_MODE.EDIT_MODE]: { leftPanelConfig: { showLeftPanel: true } } }
            }
        });
        editorComponent.setBuilderMode(BUILDER_MODE.EDIT_MODE);
        await ticks(1);

        const leftPanel = editorComponent.shadowRoot.querySelector(selectors.leftPanel);
        expect(leftPanel).not.toBeNull();
    });
    it('right panel is hidden', async () => {
        expect.assertions(1);
        const editorComponent = createComponentUnderTest({
            builderType: 'new',
            builderConfig: {
                supportedProcessTypes: ['right'],
                componentConfigs: { [BUILDER_MODE.EDIT_MODE]: { rightPanelConfig: { showDebugPanel: false } } }
            }
        });
        editorComponent.setBuilderMode(BUILDER_MODE.EDIT_MODE);
        await ticks(1);

        const rightPanel = editorComponent.shadowRoot.querySelector(selectors.rightPanel);
        expect(rightPanel).toBeNull();
    });
});
describe('in debug mode', () => {
    it('left panel is hidden', async () => {
        expect.assertions(1);
        const editorComponent = createComponentUnderTest({
            builderType: 'new',
            builderConfig: {
                supportedProcessTypes: ['right'],
                componentConfigs: { [BUILDER_MODE.DEBUG_MODE]: { leftPanelConfig: { showLeftPanel: false } } }
            }
        });
        editorComponent.setBuilderMode(BUILDER_MODE.DEBUG_MODE);
        await ticks(1);

        const leftPanel = editorComponent.shadowRoot.querySelector(selectors.leftPanel);
        expect(leftPanel).toBeNull();
    });
    it('right panel panel is displayed', async () => {
        expect.assertions(2);
        const editorComponent = createComponentUnderTest({
            builderType: 'new',
            builderMode: 'debugMode',
            builderConfig: {
                supportedProcessTypes: ['right'],
                componentConfigs: { [BUILDER_MODE.DEBUG_MODE]: { rightPanelConfig: { showDebugPanel: true } } }
            }
        });
        editorComponent.setBuilderMode(BUILDER_MODE.DEBUG_MODE);
        await ticks(1);

        const rightPanel = editorComponent.shadowRoot.querySelector(selectors.rightPanel);
        expect(rightPanel).not.toBeNull();
        const debugPanel = editorComponent.shadowRoot.querySelector(selectors.debugPanel);
        expect(debugPanel).not.toBeNull();
    });
    it('debug toast event is fired on clicking done in property editor', async () => {
        expect.assertions(1);
        const debugToast = jest.fn();
        const editorComponent = createComponentUnderTest();
        editorComponent.setBuilderMode(BUILDER_MODE.DEBUG_MODE);
        await ticks(1);
        const editElementEvent = new EditElementEvent('1');
        const canvasContainer = editorComponent.shadowRoot.querySelector(selectors.canvasContainer);
        canvasContainer.dispatchEvent(editElementEvent);
        editorComponent.addEventListener('debugtoastevent', debugToast);
        await ticks(1);

        const elementToAdd = {
            a: 1,
            elementType: ELEMENT_TYPE.RECORD_LOOKUP,
            label: {
                value: 'ABC'
            }
        };

        const nodeUpdate = invokePropertyEditor.mock.calls[0][1].nodeUpdate;
        nodeUpdate(elementToAdd);
        expect(debugToast).toHaveBeenCalledTimes(1);
    });
    it('debug toast event is fired correctly on clicking done in property editor for elements with no label like Start', async () => {
        expect.assertions(1);
        const debugToast = jest.fn();
        const editorComponent = createComponentUnderTest();
        editorComponent.setBuilderMode(BUILDER_MODE.DEBUG_MODE);
        await ticks(1);
        const editElementEvent = new EditElementEvent('1');
        const canvasContainer = editorComponent.shadowRoot.querySelector(selectors.canvasContainer);
        canvasContainer.dispatchEvent(editElementEvent);
        editorComponent.addEventListener('debugtoastevent', debugToast);
        await ticks(1);

        const elementToAdd = {
            a: 1,
            elementType: ELEMENT_TYPE.START_ELEMENT
        };

        const nodeUpdate = invokePropertyEditor.mock.calls[0][1].nodeUpdate;
        nodeUpdate(elementToAdd);
        expect(debugToast).toHaveBeenCalledTimes(1);
    });
    it('no debug toast event is fired on clicking done in property editor in edit mode', async () => {
        expect.assertions(1);
        const debugToast = jest.fn();
        const editorComponent = createComponentUnderTest();
        const editElementEvent = new EditElementEvent('1');
        const canvasContainer = editorComponent.shadowRoot.querySelector(selectors.canvasContainer);
        canvasContainer.dispatchEvent(editElementEvent);
        editorComponent.addEventListener('debugtoastevent', debugToast);
        await ticks(1);

        const elementToAdd = {
            a: 1,
            elementType: ELEMENT_TYPE.RECORD_LOOKUP,
            label: {
                value: 'ABC'
            }
        };

        const nodeUpdate = invokePropertyEditor.mock.calls[0][1].nodeUpdate;
        nodeUpdate(elementToAdd);
        expect(debugToast).not.toHaveBeenCalled();
    });
    describe('save during debug', () => {
        let editorComponent;

        beforeEach(async () => {
            editorComponent = createComponentUnderTest({
                flowId: '301RM0000000E4N',
                builderType: 'new',
                builderMode: 'debugMode',
                builderConfig: {
                    supportedProcessTypes: ['right'],
                    componentConfigs: { [BUILDER_MODE.DEBUG_MODE]: { rightPanelConfig: { showDebugPanel: true } } }
                }
            });
            editorComponent.setBuilderMode(BUILDER_MODE.DEBUG_MODE);
            await ticks(1);

            const editElementEvent = new EditElementEvent('1');
            const canvasContainer = editorComponent.shadowRoot.querySelector(selectors.canvasContainer);
            canvasContainer.dispatchEvent(editElementEvent);
            await ticks();

            expect(editorComponent.blockDebugResume).toBeFalsy();
        });

        it('resume during debug mode will be blocked if there is saved change', async () => {
            const toolbar = editorComponent.shadowRoot.querySelector(selectors.toolbar);
            const save = toolbar.shadowRoot.querySelector(selectors.save);
            save.click();

            expect(editorComponent.blockDebugResume).toBeTruthy();
        });

        it('resume during debug mode will be released if save fails', async () => {
            const flow = { fullName: 'FAIL' };
            translateUIModelToFlow.mockReturnValue(flow);

            const toolbar = editorComponent.shadowRoot.querySelector(selectors.toolbar);
            const save = toolbar.shadowRoot.querySelector(selectors.save);
            save.click();

            expect(editorComponent.blockDebugResume).toBeFalsy();
        });

        it('resume during debug mode will be released if save has error', async () => {
            const flow = { fullName: 'ERROR' };
            translateUIModelToFlow.mockReturnValue(flow);

            const toolbar = editorComponent.shadowRoot.querySelector(selectors.toolbar);
            const save = toolbar.shadowRoot.querySelector(selectors.save);
            save.click();

            expect(editorComponent.blockDebugResume).toBeFalsy();
        });
    });
});
