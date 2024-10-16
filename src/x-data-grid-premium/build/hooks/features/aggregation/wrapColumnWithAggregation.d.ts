import * as React from 'react';
import { GridColDef, GridFilterOperator } from '@mui/x-data-grid-pro';
import { GridBaseColDef } from '@mui/x-data-grid-pro/internals';
import { GridApiPremium } from '../../../models/gridApiPremium';
import { GridAggregationRule } from './gridAggregationInterfaces';
declare const AGGREGATION_WRAPPABLE_PROPERTIES: readonly ["valueGetter", "valueFormatter", "renderCell", "renderHeader", "filterOperators"];
type WrappableColumnProperty = (typeof AGGREGATION_WRAPPABLE_PROPERTIES)[number];
interface GridColDefWithAggregationWrappers extends GridBaseColDef {
    aggregationWrappedProperties: {
        name: WrappableColumnProperty;
        originalValue: GridBaseColDef[WrappableColumnProperty];
        wrappedValue: GridBaseColDef[WrappableColumnProperty];
    }[];
}
/**
 * Add a wrapper around each wrappable property of the column to customize the behavior of the aggregation cells.
 */
export declare const wrapColumnWithAggregationValue: ({ column, apiRef, aggregationRule, }: {
    column: GridBaseColDef;
    apiRef: React.MutableRefObject<GridApiPremium>;
    aggregationRule: GridAggregationRule;
}) => GridBaseColDef;
/**
 * Remove the aggregation wrappers around the wrappable properties of the column.
 */
export declare const unwrapColumnFromAggregation: ({ column, }: {
    column: GridColDef | GridColDefWithAggregationWrappers;
}) => GridBaseColDef<any, any, any> | {
    field: string;
    headerName?: string;
    description?: string;
    width?: number;
    flex?: number;
    minWidth?: number;
    maxWidth?: number;
    hideable?: boolean;
    sortable?: boolean;
    sortingOrder?: readonly import("@mui/x-data-grid").GridSortDirection[];
    resizable?: boolean;
    editable?: boolean;
    groupable?: boolean;
    pinnable?: boolean;
    sortComparator?: import("@mui/x-data-grid").GridComparatorFn<any> | undefined;
    getSortComparator?: ((sortDirection: import("@mui/x-data-grid").GridSortDirection) => import("@mui/x-data-grid").GridComparatorFn<any> | undefined) | undefined;
    type?: import("@mui/x-data-grid").GridColType;
    align?: import("@mui/x-data-grid").GridAlignment;
    valueGetter?: import("@mui/x-data-grid").GridValueGetter<import("@mui/x-data-grid").GridValidRowModel, any, any, never> | undefined;
    rowSpanValueGetter?: import("@mui/x-data-grid").GridValueGetter<import("@mui/x-data-grid").GridValidRowModel, any, any, never> | undefined;
    valueSetter?: import("@mui/x-data-grid").GridValueSetter<import("@mui/x-data-grid").GridValidRowModel, any, any> | undefined;
    valueFormatter?: import("@mui/x-data-grid").GridValueFormatter<import("@mui/x-data-grid").GridValidRowModel, any, any, never> | undefined;
    valueParser?: import("@mui/x-data-grid").GridValueParser<import("@mui/x-data-grid").GridValidRowModel, any, any> | undefined;
    cellClassName?: import("@mui/x-data-grid").GridCellClassNamePropType<import("@mui/x-data-grid").GridValidRowModel, any> | undefined;
    display?: "text" | "flex";
    renderCell?: ((params: import("@mui/x-data-grid").GridRenderCellParams<import("@mui/x-data-grid").GridValidRowModel, any, any, import("@mui/x-data-grid").GridTreeNodeWithRender>) => React.ReactNode) | undefined;
    renderEditCell?: ((params: import("@mui/x-data-grid").GridRenderEditCellParams<import("@mui/x-data-grid").GridValidRowModel, any, any, import("@mui/x-data-grid").GridTreeNodeWithRender>) => React.ReactNode) | undefined;
    preProcessEditCellProps?: ((params: import("@mui/x-data-grid").GridPreProcessEditCellProps) => import("@mui/x-data-grid").GridEditCellProps | Promise<import("@mui/x-data-grid").GridEditCellProps>) | undefined;
    headerClassName?: import("@mui/x-data-grid").GridColumnHeaderClassNamePropType;
    renderHeader?: ((params: import("@mui/x-data-grid").GridColumnHeaderParams<import("@mui/x-data-grid").GridValidRowModel, any, any>) => React.ReactNode) | undefined;
    headerAlign?: import("@mui/x-data-grid").GridAlignment;
    hideSortIcons?: boolean;
    disableColumnMenu?: boolean;
    filterable?: boolean;
    filterOperators?: readonly GridFilterOperator<import("@mui/x-data-grid").GridValidRowModel, any, any>[] | undefined;
    getApplyQuickFilterFn?: import("@mui/x-data-grid").GetApplyQuickFilterFn<import("@mui/x-data-grid").GridValidRowModel, any> | undefined;
    disableReorder?: boolean;
    disableExport?: boolean;
    colSpan?: number | import("@mui/x-data-grid").GridColSpanFn<import("@mui/x-data-grid").GridValidRowModel, any, any> | undefined;
    renderHeaderFilter?: (params: import("@mui/x-data-grid-pro").GridRenderHeaderFilterProps) => React.ReactNode;
    aggregable?: boolean;
    availableAggregationFunctions?: string[];
    groupingValueGetter?: import("../../..").GridGroupingValueGetter<import("@mui/x-data-grid").GridValidRowModel> | undefined;
    pastedValueParser?: import("../../..").GridPastedValueParser<import("@mui/x-data-grid").GridValidRowModel, any, any> | undefined;
};
export {};
