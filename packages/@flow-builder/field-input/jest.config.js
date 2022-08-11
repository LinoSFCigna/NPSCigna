module.exports = {
    preset: '@lwc/jest-preset',
    verbose: true,
    transformIgnorePatterns: ['/node_modules/(?!lightning-components-stubs/modules/lightning-stubs/)'],
    testPathIgnorePatterns: ['/build/'],
    setupFiles: ['core-js'],
    moduleNameMapper: {
        '^aura$': '<rootDir>/../shared-utils/jest-modules/aura',
        'builder_framework/command': '<rootDir>/../shared-utils/jest-modules/builder_framework/command/command',
        '^instrumentation/service$': '<rootDir>/../shared-utils/jest-modules/instrumentation/service',
        '^o11y/client$': '<rootDir>/../shared-utils/jest-modules/o11y/client',
        '^mock/flows/(.+)$': '<rootDir>/../ui/jest-mock-data/flows/$1',
        '^mock/(.+)$': '<rootDir>/../ui/jest-mock-data/$1/$1',
        '^mock-data/(.+)/(.+)$': '<rootDir>/jest-mock-data/apis/$1/$2',
        '^mock-data/(.+)$': '<rootDir>/jest-mock-data/$1',
        '^serverData/(.+)/(.+)$':
            '<rootDir>/../ui/jest-mock-data/results/FlowBuilderControllerGoldFileTest/test$1Serialization/$2',
        '^builder_platform_interaction_mocks/sharedUtils/sharedUtils$':
            '<rootDir>/../shared-utils/jest-modules/builder_platform_interaction/sharedUtils/sharedUtils',
        '^builder_platform_interaction_mocks/sharedUtils$':
            '<rootDir>/../auto-layout-canvas-ui/jest-modules/builder_platform_interaction/sharedUtils/sharedUtils',

        '^builder_platform_interaction_mocks/sharedUtils/(keyboardInteractionUtils)$':
            '<rootDir>/../shared-utils/jest-modules/builder_platform_interaction/sharedUtils/$1/$1',
        '^builder_platform_interaction_mocks/sharedUtils/(sharedUtils)$':
            '<rootDir>/../shared-utils/jest-modules/builder_platform_interaction/$1/$1',
        '^builder_platform_interaction_mocks/sharedUtils/keyboardInteractionUtils$':
            '<rootDir>/../shared-utils/jest-modules/builder_platform_interaction/sharedUtils/keyboardInteractionUtils/keyboardInteractionUtils',
        '^builder_platform_interaction_mocks/sharedUtils/sharedUtils':
            '<rootDir>/../shared-utils/jest-modules/builder_platform_interaction/sharedUtils/sharedUtils',
        '^builder_platform_interaction_mocks/alcStartMenu':
            '<rootDir>/../ui/jest-modules/builder_platform_interaction/alcStartMenu/alcStartMenu',
        '^builder_platform_interaction_mocks/storeLib':
            '<rootDir>/../ui/jest-modules/builder_platform_interaction/storeLib/storeLib',
        '^builder_platform_interaction_mocks/sobjectLib':
            '<rootDir>/../ui/jest-modules/builder_platform_interaction/sobjectLib/sobjectLib',
        '^builder_platform_interaction_mocks/(.+)$': '<rootDir>/jest-modules/builder_platform_interaction/$1/$1',
        '^(builder_platform_interaction)/focusTrap$':
            '<rootDir>/../auto-layout-canvas-ui/src/builder_platform_interaction/focusTrap/focusTrap',

        '^(builder_platform_interaction)/(alcCanvasContainer|alcCanvasUtils|alcConversionUtils|alcStartMenu)$':
            '<rootDir>/../ui/src/builder_platform_interaction/$2/$2',

        '^(builder_platform_interaction)/(alc.*)$':
            '<rootDir>/../auto-layout-canvas-ui/src/builder_platform_interaction/$2/$2',

        '^builder_platform_interaction/autoLayoutCanvas$': '<rootDir>/../auto-layout-canvas/dist/index.dev.js',
        '^builder_platform_interaction/sharedUtils/commands': '<rootDir>/../shared-utils/src/commands',
        '^builder_platform_interaction/sharedUtils/customIconUtils': '<rootDir>/../shared-utils/src/customIconUtils',
        '^builder_platform_interaction/sharedUtils/lwcUtils': '<rootDir>/../shared-utils/src/lwcUtils',
        '^builder_platform_interaction/sharedUtils/auraUtils': '<rootDir>/../shared-utils/src/auraUtils',
        '^builder_platform_interaction/sharedUtils/commonUtils': '<rootDir>/../shared-utils/src/commonUtils',
        '^builder_platform_interaction/sharedUtils/keyboardInteractionUtils':
            '<rootDir>/../shared-utils/src/keyboardInteractionUtils/index.ts',
        '^builder_platform_interaction/sharedUtils/appGuidanceUtils':
            '<rootDir>/../shared-utils/src/appGuidanceUtils/index.ts',
        '^builder_platform_interaction/sharedUtils$': '<rootDir>/../shared-utils/dist/index.esNext.js',
        '^(builder_platform_interaction)/zoomPanel$': '<rootDir>/src/builder_platform_interaction/zoomPanel/zoomPanel',
        '^(builder_platform_interaction)/sortEditorLib$':
            '<rootDir>/../ui/src/builder_platform_interaction/sortEditorLib/sortEditorLib',
        '^(builder_platform_interaction)/expressionUtils$':
            '<rootDir>/../ui/src/builder_platform_interaction/expressionUtils/expressionUtils',
        '^(builder_platform_interaction)/elementLabelLib$':
            '<rootDir>/../ui/src/builder_platform_interaction/elementLabelLib/elementLabelLib',
        '^(builder_platform_interaction)/selectors$':
            '<rootDir>/../ui/src/builder_platform_interaction/selectors/selectors',
        '^(builder_platform_interaction)/filterTypeLib$':
            '<rootDir>/../ui/src/builder_platform_interaction/filterTypeLib/filterTypeLib',
        '^(builder_platform_interaction)/ruleLib$': '<rootDir>/../ui/src/builder_platform_interaction/ruleLib/ruleLib',
        '^(builder_platform_interaction)/dateTimeUtils$':
            '<rootDir>/../ui/src/builder_platform_interaction/dateTimeUtils/dateTimeUtils',
        '^(builder_platform_interaction)/subflowsLib$':
            '<rootDir>/../ui/src/builder_platform_interaction/subflowsLib/subflowsLib',
        '^(builder_platform_interaction)/screenEditorUtils$':
            '<rootDir>/../ui/src/builder_platform_interaction/screenEditorUtils/screenEditorUtils',
        '^(builder_platform_interaction)/flowExtensionLib$':
            '<rootDir>/../ui/src/builder_platform_interaction/flowExtensionLib/flowExtensionLib',
        '^(builder_platform_interaction)/complexTypeLib$':
            '<rootDir>/../ui/src/builder_platform_interaction/complexTypeLib/complexTypeLib',
        '^(builder_platform_interaction)/apexTypeLib$':
            '<rootDir>/../ui/src/builder_platform_interaction/apexTypeLib/apexTypeLib',
        '^(builder_platform_interaction)/referenceToVariableUtil$':
            '<rootDir>/../ui/src/builder_platform_interaction/referenceToVariableUtil/referenceToVariableUtil',
        '^(builder_platform_interaction)/triggerTypeLib$':
            '<rootDir>/../ui/src/builder_platform_interaction/triggerTypeLib/triggerTypeLib',
        '^(builder_platform_interaction)/actions$': '<rootDir>/../ui/src/builder_platform_interaction/actions/actions',
        '^(builder_platform_interaction)/undoRedoLib$':
            '<rootDir>/../ui/src/builder_platform_interaction/undoRedoLib/undoRedoLib',
        '^(builder_platform_interaction)/storeLib$':
            '<rootDir>/../ui/src/builder_platform_interaction/storeLib/storeLib',
        '^(builder_platform_interaction)/processTypeLib$':
            '<rootDir>/../ui/src/builder_platform_interaction/processTypeLib/processTypeLib',
        '^(builder_platform_interaction)/systemLib$':
            '<rootDir>/../ui/src/builder_platform_interaction/systemLib/systemLib',
        '^(builder_platform_interaction)/systemVariableConstantsLib$':
            '<rootDir>/../ui/src/builder_platform_interaction/systemVariableConstantsLib/systemVariableConstantsLib',
        '^(builder_platform_interaction)/recordEditorLib$':
            '<rootDir>/../ui/src/builder_platform_interaction/recordEditorLib/recordEditorLib',
        '^(builder_platform_interaction)/connectorUtils$':
            '<rootDir>/../ui/src/builder_platform_interaction/connectorUtils/connectorUtils',
        '^(builder_platform_interaction)/invocableActionLib$':
            '<rootDir>/../ui/src/builder_platform_interaction/invocableActionLib/invocableActionLib',
        '^(builder_platform_interaction)/elementFactory$':
            '<rootDir>/../ui/src/builder_platform_interaction/elementFactory/elementFactory',
        '^(builder_platform_interaction)/screenEditorI18nUtils$':
            '<rootDir>/../ui/src/builder_platform_interaction/screenEditorI18nUtils/screenEditorI18nUtils',
        '^(builder_platform_interaction)/dataTypeLib$':
            '<rootDir>/../ui/src/builder_platform_interaction/dataTypeLib/dataTypeLib',
        '^(builder_platform_interaction)/storeUtils$':
            '<rootDir>/../ui/src/builder_platform_interaction/storeUtils/storeUtils',
        '^(builder_platform_interaction)/dataMutationLib$':
            '<rootDir>/../ui/src/builder_platform_interaction/dataMutationLib/dataMutationLib',
        '^(builder_platform_interaction)/imageLib$':
            '<rootDir>/../ui/src/builder_platform_interaction/imageLib/imageLib',
        '^(builder_platform_interaction)/commonUtils$':
            '<rootDir>/../ui/src/builder_platform_interaction/commonUtils/commonUtils',
        '^(builder_platform_interaction)/serverDataLib$':
            '<rootDir>/../ui/src/builder_platform_interaction/serverDataLib/serverDataLib',
        '^(builder_platform_interaction)/sobjectLib$':
            '<rootDir>/../ui/src/builder_platform_interaction/sobjectLib/sobjectLib',
        '^(builder_platform_interaction)/elementConfig$':
            '<rootDir>/../ui/src/builder_platform_interaction/elementConfig/elementConfig',
        '^(builder_platform_interaction)/flowMetadata$':
            '<rootDir>/../ui/src/builder_platform_interaction/flowMetadata/flowMetadata',
        '^(builder_platform_interaction)/contextLib$':
            '<rootDir>/../ui/src/builder_platform_interaction/contextLib/contextLib',
        '^(builder_platform_interaction)/builderTestUtils$':
            '<rootDir>/../ui/src/builder_platform_interaction/builderTestUtils/builderTestUtils',
        '^(builder_platform_interaction)/builderTestUtils/events$':
            '<rootDir>/../ui/src/builder_platform_interaction/builderTestUtils/events',
        '^(builder_platform_interaction)/builderTestUtils/commonTestUtils$':
            '<rootDir>/../ui/src/builder_platform_interaction/builderTestUtils/commonTestUtils',
        '^(builder_platform_interaction)/builderTestUtils/domTestUtils$':
            '<rootDir>/../ui/src/builder_platform_interaction/builderTestUtils/domTestUtils',
        '^(builder_platform_interaction)/collectionProcessorLib$':
            '<rootDir>/../ui/src/builder_platform_interaction/collectionProcessorLib/collectionProcessorLib',
        '^(builder_platform_interaction)/mapEditorLib$':
            '<rootDir>/../ui/src/builder_platform_interaction/mapEditorLib/mapEditorLib',
        '^(builder_platform_interaction)/events$': '<rootDir>/../ui/src/builder_platform_interaction/events/events',
        '^(builder_platform_interaction)/orchestratedStageNode$':
            '<rootDir>/../ui/src/builder_platform_interaction/orchestratedStageNode/orchestratedStageNode',
        '^(builder_platform_interaction)/stageStepMenu$':
            '<rootDir>/../ui/src/builder_platform_interaction/stageStepMenu/stageStepMenu',
        '^(builder_platform_interaction)/(fieldInput.*)$': '<rootDir>/src/builder_platform_interaction/$2/$2',
        '^(builder_platform_interaction)/(.+)$': '<rootDir>/../ui/src/$1/$2/$2',
        '^lightning/(.+)$':
            '<rootDir>/../../../node_modules/lightning-components-stubs/modules/lightning-stubs/core/$1/$1',
        '^(force)/(.+)$': '<rootDir>/../ui/jest-modules/$1/$2/$2'
    },
    clearMocks: true,
    coverageDirectory: '../../../coverage',
    collectCoverageFrom: [
        '<rootDir>/src/*/!(builderTestUtils)**/*.ts',
        '!**/*Labels.ts',
        '!**/integrationTests/**/*.ts',
        '!**/__tests__/**/*.ts'
    ]
};