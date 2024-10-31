import { DATA_GRID_DEFAULT_SLOTS_COMPONENTS } from "@mui/x-data-grid/internals";
import type { GridProSlotsComponent } from "../models/gridProSlotsComponent";
import { GridProColumnMenu } from "../components/GridProColumnMenu";
import { GridColumnHeaders } from "../components/GridColumnHeaders";
import { GridHeaderFilterMenu } from "../components/headerFiltering/GridHeaderFilterMenu";
import { GridHeaderFilterCell } from "../components/headerFiltering/GridHeaderFilterCell";
import { GridDetailPanels } from "../components/GridDetailPanels";
import { GridPinnedRows } from "../components/GridPinnedRows";
import materialSlots from "../material";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";

export const DATA_GRID_PRO_DEFAULT_SLOTS_COMPONENTS: GridProSlotsComponent = {
  ...DATA_GRID_DEFAULT_SLOTS_COMPONENTS,
  ...materialSlots,
  columnMenu: GridProColumnMenu,
  columnHeaders: GridColumnHeaders,
  detailPanels: GridDetailPanels,
  headerFilterCell: GridHeaderFilterCell,
  headerFilterMenu: GridHeaderFilterMenu,
  pinnedRows: GridPinnedRows,
  columnMenuPinLeftIcon: ArrowLeftIcon,
  columnMenuPinRightIcon: ArrowRightIcon,
};
