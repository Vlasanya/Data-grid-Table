"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GridAggregationHeader = GridAggregationHeader;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));
var React = _interopRequireWildcard(require("react"));
var _composeClasses = _interopRequireDefault(require("@mui/utils/composeClasses"));
var _styles = require("@mui/material/styles");
var _xDataGrid = require("@mui/x-data-grid");
var _gridAggregationUtils = require("../hooks/features/aggregation/gridAggregationUtils");
var _useGridApiContext = require("../hooks/utils/useGridApiContext");
var _useGridRootProps = require("../hooks/utils/useGridRootProps");
var _jsxRuntime = require("react/jsx-runtime");
const _excluded = ["renderHeader"];
const GridAggregationHeaderRoot = (0, _styles.styled)('div', {
  name: 'MuiDataGrid',
  slot: 'AggregationColumnHeader',
  overridesResolver: (_, styles) => styles.aggregationColumnHeader
})({
  display: 'flex',
  flexDirection: 'column',
  [`&.${_xDataGrid.gridClasses['aggregationColumnHeader--alignRight']}`]: {
    alignItems: 'flex-end'
  },
  [`&.${_xDataGrid.gridClasses['aggregationColumnHeader--alignCenter']}`]: {
    alignItems: 'center'
  }
});
const GridAggregationFunctionLabel = (0, _styles.styled)('div', {
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
  return (0, _composeClasses.default)(slots, _xDataGrid.getDataGridUtilityClass, classes);
};
function GridAggregationHeader(props) {
  const {
      renderHeader
    } = props,
    params = (0, _objectWithoutPropertiesLoose2.default)(props, _excluded);
  const {
    colDef,
    aggregation
  } = params;
  const apiRef = (0, _useGridApiContext.useGridApiContext)();
  const rootProps = (0, _useGridRootProps.useGridRootProps)();
  const ownerState = (0, _extends2.default)({}, rootProps, {
    classes: rootProps.classes,
    colDef
  });
  const classes = useUtilityClasses(ownerState);
  if (!aggregation) {
    return null;
  }
  const aggregationLabel = (0, _gridAggregationUtils.getAggregationFunctionLabel)({
    apiRef,
    aggregationRule: aggregation.aggregationRule
  });
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)(GridAggregationHeaderRoot, {
    ownerState: ownerState,
    className: classes.root,
    children: [renderHeader ? renderHeader(params) : /*#__PURE__*/(0, _jsxRuntime.jsx)(_xDataGrid.GridColumnHeaderTitle, {
      label: colDef.headerName ?? colDef.field,
      description: colDef.description,
      columnWidth: colDef.computedWidth
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)(GridAggregationFunctionLabel, {
      ownerState: ownerState,
      className: classes.aggregationLabel,
      children: aggregationLabel
    })]
  });
}