import {
    isMatch,
    getLHSTypes,
    getOperators,
    getRHSTypes,
    transformOperatorsForCombobox,
    setOperators,
    isCollectionRequired
} from '../operatorRuleUtil';
import {
    ASSIGN_COUNT,
    dateCollectionParam,
    dateParam,
    dateParamCannotBeElements,
    dateParamMissingCollection,
    dateParamMustBeElements,
    dateParamNoElementsList,
    mockAssignCount,
    mockRules,
    numberParamCanBeAnything,
    numberParamCannotBeField,
    numberParamCannotBeProperty,
    numberParamMustBeField,
    numberParamMustBeProperty,
    stageParam,
    stringParam
} from 'mock/ruleService';
import {
    stringVariableForPropertyEditor,
    dateVariable,
    dateCollectionVariable,
    stageElement,
    accountSObjectVariable,
    numberVariable
} from 'mock/storeData';
import { RULE_TYPES, RULE_PROPERTY, PARAM_PROPERTY } from '../rules';
import { ELEMENT_TYPE } from 'builder_platform_interaction/flowMetadata';
import { FLOW_DATA_TYPE } from 'builder_platform_interaction/dataTypeLib';

const { ASSIGNMENT, COMPARISON } = RULE_TYPES;
const ASSIGNMENT_OPERATOR = 'Assign';
const EQUALS_OPERATOR = 'Equals';
const { LEFT, RHS_PARAMS } = RULE_PROPERTY;
const {
    DATA_TYPE,
    IS_COLLECTION,
    SYSTEM_VARIABLE_REQUIREMENT,
    SOBJECT_FIELD_REQUIREMENT,
    APEX_PROPERTY_REQUIREMENT
} = PARAM_PROPERTY;
const mockAccountField = {
    sobjectName: 'Account',
    dataType: 'Number'
};
const mockApexProperty = {
    apexClass: 'someApex',
    dataType: 'Number'
};

