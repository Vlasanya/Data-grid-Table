import * as React from "react";
import {
  GridTreeNode,
  useGridSelector,
  gridFilteredTopLevelRowCountSelector,
  GRID_ROOT_GROUP_ID,
} from "@mui/x-data-grid";
import {
  useGridRowAriaAttributes as useGridRowAriaAttributesCommunity,
  gridFilteredChildrenCountLookupSelector,
  gridExpandedSortedRowTreeLevelPositionLookupSelector,
} from "@mui/x-data-grid/internals";
import { useGridPrivateApiContext } from "../../utils/useGridPrivateApiContext";
import { useGridRootProps } from "../../utils/useGridRootProps";

export const useGridRowAriaAttributes = (addTreeDataAttributes?: boolean) => {
  const apiRef = useGridPrivateApiContext();
  const props = useGridRootProps();
  const getRowAriaAttributesCommunity = useGridRowAriaAttributesCommunity();

  const filteredTopLevelRowCount = useGridSelector(
    apiRef,
    gridFilteredTopLevelRowCountSelector
  );
  const filteredChildrenCountLookup = useGridSelector(
    apiRef,
    gridFilteredChildrenCountLookupSelector
  );
  const sortedVisibleRowPositionsLookup = useGridSelector(
    apiRef,
    gridExpandedSortedRowTreeLevelPositionLookupSelector
  );

  return React.useCallback(
    (rowNode: GridTreeNode, index: number) => {
      const ariaAttributes = getRowAriaAttributesCommunity(rowNode, index);
      if (rowNode === null || !(props.treeData || addTreeDataAttributes)) {
        return ariaAttributes;
      }

      if (rowNode.type === "footer" || rowNode.type === "pinnedRow") {
        return ariaAttributes;
      }
      ariaAttributes["aria-level"] = rowNode.depth + 1;

      const filteredChildrenCount =
        filteredChildrenCountLookup[rowNode.id] ?? 0;
      if (rowNode.type === "group" && filteredChildrenCount > 0) {
        ariaAttributes["aria-expanded"] = Boolean(rowNode.childrenExpanded);
      }
      if (rowNode.parent !== null) {
        ariaAttributes["aria-setsize"] =
          rowNode.parent === GRID_ROOT_GROUP_ID
            ? filteredTopLevelRowCount
            : filteredChildrenCountLookup[rowNode.parent];
        ariaAttributes["aria-posinset"] =
          sortedVisibleRowPositionsLookup[rowNode.id];
      }

      return ariaAttributes;
    },
    [
      props.treeData,
      addTreeDataAttributes,
      filteredTopLevelRowCount,
      filteredChildrenCountLookup,
      sortedVisibleRowPositionsLookup,
      getRowAriaAttributesCommunity,
    ]
  );
};
