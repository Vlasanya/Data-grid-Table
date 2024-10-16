import _extends from "@babel/runtime/helpers/esm/extends";
import * as React from 'react';
import composeClasses from '@mui/utils/composeClasses';
import Box from '@mui/material/Box';
import { useGridSelector, gridFilteredDescendantCountLookupSelector, getDataGridUtilityClass } from '@mui/x-data-grid-pro';
import { useGridApiContext } from "../hooks/utils/useGridApiContext.js";
import { useGridRootProps } from "../hooks/utils/useGridRootProps.js";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const useUtilityClasses = ownerState => {
  const {
    classes
  } = ownerState;
  const slots = {
    root: ['groupingCriteriaCell'],
    toggle: ['groupingCriteriaCellToggle']
  };
  return composeClasses(slots, getDataGridUtilityClass, classes);
};
export function GridGroupingCriteriaCell(props) {
  const {
    id,
    field,
    rowNode,
    hideDescendantCount,
    formattedValue
  } = props;
  const rootProps = useGridRootProps();
  const apiRef = useGridApiContext();
  const ownerState = {
    classes: rootProps.classes
  };
  const classes = useUtilityClasses(ownerState);
  const filteredDescendantCountLookup = useGridSelector(apiRef, gridFilteredDescendantCountLookupSelector);
  const filteredDescendantCount = filteredDescendantCountLookup[rowNode.id] ?? 0;
  const Icon = rowNode.childrenExpanded ? rootProps.slots.groupingCriteriaCollapseIcon : rootProps.slots.groupingCriteriaExpandIcon;
  const handleKeyDown = event => {
    if (event.key === ' ') {
      // We call event.stopPropagation to avoid unfolding the row and also scrolling to bottom
      // TODO: Remove and add a check inside useGridKeyboardNavigation
      event.stopPropagation();
    }
    apiRef.current.publishEvent('cellKeyDown', props, event);
  };
  const handleClick = event => {
    apiRef.current.setRowChildrenExpansion(id, !rowNode.childrenExpanded);
    apiRef.current.setCellFocus(id, field);
    event.stopPropagation();
  };
  let cellContent;
  const colDef = apiRef.current.getColumn(rowNode.groupingField);
  if (typeof colDef.renderCell === 'function') {
    cellContent = colDef.renderCell(props);
  } else if (typeof formattedValue !== 'undefined') {
    cellContent = /*#__PURE__*/_jsx("span", {
      children: formattedValue
    });
  } else {
    cellContent = /*#__PURE__*/_jsx("span", {
      children: rowNode.groupingKey
    });
  }
  return /*#__PURE__*/_jsxs(Box, {
    className: classes.root,
    sx: [rootProps.rowGroupingColumnMode === 'multiple' ? {
      ml: 0
    } : theme => ({
      ml: `calc(var(--DataGrid-cellOffsetMultiplier) * var(--depth) * ${theme.spacing(1)})`
    })],
    style: {
      '--depth': rowNode.depth
    },
    children: [/*#__PURE__*/_jsx("div", {
      className: classes.toggle,
      children: filteredDescendantCount > 0 && /*#__PURE__*/_jsx(rootProps.slots.baseIconButton, _extends({
        size: "small",
        onClick: handleClick,
        onKeyDown: handleKeyDown,
        tabIndex: -1,
        "aria-label": rowNode.childrenExpanded ? apiRef.current.getLocaleText('treeDataCollapse') : apiRef.current.getLocaleText('treeDataExpand')
      }, rootProps.slotProps?.baseIconButton, {
        children: /*#__PURE__*/_jsx(Icon, {
          fontSize: "inherit"
        })
      }))
    }), cellContent, !hideDescendantCount && filteredDescendantCount > 0 ? /*#__PURE__*/_jsxs("span", {
      style: {
        whiteSpace: 'pre'
      },
      children: [" (", filteredDescendantCount, ")"]
    }) : null]
  });
}