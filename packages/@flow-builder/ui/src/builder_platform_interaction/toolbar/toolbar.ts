// @ts-nocheck
import {
    AutoLayoutCanvasMode,
    isDefaultMode,
    isReconnectionMode,
    isSelectionMode
} from 'builder_platform_interaction/alcComponentsUtils';
import { UpdateAutolayoutCanvasModeEvent } from 'builder_platform_interaction/alcEvents';
import { CanvasMode } from 'builder_platform_interaction/builderUtils';
import { parseMetadataDateTime } from 'builder_platform_interaction/dateTimeUtils';
import {
    AddToFlowTestEvent,
    ClosePropertyEditorEvent,
    CopyOnCanvasEvent,
    DebugFlowEvent,
    DuplicateEvent,
    EditFlowEvent,
    EditFlowPropertiesEvent,
    EditTestEvent,
    NewDebugFlowEvent,
    RedoEvent,
    RestartDebugFlowEvent,
    RunFlowEvent,
    SaveFlowEvent,
    ToggleCanvasModeEvent,
    ToggleFlowStatusEvent,
    ToggleLeftPanelEvent,
    ToolbarFocusOutEvent,
    UndoEvent,
    ViewAllTestsEvent
} from 'builder_platform_interaction/events';
import { FLOW_STATUS } from 'builder_platform_interaction/flowMetadata';
import { commonUtils, loggingUtils } from 'builder_platform_interaction/sharedUtils';
import { Store } from 'builder_platform_interaction/storeLib';
import { BUILDER_MODE } from 'builder_platform_interaction/systemLib';
import { api, LightningElement } from 'lwc';
import { LABELS } from './toolbarLabels';

const { format } = commonUtils;
const { logInteraction } = loggingUtils;
/**
 * Toolbar component for flow builder.
 */
export default class Toolbar extends LightningElement {
    static delegatesFocus = true;

    @api
    flowId;

    @api
    flowStatus;

    @api
    flowVersion;

    @api
    isEditFlowPropertiesDisabled;

    @api
    isRunDebugDisabled;

    @api
    isSaveDisabled;

    @api
    isSaveAsDisabled;

    @api
    isViewAllTestsDisabled;

    @api
    isAddToTestDisabled;

    @api
    lastModifiedDate;

    @api
    saveAndPendingOperationStatus; // saved, saving..., activating..., deactivating...

    @api
    isLightningFlowBuilder;

    @api
    canOnlySaveAsNewDefinition;

    @api
    hasUnsavedChanges;

    @api
    flowErrorsAndWarnings;

    @api
    autolayoutCanvasMode;

    @api
    isUndoDisabled;

    @api
    isRedoDisabled;

    @api
    isCutCopyDisabled;

    @api
    isNewDebugSupported;

    @api
    isAutoLayoutCanvas;

    @api
    showCopyPasteButton;

    @api
    showEditFlowPropertiesButton;

    @api
    showCanvasModeCombobox;

    @api
    showFlowStatus;

    @api
    showEditFlowButton;

    @api
    showRunButton;

    @api
    showDebugButton;

    @api
    showAddToTestButton;

    @api
    showRunTestButton;

    @api
    showRestartRunButton;

    @api
    hideSelectionButton;

    @api
    showSaveButton;

    @api
    showSaveAsButton;

    @api
    showActivateButton;

    @api
    showUndoRedoButton;

    @api
    showViewAllTestsButton;

    @api
    builderMode;

    @api
    showEditTestButton;

    @api
    showLeftPanelToggle;

    @api
    isLeftPanelToggled;

    labels = LABELS;

    statusLabelFromStatus = {
        [FLOW_STATUS.ACTIVE]: {
            label: this.labels.activeLabel
        },
        [FLOW_STATUS.OBSOLETE]: {
            label: this.labels.deactivatedLabel
        },
        [FLOW_STATUS.DRAFT]: {
            label: this.labels.draftLabel
        },
        [FLOW_STATUS.INVALID_DRAFT]: {
            label: this.labels.draftLabel
        },
        [FLOW_STATUS.SAVING]: {
            label: this.labels.savingStatus
        },
        [FLOW_STATUS.ACTIVATING]: {
            label: this.labels.activating
        },
        [FLOW_STATUS.DEACTIVATING]: {
            label: this.labels.deactivating
        }
    };

