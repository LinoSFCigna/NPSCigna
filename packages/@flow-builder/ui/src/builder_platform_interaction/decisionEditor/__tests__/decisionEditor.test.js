import { createElement } from 'lwc';
import DecisionEditor from 'builder_platform_interaction/decisionEditor';
import { decisionReducer } from '../decisionReducer';
import { DeleteOutcomeEvent, PropertyChangedEvent } from 'builder_platform_interaction/events';

const mockNewState = {
    label: { value: 'New Decision' },
    name: { value: 'New Dec Dev Name' },
    guid: { value: 'decision99' },
    defaultConnectorLabel: { value: 'foo' },
    outcomes: [
        {
            guid: 'outcome 3',
            label: { value: '' },
            name: { value: '' },
            conditionLogic: { value: '' },
            conditions: []
        }
    ]
};

const DEFAULT_OUTCOME_ID = 'defaultOutcome';

jest.mock('../decisionReducer', () => {
    return {
        decisionReducer: jest.fn(() => {
            return mockNewState;
        }),
        resetDeletedGuids: require.requireActual('../decisionReducer').resetDeletedGuids
    };
});

jest.mock('builder_platform_interaction/dataMutationLib', () => {
    const actual = require.requireActual('builder_platform_interaction/dataMutationLib');
    return {
        pick: actual.pick,
        getErrorsFromHydratedElement: jest.fn(() => {
            return ['some error'];
        }),
        updateProperties: actual.updateProperties
    };
});

const SELECTORS = {
    OUTCOME: 'builder_platform_interaction-outcome',
    REORDERABLE_NAV: 'builder_platform_interaction-reorderable-vertical-navigation',
    DEFAULT_OUTCOME: 'builder_platform_interaction-label-description.defaultOutcome'
};

let decisionWithOneOutcome;
let decisionWithTwoOutcomes;

beforeEach(() => {
    decisionWithOneOutcome = {
        label: { value: 'Test Name of the Decision' },
        name: { value: 'Test Dev Name' },
        guid: { value: 'decision2' },
        outcomes: [
            {
                guid: 'outcome1',
                label: { value: '' },
                conditionLogic: { value: '' },
                conditions: []
            }
        ]
    };

    decisionWithTwoOutcomes = {
        label: { value: 'Test Name of the Decision' },
        name: { value: 'Test Dev Name' },
        guid: { value: 'decision1' },
        outcomes: [
            {
                guid: 'outcome1',
                label: { value: '' },
                conditionLogic: { value: '' },
                conditions: []
            },
            {
                guid: 'outcome2',
                label: { value: '' },
                conditionLogic: { value: '' },
                conditions: []
            }
        ]
    };
});

const createComponentForTest = node => {
    const el = createElement('builder_platform_interaction-decision-editor', {
        is: DecisionEditor
    });

    el.node = node;

    document.body.appendChild(el);

    return el;
};