describe('Operator Rule Util', () => {
    describe('isMatch util', () => {
        it('should return true if rule param and store element hydrated with errors match', () => {
            const isEqual = isMatch(stringParam, stringVariableForPropertyEditor());
            expect(isEqual).toBeTruthy();
        });

        it('should throw an error when given an empty rule param object', () => {
            expect(() => {
                isMatch({}, dateVariable);
            }).toThrow();
        });

        it('should throw an error when given an empty element object', () => {
            expect(() => {
                isMatch(stageParam, {});
            }).toThrow();
        });
        it('rule with collection = true should only match collection elements', () => {
            let isEqual = isMatch(dateCollectionParam, dateCollectionVariable);
            expect(isEqual).toBeTruthy();
            isEqual = isMatch(dateCollectionParam, dateVariable);
            expect(isEqual).toBeFalsy();
        });
        it('rule with collection = false should not match collection elements', () => {
            let isEqual = isMatch(dateParam, dateVariable);
            expect(isEqual).toBeTruthy();
            isEqual = isMatch(dateParam, dateCollectionVariable);
            expect(isEqual).toBeFalsy();
        });
        it('rule with collection undefined should match noncollection or collection elements', () => {
            let isEqual = isMatch(dateParamMissingCollection, dateVariable);
            expect(isEqual).toBeTruthy();
            isEqual = isMatch(dateParamMissingCollection, dateCollectionVariable);
            expect(isEqual).toBeTruthy();
        });
        it('for dataType param, elementType can be in canBe or mustBe list', () => {
            let isEqual = isMatch(dateParam, dateVariable);
            expect(isEqual).toBeTruthy();
            isEqual = isMatch(dateParamMustBeElements, dateVariable);
            expect(isEqual).toBeTruthy();
        });
        it('for dataType param, elementType can not be in cannotBe list', () => {
            const isEqual = isMatch(dateParamCannotBeElements, dateVariable);
            expect(isEqual).toBeFalsy();
        });
        it('dataType param should match if elementType is not mentioned', () => {
            const isEqual = isMatch(dateParamNoElementsList, dateVariable);
            expect(isEqual).toBeTruthy();
        });
        it('field should not be allowed if operator param says cannotBe sObjectField', () => {
            const isEqual = isMatch(numberParamCannotBeField, mockAccountField);
            expect(isEqual).toBeFalsy();
        });
        it('field should be allowed if operator param says canBe or mustBe sObjectField', () => {
            let isEqual = isMatch(numberParamCanBeAnything, mockAccountField);
            expect(isEqual).toBeTruthy();
            isEqual = isMatch(numberParamMustBeField, mockAccountField);
            expect(isEqual).toBeTruthy();
        });
        it('property should not be allowed if operator param says cannotBe apexProperty', () => {
            const isEqual = isMatch(numberParamCannotBeProperty, mockApexProperty);
            expect(isEqual).toBeFalsy();
        });
        it('field should be allowed if operator param says canBe or mustBe apexProperty', () => {
            let isEqual = isMatch(numberParamCanBeAnything, mockApexProperty);
            expect(isEqual).toBeTruthy();
            isEqual = isMatch(numberParamMustBeProperty, mockApexProperty);
            expect(isEqual).toBeTruthy();
        });
    });

    describe('get left hand side types util', () => {
        it('should return an object', () => {
            const rules = getLHSTypes(ELEMENT_TYPE.ASSIGNMENT, mockRules, ASSIGNMENT);
            expect(rules).toEqual(expect.any(Object));
        });

        it('should return an object with data type to param type mapping', () => {
            const rules = getLHSTypes(ELEMENT_TYPE.ASSIGNMENT, mockRules, ASSIGNMENT);
            const keys = Object.keys(rules);
            expect(rules).toMatchObject({
                [keys[0]]: expect.any(Array)
            });
        });

        it('should return all the left hand side types for assignment rules, excluding appropriately', () => {
            const rules = getLHSTypes(ELEMENT_TYPE.ASSIGNMENT, mockRules, ASSIGNMENT);
            const expectedDate = mockRules[0][LEFT];
            const expectedStage = mockRules[2][LEFT];
            const expectedSObject = mockRules[5][LEFT];
            expect(rules).toMatchObject({
                Date: [expectedDate],
                STAGE: [expectedStage],
                SObject: [expectedSObject]
            });
        });

        it('should return all the left hand side types for assignment rules', () => {
            const rules = getLHSTypes(ELEMENT_TYPE.RECORD_CREATE, mockRules, ASSIGNMENT);
            const expectedDate = mockRules[0][LEFT];
            const expectedDateTime = mockRules[1][LEFT];
            const expectedStage = mockRules[2][LEFT];
            const expectedSObject = mockRules[5][LEFT];
            expect(rules).toMatchObject({
                Date: [expectedDate],
                DateTime: [expectedDateTime],
                STAGE: [expectedStage],
                SObject: [expectedSObject]
            });
        });

        it('should return all the left hand side types for comparison rules', () => {
            const rules = getLHSTypes(ELEMENT_TYPE.ASSIGNMENT, mockRules, COMPARISON);
            const expectedStage1 = mockRules[3][LEFT];
            const expectedStage2 = mockRules[7][LEFT];
            expect(rules).toMatchObject({
                STAGE: [expectedStage1, expectedStage2]
            });
        });

        it('should remove duplicates from list of left hand side types', () => {
            const rules = getLHSTypes(ELEMENT_TYPE.ASSIGNMENT, mockRules, COMPARISON);
            expect(Object.keys(rules)).toHaveLength(4); // 1 for the dataType, 3 for canBeSobjectField, canBeSystemVariable, canBeApexProperty
        });

        it('does not throw an error when given an undefined rule type', () => {
            expect(() => {
                getLHSTypes(ELEMENT_TYPE.ASSIGNMENT, mockRules);
            }).not.toThrow();
        });

        it('throws an error when the give rules are not an Array', () => {
            expect(() => {
                getLHSTypes(ELEMENT_TYPE.ASSIGNMENT, 42, ASSIGNMENT);
            }).toThrow();
        });

        it('throws an error when given an invalid rule type', () => {
            expect(() => {
                getLHSTypes(ELEMENT_TYPE.ASSIGNMENT, mockRules, 'invalidRuleType');
            }).toThrow();
        });

        it('should store RHS param under "sobject" if LHS does not have subtype', () => {
            const rhsTypes = getRHSTypes(ELEMENT_TYPE.ASSIGNMENT, numberVariable, ASSIGN_COUNT, mockAssignCount);
            expect(rhsTypes[FLOW_DATA_TYPE.SOBJECT.value]).toBeDefined();
            expect(rhsTypes[FLOW_DATA_TYPE.SOBJECT.value]).toHaveLength(1);
            expect(rhsTypes[FLOW_DATA_TYPE.SOBJECT.value][0][DATA_TYPE]).toEqual(FLOW_DATA_TYPE.SOBJECT.value);
        });
    });

    describe('get operator types util', () => {
        it('should only return results from the given rule type', () => {
            let operators = getOperators(ELEMENT_TYPE.ASSIGNMENT, dateVariable, mockRules, ASSIGNMENT);
            expect(operators).toHaveLength(1);
            operators = getOperators(ELEMENT_TYPE.ASSIGNMENT, stageElement, mockRules, COMPARISON);
            expect(operators).toHaveLength(1);
        });

        it('should return an empty array if given no lhs information', () => {
            const operators = getOperators(ELEMENT_TYPE.ASSIGNMENT, undefined, mockRules, ASSIGNMENT);
            expect(operators).toHaveLength(0);
        });

        it('should return all the operators per rule type', () => {
            let operators = getOperators(ELEMENT_TYPE.ASSIGNMENT, dateVariable, mockRules, ASSIGNMENT);
            expect(operators[0]).toEqual(ASSIGNMENT_OPERATOR);
            operators = getOperators(ELEMENT_TYPE.ASSIGNMENT, stageElement, mockRules, COMPARISON);
            expect(operators[0]).toEqual(EQUALS_OPERATOR);
        });

        it('should remove duplicates from the list of operators', () => {
            const operators = getOperators(ELEMENT_TYPE.ASSIGNMENT, stageElement, mockRules, COMPARISON);
            expect(operators).toHaveLength(1);
        });

        it('does not throw an error when given an undefined rule type', () => {
            expect(() => {
                getOperators(ELEMENT_TYPE.ASSIGNMENT, dateVariable, mockRules);
            }).not.toThrow();
        });

        it('throws an error when the give rules are not an Array', () => {
            expect(() => {
                getOperators(ELEMENT_TYPE.ASSIGNMENT, dateVariable, 42, ASSIGNMENT);
            }).toThrow();
        });

        it('throws an error when given an invalid rule type', () => {
            expect(() => {
                getOperators(ELEMENT_TYPE.ASSIGNMENT, dateVariable, mockRules, 'invalidRuleType');
            }).toThrow();
        });
    });

    describe('transformOperatorsForCombobox', () => {
        const mockOperators = ['fancyOperator'];
        const mockMap = {
            fancyOperator: 'Fancy Operator'
        };

        beforeEach(() => {
            setOperators(mockMap);
        });

        it('returns a menu item with label from operator label map', () => {
            const result = transformOperatorsForCombobox(mockOperators);
            expect(result).toEqual(expect.any(Array));
            expect(result).toEqual([{ value: mockOperators[0], label: mockMap[mockOperators[0]] }]);
        });

        it('returns an array of objects with value and label properties', () => {
            const result = transformOperatorsForCombobox(mockOperators);
            expect(result).toEqual([{ value: expect.anything(), label: expect.anything() }]);
        });
    });

    describe('get right hand side types util', () => {
        it('should return an empty object if given no lhs information', () => {
            const rhsTypes = getRHSTypes(ELEMENT_TYPE.ASSIGNMENT, undefined, 'someOperator', mockRules, ASSIGNMENT);
            expect(Object.keys(rhsTypes)).toHaveLength(0);
        });

        it('should return an object with data type to param type mapping', () => {
            const rhsTypes = getRHSTypes(
                ELEMENT_TYPE.ASSIGNMENT,
                dateVariable,
                ASSIGNMENT_OPERATOR,
                mockRules,
                ASSIGNMENT
            );
            expect(Object.keys(rhsTypes)).toHaveLength(5);
            expect(rhsTypes).toMatchObject({
                Date: expect.any(Array),
                DateTime: expect.any(Array),
                [SOBJECT_FIELD_REQUIREMENT]: true,
                [SYSTEM_VARIABLE_REQUIREMENT]: true,
                [APEX_PROPERTY_REQUIREMENT]: true
            });
        });
        it('should return an object with data type to param type mapping for all rules that match', () => {
            const rhsTypes = getRHSTypes(ELEMENT_TYPE.ASSIGNMENT, stageElement, EQUALS_OPERATOR, mockRules, COMPARISON);
            expect(Object.keys(rhsTypes)).toHaveLength(5);
            // the Stage param & DateTime param come from two different rules that match the LHS & operator pair
            expect(rhsTypes).toMatchObject({
                STAGE: expect.any(Array),
                DateTime: expect.any(Array),
                [SOBJECT_FIELD_REQUIREMENT]: false,
                [SYSTEM_VARIABLE_REQUIREMENT]: true,
                [APEX_PROPERTY_REQUIREMENT]: true
            });
        });

        it('should return all the rhsTypes for assignment rules', () => {
            const rhsTypes = getRHSTypes(
                ELEMENT_TYPE.ASSIGNMENT,
                dateVariable,
                ASSIGNMENT_OPERATOR,
                mockRules,
                ASSIGNMENT
            );
            const expectedDate = mockRules[0][RHS_PARAMS][0];
            const expectedDateTime = mockRules[0][RHS_PARAMS][1];
            expect(rhsTypes).toMatchObject({
                Date: [expectedDate],
                DateTime: [expectedDateTime]
            });
        });

        it('should return all the rhsTypes for the comparison rules, excluding appropriately', () => {
            const rhsTypes = getRHSTypes(ELEMENT_TYPE.DECISION, stageElement, EQUALS_OPERATOR, mockRules, COMPARISON);
            const expectedDateTime = mockRules[4][RHS_PARAMS][0];
            expect(rhsTypes).toMatchObject({
                DateTime: [expectedDateTime]
            });
        });

        it('should return all the rhsTypes for the comparison rules', () => {
            const rhsTypes = getRHSTypes(
                ELEMENT_TYPE.RECORD_UPDATE,
                stageElement,
                EQUALS_OPERATOR,
                mockRules,
                COMPARISON
            );
            const expectedStage = mockRules[2][RHS_PARAMS][0];
            expect(rhsTypes).toMatchObject({
                STAGE: [expectedStage]
            });
        });

        it('should sort sObjects by object type', () => {
            const rhsTypes = getRHSTypes(
                ELEMENT_TYPE.ASSIGNMENT,
                accountSObjectVariable,
                ASSIGNMENT_OPERATOR,
                mockRules,
                ASSIGNMENT
            );
            expect(rhsTypes).toHaveProperty('Account');
        });

        it('throws an error when given an invalid rule type', () => {
            expect(() => {
                getRHSTypes(ELEMENT_TYPE.ASSIGNMENT, dateVariable, ASSIGNMENT_OPERATOR, mockRules, 'invalidRuleType');
            }).toThrow();
        });

        it('does not throw an error when given an undefined rule type', () => {
            expect(() => {
                getRHSTypes(ELEMENT_TYPE.ASSIGNMENT, dateVariable, ASSIGNMENT_OPERATOR, mockRules);
            }).not.toThrow();
        });

        it('throws an error when the give rules are not an Array', () => {
            expect(() => {
                getRHSTypes(ELEMENT_TYPE.ASSIGNMENT, dateVariable, ASSIGNMENT_OPERATOR, 42, ASSIGNMENT);
            }).toThrow();
        });
    });

    describe('isCollectionRequired', () => {
        it('returns false when given no dataType', () => {
            const isRequired = isCollectionRequired({});
            expect(isRequired).toEqual(false);
        });

        it('returns false when there is no param for the given dataType', () => {
            const isRequired = isCollectionRequired({}, 'fooDataType');
            expect(isRequired).toEqual(false);
        });

        it('returns false when there is a param where literals are allowed', () => {
            const mockDataType = 'fooDataType';
            const mockParam = { IS_COLLECTION: false };
            const mockAllowedParams = {
                [mockDataType]: [mockParam]
            };

            const isRequired = isCollectionRequired(mockAllowedParams, mockDataType);
            expect(isRequired).toEqual(false);
        });

        it('returns true when all params require a collection', () => {
            const mockDataType = 'fooDataType';
            const mockParamOne = { [IS_COLLECTION]: true };
            const mockParamTwo = { [IS_COLLECTION]: true };
            const mockAllowedParams = {
                [mockDataType]: [mockParamOne, mockParamTwo]
            };

            const isRequired = isCollectionRequired(mockAllowedParams, mockDataType);
            expect(isRequired).toEqual(true);
        });
    });

    // no element param any more
    // if it's an apex type, store by apex class name in allowedParamType map
});