    @api focus(shiftBackward?: boolean) {
        const toolbarFocusableElements = this.template.querySelectorAll(
            'lightning-button, lightning-button-icon, button'
        );
        if (toolbarFocusableElements.length > 0) {
            let index = 0;
            while (toolbarFocusableElements[index].disabled && index < toolbarFocusableElements.length - 1) {
                ++index;
            }
            toolbarFocusableElements[index].focus();
        } else {
            this.dispatchEvent(new ToolbarFocusOutEvent(shiftBackward));
        }
    }

    // Every time the user tries to toggle the canvas mode, the combobox by default updates it's value.
    // In the cases where the conversion from free-form to auto-layout isn't possible, we need to manually
    // reset the value
    @api
    resetComboboxValueToFreeForm() {
        this.template.querySelector('lightning-combobox').value = CanvasMode.FreeForm;
    }

    get showSelectionButton() {
        return this.isAutoLayoutCanvas && !this.hideSelectionButton;
    }

    get canvasOptions() {
        return [
            { label: this.labels.canvasModeAutoLayout, value: CanvasMode.AutoLayout },
            { label: this.labels.canvasModeFreeform, value: CanvasMode.FreeForm }
        ];
    }

    get selectedCanvasValue() {
        return this.isAutoLayoutCanvas ? CanvasMode.AutoLayout : CanvasMode.FreeForm;
    }

    get showDuplicateElementButton() {
        return this.showCopyPasteButton && !this.isAutoLayoutCanvas;
    }

    get selectButtonVariant() {
        return !isDefaultMode(this.autolayoutCanvasMode) ? 'brand' : 'neutral';
    }

    get showCopyClipboard() {
        return isSelectionMode(this.autolayoutCanvasMode) || isReconnectionMode(this.autolayoutCanvasMode);
    }

    get showLastSavedPill() {
        return !!this.saveAndPendingOperationStatus && this.showFlowStatus;
    }

    get isDoingOperation() {
        return (
            this.saveAndPendingOperationStatus === FLOW_STATUS.SAVING ||
            this.saveAndPendingOperationStatus === FLOW_STATUS.ACTIVATING ||
            this.saveAndPendingOperationStatus === FLOW_STATUS.DEACTIVATING
        );
    }

    get statusIndicatorTitle() {
        if (this.isDoingOperation) {
            return (
                this.statusLabelFromStatus[this.saveAndPendingOperationStatus] &&
                this.statusLabelFromStatus[this.saveAndPendingOperationStatus].label
            );
        }
        return format(
            this.labels.toolbarStatusTitle,
            this.flowVersion,
            this.statusLabelFromStatus[this.flowStatus] && this.statusLabelFromStatus[this.flowStatus].label
        );
    }

    get isDoneOperation() {
        return this.saveAndPendingOperationStatus === FLOW_STATUS.SAVED && this.lastModifiedDate;
    }

    get toolbarStatus() {
        if (this.isDoingOperation) {
            return (
                this.statusLabelFromStatus[this.saveAndPendingOperationStatus] &&
                this.statusLabelFromStatus[this.saveAndPendingOperationStatus].label
            );
        }
        return format(
            this.labels.toolbarStatus,
            this.flowVersion,
            this.statusLabelFromStatus[this.flowStatus] && this.statusLabelFromStatus[this.flowStatus].label
        );
    }

    get showDoneStatus() {
        return this.isDoneOperation && this.showFlowStatus;
    }

    get showNewDebugButton() {
        return this.showDebugButton && this.isNewDebugSupported;
    }

    get showOldDebugButton() {
        return this.showDebugButton && !this.isNewDebugSupported;
    }

    get currentDate() {
        const { date } = parseMetadataDateTime(this.lastModifiedDate, true);
        return date;
    }

    get saveDisabled() {
        return (
            this.isSaveDisabled ||
            this.flowStatus === FLOW_STATUS.ACTIVE ||
            this.flowStatus === FLOW_STATUS.OBSOLETE ||
            !this.isLightningFlowBuilder ||
            this.canOnlySaveAsNewDefinition ||
            !this.hasUnsavedChanges
        );
    }

