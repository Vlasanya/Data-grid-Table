import React from "react";
import {
  GridColumnMenuContainer,
  GridColumnMenuProps,
  GridColumnMenuColumnsItem,
  GridColumnMenuFilterItem,
  GridColumnMenuHideItem,
  GridColumnMenuSortItem,
} from "@mui/x-data-grid";
import MenuItem from "@mui/material/MenuItem";

interface CustomColumnMenuProps extends GridColumnMenuProps {
  pinLeft: (field: string) => void;
  pinRight: (field: string) => void;
}

const CustomColumnMenu: React.FC<CustomColumnMenuProps> = (props) => {
  const { hideMenu, colDef, pinLeft, pinRight, ...other } = props;

  const handlePinLeft = (event: React.MouseEvent) => {
    pinLeft(colDef.field);
    hideMenu?.(event);
  };

  const handlePinRight = (event: React.MouseEvent) => {
    pinRight(colDef.field);
    hideMenu?.(event);
  };

  return (
    <GridColumnMenuContainer hideMenu={hideMenu} colDef={colDef} {...other}>
      <GridColumnMenuSortItem
        onClick={(event) => hideMenu?.(event)}
        colDef={colDef}
      />
      <GridColumnMenuFilterItem
        onClick={(event) => hideMenu?.(event)}
        colDef={colDef}
      />
      <GridColumnMenuHideItem
        onClick={(event) => hideMenu?.(event)}
        colDef={colDef}
      />
      <GridColumnMenuColumnsItem
        onClick={(event) => hideMenu?.(event)}
        colDef={colDef}
      />

      <MenuItem onClick={handlePinLeft}>Pin Left</MenuItem>
      <MenuItem onClick={handlePinRight}>Pin Right</MenuItem>
    </GridColumnMenuContainer>
  );
};

export default CustomColumnMenu;
