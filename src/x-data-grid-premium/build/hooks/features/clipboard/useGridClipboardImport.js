"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useGridClipboardImport = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var React = _interopRequireWildcard(require("react"));
var _xDataGrid = require("@mui/x-data-grid");
var _internals = require("@mui/x-data-grid/internals");
var _warning = require("@mui/x-internals/warning");
var _xDataGridPro = require("@mui/x-data-grid-pro");
var _utils = require("@mui/utils");
const columnFieldsToExcludeFromPaste = [_xDataGrid.GRID_CHECKBOX_SELECTION_FIELD, _xDataGridPro.GRID_REORDER_COL_DEF.field, _xDataGridPro.GRID_DETAIL_PANEL_TOGGLE_FIELD];

// Batches rows that are updated during clipboard paste to reduce `updateRows` calls
function batchRowUpdates(func, wait) {
  let rows = [];
  const debounced = (0, _utils.unstable_debounce)(() => {
    func(rows);
    rows = [];
  }, wait);
  return row => {
    rows.push(row);
    debounced();
  };
}
async function getTextFromClipboard(rootEl) {
  return new Promise(resolve => {
    const focusedCell = (0, _internals.getActiveElement)(document);
    const el = document.createElement('input');
    el.style.width = '0px';
    el.style.height = '0px';
    el.style.border = 'none';
    el.style.margin = '0';
    el.style.padding = '0';
    el.style.outline = 'none';
    el.style.position = 'absolute';
    el.style.top = '0';
    el.style.left = '0';
    const handlePasteEvent = event => {
      el.removeEventListener('paste', handlePasteEvent);
      const text = event.clipboardData?.getData('text/plain');
      if (focusedCell instanceof HTMLElement) {
        focusedCell.focus({
          preventScroll: true
        });
      }
      el.remove();
      resolve(text || '');
    };
    el.addEventListener('paste', handlePasteEvent);
    rootEl.appendChild(el);
    el.focus({
      preventScroll: true
    });
  });
}