    get activateDisabled() {
        // for the activate button, disables and enables activation or deactivation through the button
        return (
            this.isStandardFlow() ||
            !this.flowStatus ||
            this.flowStatus === FLOW_STATUS.INVALID_DRAFT ||
            this.isDoingOperation ||
            this.hasUnsavedChanges
        );
    }

    get viewAllTestsDisabled() {
        return this.isDoingOperation || this.isViewAllTestsDisabled;
    }

    get activateButtonText() {
        if (this.flowStatus === FLOW_STATUS.ACTIVE) {
            return this.labels.deactivateTitle;
        }
        return this.labels.activateTitle;
    }

    get activateButtonVariant() {
        if (this.flowStatus === FLOW_STATUS.ACTIVE) {
            return 'destructive-text';
        }
        return 'neutral';
    }

    get isLeftPanelButtonDisabled() {
        return !isDefaultMode(this.autolayoutCanvasMode);
    }

    /** Logic is based off the builder config AND selection mode status */
    get showUndoRedoButtonComposed() {
        return isDefaultMode(this.autolayoutCanvasMode) && this.showUndoRedoButton;
    }

    /**
     * Logic to change the label for the View All Test button based on Builder Mode.
     * Label is changed to suit the context of the user.
     */
    get viewAllTestsButtonText() {
        if (this.builderMode === BUILDER_MODE.EDIT_MODE) {
            // return this.labels.editModeViewTestButtonTitle;
            return LABELS.viewTestEditorModeTitle;
        }
        // return this.labels.testModeViewTestButtonTitle
        return LABELS.viewTestTestingModeTitle;
    }

    /**
     * Check if the flow Id belongs to a Standard (File Based) Flow Definition (e.g sfdc_checkout__CartToOrder-1),
     * a normal flow Id always starts with 301.
     */
    isStandardFlow() {
        return this.flowId && !this.flowId.startsWith('301');
    }

    handleSelectButtonClick(event) {
        event.stopPropagation();
        const mode = !isDefaultMode(this.autolayoutCanvasMode)
            ? AutoLayoutCanvasMode.DEFAULT
            : AutoLayoutCanvasMode.SELECTION;
        this.dispatchEvent(new UpdateAutolayoutCanvasModeEvent(mode));
    }

    handleUndo(event) {
        event.preventDefault();
        const undoEvent = new UndoEvent();
        this.dispatchEvent(undoEvent);
        logInteraction(`undo-button`, 'toolbar', null, 'click');
    }

    handleRedo(event) {
        event.preventDefault();
        const redoEvent = new RedoEvent();
        this.dispatchEvent(redoEvent);
        logInteraction(`redo-button`, 'toolbar', null, 'click');
    }

    handleViewAllTests(event) {
        event.preventDefault();
        const viewAllTestsEvent = new ViewAllTestsEvent();
        this.dispatchEvent(viewAllTestsEvent);
        logInteraction(`view-all-tests-button`, 'toolbar', null, 'click');
    }

    handleEditTest(event) {
        event.preventDefault();
        const editTestEvent = new EditTestEvent();
        this.dispatchEvent(editTestEvent);
        logInteraction(`edit-test-button`, 'toolbar', null, 'click');
    }

    handleCopyButtonClick() {
        const copyOnCanvasEvent = new CopyOnCanvasEvent();
        this.dispatchEvent(copyOnCanvasEvent);
    }

    handleDuplicateButtonClick(event) {
        event.preventDefault();
        // TODO: Right now we are firing a seperate ClosePropertyEditorEvent to address the property
        // editor panel close and open happening in one tick issue. Should consider removing it and move
        // the close panel logic to duplicate event handler for cleaner logic seperation
        // https://gus.lightning.force.com/lightning/r/ADM_Work__c/a07B00000078hChIAI/view
        const closePropertyEditorEvent = new ClosePropertyEditorEvent();
        this.dispatchEvent(closePropertyEditorEvent);
        const duplicateEvent = new DuplicateEvent();
        this.dispatchEvent(duplicateEvent);
        logInteraction(`duplicate-button`, 'toolbar', null, 'click');
    }

