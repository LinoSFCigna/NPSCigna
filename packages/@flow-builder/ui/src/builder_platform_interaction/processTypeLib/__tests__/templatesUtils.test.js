import { FLOW_PROCESS_TYPE } from "builder_platform_interaction/flowMetadata";
import { ALL_PROCESS_TYPE, getProcessTypeTile, cacheTemplates, getTemplates } from 'builder_platform_interaction/processTypeLib';
import { MOCK_ALL_TEMPLATES, MOCK_AUTO_TEMPLATE, MOCK_SCREEN_TEMPLATE_1, MOCK_SCREEN_TEMPLATE_2 } from 'mock/templates';

jest.mock('builder_platform_interaction/systemLib', () => {
    return {
        getProcessTypes: jest.fn().mockImplementation(() => {
            return require('mock/processTypesData').MOCK_ALL_PROCESS_TYPES;
        }),
    };
});

const commonUtils = require.requireActual('../../commonUtils/commonUtils.js');
commonUtils.format = jest.fn().mockImplementation((formatString, ...args) => formatString + '(' + args.toString() + ')');

describe('templatesUtils', () => {
    describe('getting the process types tiles', () => {
        it('should return the new screen flow tile with title and description in label file', () => {
            const screenProcessTypeTile = getProcessTypeTile(FLOW_PROCESS_TYPE.FLOW, true);
            expect(screenProcessTypeTile).toEqual({itemId: FLOW_PROCESS_TYPE.FLOW, label: 'FlowBuilderProcessTypeTemplates.newFlowTitle', iconName: 'utility:desktop', description: 'FlowBuilderProcessTypeTemplates.newFlowDescription', isSelected: true});
        });
        it('should return the new checkout flow tile with default title and description in label file', () => {
            const checkoutProcessTypeTile = getProcessTypeTile(FLOW_PROCESS_TYPE.CHECKOUT_FLOW, true);
            expect(checkoutProcessTypeTile).toEqual({itemId: FLOW_PROCESS_TYPE.CHECKOUT_FLOW, label: 'FlowBuilderProcessTypeTemplates.newProcessTypeTitle(Checkout Flow)', iconName: 'utility:cart', description: 'FlowBuilderProcessTypeTemplates.newProcessTypeDescription(Checkout Flow)', isSelected: true});
        });
    });
    describe('caching the templates', () => {
        beforeEach(() => {
            cacheTemplates(ALL_PROCESS_TYPE.name, MOCK_ALL_TEMPLATES);
        });
        it('should cache all the templates', () => {
            expect(getTemplates([ALL_PROCESS_TYPE.name])).toEqual(MOCK_ALL_TEMPLATES);
        });
        it('should cache the screen templates by screen process type', () => {
            const screenTemplates = getTemplates([FLOW_PROCESS_TYPE.FLOW]);
            expect(screenTemplates).toHaveLength(2);
            expect(screenTemplates).toEqual(expect.arrayContaining([MOCK_SCREEN_TEMPLATE_1]));
            expect(screenTemplates).toEqual(expect.arrayContaining([MOCK_SCREEN_TEMPLATE_2]));
        });
        it('should cache the autolaunched templates by autolaunched process type', () => {
            const autoTemplates = getTemplates([FLOW_PROCESS_TYPE.AUTO_LAUNCHED_FLOW]);
            expect(autoTemplates).toHaveLength(1);
            expect(autoTemplates).toEqual(expect.arrayContaining([MOCK_AUTO_TEMPLATE]));
        });
        it('should cache empty list by other process type', () => {
            const checkoutTemplates = getTemplates([FLOW_PROCESS_TYPE.CHECKOUT_FLOW]);
            expect(checkoutTemplates).toHaveLength(0);
        });
    });
});