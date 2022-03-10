// @ts-nocheck
import { CloseMenuEvent } from 'builder_platform_interaction/alcEvents';
import { NodeType } from 'builder_platform_interaction/autoLayoutCanvas';
import { createComponent, ticks } from 'builder_platform_interaction/builderTestUtils/commonTestUtils';
import { commands, keyboardInteractionUtils } from 'builder_platform_interaction/sharedUtils';

const { EscapeCommand } = commands;
const { Keys } = keyboardInteractionUtils;

let mockSupportsScheduledPaths = false;
jest.mock('builder_platform_interaction/elementFactory', () => {
    return {
        shouldSupportScheduledPaths: () => mockSupportsScheduledPaths
    };
});

jest.mock('builder_platform_interaction/sharedUtils', () => require('builder_platform_interaction_mocks/sharedUtils'));

const autolaunchedFlowStart = {
    canHaveFaultConnector: false,
    description: 'Autolaunched Flow',
    elementType: 'START_ELEMENT',
    hasContext: false,
    hasTrigger: false,
    icon: 'utility:right',
    iconBackgroundColor: 'background-green',
    iconShape: 'circle',
    iconSize: 'medium',

    label: 'Start',
    type: NodeType.START,
    value: 'START_ELEMENT',
    guid: 'startGuid'
};

const platformEventStart = {
    canHaveFaultConnector: false,
    description: 'Platform Event—Triggered Flow',
    elementType: 'START_ELEMENT',
    hasContext: false,
    hasTrigger: true,
    icon: 'utility:right',
    iconBackgroundColor: 'background-green',
    iconShape: 'circle',
    iconSize: 'medium',

    label: 'Start',
    type: NodeType.START,
    value: 'START_ELEMENT'
};

const screenFlowStart = {
    canHaveFaultConnector: false,
    description: 'Screen Flow',
    elementType: 'START_ELEMENT',
    hasContext: false,
    hasTrigger: false,
    icon: 'utility:right',
    iconBackgroundColor: 'background-green',
    iconShape: 'circle',
    iconSize: 'medium',

    label: 'Start',
    type: NodeType.START,
    value: 'START_ELEMENT'
};

const recordTriggeredFlowStart = {
    canHaveFaultConnector: false,
    description: 'Record-Triggered Flow',
    elementType: 'START_ELEMENT',
    hasContext: true,
    hasTrigger: true,
    icon: 'utility:right',
    iconBackgroundColor: 'background-green',
    iconShape: 'circle',
    iconSize: 'medium',

    label: 'Start',
    type: NodeType.START,
    value: 'START_ELEMENT'
};

const scheduledTriggeredFlowStart = {
    canHaveFaultConnector: false,
    description: 'Schedule-Triggered Flow',
    elementType: 'START_ELEMENT',
    hasContext: true,
    hasTrigger: true,
    icon: 'utility:right',
    iconBackgroundColor: 'background-green',
    iconShape: 'circle',
    iconSize: 'medium',

    label: 'Start',
    type: NodeType.START,
    value: 'START_ELEMENT'
};

const recordTriggeredOrchestrationStart = {
    canHaveFaultConnector: false,
    description: 'Record-Triggered Orchestration',
    elementType: 'START_ELEMENT',
    hasContext: true,
    hasTrigger: true,
    icon: 'utility:right',
    iconBackgroundColor: 'background-green',
    iconShape: 'circle',
    iconSize: 'medium',

    label: 'Start',
    type: NodeType.START,
    value: 'START_ELEMENT'
};

const menuStartData = {
    childIndex: 0,
    childReferences: [],
    config: { isSelected: false, isHighlighted: false, isSelectable: true, hasError: false },
    connectorCount: 0,
    description: '',
    elementType: 'START_ELEMENT',
    filterLogic: 'and',
    guid: '6de7bd7c-261e-4df3-a4cc-548e9c7f85ef',
    isCanvasElement: true,
    isTerminal: true,
    locationX: 50,
    locationY: 50,
    maxConnections: 1,
    next: 'ede8b21a-5d71-46b2-a583-156cfc390d3c',
    object: '',
    objectIndex: '8b6dc32e-a495-4c5f-95de-e9c861eee7b7',
    parent: 'root',
    prev: null,
    triggerType: 'PlatformEvent'
};

