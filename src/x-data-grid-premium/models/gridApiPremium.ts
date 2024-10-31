import { GridPrivateOnlyApiCommon } from "@mui/x-data-grid/internals";
import {
  GridDataSourceApi,
  GridDataSourcePrivateApi,
} from "../hooks/features/dataSource/interfaces";
import { GridColumnPinningApi } from "../hooks/features/columnPinning";
import {
  GridDetailPanelPrivateApi,
  GridDetailPanelApi,
} from "../hooks/features/detailPanel";
import { GridRowPinningApi } from "../hooks/features/rowPinning";
import {
  GridApiCommon,
  GridRowMultiSelectionApi,
  GridColumnReorderApi,
  GridRowProApi,
} from "@mui/x-data-grid";
import { GridInitialStatePremium, GridStatePremium } from "./gridStatePremium";
import type {
  GridRowGroupingApi,
  GridExcelExportApi,
  GridAggregationApi,
} from "../hooks";
import { GridCellSelectionApi } from "../hooks/features/cellSelection/gridCellSelectionInterfaces";
import type { DataGridPremiumProcessedProps } from "./dataGridPremiumProps";

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
    GridPrivateOnlyApiCommon<
      GridApiPremium,
      GridPrivateApiPremium,
      DataGridPremiumProcessedProps
    >,
    GridDataSourcePrivateApi,
    GridDetailPanelPrivateApi {}
