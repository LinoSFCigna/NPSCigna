import actionSectionLabel from '@salesforce/label/AlcConnectorContextualMenu.actionSectionLabel';
import deleteGoToPathItemLabel from '@salesforce/label/AlcConnectorContextualMenu.deleteGoToPathItemLabel';
import goToPathItemLabel from '@salesforce/label/AlcConnectorContextualMenu.goToPathItemLabel';
import menuHeader from '@salesforce/label/AlcConnectorContextualMenu.menuHeader';
import pasteItemLabel from '@salesforce/label/AlcConnectorContextualMenu.pasteItemLabel';
import reRouteGoToPathItemLabel from '@salesforce/label/AlcConnectorContextualMenu.reRouteGoToPathItemLabel';

export const labelsMap = {
    menuHeader,
    actionSectionLabel,
    pasteItemLabel,
    goToPathItemLabel,
    reRouteGoToPathItemLabel,
    deleteGoToPathItemLabel
};

export const LABELS: Labels<typeof labelsMap> = labelsMap;