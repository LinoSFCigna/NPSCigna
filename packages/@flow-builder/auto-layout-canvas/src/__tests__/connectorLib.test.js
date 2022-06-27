import ConnectorLabelType from '../ConnectorLabelTypeEnum';
import {
    createBranchConnector,
    createConnectorToNextNode,
    createLoopAfterLastConnector,
    createLoopBackConnector,
    createMergeConnector
} from '../connectorLib';
import ConnectorType from '../ConnectorTypeEnum';
import { getDefaultLayoutConfig } from '../defaultLayoutConfig';
import { ConnectorVariant } from '../flowRendererUtils';

jest.mock('../svgUtils.ts', () => {
    return {
        createSvgInfo: (svgPathParams, startOffset) => ({ svgPathParams, startOffset }),
        createOffsetLocation: (location, offset) => ({ location, offset }),
        createSvgPath: (pathParams, startOffset) => ({ pathParams, startOffset })
    };
});

describe('connectorLib', () => {
    it('createLoopBackConnector', () => {
        const connectorRenderInfo = createLoopBackConnector(
            'guid',
            { x: 0, y: 0, w: 88, h: 168 },
            getDefaultLayoutConfig(),
            false,
            false,
            undefined
        );

        expect(connectorRenderInfo).toMatchSnapshot();
    });

    it('createLoopAfterLastConnector', () => {
        const connectorRenderInfo = createLoopAfterLastConnector(
            'guid',
            { x: -88, y: 0, w: 88, h: 168 },
            getDefaultLayoutConfig(),
            false,
            48,
            88,
            false,
            'delete'
        );

        expect(connectorRenderInfo).toMatchSnapshot();
    });

    it('createBranchConnector', () => {
        const connectorRenderInfo = createBranchConnector(
            { guid: 'guid', childIndex: 0 },
            { x: 0, y: 0, w: 100, h: 28 },
            ConnectorType.BRANCH_LEFT,
            getDefaultLayoutConfig(),
            false,
            true,
            'delete'
        );

        expect(connectorRenderInfo).toMatchSnapshot();
    });

    it('createMergeConnector', () => {
        const connectorRenderInfo = createMergeConnector(
            { guid: 'guid', childIndex: 0 },
            { x: 0, y: 0, w: 100, h: 28 },
            ConnectorType.MERGE_LEFT,
            getDefaultLayoutConfig(),
            false,
            true,
            'delete'
        );

        expect(connectorRenderInfo).toMatchSnapshot();
    });

    it('createConnectorToNextNode with Straight connector type', () => {
        const connectorRenderInfo = createConnectorToNextNode(
            { next: 'nextGuid', prev: 'prevGuid' },
            ConnectorType.STRAIGHT,
            ConnectorLabelType.NONE,
            0,
            144,
            false,
            getDefaultLayoutConfig(),
            false,
            ConnectorVariant.DEFAULT,
            0,
            48,
            false,
            undefined
        );

        expect(connectorRenderInfo).toMatchSnapshot();
    });

    it('createConnectorToNextNode with GoTo connector type and Branch Head', () => {
        const connectorRenderInfo = createConnectorToNextNode(
            { parent: 'parentGuid', childIndex: 0 },
            ConnectorType.GO_TO,
            ConnectorLabelType.BRANCH,
            0,
            132,
            false,
            getDefaultLayoutConfig(),
            false,
            [ConnectorVariant.BRANCH_HEAD],
            84,
            48,
            false,
            undefined
        );

        expect(connectorRenderInfo).toMatchSnapshot();
    });

    it('createConnectorToNextNode with GoTo connector type and Default variant', () => {
        const connectorRenderInfo = createConnectorToNextNode(
            { next: 'nextGuid', prev: 'prevGuid' },
            ConnectorType.GO_TO,
            ConnectorLabelType.NONE,
            0,
            108,
            false,
            getDefaultLayoutConfig(),
            false,
            [ConnectorVariant.DEFAULT, ConnectorVariant.CENTER],
            60,
            48,
            false,
            undefined
        );

        expect(connectorRenderInfo).toMatchSnapshot();
    });

    it('createConnectorToNextNode with GoTo connector type and Post Merge variant', () => {
        const connectorRenderInfo = createConnectorToNextNode(
            { next: 'nextGuid', prev: 'prevGuid' },
            ConnectorType.GO_TO,
            ConnectorLabelType.NONE,
            96,
            120,
            false,
            getDefaultLayoutConfig(),
            false,
            [ConnectorVariant.POST_MERGE, ConnectorVariant.CENTER],
            36,
            48,
            false,
            undefined
        );

        expect(connectorRenderInfo).toMatchSnapshot();
    });

    it('createConnectorToNextNode with GoTo connector type and Fault variant', () => {
        const connectorRenderInfo = createConnectorToNextNode(
            { parent: 'parentGuid', childIndex: -1 },
            ConnectorType.GO_TO,
            ConnectorLabelType.FAULT,
            0,
            108,
            false,
            getDefaultLayoutConfig(),
            false,
            [ConnectorVariant.FAULT, ConnectorVariant.CENTER],
            60,
            24,
            false,
            undefined
        );

        expect(connectorRenderInfo).toMatchSnapshot();
    });
});