// Keeps track of updated rows during clipboard paste
class CellValueUpdater {
  constructor(options) {
    this.rowsToUpdate = {};
    this.updateRow = void 0;
    this.options = void 0;
    this.options = options;
    this.updateRow = batchRowUpdates(options.apiRef.current.updateRows, 50);
  }
  updateCell({
    rowId,
    field,
    pastedCellValue
  }) {
    if (pastedCellValue === undefined) {
      return;
    }
    const {
      apiRef,
      getRowId
    } = this.options;
    const colDef = apiRef.current.getColumn(field);
    if (!colDef || !colDef.editable) {
      return;
    }
    const row = this.rowsToUpdate[rowId] || (0, _extends2.default)({}, apiRef.current.getRow(rowId));
    if (!row) {
      return;
    }
    let parsedValue = pastedCellValue;
    if (colDef.pastedValueParser) {
      parsedValue = colDef.pastedValueParser(pastedCellValue, row, colDef, apiRef);
    } else if (colDef.valueParser) {
      parsedValue = colDef.valueParser(parsedValue, row, colDef, apiRef);
    }
    if (parsedValue === undefined) {
      return;
    }
    let rowCopy = (0, _extends2.default)({}, row);
    if (typeof colDef.valueSetter === 'function') {
      rowCopy = colDef.valueSetter(parsedValue, rowCopy, colDef, apiRef);
    } else {
      rowCopy[field] = parsedValue;
    }
    const newRowId = (0, _internals.getRowIdFromRowModel)(rowCopy, getRowId);
    if (String(newRowId) !== String(rowId)) {
      // We cannot update row id, so this cell value update should be ignored
      return;
    }
    this.rowsToUpdate[rowId] = rowCopy;
  }
  applyUpdates() {
    const {
      apiRef,
      processRowUpdate,
      onProcessRowUpdateError
    } = this.options;
    const rowsToUpdate = this.rowsToUpdate;
    const rowIdsToUpdate = Object.keys(rowsToUpdate);
    if (rowIdsToUpdate.length === 0) {
      apiRef.current.publishEvent('clipboardPasteEnd');
      return;
    }
    const handleRowUpdate = async rowId => {
      const newRow = rowsToUpdate[rowId];
      if (typeof processRowUpdate === 'function') {
        const handleError = errorThrown => {
          if (onProcessRowUpdateError) {
            onProcessRowUpdateError(errorThrown);
          } else if (process.env.NODE_ENV !== 'production') {
            (0, _warning.warnOnce)(['MUI X: A call to `processRowUpdate` threw an error which was not handled because `onProcessRowUpdateError` is missing.', 'To handle the error pass a callback to the `onProcessRowUpdateError` prop, for example `<DataGrid onProcessRowUpdateError={(error) => ...} />`.', 'For more detail, see https://mui.com/x/react-data-grid/editing/#server-side-persistence.'], 'error');
          }
        };
        try {
          const oldRow = apiRef.current.getRow(rowId);
          const finalRowUpdate = await processRowUpdate(newRow, oldRow, {
            rowId
          });
          this.updateRow(finalRowUpdate);
        } catch (error) {
          handleError(error);
        }
      } else {
        this.updateRow(newRow);
      }
    };
    const promises = rowIdsToUpdate.map(rowId => {
      // Wrap in promise that always resolves to avoid Promise.all from stopping on first error.
      // This is to avoid using `Promise.allSettled` that has worse browser support.
      return new Promise(resolve => {
        handleRowUpdate(rowId).then(resolve).catch(resolve);
      });
    });
    Promise.all(promises).then(() => {
      this.rowsToUpdate = {};
      apiRef.current.publishEvent('clipboardPasteEnd');
    });
  }
}
function defaultPasteResolver({
  pastedData,
  apiRef,
  updateCell,
  pagination,
  paginationMode
}) {
  const isSingleValuePasted = pastedData.length === 1 && pastedData[0].length === 1;
  const cellSelectionModel = apiRef.current.getCellSelectionModel();
  const selectedCellsArray = apiRef.current.getSelectedCellsAsArray();
  if (cellSelectionModel && selectedCellsArray.length > 1) {
    let lastRowId = selectedCellsArray[0].id;
    let rowIndex = 0;
    let colIndex = 0;
    selectedCellsArray.forEach(({
      id: rowId,
      field
    }) => {
      if (rowId !== lastRowId) {
        lastRowId = rowId;
        rowIndex += 1;
        colIndex = 0;
      }
      const rowDataArr = pastedData[isSingleValuePasted ? 0 : rowIndex];
      const hasRowData = isSingleValuePasted ? true : rowDataArr !== undefined;
      if (hasRowData) {
        const cellValue = isSingleValuePasted ? rowDataArr[0] : rowDataArr[colIndex];
        updateCell({
          rowId,
          field,
          pastedCellValue: cellValue
        });
      }
      colIndex += 1;
    });
    return;
  }
  const visibleColumnFields = (0, _xDataGrid.gridVisibleColumnFieldsSelector)(apiRef).filter(field => {
    if (columnFieldsToExcludeFromPaste.includes(field)) {
      return false;
    }
    return true;
  });
  const selectedRows = apiRef.current.getSelectedRows();
  if (selectedRows.size > 0 && !isSingleValuePasted) {
    // Multiple values are pasted starting from the first and top-most cell
    const pastedRowsDataCount = pastedData.length;

    // There's no guarantee that the selected rows are in the same order as the pasted rows
    selectedRows.forEach((row, rowId) => {
      let rowData;
      if (pastedRowsDataCount === 1) {
        // If only one row is pasted - paste it to all selected rows
        rowData = pastedData[0];
      } else {
        rowData = pastedData.shift();
      }
      if (rowData === undefined) {
        return;
      }
      rowData.forEach((newCellValue, cellIndex) => {
        updateCell({
          rowId,
          field: visibleColumnFields[cellIndex],
          pastedCellValue: newCellValue
        });
      });
    });
    return;
  }
  let selectedCell = (0, _xDataGrid.gridFocusCellSelector)(apiRef);
  if (!selectedCell && selectedCellsArray.length === 1) {
    selectedCell = selectedCellsArray[0];
  }
  if (!selectedCell) {
    return;
  }
  if (columnFieldsToExcludeFromPaste.includes(selectedCell.field)) {
    return;
  }
  const selectedRowId = selectedCell.id;
  const selectedRowIndex = apiRef.current.getRowIndexRelativeToVisibleRows(selectedRowId);
  const visibleRowIds = pagination && paginationMode === 'client' ? (0, _xDataGrid.gridPaginatedVisibleSortedGridRowIdsSelector)(apiRef) : (0, _xDataGrid.gridExpandedSortedRowIdsSelector)(apiRef);
  const selectedFieldIndex = visibleColumnFields.indexOf(selectedCell.field);
  pastedData.forEach((rowData, index) => {
    const rowId = visibleRowIds[selectedRowIndex + index];
    if (typeof rowId === 'undefined') {
      return;
    }
    for (let i = selectedFieldIndex; i < visibleColumnFields.length; i += 1) {
      const field = visibleColumnFields[i];
      const stringValue = rowData[i - selectedFieldIndex];
      updateCell({
        rowId,
        field,
        pastedCellValue: stringValue
      });
    }
  });
}
const useGridClipboardImport = (apiRef, props) => {
  const processRowUpdate = props.processRowUpdate;
  const onProcessRowUpdateError = props.onProcessRowUpdateError;
  const getRowId = props.getRowId;
  const enableClipboardPaste = !props.disableClipboardPaste;
  const rootEl = apiRef.current.rootElementRef?.current;
  const logger = (0, _internals.useGridLogger)(apiRef, 'useGridClipboardImport');
  const splitClipboardPastedText = props.splitClipboardPastedText;
  const {
    pagination,
    paginationMode,
    onBeforeClipboardPasteStart
  } = props;
  const handlePaste = React.useCallback(async (params, event) => {
    if (!enableClipboardPaste) {
      return;
    }
    if (!(0, _internals.isPasteShortcut)(event)) {
      return;
    }
    const focusedCell = (0, _xDataGrid.gridFocusCellSelector)(apiRef);
    if (focusedCell !== null) {
      const cellMode = apiRef.current.getCellMode(focusedCell.id, focusedCell.field);
      if (cellMode === 'edit') {
        // Do not paste data when the cell is in edit mode
        return;
      }
    }
    if (!rootEl) {
      return;
    }
    const text = await getTextFromClipboard(rootEl);
    if (!text) {
      return;
    }
    const pastedData = splitClipboardPastedText(text);
    if (!pastedData) {
      return;
    }
    if (onBeforeClipboardPasteStart) {
      try {
        await onBeforeClipboardPasteStart({
          data: pastedData
        });
      } catch (error) {
        logger.debug('Clipboard paste operation cancelled');
        return;
      }
    }
    const cellUpdater = new CellValueUpdater({
      apiRef,
      processRowUpdate,
      onProcessRowUpdateError,
      getRowId
    });
    apiRef.current.publishEvent('clipboardPasteStart', {
      data: pastedData
    });
    defaultPasteResolver({
      pastedData,
      apiRef: (0, _internals.getPublicApiRef)(apiRef),
      updateCell: (...args) => {
        cellUpdater.updateCell(...args);
      },
      pagination,
      paginationMode
    });
    cellUpdater.applyUpdates();
  }, [apiRef, processRowUpdate, onProcessRowUpdateError, getRowId, enableClipboardPaste, rootEl, splitClipboardPastedText, pagination, paginationMode, onBeforeClipboardPasteStart, logger]);
  const checkIfCanStartEditing = React.useCallback((initialValue, {
    event
  }) => {
    if ((0, _internals.isPasteShortcut)(event) && enableClipboardPaste) {
      // Do not enter cell edit mode on paste
      return false;
    }
    return initialValue;
  }, [enableClipboardPaste]);
  (0, _xDataGrid.useGridApiEventHandler)(apiRef, 'cellKeyDown', handlePaste);
  (0, _xDataGrid.useGridApiOptionHandler)(apiRef, 'clipboardPasteStart', props.onClipboardPasteStart);
  (0, _xDataGrid.useGridApiOptionHandler)(apiRef, 'clipboardPasteEnd', props.onClipboardPasteEnd);
  (0, _internals.useGridRegisterPipeProcessor)(apiRef, 'canStartEditing', checkIfCanStartEditing);
};
exports.useGridClipboardImport = useGridClipboardImport;