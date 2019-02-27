import all from '@salesforce/label/FlowBuilderProcessTypesVerticalNavigation.all';
import { FLOW_PROCESS_TYPE } from "builder_platform_interaction/flowMetadata";

export const PROCESS_TYPE_DEFAULT_ICON = 'utility:flow';

export const ALL_PROCESS_TYPE = {name: 'all', label: all};

export const PROCESS_TYPES_ICONS = {FEATURED : new Map([
    [ALL_PROCESS_TYPE.name, 'utility:flow'],
    [FLOW_PROCESS_TYPE.AUTO_LAUNCHED_FLOW, 'utility:magicwand'],
    [FLOW_PROCESS_TYPE.FLOW, 'utility:desktop']
]), OTHERS : new Map([
    [FLOW_PROCESS_TYPE.ACTION_CADENCE_FLOW, 'utility:activity'],
    [FLOW_PROCESS_TYPE.ACTION_PLAN, 'utility:fallback'],
    [FLOW_PROCESS_TYPE.APPOINTMENTS, 'utility:events'],
    [FLOW_PROCESS_TYPE.CHECKOUT_FLOW, 'utility:cart'],
    [FLOW_PROCESS_TYPE.CONTACT_REQUEST_FLOW, 'utility:contact_request'],
    [FLOW_PROCESS_TYPE.CUSTOM_EVENT, 'utility:event'],
    [FLOW_PROCESS_TYPE.FIELD_SERVICE_MOBILE, 'utility:phone_portrait'],
    [FLOW_PROCESS_TYPE.FIELD_SERVICE_WEB, 'utility:insert_tag_field'],
    [FLOW_PROCESS_TYPE.FORM, 'utility:edit_form'],
    [FLOW_PROCESS_TYPE.INVOCABLE_PROCESS, 'utility:process'],
    [FLOW_PROCESS_TYPE.JOURNEY_BUILDER_INTEGRATION, 'utility:builder'],
    [FLOW_PROCESS_TYPE.LOGIN_FLOW, 'utility:password'],
    [FLOW_PROCESS_TYPE.MANAGED_CONTENT_FLOW, 'utility:cases'],
    [FLOW_PROCESS_TYPE.ORCHESTRATION_FLOW, 'utility:classic_interface'],
    [FLOW_PROCESS_TYPE.SURVEY, 'utility:survey'],
    [FLOW_PROCESS_TYPE.USER_PROVISIONING_FLOW, 'utility:user'],
    [FLOW_PROCESS_TYPE.TRANSACTION_SECURITY_FLOW, 'utility:inspector_panel'],
    [FLOW_PROCESS_TYPE.WORKFLOW, 'utility:pause']
])};

export const getProcessTypesWithIcons = (unfilteredProcessTypes, processTypesMap, filtering, postFiltering) => {
    let filteredProcessTypes =  unfilteredProcessTypes;
    if (filtering) {
        filteredProcessTypes = unfilteredProcessTypes.filter(filtering);
    }

    if (postFiltering) {
        postFiltering(filteredProcessTypes);
    }
    return filteredProcessTypes.map(processType => {
        const {name, label, iconName = processTypesMap.get(name) || PROCESS_TYPE_DEFAULT_ICON} = processType;
        return {name, label, iconName};
    });
};
