import * as React from "react";
import { useGridAriaAttributes as useGridAriaAttributesCommunity } from "@mui/x-data-grid/internals";
import { useGridSelector } from "@mui/x-data-grid/internals";
import { gridRowGroupingSanitizedModelSelector } from "../features/rowGrouping/gridRowGroupingSelector";
import { useGridPrivateApiContext } from "./useGridPrivateApiContext";
import { useGridRootProps } from "./useGridRootProps";

export const useGridAriaAttributes = (): React.HTMLAttributes<HTMLElement> => {
  const rootProps = useGridRootProps();
  const ariaAttributesCommunity = useGridAriaAttributesCommunity();
  const apiRef = useGridPrivateApiContext();
  const gridRowGroupingModel = useGridSelector(
    apiRef,
    gridRowGroupingSanitizedModelSelector
  );

  const ariaAttributesPremium =
    (rootProps.experimentalFeatures?.ariaV8 &&
      gridRowGroupingModel.length > 0) ||
    rootProps.treeData
      ? { role: "treegrid" }
      : {};

  return {
    ...ariaAttributesCommunity,
    ...ariaAttributesPremium,
  };
};
