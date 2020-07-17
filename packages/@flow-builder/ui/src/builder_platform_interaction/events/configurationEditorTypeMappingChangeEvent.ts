// @ts-nocheck
const eventName = 'configuration_editor_generic_type_mapping_changed';

/**
 * This event can be used by partner teams to set the concrete values for the dynamic types in their invocable action or screen component
 *
 * @export
 * @class ConfigurationEditorTypeMappingChangeEvent
 */
export class ConfigurationEditorTypeMappingChangeEvent {
    constructor(typeName, typeValue) {
        return new CustomEvent(eventName, {
            cancelable: false,
            composed: true,
            bubbles: true,
            detail: {
                typeName,
                typeValue
            }
        });
    }

    static EVENT_NAME = eventName;
}
