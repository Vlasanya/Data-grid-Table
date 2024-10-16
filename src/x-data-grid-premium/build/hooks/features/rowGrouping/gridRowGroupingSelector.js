"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.gridRowGroupingSanitizedModelSelector = exports.gridRowGroupingModelSelector = void 0;
var _xDataGridPro = require("@mui/x-data-grid-pro");
var _internals = require("@mui/x-data-grid/internals");
const gridRowGroupingStateSelector = state => state.rowGrouping;
const gridRowGroupingModelSelector = exports.gridRowGroupingModelSelector = (0, _internals.createSelector)(gridRowGroupingStateSelector, rowGrouping => rowGrouping.model);
const gridRowGroupingSanitizedModelSelector = exports.gridRowGroupingSanitizedModelSelector = (0, _internals.createSelectorMemoized)(gridRowGroupingModelSelector, _xDataGridPro.gridColumnLookupSelector, (model, columnsLookup) => model.filter(field => !!columnsLookup[field]));