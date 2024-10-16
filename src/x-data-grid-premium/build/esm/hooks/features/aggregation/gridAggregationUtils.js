import _extends from "@babel/runtime/helpers/esm/extends";
import { unstable_capitalize as capitalize } from '@mui/utils';
import { GRID_ID_AUTOGENERATED } from '@mui/x-data-grid/internals';
import { GRID_ROOT_GROUP_ID } from '@mui/x-data-grid-pro';
import { addPinnedRow, isDeepEqual, insertNodeInTree, removeNodeFromTree } from '@mui/x-data-grid-pro/internals';
export const GRID_AGGREGATION_ROOT_FOOTER_ROW_ID = 'auto-generated-group-footer-root';
export const getAggregationFooterRowIdFromGroupId = groupId => {
  if (groupId == null) {
    return GRID_AGGREGATION_ROOT_FOOTER_ROW_ID;
  }
  return `auto-generated-group-footer-${groupId}`;
};
export const canColumnHaveAggregationFunction = ({
  colDef,
  aggregationFunctionName,
  aggregationFunction
}) => {
  if (!colDef) {
    return false;
  }
  if (!aggregationFunction) {
    return false;
  }
  if (colDef.availableAggregationFunctions != null) {
    return colDef.availableAggregationFunctions.includes(aggregationFunctionName);
  }
  if (!aggregationFunction.columnTypes) {
    return true;
  }
  return aggregationFunction.columnTypes.includes(colDef.type);
};
export const getAvailableAggregationFunctions = ({
  aggregationFunctions,
  colDef
}) => Object.keys(aggregationFunctions).filter(aggregationFunctionName => canColumnHaveAggregationFunction({
  colDef,
  aggregationFunctionName,
  aggregationFunction: aggregationFunctions[aggregationFunctionName]
}));
export const mergeStateWithAggregationModel = aggregationModel => state => _extends({}, state, {
  aggregation: _extends({}, state.aggregation, {
    model: aggregationModel
  })
});
export const getAggregationRules = ({
  columnsLookup,
  aggregationModel,
  aggregationFunctions
}) => {
  const aggregationRules = {};
  Object.entries(aggregationModel).forEach(([field, columnItem]) => {
    if (columnsLookup[field] && canColumnHaveAggregationFunction({
      colDef: columnsLookup[field],
      aggregationFunctionName: columnItem,
      aggregationFunction: aggregationFunctions[columnItem]
    })) {
      aggregationRules[field] = {
        aggregationFunctionName: columnItem,
        aggregationFunction: aggregationFunctions[columnItem]
      };
    }
  });
  return aggregationRules;
};
/**
 * Add a footer for each group that has at least one column with an aggregated value.
 */
export const addFooterRows = ({
  groupingParams,
  apiRef,
  getAggregationPosition,
  hasAggregationRule
}) => {
  let newGroupingParams = _extends({}, groupingParams, {
    tree: _extends({}, groupingParams.tree),
    treeDepths: _extends({}, groupingParams.treeDepths)
  });
  const updateChildGroupFooter = groupNode => {
    const shouldHaveFooter = hasAggregationRule && getAggregationPosition(groupNode) === 'footer';
    if (shouldHaveFooter) {
      const footerId = getAggregationFooterRowIdFromGroupId(groupNode.id);
      if (groupNode.footerId !== footerId) {
        if (groupNode.footerId != null) {
          removeNodeFromTree({
            node: newGroupingParams.tree[groupNode.footerId],
            tree: newGroupingParams.tree,
            treeDepths: newGroupingParams.treeDepths
          });
        }
        const footerNode = {
          id: footerId,
          parent: groupNode.id,
          depth: groupNode ? groupNode.depth + 1 : 0,
          type: 'footer'
        };
        insertNodeInTree(footerNode, newGroupingParams.tree, newGroupingParams.treeDepths, null);
      }
    } else if (groupNode.footerId != null) {
      removeNodeFromTree({
        node: newGroupingParams.tree[groupNode.footerId],
        tree: newGroupingParams.tree,
        treeDepths: newGroupingParams.treeDepths
      });
      newGroupingParams.tree[groupNode.id] = _extends({}, newGroupingParams.tree[groupNode.id], {
        footerId: null
      });
    }
  };
  const updateRootGroupFooter = groupNode => {
    const shouldHaveFooter = hasAggregationRule && getAggregationPosition(groupNode) === 'footer';
    if (shouldHaveFooter) {
      const rowId = getAggregationFooterRowIdFromGroupId(null);
      newGroupingParams = addPinnedRow({
        groupingParams: newGroupingParams,
        rowModel: {
          [GRID_ID_AUTOGENERATED]: rowId
        },
        rowId,
        position: 'bottom',
        apiRef,
        isAutoGenerated: true
      });
    }
  };
  const updateGroupFooter = groupNode => {
    if (groupNode.id === GRID_ROOT_GROUP_ID) {
      updateRootGroupFooter(groupNode);
    } else {
      updateChildGroupFooter(groupNode);
    }
    groupNode.children.forEach(childId => {
      const childNode = newGroupingParams.tree[childId];
      if (childNode.type === 'group') {
        updateGroupFooter(childNode);
      }
    });
  };
  updateGroupFooter(newGroupingParams.tree[GRID_ROOT_GROUP_ID]);
  return newGroupingParams;
};

/**
 * Compares two sets of aggregation rules to determine if they are equal or not.
 */
export const areAggregationRulesEqual = (previousValue, newValue) => {
  const previousFields = Object.keys(previousValue ?? {});
  const newFields = Object.keys(newValue);
  if (!isDeepEqual(previousFields, newFields)) {
    return false;
  }
  return newFields.every(field => {
    const previousRule = previousValue?.[field];
    const newRule = newValue[field];
    if (previousRule?.aggregationFunction !== newRule?.aggregationFunction) {
      return false;
    }
    if (previousRule?.aggregationFunctionName !== newRule?.aggregationFunctionName) {
      return false;
    }
    return true;
  });
};
export const getAggregationFunctionLabel = ({
  apiRef,
  aggregationRule
}) => {
  if (aggregationRule.aggregationFunction.label != null) {
    return aggregationRule.aggregationFunction.label;
  }
  try {
    return apiRef.current.getLocaleText(`aggregationFunctionLabel${capitalize(aggregationRule.aggregationFunctionName)}`);
  } catch {
    return aggregationRule.aggregationFunctionName;
  }
};