const recordTriggeredStartData = {
    availableConnections: [{ 0: { type: 'REGULAR' } }],
    childIndex: 0,
    childReferences: [],
    config: { isSelected: false, isHighlighted: false, isSelectable: true, hasError: false },
    connectorCount: 0,
    description: '',
    elementType: 'START_ELEMENT',
    filterLogic: 'and',
    filters: [
        {
            leftHandSide: '',
            operator: '',
            rightHandSide: '',
            rightHandSideDataType: '',
            rowIndex: '9ac859a2-c6c8-4af3-80b3-7f55e812d2fa'
        }
    ],
    guid: 'c98408d0-e567-4211-b102-0d7e3ecbc671',
    isCanvasElement: true,
    isTerminal: true,
    locationX: 50,
    locationY: 50,
    maxConnections: 1,
    next: '3ed26255-254c-4d1c-a87b-470335f6c53b',
    object: '',
    objectIndex: '4c87d839-ec1a-4abc-b1ba-56d1e13c7e3e',
    parent: 'root',
    prev: null,
    recordTriggerType: 'Create',
    triggerType: 'RecordAfterSave'
};

const scheduledTriggeredStartData = {
    availableConnections: [{ 0: { type: 'REGULAR' } }],
    childIndex: 0,
    childReferences: [],
    config: { isSelected: false, isHighlighted: false, isSelectable: true, hasError: false },
    connectorCount: 0,
    description: '',
    elementType: 'START_ELEMENT',
    filterLogic: 'and',
    filters: [
        {
            leftHandSide: '',
            operator: '',
            rightHandSide: '',
            rightHandSideDataType: '',
            rowIndex: '9ac859a2-c6c8-4af3-80b3-7f55e812d2fa'
        }
    ],
    frequency: 'Once',
    guid: '8ce5df6b-b784-4cda-80bc-63a592825e3b',
    isCanvasElement: true,
    isTerminal: true,
    locationX: 50,
    locationY: 50,
    maxConnections: 1,
    next: '0d94fe83-122d-4aa7-b42b-8182cbec27e1',
    object: '',
    objectIndex: 'ba9ed2f9-2aa8-4d94-8941-99a2b3263a0f',
    parent: 'root',
    prev: null,
    triggerType: 'Scheduled'
};

const recordTriggeredOrchestrationStartData = {
    availableConnections: [{ 0: { type: 'REGULAR' } }],
    childIndex: 0,
    childReferences: [],
    config: { isSelected: false, isHighlighted: false, isSelectable: true, hasError: false },
    connectorCount: 0,
    description: '',
    elementType: 'START_ELEMENT',
    filterLogic: 'and',
    filters: [
        {
            leftHandSide: '',
            operator: '',
            rightHandSide: '',
            rightHandSideDataType: '',
            rowIndex: '9ac859a2-c6c8-4af3-80b3-7f55e812d2fa'
        }
    ],
    guid: 'c98408d0-e567-4211-b102-0d7e3ecbc671',
    isCanvasElement: true,
    isTerminal: true,
    locationX: 50,
    locationY: 50,
    maxConnections: 1,
    next: '3ed26255-254c-4d1c-a87b-470335f6c53b',
    object: '',
    objectIndex: '4c87d839-ec1a-4abc-b1ba-56d1e13c7e3e',
    parent: 'root',
    prev: null,
    recordTriggerType: 'Create',
    triggerType: 'RecordAfterSave'
};

const createComponentUnderTest = async (props) => {
    const guid = props.startData ? props.startData.guid : props.guid || props.elementMetadata.guid;
    const overrideOptions = {
        elementMetadata: props.elementMetadata,
        flowModel: props.startData ? { [props.startData.guid]: props.startData } : { [guid]: {} },
        guid,
        ...props
    };

    return createComponent('builder_platform_interaction-alc-start-menu', {}, overrideOptions);
};

const selectors = {
    header: '[slot="header"]',
    headerLabel: '.test-header-label',
    headerDescription: '.test-header-description',
    body: '.test-start-menu-body',
    menuTemplate: 'builder_platform_interaction-alc-menu-template',
    triggerButton: 'builder_platform_interaction-start-node-trigger-button',
    contextButton: 'builder_platform_interaction-start-node-context-button',
    scheduledPathButton: 'builder_platform_interaction-start-node-scheduled-path-button'
};

