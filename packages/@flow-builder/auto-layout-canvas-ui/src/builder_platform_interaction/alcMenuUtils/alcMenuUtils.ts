import {
    AutoLayoutCanvasMode,
    CanvasContext,
    deleteComponent,
    getComponent,
    getDomElementGeometry,
    importComponent,
    isCutMode
} from 'builder_platform_interaction/alcComponentsUtils';
import AlcConnectorMenu from 'builder_platform_interaction/alcConnectorMenu';
import { MenuRenderedEvent } from 'builder_platform_interaction/alcEvents';
import AlcNodeMenu from 'builder_platform_interaction/alcNodeMenu';
import {
    ConnectionSource,
    ElementMetadata,
    FlowModel,
    getConnectionTarget,
    getTargetGuidsForReconnection,
    Guid,
    hasGoTo,
    NodeType
} from 'builder_platform_interaction/autoLayoutCanvas';
import { LightningElement } from 'lwc';

export interface NodeMenuInfo {
    ctor: AlcNodeMenu;
    source: ConnectionSource;
    autoFocus: boolean;
}
export interface ConnectorMenuInfo {
    ctor: AlcConnectorMenu;
    source: ConnectionSource;
    canAddGoto: boolean;
    canAddEndElement: boolean;
    isGoToConnector: boolean;
    numPasteElementsAvailable: number;
    elementsMetadata: ElementMetadata[];
    autoFocus: boolean;
    metadata: ConnectorMenuMetadata;
}

/**
 * Processes the connector menu metadata, importing/deleting components as needed
 *
 * @param prevMenuMetadata - The previous metadata
 * @param nextMenuMetadata - The next metadata
 */
export async function processConnectorMenuMetadata(
    prevMenuMetadata: ConnectorMenuMetadata | null,
    nextMenuMetadata: ConnectorMenuMetadata | null
) {
    const prevMenuComponent = prevMenuMetadata?.menuComponent;

    const menuComponent = nextMenuMetadata != null ? nextMenuMetadata.menuComponent : null;
    if (menuComponent) {
        await importComponent(menuComponent);
    } else if (prevMenuComponent) {
        deleteComponent(prevMenuComponent);
    }
}

/**
 *  Get the connector menu component constructor
 *
 *  @param connectorMenuMetadata - The menu metadata
 *  @returns the connector menu constructor or undefined
 */
export function getConnectorMenuConstructor(
    connectorMenuMetadata: ConnectorMenuMetadata | undefined
): AlcConnectorMenu | undefined {
    const menuComponent = connectorMenuMetadata?.menuComponent;
    return menuComponent ? getComponent<AlcConnectorMenu>(menuComponent) : undefined;
}

/**
 * Get the node menu data used to render the alcNodeMenu
 *
 * @param canvasContext - The canvas context
 * @param flowModel - The flow model
 * @param elementMetadata - The element metadata
 * @returns The node menu info
 */
export function getNodeMenuInfo(
    canvasContext: CanvasContext,
    flowModel: FlowModel,
    elementMetadata: ElementMetadata
): NodeMenuInfo | null {
    const { menu } = canvasContext;

    if (menu == null || elementMetadata == null) {
        return null;
    }

    const ctor = getNodeMenuConstructor(elementMetadata);

    if (ctor != null) {
        const { autoFocus, source } = menu;

        return {
            ctor,
            autoFocus,
            source
        };
    }

    return null;
}

/**
 * Get the connector menu data used to render the alcConnectorMenu
 *
 * @param canvasContext - The canvas context
 * @param flowModel - The flow model
 * @returns The connector menu info
 */
export function getConnectorMenuInfo(canvasContext: CanvasContext, flowModel: FlowModel): ConnectorMenuInfo | null {
    const { connectorMenuMetadata, menu, elementsMetadata } = canvasContext;

    if (connectorMenuMetadata == null || menu == null || flowModel == null || elementsMetadata == null) {
        return null;
    }

    const ctor = getConnectorMenuConstructor(connectorMenuMetadata);

    if (ctor != null && elementsMetadata != null) {
        const { source, autoFocus } = menu;
        const targetGuid = getConnectionTarget(flowModel, source);
        const isTargetEnd = targetGuid != null && flowModel[targetGuid].nodeType === NodeType.END;
        const canAddEndElement = targetGuid == null;
        const canAddGoto = checkCanAddGoTo(isTargetEnd, canAddEndElement, flowModel, source, targetGuid);
        const isGoToConnector = hasGoTo(flowModel, source);

        return {
            canAddGoto,
            canAddEndElement,
            source,
            isGoToConnector,
            numPasteElementsAvailable: canvasContext.numPasteElementsAvailable,
            ctor,
            elementsMetadata,
            autoFocus,
            metadata: connectorMenuMetadata
        };
    }

    return null;
}

/**
 * Get the constructor for a node menu
 *
 * @param elementMetadata - The metadata for the element
 * @returns the constructor for the menu
 */
export function getNodeMenuConstructor(elementMetadata: ElementMetadata): AlcNodeMenu | undefined {
    const componentName = elementMetadata.menuComponent;

    return componentName ? getComponent<AlcNodeMenu>(componentName) : undefined;
}

/**
 * Checks if we can add a goto
 *
 * @param isTargetEnd - Whether the target is an end node
 * @param canAddEndElement - Whether we can add an end element
 * @param flowModel - The flow model
 * @param source - The connection source
 * @param targetGuid - The target guid
 * @returns true iff can add a goto
 */
function checkCanAddGoTo(
    isTargetEnd: boolean,
    canAddEndElement: boolean,
    flowModel: FlowModel,
    source: ConnectionSource,
    targetGuid: string | null
) {
    let canAddGoto = false;
    if (isTargetEnd || canAddEndElement) {
        // Checking if there is anything to connect to
        const { mergeableGuids, goToableGuids, firstMergeableNonNullNext } = getTargetGuidsForReconnection(
            flowModel,
            source,
            targetGuid!
        );

        canAddGoto = firstMergeableNonNullNext != null || mergeableGuids.length > 0 || goToableGuids.length > 0;
    }
    return canAddGoto;
}

/**
 * Creates a MenuRenderedEvent that should be fired after a menu is rendered
 *
 * @param menuElement - The menu element
 * @returns a MenuRenderedEvent for the menu
 */
export function newMenuRenderedEvent(menuElement: HTMLElement | LightningElement) {
    const { w, h } = getDomElementGeometry(menuElement);
    return new MenuRenderedEvent(w, h);
}

/**
 * Determines if an element is to be cut and if canvas is in cut mode
 *
 * @param canvasMode - The canvas mode
 * @param cutElementGuids - The cut element guids
 * @param guid - The element guid
 * @returns true if the element is to be cut and the canvas is in cut mode
 */
export function isElementCut(canvasMode: AutoLayoutCanvasMode, cutElementGuids: Guid[], guid: Guid): boolean {
    return isCutMode(canvasMode) && cutElementGuids?.includes(guid);
}
