import { pasteSection, configureMenu } from '../flcConnectorMenuConfig';

jest.mock('builder_platform_interaction/storeLib', () => {
    return {
        generateGuid: jest.fn(() => 1)
    };
});

const metaData = [
    {
        section: 'Interaction',
        type: 'default',
        icon: 'standard:screen',
        label: 'Screen',
        value: 'Screen',
        elementType: 'Screen',
        description: 'Collect information from'
    },
    {
        section: 'Data Operation',
        type: 'default',
        icon: 'standard:record_create',
        label: 'RecordCreate',
        value: 'RecordCreate',
        elementType: 'RecordCreate',
        description: 'Create Salesforce recor'
    }
];

const metaDataResponse = [
    {
        guid: 1,
        heading: 'Interaction',
        items: [
            {
                description: 'Collect information from',
                elementType: 'Screen',
                guid: 1,
                icon: 'standard:screen',
                label: 'Screen'
            }
        ],
        label: 'Interaction'
    },
    {
        guid: 1,
        heading: 'Data Operation',
        items: [
            {
                description: 'Create Salesforce recor',
                elementType: 'RecordCreate',
                guid: 1,
                icon: 'standard:record_create',
                label: 'RecordCreate'
            }
        ],
        label: 'Data Operation'
    }
];

describe('connector menu config', () => {
    it('should return an object with sections as its key and and empty array as its value by default', () => {
        expect(configureMenu()).toEqual({ sections: [] });
    });
    it('should have the paste element in the object and the correct transformed data ', () => {
        expect(configureMenu(metaData, false, true)).toEqual({ sections: [pasteSection, ...metaDataResponse] });
    });
    it('should not have the paste element in the object and the correct transformed data', () => {
        expect(configureMenu(metaData, false, false)).toEqual({ sections: [...metaDataResponse] });
    });
});
