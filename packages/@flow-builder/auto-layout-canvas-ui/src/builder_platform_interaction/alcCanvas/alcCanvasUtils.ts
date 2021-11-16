import { FlowModel, Guid, findFirstElement, isRoot } from 'builder_platform_interaction/autoLayoutCanvas';

/**
 * Helper function to build a path to the node that needs to be focused. The path will consist of the
 * guid and branch index to follow for all the branching nodes leading up to the focus node.
 *
 * @param flowModel The flow model
 * @param focusPath The focus path
 * @returns The complete focus path
 */
export const getFocusPath = (
    flowModel: FlowModel,
    focusPath: Array<{ guid: Guid; index?: number; canHaveCanvasEmbeddedElement?: boolean }>
) => {
    const focusGuid = focusPath[0].guid;
    const branchHead = findFirstElement(flowModel[focusGuid], flowModel);
    const { childIndex, parent } = branchHead;

    if (!isRoot(parent)) {
        const parentElement = flowModel[parent];
        // Adding childIndex along with the parent guid so that we know which
        // branch to follow when going down the flow to move focus
        return getFocusPath(flowModel, [
            {
                guid: parent,
                index: childIndex,
                canHaveCanvasEmbeddedElement: parentElement?.canHaveCanvasEmbeddedElement
            },
            ...focusPath
        ]);
    }
    // The focus path is complete once we hit the Root element
    return focusPath;
};