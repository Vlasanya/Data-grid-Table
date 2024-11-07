import { render, fireEvent, screen, act } from "@testing-library/react";
import {
  getCell,
  getColumnHeaderCell,
  getColumnHeadersTextContent,
  getColumnValues,
  getRow,
} from "./helperFn";
import userEvent from "@testing-library/user-event";
import { GridApi } from "../typeOverloads/reexports";
import { useGridApiRef } from "../hooks/utils/useGridApiRef";
import { DataGridPremium } from "../DataGridPremium/DataGridPremium";
import { DataGridPremiumProps } from "../models/dataGridPremiumProps";
import * as React from "react";
import { waitFor } from "@testing-library/react";
import {
  GridGroupNode,
  GridLogicOperator,
  GridRowsProp,
  GridPaginationModel,
} from "@mui/x-data-grid";
import { GRID_TREE_DATA_GROUPING_FIELD } from "../hooks/features/treeData/gridTreeDataGroupColDef";

const isJSDOM = /jsdom/.test(window.navigator.userAgent);

const rowsWithoutGap: GridRowsProp = [
  { name: "A" },
  { name: "A.A" },
  { name: "A.B" },
  { name: "B" },
  { name: "B.A" },
  { name: "B.B" },
  { name: "B.B.A" },
  { name: "B.B.A.A" },
  { name: "C" },
];

const rowsWithGap: GridRowsProp = [
  { name: "A" },
  { name: "A.B" },
  { name: "A.A" },
  { name: "B.A" },
  { name: "B.B" },
];

const baselineProps: DataGridPremiumProps = {
  autoHeight: isJSDOM,
  rows: rowsWithoutGap,
  columns: [
    {
      field: "name",
      width: 200,
    },
  ],
  treeData: true,
  getTreeDataPath: (row) => row.name.split("."),
  getRowId: (row) => row.name,
};

