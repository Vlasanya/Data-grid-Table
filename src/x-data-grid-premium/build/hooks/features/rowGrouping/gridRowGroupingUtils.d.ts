import * as React from 'react';
import { GridRowTreeConfig, GridFilterState, GridFilterModel, GridRowModel, GridColDef, GridKeyValue } from '@mui/x-data-grid-pro';
import { GridAggregatedFilterItemApplier, GridColumnRawLookup } from '@mui/x-data-grid-pro/internals';
import { DataGridPremiumProcessedProps } from '../../../models/dataGridPremiumProps';
import { GridGroupingRule, GridGroupingRules, GridRowGroupingModel } from './gridRowGroupingInterfaces';
import { GridStatePremium } from '../../../models/gridStatePremium';
import { GridPrivateApiPremium } from '../../../models/gridApiPremium';
export declare const GRID_ROW_GROUPING_SINGLE_GROUPING_FIELD = "__row_group_by_columns_group__";
export declare const ROW_GROUPING_STRATEGY = "grouping-columns";
export declare const getRowGroupingFieldFromGroupingCriteria: (groupingCriteria: string | null) => string;
export declare const getRowGroupingCriteriaFromGroupingField: (groupingColDefField: string) => string | null;
export declare const isGroupingColumn: (field: string) => boolean;
interface FilterRowTreeFromTreeDataParams {
    rowTree: GridRowTreeConfig;
    isRowMatchingFilters: GridAggregatedFilterItemApplier | null;
    filterModel: GridFilterModel;
    apiRef: React.MutableRefObject<GridPrivateApiPremium>;
}
/**
 * A leaf is visible if it passed the filter
 * A group is visible if all the following criteria are met:
 * - One of its children is passing the filter
 * - It is passing the filter
 */
export declare const filterRowTreeFromGroupingColumns: (params: FilterRowTreeFromTreeDataParams) => Omit<GridFilterState, "filterModel">;
export declare const getColDefOverrides: (groupingColDefProp: DataGridPremiumProcessedProps["groupingColDef"], fields: string[]) => import("@mui/x-data-grid-pro").GridGroupingColDefOverride<any> | null | undefined;
export declare const mergeStateWithRowGroupingModel: (rowGroupingModel: GridRowGroupingModel) => (state: GridStatePremium) => GridStatePremium;
export declare const setStrategyAvailability: (privateApiRef: React.MutableRefObject<GridPrivateApiPremium>, disableRowGrouping: boolean) => void;
export declare const getCellGroupingCriteria: ({ row, colDef, groupingRule, apiRef, }: {
    row: GridRowModel;
    colDef: GridColDef;
    groupingRule: GridGroupingRule;
    apiRef: React.MutableRefObject<GridPrivateApiPremium>;
}) => {
    key: GridKeyValue | null | undefined;
    field: string;
};
export declare const getGroupingRules: ({ sanitizedRowGroupingModel, columnsLookup, }: {
    sanitizedRowGroupingModel: GridRowGroupingModel;
    columnsLookup: GridColumnRawLookup;
}) => GridGroupingRules;
/**
 * Compares two sets of grouping rules to determine if they are equal or not.
 */
export declare const areGroupingRulesEqual: (newValue: GridGroupingRules, previousValue: GridGroupingRules) => boolean;
export {};
