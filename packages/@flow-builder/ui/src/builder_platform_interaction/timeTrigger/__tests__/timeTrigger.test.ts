import { createElement } from 'lwc';
import TimeTrigger from 'builder_platform_interaction/timeTrigger';
import { PropertyChangedEvent } from 'builder_platform_interaction/events';
import { TIME_OPTION } from 'builder_platform_interaction/flowMetadata';
import { INTERACTION_COMPONENTS_SELECTORS } from 'builder_platform_interaction/builderTestUtils';

const timeTriggerMock = {
    label: { value: 'My time trigger element', error: null },
    name: { value: 'Some_time_trigger_name', error: null },
    timeSource: { value: 'ClosedDate', error: null },
    guid: 'some guid',
    offsetNumber: { value: 2, error: null },
    offsetUnit: { value: TIME_OPTION.HOURS_BEFORE, error: null }
};

const selectors = {
    labelAndName: INTERACTION_COMPONENTS_SELECTORS.LABEL_DESCRIPTION,
    timeSource: '.timeSourceCombobox',
    offsetNumber: '.offsetNumberInput',
    offsetUnitAndDirection: '.offsetUnitAndDirectionCombobox'
};

const createComponentUnderTest = () => {
    const el = createElement('builder_platform_interaction-time-trigger', {
        is: TimeTrigger
    });
    el.timeTrigger = timeTriggerMock;
    document.body.appendChild(el);
    return el;
};

describe('TimeTrigger', () => {
    let element;
    beforeEach(() => {
        element = createComponentUnderTest();
        element.timeTrigger = timeTriggerMock;
    });
    describe('field component presence verification', () => {
        it('has name and api name component', () => {
            const labelAndNameComponents = element.shadowRoot.querySelectorAll(selectors.labelAndName);
            expect(labelAndNameComponents).toHaveLength(1);
            expect(labelAndNameComponents[0].devName.value).toBe(timeTriggerMock.name.value);
            expect(labelAndNameComponents[0].label.value).toBe(timeTriggerMock.label.value);
        });
        it('has time source field component', () => {
            const timeSourceComponent = element.shadowRoot.querySelectorAll(selectors.timeSource);
            expect(timeSourceComponent).toHaveLength(1);
            expect(timeSourceComponent[0].value).toBe(timeTriggerMock.timeSource.value);
        });
        it('has offset number field component', () => {
            const offsetNumberComponent = element.shadowRoot.querySelectorAll(selectors.offsetNumber);
            expect(offsetNumberComponent).toHaveLength(1);
            expect(offsetNumberComponent[0].value).toBe(timeTriggerMock.offsetNumber.value);
        });
        it('has offset unit field component', () => {
            const offsetUnitAndDirectionComponent = element.shadowRoot.querySelectorAll(
                selectors.offsetUnitAndDirection
            );
            expect(offsetUnitAndDirectionComponent).toHaveLength(1);
            expect(offsetUnitAndDirectionComponent[0].value).toBe(timeTriggerMock.offsetUnit.value);
        });
    });

    describe('handle time trigger property change', () => {
        let eventCallback;
        beforeEach(() => {
            eventCallback = jest.fn();
            element.addEventListener(PropertyChangedEvent.EVENT_NAME, eventCallback);
        });
        it('fires the property changed event when time source is changed', () => {
            const timeSourceComboBox = element.shadowRoot.querySelector(selectors.timeSource);
            timeSourceComboBox.dispatchEvent(
                new CustomEvent('change', {
                    detail: {
                        value: 'CreatedDate'
                    }
                })
            );
            expect(eventCallback).toHaveBeenCalled();
            expect(eventCallback.mock.calls[0][0]).toMatchObject({
                detail: {
                    guid: 'some guid',
                    propertyName: 'timeSource',
                    value: 'CreatedDate',
                    error: null
                }
            });
        });
        it('fires the property changed event when offset unit is changed', () => {
            const offsetUnitComboBox = element.shadowRoot.querySelector(selectors.offsetUnitAndDirection);
            offsetUnitComboBox.dispatchEvent(
                new CustomEvent('change', {
                    detail: {
                        value: TIME_OPTION.DAYS_AFTER
                    }
                })
            );
            expect(eventCallback).toHaveBeenCalled();
            expect(eventCallback.mock.calls[0][0]).toMatchObject({
                detail: {
                    guid: 'some guid',
                    propertyName: 'offsetUnit',
                    value: 'DaysAfter',
                    error: null
                }
            });
        });
        it('fires the property changed event when offset number is changed', () => {
            const offsetNumberInput = element.shadowRoot.querySelector(selectors.offsetNumber);
            offsetNumberInput.dispatchEvent(new CustomEvent('focusout'));
            expect(eventCallback).toHaveBeenCalled();
            expect(eventCallback.mock.calls[0][0]).toMatchObject({
                detail: {
                    guid: 'some guid',
                    propertyName: 'offsetNumber',
                    error: null
                }
            });
        });
    });
});