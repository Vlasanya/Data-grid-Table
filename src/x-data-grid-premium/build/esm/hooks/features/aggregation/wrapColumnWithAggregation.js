import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import _extends from "@babel/runtime/helpers/esm/extends";
const _excluded = ["aggregationWrappedProperties"];
import * as React from 'react';
import { gridAggregationLookupSelector } from "./gridAggregationSelectors.js";
import { GridFooterCell } from "../../../components/GridFooterCell.js";
import { GridAggregationHeader } from "../../../components/GridAggregationHeader.js";
import { jsx as _jsx } from "react/jsx-runtime";
const AGGREGATION_WRAPPABLE_PROPERTIES = ['valueGetter', 'valueFormatter', 'renderCell', 'renderHeader', 'filterOperators'];
const getAggregationValueWrappedValueGetter = ({
  value: valueGetter,
  getCellAggregationResult
}) => {
  const wrappedValueGetter = (value, row, column, apiRef) => {
    const rowId = apiRef.current.getRowId?.(row);
    const cellAggregationResult = rowId ? getCellAggregationResult(rowId, column.field) : null;
    if (cellAggregationResult != null) {
      return cellAggregationResult?.value ?? null;
    }
    if (valueGetter) {
      return valueGetter(value, row, column, apiRef);
    }
    return row[column.field];
  };
  return wrappedValueGetter;
};
const getAggregationValueWrappedValueFormatter = ({
  value: valueFormatter,
  aggregationRule,
  getCellAggregationResult
}) => {
  // If neither the inline aggregation function nor the footer aggregation function have a custom value formatter,
  // Then we don't wrap the column value formatter
  if (!aggregationRule.aggregationFunction.valueFormatter) {
    return valueFormatter;
  }
  const wrappedValueFormatter = (value, row, column, apiRef) => {
    const rowId = apiRef.current.getRowId(row);
    if (rowId != null) {
      const cellAggregationResult = getCellAggregationResult(rowId, column.field);
      if (cellAggregationResult != null) {
        return aggregationRule.aggregationFunction.valueFormatter?.(value, row, column, apiRef);
      }
    }
    if (valueFormatter) {
      return valueFormatter(value, row, column, apiRef);
    }
    return value;
  };
  return wrappedValueFormatter;
};
const getAggregationValueWrappedRenderCell = ({
  value: renderCell,
  aggregationRule,
  getCellAggregationResult
}) => {
  const wrappedRenderCell = params => {
    const cellAggregationResult = getCellAggregationResult(params.id, params.field);
    if (cellAggregationResult != null) {
      if (!renderCell) {
        if (cellAggregationResult.position === 'footer') {
          return /*#__PURE__*/_jsx(GridFooterCell, _extends({}, params));
        }
        return params.formattedValue;
      }
      const aggregationMeta = {
        hasCellUnit: aggregationRule.aggregationFunction.hasCellUnit ?? true,
        aggregationFunctionName: aggregationRule.aggregationFunctionName
      };
      return renderCell(_extends({}, params, {
        aggregation: aggregationMeta
      }));
    }
    if (!renderCell) {
      return params.formattedValue;
    }
    return renderCell(params);
  };
  return wrappedRenderCell;
};

/**
 * Skips the filtering for aggregated rows
 */
const getWrappedFilterOperators = ({
  value: filterOperators,
  apiRef,
  getCellAggregationResult
}) => filterOperators.map(operator => {
  const baseGetApplyFilterFn = operator.getApplyFilterFn;
  const getApplyFilterFn = (filterItem, colDef) => {
    const filterFn = baseGetApplyFilterFn(filterItem, colDef);
    if (!filterFn) {
      return null;
    }
    return (value, row, column, api) => {
      if (getCellAggregationResult(apiRef.current.getRowId(row), column.field) != null) {
        return true;
      }
      return filterFn(value, row, column, api);
    };
  };
  return _extends({}, operator, {
    getApplyFilterFn
  });
});

/**
 * Add the aggregation method around the header name
 */
const getWrappedRenderHeader = ({
  value: renderHeader,
  aggregationRule
}) => {
  const wrappedRenderHeader = params => {
    return /*#__PURE__*/_jsx(GridAggregationHeader, _extends({}, params, {
      aggregation: {
        aggregationRule
      },
      renderHeader: renderHeader
    }));
  };
  return wrappedRenderHeader;
};

/**
 * Add a wrapper around each wrappable property of the column to customize the behavior of the aggregation cells.
 */
export const wrapColumnWithAggregationValue = ({
  column,
  apiRef,
  aggregationRule
}) => {
  const getCellAggregationResult = (id, field) => {
    let cellAggregationPosition = null;
    const rowNode = apiRef.current.getRowNode(id);
    if (rowNode.type === 'group') {
      cellAggregationPosition = 'inline';
    } else if (id.toString().startsWith('auto-generated-group-footer-')) {
      cellAggregationPosition = 'footer';
    }
    if (cellAggregationPosition == null) {
      return null;
    }

    // TODO: Add custom root id
    const groupId = cellAggregationPosition === 'inline' ? id : rowNode.parent ?? '';
    const aggregationResult = gridAggregationLookupSelector(apiRef)?.[groupId]?.[field];
    if (!aggregationResult || aggregationResult.position !== cellAggregationPosition) {
      return null;
    }
    return aggregationResult;
  };
  let didWrapSomeProperty = false;
  const wrappedColumn = _extends({}, column, {
    aggregationWrappedProperties: []
  });
  const wrapColumnProperty = (property, wrapper) => {
    const originalValue = column[property];
    const wrappedProperty = wrapper({
      apiRef,
      value: originalValue,
      colDef: column,
      aggregationRule,
      getCellAggregationResult
    });
    if (wrappedProperty !== originalValue) {
      didWrapSomeProperty = true;
      wrappedColumn[property] = wrappedProperty;
      wrappedColumn.aggregationWrappedProperties.push({
        name: property,
        originalValue,
        wrappedValue: wrappedProperty
      });
    }
  };
  wrapColumnProperty('valueGetter', getAggregationValueWrappedValueGetter);
  wrapColumnProperty('valueFormatter', getAggregationValueWrappedValueFormatter);
  wrapColumnProperty('renderCell', getAggregationValueWrappedRenderCell);
  wrapColumnProperty('renderHeader', getWrappedRenderHeader);
  wrapColumnProperty('filterOperators', getWrappedFilterOperators);
  if (!didWrapSomeProperty) {
    return column;
  }
  return wrappedColumn;
};

/**
 * Remove the aggregation wrappers around the wrappable properties of the column.
 */
export const unwrapColumnFromAggregation = ({
  column
}) => {
  if (!column.aggregationWrappedProperties) {
    return column;
  }
  const _ref = column,
    {
      aggregationWrappedProperties
    } = _ref,
    unwrappedColumn = _objectWithoutPropertiesLoose(_ref, _excluded);
  aggregationWrappedProperties.forEach(({
    name,
    originalValue,
    wrappedValue
  }) => {
    // The value changed since we wrapped it
    if (wrappedValue !== unwrappedColumn[name]) {
      return;
    }
    unwrappedColumn[name] = originalValue;
  });
  return unwrappedColumn;
};