"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useGridRowGroupingPreProcessors = void 0;
var React = _interopRequireWildcard(require("react"));
var _xDataGridPro = require("@mui/x-data-grid-pro");
var _internals = require("@mui/x-data-grid-pro/internals");
var _gridRowGroupingSelector = require("./gridRowGroupingSelector");
var _createGroupingColDef = require("./createGroupingColDef");
var _gridRowGroupingUtils = require("./gridRowGroupingUtils");
const useGridRowGroupingPreProcessors = (apiRef, props) => {
  const getGroupingColDefs = React.useCallback(columnsState => {
    if (props.disableRowGrouping) {
      return [];
    }
    const groupingColDefProp = props.groupingColDef;

    // We can't use `gridGroupingRowsSanitizedModelSelector` here because the new columns are not in the state yet
    const rowGroupingModel = (0, _gridRowGroupingSelector.gridRowGroupingModelSelector)(apiRef).filter(field => !!columnsState.lookup[field]);
    if (rowGroupingModel.length === 0) {
      return [];
    }
    switch (props.rowGroupingColumnMode) {
      case 'single':
        {
          return [(0, _createGroupingColDef.createGroupingColDefForAllGroupingCriteria)({
            apiRef,
            rowGroupingModel,
            colDefOverride: (0, _gridRowGroupingUtils.getColDefOverrides)(groupingColDefProp, rowGroupingModel),
            columnsLookup: columnsState.lookup
          })];
        }
      case 'multiple':
        {
          return rowGroupingModel.map(groupingCriteria => (0, _createGroupingColDef.createGroupingColDefForOneGroupingCriteria)({
            groupingCriteria,
            colDefOverride: (0, _gridRowGroupingUtils.getColDefOverrides)(groupingColDefProp, [groupingCriteria]),
            groupedByColDef: columnsState.lookup[groupingCriteria],
            columnsLookup: columnsState.lookup
          }));
        }
      default:
        {
          return [];
        }
    }
  }, [apiRef, props.groupingColDef, props.rowGroupingColumnMode, props.disableRowGrouping]);
  const updateGroupingColumn = React.useCallback(columnsState => {
    const groupingColDefs = getGroupingColDefs(columnsState);
    let newColumnFields = [];
    const newColumnsLookup = {};

    // We only keep the non-grouping columns
    columnsState.orderedFields.forEach(field => {
      if (!(0, _gridRowGroupingUtils.isGroupingColumn)(field)) {
        newColumnFields.push(field);
        newColumnsLookup[field] = columnsState.lookup[field];
      }
    });

    // We add the grouping column
    groupingColDefs.forEach(groupingColDef => {
      const matchingGroupingColDef = columnsState.lookup[groupingColDef.field];
      if (matchingGroupingColDef) {
        groupingColDef.width = matchingGroupingColDef.width;
        groupingColDef.flex = matchingGroupingColDef.flex;
      }
      newColumnsLookup[groupingColDef.field] = groupingColDef;
    });
    const startIndex = newColumnFields[0] === _xDataGridPro.GRID_CHECKBOX_SELECTION_FIELD ? 1 : 0;
    newColumnFields = [...newColumnFields.slice(0, startIndex), ...groupingColDefs.map(colDef => colDef.field), ...newColumnFields.slice(startIndex)];
    columnsState.orderedFields = newColumnFields;
    columnsState.lookup = newColumnsLookup;
    return columnsState;
  }, [getGroupingColDefs]);
  const createRowTreeForRowGrouping = React.useCallback(params => {
    const sanitizedRowGroupingModel = (0, _gridRowGroupingSelector.gridRowGroupingSanitizedModelSelector)(apiRef);
    const columnsLookup = (0, _xDataGridPro.gridColumnLookupSelector)(apiRef);
    const groupingRules = (0, _gridRowGroupingUtils.getGroupingRules)({
      sanitizedRowGroupingModel,
      columnsLookup
    });
    apiRef.current.caches.rowGrouping.rulesOnLastRowTreeCreation = groupingRules;
    const getRowTreeBuilderNode = rowId => {
      const row = params.dataRowIdToModelLookup[rowId];
      const parentPath = groupingRules.map(groupingRule => (0, _gridRowGroupingUtils.getCellGroupingCriteria)({
        row,
        groupingRule,
        colDef: columnsLookup[groupingRule.field],
        apiRef
      })).filter(cell => cell.key != null);
      const leafGroupingCriteria = {
        key: rowId.toString(),
        field: null
      };
      return {
        path: [...parentPath, leafGroupingCriteria],
        id: rowId
      };
    };
    if (params.updates.type === 'full') {
      return (0, _internals.createRowTree)({
        previousTree: params.previousTree,
        nodes: params.updates.rows.map(getRowTreeBuilderNode),
        defaultGroupingExpansionDepth: props.defaultGroupingExpansionDepth,
        isGroupExpandedByDefault: props.isGroupExpandedByDefault,
        groupingName: _gridRowGroupingUtils.ROW_GROUPING_STRATEGY
      });
    }
    return (0, _internals.updateRowTree)({
      nodes: {
        inserted: params.updates.actions.insert.map(getRowTreeBuilderNode),
        modified: params.updates.actions.modify.map(getRowTreeBuilderNode),
        removed: params.updates.actions.remove
      },
      previousTree: params.previousTree,
      previousTreeDepth: params.previousTreeDepths,
      defaultGroupingExpansionDepth: props.defaultGroupingExpansionDepth,
      isGroupExpandedByDefault: props.isGroupExpandedByDefault,
      groupingName: _gridRowGroupingUtils.ROW_GROUPING_STRATEGY
    });
  }, [apiRef, props.defaultGroupingExpansionDepth, props.isGroupExpandedByDefault]);
  const filterRows = React.useCallback(params => {
    const rowTree = (0, _xDataGridPro.gridRowTreeSelector)(apiRef);
    return (0, _gridRowGroupingUtils.filterRowTreeFromGroupingColumns)({
      rowTree,
      isRowMatchingFilters: params.isRowMatchingFilters,
      filterModel: params.filterModel,
      apiRef
    });
  }, [apiRef]);
  const sortRows = React.useCallback(params => {
    const rowTree = (0, _xDataGridPro.gridRowTreeSelector)(apiRef);
    return (0, _internals.sortRowTree)({
      rowTree,
      sortRowList: params.sortRowList,
      disableChildrenSorting: false,
      shouldRenderGroupBelowLeaves: true
    });
  }, [apiRef]);
  (0, _internals.useGridRegisterPipeProcessor)(apiRef, 'hydrateColumns', updateGroupingColumn);
  (0, _internals.useGridRegisterStrategyProcessor)(apiRef, _gridRowGroupingUtils.ROW_GROUPING_STRATEGY, 'rowTreeCreation', createRowTreeForRowGrouping);
  (0, _internals.useGridRegisterStrategyProcessor)(apiRef, _gridRowGroupingUtils.ROW_GROUPING_STRATEGY, 'filtering', filterRows);
  (0, _internals.useGridRegisterStrategyProcessor)(apiRef, _gridRowGroupingUtils.ROW_GROUPING_STRATEGY, 'sorting', sortRows);
  (0, _internals.useGridRegisterStrategyProcessor)(apiRef, _gridRowGroupingUtils.ROW_GROUPING_STRATEGY, 'visibleRowsLookupCreation', _internals.getVisibleRowsLookup);

  /**
   * 1ST RENDER
   */
  (0, _xDataGridPro.useFirstRender)(() => {
    (0, _gridRowGroupingUtils.setStrategyAvailability)(apiRef, props.disableRowGrouping);
  });

  /**
   * EFFECTS
   */
  const isFirstRender = React.useRef(true);
  React.useEffect(() => {
    if (!isFirstRender.current) {
      (0, _gridRowGroupingUtils.setStrategyAvailability)(apiRef, props.disableRowGrouping);
    } else {
      isFirstRender.current = false;
    }
  }, [apiRef, props.disableRowGrouping]);
};
exports.useGridRowGroupingPreProcessors = useGridRowGroupingPreProcessors;