describe('Decision Editor', () => {
    describe('handleDeleteOutcome', () => {
        it('calls the reducer with the passed in action', () => {
            const decisionEditor = createComponentForTest(decisionWithTwoOutcomes);
            return Promise.resolve().then(() => {
                const deleteOutcomeEvent = new DeleteOutcomeEvent('outcomeGuid');

                const outcome = decisionEditor.shadowRoot.querySelector(SELECTORS.OUTCOME);
                outcome.dispatchEvent(deleteOutcomeEvent);

                expect(decisionEditor.node).toEqual(mockNewState);
            });
        });

        it('sets the first outcome as active', () => {
            const decisionEditor = createComponentForTest(decisionWithTwoOutcomes);

            return Promise.resolve()
                .then(() => {
                    const deleteOutcomeEvent = new DeleteOutcomeEvent('outcome1');

                    const outcomeElement = decisionEditor.shadowRoot.querySelector(SELECTORS.OUTCOME);
                    outcomeElement.dispatchEvent(deleteOutcomeEvent);
                })
                .then(() => {
                    const outcomeElement = decisionEditor.shadowRoot.querySelector(SELECTORS.OUTCOME);
                    expect(outcomeElement.outcome).toEqual(mockNewState.outcomes[0]);
                });
        });

        it('does not change the active outcome if the outcome was not deleted', () => {
            const decisionEditor = createComponentForTest(decisionWithTwoOutcomes);
            const reorderableOutcomeNav = decisionEditor.shadowRoot.querySelector(SELECTORS.REORDERABLE_NAV);
            reorderableOutcomeNav.dispatchEvent(
                new CustomEvent('itemselected', {
                    detail: { itemId: 'outcome2' }
                })
            );

            return Promise.resolve()
                .then(() => {
                    decisionReducer.mockReturnValueOnce(decisionWithTwoOutcomes);
                    const deleteOutcomeEvent = new DeleteOutcomeEvent('outcome1');

                    const outcomeElement = decisionEditor.shadowRoot.querySelector(SELECTORS.OUTCOME);
                    outcomeElement.dispatchEvent(deleteOutcomeEvent);
                })
                .then(() => {
                    const outcomeElement = decisionEditor.shadowRoot.querySelector(SELECTORS.OUTCOME);
                    expect(outcomeElement.outcome).toEqual(decisionWithTwoOutcomes.outcomes[1]);
                });
        });
    });

    describe('showDeleteOutcome', () => {
        it('is true when more than one outcome is present', () => {
            const decisionEditor = createComponentForTest(decisionWithTwoOutcomes);

            return Promise.resolve().then(() => {
                const outcomeElement = decisionEditor.shadowRoot.querySelector(SELECTORS.OUTCOME);
                expect(outcomeElement.showDelete).toBe(true);
            });
        });
        it('is false when only one outcome is present', () => {
            const decisionEditor = createComponentForTest(decisionWithOneOutcome);

            return Promise.resolve().then(() => {
                const outcomeElement = decisionEditor.shadowRoot.querySelector(SELECTORS.OUTCOME);
                expect(outcomeElement.showDelete).toBe(false);
            });
        });
    });

    describe('outcome menu', () => {
        describe('array of menu items', () => {
            it('contains all outcomes in order plus default at end', () => {
                const decisionEditor = createComponentForTest(decisionWithTwoOutcomes);

                return Promise.resolve().then(() => {
                    const reorderableOutcomeNav = decisionEditor.shadowRoot.querySelector(SELECTORS.REORDERABLE_NAV);
                    const menuItems = reorderableOutcomeNav.menuItems;

                    // menu includes the default
                    expect(menuItems).toHaveLength(3);
                    expect(menuItems[0].element).toEqual(decisionWithTwoOutcomes.outcomes[0]);
                    expect(menuItems[1].element).toEqual(decisionWithTwoOutcomes.outcomes[1]);
                    expect(menuItems[2]).toEqual({
                        element: {
                            guid: DEFAULT_OUTCOME_ID
                        },
                        label: 'FlowBuilderDecisionEditor.emptyDefaultOutcomeLabel',
                        isDraggable: false
                    });
                });
            });
            it('outcomes are draggable', () => {
                const decisionEditor = createComponentForTest(decisionWithTwoOutcomes);

                return Promise.resolve().then(() => {
                    const reorderableOutcomeNav = decisionEditor.shadowRoot.querySelector(SELECTORS.REORDERABLE_NAV);
                    const menuItems = reorderableOutcomeNav.menuItems;

                    expect(menuItems[0].isDraggable).toBeTruthy();
                    expect(menuItems[1].isDraggable).toBeTruthy();
                });
            });
            it('default outcome is not draggable', () => {
                const decisionEditor = createComponentForTest(decisionWithTwoOutcomes);

                return Promise.resolve().then(() => {
                    const reorderableOutcomeNav = decisionEditor.shadowRoot.querySelector(SELECTORS.REORDERABLE_NAV);
                    const menuItems = reorderableOutcomeNav.menuItems;

                    expect(menuItems[2].isDraggable).toBeFalsy();
                });
            });
            it('shows an error icon when there is an error in the outcome', () => {
                const decisionEditor = createComponentForTest(decisionWithTwoOutcomes);

                return Promise.resolve().then(() => {
                    const reorderableOutcomeNav = decisionEditor.shadowRoot.querySelector(SELECTORS.REORDERABLE_NAV);
                    const menuItems = reorderableOutcomeNav.menuItems;

                    // We mocked getErrorsFromHydratedElement to always return an error
                    // so all non-default outcomes will show the error
                    expect(menuItems[0].hasErrors).toBeTruthy();
                    expect(menuItems[1].hasErrors).toBeTruthy();
                });
            });
        });
    });

    describe('default outcome', () => {
        it('calls the reducer with the passed in action and a propertyName of defaultConnectorLabel', () => {
            const decisionEditor = createComponentForTest(decisionWithOneOutcome);
            // trigger showing of default outcome
            const reorderableOutcomeNav = decisionEditor.shadowRoot.querySelector(SELECTORS.REORDERABLE_NAV);
            reorderableOutcomeNav.dispatchEvent(
                new CustomEvent('itemselected', {
                    detail: { itemId: DEFAULT_OUTCOME_ID }
                })
            );

            return Promise.resolve().then(() => {
                const modifyDefaultOutcomeEvent = new PropertyChangedEvent('name', 'newValue');

                const defaultOutcome = decisionEditor.shadowRoot.querySelector(SELECTORS.DEFAULT_OUTCOME);

                defaultOutcome.dispatchEvent(modifyDefaultOutcomeEvent);

                const mockCallParams = decisionReducer.mock.calls[0];
                const decisionReducerEvent = mockCallParams[1];

                expect(mockCallParams[0]).toEqual(decisionWithOneOutcome);

                const expectedReducerEvent = {
                    type: 'propertychanged',
                    detail: {
                        propertyName: 'defaultConnectorLabel',
                        value: modifyDefaultOutcomeEvent.detail.value
                    }
                };

                expect(decisionReducerEvent.type).toEqual(expectedReducerEvent.type);
                expect(decisionReducerEvent.detail.propertyName).toEqual(expectedReducerEvent.detail.propertyName);
                expect(decisionReducerEvent.detail.value).toEqual(expectedReducerEvent.detail.value);
            });
        });
        it('initial default outcome does not have an error', () => {
            const decisionEditor = createComponentForTest(decisionWithOneOutcome);

            return Promise.resolve().then(() => {
                const reorderableOutcomeNav = decisionEditor.shadowRoot.querySelector(SELECTORS.REORDERABLE_NAV);
                const menuItems = reorderableOutcomeNav.menuItems;

                expect(menuItems[1].hasErrors).toBeFalsy();
            });
        });
        it('default outcome has an error if there is no label', () => {
            decisionWithOneOutcome.defaultConnectorLabel = {
                value: '',
                error: 'Label should not be empty'
            };
            const decisionEditor = createComponentForTest(decisionWithOneOutcome);

            return Promise.resolve().then(() => {
                const reorderableOutcomeNav = decisionEditor.shadowRoot.querySelector(SELECTORS.REORDERABLE_NAV);
                const menuItems = reorderableOutcomeNav.menuItems;

                expect(menuItems[1].hasErrors).toBeTruthy();
            });
        });
    });
});