import * as React from 'react';
import { GridColumnMenuProps, GridColumnMenuItemProps } from '@mui/x-data-grid-pro';
import { GridColumnMenuAggregationItem } from './GridColumnMenuAggregationItem';
export declare function GridColumnMenuGroupingItem(props: GridColumnMenuItemProps): React.JSX.Element;
export declare const GRID_COLUMN_MENU_SLOTS_PREMIUM: {
    columnMenuAggregationItem: typeof GridColumnMenuAggregationItem;
    columnMenuGroupingItem: typeof GridColumnMenuGroupingItem;
    columnMenuPinningItem: typeof import("@mui/x-data-grid-pro").GridColumnMenuPinningItem;
    columnMenuSortItem: typeof import("@mui/x-data-grid").GridColumnMenuSortItem;
    columnMenuFilterItem: typeof import("@mui/x-data-grid").GridColumnMenuFilterItem;
    columnMenuColumnsItem: typeof import("@mui/x-data-grid").GridColumnMenuColumnsItem;
};
export declare const GRID_COLUMN_MENU_SLOT_PROPS_PREMIUM: {
    columnMenuAggregationItem: {
        displayOrder: number;
    };
    columnMenuGroupingItem: {
        displayOrder: number;
    };
    columnMenuPinningItem: {
        displayOrder: number;
    };
    columnMenuSortItem: {
        displayOrder: number;
    };
    columnMenuFilterItem: {
        displayOrder: number;
    };
    columnMenuColumnsItem: {
        displayOrder: number;
    };
};
export declare const GridPremiumColumnMenu: React.ForwardRefExoticComponent<GridColumnMenuProps & React.RefAttributes<HTMLUListElement>>;
