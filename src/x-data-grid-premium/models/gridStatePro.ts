import {
  GridInitialState as GridInitialStateCommunity,
  GridState as GridStateCommunity,
  GridColumnPinningState,
  GridPinnedColumnFields,
} from "@mui/x-data-grid";
import type {
  GridDetailPanelState,
  GridDetailPanelInitialState,
} from "../hooks/features/detailPanel/gridDetailPanelInterface";
import type { GridColumnReorderState } from "../hooks/features/columnReorder";
import type { GridDataSourceState } from "../hooks/features/dataSource/interfaces";

/**
 * The state of Data Grid Pro.
 */
export interface GridStatePro extends GridStateCommunity {
  columnReorder: GridColumnReorderState;
  pinnedColumns: GridColumnPinningState;
  detailPanel: GridDetailPanelState;
  dataSource: GridDataSourceState;
}

/**
 * The initial state of Data Grid Pro.
 */
export interface GridInitialStatePro extends GridInitialStateCommunity {
  pinnedColumns?: GridPinnedColumnFields;
  detailPanel?: GridDetailPanelInitialState;
}
