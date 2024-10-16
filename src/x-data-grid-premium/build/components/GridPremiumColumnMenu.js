"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GRID_COLUMN_MENU_SLOT_PROPS_PREMIUM = exports.GRID_COLUMN_MENU_SLOTS_PREMIUM = void 0;
exports.GridColumnMenuGroupingItem = GridColumnMenuGroupingItem;
exports.GridPremiumColumnMenu = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var React = _interopRequireWildcard(require("react"));
var _xDataGridPro = require("@mui/x-data-grid-pro");
var _GridColumnMenuAggregationItem = require("./GridColumnMenuAggregationItem");
var _rowGrouping = require("../hooks/features/rowGrouping");
var _GridColumnMenuRowGroupItem = require("./GridColumnMenuRowGroupItem");
var _GridColumnMenuRowUngroupItem = require("./GridColumnMenuRowUngroupItem");
var _jsxRuntime = require("react/jsx-runtime");
function GridColumnMenuGroupingItem(props) {
  const {
    colDef
  } = props;
  if ((0, _rowGrouping.isGroupingColumn)(colDef.field)) {
    return /*#__PURE__*/(0, _jsxRuntime.jsx)(_GridColumnMenuRowGroupItem.GridColumnMenuRowGroupItem, (0, _extends2.default)({}, props));
  }
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_GridColumnMenuRowUngroupItem.GridColumnMenuRowUngroupItem, (0, _extends2.default)({}, props));
}
const GRID_COLUMN_MENU_SLOTS_PREMIUM = exports.GRID_COLUMN_MENU_SLOTS_PREMIUM = (0, _extends2.default)({}, _xDataGridPro.GRID_COLUMN_MENU_SLOTS, {
  columnMenuAggregationItem: _GridColumnMenuAggregationItem.GridColumnMenuAggregationItem,
  columnMenuGroupingItem: GridColumnMenuGroupingItem
});
const GRID_COLUMN_MENU_SLOT_PROPS_PREMIUM = exports.GRID_COLUMN_MENU_SLOT_PROPS_PREMIUM = (0, _extends2.default)({}, _xDataGridPro.GRID_COLUMN_MENU_SLOT_PROPS, {
  columnMenuAggregationItem: {
    displayOrder: 23
  },
  columnMenuGroupingItem: {
    displayOrder: 27
  }
});
const GridPremiumColumnMenu = exports.GridPremiumColumnMenu = /*#__PURE__*/React.forwardRef(function GridPremiumColumnMenuSimple(props, ref) {
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_xDataGridPro.GridGenericColumnMenu, (0, _extends2.default)({
    ref: ref
  }, props, {
    defaultSlots: GRID_COLUMN_MENU_SLOTS_PREMIUM,
    defaultSlotProps: GRID_COLUMN_MENU_SLOT_PROPS_PREMIUM
  }));
});