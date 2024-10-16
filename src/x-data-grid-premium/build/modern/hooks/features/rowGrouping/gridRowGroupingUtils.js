import _extends from "@babel/runtime/helpers/esm/extends";
import { passFilterLogic } from '@mui/x-data-grid-pro/internals';
import { gridRowGroupingSanitizedModelSelector } from "./gridRowGroupingSelector.js";
export const GRID_ROW_GROUPING_SINGLE_GROUPING_FIELD = '__row_group_by_columns_group__';
export const ROW_GROUPING_STRATEGY = 'grouping-columns';
export const getRowGroupingFieldFromGroupingCriteria = groupingCriteria => {
  if (groupingCriteria === null) {
    return GRID_ROW_GROUPING_SINGLE_GROUPING_FIELD;
  }
  return `__row_group_by_columns_group_${groupingCriteria}__`;
};
export const getRowGroupingCriteriaFromGroupingField = groupingColDefField => {
  const match = groupingColDefField.match(/^__row_group_by_columns_group_(.*)__$/);
  if (!match) {
    return null;
  }
  return match[1];
};
export const isGroupingColumn = field => field === GRID_ROW_GROUPING_SINGLE_GROUPING_FIELD || getRowGroupingCriteriaFromGroupingField(field) !== null;
/**
 * When filtering a group, we only want to filter according to the items related to this grouping column.
 */
const shouldApplyFilterItemOnGroup = (columnField, node) => {
  if (columnField === GRID_ROW_GROUPING_SINGLE_GROUPING_FIELD) {
    return true;
  }
  const groupingCriteriaField = getRowGroupingCriteriaFromGroupingField(columnField);
  return groupingCriteriaField === node.groupingField;
};

/**
 * A leaf is visible if it passed the filter
 * A group is visible if all the following criteria are met:
 * - One of its children is passing the filter
 * - It is passing the filter
 */
export const filterRowTreeFromGroupingColumns = params => {
  const {
    apiRef,
    rowTree,
    isRowMatchingFilters,
    filterModel
  } = params;
  const filteredRowsLookup = {};
  const filteredChildrenCountLookup = {};
  const filteredDescendantCountLookup = {};
  const filterCache = {};
  const filterTreeNode = (node, areAncestorsExpanded, ancestorsResults) => {
    const filterResults = {
      passingFilterItems: null,
      passingQuickFilterValues: null
    };
    let isPassingFiltering = false;
    if (isRowMatchingFilters && node.type !== 'footer') {
      const shouldApplyItem = node.type === 'group' && node.isAutoGenerated ? columnField => shouldApplyFilterItemOnGroup(columnField, node) : undefined;
      const row = apiRef.current.getRow(node.id);
      isRowMatchingFilters(row, shouldApplyItem, filterResults);
    } else {
      isPassingFiltering = true;
    }
    let filteredChildrenCount = 0;
    let filteredDescendantCount = 0;
    if (node.type === 'group') {
      node.children.forEach(childId => {
        const childNode = rowTree[childId];
        const childSubTreeSize = filterTreeNode(childNode, areAncestorsExpanded && !!node.childrenExpanded, [...ancestorsResults, filterResults]);
        filteredDescendantCount += childSubTreeSize;
        if (childSubTreeSize > 0) {
          filteredChildrenCount += 1;
        }
      });
    }
    if (isPassingFiltering === false) {
      if (node.type === 'group') {
        // If node has children - it's passing if at least one child passes filters
        isPassingFiltering = filteredDescendantCount > 0;
      } else {
        const allResults = [...ancestorsResults, filterResults];
        isPassingFiltering = passFilterLogic(allResults.map(result => result.passingFilterItems), allResults.map(result => result.passingQuickFilterValues), filterModel, params.apiRef, filterCache);
      }
    }
    filteredRowsLookup[node.id] = isPassingFiltering;
    if (!isPassingFiltering) {
      return 0;
    }
    filteredChildrenCountLookup[node.id] = filteredChildrenCount;
    filteredDescendantCountLookup[node.id] = filteredDescendantCount;
    if (node.type !== 'group') {
      return filteredDescendantCount + 1;
    }
    return filteredDescendantCount;
  };
  const nodes = Object.values(rowTree);
  for (let i = 0; i < nodes.length; i += 1) {
    const node = nodes[i];
    if (node.depth === 0) {
      filterTreeNode(node, true, []);
    }
  }
  return {
    filteredRowsLookup,
    filteredChildrenCountLookup,
    filteredDescendantCountLookup
  };
};
export const getColDefOverrides = (groupingColDefProp, fields) => {
  if (typeof groupingColDefProp === 'function') {
    return groupingColDefProp({
      groupingName: ROW_GROUPING_STRATEGY,
      fields
    });
  }
  return groupingColDefProp;
};
export const mergeStateWithRowGroupingModel = rowGroupingModel => state => _extends({}, state, {
  rowGrouping: _extends({}, state.rowGrouping, {
    model: rowGroupingModel
  })
});
export const setStrategyAvailability = (privateApiRef, disableRowGrouping) => {
  let isAvailable;
  if (disableRowGrouping) {
    isAvailable = () => false;
  } else {
    isAvailable = () => {
      const rowGroupingSanitizedModel = gridRowGroupingSanitizedModelSelector(privateApiRef);
      return rowGroupingSanitizedModel.length > 0;
    };
  }
  privateApiRef.current.setStrategyAvailability('rowTree', ROW_GROUPING_STRATEGY, isAvailable);
};
export const getCellGroupingCriteria = ({
  row,
  colDef,
  groupingRule,
  apiRef
}) => {
  let key;
  if (groupingRule.groupingValueGetter) {
    key = groupingRule.groupingValueGetter(row[groupingRule.field], row, colDef, apiRef);
  } else {
    key = row[groupingRule.field];
  }
  return {
    key,
    field: groupingRule.field
  };
};
export const getGroupingRules = ({
  sanitizedRowGroupingModel,
  columnsLookup
}) => sanitizedRowGroupingModel.map(field => ({
  field,
  groupingValueGetter: columnsLookup[field]?.groupingValueGetter
}));

/**
 * Compares two sets of grouping rules to determine if they are equal or not.
 */
export const areGroupingRulesEqual = (newValue, previousValue) => {
  if (previousValue.length !== newValue.length) {
    return false;
  }
  return newValue.every((newRule, newRuleIndex) => {
    const previousRule = previousValue[newRuleIndex];
    if (previousRule.groupingValueGetter !== newRule.groupingValueGetter) {
      return false;
    }
    if (previousRule.field !== newRule.field) {
      return false;
    }
    return true;
  });
};