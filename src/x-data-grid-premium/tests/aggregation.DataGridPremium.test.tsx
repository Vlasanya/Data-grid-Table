import * as React from "react";
import { render, screen, within, act, waitFor } from "@testing-library/react";
// import { expect } from "chai";
import { getCell, getColumnHeaderCell, getColumnValues } from "./helperFn";
// import { fireUserEvent } from "test/utils/fireUserEvent";
import userEvent from "@testing-library/user-event";
// import { SinonSpy, spy } from "sinon";
import {
  GridRenderCellParams,
  GridGroupNode,
  GridColDef,
} from "@mui/x-data-grid";
import { DataGridPremium } from "../DataGridPremium/DataGridPremium";
import { DataGridPremiumProps } from "../models/dataGridPremiumProps";
import { GRID_AGGREGATION_FUNCTIONS } from "../hooks/features/aggregation/gridAggregationFunctions";
import { GridAggregationFunction } from "../hooks/features/aggregation/gridAggregationInterfaces";
import { GridApi } from "../typeOverloads/reexports";
import { useGridApiRef } from "../hooks/utils/useGridApiRef";

const isJSDOM = /jsdom/.test(window.navigator.userAgent);

const baselineProps: DataGridPremiumProps = {
  autoHeight: isJSDOM,
  disableVirtualization: true,
  rows: [
    { id: 0, category1: "Cat A", category2: "Cat 1" },
    { id: 1, category1: "Cat A", category2: "Cat 2" },
    { id: 2, category1: "Cat A", category2: "Cat 2" },
    { id: 3, category1: "Cat A", category2: "Cat 2" },
    { id: 4, category1: "Cat A", category2: "Cat 1" },
    { id: 5, category1: "Cat B", category2: "Cat 1" },
  ],
  columns: [
    {
      field: "id",
      type: "number",
    },
    {
      field: "category1",
    },
    {
      field: "category2",
    },
  ],
};

