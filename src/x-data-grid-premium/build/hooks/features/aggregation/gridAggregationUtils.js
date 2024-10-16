"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mergeStateWithAggregationModel = exports.getAvailableAggregationFunctions = exports.getAggregationRules = exports.getAggregationFunctionLabel = exports.getAggregationFooterRowIdFromGroupId = exports.canColumnHaveAggregationFunction = exports.areAggregationRulesEqual = exports.addFooterRows = exports.GRID_AGGREGATION_ROOT_FOOTER_ROW_ID = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _utils = require("@mui/utils");
var _internals = require("@mui/x-data-grid/internals");
var _xDataGridPro = require("@mui/x-data-grid-pro");
var _internals2 = require("@mui/x-data-grid-pro/internals");
const GRID_AGGREGATION_ROOT_FOOTER_ROW_ID = exports.GRID_AGGREGATION_ROOT_FOOTER_ROW_ID = 'auto-generated-group-footer-root';
const getAggregationFooterRowIdFromGroupId = groupId => {
  if (groupId == null) {
    return GRID_AGGREGATION_ROOT_FOOTER_ROW_ID;
  }
  return `auto-generated-group-footer-${groupId}`;
};
exports.getAggregationFooterRowIdFromGroupId = getAggregationFooterRowIdFromGroupId;
const canColumnHaveAggregationFunction = ({
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
exports.canColumnHaveAggregationFunction = canColumnHaveAggregationFunction;
const getAvailableAggregationFunctions = ({
  aggregationFunctions,
  colDef
}) => Object.keys(aggregationFunctions).filter(aggregationFunctionName => canColumnHaveAggregationFunction({
  colDef,
  aggregationFunctionName,
  aggregationFunction: aggregationFunctions[aggregationFunctionName]
}));
exports.getAvailableAggregationFunctions = getAvailableAggregationFunctions;
const mergeStateWithAggregationModel = aggregationModel => state => (0, _extends2.default)({}, state, {
  aggregation: (0, _extends2.default)({}, state.aggregation, {
    model: aggregationModel
  })
});
exports.mergeStateWithAggregationModel = mergeStateWithAggregationModel;
const getAggregationRules = ({
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
exports.getAggregationRules = getAggregationRules;
/**
 * Add a footer for each group that has at least one column with an aggregated value.
 */
const addFooterRows = ({
  groupingParams,
  apiRef,
  getAggregationPosition,
  hasAggregationRule
}) => {
  let newGroupingParams = (0, _extends2.default)({}, groupingParams, {
    tree: (0, _extends2.default)({}, groupingParams.tree),
    treeDepths: (0, _extends2.default)({}, groupingParams.treeDepths)
  });
  const updateChildGroupFooter = groupNode => {
    const shouldHaveFooter = hasAggregationRule && getAggregationPosition(groupNode) === 'footer';
    if (shouldHaveFooter) {
      const footerId = getAggregationFooterRowIdFromGroupId(groupNode.id);
      if (groupNode.footerId !== footerId) {
        if (groupNode.footerId != null) {
          (0, _internals2.removeNodeFromTree)({
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
        (0, _internals2.insertNodeInTree)(footerNode, newGroupingParams.tree, newGroupingParams.treeDepths, null);
      }
    } else if (groupNode.footerId != null) {
      (0, _internals2.removeNodeFromTree)({
        node: newGroupingParams.tree[groupNode.footerId],
        tree: newGroupingParams.tree,
        treeDepths: newGroupingParams.treeDepths
      });
      newGroupingParams.tree[groupNode.id] = (0, _extends2.default)({}, newGroupingParams.tree[groupNode.id], {
        footerId: null
      });
    }
  };
  const updateRootGroupFooter = groupNode => {
    const shouldHaveFooter = hasAggregationRule && getAggregationPosition(groupNode) === 'footer';
    if (shouldHaveFooter) {
      const rowId = getAggregationFooterRowIdFromGroupId(null);
      newGroupingParams = (0, _internals2.addPinnedRow)({
        groupingParams: newGroupingParams,
        rowModel: {
          [_internals.GRID_ID_AUTOGENERATED]: rowId
        },
        rowId,
        position: 'bottom',
        apiRef,
        isAutoGenerated: true
      });
    }
  };
  const updateGroupFooter = groupNode => {
    if (groupNode.id === _xDataGridPro.GRID_ROOT_GROUP_ID) {
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
  updateGroupFooter(newGroupingParams.tree[_xDataGridPro.GRID_ROOT_GROUP_ID]);
  return newGroupingParams;
};

/**
 * Compares two sets of aggregation rules to determine if they are equal or not.
 */
exports.addFooterRows = addFooterRows;
const areAggregationRulesEqual = (previousValue, newValue) => {
  const previousFields = Object.keys(previousValue ?? {});
  const newFields = Object.keys(newValue);
  if (!(0, _internals2.isDeepEqual)(previousFields, newFields)) {
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
exports.areAggregationRulesEqual = areAggregationRulesEqual;
const getAggregationFunctionLabel = ({
  apiRef,
  aggregationRule
}) => {
  if (aggregationRule.aggregationFunction.label != null) {
    return aggregationRule.aggregationFunction.label;
  }
  try {
    return apiRef.current.getLocaleText(`aggregationFunctionLabel${(0, _utils.unstable_capitalize)(aggregationRule.aggregationFunctionName)}`);
  } catch {
    return aggregationRule.aggregationFunctionName;
  }
};
exports.getAggregationFunctionLabel = getAggregationFunctionLabel;