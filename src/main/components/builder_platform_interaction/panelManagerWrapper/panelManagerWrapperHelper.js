({
    init: function(cmp) {
        var that = this;
        var keyboardInteractions = new this.keyboardInteractionUtils.KeyboardInteractions();
        // Move Focus To Editor Toolbox Command
        var focusOnDockingPanelCommand = new this.commands.FocusOnDockingPanelCommand(function() {
            that.handleFocusOnToolbox();
        });
        var focusOnDockingPanelShortcut = { key: 'g d' };
        keyboardInteractions.setupCommandAndShortcut(focusOnDockingPanelCommand, focusOnDockingPanelShortcut);
        // Display shortcuts Command
        var displayShortcutsCommand = new this.commands.DisplayShortcutsCommand(function() {
            that.builderUtils.invokeKeyboardHelpDialog();
        });
        var displayShortcutKeyCombo = { key: '/' };
        keyboardInteractions.setupCommandAndShortcut(displayShortcutsCommand, displayShortcutKeyCombo);
        cmp.set('v.keyboardInteractions', keyboardInteractions);
    },
    handleFocusOnToolbox: function(cmp) {
        var editor = document.querySelector('builder_platform_interaction-editor');
        editor.handleFocusOnToolbox();
    }
});