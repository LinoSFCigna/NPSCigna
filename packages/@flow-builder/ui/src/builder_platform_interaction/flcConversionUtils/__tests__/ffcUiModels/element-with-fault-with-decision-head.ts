export default {
    elements: {
        'start-element-guid': {
            guid: 'start-element-guid',
            description: '',
            locationX: 362,
            locationY: 48,
            isCanvasElement: true,
            connectorCount: 1,
            config: {
                isSelected: false,
                isHighlighted: false,
                isSelectable: true
            },
            elementType: 'START_ELEMENT',
            maxConnections: 1,
            triggerType: 'None',
            filterType: 'all',
            object: '',
            objectIndex: '12c23e8e-4104-40ba-86e0-feb73e787792',
            filters: []
        },
        'record-create-element-guid': {
            guid: 'record-create-element-guid',
            description: '',
            locationX: 488,
            locationY: 206,
            isCanvasElement: true,
            connectorCount: 1,
            config: {
                isSelected: false,
                isHighlighted: false,
                isSelectable: true
            },
            elementType: 'RecordCreate',
            maxConnections: 2,
            triggerType: 'None',
            filterType: 'all',
            object: '',
            objectIndex: '12c23e8e-4104-40ba-86e0-feb73e787792',
            filters: [],
            availableConnections: [{ type: 'REGULAR' }]
        },
        'fault-element-guid': {
            guid: 'fault-element-guid',
            name: 'd1',
            description: '',
            label: 'd1',
            locationX: 884,
            locationY: 326,
            isCanvasElement: true,
            connectorCount: 0,
            config: {
                isSelected: false,
                isHighlighted: false,
                isSelectable: true
            },
            defaultConnectorLabel: 'Default Outcome',
            elementType: 'Decision',
            maxConnections: 2,
            childReferences: [{ childReference: 'outcome-element-guid' }],
            availableConnections: [{ type: 'REGULAR', childReference: 'outcome-element-guid' }, { type: 'DEFAULT' }]
        },
        'outcome-element-guid': {
            guid: 'outcome-element-guid',
            name: 'd1out',
            label: 'd1out',
            elementType: 'OUTCOME',
            dataType: 'Boolean',
            conditionLogic: 'and',
            conditions: [
                {
                    rowIndex: 'cbf949b8-cb9c-4f36-931f-1b128912360d',
                    leftHandSide: '$Flow.CurrentRecord',
                    rightHandSide: 'a',
                    rightHandSideDataType: 'String',
                    operator: 'EqualTo'
                }
            ]
        }
    },
    connectors: [
        {
            guid: 'start-element-guid -> record-create-element-guid',
            source: 'start-element-guid',
            target: 'record-create-element-guid',
            label: null,
            type: 'REGULAR',
            config: { isSelected: false }
        },
        {
            guid: 'record-create-element-guid -> fault-element-guid',
            source: 'record-create-element-guid',
            target: 'fault-element-guid',
            label: 'FAULT',
            type: 'FAULT',
            config: { isSelected: false }
        }
    ],
    canvasElements: ['fault-element-guid', 'record-create-element-guid', 'start-element-guid']
};
