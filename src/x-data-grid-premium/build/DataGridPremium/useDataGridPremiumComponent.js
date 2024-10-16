"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useDataGridPremiumComponent = void 0;
var _internals = require("@mui/x-data-grid-pro/internals");
var _useGridAggregation = require("../hooks/features/aggregation/useGridAggregation");
var _useGridAggregationPreProcessors = require("../hooks/features/aggregation/useGridAggregationPreProcessors");
var _useGridRowGrouping = require("../hooks/features/rowGrouping/useGridRowGrouping");
var _useGridRowGroupingPreProcessors = require("../hooks/features/rowGrouping/useGridRowGroupingPreProcessors");
var _useGridExcelExport = require("../hooks/features/export/useGridExcelExport");
var _useGridCellSelection = require("../hooks/features/cellSelection/useGridCellSelection");
var _useGridClipboardImport = require("../hooks/features/clipboard/useGridClipboardImport");
// Premium-only features

const useDataGridPremiumComponent = (inputApiRef, props) => {
  const apiRef = (0, _internals.useGridInitialization)(inputApiRef, props);

  /**
   * Register all pre-processors called during state initialization here.
   */
  (0, _internals.useGridRowSelectionPreProcessors)(apiRef, props);
  (0, _internals.useGridRowReorderPreProcessors)(apiRef, props);
  (0, _useGridRowGroupingPreProcessors.useGridRowGroupingPreProcessors)(apiRef, props);
  (0, _internals.useGridTreeDataPreProcessors)(apiRef, props);
  (0, _internals.useGridDataSourceTreeDataPreProcessors)(apiRef, props);
  (0, _internals.useGridLazyLoaderPreProcessors)(apiRef, props);
  (0, _internals.useGridRowPinningPreProcessors)(apiRef);
  (0, _useGridAggregationPreProcessors.useGridAggregationPreProcessors)(apiRef, props);
  (0, _internals.useGridDetailPanelPreProcessors)(apiRef, props);
  // The column pinning `hydrateColumns` pre-processor must be after every other `hydrateColumns` pre-processors
  // Because it changes the order of the columns.
  (0, _internals.useGridColumnPinningPreProcessors)(apiRef, props);
  (0, _internals.useGridRowsPreProcessors)(apiRef);

  /**
   * Register all state initializers here.
   */
  (0, _internals.useGridInitializeState)(_internals.dimensionsStateInitializer, apiRef, props);
  (0, _internals.useGridInitializeState)(_internals.headerFilteringStateInitializer, apiRef, props);
  (0, _internals.useGridInitializeState)(_useGridRowGrouping.rowGroupingStateInitializer, apiRef, props);
  (0, _internals.useGridInitializeState)(_useGridAggregation.aggregationStateInitializer, apiRef, props);
  (0, _internals.useGridInitializeState)(_internals.rowSelectionStateInitializer, apiRef, props);
  (0, _internals.useGridInitializeState)(_useGridCellSelection.cellSelectionStateInitializer, apiRef, props);
  (0, _internals.useGridInitializeState)(_internals.detailPanelStateInitializer, apiRef, props);
  (0, _internals.useGridInitializeState)(_internals.columnPinningStateInitializer, apiRef, props);
  (0, _internals.useGridInitializeState)(_internals.columnsStateInitializer, apiRef, props);
  (0, _internals.useGridInitializeState)(_internals.rowPinningStateInitializer, apiRef, props);
  (0, _internals.useGridInitializeState)(_internals.rowsStateInitializer, apiRef, props);
  (0, _internals.useGridInitializeState)(_internals.editingStateInitializer, apiRef, props);
  (0, _internals.useGridInitializeState)(_internals.focusStateInitializer, apiRef, props);
  (0, _internals.useGridInitializeState)(_internals.sortingStateInitializer, apiRef, props);
  (0, _internals.useGridInitializeState)(_internals.preferencePanelStateInitializer, apiRef, props);
  (0, _internals.useGridInitializeState)(_internals.filterStateInitializer, apiRef, props);
  (0, _internals.useGridInitializeState)(_internals.rowSpanningStateInitializer, apiRef, props);
  (0, _internals.useGridInitializeState)(_internals.densityStateInitializer, apiRef, props);
  (0, _internals.useGridInitializeState)(_internals.columnReorderStateInitializer, apiRef, props);
  (0, _internals.useGridInitializeState)(_internals.columnResizeStateInitializer, apiRef, props);
  (0, _internals.useGridInitializeState)(_internals.paginationStateInitializer, apiRef, props);
  (0, _internals.useGridInitializeState)(_internals.rowsMetaStateInitializer, apiRef, props);
  (0, _internals.useGridInitializeState)(_internals.columnMenuStateInitializer, apiRef, props);
  (0, _internals.useGridInitializeState)(_internals.columnGroupsStateInitializer, apiRef, props);
  (0, _internals.useGridInitializeState)(_internals.virtualizationStateInitializer, apiRef, props);
  (0, _internals.useGridInitializeState)(_internals.dataSourceStateInitializer, apiRef, props);
  (0, _useGridRowGrouping.useGridRowGrouping)(apiRef, props);
  (0, _internals.useGridHeaderFiltering)(apiRef, props);
  (0, _internals.useGridTreeData)(apiRef, props);
  (0, _useGridAggregation.useGridAggregation)(apiRef, props);
  (0, _internals.useGridKeyboardNavigation)(apiRef, props);
  (0, _internals.useGridRowSelection)(apiRef, props);
  (0, _useGridCellSelection.useGridCellSelection)(apiRef, props);
  (0, _internals.useGridColumnPinning)(apiRef, props);
  (0, _internals.useGridRowPinning)(apiRef, props);
  (0, _internals.useGridColumns)(apiRef, props);
  (0, _internals.useGridRows)(apiRef, props);
  (0, _internals.useGridRowSpanning)(apiRef, props);
  (0, _internals.useGridParamsApi)(apiRef);
  (0, _internals.useGridDetailPanel)(apiRef, props);
  (0, _internals.useGridColumnSpanning)(apiRef);
  (0, _internals.useGridColumnGrouping)(apiRef, props);
  (0, _useGridClipboardImport.useGridClipboardImport)(apiRef, props);
  (0, _internals.useGridEditing)(apiRef, props);
  (0, _internals.useGridFocus)(apiRef, props);
  (0, _internals.useGridPreferencesPanel)(apiRef, props);
  (0, _internals.useGridFilter)(apiRef, props);
  (0, _internals.useGridSorting)(apiRef, props);
  (0, _internals.useGridDensity)(apiRef, props);
  (0, _internals.useGridColumnReorder)(apiRef, props);
  (0, _internals.useGridColumnResize)(apiRef, props);
  (0, _internals.useGridPagination)(apiRef, props);
  (0, _internals.useGridRowsMeta)(apiRef, props);
  (0, _internals.useGridRowReorder)(apiRef, props);
  (0, _internals.useGridScroll)(apiRef, props);
  (0, _internals.useGridInfiniteLoader)(apiRef, props);
  (0, _internals.useGridLazyLoader)(apiRef, props);
  (0, _internals.useGridColumnMenu)(apiRef);
  (0, _internals.useGridCsvExport)(apiRef, props);
  (0, _internals.useGridPrintExport)(apiRef, props);
  (0, _useGridExcelExport.useGridExcelExport)(apiRef, props);
  (0, _internals.useGridClipboard)(apiRef, props);
  (0, _internals.useGridDimensions)(apiRef, props);
  (0, _internals.useGridEvents)(apiRef, props);
  (0, _internals.useGridStatePersistence)(apiRef);
  (0, _internals.useGridDataSource)(apiRef, props);
  (0, _internals.useGridVirtualization)(apiRef, props);
  return apiRef;
};
exports.useDataGridPremiumComponent = useDataGridPremiumComponent;