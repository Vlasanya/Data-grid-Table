"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DataGridPremium = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var React = _interopRequireWildcard(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _xLicense = require("@mui/x-license");
var _xDataGridPro = require("@mui/x-data-grid-pro");
var _internals = require("@mui/x-data-grid-pro/internals");
var _useDataGridPremiumComponent = require("./useDataGridPremiumComponent");
var _useDataGridPremiumProps = require("./useDataGridPremiumProps");
var _releaseInfo = require("../utils/releaseInfo");
var _useGridAriaAttributes = require("../hooks/utils/useGridAriaAttributes");
var _useGridRowAriaAttributes = require("../hooks/features/rows/useGridRowAriaAttributes");
var _jsxRuntime = require("react/jsx-runtime");
const configuration = {
  hooks: {
    useGridAriaAttributes: _useGridAriaAttributes.useGridAriaAttributes,
    useGridRowAriaAttributes: _useGridRowAriaAttributes.useGridRowAriaAttributes
  }
};
const releaseInfo = (0, _releaseInfo.getReleaseInfo)();
let dataGridPremiumPropValidators;
if (process.env.NODE_ENV !== 'production') {
  dataGridPremiumPropValidators = [..._internals.propValidatorsDataGrid, ..._internals.propValidatorsDataGridPro];
}
const DataGridPremiumRaw = /*#__PURE__*/React.forwardRef(function DataGridPremium(inProps, ref) {
  const props = (0, _useDataGridPremiumProps.useDataGridPremiumProps)(inProps);
  const privateApiRef = (0, _useDataGridPremiumComponent.useDataGridPremiumComponent)(props.apiRef, props);
  (0, _xLicense.useLicenseVerifier)('x-data-grid-premium', releaseInfo);
  if (process.env.NODE_ENV !== 'production') {
    (0, _internals.validateProps)(props, dataGridPremiumPropValidators);
  }
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_xDataGridPro.GridContextProvider, {
    privateApiRef: privateApiRef,
    configuration: configuration,
    props: props,
    children: /*#__PURE__*/(0, _jsxRuntime.jsxs)(_xDataGridPro.GridRoot, (0, _extends2.default)({
      className: props.className,
      style: props.style,
      sx: props.sx,
      ref: ref
    }, props.forwardedProps, {
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_xDataGridPro.GridHeader, {}), /*#__PURE__*/(0, _jsxRuntime.jsx)(_xDataGridPro.GridBody, {
        children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_xLicense.Watermark, {
          packageName: "x-data-grid-premium",
          releaseInfo: releaseInfo
        })
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_xDataGridPro.GridFooterPlaceholder, {})]
    }))
  });
});
process.env.NODE_ENV !== "production" ? DataGridPremiumRaw.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  /**
   * Aggregation functions available on the grid.
   * @default GRID_AGGREGATION_FUNCTIONS
   */
  aggregationFunctions: _propTypes.default.object,
  /**
   * Set the aggregation model of the grid.
   */
  aggregationModel: _propTypes.default.object,
  /**
   * Rows used to generate the aggregated value.
   * If `filtered`, the aggregated values are generated using only the rows currently passing the filtering process.
   * If `all`, the aggregated values are generated using all the rows.
   * @default "filtered"
   */
  aggregationRowsScope: _propTypes.default.oneOf(['all', 'filtered']),
  /**
   * The ref object that allows grid manipulation. Can be instantiated with `useGridApiRef()`.
   */
  apiRef: _propTypes.default.shape({
    current: _propTypes.default.object.isRequired
  }),
  /**
   * The label of the Data Grid.
   */
  'aria-label': _propTypes.default.string,
  /**
   * The id of the element containing a label for the Data Grid.
   */
  'aria-labelledby': _propTypes.default.string,
  /**
   * If `true`, the Data Grid height is dynamic and follows the number of rows in the Data Grid.
   * @default false
   * @deprecated Use flex parent container instead: https://mui.com/x/react-data-grid/layout/#flex-parent-container
   * @example
   * <div style={{ display: 'flex', flexDirection: 'column' }}>
   *   <DataGrid />
   * </div>
   */
  autoHeight: _propTypes.default.bool,
  /**
   * If `true`, the pageSize is calculated according to the container size and the max number of rows to avoid rendering a vertical scroll bar.
   * @default false
   */
  autoPageSize: _propTypes.default.bool,
  /**
   * If `true`, columns are autosized after the datagrid is mounted.
   * @default false
   */
  autosizeOnMount: _propTypes.default.bool,
  /**
   * The options for autosize when user-initiated.
   */
  autosizeOptions: _propTypes.default.shape({
    columns: _propTypes.default.arrayOf(_propTypes.default.string),
    expand: _propTypes.default.bool,
    includeHeaders: _propTypes.default.bool,
    includeOutliers: _propTypes.default.bool,
    outliersFactor: _propTypes.default.number
  }),
  /**
   * Controls the modes of the cells.
   */
  cellModesModel: _propTypes.default.object,
  /**
   * If `true`, the cell selection mode is enabled.
   * @default false
   */
  cellSelection: _propTypes.default.bool,
  /**
   * Set the cell selection model of the grid.
   */
  cellSelectionModel: _propTypes.default.object,
  /**
   * If `true`, the Data Grid will display an extra column with checkboxes for selecting rows.
   * @default false
   */
  checkboxSelection: _propTypes.default.bool,
  /**
   * If `true`, the "Select All" header checkbox selects only the rows on the current page. To be used in combination with `checkboxSelection`.
   * It only works if the pagination is enabled.
   * @default false
   */
  checkboxSelectionVisibleOnly: _propTypes.default.bool,
  /**
   * Override or extend the styles applied to the component.
   */
  classes: _propTypes.default.object,
  /**
   * The character used to separate cell values when copying to the clipboard.
   * @default '\t'
   */
  clipboardCopyCellDelimiter: _propTypes.default.string,
  /**
   * Column region in pixels to render before/after the viewport
   * @default 150
   */
  columnBufferPx: _propTypes.default.number,
  /**
   * Sets the height in pixels of the column group headers in the Data Grid.
   * Inherits the `columnHeaderHeight` value if not set.
   */
  columnGroupHeaderHeight: _propTypes.default.number,
  columnGroupingModel: _propTypes.default.arrayOf(_propTypes.default.object),
  /**
   * Sets the height in pixel of the column headers in the Data Grid.
   * @default 56
   */
  columnHeaderHeight: _propTypes.default.number,
  /**
   * Set of columns of type [[GridColDef]][].
   */
  columns: _propTypes.default.arrayOf(_propTypes.default.object).isRequired,
  /**
   * Set the column visibility model of the Data Grid.
   * If defined, the Data Grid will ignore the `hide` property in [[GridColDef]].
   */
  columnVisibilityModel: _propTypes.default.object,
  /**
   * If above 0, the row children will be expanded up to this depth.
   * If equal to -1, all the row children will be expanded.
   * @default 0
   */
  defaultGroupingExpansionDepth: _propTypes.default.number,
  /**
   * Set the density of the Data Grid.
   * @default "standard"
   */
  density: _propTypes.default.oneOf(['comfortable', 'compact', 'standard']),
  /**
   * The row ids to show the detail panel.
   */
  detailPanelExpandedRowIds: _propTypes.default.arrayOf(_propTypes.default.oneOfType([_propTypes.default.number, _propTypes.default.string]).isRequired),
  /**
   * If `true`, aggregation is disabled.
   * @default false
   */
  disableAggregation: _propTypes.default.bool,
  /**
   * If `true`, column autosizing on header separator double-click is disabled.
   * @default false
   */
  disableAutosize: _propTypes.default.bool,
  /**
   * If `true`, the filtering will only be applied to the top level rows when grouping rows with the `treeData` prop.
   * @default false
   */
  disableChildrenFiltering: _propTypes.default.bool,
  /**
   * If `true`, the sorting will only be applied to the top level rows when grouping rows with the `treeData` prop.
   * @default false
   */
  disableChildrenSorting: _propTypes.default.bool,
  /**
   * If `true`, the clipboard paste is disabled.
   * @default false
   */
  disableClipboardPaste: _propTypes.default.bool,
  /**
   * If `true`, column filters are disabled.
   * @default false
   */
  disableColumnFilter: _propTypes.default.bool,
  /**
   * If `true`, the column menu is disabled.
   * @default false
   */
  disableColumnMenu: _propTypes.default.bool,
  /**
   * If `true`, the column pinning is disabled.
   * @default false
   */
  disableColumnPinning: _propTypes.default.bool,
  /**
   * If `true`, reordering columns is disabled.
   * @default false
   */
  disableColumnReorder: _propTypes.default.bool,
  /**
   * If `true`, resizing columns is disabled.
   * @default false
   */
  disableColumnResize: _propTypes.default.bool,
  /**
   * If `true`, hiding/showing columns is disabled.
   * @default false
   */
  disableColumnSelector: _propTypes.default.bool,
  /**
   * If `true`, the column sorting feature will be disabled.
   * @default false
   */
  disableColumnSorting: _propTypes.default.bool,
  /**
   * If `true`, the density selector is disabled.
   * @default false
   */
  disableDensitySelector: _propTypes.default.bool,
  /**
   * If `true`, `eval()` is not used for performance optimization.
   * @default false
   */
  disableEval: _propTypes.default.bool,
  /**
   * If `true`, filtering with multiple columns is disabled.
   * @default false
   */
  disableMultipleColumnsFiltering: _propTypes.default.bool,
  /**
   * If `true`, the sorting with multiple columns is disabled.
   * @default false
   */
  disableMultipleColumnsSorting: _propTypes.default.bool,
  /**
   * If `true`, multiple selection using the Ctrl/CMD or Shift key is disabled.
   * The MIT DataGrid will ignore this prop, unless `checkboxSelection` is enabled.
   * @default false (`!props.checkboxSelection` for MIT Data Grid)
   */
  disableMultipleRowSelection: _propTypes.default.bool,
  /**
   * If `true`, the row grouping is disabled.
   * @default false
   */
  disableRowGrouping: _propTypes.default.bool,
  /**
   * If `true`, the selection on click on a row or cell is disabled.
   * @default false
   */
  disableRowSelectionOnClick: _propTypes.default.bool,
  /**
   * If `true`, the virtualization is disabled.
   * @default false
   */
  disableVirtualization: _propTypes.default.bool,
  /**
   * Controls whether to use the cell or row editing.
   * @default "cell"
   */
  editMode: _propTypes.default.oneOf(['cell', 'row']),
  /**
   * Use if the actual rowCount is not known upfront, but an estimation is available.
   * If some rows have children (for instance in the tree data), this number represents the amount of top level rows.
   * Applicable only with `paginationMode="server"` and when `rowCount="-1"`
   */
  estimatedRowCount: _propTypes.default.number,
  /**
   * Unstable features, breaking changes might be introduced.
   * For each feature, if the flag is not explicitly set to `true`, then the feature is fully disabled, and neither property nor method calls will have any effect.
   */
  experimentalFeatures: _propTypes.default.shape({
    ariaV8: _propTypes.default.bool,
    warnIfFocusStateIsNotSynced: _propTypes.default.bool
  }),
  /**
   * The milliseconds delay to wait after a keystroke before triggering filtering.
   * @default 150
   */
  filterDebounceMs: _propTypes.default.number,
  /**
   * Filtering can be processed on the server or client-side.
   * Set it to 'server' if you would like to handle filtering on the server-side.
   * @default "client"
   */
  filterMode: _propTypes.default.oneOf(['client', 'server']),
  /**
   * Set the filter model of the Data Grid.
   */
  filterModel: _propTypes.default.shape({
    items: _propTypes.default.arrayOf(_propTypes.default.shape({
      field: _propTypes.default.string.isRequired,
      id: _propTypes.default.oneOfType([_propTypes.default.number, _propTypes.default.string]),
      operator: _propTypes.default.string.isRequired,
      value: _propTypes.default.any
    })).isRequired,
    logicOperator: _propTypes.default.oneOf(['and', 'or']),
    quickFilterExcludeHiddenColumns: _propTypes.default.bool,
    quickFilterLogicOperator: _propTypes.default.oneOf(['and', 'or']),
    quickFilterValues: _propTypes.default.array
  }),
  /**
   * Forwarded props for the Data Grid root element.
   * @ignore - do not document.
   */
  forwardedProps: _propTypes.default.object,
  /**
   * Determines the position of an aggregated value.
   * @param {GridGroupNode} groupNode The current group.
   * @returns {GridAggregationPosition | null} Position of the aggregated value (if `null`, the group isn't aggregated).
   * @default (groupNode) => groupNode == null ? 'footer' : 'inline'
   */
  getAggregationPosition: _propTypes.default.func,
  /**
   * Function that applies CSS classes dynamically on cells.
   * @param {GridCellParams} params With all properties from [[GridCellParams]].
   * @returns {string} The CSS class to apply to the cell.
   */
  getCellClassName: _propTypes.default.func,
  /**
   * Function that returns the element to render in row detail.
   * @param {GridRowParams} params With all properties from [[GridRowParams]].
   * @returns {React.JSX.Element} The row detail element.
   */
  getDetailPanelContent: _propTypes.default.func,
  /**
   * Function that returns the height of the row detail panel.
   * @param {GridRowParams} params With all properties from [[GridRowParams]].
   * @returns {number | string} The height in pixels or "auto" to use the content height.
   * @default "() => 500"
   */
  getDetailPanelHeight: _propTypes.default.func,
  /**
   * Function that returns the estimated height for a row.
   * Only works if dynamic row height is used.
   * Once the row height is measured this value is discarded.
   * @param {GridRowHeightParams} params With all properties from [[GridRowHeightParams]].
   * @returns {number | null} The estimated row height value. If `null` or `undefined` then the default row height, based on the density, is applied.
   */
  getEstimatedRowHeight: _propTypes.default.func,
  /**
   * Function that applies CSS classes dynamically on rows.
   * @param {GridRowClassNameParams} params With all properties from [[GridRowClassNameParams]].
   * @returns {string} The CSS class to apply to the row.
   */
  getRowClassName: _propTypes.default.func,
  /**
   * Function that sets the row height per row.
   * @param {GridRowHeightParams} params With all properties from [[GridRowHeightParams]].
   * @returns {GridRowHeightReturnValue} The row height value. If `null` or `undefined` then the default row height is applied. If "auto" then the row height is calculated based on the content.
   */
  getRowHeight: _propTypes.default.func,
  /**
   * Return the id of a given [[GridRowModel]].
   */
  getRowId: _propTypes.default.func,
  /**
   * Function that allows to specify the spacing between rows.
   * @param {GridRowSpacingParams} params With all properties from [[GridRowSpacingParams]].
   * @returns {GridRowSpacing} The row spacing values.
   */
  getRowSpacing: _propTypes.default.func,
  /**
   * Determines the path of a row in the tree data.
   * For instance, a row with the path ["A", "B"] is the child of the row with the path ["A"].
   * Note that all paths must contain at least one element.
   * @template R
   * @param {R} row The row from which we want the path.
   * @returns {string[]} The path to the row.
   */
  getTreeDataPath: _propTypes.default.func,
  /**
   * The grouping column used by the tree data.
   */
  groupingColDef: _propTypes.default.oneOfType([_propTypes.default.func, _propTypes.default.object]),
  /**
   * Override the height of the header filters.
   */
  headerFilterHeight: _propTypes.default.number,
  /**
   * If `true`, the header filters feature is enabled.
   * @default false
   */
  headerFilters: _propTypes.default.bool,
  /**
   * If `true`, the footer component is hidden.
   * @default false
   */
  hideFooter: _propTypes.default.bool,
  /**
   * If `true`, the pagination component in the footer is hidden.
   * @default false
   */
  hideFooterPagination: _propTypes.default.bool,
  /**
   * If `true`, the row count in the footer is hidden.
   * It has no effect if the pagination is enabled.
   * @default false
   */
  hideFooterRowCount: _propTypes.default.bool,
  /**
   * If `true`, the selected row count in the footer is hidden.
   * @default false
   */
  hideFooterSelectedRowCount: _propTypes.default.bool,
  /**
   * If `true`, the diacritics (accents) are ignored when filtering or quick filtering.
   * E.g. when filter value is `cafe`, the rows with `café` will be visible.
   * @default false
   */
  ignoreDiacritics: _propTypes.default.bool,
  /**
   * If `true`, the Data Grid will not use `valueFormatter` when exporting to CSV or copying to clipboard.
   * If an object is provided, you can choose to ignore the `valueFormatter` for CSV export or clipboard export.
   * @default false
   */
  ignoreValueFormatterDuringExport: _propTypes.default.oneOfType([_propTypes.default.shape({
    clipboardExport: _propTypes.default.bool,
    csvExport: _propTypes.default.bool
  }), _propTypes.default.bool]),
  /**
   * If `select`, a group header checkbox in indeterminate state (like "Select All" checkbox)
   * will select all the rows under it.
   * If `deselect`, it will deselect all the rows under it.
   * Works only if `checkboxSelection` is enabled.
   * @default "deselect"
   */
  indeterminateCheckboxAction: _propTypes.default.oneOf(['deselect', 'select']),
  /**
   * The initial state of the DataGridPremium.
   * The data in it is set in the state on initialization but isn't controlled.
   * If one of the data in `initialState` is also being controlled, then the control state wins.
   */
  initialState: _propTypes.default.object,
  /**
   * Callback fired when a cell is rendered, returns true if the cell is editable.
   * @param {GridCellParams} params With all properties from [[GridCellParams]].
   * @returns {boolean} A boolean indicating if the cell is editable.
   */
  isCellEditable: _propTypes.default.func,
  /**
   * Determines if a group should be expanded after its creation.
   * This prop takes priority over the `defaultGroupingExpansionDepth` prop.
   * @param {GridGroupNode} node The node of the group to test.
   * @returns {boolean} A boolean indicating if the group is expanded.
   */
  isGroupExpandedByDefault: _propTypes.default.func,
  /**
   * Determines if a row can be selected.
   * @param {GridRowParams} params With all properties from [[GridRowParams]].
   * @returns {boolean} A boolean indicating if the row is selectable.
   */
  isRowSelectable: _propTypes.default.func,
  /**
   * If `true`, moving the mouse pointer outside the grid before releasing the mouse button
   * in a column re-order action will not cause the column to jump back to its original position.
   * @default false
   */
  keepColumnPositionIfDraggedOutside: _propTypes.default.bool,
  /**
   * If `true`, the selection model will retain selected rows that do not exist.
   * Useful when using server side pagination and row selections need to be retained
   * when changing pages.
   * @default false
   */
  keepNonExistentRowsSelected: _propTypes.default.bool,
  /**
   * If `true`, a loading overlay is displayed.
   * @default false
   */
  loading: _propTypes.default.bool,
  /**
   * Set the locale text of the Data Grid.
   * You can find all the translation keys supported in [the source](https://github.com/mui/mui-x/blob/HEAD/packages/x-data-grid/src/constants/localeTextConstants.ts) in the GitHub repository.
   */
  localeText: _propTypes.default.object,
  /**
   * Pass a custom logger in the components that implements the [[Logger]] interface.
   * @default console
   */
  logger: _propTypes.default.shape({
    debug: _propTypes.default.func.isRequired,
    error: _propTypes.default.func.isRequired,
    info: _propTypes.default.func.isRequired,
    warn: _propTypes.default.func.isRequired
  }),
  /**
   * Allows to pass the logging level or false to turn off logging.
   * @default "error" ("warn" in dev mode)
   */
  logLevel: _propTypes.default.oneOf(['debug', 'error', 'info', 'warn', false]),
  /**
   * Nonce of the inline styles for [Content Security Policy](https://www.w3.org/TR/2016/REC-CSP2-20161215/#script-src-the-nonce-attribute).
   */
  nonce: _propTypes.default.string,
  /**
   * Callback fired when the row grouping model changes.
   * @param {GridAggregationModel} model The aggregated columns.
   * @param {GridCallbackDetails} details Additional details for this callback.
   */
  onAggregationModelChange: _propTypes.default.func,
  /**
   * Callback fired before the clipboard paste operation starts.
   * Use it to confirm or cancel the paste operation.
   * @param {object} params Params passed to the callback.
   * @param {string[][]} params.data The raw pasted data split by rows and cells.
   * @returns {Promise<any>} A promise that resolves to confirm the paste operation, and rejects to cancel it.
   */
  onBeforeClipboardPasteStart: _propTypes.default.func,
  /**
   * Callback fired when any cell is clicked.
   * @param {GridCellParams} params With all properties from [[GridCellParams]].
   * @param {MuiEvent<React.MouseEvent>} event The event object.
   * @param {GridCallbackDetails} details Additional details for this callback.
   */
  onCellClick: _propTypes.default.func,
  /**
   * Callback fired when a double click event comes from a cell element.
   * @param {GridCellParams} params With all properties from [[GridCellParams]].
   * @param {MuiEvent<React.MouseEvent>} event The event object.
   * @param {GridCallbackDetails} details Additional details for this callback.
   */
  onCellDoubleClick: _propTypes.default.func,
  /**
   * Callback fired when the cell turns to edit mode.
   * @param {GridCellParams} params With all properties from [[GridCellParams]].
   * @param {MuiEvent<React.KeyboardEvent | React.MouseEvent>} event The event that caused this prop to be called.
   */
  onCellEditStart: _propTypes.default.func,
  /**
   * Callback fired when the cell turns to view mode.
   * @param {GridCellParams} params With all properties from [[GridCellParams]].
   * @param {MuiEvent<MuiBaseEvent>} event The event that caused this prop to be called.
   */
  onCellEditStop: _propTypes.default.func,
  /**
   * Callback fired when a keydown event comes from a cell element.
   * @param {GridCellParams} params With all properties from [[GridCellParams]].
   * @param {MuiEvent<React.KeyboardEvent>} event The event object.
   * @param {GridCallbackDetails} details Additional details for this callback.
   */
  onCellKeyDown: _propTypes.default.func,
  /**
   * Callback fired when the `cellModesModel` prop changes.
   * @param {GridCellModesModel} cellModesModel Object containing which cells are in "edit" mode.
   * @param {GridCallbackDetails} details Additional details for this callback.
   */
  onCellModesModelChange: _propTypes.default.func,
  /**
   * Callback fired when the selection state of one or multiple cells changes.
   * @param {GridCellSelectionModel} cellSelectionModel Object in the shape of [[GridCellSelectionModel]] containing the selected cells.
   * @param {GridCallbackDetails} details Additional details for this callback.
   */
  onCellSelectionModelChange: _propTypes.default.func,
  /**
   * Callback called when the data is copied to the clipboard.
   * @param {string} data The data copied to the clipboard.
   */
  onClipboardCopy: _propTypes.default.func,
  /**
   * Callback fired when the clipboard paste operation ends.
   */
  onClipboardPasteEnd: _propTypes.default.func,
  /**
   * Callback fired when the clipboard paste operation starts.
   */
  onClipboardPasteStart: _propTypes.default.func,
  /**
   * Callback fired when a click event comes from a column header element.
   * @param {GridColumnHeaderParams} params With all properties from [[GridColumnHeaderParams]].
   * @param {MuiEvent<React.MouseEvent>} event The event object.
   * @param {GridCallbackDetails} details Additional details for this callback.
   */
  onColumnHeaderClick: _propTypes.default.func,
  /**
   * Callback fired when a contextmenu event comes from a column header element.
   * @param {GridColumnHeaderParams} params With all properties from [[GridColumnHeaderParams]].
   * @param {MuiEvent<React.MouseEvent>} event The event object.
   */
  onColumnHeaderContextMenu: _propTypes.default.func,
  /**
   * Callback fired when a double click event comes from a column header element.
   * @param {GridColumnHeaderParams} params With all properties from [[GridColumnHeaderParams]].
   * @param {MuiEvent<React.MouseEvent>} event The event object.
   * @param {GridCallbackDetails} details Additional details for this callback.
   */
  onColumnHeaderDoubleClick: _propTypes.default.func,
  /**
   * Callback fired when a mouse enter event comes from a column header element.
   * @param {GridColumnHeaderParams} params With all properties from [[GridColumnHeaderParams]].
   * @param {MuiEvent<React.MouseEvent>} event The event object.
   * @param {GridCallbackDetails} details Additional details for this callback.
   */
  onColumnHeaderEnter: _propTypes.default.func,
  /**
   * Callback fired when a mouse leave event comes from a column header element.
   * @param {GridColumnHeaderParams} params With all properties from [[GridColumnHeaderParams]].
   * @param {MuiEvent<React.MouseEvent>} event The event object.
   * @param {GridCallbackDetails} details Additional details for this callback.
   */
  onColumnHeaderLeave: _propTypes.default.func,
  /**
   * Callback fired when a mouseout event comes from a column header element.
   * @param {GridColumnHeaderParams} params With all properties from [[GridColumnHeaderParams]].
   * @param {MuiEvent<React.MouseEvent>} event The event object.
   * @param {GridCallbackDetails} details Additional details for this callback.
   */
  onColumnHeaderOut: _propTypes.default.func,
  /**
   * Callback fired when a mouseover event comes from a column header element.
   * @param {GridColumnHeaderParams} params With all properties from [[GridColumnHeaderParams]].
   * @param {MuiEvent<React.MouseEvent>} event The event object.
   * @param {GridCallbackDetails} details Additional details for this callback.
   */
  onColumnHeaderOver: _propTypes.default.func,
  /**
   * Callback fired when a column is reordered.
   * @param {GridColumnOrderChangeParams} params With all properties from [[GridColumnOrderChangeParams]].
   * @param {MuiEvent<{}>} event The event object.
   * @param {GridCallbackDetails} details Additional details for this callback.
   */
  onColumnOrderChange: _propTypes.default.func,
  /**
   * Callback fired while a column is being resized.
   * @param {GridColumnResizeParams} params With all properties from [[GridColumnResizeParams]].
   * @param {MuiEvent<React.MouseEvent>} event The event object.
   * @param {GridCallbackDetails} details Additional details for this callback.
   */
  onColumnResize: _propTypes.default.func,
  /**
   * Callback fired when the column visibility model changes.
   * @param {GridColumnVisibilityModel} model The new model.
   * @param {GridCallbackDetails} details Additional details for this callback.
   */
  onColumnVisibilityModelChange: _propTypes.default.func,
  /**
   * Callback fired when the width of a column is changed.
   * @param {GridColumnResizeParams} params With all properties from [[GridColumnResizeParams]].
   * @param {MuiEvent<React.MouseEvent>} event The event object.
   * @param {GridCallbackDetails} details Additional details for this callback.
   */
  onColumnWidthChange: _propTypes.default.func,
  /**
   * Callback fired when the density changes.
   * @param {GridDensity} density New density value.
   */
  onDensityChange: _propTypes.default.func,
  /**
   * Callback fired when the detail panel of a row is opened or closed.
   * @param {GridRowId[]} ids The ids of the rows which have the detail panel open.
   * @param {GridCallbackDetails} details Additional details for this callback.
   */
  onDetailPanelExpandedRowIdsChange: _propTypes.default.func,
  /**
   * Callback fired when the state of the Excel export changes.
   * @param {string} inProgress Indicates if the task is in progress.
   */
  onExcelExportStateChange: _propTypes.default.func,
  /**
   * Callback fired when rowCount is set and the next batch of virtualized rows is rendered.
   * @param {GridFetchRowsParams} params With all properties from [[GridFetchRowsParams]].
   * @param {MuiEvent<{}>} event The event object.
   * @param {GridCallbackDetails} details Additional details for this callback.
   */
  onFetchRows: _propTypes.default.func,
  /**
   * Callback fired when the Filter model changes before the filters are applied.
   * @param {GridFilterModel} model With all properties from [[GridFilterModel]].
   * @param {GridCallbackDetails} details Additional details for this callback.
   */
  onFilterModelChange: _propTypes.default.func,
  /**
   * Callback fired when the menu is closed.
   * @param {GridMenuParams} params With all properties from [[GridMenuParams]].
   * @param {MuiEvent<{}>} event The event object.
   * @param {GridCallbackDetails} details Additional details for this callback.
   */
  onMenuClose: _propTypes.default.func,
  /**
   * Callback fired when the menu is opened.
   * @param {GridMenuParams} params With all properties from [[GridMenuParams]].
   * @param {MuiEvent<{}>} event The event object.
   * @param {GridCallbackDetails} details Additional details for this callback.
   */
  onMenuOpen: _propTypes.default.func,
  /**
   * Callback fired when the pagination meta has changed.
   * @param {GridPaginationMeta} paginationMeta Updated pagination meta.
   */
  onPaginationMetaChange: _propTypes.default.func,
  /**
   * Callback fired when the pagination model has changed.
   * @param {GridPaginationModel} model Updated pagination model.
   * @param {GridCallbackDetails} details Additional details for this callback.
   */
  onPaginationModelChange: _propTypes.default.func,
  /**
   * Callback fired when the pinned columns have changed.
   * @param {GridPinnedColumnFields} pinnedColumns The changed pinned columns.
   * @param {GridCallbackDetails} details Additional details for this callback.
   */
  onPinnedColumnsChange: _propTypes.default.func,
  /**
   * Callback fired when the preferences panel is closed.
   * @param {GridPreferencePanelParams} params With all properties from [[GridPreferencePanelParams]].
   * @param {MuiEvent<{}>} event The event object.
   * @param {GridCallbackDetails} details Additional details for this callback.
   */
  onPreferencePanelClose: _propTypes.default.func,
  /**
   * Callback fired when the preferences panel is opened.
   * @param {GridPreferencePanelParams} params With all properties from [[GridPreferencePanelParams]].
   * @param {MuiEvent<{}>} event The event object.
   * @param {GridCallbackDetails} details Additional details for this callback.
   */
  onPreferencePanelOpen: _propTypes.default.func,
  /**
   * Callback called when `processRowUpdate` throws an error or rejects.
   * @param {any} error The error thrown.
   */
  onProcessRowUpdateError: _propTypes.default.func,
  /**
   * Callback fired when the Data Grid is resized.
   * @param {ElementSize} containerSize With all properties from [[ElementSize]].
   * @param {MuiEvent<{}>} event The event object.
   * @param {GridCallbackDetails} details Additional details for this callback.
   */
  onResize: _propTypes.default.func,
  /**
   * Callback fired when a row is clicked.
   * Not called if the target clicked is an interactive element added by the built-in columns.
   * @param {GridRowParams} params With all properties from [[GridRowParams]].
   * @param {MuiEvent<React.MouseEvent>} event The event object.
   * @param {GridCallbackDetails} details Additional details for this callback.
   */
  onRowClick: _propTypes.default.func,
  /**
   * Callback fired when the row count has changed.
   * @param {number} count Updated row count.
   */
  onRowCountChange: _propTypes.default.func,
  /**
   * Callback fired when a double click event comes from a row container element.
   * @param {GridRowParams} params With all properties from [[RowParams]].
   * @param {MuiEvent<React.MouseEvent>} event The event object.
   * @param {GridCallbackDetails} details Additional details for this callback.
   */
  onRowDoubleClick: _propTypes.default.func,
  /**
   * Callback fired when the row turns to edit mode.
   * @param {GridRowParams} params With all properties from [[GridRowParams]].
   * @param {MuiEvent<React.KeyboardEvent | React.MouseEvent>} event The event that caused this prop to be called.
   */
  onRowEditStart: _propTypes.default.func,
  /**
   * Callback fired when the row turns to view mode.
   * @param {GridRowParams} params With all properties from [[GridRowParams]].
   * @param {MuiEvent<MuiBaseEvent>} event The event that caused this prop to be called.
   */
  onRowEditStop: _propTypes.default.func,
  /**
   * Callback fired when the row grouping model changes.
   * @param {GridRowGroupingModel} model Columns used as grouping criteria.
   * @param {GridCallbackDetails} details Additional details for this callback.
   */
  onRowGroupingModelChange: _propTypes.default.func,
  /**
   * Callback fired when the `rowModesModel` prop changes.
   * @param {GridRowModesModel} rowModesModel Object containing which rows are in "edit" mode.
   * @param {GridCallbackDetails} details Additional details for this callback.
   */
  onRowModesModelChange: _propTypes.default.func,
  /**
   * Callback fired when a row is being reordered.
   * @param {GridRowOrderChangeParams} params With all properties from [[GridRowOrderChangeParams]].
   * @param {MuiEvent<{}>} event The event object.
   * @param {GridCallbackDetails} details Additional details for this callback.
   */
  onRowOrderChange: _propTypes.default.func,
  /**
   * Callback fired when the selection state of one or multiple rows changes.
   * @param {GridRowSelectionModel} rowSelectionModel With all the row ids [[GridSelectionModel]].
   * @param {GridCallbackDetails} details Additional details for this callback.
   */
  onRowSelectionModelChange: _propTypes.default.func,
  /**
   * Callback fired when scrolling to the bottom of the grid viewport.
   * @param {GridRowScrollEndParams} params With all properties from [[GridRowScrollEndParams]].
   * @param {MuiEvent<{}>} event The event object.
   * @param {GridCallbackDetails} details Additional details for this callback.
   */
  onRowsScrollEnd: _propTypes.default.func,
  /**
   * Callback fired when the sort model changes before a column is sorted.
   * @param {GridSortModel} model With all properties from [[GridSortModel]].
   * @param {GridCallbackDetails} details Additional details for this callback.
   */
  onSortModelChange: _propTypes.default.func,
  /**
   * Callback fired when the state of the Data Grid is updated.
   * @param {GridState} state The new state.
   * @param {MuiEvent<{}>} event The event object.
   * @param {GridCallbackDetails} details Additional details for this callback.
   * @ignore - do not document.
   */
  onStateChange: _propTypes.default.func,
  /**
   * Select the pageSize dynamically using the component UI.
   * @default [25, 50, 100]
   */
  pageSizeOptions: _propTypes.default.arrayOf(_propTypes.default.oneOfType([_propTypes.default.number, _propTypes.default.shape({
    label: _propTypes.default.string.isRequired,
    value: _propTypes.default.number.isRequired
  })]).isRequired),
  /**
   * If `true`, pagination is enabled.
   * @default false
   */
  pagination: _propTypes.default.bool,
  /**
   * The extra information about the pagination state of the Data Grid.
   * Only applicable with `paginationMode="server"`.
   */
  paginationMeta: _propTypes.default.shape({
    hasNextPage: _propTypes.default.bool
  }),
  /**
   * Pagination can be processed on the server or client-side.
   * Set it to 'client' if you would like to handle the pagination on the client-side.
   * Set it to 'server' if you would like to handle the pagination on the server-side.
   * @default "client"
   */
  paginationMode: _propTypes.default.oneOf(['client', 'server']),
  /**
   * The pagination model of type [[GridPaginationModel]] which refers to current `page` and `pageSize`.
   */
  paginationModel: _propTypes.default.shape({
    page: _propTypes.default.number.isRequired,
    pageSize: _propTypes.default.number.isRequired
  }),
  /**
   * The column fields to display pinned to left or right.
   */
  pinnedColumns: _propTypes.default.object,
  /**
   * Rows data to pin on top or bottom.
   */
  pinnedRows: _propTypes.default.shape({
    bottom: _propTypes.default.arrayOf(_propTypes.default.object),
    top: _propTypes.default.arrayOf(_propTypes.default.object)
  }),
  /**
   * Callback called before updating a row with new values in the row and cell editing.
   * @template R
   * @param {R} newRow Row object with the new values.
   * @param {R} oldRow Row object with the old values.
   * @param {{ rowId: GridRowId }} params Additional parameters.
   * @returns {Promise<R> | R} The final values to update the row.
   */
  processRowUpdate: _propTypes.default.func,
  /**
   * The milliseconds throttle delay for resizing the grid.
   * @default 60
   */
  resizeThrottleMs: _propTypes.default.number,
  /**
   * Row region in pixels to render before/after the viewport
   * @default 150
   */
  rowBufferPx: _propTypes.default.number,
  /**
   * Set the total number of rows, if it is different from the length of the value `rows` prop.
   * If some rows have children (for instance in the tree data), this number represents the amount of top level rows.
   * Only works with `paginationMode="server"`, ignored when `paginationMode="client"`.
   */
  rowCount: _propTypes.default.number,
  /**
   * If `single`, all the columns that are grouped are represented in the same grid column.
   * If `multiple`, each column that is grouped is represented in its own grid column.
   * @default 'single'
   */
  rowGroupingColumnMode: _propTypes.default.oneOf(['multiple', 'single']),
  /**
   * Set the row grouping model of the grid.
   */
  rowGroupingModel: _propTypes.default.arrayOf(_propTypes.default.string),
  /**
   * Sets the height in pixel of a row in the Data Grid.
   * @default 52
   */
  rowHeight: _propTypes.default.number,
  /**
   * Controls the modes of the rows.
   */
  rowModesModel: _propTypes.default.object,
  /**
   * The milliseconds delay to wait after measuring the row height before recalculating row positions.
   * Setting it to a lower value could be useful when using dynamic row height,
   * but might reduce performance when displaying a large number of rows.
   * @default 166
   */
  rowPositionsDebounceMs: _propTypes.default.number,
  /**
   * If `true`, the reordering of rows is enabled.
   * @default false
   */
  rowReordering: _propTypes.default.bool,
  /**
   * Set of rows of type [[GridRowsProp]].
   * @default []
   */
  rows: _propTypes.default.arrayOf(_propTypes.default.object),
  /**
   * If `false`, the row selection mode is disabled.
   * @default true
   */
  rowSelection: _propTypes.default.bool,
  /**
   * Sets the row selection model of the Data Grid.
   */
  rowSelectionModel: _propTypes.default.oneOfType([_propTypes.default.arrayOf(_propTypes.default.oneOfType([_propTypes.default.number, _propTypes.default.string]).isRequired), _propTypes.default.number, _propTypes.default.string]),
  /**
   * When `rowSelectionPropagation.descendants` is set to `true`.
   * - Selecting a parent selects all its filtered descendants automatically.
   * - Deselecting a parent row deselects all its filtered descendants automatically.
   *
   * When `rowSelectionPropagation.parents` is set to `true`
   * - Selecting all the filtered descendants of a parent selects the parent automatically.
   * - Deselecting a descendant of a selected parent deselects the parent automatically.
   *
   * Works with tree data and row grouping on the client-side only.
   * @default { parents: false, descendants: false }
   */
  rowSelectionPropagation: _propTypes.default.shape({
    descendants: _propTypes.default.bool,
    parents: _propTypes.default.bool
  }),
  /**
   * Loading rows can be processed on the server or client-side.
   * Set it to 'client' if you would like enable infnite loading.
   * Set it to 'server' if you would like to enable lazy loading.
   * * @default "client"
   */
  rowsLoadingMode: _propTypes.default.oneOf(['client', 'server']),
  /**
   * Sets the type of space between rows added by `getRowSpacing`.
   * @default "margin"
   */
  rowSpacingType: _propTypes.default.oneOf(['border', 'margin']),
  /**
   * Override the height/width of the Data Grid inner scrollbar.
   */
  scrollbarSize: _propTypes.default.number,
  /**
   * Set the area in `px` at the bottom of the grid viewport where onRowsScrollEnd is called.
   * @default 80
   */
  scrollEndThreshold: _propTypes.default.number,
  /**
   * If `true`, vertical borders will be displayed between cells.
   * @default false
   */
  showCellVerticalBorder: _propTypes.default.bool,
  /**
   * If `true`, vertical borders will be displayed between column header items.
   * @default false
   */
  showColumnVerticalBorder: _propTypes.default.bool,
  /**
   * Overridable components props dynamically passed to the component at rendering.
   */
  slotProps: _propTypes.default.object,
  /**
   * Overridable components.
   */
  slots: _propTypes.default.object,
  /**
   * Sorting can be processed on the server or client-side.
   * Set it to 'client' if you would like to handle sorting on the client-side.
   * Set it to 'server' if you would like to handle sorting on the server-side.
   * @default "client"
   */
  sortingMode: _propTypes.default.oneOf(['client', 'server']),
  /**
   * The order of the sorting sequence.
   * @default ['asc', 'desc', null]
   */
  sortingOrder: _propTypes.default.arrayOf(_propTypes.default.oneOf(['asc', 'desc'])),
  /**
   * Set the sort model of the Data Grid.
   */
  sortModel: _propTypes.default.arrayOf(_propTypes.default.shape({
    field: _propTypes.default.string.isRequired,
    sort: _propTypes.default.oneOf(['asc', 'desc'])
  })),
  /**
   * The function is used to split the pasted text into rows and cells.
   * @param {string} text The text pasted from the clipboard.
   * @returns {string[][] | null} A 2D array of strings. The first dimension is the rows, the second dimension is the columns.
   * @default (pastedText) => { const text = pastedText.replace(/\r?\n$/, ''); return text.split(/\r\n|\n|\r/).map((row) => row.split('\t')); }
   */
  splitClipboardPastedText: _propTypes.default.func,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: _propTypes.default.oneOfType([_propTypes.default.arrayOf(_propTypes.default.oneOfType([_propTypes.default.func, _propTypes.default.object, _propTypes.default.bool])), _propTypes.default.func, _propTypes.default.object]),
  /**
   * If positive, the Data Grid will throttle updates coming from `apiRef.current.updateRows` and `apiRef.current.setRows`.
   * It can be useful if you have a high update rate but do not want to do heavy work like filtering / sorting or rendering on each  individual update.
   * @default 0
   */
  throttleRowsMs: _propTypes.default.number,
  /**
   * If `true`, the rows will be gathered in a tree structure according to the `getTreeDataPath` prop.
   * @default false
   */
  treeData: _propTypes.default.bool,
  unstable_dataSource: _propTypes.default.shape({
    getChildrenCount: _propTypes.default.func,
    getGroupKey: _propTypes.default.func,
    getRows: _propTypes.default.func.isRequired,
    updateRow: _propTypes.default.func
  }),
  unstable_dataSourceCache: _propTypes.default.shape({
    clear: _propTypes.default.func.isRequired,
    get: _propTypes.default.func.isRequired,
    set: _propTypes.default.func.isRequired
  }),
  unstable_onDataSourceError: _propTypes.default.func,
  /**
   * If `true`, the Data Grid will auto span the cells over the rows having the same value.
   * @default false
   */
  unstable_rowSpanning: _propTypes.default.bool
} : void 0;
/**
 * Demos:
 * - [DataGridPremium](https://mui.com/x/react-data-grid/demo/)
 *
 * API:
 * - [DataGridPremium API](https://mui.com/x/api/data-grid/data-grid-premium/)
 */
const DataGridPremium = exports.DataGridPremium = /*#__PURE__*/React.memo(DataGridPremiumRaw);