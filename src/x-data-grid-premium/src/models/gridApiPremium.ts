import { GridPrivateOnlyApiCommon } from '@mui/x-data-grid/internals';
import {
  GridApiCommon,
  GridColumnPinningApi, // pro
  GridDetailPanelApi, // pro
  GridDetailPanelPrivateApi, // pro
  GridRowPinningApi, // pro
  GridRowMultiSelectionApi,
  GridColumnReorderApi,
  GridRowProApi,
  GridDataSourceApi, // pro
  GridDataSourcePrivateApi, // pro
} from '@mui/x-data-grid-pro';
import { GridInitialStatePremium, GridStatePremium } from './gridStatePremium';
import type { GridRowGroupingApi, GridExcelExportApi, GridAggregationApi } from '../hooks';
import { GridCellSelectionApi } from '../hooks/features/cellSelection/gridCellSelectionInterfaces';
import type { DataGridPremiumProcessedProps } from './dataGridPremiumProps';

/**
 * The api of Data Grid Premium.
 * TODO: Do not redefine manually the pro features
 */
export interface GridApiPremium
  extends GridApiCommon<GridStatePremium, GridInitialStatePremium>,
    GridRowProApi,
    GridColumnPinningApi,
    GridDetailPanelApi,
    GridRowGroupingApi,
    GridExcelExportApi,
    GridAggregationApi,
    GridRowPinningApi,
    GridDataSourceApi,
    GridCellSelectionApi,
    // APIs that are private in Community plan, but public in Pro and Premium plans
    GridRowMultiSelectionApi,
    GridColumnReorderApi {}

export interface GridPrivateApiPremium
  extends GridApiPremium,
    GridPrivateOnlyApiCommon<GridApiPremium, GridPrivateApiPremium, DataGridPremiumProcessedProps>,
    GridDataSourcePrivateApi,
    GridDetailPanelPrivateApi {}