describe("<DataGridPremium /> - Aggregation", () => {
  // const { render, clock } = createRenderer({ clock: "fake" });

  let apiRef: React.MutableRefObject<GridApi>;

  function Test(props: Partial<DataGridPremiumProps>) {
    apiRef = useGridApiRef();

    return (
      <div style={{ width: 300, height: 300 }}>
        <DataGridPremium {...baselineProps} apiRef={apiRef} {...props} />
      </div>
    );
  }

  describe("Setting aggregation model", () => {
    describe("initialState: aggregation.model", () => {
      // it("should allow to initialize aggregation", async () => {
      //   render(
      //     <Test initialState={{ aggregation: { model: { id: "max" } } }} />
      //   );
      //   await waitFor(() => {
      //     const cellValues = screen
      //       .getAllByRole("cell")
      //       .map((cell) => cell.textContent);
      //     expect(cellValues).toEqual([
      //       "0",
      //       "1",
      //       "2",
      //       "3",
      //       "4",
      //       "5",
      //       "5" /* Agg */,
      //     ]);
      //   });
      // });
      // it("should not react to initial state updates", async () => {
      //   const { rerender } = render(
      //     <Test initialState={{ aggregation: { model: { id: "max" } } }} />
      //   );
      //   await waitFor(() => {
      //     const cellValues = screen
      //       .getAllByRole("cell")
      //       .map((cell) => cell.textContent);
      //     expect(cellValues).toEqual([
      //       "0",
      //       "1",
      //       "2",
      //       "3",
      //       "4",
      //       "5",
      //       "5" /* Agg */,
      //     ]);
      //   });
      //   rerender(
      //     <Test initialState={{ aggregation: { model: { id: "min" } } }} />
      //   );
      //   await waitFor(() => {
      //     const cellValues = screen
      //       .getAllByRole("cell")
      //       .map((cell) => cell.textContent);
      //     expect(cellValues).toEqual([
      //       "0",
      //       "1",
      //       "2",
      //       "3",
      //       "4",
      //       "5",
      //       "5" /* Agg */,
      //     ]);
      //   });
      // });
    });

    describe("prop: aggregationModel", () => {
      it("should not call onAggregationModelChange on initialization or aggregationModel prop change", async () => {
        const onAggregationModelChange = jest.fn();

        const { rerender } = render(
          <Test
            aggregationModel={{ id: "max" }}
            onAggregationModelChange={onAggregationModelChange}
          />
        );

        expect(onAggregationModelChange).not.toHaveBeenCalled();

        rerender(
          <Test
            aggregationModel={{ id: "min" }}
            onAggregationModelChange={onAggregationModelChange}
          />
        );

        expect(onAggregationModelChange).not.toHaveBeenCalled();
      });

      // it("should allow to update the aggregation model from the outside", async () => {
      //   const { rerender } = render(<Test aggregationModel={{ id: "max" }} />);

      //   await waitFor(() => {
      //     const cellValues = screen
      //       .getAllByRole("cell")
      //       .map((cell) => cell.textContent);
      //     expect(cellValues).toEqual([
      //       "0",
      //       "1",
      //       "2",
      //       "3",
      //       "4",
      //       "5",
      //       "5" /* Agg */,
      //     ]);
      //   });

      //   rerender(<Test aggregationModel={{ id: "min" }} />);

      //   await waitFor(() => {
      //     const cellValues = screen
      //       .getAllByRole("cell")
      //       .map((cell) => cell.textContent);
      //     expect(cellValues).toEqual([
      //       "0",
      //       "1",
      //       "2",
      //       "3",
      //       "4",
      //       "5",
      //       "0" /* Agg */,
      //     ]);
      //   });

      //   rerender(<Test aggregationModel={{}} />);

      //   await waitFor(() => {
      //     const cellValues = screen
      //       .getAllByRole("cell")
      //       .map((cell) => cell.textContent);
      //     expect(cellValues).toEqual(["0", "1", "2", "3", "4", "5"]);
      //   });
      // });

      it("should ignore aggregation rule that do not match any column", () => {
        render(
          <Test
            initialState={{
              aggregation: { model: { id: "max", idBis: "max" } },
            }}
          />
        );
        expect(getColumnValues(0)).toEqual([
          "0",
          "1",
          "2",
          "3",
          "4",
          "5",
          "5" /* Agg */,
        ]);
      });

      it("should respect aggregation rule with colDef.aggregable = false", () => {
        render(
          <Test
            columns={[
              {
                field: "id",
                type: "number",
              },
              {
                field: "idBis",
                type: "number",
                valueGetter: (valuem, row) => row.id,
                aggregable: false,
              },
            ]}
            initialState={{
              aggregation: { model: { id: "max", idBis: "max" } },
            }}
          />
        );
        expect(getColumnValues(0)).toEqual([
          "0",
          "1",
          "2",
          "3",
          "4",
          "5",
          "5" /* Agg */,
        ]);
        expect(getColumnValues(1)).toEqual([
          "0",
          "1",
          "2",
          "3",
          "4",
          "5",
          "5" /* Agg */,
        ]);
      });

      it("should ignore aggregation rules with invalid aggregation functions", () => {
        render(
          <Test initialState={{ aggregation: { model: { id: "mux" } } }} />
        );
        expect(getColumnValues(0)).toEqual(["0", "1", "2", "3", "4", "5"]);
      });

      it("should correctly restore the column when changing from aggregated to non-aggregated", () => {
        const { rerender } = render(<Test aggregationModel={{ id: "max" }} />);
        expect(getColumnHeaderCell(0, 0).textContent).toEqual("idmax");
        rerender(<Test aggregationModel={{ id: "min" }} />);
        expect(getColumnHeaderCell(0, 0).textContent).toEqual("idmin");
      });

      // See https://github.com/mui/mui-x/issues/10864
      // it("should correctly handle changing aggregated column from non-editable to editable", async () => {
      //   const column: GridColDef = {
      //     field: "value",
      //     type: "number",
      //     editable: false,
      //   };
      //   const { rerender } = render(
      //     <Test
      //       columns={[column]}
      //       rows={[
      //         { id: 1, value: 1 },
      //         { id: 2, value: 10 },
      //       ]}
      //       aggregationModel={{ value: "sum" }}
      //     />
      //   );

      //   const cell = getCell(0, 0);

      //   fireEvent.doubleClick(cell);
      //   expect(cell.querySelector("input")).toEqual(null);

      //   rerender(<Test columns={[{ ...column, editable: true }]} />);
      //   fireEvent.doubleClick(cell);
      //   expect(cell.querySelector("input")).not.toEqual(null);
      //   userEvent.click(getCell(1, 0));

      //   rerender(<Test columns={[{ ...column }]} />);
      //   fireEvent.doubleClick(cell);
      //   await waitFor(() => {
      //     expect(cell.querySelector("input")).toEqual(null);
      //   });
      // });
    });
  });

  describe("Row Grouping", () => {
    it("should aggregate on the grouping row and on the global footer", async () => {
      render(
        <Test
          initialState={{
            rowGrouping: { model: ["category1"] },
            aggregation: { model: { id: "max" } },
          }}
          defaultGroupingExpansionDepth={-1}
        />
      );
      await waitFor(() => {
        expect(getColumnValues(1)).toEqual([
          "4",
          "0",
          "1",
          "2",
          "3",
          "4",
          "5",
          "5",
          "5",
        ]);
      });
    });
  });

  // const SECONDS = 1000;
  // jest.setTimeout(70 * SECONDS)
  describe("prop: getAggregationPosition", () => {
    it("should not aggregate groups if props.getAggregationPosition returns null", () => {
      render(
        <Test
          initialState={{
            rowGrouping: { model: ["category1"] },
            aggregation: { model: { id: "max" } },
          }}
          defaultGroupingExpansionDepth={-1}
          getAggregationPosition={(group) =>
            group?.groupingKey === "Cat A" ? "inline" : null
          }
        />
      );
      expect(getColumnValues(1)).toEqual([
        "4" /* Agg "Cat A" */,
        "0",
        "1",
        "2",
        "3",
        "4",
        "",
        "5",
      ]);
    });

    // it("should react to props.getAggregationPosition update", async () => {
    //   const { rerender } = render(
    //     <Test
    //       initialState={{
    //         rowGrouping: { model: ["category1"] },
    //         aggregation: { model: { id: "max" } },
    //       }}
    //       defaultGroupingExpansionDepth={-1}
    //       // Only group "Cat A" aggregated inline
    //       getAggregationPosition={(group) =>
    //         group?.groupingKey === "Cat A" ? "inline" : null
    //       }
    //     />
    //   );
    //   await waitFor(() => {
    //     expect(getColumnValues(1)).toEqual([
    //       "4" /* Agg "Cat A" */,
    //       "0",
    //       "1",
    //       "2",
    //       "3",
    //       "4",
    //       "",
    //       "5",
    //     ]);
    //   });

    //   // All groups aggregated inline except the root
    //   rerender(
    //     <Test
    //       getAggregationPosition={(group: GridGroupNode) =>
    //         group.depth === -1 ? null : "inline"
    //       }
    //     />
    //   );

    //   await waitFor(() => {
    //     const columnValues = getColumnValues(1);
    //     expect(columnValues).toEqual([
    //       "4" /* Agg "Cat A" */,
    //       "0",
    //       "1",
    //       "2",
    //       "3",
    //       "4",
    //       "5" /* Agg "Cat B" */,
    //       "5",
    //     ]);
    //   }, { timeout: 5000 });

    //   // All groups aggregated in footer except the root
    //   rerender(
    //     <Test
    //       getAggregationPosition={(group: GridGroupNode) =>
    //         group.depth === -1 ? null : "footer"
    //       }
    //     />
    //   );
    //   await waitFor(() => {
    //     expect(getColumnValues(1)).toEqual([
    //       "",
    //       "0",
    //       "1",
    //       "2",
    //       "3",
    //       "4",
    //       "4" /* Agg "Cat A" */,
    //       "",
    //       "5",
    //       "5" /* Agg "Cat B" */,
    //     ]);
    //   });

    //   // All groups aggregated on footer
    //   rerender(<Test getAggregationPosition={() => "footer"} />);
    //   expect(getColumnValues(1)).toEqual([
    //     "",
    //     "0",
    //     "1",
    //     "2",
    //     "3",
    //     "4",
    //     "4" /* Agg "Cat A" */,
    //     "",
    //     "5",
    //     "5" /* Agg "Cat B" */,
    //     "5" /* Agg root */,
    //   ]);

    //   // 0 group aggregated
    //   rerender(<Test getAggregationPosition={() => null} />);
    //   expect(getColumnValues(1)).toEqual([
    //     "",
    //     "0",
    //     "1",
    //     "2",
    //     "3",
    //     "4",
    //     "",
    //     "5",
    //   ]);
    // });
  });

  describe("Tree data", () => {
    function TreeDataTest(props: Omit<DataGridPremiumProps, "columns">) {
      return (
        <Test
          treeData
          defaultGroupingExpansionDepth={-1}
          columns={[
            {
              field: "value",
              headerName: "Value",
              type: "number",
            },
          ]}
          getTreeDataPath={(row) => row.hierarchy}
          getRowId={(row) => row.hierarchy.join("/")}
          groupingColDef={{ headerName: "Files", width: 350 }}
          getAggregationPosition={(rowNode) =>
            rowNode != null ? "inline" : null
          }
          initialState={{
            aggregation: {
              model: {
                value: "sum",
              },
            },
          }}
          {...props}
        />
      );
    }

    it("should use aggregated values instead of provided values on data groups", () => {
      render(
        <TreeDataTest
          rows={[
            {
              hierarchy: ["A"],
              value: 10,
            },
            {
              hierarchy: ["A", "A"],
              value: 1,
            },
            {
              hierarchy: ["A", "B"],
              value: 2,
            },
          ]}
        />
      );

      expect(getColumnValues(1)).toEqual(["3" /* Agg "A" */, "1", "2"]);
    });

    it("should only aggregate based on leaves", () => {
      render(
        <TreeDataTest
          rows={[
            {
              hierarchy: ["A"],
              value: 2,
            },
            {
              hierarchy: ["A", "A"],
              value: 2,
            },
            {
              hierarchy: ["A", "A", "A"],
              value: 1,
            },
            {
              hierarchy: ["A", "A", "B"],
              value: 1,
            },
          ]}
        />
      );

      expect(getColumnValues(1)).toEqual([
        "2" /* Agg "A" */,
        "2" /* Agg "A.A" */,
        "1",
        "1",
      ]);
    });
  });

  describe("Column menu", () => {
    it("should render select on aggregable column", () => {
      render(<Test />);

      act(() => apiRef.current.showColumnMenu("id"));

      expect(screen.queryByLabelText("Aggregation")).not.toBeNull();
    });

    it('should update the aggregation when changing "Aggregation" select value', () => {
      render(<Test />);

      expect(getColumnValues(0)).toEqual(["0", "1", "2", "3", "4", "5"]);

      act(() => apiRef.current.showColumnMenu("id"));
      userEvent.click(screen.getByLabelText("Aggregation"));
      userEvent.click(
        within(
          screen.getByRole("listbox", {
            name: "Aggregation",
          })
        ).getByText("max")
      );

      expect(getColumnValues(0)).toEqual(["0", "1", "2", "3", "4", "5", "5"]);
    });
  });

  describe("prop: aggregatedRows", () => {
    it("should aggregate based on the filtered rows if props.aggregatedRows is not defined", () => {
      render(
        <Test
          initialState={{
            filter: {
              filterModel: {
                items: [{ field: "id", operator: "<", value: 4 }],
              },
            },
            aggregation: { model: { id: "max" } },
          }}
        />
      );
      expect(getColumnValues(0)).toEqual(["0", "1", "2", "3", "3" /* Agg */]);
    });

    it('should aggregate based on the filtered rows if props.aggregatedRows = "filtered"', () => {
      render(
        <Test
          initialState={{
            filter: {
              filterModel: {
                items: [{ field: "id", operator: "<", value: 4 }],
              },
            },
            aggregation: { model: { id: "max" } },
          }}
          aggregationRowsScope="filtered"
        />
      );
      expect(getColumnValues(0)).toEqual(["0", "1", "2", "3", "3" /* Agg */]);
    });

    it('should aggregate based on all the rows if props.aggregatedRows = "all"', () => {
      render(
        <Test
          initialState={{
            filter: {
              filterModel: {
                items: [{ field: "id", operator: "<", value: 4 }],
              },
            },
            aggregation: { model: { id: "max" } },
          }}
          aggregationRowsScope="all"
        />
      );
      expect(getColumnValues(0)).toEqual(["0", "1", "2", "3", "5" /* Agg */]);
    });
  });

  describe("prop: aggregationFunctions", () => {
    it("should ignore aggregation rules not present in props.aggregationFunctions", () => {
      render(
        <Test
          initialState={{ aggregation: { model: { id: "max" } } }}
          aggregationFunctions={{
            min: GRID_AGGREGATION_FUNCTIONS.min,
          }}
        />
      );
      expect(getColumnValues(0)).toEqual(["0", "1", "2", "3", "4", "5"]);
    });

    it("should react to props.aggregationFunctions update", () => {
      const { rerender } = render(
        <Test
          initialState={{ aggregation: { model: { id: "max" } } }}
          aggregationFunctions={{
            min: GRID_AGGREGATION_FUNCTIONS.min,
          }}
        />
      );

      // 'max' is not in props.aggregationFunctions
      expect(getColumnValues(0)).toEqual(["0", "1", "2", "3", "4", "5"]);

      rerender(
        <Test
          aggregationFunctions={{
            min: GRID_AGGREGATION_FUNCTIONS.min,
            max: GRID_AGGREGATION_FUNCTIONS.max,
          }}
        />
      );
      // 'max' is in props.aggregationFunctions
      expect(getColumnValues(0)).toEqual([
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "5" /* Agg */,
      ]);

      const customMax: GridAggregationFunction = {
        ...GRID_AGGREGATION_FUNCTIONS.max,
        apply: (params) =>
          `Agg: ${GRID_AGGREGATION_FUNCTIONS.max.apply(params) as number}`,
      };
      rerender(
        <Test
          aggregationFunctions={{
            min: GRID_AGGREGATION_FUNCTIONS.min,
            max: customMax,
          }}
        />
      );
      // 'max' is in props.aggregationFunctions but has changed
      expect(getColumnValues(0)).toEqual([
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "Agg: 5" /* Agg */,
      ]);
    });
  });

  describe("colDef: aggregable", () => {
    it("should respect `initialState.aggregation.model` prop even if colDef.aggregable = false", () => {
      render(
        <Test
          initialState={{ aggregation: { model: { id: "max" } } }}
          columns={[
            {
              field: "id",
              type: "number",
              aggregable: false,
            },
          ]}
        />
      );
      expect(getColumnValues(0)).toEqual(["0", "1", "2", "3", "4", "5", "5"]);
    });

    it("should respect `aggregationModel` prop even if colDef.aggregable = false", () => {
      render(
        <Test
          aggregationModel={{ id: "max" }}
          columns={[
            {
              field: "id",
              type: "number",
              aggregable: false,
            },
          ]}
        />
      );
      expect(getColumnValues(0)).toEqual(["0", "1", "2", "3", "4", "5", "5"]);
    });

    it("should not render column menu select if colDef.aggregable = false", () => {
      render(
        <Test
          initialState={{ aggregation: { model: { id: "max" } } }}
          columns={[
            {
              field: "id",
              type: "number",
              aggregable: false,
            },
          ]}
        />
      );

      act(() => apiRef.current.showColumnMenu("id"));
      jest.runAllTimers();
      expect(screen.queryAllByLabelText("Aggregation")).toHaveLength(0);
    });
  });

  describe("colDef: availableAggregationFunctions", () => {
    it("should ignore aggregation rules not present in props.aggregationFunctions", () => {
      render(
        <Test
          initialState={{ aggregation: { model: { id: "max" } } }}
          columns={[
            {
              field: "id",
              type: "number",
              availableAggregationFunctions: ["min"],
            },
          ]}
        />
      );
      expect(getColumnValues(0)).toEqual(["0", "1", "2", "3", "4", "5"]);
    });

    it("should react to colDef.availableAggregationFunctions update", () => {
      render(
        <Test
          initialState={{ aggregation: { model: { id: "max" } } }}
          columns={[
            {
              field: "id",
              type: "number",
              availableAggregationFunctions: ["min"],
            },
          ]}
        />
      );
      expect(getColumnValues(0)).toEqual(["0", "1", "2", "3", "4", "5"]);

      act(() =>
        apiRef.current.updateColumns([
          { field: "id", availableAggregationFunctions: ["min", "max"] },
        ])
      );
      expect(getColumnValues(0)).toEqual([
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "5" /* Agg */,
      ]);
    });
  });

  describe("colDef: valueFormatter", () => {
    it("should use the column valueFormatter for aggregation function without custom valueFormatter", () => {
      const customAggregationFunction: GridAggregationFunction = {
        apply: () => "Agg value",
      };

      render(
        <Test
          initialState={{ aggregation: { model: { id: "custom" } } }}
          aggregationFunctions={{ custom: customAggregationFunction }}
          columns={[
            {
              field: "id",
              type: "number",
              valueFormatter: (value) => `- ${value}`,
            },
          ]}
        />
      );
      expect(getColumnValues(0)).toEqual([
        "- 0",
        "- 1",
        "- 2",
        "- 3",
        "- 4",
        "- 5",
        "- Agg value" /* Agg */,
      ]);
    });

    it("should use the aggregation function valueFormatter if defined", () => {
      const customAggregationFunction: GridAggregationFunction = {
        apply: () => "Agg value",
        valueFormatter: (value) => `+ ${value}`,
      };

      render(
        <Test
          initialState={{ aggregation: { model: { id: "custom" } } }}
          aggregationFunctions={{ custom: customAggregationFunction }}
          columns={[
            {
              field: "id",
              type: "number",
              valueFormatter: (value) => `- ${value}`,
            },
          ]}
        />
      );
      expect(getColumnValues(0)).toEqual([
        "- 0",
        "- 1",
        "- 2",
        "- 3",
        "- 4",
        "- 5",
        "+ Agg value" /* Agg */,
      ]);
    });
  });

  describe("colDef: renderCell", () => {
    it("should use the column renderCell", () => {
      const customAggregationFunction: GridAggregationFunction = {
        apply: () => "Agg value",
      };

      render(
        <Test
          initialState={{ aggregation: { model: { id: "custom" } } }}
          aggregationFunctions={{ custom: customAggregationFunction }}
          columns={[
            {
              field: "id",
              type: "number",
              renderCell: (params) => `- ${params.value}`,
            },
          ]}
        />
      );
      expect(getColumnValues(0)).toEqual([
        "- 0",
        "- 1",
        "- 2",
        "- 3",
        "- 4",
        "- 5",
        "- Agg value" /* Agg */,
      ]);
    });

    it("should pass aggregation meta with `hasCellUnit: true` if the aggregation function have no hasCellUnit property ", () => {
      const renderCell = jest.fn(
        (params: GridRenderCellParams) => `- ${params.value}`
      );

      const customAggregationFunction: GridAggregationFunction = {
        apply: () => "Agg value",
      };

      render(
        <Test
          initialState={{ aggregation: { model: { id: "custom" } } }}
          aggregationFunctions={{ custom: customAggregationFunction }}
          columns={[
            {
              field: "id",
              type: "number",
              renderCell,
            },
          ]}
        />
      );

      const callForAggCell = renderCell.mock.calls.find(
        ([params]) => params.rowNode.type === "pinnedRow"
      );
      // @ts-ignore
      expect(callForAggCell![0].aggregation.hasCellUnit).toEqual(true);
    });

    it("should pass aggregation meta with `hasCellUnit: false` if the aggregation function have `hasCellUnit: false` ", () => {
      const renderCell = jest.fn(
        (params: GridRenderCellParams) => `- ${params.value}`
      );

      const customAggregationFunction: GridAggregationFunction = {
        apply: () => "Agg value",
        hasCellUnit: false,
      };

      render(
        <Test
          initialState={{ aggregation: { model: { id: "custom" } } }}
          aggregationFunctions={{ custom: customAggregationFunction }}
          columns={[
            {
              field: "id",
              type: "number",
              renderCell,
            },
          ]}
        />
      );

      const callForAggCell = renderCell.mock.calls.find(
        ([params]) => params.rowNode.type === "pinnedRow"
      );
      // @ts-ignore
      expect(callForAggCell![0].aggregation.hasCellUnit).toEqual(false);
    });
  });

  describe("filter", () => {
    it("should not filter-out the aggregated cells", () => {
      render(
        <Test
          initialState={{
            aggregation: { model: { id: "sum" } },
            filter: {
              filterModel: {
                items: [{ field: "id", operator: "!=", value: 15 }],
              },
            },
          }}
        />
      );

      expect(getColumnValues(0)).toEqual([
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "15" /* Agg */,
      ]);
    });
  });

  describe("sorting", () => {
    it("should always render top level footer below the other rows", () => {
      render(
        <Test
          initialState={{
            aggregation: { model: { id: "sum" } },
            sorting: {
              sortModel: [{ field: "id", sort: "desc" }],
            },
          }}
        />
      );

      expect(getColumnValues(0)).toEqual([
        "5",
        "4",
        "3",
        "2",
        "1",
        "0",
        "15" /* Agg */,
      ]);
    });

    it("should always render group footers below the other rows", () => {
      render(
        <Test
          initialState={{
            rowGrouping: { model: ["category1"] },
            aggregation: { model: { id: "max" } },
            sorting: {
              sortModel: [{ field: "id", sort: "desc" }],
            },
          }}
          defaultGroupingExpansionDepth={-1}
          getAggregationPosition={(group) =>
            group.depth === -1 ? null : "footer"
          }
        />
      );
      expect(getColumnValues(1)).toEqual([
        "",
        "4",
        "3",
        "2",
        "1",
        "0",
        "4" /* Agg "Cat A" */,
        "",
        "5",
        "5" /* Agg "Cat B" */,
      ]);
    });
  });

  describe("built-in aggregation functions", () => {
    describe("`sum`", () => {
      it("should work with numbers", () => {
        expect(
          GRID_AGGREGATION_FUNCTIONS.sum.apply({
            values: [0, 10, 12, 23],
            field: "value",
            groupId: 0,
          })
        ).toEqual(45);
      });

      it("should ignore non-numbers", () => {
        expect(
          GRID_AGGREGATION_FUNCTIONS.sum.apply({
            values: [0, 10, 12, 23, "a", "", undefined, null, NaN, {}, true],
            field: "value",
            groupId: 0,
          })
        ).toEqual(45);
      });
    });

    describe("`avg`", () => {
      it("should work with numbers", () => {
        expect(
          GRID_AGGREGATION_FUNCTIONS.avg.apply({
            values: [0, 10, 12, 23],
            field: "value",
            groupId: 0,
          })
        ).toEqual(11.25);
      });

      it("should ignore non-numbers", () => {
        expect(
          GRID_AGGREGATION_FUNCTIONS.avg.apply({
            values: [0, 10, 12, 23, "a", "", undefined, null, NaN, {}, true],
            field: "value",
            groupId: 0,
          })
        ).toEqual(11.25);
      });
    });

    describe("`size`", () => {
      it("should work with any value types", () => {
        expect(
          GRID_AGGREGATION_FUNCTIONS.size.apply({
            values: [23, "", "a", NaN, {}, false, true],
            field: "value",
            groupId: 0,
          })
        ).toEqual(7);
      });

      it("should ignore undefined values", () => {
        expect(
          GRID_AGGREGATION_FUNCTIONS.size.apply({
            values: [23, "", "a", NaN, {}, false, true, undefined],
            field: "value",
            groupId: 0,
          })
        ).toEqual(7);
      });
    });
  });
});