describe("<DataGridPremium /> - Tree data", () => {
  let apiRef: React.MutableRefObject<GridApi>;

  function Test(props: Partial<DataGridPremiumProps>) {
    apiRef = useGridApiRef();

    return (
      <div style={{ width: 300, height: 800 }}>
        <DataGridPremium
          {...baselineProps}
          apiRef={apiRef}
          {...props}
          disableVirtualization
        />
      </div>
    );
  }

  describe("prop: treeData", () => {
    it("should support tree data toggling", () => {
      const { rerender } = render(<Test treeData={false} />);
      expect(getColumnHeadersTextContent()).toEqual(["name"]);
      expect(getColumnValues(0)).toEqual([
        "A",
        "A.A",
        "A.B",
        "B",
        "B.A",
        "B.B",
        "B.B.A",
        "B.B.A.A",
        "C",
      ]);
      rerender(<Test treeData />);
      expect(getColumnHeadersTextContent()).toEqual(["Group", "name"]);
      expect(getColumnValues(1)).toEqual(["A", "B", "C"]);
      rerender(<Test treeData={false} />);
      expect(getColumnHeadersTextContent()).toEqual(["name"]);
      expect(getColumnValues(0)).toEqual([
        "A",
        "A.A",
        "A.B",
        "B",
        "B.A",
        "B.B",
        "B.B.A",
        "B.B.A.A",
        "C",
      ]);
    });

    // it("should support enabling treeData after apiRef.current.updateRows has modified the rows", async () => {
    //   const { rerender } = render(
    //     <Test
    //       treeData={false}
    //       defaultGroupingExpansionDepth={-1}
    //       key="test-1"
    //     />
    //   );
    //   expect(getColumnHeadersTextContent()).toEqual(["name"]);
    //   expect(getColumnValues(0)).toEqual([
    //     "A",
    //     "A.A",
    //     "A.B",
    //     "B",
    //     "B.A",
    //     "B.B",
    //     "B.B.A",
    //     "B.B.A.A",
    //     "C",
    //   ]);
    //   act(() =>
    //     apiRef.current.updateRows([{ name: "A.A", _action: "delete" }])
    //   );
    //   expect(getColumnValues(0)).toEqual([
    //     "A",
    //     "A.B",
    //     "B",
    //     "B.A",
    //     "B.B",
    //     "B.B.A",
    //     "B.B.A.A",
    //     "C",
    //   ]);
    //   rerender(<Test treeData key="test-2" />);
    //   await waitFor(() => {
    //     expect(getColumnHeadersTextContent()).toEqual(["Group", "name"]);
    //     expect(getColumnValues(1)).toEqual([
    //       "A",
    //       "A.B",
    //       "B",
    //       "B.A",
    //       "B.B",
    //       "B.B.A",
    //       "B.B.A.A",
    //       "C",
    //     ]);
    //   });
    // });

    it("should support new dataset", () => {
      const { rerender } = render(<Test />);
      rerender(
        <Test
          rows={[
            { nameBis: "1" },
            { nameBis: "1.1" },
            { nameBis: "1.2" },
            { nameBis: "2" },
            { nameBis: "2.1" },
          ]}
          columns={[
            {
              field: "nameBis",
              width: 200,
            },
          ]}
          getTreeDataPath={(row) => row.nameBis.split(".")}
          getRowId={(row) => row.nameBis}
        />
      );
      expect(getColumnHeadersTextContent()).toEqual(["Group", "nameBis"]);
      expect(getColumnValues(1)).toEqual(["1", "2"]);
    });

    it("should keep children expansion when changing some of the rows", () => {
      render(
        <Test disableVirtualization rows={[{ name: "A" }, { name: "A.A" }]} />
      );
      expect(getColumnValues(1)).toEqual(["A"]);
      act(() => apiRef.current.setRowChildrenExpansion("A", true));
      jest.runAllTimers();
      expect(getColumnValues(1)).toEqual(["A", "A.A"]);
      act(() => apiRef.current.updateRows([{ name: "B" }]));
      expect(getColumnValues(1)).toEqual(["A", "A.A", "B"]);
    });
  });

  describe("prop: getTreeDataPath", () => {
    it("should allow to transform path", () => {
      render(
        <Test
          getTreeDataPath={(row) => [...row.name.split(".").reverse()]}
          defaultGroupingExpansionDepth={-1}
        />
      );
      expect(getColumnValues(1)).toEqual([
        "A",
        "A.A",
        "",
        "B.B.A.A",
        "B.A",
        "B.B.A",
        "B",
        "A.B",
        "B.B",
        "C",
      ]);
    });

  //   it("should support new getTreeDataPath", () => {
  //     const { rerender } = render(<Test defaultGroupingExpansionDepth={-1} />);
  //     expect(getColumnValues(1)).toEqual([
  //       "A",
  //       "A.A",
  //       "A.B",
  //       "B",
  //       "B.A",
  //       "B.B",
  //       "B.B.A",
  //       "B.B.A.A",
  //       "C",
  //     ]);
  //     // setProps({
  //     //   getTreeDataPath: (row) => [...row.name.split(".").reverse()],
  //     // } as Pick<DataGridPremiumProps, "getTreeDataPath">);
  //     rerender(
  //       <Test getTreeDataPath={(row) => [...row.name.split(".").reverse()]} />
  //     );
  //     expect(getColumnValues(1)).toEqual([
  //       "A",
  //       "A.A",
  //       "",
  //       "B.B.A.A",
  //       "B.A",
  //       "B.B.A",
  //       "B",
  //       "A.B",
  //       "B.B",
  //       "C",
  //     ]);
  //   });
  });

  describe("prop: defaultGroupingExpansionDepth", () => {
    it("should not expand any row if defaultGroupingExpansionDepth = 0", () => {
      render(<Test defaultGroupingExpansionDepth={0} />);
      expect(getColumnValues(1)).toEqual(["A", "B", "C"]);
    });

    it("should expand all top level rows if defaultGroupingExpansionDepth = 1", () => {
      render(<Test defaultGroupingExpansionDepth={1} />);
      expect(getColumnValues(1)).toEqual([
        "A",
        "A.A",
        "A.B",
        "B",
        "B.A",
        "B.B",
        "C",
      ]);
    });

    it("should expand all rows up to depth of 2 if defaultGroupingExpansionDepth = 2", () => {
      render(<Test defaultGroupingExpansionDepth={2} />);
      expect(getColumnValues(1)).toEqual([
        "A",
        "A.A",
        "A.B",
        "B",
        "B.A",
        "B.B",
        "B.B.A",
        "C",
      ]);
    });

    it("should expand all rows if defaultGroupingExpansionDepth = -1", () => {
      render(<Test defaultGroupingExpansionDepth={2} />);
      expect(getColumnValues(1)).toEqual([
        "A",
        "A.A",
        "A.B",
        "B",
        "B.A",
        "B.B",
        "B.B.A",
        "C",
      ]);
    });

    it("should not re-apply default expansion on rerender after expansion manually toggled", () => {
      const { rerender } = render(<Test />);
      expect(getColumnValues(1)).toEqual(["A", "B", "C"]);
      act(() => apiRef.current.setRowChildrenExpansion("B", true));
      expect(getColumnValues(1)).toEqual(["A", "B", "B.A", "B.B", "C"]);
      rerender(<Test sortModel={[{ field: "name", sort: "desc" }]} />);
      expect(getColumnValues(1)).toEqual(["C", "B", "B.B", "B.A", "A"]);
    });
  });

  describe("prop: isGroupExpandedByDefault", () => {
    it("should expand groups according to isGroupExpandedByDefault when defined", () => {
      const isGroupExpandedByDefault = jest.fn(
        (node: GridGroupNode) => node.id === "A"
      );
      render(<Test isGroupExpandedByDefault={isGroupExpandedByDefault} />);
      expect(isGroupExpandedByDefault).toHaveBeenCalledTimes(4); // Should not be called on leaves
      const { childrenExpanded, children, childrenFromPath, ...node } = apiRef
        .current.state.rows.tree.A as GridGroupNode;
      const callForNodeA = isGroupExpandedByDefault.mock.calls.find(
        ([callNode]: [GridGroupNode]) => callNode.id === node.id
      )!;
      expect(callForNodeA[0]).toMatchObject(node);
      expect(getColumnValues(1)).toEqual(["A", "A.A", "A.B", "B", "C"]);
    });

    it("should have priority over defaultGroupingExpansionDepth when both defined", () => {
      const isGroupExpandedByDefault = (node: GridGroupNode) => node.id === "A";

      render(
        <Test
          isGroupExpandedByDefault={isGroupExpandedByDefault}
          defaultGroupingExpansionDepth={-1}
        />
      );
      expect(getColumnValues(1)).toEqual(["A", "A.A", "A.B", "B", "C"]);
    });
  });

  describe("prop: groupingColDef", () => {
    it("should set the custom headerName", () => {
      render(<Test groupingColDef={{ headerName: "Custom header name" }} />);
      expect(getColumnHeadersTextContent()).toEqual([
        "Custom header name",
        "name",
      ]);
    });

    it("should render descendant count when hideDescendantCount = false", () => {
      render(
        <Test
          groupingColDef={{ hideDescendantCount: false }}
          defaultGroupingExpansionDepth={-1}
        />
      );
      expect(getColumnValues(0)).toEqual([
        "A (2)",
        "A",
        "B",
        "B (4)",
        "A",
        "B (2)",
        "A (1)",
        "A",
        "C",
      ]);
    });

    it("should not render descendant count when hideDescendantCount = true", () => {
      render(
        <Test
          groupingColDef={{ hideDescendantCount: true }}
          defaultGroupingExpansionDepth={-1}
        />
      );
      expect(getColumnValues(0)).toEqual([
        "A",
        "A",
        "B",
        "B",
        "A",
        "B",
        "A",
        "A",
        "C",
      ]);
    });

    // https://github.com/mui/mui-x/issues/9344
    it("should support valueFormatter", () => {
      render(
        <Test
          groupingColDef={{ valueFormatter: (value) => `> ${value}` }}
          defaultGroupingExpansionDepth={-1}
        />
      );
      expect(getColumnValues(0)).toEqual([
        "> A (2)",
        "> A",
        "> B",
        "> B (4)",
        "> A",
        "> B (2)",
        "> A (1)",
        "> A",
        "> C",
      ]);
    });
  });

  describe("row grouping column", () => {
    it("should add a grouping column", () => {
      render(<Test />);
      const columnsHeader = getColumnHeadersTextContent();
      expect(columnsHeader).toEqual(["Group", "name"]);
    });

    it("should render a toggling icon only when a row has children", () => {
      render(
        <Test
          rows={[
            { name: "A" },
            { name: "A.C" },
            { name: "B" },
            { name: "B.A" },
          ]}
          filterModel={{
            logicOperator: GridLogicOperator.Or,
            items: [
              { field: "name", operator: "endsWith", value: "A", id: 0 },
              { field: "name", operator: "endsWith", value: "B", id: 1 },
            ],
          }}
        />
      );
      expect(getColumnValues(1)).toEqual(["A", "B"]);
      // No children after filtering
      expect(getCell(0, 0).querySelectorAll("button")).toHaveLength(0);
      // Some children after filtering
      expect(getCell(1, 0).querySelectorAll("button")).toHaveLength(1);
    });

    it("should toggle expansion when clicking on grouping column icon", () => {
      render(<Test />);
      expect(getColumnValues(1)).toEqual(["A", "B", "C"]);
      fireEvent.click(getCell(0, 0).querySelector("button")!);
      expect(getColumnValues(1)).toEqual(["A", "A.A", "A.B", "B", "C"]);
      fireEvent.click(getCell(0, 0).querySelector("button")!);
      expect(getColumnValues(1)).toEqual(["A", "B", "C"]);
    });

    it("should toggle expansion when pressing Space while focusing grouping column", () => {
      render(<Test />);
      expect(getColumnValues(1)).toEqual(["A", "B", "C"]);
      userEvent.click(getCell(0, 0));
      expect(getColumnValues(1)).toEqual(["A", "B", "C"]);
      fireEvent.keyDown(getCell(0, 0), { key: " " });
      expect(getColumnValues(1)).toEqual(["A", "A.A", "A.B", "B", "C"]);
      fireEvent.keyDown(getCell(0, 0), { key: " " });
      expect(getColumnValues(1)).toEqual(["A", "B", "C"]);
    });

    it("should add auto generated rows if some parents do not exist", () => {
      render(<Test rows={rowsWithGap} defaultGroupingExpansionDepth={-1} />);
      expect(getColumnValues(1)).toEqual(["A", "A.B", "A.A", "", "B.A", "B.B"]);
    });

    it("should keep the grouping column width between generations", () => {
      render(<Test groupingColDef={{ width: 200 }} />);
      expect(getColumnHeaderCell(0)).toHaveStyle({ width: "200px" });
      act(() =>
        apiRef.current.updateColumns([
          { field: GRID_TREE_DATA_GROUPING_FIELD, width: 100 },
        ])
      );
      expect(getColumnHeaderCell(0)).toHaveStyle({ width: "100px" });
      act(() =>
        apiRef.current.updateColumns([
          {
            field: "name",
            headerName: "New name",
          },
        ])
      );
      expect(getColumnHeaderCell(0)).toHaveStyle({ width: "100px" });
    });
  });

  describe("pagination", () => {
    function PaginatedTest({
      initialModel,
    }: {
      initialModel: GridPaginationModel;
    }) {
      const [paginationModel, setPaginationModel] =
        React.useState(initialModel);
      return (
        <Test
          pagination
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[paginationModel.pageSize]}
        />
      );
    }

    it("should respect the pageSize for the top level rows when toggling children expansion", () => {
      render(<PaginatedTest initialModel={{ pageSize: 2, page: 0 }} />);
      expect(getColumnValues(1)).toEqual(["A", "B"]);
      fireEvent.click(getCell(0, 0).querySelector("button")!);
      expect(getColumnValues(1)).toEqual(["A", "A.A", "A.B", "B"]);
      fireEvent.click(screen.getByRole("button", { name: /next page/i }));
      expect(getColumnValues(1)).toEqual(["C"]);
    });

    it("should keep the row expansion when switching page", () => {
      render(<PaginatedTest initialModel={{ pageSize: 1, page: 0 }} />);
      expect(getColumnValues(1)).toEqual(["A"]);
      fireEvent.click(getCell(0, 0).querySelector("button")!);
      expect(getColumnValues(1)).toEqual(["A", "A.A", "A.B"]);
      fireEvent.click(screen.getByRole("button", { name: /next page/i }));
      expect(getColumnValues(1)).toEqual(["B"]);
      fireEvent.click(getCell(3, 0).querySelector("button")!);
      expect(getColumnValues(1)).toEqual(["B", "B.A", "B.B"]);
      fireEvent.click(screen.getByRole("button", { name: /previous page/i }));
      expect(getColumnValues(1)).toEqual(["A", "A.A", "A.B"]);
      fireEvent.click(getCell(0, 0).querySelector("button")!);
      expect(getColumnValues(1)).toEqual(["A"]);
      fireEvent.click(screen.getByRole("button", { name: /next page/i }));
      expect(getColumnValues(1)).toEqual(["B", "B.A", "B.B"]);
    });
  });

  describe("filter", () => {
    it("should not show a node if none of its children match the filters and it does not match the filters", () => {
      render(
        <Test
          rows={[{ name: "B" }, { name: "B.B" }]}
          filterModel={{
            items: [{ field: "name", value: "A", operator: "endsWith" }],
          }}
          defaultGroupingExpansionDepth={-1}
        />
      );

      expect(getColumnValues(1)).toEqual([]);
    });

    it("should show a node if some of its children match the filters even if it does not match the filters", () => {
      render(
        <Test
          rows={[{ name: "B" }, { name: "B.A" }, { name: "B.B" }]}
          filterModel={{
            items: [{ field: "name", value: "A", operator: "endsWith" }],
          }}
          defaultGroupingExpansionDepth={-1}
        />
      );

      expect(getColumnValues(1)).toEqual(["B", "B.A"]);
    });

    it("should show a node if none of its children match the filters but it does match the filters", () => {
      render(
        <Test
          rows={[{ name: "A" }, { name: "A.B" }]}
          filterModel={{
            items: [{ field: "name", value: "A", operator: "endsWith" }],
          }}
          defaultGroupingExpansionDepth={-1}
        />
      );

      expect(getColumnValues(1)).toEqual(["A"]);
    });

    it("should not filter the children if props.disableChildrenFiltering = true", () => {
      render(
        <Test
          rows={[{ name: "B" }, { name: "B.A" }, { name: "B.B" }]}
          filterModel={{
            items: [{ field: "name", value: "B", operator: "endsWith" }],
          }}
          disableChildrenFiltering
          defaultGroupingExpansionDepth={-1}
        />
      );

      expect(getColumnValues(1)).toEqual(["B", "B.A", "B.B"]);
    });

    // it("should allow to toggle props.disableChildrenFiltering", async () => {
    //   const { rerender } = render(
    //     <Test
    //       rows={[{ name: "B" }, { name: "B.A" }, { name: "B.B" }]}
    //       filterModel={{
    //         items: [{ field: "name", value: "B", operator: "endsWith" }],
    //       }}
    //       defaultGroupingExpansionDepth={-1}
    //     />
    //   );
    //   expect(getColumnValues(1)).toEqual(["B", "B.B"]);
    //   rerender(<Test disableChildrenFiltering />);
    //   await waitFor(() => {
    //     expect(getColumnValues(1)).toEqual(["B", "B.A", "B.B"]);
    //   });
    //   rerender(<Test disableChildrenFiltering={false} />);
    //   expect(getColumnValues(1)).toEqual(["B", "B.B"]);
    // });

    it('should log an error when using filterMode="server" and treeData', () => {
      const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});
      render(<Test filterMode="server" treeData />);
      expect(consoleErrorMock).toHaveBeenCalledWith(
        expect.stringContaining(
          'MUI X: The `filterMode="server"` prop is not available when the `treeData` is enabled.'
        )
      );
      consoleErrorMock.mockRestore();
    });       

    it("should set the filtered descendant count on matching nodes even if the children are collapsed", () => {
      render(
        <Test
          filterModel={{
            items: [{ field: "name", value: "A", operator: "endsWith" }],
          }}
        />
      );

      // A has A.A but not A.B
      // B has B.A (match filter), B.B (has matching children), B.B.A (match filters), B.B.A.A (match filters)
      expect(getColumnValues(0)).toEqual(["A (1)", "B (4)"]);
    });

    it("should apply quick filter without throwing error", () => {
      render(
        <Test
          initialState={{
            filter: {
              filterModel: {
                items: [],
                quickFilterValues: ["A", "B"],
              },
            },
          }}
        />
      );

      // A has A.A but not A.B
      // B has B.A (match filter), B.B (has matching children), B.B.A (match filters), B.B.A.A (match filters)
      expect(getColumnValues(0)).toEqual(["A (1)", "B (4)"]);
    });

    it("should remove generated rows when they and their children do not pass quick filter", () => {
      render(
        <Test
          rows={[
            { name: "A.B" },
            { name: "A.C" },
            { name: "B.C" },
            { name: "B.D" },
            { name: "D.A" },
          ]}
          filterModel={{ items: [], quickFilterValues: ["D"] }}
          defaultGroupingExpansionDepth={-1}
        />
      );

      expect(getColumnValues(0)).toEqual(["B (1)", "D", "D (1)", "A"]);
    });

    it("should keep the correct count of the children and descendants in the filter state", () => {
      render(
        <Test
          rows={[
            { name: "A" },
            { name: "A.A" },
            { name: "A.B" },
            { name: "A.B.A" },
            { name: "A.B.B" },
            { name: "A.C" },
            { name: "B" },
            { name: "B.A" },
            { name: "B.B" },
            { name: "B.C" },
            { name: "C" },
          ]}
          filterModel={{ items: [], quickFilterValues: ["A"] }}
          defaultGroupingExpansionDepth={3}
        />
      );

      const { filteredChildrenCountLookup, filteredDescendantCountLookup } =
        apiRef.current.state.filter;

      expect(filteredChildrenCountLookup.A).toEqual(3);
      expect(filteredDescendantCountLookup.A).toEqual(5);

      expect(filteredChildrenCountLookup.B).toEqual(1);
      expect(filteredDescendantCountLookup.B).toEqual(1);

      expect(filteredChildrenCountLookup.C).toEqual(undefined);
      expect(filteredDescendantCountLookup.C).toEqual(undefined);

      act(() => {
        apiRef.current.updateRows([{ name: "A.D" }]);
      });

      expect(apiRef.current.state.filter.filteredChildrenCountLookup.A).toEqual(
        4
      );
      expect(
        apiRef.current.state.filter.filteredDescendantCountLookup.A
      ).toEqual(6);
    });
  });

  describe("sorting", () => {
    it("should respect the prop order for a given depth when no sortModel provided", () => {
      render(
        <Test
          rows={[
            { name: "D" },
            { name: "A.B" },
            { name: "A" },
            { name: "A.A" },
          ]}
          defaultGroupingExpansionDepth={-1}
        />
      );
      expect(getColumnValues(1)).toEqual(["D", "A", "A.B", "A.A"]);
    });

    it("should apply the sortModel on every depth of the tree if props.disableChildrenSorting = false", () => {
      render(
        <Test
          sortModel={[{ field: "name", sort: "desc" }]}
          defaultGroupingExpansionDepth={-1}
        />
      );
      expect(getColumnValues(1)).toEqual([
        "C",
        "B",
        "B.B",
        "B.B.A",
        "B.B.A.A",
        "B.A",
        "A",
        "A.B",
        "A.A",
      ]);
    });

    it("should only apply the sortModel on top level rows if props.disableChildrenSorting = true", () => {
      render(
        <Test
          sortModel={[{ field: "name", sort: "desc" }]}
          disableChildrenSorting
          defaultGroupingExpansionDepth={-1}
        />
      );
      expect(getColumnValues(1)).toEqual([
        "C",
        "B",
        "B.A",
        "B.B",
        "B.B.A",
        "B.B.A.A",
        "A",
        "A.A",
        "A.B",
      ]);
    });

    // it("should allow to toggle props.disableChildrenSorting", () => {
    //   const { rerender } = render(
    //     <Test
    //       sortModel={[{ field: "name", sort: "desc" }]}
    //       defaultGroupingExpansionDepth={-1}
    //     />
    //   );
    //   expect(getColumnValues(1)).toEqual([
    //     "C",
    //     "B",
    //     "B.B",
    //     "B.B.A",
    //     "B.B.A.A",
    //     "B.A",
    //     "A",
    //     "A.B",
    //     "A.A",
    //   ]);
    //   rerender(<Test disableChildrenFiltering />);
    //   expect(getColumnValues(1)).toEqual([
    //     "C",
    //     "B",
    //     "B.A",
    //     "B.B",
    //     "B.B.A",
    //     "B.B.A.A",
    //     "A",
    //     "A.A",
    //     "A.B",
    //   ]);
    //   rerender(<Test disableChildrenFiltering={false} />);
    //   expect(getColumnValues(1)).toEqual([
    //     "C",
    //     "B",
    //     "B.B",
    //     "B.B.A",
    //     "B.B.A.A",
    //     "B.A",
    //     "A",
    //     "A.B",
    //     "A.A",
    //   ]);
    // });

    // it.only("should update the order server side", async () => {
    //   const { rerender } = render(
    //     <Test sortingMode="server" defaultGroupingExpansionDepth={-1} />
    //   );
    //   expect(getColumnValues(1)).toEqual([
    //     "A",
    //     "A.A",
    //     "A.B",
    //     "B",
    //     "B.A",
    //     "B.B",
    //     "B.B.A",
    //     "B.B.A.A",
    //     "C",
    //   ]);
    //   rerender(
    //     <Test
    //       rows={[
    //         { name: "C" },
    //         { name: "B" },
    //         { name: "B.B" },
    //         { name: "B.B.A" },
    //         { name: "B.B.A.A" },
    //         { name: "B.A" },
    //         { name: "A" },
    //         { name: "A.B" },
    //         { name: "A.A" },
    //       ]}
    //     />
    //   );
    //   await waitFor(
    //     () => {
    //       expect(getColumnValues(1)).toEqual([
    //         "C",
    //         "B",
    //         "B.B",
    //         "B.B.A",
    //         "B.B.A.A",
    //         "B.A",
    //         "A",
    //         "A.B",
    //         "A.A",
    //       ]);
    //   });
    // });
  });

  describe("accessibility", () => {
    it("should add necessary treegrid aria attributes to the rows", () => {
      render(<Test defaultGroupingExpansionDepth={-1} />);

      expect(getRow(0).getAttribute("aria-level")).toEqual("1"); // A
      expect(getRow(1).getAttribute("aria-level")).toEqual("2"); // A.A
      expect(getRow(1).getAttribute("aria-posinset")).toEqual("1");
      expect(getRow(1).getAttribute("aria-setsize")).toEqual("2");
      expect(getRow(2).getAttribute("aria-level")).toEqual("2"); // A.B
      expect(getRow(4).getAttribute("aria-posinset")).toEqual("1"); // B.A
    });

    it("should adjust treegrid aria attributes after filtering", () => {
      render(
        <Test
          defaultGroupingExpansionDepth={-1}
          initialState={{
            filter: {
              filterModel: {
                items: [],
                quickFilterValues: ["B"],
              },
            },
          }}
        />
      );

      expect(getRow(0).getAttribute("aria-level")).toEqual("1"); // A
      expect(getRow(1).getAttribute("aria-level")).toEqual("2"); // A.B
      expect(getRow(1).getAttribute("aria-posinset")).toEqual("1");
      expect(getRow(1).getAttribute("aria-setsize")).toEqual("1"); // A.A is filtered out, set size is now 1
      expect(getRow(2).getAttribute("aria-level")).toEqual("1"); // B
      expect(getRow(3).getAttribute("aria-posinset")).toEqual("1"); // B.A
      expect(getRow(3).getAttribute("aria-setsize")).toEqual("2"); // B.A & B.B
    });

    it("should not add the set specific aria attributes to pinned rows", () => {
      render(
        <Test
          defaultGroupingExpansionDepth={-1}
          pinnedRows={{
            top: [
              {
                name: "Pin",
              },
            ],
          }}
        />
      );

      expect(getRow(0).getAttribute("aria-rowindex")).toEqual("2"); // header row is 1
      expect(getRow(0).getAttribute("aria-level")).toEqual(null);
      expect(getRow(0).getAttribute("aria-posinset")).toEqual(null);
      expect(getRow(0).getAttribute("aria-setsize")).toEqual(null);
      expect(getRow(1).getAttribute("aria-rowindex")).toEqual("3");
      expect(getRow(1).getAttribute("aria-level")).toEqual("1"); // A
      expect(getRow(1).getAttribute("aria-posinset")).toEqual("1");
      expect(getRow(1).getAttribute("aria-setsize")).toEqual("3"); // A, B, C
    });
  });

  describe("regressions", () => {
    // See https://github.com/mui/mui-x/issues/9402
    it("should not fail with checkboxSelection", () => {
      const initialRows = rowsWithoutGap;
      const { rerender } = render(
        <Test checkboxSelection rows={initialRows} />
      );

      const newRows = [...initialRows];
      newRows.splice(7, 1);
      rerender(<Test rows={newRows} />);
    });
  });
});
