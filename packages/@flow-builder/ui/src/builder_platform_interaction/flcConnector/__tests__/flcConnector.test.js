// @ts-nocheck
import { createElement } from 'lwc';
import FlcConnector from 'builder_platform_interaction/flcConnector';
import { ConditionType } from 'builder_platform_interaction/flowUtils';
import { LABELS } from '../flcConnectorLabels';

const selectors = {
    connectorToBeDeletedSVG: '.connector-to-be-deleted',
    addElementButton: '.circle-text',
    defaultConnectorBadge: '.connector-badge.default-badge span',
    faultConnectorBadge: '.connector-badge.fault-badge span'
};

const geometry = {
    x: 0,
    y: 0,
    w: 20,
    h: 40
};

const svgInfo = {
    geometry,
    path: 'M 10, 20'
};

const addInfo = {
    offsetY: 20,
    menuOpened: false
};

const labelOffsetY = 50;

const getRegularConnectorInfo = () => {
    return {
        type: 'straight',
        geometry,
        svgInfo,
        addInfo,
        connectionInfo: {
            prev: 'prevGuid1',
            next: 'nextGuid1'
        },
        isFault: false,
        labelOffsetY,
        conditionType: ConditionType.STANDARD,
        toBeDeleted: false
    };
};

const getDefaultConnectorInfo = (toBeDeleted = false) => {
    return {
        type: 'branchHead',
        geometry,
        svgInfo,
        addInfo,
        connectionInfo: {
            next: 'nextGuid1',
            parent: 'parentGuid1',
            childIndex: 1
        },
        isFault: false,
        labelOffsetY,
        conditionType: ConditionType.DEFAULT,
        defaultConnectorLabel: 'Default Connector Label',
        toBeDeleted
    };
};

const getFaultConnectorInfo = () => {
    return {
        type: 'branchHead',
        geometry,
        svgInfo,
        addInfo,
        connectionInfo: {
            next: 'nextGuid1',
            parent: 'parentGuid1',
            childIndex: -1
        },
        isFault: true,
        labelOffsetY,
        conditionType: ConditionType.FAULT,
        toBeDeleted: false
    };
};

const createComponentUnderTest = connectorInfo => {
    const el = createElement('builder_platform_interaction-flc-connector', {
        is: FlcConnector
    });

    el.connectorInfo = connectorInfo;
    document.body.appendChild(el);
    return el;
};

describe('Auto-Layout connector tests', () => {
    it('Should add connector-to-be-deleted class to the connector svg when toBeDeleted is true', () => {
        const defaultConnector = createComponentUnderTest(getDefaultConnectorInfo(true));
        const connectorSVG = defaultConnector.shadowRoot.querySelector(selectors.connectorToBeDeletedSVG);
        expect(connectorSVG).not.toBeNull();
    });

    it('"+" button icon should have the right alternative text', () => {
        const regularConnector = createComponentUnderTest(getRegularConnectorInfo());
        const addElementButton = regularConnector.shadowRoot.querySelector(selectors.addElementButton);
        expect(addElementButton.alternativeText).toBe(LABELS.addElementIconAltText);
    });

    it('Default connector should have the label badge', () => {
        const defaultConnector = createComponentUnderTest(getDefaultConnectorInfo());
        const labelBadge = defaultConnector.shadowRoot.querySelector(selectors.defaultConnectorBadge);
        expect(labelBadge).not.toBeUndefined();
    });

    it('Default connector should have the right label content', () => {
        const defaultConnectorInfo = getDefaultConnectorInfo();
        const defaultConnector = createComponentUnderTest(defaultConnectorInfo);
        const labelBadge = defaultConnector.shadowRoot.querySelector(selectors.defaultConnectorBadge);
        expect(labelBadge.textContent).toEqual(defaultConnectorInfo.defaultConnectorLabel);
    });

    it('Fault connector should have the label badge', () => {
        const faultConnector = createComponentUnderTest(getFaultConnectorInfo());
        const labelBadge = faultConnector.shadowRoot.querySelector(selectors.faultConnectorBadge);
        expect(labelBadge).not.toBeUndefined();
    });

    it('Fault connector should have the right label content', () => {
        const faultConnector = createComponentUnderTest(getFaultConnectorInfo());
        const labelBadge = faultConnector.shadowRoot.querySelector(selectors.faultConnectorBadge);
        expect(labelBadge.textContent).toEqual(LABELS.faultConnectorBadgeLabel);
    });
});
