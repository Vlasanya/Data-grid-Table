import _extends from "@babel/runtime/helpers/esm/extends";
import * as React from 'react';
import { GridGenericColumnMenu, GRID_COLUMN_MENU_SLOTS, GRID_COLUMN_MENU_SLOT_PROPS } from '@mui/x-data-grid-pro';
import { GridColumnMenuAggregationItem } from "./GridColumnMenuAggregationItem.js";
import { isGroupingColumn } from "../hooks/features/rowGrouping/index.js";
import { GridColumnMenuRowGroupItem } from "./GridColumnMenuRowGroupItem.js";
import { GridColumnMenuRowUngroupItem } from "./GridColumnMenuRowUngroupItem.js";
import { jsx as _jsx } from "react/jsx-runtime";
export function GridColumnMenuGroupingItem(props) {
  const {
    colDef
  } = props;
  if (isGroupingColumn(colDef.field)) {
    return /*#__PURE__*/_jsx(GridColumnMenuRowGroupItem, _extends({}, props));
  }
  return /*#__PURE__*/_jsx(GridColumnMenuRowUngroupItem, _extends({}, props));
}
export const GRID_COLUMN_MENU_SLOTS_PREMIUM = _extends({}, GRID_COLUMN_MENU_SLOTS, {
  columnMenuAggregationItem: GridColumnMenuAggregationItem,
  columnMenuGroupingItem: GridColumnMenuGroupingItem
});
export const GRID_COLUMN_MENU_SLOT_PROPS_PREMIUM = _extends({}, GRID_COLUMN_MENU_SLOT_PROPS, {
  columnMenuAggregationItem: {
    displayOrder: 23
  },
  columnMenuGroupingItem: {
    displayOrder: 27
  }
});
export const GridPremiumColumnMenu = /*#__PURE__*/React.forwardRef(function GridPremiumColumnMenuSimple(props, ref) {
  return /*#__PURE__*/_jsx(GridGenericColumnMenu, _extends({
    ref: ref
  }, props, {
    defaultSlots: GRID_COLUMN_MENU_SLOTS_PREMIUM,
    defaultSlotProps: GRID_COLUMN_MENU_SLOT_PROPS_PREMIUM
  }));
});