async function dispatchEvent(element, event) {
    element.dispatchEvent(event);
    await ticks(1);
}

function getFirstButton(menu) {
    const triggerButton = menu.shadowRoot.querySelector(selectors.triggerButton);
    const recordTriggerButton = menu.shadowRoot.querySelector(selectors.recordTriggerButton);
    return recordTriggerButton ? recordTriggerButton : triggerButton;
}

function assertFocusOnFirstButton(menu) {
    const button = getFirstButton(menu);
    expect(menu.shadowRoot.activeElement).toEqual(button);
}

function makeActiveElement(ele) {
    ele.setAttribute('tabindex', '0');
    ele.focus();
}

describe('Start Node Menu', () => {
    describe('Autolaunched Start Menu', () => {
        let menu;
        beforeEach(async () => {
            mockSupportsScheduledPaths = false;
            menu = await createComponentUnderTest({ elementMetadata: autolaunchedFlowStart });
        });

        it('Should have focus on the first button', async () => {
            const menu = await createComponentUnderTest({
                elementMetadata: scheduledTriggeredFlowStart,
                startData: scheduledTriggeredStartData,
                autoFocus: true
            });

            assertFocusOnFirstButton(menu);
        });

        it('renders the start contextual menu', () => {
            expect(menu).toBeDefined();
        });

        it('Should have a label in the header', () => {
            const header = menu.shadowRoot.querySelector(selectors.header);
            const label = header.querySelector(selectors.headerLabel);
            expect(label.textContent).toEqual(autolaunchedFlowStart.label);
        });

        it('Should have a description in the header', () => {
            const header = menu.shadowRoot.querySelector(selectors.header);
            const description = header.querySelector(selectors.headerDescription);
            expect(description.textContent).toEqual(autolaunchedFlowStart.description);
        });

        it('Body should not be rendered', () => {
            const body = menu.shadowRoot.querySelector(selectors.body);
            expect(body).toBeNull();
        });
    });

    describe('Platform Event Start Menu', () => {
        let menu;
        beforeEach(async () => {
            mockSupportsScheduledPaths = false;
            menu = await createComponentUnderTest({
                elementMetadata: platformEventStart,
                startData: menuStartData
            });
        });

        it('Should have focus on the first button', async () => {
            const menu = await createComponentUnderTest({
                elementMetadata: scheduledTriggeredFlowStart,
                startData: scheduledTriggeredStartData,
                autoFocus: true
            });
            assertFocusOnFirstButton(menu);
        });

        it('renders the start contextual menu', () => {
            expect(menu).toBeDefined();
        });

        it('Should have a label in the header', () => {
            const header = menu.shadowRoot.querySelector(selectors.header);
            const label = header.querySelector(selectors.headerLabel);
            expect(label.textContent).toEqual(platformEventStart.label);
        });

        it('Should have a description in the header', () => {
            const header = menu.shadowRoot.querySelector(selectors.header);
            const description = header.querySelector(selectors.headerDescription);
            expect(description.textContent).toEqual(platformEventStart.description);
        });

        it('Should have a trigger/platform button rendered', () => {
            const body = menu.shadowRoot.querySelector(selectors.body);
            const button = body.querySelector(selectors.triggerButton);
            expect(button).toBeDefined();
        });

        it('Should not render context button', () => {
            const body = menu.shadowRoot.querySelector(selectors.body);
            const button = body.querySelector(selectors.contextButton);
            expect(button).toBeNull();
        });

        it('Should not render scheduled path button', () => {
            const body = menu.shadowRoot.querySelector(selectors.body);
            const button = body.querySelector(selectors.scheduledPathButton);
            expect(button).toBeNull();
        });

        it('Pressing escape while focus is on the platform button should fire the CloseMenuEvent event', async () => {
            const body = menu.shadowRoot.querySelector(selectors.body);
            const button = body.querySelector(selectors.triggerButton);
            const callback = jest.fn();
            menu.addEventListener(CloseMenuEvent.EVENT_NAME, callback);
            button.focus();
            menu.keyboardInteractions.execute(EscapeCommand.COMMAND_NAME);
            expect(callback).toHaveBeenCalled();
        });
    });

    describe('Screen Flow Start Menu', () => {
        let menu;
        beforeEach(async () => {
            mockSupportsScheduledPaths = false;
            menu = await createComponentUnderTest({ elementMetadata: screenFlowStart });
        });

        it('Should have focus on the first button', async () => {
            const menu = await createComponentUnderTest({
                elementMetadata: scheduledTriggeredFlowStart,
                startData: scheduledTriggeredStartData,
                autoFocus: true
            });
            assertFocusOnFirstButton(menu);
        });

        it('renders the start contextual menu', () => {
            expect(menu).toBeDefined();
        });

        it('Should have a label in the header', () => {
            const header = menu.shadowRoot.querySelector(selectors.header);
            const label = header.querySelector(selectors.headerLabel);
            expect(label.textContent).toEqual(screenFlowStart.label);
        });

        it('Should have a description in the header', () => {
            const header = menu.shadowRoot.querySelector(selectors.header);
            const description = header.querySelector(selectors.headerDescription);
            expect(description.textContent).toEqual(screenFlowStart.description);
        });

        it('Body should not be rendered', () => {
            const body = menu.shadowRoot.querySelector(selectors.body);
            expect(body).toBeNull();
        });
    });

    describe('Record-Triggered Flow Start Menu', () => {
        let menu;

        beforeEach(async () => {
            mockSupportsScheduledPaths = false;
            menu = await createComponentUnderTest({
                elementMetadata: recordTriggeredFlowStart,
                startData: recordTriggeredStartData
            });
        });

        it('Should have focus on the first button', async () => {
            const menu = await createComponentUnderTest({
                elementMetadata: scheduledTriggeredFlowStart,
                startData: scheduledTriggeredStartData,
                autoFocus: true
            });
            assertFocusOnFirstButton(menu);
        });

        it('renders the start contextual menu', () => {
            expect(menu).toBeDefined();
        });

        it('Should have a label in the header', () => {
            const header = menu.shadowRoot.querySelector(selectors.header);
            const label = header.querySelector(selectors.headerLabel);
            expect(label.textContent).toEqual(recordTriggeredFlowStart.label);
        });

        it('Should have a description in the header', () => {
            const header = menu.shadowRoot.querySelector(selectors.header);
            const description = header.querySelector(selectors.headerDescription);
            expect(description.textContent).toEqual(recordTriggeredFlowStart.description);
        });

        it('Should have a trigger button rendered', () => {
            const body = menu.shadowRoot.querySelector(selectors.body);
            const button = body.querySelector(selectors.triggerButton);
            expect(button).toBeDefined();
        });

        it('Should have a context button rendered', () => {
            const body = menu.shadowRoot.querySelector(selectors.body);
            const button = body.querySelector(selectors.contextButton);
            expect(button).toBeDefined();
        });

        it('Should not render scheduled path button if supportsScheduledPaths is set to false', () => {
            const body = menu.shadowRoot.querySelector(selectors.body);
            const button = body.querySelector(selectors.scheduledPathButton);
            expect(button).toBeNull();
        });

        it('Should render scheduled path button if supportsScheduledPaths is set to true', async () => {
            mockSupportsScheduledPaths = true;

            const startMenu = await createComponentUnderTest({
                elementMetadata: recordTriggeredFlowStart,
                startData: recordTriggeredStartData
            });
            const body = startMenu.shadowRoot.querySelector(selectors.body);
            const button = body.querySelector(selectors.scheduledPathButton);
            expect(button).not.toBeNull();
        });

        it('Focus should move correctly to the add scheduled path button on arrow up from the trigger button', async () => {
            mockSupportsScheduledPaths = true;
            const startMenu = await createComponentUnderTest({
                elementMetadata: recordTriggeredFlowStart,
                startData: recordTriggeredStartData,
                mockSupportsScheduledPaths: true
            });

            const body = startMenu.shadowRoot.querySelector(selectors.body);

            const trigger = body.querySelector(selectors.triggerButton);
            const scheduledPath = body.querySelector(selectors.scheduledPathButton);
            const callback = jest.fn();
            scheduledPath.addEventListener('focus', callback);
            const keydownEvent = new KeyboardEvent('keydown', { key: Keys.ArrowUp, bubbles: true });
            await dispatchEvent(trigger, keydownEvent);
            expect(callback).toHaveBeenCalled();
        });

        it('Focus should move correctly to the add scheduled path button on arrow down from the context button', async () => {
            mockSupportsScheduledPaths = true;
            const startMenu = await createComponentUnderTest({
                elementMetadata: recordTriggeredFlowStart,
                startData: recordTriggeredStartData,
                mockSupportsScheduledPaths: true
            });
            const body = startMenu.shadowRoot.querySelector(selectors.body);
            const context = body.querySelector(selectors.contextButton);

            makeActiveElement(context);

            const scheduledPath = body.querySelector(selectors.scheduledPathButton);
            const callback = jest.fn();
            scheduledPath.addEventListener('focus', callback);
            await dispatchEvent(context, new KeyboardEvent('keydown', { key: Keys.ArrowDown, bubbles: true }));
            expect(callback).toHaveBeenCalled();
        });

        it('Focus should move correctly to the context button on arrow up from the scheduled path button', async () => {
            mockSupportsScheduledPaths = true;
            const startMenu = await createComponentUnderTest({
                elementMetadata: recordTriggeredFlowStart,
                startData: recordTriggeredStartData,
                mockSupportsScheduledPaths: true
            });
            const body = startMenu.shadowRoot.querySelector(selectors.body);
            const scheduledPath = body.querySelector(selectors.scheduledPathButton);

            makeActiveElement(scheduledPath);

            const context = body.querySelector(selectors.contextButton);
            const callback = jest.fn();
            context.addEventListener('focus', callback);
            await dispatchEvent(scheduledPath, new KeyboardEvent('keydown', { key: Keys.ArrowUp, bubbles: true }));
            expect(callback).toHaveBeenCalled();
        });

        it('Focus should move correctly to the trigger button on arrow down from the scheduled path button', async () => {
            mockSupportsScheduledPaths = true;
            const startMenu = await createComponentUnderTest({
                elementMetadata: recordTriggeredFlowStart,
                startData: recordTriggeredStartData,
                mockSupportsScheduledPaths: true
            });
            const body = startMenu.shadowRoot.querySelector(selectors.body);
            const scheduledPath = body.querySelector(selectors.scheduledPathButton);
            startMenu.getListKeyboardInteraction().setActiveElement(scheduledPath);

            makeActiveElement(scheduledPath);
            const trigger = body.querySelector(selectors.triggerButton);
            const callback = jest.fn();
            trigger.addEventListener('focus', callback);
            await dispatchEvent(scheduledPath, new KeyboardEvent('keydown', { key: Keys.ArrowDown, bubbles: true }));
            expect(callback).toHaveBeenCalled();
        });

        it('Pressing escape while focus is on the scheduled path button should fire the CloseMenuEvent event', async () => {
            mockSupportsScheduledPaths = true;
            const startMenu = await createComponentUnderTest({
                elementMetadata: recordTriggeredFlowStart,
                startData: recordTriggeredStartData,
                mockSupportsScheduledPaths: true
            });
            const body = startMenu.shadowRoot.querySelector(selectors.body);
            const scheduledPath = body.querySelector(selectors.scheduledPathButton);
            const callback = jest.fn();
            menu.addEventListener(CloseMenuEvent.EVENT_NAME, callback);
            makeActiveElement(scheduledPath);

            menu.keyboardInteractions.execute(EscapeCommand.COMMAND_NAME);
            expect(callback).toHaveBeenCalled();
        });

        it('Focus should move correctly to the context button on arrow down from the trigger button', async () => {
            const body = menu.shadowRoot.querySelector(selectors.body);
            const trigger = body.querySelector(selectors.triggerButton);

            makeActiveElement(trigger);
            const context = body.querySelector(selectors.contextButton);
            const callback = jest.fn();
            context.addEventListener('focus', callback);
            await dispatchEvent(trigger, new KeyboardEvent('keydown', { key: Keys.ArrowDown, bubbles: true }));
            expect(callback).toHaveBeenCalled();
        });

        it('Focus should move correctly to the context button on arrow up from the trigger button', async () => {
            const body = menu.shadowRoot.querySelector(selectors.body);
            const trigger = body.querySelector(selectors.triggerButton);
            const context = body.querySelector(selectors.contextButton);
            const callback = jest.fn();
            context.addEventListener('focus', callback);
            makeActiveElement(trigger);
            await dispatchEvent(trigger, new KeyboardEvent('keydown', { key: Keys.ArrowDown, bubbles: true }));
            expect(callback).toHaveBeenCalled();
        });

        it('Focus should move correctly to the trigger button on arrow down from the context button', async () => {
            const body = menu.shadowRoot.querySelector(selectors.body);
            const trigger = body.querySelector(selectors.triggerButton);
            const context = body.querySelector(selectors.contextButton);
            makeActiveElement(context);
            const callback = jest.fn();
            trigger.addEventListener('focus', callback);
            await dispatchEvent(context, new KeyboardEvent('keydown', { key: Keys.ArrowDown, bubbles: true }));
            expect(callback).toHaveBeenCalled();
        });

        it('Focus should move correctly to the trigger button on arrow up from the context button', async () => {
            const body = menu.shadowRoot.querySelector(selectors.body);
            const trigger = body.querySelector(selectors.triggerButton);
            const context = body.querySelector(selectors.contextButton);

            makeActiveElement(context);
            const callback = jest.fn();
            trigger.addEventListener('focus', callback);
            await dispatchEvent(context, new KeyboardEvent('keydown', { key: Keys.ArrowUp, bubbles: true }));
            expect(callback).toHaveBeenCalled();
        });

        it('Pressing escape while focus is on the trigger button should fire the CloseMenuEvent event', async () => {
            const body = menu.shadowRoot.querySelector(selectors.body);
            const trigger = body.querySelector(selectors.triggerButton);
            const callback = jest.fn();
            menu.addEventListener(CloseMenuEvent.EVENT_NAME, callback);
            makeActiveElement(trigger);
            menu.keyboardInteractions.execute(EscapeCommand.COMMAND_NAME);
            expect(callback).toHaveBeenCalled();
        });

        it('Pressing escape while focus is on the context button should fire the CloseMenuEvent event', async () => {
            const body = menu.shadowRoot.querySelector(selectors.body);
            const context = body.querySelector(selectors.contextButton);
            const callback = jest.fn();
            menu.addEventListener(CloseMenuEvent.EVENT_NAME, callback);
            makeActiveElement(context);
            menu.keyboardInteractions.execute(EscapeCommand.COMMAND_NAME);
            expect(callback).toHaveBeenCalled();
        });
    });

    describe('Scheduled-Triggered Flow Start Menu', () => {
        let menu;
        beforeEach(async () => {
            mockSupportsScheduledPaths = false;
            menu = await createComponentUnderTest({
                elementMetadata: scheduledTriggeredFlowStart,
                startData: scheduledTriggeredStartData
            });
        });

        it('renders the start contextual menu', () => {
            expect(menu).toBeDefined();
        });

        it('Should have focus on the first button', async () => {
            const menu = await createComponentUnderTest({
                elementMetadata: scheduledTriggeredFlowStart,
                startData: scheduledTriggeredStartData,
                autoFocus: true
            });
            assertFocusOnFirstButton(menu);
        });

        it('Should have a label in the header', () => {
            const header = menu.shadowRoot.querySelector(selectors.header);
            const label = header.querySelector(selectors.headerLabel);
            expect(label.textContent).toEqual(scheduledTriggeredFlowStart.label);
        });

        it('Should have a description in the header', () => {
            const header = menu.shadowRoot.querySelector(selectors.header);
            const description = header.querySelector(selectors.headerDescription);
            expect(description.textContent).toEqual(scheduledTriggeredFlowStart.description);
        });

        it('Should have a trigger button rendered', () => {
            const body = menu.shadowRoot.querySelector(selectors.body);
            const button = body.querySelector(selectors.triggerButton);
            expect(button).toBeDefined();
        });

        it('Should have a context button rendered', () => {
            const body = menu.shadowRoot.querySelector(selectors.body);
            const button = body.querySelector(selectors.contextButton);
            expect(button).toBeDefined();
        });

        it('Should not render scheduled path button', () => {
            const body = menu.shadowRoot.querySelector(selectors.body);
            const button = body.querySelector(selectors.scheduledPathButton);
            expect(button).toBeNull();
        });

        it('Focus should move correctly to the context button on arrow down from the trigger button', async () => {
            const body = menu.shadowRoot.querySelector(selectors.body);
            const trigger = body.querySelector(selectors.triggerButton);
            const context = body.querySelector(selectors.contextButton);
            const callback = jest.fn();
            makeActiveElement(trigger);
            context.addEventListener('focus', callback);
            await dispatchEvent(trigger, new KeyboardEvent('keydown', { key: Keys.ArrowDown, bubbles: true }));
            expect(callback).toHaveBeenCalled();
        });

        it('Focus should move correctly to the context button on arrow up from the trigger button', async () => {
            const body = menu.shadowRoot.querySelector(selectors.body);
            const trigger = body.querySelector(selectors.triggerButton);
            makeActiveElement(trigger);
            const context = body.querySelector(selectors.contextButton);
            const callback = jest.fn();
            context.addEventListener('focus', callback);
            await dispatchEvent(trigger, new KeyboardEvent('keydown', { key: Keys.ArrowUp, bubbles: true }));
            expect(callback).toHaveBeenCalled();
        });

        it('Focus should move correctly to the trigger button on arrow down from the context button', async () => {
            const body = menu.shadowRoot.querySelector(selectors.body);
            const trigger = body.querySelector(selectors.triggerButton);
            const context = body.querySelector(selectors.contextButton);
            makeActiveElement(context);

            const callback = jest.fn();
            trigger.addEventListener('focus', callback);
            await dispatchEvent(context, new KeyboardEvent('keydown', { key: Keys.ArrowDown, bubbles: true }));
            expect(callback).toHaveBeenCalled();
        });

        it('Focus should move correctly to the trigger button on arrow up from the context button', async () => {
            const body = menu.shadowRoot.querySelector(selectors.body);
            const trigger = body.querySelector(selectors.triggerButton);
            const context = body.querySelector(selectors.contextButton);
            makeActiveElement(context);
            const callback = jest.fn();
            trigger.addEventListener('focus', callback);
            await dispatchEvent(context, new KeyboardEvent('keydown', { key: Keys.ArrowUp, bubbles: true }));
            expect(callback).toHaveBeenCalled();
        });

        it('Pressing escape while focus is on the trigger button should fire the CloseMenuEvent event', async () => {
            const body = menu.shadowRoot.querySelector(selectors.body);
            const trigger = body.querySelector(selectors.triggerButton);
            const callback = jest.fn();
            menu.addEventListener(CloseMenuEvent.EVENT_NAME, callback);
            makeActiveElement(trigger);
            menu.keyboardInteractions.execute(EscapeCommand.COMMAND_NAME);
            expect(callback).toHaveBeenCalled();
        });

        it('Pressing escape while focus is on the context button should fire the CloseMenuEvent event', async () => {
            const body = menu.shadowRoot.querySelector(selectors.body);
            const context = body.querySelector(selectors.contextButton);
            const callback = jest.fn();
            menu.addEventListener(CloseMenuEvent.EVENT_NAME, callback);
            makeActiveElement(context);
            menu.keyboardInteractions.execute(EscapeCommand.COMMAND_NAME);
            expect(callback).toHaveBeenCalled();
        });
    });

    describe('Orchestration Flow Start Menu', () => {
        let menu;
        beforeEach(async () => {
            mockSupportsScheduledPaths = false;
            // As of 236, being an orchestration flow currently implies some other configurations being set, like
            // disableEditElements = true. Maybe this won't always be the case, but for now...
            menu = await createComponentUnderTest({
                elementMetadata: recordTriggeredOrchestrationStart,
                startData: recordTriggeredOrchestrationStartData,
                disableEditElements: true,
                autoFocus: true
            });
        });

        it('renders the start contextual menu', () => {
            expect(menu).toBeDefined();
        });

        it('Should have focus on load', () => {
            assertFocusOnFirstButton(menu);
        });

        it('Should have a label in the header', () => {
            const header = menu.shadowRoot.querySelector(selectors.header);
            const label = header.querySelector(selectors.headerLabel);
            expect(label.textContent).toEqual(recordTriggeredOrchestrationStart.label);
        });

        it('Should have a description in the header', () => {
            const header = menu.shadowRoot.querySelector(selectors.header);
            const description = header.querySelector(selectors.headerDescription);
            expect(description.textContent).toEqual(recordTriggeredOrchestrationStart.description);
        });

        it('Should have a trigger button rendered', () => {
            const body = menu.shadowRoot.querySelector(selectors.body);
            const button = body.querySelector(selectors.triggerButton);
            expect(button).toBeDefined();
        });

        it('Should have a context button rendered', () => {
            const body = menu.shadowRoot.querySelector(selectors.body);
            const button = body.querySelector(selectors.contextButton);
            expect(button).toBeDefined();
        });
    });
});
