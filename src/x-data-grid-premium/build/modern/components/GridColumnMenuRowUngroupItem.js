import * as React from 'react';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { gridColumnLookupSelector, useGridSelector } from '@mui/x-data-grid-pro';
import { useGridApiContext } from "../hooks/utils/useGridApiContext.js";
import { gridRowGroupingSanitizedModelSelector } from "../hooks/features/rowGrouping/gridRowGroupingSelector.js";
import { useGridRootProps } from "../hooks/utils/useGridRootProps.js";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function GridColumnMenuRowUngroupItem(props) {
  const {
    colDef,
    onClick
  } = props;
  const apiRef = useGridApiContext();
  const rowGroupingModel = useGridSelector(apiRef, gridRowGroupingSanitizedModelSelector);
  const columnsLookup = useGridSelector(apiRef, gridColumnLookupSelector);
  const rootProps = useGridRootProps();
  if (!colDef.groupable) {
    return null;
  }
  const ungroupColumn = event => {
    apiRef.current.removeRowGroupingCriteria(colDef.field);
    onClick(event);
  };
  const groupColumn = event => {
    apiRef.current.addRowGroupingCriteria(colDef.field);
    onClick(event);
  };
  const name = columnsLookup[colDef.field].headerName ?? colDef.field;
  if (rowGroupingModel.includes(colDef.field)) {
    return /*#__PURE__*/_jsxs(MenuItem, {
      onClick: ungroupColumn,
      children: [/*#__PURE__*/_jsx(ListItemIcon, {
        children: /*#__PURE__*/_jsx(rootProps.slots.columnMenuUngroupIcon, {
          fontSize: "small"
        })
      }), /*#__PURE__*/_jsx(ListItemText, {
        children: apiRef.current.getLocaleText('unGroupColumn')(name)
      })]
    });
  }
  return /*#__PURE__*/_jsxs(MenuItem, {
    onClick: groupColumn,
    children: [/*#__PURE__*/_jsx(ListItemIcon, {
      children: /*#__PURE__*/_jsx(rootProps.slots.columnMenuGroupIcon, {
        fontSize: "small"
      })
    }), /*#__PURE__*/_jsx(ListItemText, {
      children: apiRef.current.getLocaleText('groupColumn')(name)
    })]
  });
}