    handleToggleLeftPanelButtonClick(event) {
        event.preventDefault();
        const toggleLeftPanelEvent = new ToggleLeftPanelEvent();
        this.dispatchEvent(toggleLeftPanelEvent);
        logInteraction(`toggle-left-panel-button`, `toolbar`, null, `click`);
    }

    handleEditFlowProperties(event) {
        event.preventDefault();
        if (!this.isEditFlowPropertiesDisabled) {
            const editFlowPropertiesEvent = new EditFlowPropertiesEvent();
            this.dispatchEvent(editFlowPropertiesEvent);
            logInteraction(`flow-properties-button`, 'toolbar', null, 'click');
        }
    }

    handleEditFlow(event) {
        event.preventDefault();
        const editFlowEvent = new EditFlowEvent();
        this.dispatchEvent(editFlowEvent);
        logInteraction(`edit-flow-button`, 'toolbar', null, 'click');
    }

    handleRun(event) {
        event.preventDefault();
        const runFlowEvent = new RunFlowEvent();
        this.dispatchEvent(runFlowEvent);
        logInteraction(`run-button`, 'toolbar', null, 'click');
    }

    handleDebug(event) {
        event.preventDefault();
        const debugFlowEvent = new DebugFlowEvent();
        this.dispatchEvent(debugFlowEvent);
        logInteraction(`debug-button`, 'toolbar', null, 'click');
    }

    handleNewDebug(event) {
        event.preventDefault();
        const newDebugFlowEvent = new NewDebugFlowEvent();
        this.dispatchEvent(newDebugFlowEvent);
        logInteraction(`new-debug-button`, 'toolbar', null, 'click');
    }

    handleAddToTest(event) {
        event.preventDefault();
        const addToFlowTestEvent = new AddToFlowTestEvent();
        this.dispatchEvent(addToFlowTestEvent);
        logInteraction(`add-to-test`, 'toolbar', null, 'click');
    }

    handleRestartDebug(event) {
        event.preventDefault();
        const restartDebugFlowEvent = new RestartDebugFlowEvent();
        this.dispatchEvent(restartDebugFlowEvent);
        logInteraction(`restart-debug-button`, 'toolbar', null, 'click');
    }

    /**
     * Event handler for click event on save button.
     * It dispatches an event named save which can be handled by parent component
     *
     * @param {Object} event - Save button click event
     */
    handleSave(event) {
        event.preventDefault();
        const saveEvent = new SaveFlowEvent(SaveFlowEvent.Type.SAVE);
        this.dispatchEvent(saveEvent);
    }

    handleSaveAs(event) {
        event.preventDefault();
        const saveAsEventType = this.getSaveAsEventType();
        const saveAsEvent = new SaveFlowEvent(saveAsEventType);
        this.dispatchEvent(saveAsEvent);
        logInteraction(`save-as-button`, 'toolbar', null, 'click');
    }

    getSaveAsEventType() {
        const currentState = Store.getStore().getCurrentState();
        if (currentState.properties.canOnlySaveAsNewDefinition) {
            if (currentState.properties.isTemplate) {
                return SaveFlowEvent.Type.SAVE_AS_TEMPLATE;
            } else if (currentState.properties.isOverridable) {
                return SaveFlowEvent.Type.SAVE_AS_OVERRIDDEN;
            }
        }
        return SaveFlowEvent.Type.SAVE_AS;
    }

    handleToggleFlowStatus(event) {
        event.preventDefault();
        const toggleFlowStatusEvent = new ToggleFlowStatusEvent();
        this.dispatchEvent(toggleFlowStatusEvent);
        const operationStatus = this.flowStatus === FLOW_STATUS.OBSOLETE ? 'Activate' : 'Deactivate';
        const context = { operationStatus };
        logInteraction(`activate-button`, 'toolbar', context, 'click');
    }

    handleToggleCanvasMode(event) {
        event.stopPropagation();
        this.dispatchEvent(new ToggleCanvasModeEvent());
    }
}
