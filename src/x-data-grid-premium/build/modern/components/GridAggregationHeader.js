import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
const _excluded = ["renderHeader"];
import * as React from 'react';
import composeClasses from '@mui/utils/composeClasses';
import { styled } from '@mui/material/styles';
import { getDataGridUtilityClass, gridClasses, GridColumnHeaderTitle } from '@mui/x-data-grid';
import { getAggregationFunctionLabel } from "../hooks/features/aggregation/gridAggregationUtils.js";
import { useGridApiContext } from "../hooks/utils/useGridApiContext.js";
import { useGridRootProps } from "../hooks/utils/useGridRootProps.js";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const GridAggregationHeaderRoot = styled('div', {
  name: 'MuiDataGrid',
  slot: 'AggregationColumnHeader',
  overridesResolver: (_, styles) => styles.aggregationColumnHeader
})({
  display: 'flex',
  flexDirection: 'column',
  [`&.${gridClasses['aggregationColumnHeader--alignRight']}`]: {
    alignItems: 'flex-end'
  },
  [`&.${gridClasses['aggregationColumnHeader--alignCenter']}`]: {
    alignItems: 'center'
  }
});
const GridAggregationFunctionLabel = styled('div', {
  name: 'MuiDataGrid',
  slot: 'AggregationColumnHeaderLabel',
  overridesResolver: (_, styles) => styles.aggregationColumnHeaderLabel
})(({
  theme
}) => {
  return {
    fontSize: theme.typography.caption.fontSize,
    lineHeight: 'normal',
    color: theme.palette.text.secondary,
    marginTop: -1
  };
});
const useUtilityClasses = ownerState => {
  const {
    classes,
    colDef
  } = ownerState;
  const slots = {
    root: ['aggregationColumnHeader', colDef.headerAlign === 'left' && 'aggregationColumnHeader--alignLeft', colDef.headerAlign === 'center' && 'aggregationColumnHeader--alignCenter', colDef.headerAlign === 'right' && 'aggregationColumnHeader--alignRight'],
    aggregationLabel: ['aggregationColumnHeaderLabel']
  };
  return composeClasses(slots, getDataGridUtilityClass, classes);
};
function GridAggregationHeader(props) {
  const {
      renderHeader
    } = props,
    params = _objectWithoutPropertiesLoose(props, _excluded);
  const {
    colDef,
    aggregation
  } = params;
  const apiRef = useGridApiContext();
  const rootProps = useGridRootProps();
  const ownerState = _extends({}, rootProps, {
    classes: rootProps.classes,
    colDef
  });
  const classes = useUtilityClasses(ownerState);
  if (!aggregation) {
    return null;
  }
  const aggregationLabel = getAggregationFunctionLabel({
    apiRef,
    aggregationRule: aggregation.aggregationRule
  });
  return /*#__PURE__*/_jsxs(GridAggregationHeaderRoot, {
    ownerState: ownerState,
    className: classes.root,
    children: [renderHeader ? renderHeader(params) : /*#__PURE__*/_jsx(GridColumnHeaderTitle, {
      label: colDef.headerName ?? colDef.field,
      description: colDef.description,
      columnWidth: colDef.computedWidth
    }), /*#__PURE__*/_jsx(GridAggregationFunctionLabel, {
      ownerState: ownerState,
      className: classes.aggregationLabel,
      children: aggregationLabel
    })]
  });
}
export { GridAggregationHeader };