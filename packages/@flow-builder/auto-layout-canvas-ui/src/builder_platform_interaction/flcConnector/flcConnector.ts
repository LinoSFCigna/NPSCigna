import { LightningElement, api } from 'lwc';
import { classSet } from 'lightning/utils';
import { ConnectorRenderInfo, ConnectorLabelType } from 'builder_platform_interaction/autoLayoutCanvas';
import { getStyleFromGeometry, AutoLayoutCanvasMode } from 'builder_platform_interaction/flcComponentsUtils';
import { LABELS } from './flcConnectorLabels';

/**
 * Auto layout Canvas Connector Component.
 */
export default class FlcConnector extends LightningElement {
    @api
    connectorInfo!: ConnectorRenderInfo;

    @api
    canvasMode!: AutoLayoutCanvasMode;

    @api
    disableAddElements;

    get labels() {
        return LABELS;
    }

    /**
     * Checks if add element button should be visible or not
     */
    get showAddElementButton() {
        return (
            this.connectorInfo.addInfo && this.canvasMode === AutoLayoutCanvasMode.DEFAULT && !this.disableAddElements
        );
    }

    /**
     * Gets the location for the add element button
     */
    get buttonMenuStyle() {
        return getStyleFromGeometry({ y: this.connectorInfo.addInfo!.offsetY });
    }

    /**
     * Add the inverse variant to the button when the contextual menu is open
     */
    get addIconVariant() {
        const { addInfo } = this.connectorInfo;
        return addInfo && addInfo.menuOpened ? 'inverse' : '';
    }

    /**
     * Gets the info needed to render the connector svg
     */
    get svgInfo() {
        const { svgInfo } = this.connectorInfo;

        const { path, geometry } = svgInfo;

        return {
            width: geometry.w,
            height: geometry.h,
            style: getStyleFromGeometry(geometry),
            path
        };
    }

    // TODO: W-9025580 [Trust] Review how badge is displayed
    // based on if scheduled path is supported or not
    get hasConnectorBadge() {
        if (this.connectorInfo.labelType === ConnectorLabelType.BRANCH) {
            return this.connectorInfo.connectorBadgeLabel != null;
        }
        return this.connectorInfo.labelType !== ConnectorLabelType.NONE;
    }

    get connectorBadgeClass() {
        const labelType = this.connectorInfo.labelType;

        return classSet('connector-badge slds-align_absolute-center slds-badge').add({
            'fault-badge': labelType === ConnectorLabelType.FAULT,
            'connector-highlighted': this.connectorInfo.isHighlighted
        });
    }

    get connectorBadgeLabel() {
        const labelType: ConnectorLabelType = this.connectorInfo.labelType!;

        switch (labelType) {
            case ConnectorLabelType.LOOP_AFTER_LAST:
                return LABELS.afterLastBadgeLabel;
            case ConnectorLabelType.FAULT:
                return LABELS.faultConnectorBadgeLabel;
            case ConnectorLabelType.LOOP_FOR_EACH:
                return LABELS.forEachBadgeLabel;
            case ConnectorLabelType.BRANCH:
                return this.connectorInfo.connectorBadgeLabel;
            default:
                return '';
        }
    }

    /**
     * Gets the class for the svg
     */
    get svgClassName() {
        return classSet(this.connectorInfo.isFault ? 'fault' : this.connectorInfo.type).add({
            'connector-to-be-deleted': this.connectorInfo.toBeDeleted,
            'connector-highlighted': this.connectorInfo.isHighlighted
        });
    }

    get connectorLabelStyle() {
        return getStyleFromGeometry({ y: this.connectorInfo.labelOffsetY });
    }

    @api
    focus() {
        this.template.querySelector('builder_platform_interaction-flc-button-menu').focus();
    }
}
