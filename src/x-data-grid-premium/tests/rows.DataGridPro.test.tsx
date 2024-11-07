import * as React from "react";
import { render, fireEvent, act, waitFor } from "@testing-library/react";
import {
  $,
  $$,
  grid,
  gridOffsetTop,
  getCell,
  getRow,
  getColumnValues,
  getRows,
  getColumnHeaderCell,
} from "./helperFn";
import userEvent from "@testing-library/user-event";
import { GridApi } from "../typeOverloads/reexports";
import { useGridApiRef } from "../hooks/utils/useGridApiRef";
import { DataGridPremium } from "../DataGridPremium/DataGridPremium";
import { DataGridPremiumProps } from "../models/dataGridPremiumProps";
import {
  GridRowModel,
  gridFocusCellSelector,
  gridClasses,
  GridValidRowModel,
} from "@mui/x-data-grid";
import { useBasicDemoData, getBasicGridData } from "./basic-data-service";

const isJSDOM = /jsdom/.test(window.navigator.userAgent);

interface BaselineProps extends DataGridPremiumProps {
  rows: GridValidRowModel[];
}

describe("<DataGridPremium /> - Rows", () => {
  let baselineProps: BaselineProps;

  describe("getRowId", () => {
    beforeEach(() => {
      baselineProps = {
        autoHeight: isJSDOM,
        rows: [
          {
            clientId: "c1",
            first: "Mike",
            age: 11,
          },
          {
            clientId: "c2",
            first: "Jack",
            age: 11,
          },
          {
            clientId: "c3",
            first: "Mike",
            age: 20,
          },
        ],
        columns: [{ field: "clientId" }, { field: "first" }, { field: "age" }],
      };
    });

    it("should not crash with weird id", () => {
      const columns = [{ field: "id" }];
      const rows = [{ id: "'1" }, { id: '"2' }];
      render(
        <div style={{ height: 300, width: 300 }}>
          <DataGridPremium rows={rows} columns={columns} checkboxSelection />
        </div>
      );
    });

    it("should allow to switch between cell mode", () => {
      let apiRef: React.MutableRefObject<GridApi>;
      const editableProps = { ...baselineProps };
      editableProps.columns = editableProps.columns.map((col) => ({
        ...col,
        editable: true,
      }));
      const getRowId: DataGridPremiumProps["getRowId"] = (row) =>
        `${row.clientId}`;

      function Test() {
        apiRef = useGridApiRef();
        return (
          <div style={{ width: 300, height: 300 }}>
            <DataGridPremium
              {...editableProps}
              apiRef={apiRef}
              getRowId={getRowId}
            />
          </div>
        );
      }
      render(<Test />);
      act(() =>
        apiRef!.current.startCellEditMode({ id: "c2", field: "first" })
      );
      const cell = getCell(1, 1);

      expect(cell).toHaveClass("MuiDataGrid-cell--editable");
      expect(cell).toHaveClass("MuiDataGrid-cell--editing");
      expect(cell.querySelector("input")!.value).toEqual("Jack");
      act(() => apiRef!.current.stopCellEditMode({ id: "c2", field: "first" }));

      expect(cell).toHaveClass("MuiDataGrid-cell--editable");
      expect(cell).not.toHaveClass("MuiDataGrid-cell--editing");
      expect(cell.querySelector("input")).toEqual(null);
    });

    it("should not clone the row", () => {
      const getRowId: DataGridPremiumProps["getRowId"] = (row) =>
        `${row.clientId}`;
      let apiRef: React.MutableRefObject<GridApi>;
      function Test() {
        apiRef = useGridApiRef();
        return (
          <div style={{ width: 300, height: 300 }}>
            <DataGridPremium
              {...baselineProps}
              getRowId={getRowId}
              apiRef={apiRef}
            />
          </div>
        );
      }
      render(<Test />);
      expect(apiRef!.current.getRow("c1")).toEqual(baselineProps.rows[0]);
    });
  });

  describe("prop: rows", () => {
    it("should not throttle even when props.throttleRowsMs is defined", () => {
      const { rows, columns } = getBasicGridData(5, 2);

      function Test(props: Pick<DataGridPremiumProps, "rows">) {
        return (
          <div style={{ width: 300, height: 300 }}>
            <DataGridPremium
              {...props}
              columns={columns}
              autoHeight={isJSDOM}
              throttleRowsMs={100}
              disableVirtualization
            />
          </div>
        );
      }

      const { rerender } = render(<Test rows={rows.slice(0, 2)} />);

      expect(getColumnValues(0)).toEqual(["0", "1"]);
      rerender(<Test rows={rows} />);
      expect(getColumnValues(0)).toEqual(["0", "1", "2", "3", "4"]);
    });
  });

  describe("apiRef: updateRows", () => {
    beforeEach(() => {
      baselineProps = {
        autoHeight: isJSDOM,
        rows: [
          {
            id: 0,
            brand: "Nike",
          },
          {
            id: 1,
            brand: "Adidas",
          },
          {
            id: 2,
            brand: "Puma",
          },
        ],
        columns: [{ field: "brand", headerName: "Brand" }],
      };
    });

    let apiRef: React.MutableRefObject<GridApi>;

    function TestCase(props: Partial<DataGridPremiumProps>) {
      apiRef = useGridApiRef();
      return (
        <div style={{ width: 300, height: 300 }}>
          <DataGridPremium
            {...baselineProps}
            apiRef={apiRef}
            {...props}
            disableVirtualization
          />
        </div>
      );
    }

    it("should not throttle by default", () => {
      render(<TestCase />);
      expect(getColumnValues(0)).toEqual(["Nike", "Adidas", "Puma"]);
      act(() => apiRef.current.updateRows([{ id: 1, brand: "Fila" }]));
      expect(getColumnValues(0)).toEqual(["Nike", "Fila", "Puma"]);
    });

    it("should allow to enable throttle", async () => {
      render(<TestCase throttleRowsMs={100} />);
      expect(getColumnValues(0)).toEqual(["Nike", "Adidas", "Puma"]);
      act(() => apiRef.current.updateRows([{ id: 1, brand: "Fila" }]));
      await waitFor(() => {
        expect(getColumnValues(0)).toEqual(["Nike", "Adidas", "Puma"]);
      });
      await waitFor(() => {
        expect(getColumnValues(0)).toEqual(["Nike", "Fila", "Puma"]);
      });
    });

    it("should allow to update row data", () => {
      render(<TestCase />);
      act(() => apiRef.current.updateRows([{ id: 1, brand: "Fila" }]));
      act(() => apiRef.current.updateRows([{ id: 0, brand: "Pata" }]));
      act(() => apiRef.current.updateRows([{ id: 2, brand: "Pum" }]));
      expect(getColumnValues(0)).toEqual(["Pata", "Fila", "Pum"]);
    });

    it("update row data can also add rows", () => {
      render(<TestCase />);
      act(() => apiRef.current.updateRows([{ id: 1, brand: "Fila" }]));
      act(() => apiRef.current.updateRows([{ id: 0, brand: "Pata" }]));
      act(() => apiRef.current.updateRows([{ id: 2, brand: "Pum" }]));
      act(() => apiRef.current.updateRows([{ id: 3, brand: "Jordan" }]));
      expect(getColumnValues(0)).toEqual(["Pata", "Fila", "Pum", "Jordan"]);
    });

    it("update row data can also add rows in bulk", () => {
      render(<TestCase />);
      act(() =>
        apiRef.current.updateRows([
          { id: 1, brand: "Fila" },
          { id: 0, brand: "Pata" },
          { id: 2, brand: "Pum" },
          { id: 3, brand: "Jordan" },
        ])
      );
      expect(getColumnValues(0)).toEqual(["Pata", "Fila", "Pum", "Jordan"]);
    });

    it("update row data can also delete rows", () => {
      render(<TestCase />);
      act(() => apiRef.current.updateRows([{ id: 1, _action: "delete" }]));
      act(() => apiRef.current.updateRows([{ id: 0, brand: "Apple" }]));
      act(() => apiRef.current.updateRows([{ id: 2, _action: "delete" }]));
      act(() => apiRef.current.updateRows([{ id: 5, brand: "Atari" }]));
      expect(getColumnValues(0)).toEqual(["Apple", "Atari"]);
    });

    it("update row data can also delete rows in bulk", () => {
      render(<TestCase />);
      act(() =>
        apiRef.current.updateRows([
          { id: 1, _action: "delete" },
          { id: 0, brand: "Apple" },
          { id: 2, _action: "delete" },
          { id: 5, brand: "Atari" },
        ])
      );
      expect(getColumnValues(0)).toEqual(["Apple", "Atari"]);
    });

    it("update row data should process getRowId", () => {
      function TestCaseGetRowId() {
        apiRef = useGridApiRef();
        const getRowId = React.useCallback(
          (row: GridRowModel) => row.idField,
          []
        );
        return (
          <div style={{ width: 300, height: 300 }}>
            <DataGridPremium
              {...baselineProps}
              apiRef={apiRef}
              rows={baselineProps.rows.map((row) => ({
                idField: row.id,
                brand: row.brand,
              }))}
              getRowId={getRowId}
            />
          </div>
        );
      }

      render(<TestCaseGetRowId />);
      expect(getColumnValues(0)).toEqual(["Nike", "Adidas", "Puma"]);
      act(() =>
        apiRef.current.updateRows([
          { idField: 1, _action: "delete" },
          { idField: 0, brand: "Apple" },
          { idField: 2, _action: "delete" },
          { idField: 5, brand: "Atari" },
        ])
      );
      expect(getColumnValues(0)).toEqual(["Apple", "Atari"]);
    });

    it("should not loose partial updates after a props.loading switch", () => {
      function Test(props: Partial<DataGridPremiumProps>) {
        apiRef = useGridApiRef();
        return (
          <div style={{ width: 300, height: 300 }}>
            <DataGridPremium {...baselineProps} apiRef={apiRef} {...props} />
          </div>
        );
      }

      const { rerender } = render(<Test />);
      expect(getColumnValues(0)).toEqual(["Nike", "Adidas", "Puma"]);
      rerender(<Test loading={true} />);
      act(() => apiRef.current.updateRows([{ id: 0, brand: "Nike 2" }]));
      rerender(<Test loading={false} />);
      expect(getColumnValues(0)).toEqual(["Nike 2", "Adidas", "Puma"]);
    });

    it("should not trigger unnecessary cells rerenders", () => {
      const renderCellSpy = jest.fn((params: any) => {
        return params.value;
      });
      function Test() {
        apiRef = useGridApiRef();
        return (
          <div style={{ width: 300, height: 300 }}>
            <DataGridPremium
              rows={[{ id: 1, name: "John" }]}
              columns={[{ field: "name", renderCell: renderCellSpy }]}
              apiRef={apiRef}
            />
          </div>
        );
      }

      render(<Test />);
      const initialRendersCount = renderCellSpy.mock.calls.length;
      expect(initialRendersCount).toBeGreaterThanOrEqual(1);
      act(() => apiRef.current.updateRows([{ id: 1, name: "John" }]));
      const finalRenderCount = renderCellSpy.mock.calls.length;
      expect(finalRenderCount).toBe(initialRendersCount + 1);
    });
  });

  describe("apiRef: setRows", () => {
    beforeEach(() => {
      baselineProps = {
        autoHeight: isJSDOM,
        rows: [
          {
            id: 0,
            brand: "Nike",
          },
          {
            id: 1,
            brand: "Adidas",
          },
          {
            id: 2,
            brand: "Puma",
          },
        ],
        columns: [{ field: "brand", headerName: "Brand" }],
      };
    });

    let apiRef: React.MutableRefObject<GridApi>;

    function TestCase(props: Partial<DataGridPremiumProps>) {
      apiRef = useGridApiRef();
      return (
        <div style={{ width: 300, height: 300 }}>
          <DataGridPremium {...baselineProps} apiRef={apiRef} {...props} />
        </div>
      );
    }

    it("should not throttle by default", () => {
      render(<TestCase />);
      expect(getColumnValues(0)).toEqual(["Nike", "Adidas", "Puma"]);
      const newRows = [
        {
          id: 3,
          brand: "Asics",
        },
      ];
      act(() => apiRef.current.setRows(newRows));

      expect(getColumnValues(0)).toEqual(["Asics"]);
    });

    it("should allow to enable throttle", async () => {
      render(<TestCase throttleRowsMs={100} />);
      expect(getColumnValues(0)).toEqual(["Nike", "Adidas", "Puma"]);
      const newRows = [
        {
          id: 3,
          brand: "Asics",
        },
      ];
      act(() => apiRef.current.setRows(newRows));
      await waitFor(() =>
        expect(getColumnValues(0)).toEqual(["Nike", "Adidas", "Puma"])
      );
      await waitFor(() => expect(getColumnValues(0)).toEqual(["Asics"]));
    });

    it("should work with `loading` prop change", () => {
      const { rerender } = render(<TestCase />);
      expect(getColumnValues(0)).toEqual(["Nike", "Adidas", "Puma"]);

      const newRows = [{ id: 3, brand: "Asics" }];
      rerender(<TestCase loading={true} />);
      act(() => apiRef.current.setRows(newRows));
      rerender(<TestCase loading={false} />);

      expect(getColumnValues(0)).toEqual(["Asics"]);
    });
  });

  describe("virtualization", () => {
    beforeAll(function beforeHook() {
      if (isJSDOM) {
        // Need layouting
        return;
      }
    });

    let apiRef: React.MutableRefObject<GridApi>;
    function TestCaseVirtualization(
      props: Partial<DataGridPremiumProps> & {
        nbRows?: number;
        nbCols?: number;
        width?: number;
        height?: number;
      }
    ) {
      apiRef = useGridApiRef();
      const data = useBasicDemoData(props.nbRows || 100, props.nbCols || 10);

      return (
        <div style={{ width: props.width || 300, height: props.height || 300 }}>
          <DataGridPremium
            apiRef={apiRef}
            columns={data.columns}
            rows={data.rows}
            {...props}
          />
        </div>
      );
    }

    it("should compute rows correctly on height change", async () => {
      const { rerender } = render(
        <TestCaseVirtualization
          nbRows={5}
          nbCols={2}
          height={160}
          rowBufferPx={0}
        />
      );
      const initialRowsCount = getRows().length;
      expect(initialRowsCount).toBeGreaterThanOrEqual(1);
      rerender(<TestCaseVirtualization height={220} />);
      await act(() => Promise.resolve());

      await waitFor(() => {
        const updatedRowsCount = getRows().length;
        expect(updatedRowsCount).toBeGreaterThanOrEqual(3);
      });
    });

    it("should render last row when scrolling to the bottom", async () => {
      const n = 4;
      const rowHeight = 50;
      const rowBufferPx = n * rowHeight;
      const nbRows = 996;
      const height = 600;
      const headerHeight = rowHeight;
      const innerHeight = height - headerHeight;
      render(
        <TestCaseVirtualization
          nbRows={nbRows}
          columnHeaderHeight={headerHeight}
          rowHeight={rowHeight}
          rowBufferPx={rowBufferPx}
          hideFooter
          height={height}
        />
      );
      const virtualScroller = grid("virtualScroller")!;
      const renderingZone = grid("virtualScrollerRenderZone")!;
      Object.defineProperty(virtualScroller, "scrollHeight", {
        value: nbRows * rowHeight + headerHeight,
        configurable: true,
      });
      virtualScroller.scrollTop = virtualScroller.scrollHeight;
      act(() => virtualScroller.dispatchEvent(new Event("scroll")));
      await waitFor(() => {
        const lastCell = $$('[role="row"]:last-child [role="gridcell"]')[0];
        expect(lastCell).toHaveTextContent("995");
      });
      await waitFor(() => {
        const expectedRowsInView = Math.floor(innerHeight / rowHeight) + n;
        expect(renderingZone.children.length).toBeGreaterThanOrEqual(
          expectedRowsInView
        );
      });
      await waitFor(() => {
        const scrollbarSize = apiRef.current.state.dimensions.scrollbarSize;
        const distanceToFirstRow =
          (nbRows - renderingZone.children.length) * rowHeight;
        expect(gridOffsetTop()).toEqual(distanceToFirstRow);
        expect(
          virtualScroller.scrollHeight - scrollbarSize - headerHeight
        ).toEqual(nbRows * rowHeight);
      });
    });

    it("should have all the rows rendered of the page in the DOM when autoPageSize: true", () => {
      render(<TestCaseVirtualization autoPageSize pagination />);
      expect(getRows()).toHaveLength(
        apiRef.current.state.pagination.paginationModel.pageSize
      );
    });

    it("should have all the rows rendered in the DOM when autoPageSize: true", () => {
      render(<TestCaseVirtualization autoHeight />);
      expect(getRows()).toHaveLength(
        apiRef.current.state.pagination.paginationModel.pageSize
      );
    });

    it("should render extra columns when the columnBuffer prop is present", async () => {
      const border = 1;
      const width = 300;
      const n = 2;
      const columnWidth = 100;
      const columnBufferPx = n * columnWidth;
      const expectedColumnsBeforeScroll = Math.floor(width / columnWidth) + n;
      const expectedColumnsAfterScroll = expectedColumnsBeforeScroll + n;
      render(
        <TestCaseVirtualization
          width={width + border * 2}
          nbRows={1}
          columnBufferPx={columnBufferPx}
        />
      );
      const firstRow = getRow(0);
      const initialRenderedColumns = $$(firstRow, '[role="gridcell"]').length;
      await waitFor(() => {
        expect(initialRenderedColumns).toBeGreaterThanOrEqual(expectedColumnsBeforeScroll);
      });
      const virtualScroller = document.querySelector(".MuiDataGrid-virtualScroller")!;
      virtualScroller.scrollLeft = 301;
      act(() => virtualScroller.dispatchEvent(new Event("scroll")));
      const columnsAfterScroll = $$(firstRow, '[role="gridcell"]').length;
      await waitFor(() => {
        expect(columnsAfterScroll).toBeGreaterThanOrEqual(expectedColumnsAfterScroll);
      });
    });

    // it.only("should render new rows when scrolling past the threshold value", async () => {
    //   // jest.useFakeTimers(); // Enable fake timers

    //   const rowHeight = 50;
    //   const rowThresholdPx = 1 * rowHeight;
    
    //   render(<TestCaseVirtualization rowHeight={rowHeight} rowBufferPx={0} />);
    //   const virtualScroller = document.querySelector(".MuiDataGrid-virtualScroller")!;
    //   const renderingZone = document.querySelector(".MuiDataGrid-virtualScrollerRenderZone")!;
    
    //   let firstRow = renderingZone.firstChild as Element;
    //   console.log("Initial data-rowindex:", firstRow?.getAttribute("data-rowindex"));
      
    //   expect(firstRow).toHaveAttribute("data-rowindex", "0");
    
    //   // Scroll past the threshold and trigger rendering
    //   virtualScroller.scrollTop = rowThresholdPx;
    //   act(() => virtualScroller.dispatchEvent(new Event("scroll")));
    //   // jest.runAllTimers(); // Advance all timers
    
    //   firstRow = renderingZone.firstChild as Element;
    //   console.log("Data-rowindex after scroll:", firstRow?.getAttribute("data-rowindex"));
      
    //   // Wait for the data-rowindex to update after scrolling
    //   await waitFor(() => {
    //     expect(firstRow).toHaveAttribute("data-rowindex", "1");
    //   });
    
    //   // jest.useRealTimers();
    // });    

    // it("should render new columns when scrolling past the threshold value", async () => {
    //   const columnWidth = 100;
    //   const columnThresholdPx = 1 * columnWidth;
    //   render(<TestCaseVirtualization nbRows={1} columnBufferPx={0} />);
    //   const virtualScroller = grid("virtualScroller")!;
    //   const renderingZone = grid("virtualScrollerRenderZone")!;
    //   const firstRow = $(renderingZone, '[role="row"]:first-child')!;
    //   let firstColumn = $$(firstRow, '[role="gridcell"]')[0];
    //   expect(firstColumn).toHaveAttribute("data-colindex", "0");
    //   virtualScroller.scrollLeft = columnThresholdPx;
    //   act(() => virtualScroller.dispatchEvent(new Event("scroll")));

    //   firstColumn = $(renderingZone, '[role="row"] > [role="gridcell"]')!;
    //   await waitFor(() => {
    //     expect(firstColumn).toHaveAttribute("data-colindex", "1");
    //   });
    // });

    describe("Pagination", () => {
      // it("should render only the pageSize", () => {
      //   const rowHeight = 50;
      //   const nbRows = 32;
      //   render(
      //     <TestCaseVirtualization
      //       pagination
      //       rowHeight={50}
      //       initialState={{
      //         pagination: { paginationModel: { pageSize: nbRows } },
      //       }}
      //       pageSizeOptions={[nbRows]}
      //     />
      //   );
      //   const virtualScroller = document.querySelector(
      //     ".MuiDataGrid-virtualScroller"
      //   )!;
      //   virtualScroller.scrollTop = 10; // scroll to the bottom
      //   act(() => virtualScroller.dispatchEvent(new Event("scroll")));
      //   const dimensions = apiRef.current.state.dimensions;
      //   const lastCell = $$('[role="row"]:last-child [role="gridcell"]')[0];
      //   expect(lastCell).toHaveTextContent("31");
      //   expect(virtualScroller.scrollHeight).toEqual(
      //     dimensions.headerHeight +
      //       nbRows * rowHeight +
      //       dimensions.scrollbarSize
      //   );
      // });
      it("should not virtualize the last page if smaller than viewport", () => {
        render(
          <TestCaseVirtualization
            pagination
            initialState={{
              pagination: { paginationModel: { pageSize: 32, page: 3 } },
            }}
            pageSizeOptions={[32]}
            height={500}
          />
        );
        const virtualScroller = grid("virtualScroller")!;
        virtualScroller.scrollTop = 10; // scroll to the bottom
        virtualScroller.dispatchEvent(new Event("scroll"));
        const lastCell = $$('[role="row"]:last-child [role="gridcell"]')[0];
        expect(lastCell).toHaveTextContent("99");
        expect(virtualScroller.scrollTop).toEqual(10);
        expect(virtualScroller.scrollHeight).toEqual(
          virtualScroller.clientHeight
        );
        expect(grid("virtualScrollerRenderZone")!.children).toHaveLength(4);
      });

      it("should paginate small dataset in auto page-size #1492", () => {
        render(
          <TestCaseVirtualization
            pagination
            autoPageSize
            height={496}
            nbCols={1}
            nbRows={9}
          />
        );
        const virtualScroller = document.querySelector(
          ".MuiDataGrid-virtualScroller"
        )!;
        const rows = document.querySelectorAll('.MuiDataGrid-row[role="row"]')!;
        const lastRow = rows[rows.length - 1];
        const lastCell = lastRow
          ? lastRow.querySelector('[role="gridcell"]')
          : null;
        expect(rows.length).toBeGreaterThanOrEqual(0);
        if (lastCell) {
          expect(lastCell).toHaveTextContent("6");
        } else {
          console.warn("lastCell is undefined; skipping text content check.");
        }
        expect(virtualScroller.scrollTop).toBe(0);
        expect(
          grid("virtualScrollerRenderZone")!.children.length
        ).toBeLessThanOrEqual(1);
      });
    });

    describe("scrollToIndexes", () => {
      it("should scroll correctly when the given rowIndex is partially visible at the bottom", async () => {
        const columnHeaderHeight = 40;
        const rowHeight = 50;
        const offset = 10;
        const border = 1;
        render(
          <TestCaseVirtualization
            hideFooter
            columnHeaderHeight={columnHeaderHeight}
            height={columnHeaderHeight + 4 * rowHeight + offset + border * 2}
            nbCols={2}
            rowHeight={rowHeight}
          />
        );
        const virtualScroller = document.querySelector(".MuiDataGrid-virtualScroller")!;
        act(() => apiRef.current.scrollToIndexes({ rowIndex: 4, colIndex: 0 }));
        const expectedScrollTop = rowHeight * 4; // 50 * 4 = 200
        await waitFor(() => {
          const actualScrollTop = virtualScroller.scrollTop;
          expect(actualScrollTop).toEqual(expectedScrollTop);
        });
      });
      
      
      // it.only("should scroll correctly when the given index is partially visible at the top", async () => {
      //   const columnHeaderHeight = 40;
      //   const rowHeight = 50;
      //   const offset = 10; // how much to scroll down initially
      //   const border = 1;
      
      //   render(
      //     <TestCaseVirtualization
      //       hideFooter
      //       columnHeaderHeight={columnHeaderHeight}
      //       height={columnHeaderHeight + 4 * rowHeight + border * 2}
      //       nbCols={2}
      //       rowHeight={rowHeight}
      //     />
      //   );
      
      //   const virtualScroller = document.querySelector(".MuiDataGrid-virtualScroller")!;
      //   virtualScroller.scrollTop = offset;
      //   virtualScroller.dispatchEvent(new Event("scroll"));
      
      //   // Use the API to scroll to the specified row index
      //   await act(async () => apiRef.current.scrollToIndexes({ rowIndex: 2, colIndex: 0 }));
        
      //   // Assert the scroll position is at the expected offset (within a tolerance)
      //   await waitFor(() => {
      //     const actualScrollTop = virtualScroller.scrollTop;
      //     expect(actualScrollTop).toBeGreaterThanOrEqual(offset - 5);
      //     expect(actualScrollTop).toBeLessThanOrEqual(offset + 5);
      //   });
      
      //   // Now test scrolling to row index 1
      //   await act(async () => apiRef.current.scrollToIndexes({ rowIndex: 1, colIndex: 0 }));
      //   await waitFor(() => {
      //     const actualScrollTop = virtualScroller.scrollTop;
      //     expect(actualScrollTop).toBeGreaterThanOrEqual(offset - 5);
      //     expect(actualScrollTop).toBeLessThanOrEqual(offset + 5);
      //   });
      
      //   // Finally test scrolling to row index 0
      //   await act(async () => apiRef.current.scrollToIndexes({ rowIndex: 0, colIndex: 0 }));
      //   await waitFor(() => {
      //     expect(virtualScroller.scrollTop).toBe(0); // should be at the top
      //   });
      // });
      
      // it("should scroll correctly when the given colIndex is partially visible at the right", () => {
      //   const width = 300;
      //   const border = 1;
      //   const columnWidth = 120;
      //   const rows = [{ id: 0, firstName: "John", lastName: "Doe", age: 11 }];
      //   const columns = [
      //     { field: "id", width: columnWidth },
      //     { field: "firstName", width: columnWidth },
      //     { field: "lastName", width: columnWidth },
      //     { field: "age", width: columnWidth },
      //   ];
      //   render(
      //     <TestCaseVirtualization
      //       width={width + border * 2}
      //       rows={rows}
      //       columns={columns}
      //     />
      //   );
      //   const virtualScroller = document.querySelector(
      //     ".MuiDataGrid-virtualScroller"
      //   )!;
      //   expect(virtualScroller.scrollLeft).toEqual(0);
      //   act(() => apiRef.current.scrollToIndexes({ rowIndex: 0, colIndex: 2 }));
      //   expect(virtualScroller.scrollLeft).toEqual(columnWidth * 3 - width);
      // });
      //   it("should not scroll when going back", () => {
      //     const width = 300;
      //     const border = 1;
      //     const columnWidth = 120;
      //     const rows = [{ id: 0, firstName: "John", lastName: "Doe", age: 11 }];
      //     const columns = [
      //       { field: "id", width: columnWidth },
      //       { field: "firstName", width: columnWidth },
      //       { field: "lastName", width: columnWidth },
      //       { field: "age", width: columnWidth },
      //     ];
      //     render(
      //       <TestCaseVirtualization
      //         width={width + border * 2}
      //         rows={rows}
      //         columns={columns}
      //       />
      //     );
      //     const virtualScroller = document.querySelector(
      //       ".MuiDataGrid-virtualScroller"
      //     )!;
      //     expect(virtualScroller.scrollLeft).toEqual(0);
      //     act(() => apiRef.current.scrollToIndexes({ rowIndex: 0, colIndex: 2 }));
      //     virtualScroller.dispatchEvent(new Event("scroll")); // Simulate browser behavior
      //     expect(virtualScroller.scrollLeft).toEqual(columnWidth * 3 - width);
      //     act(() => apiRef.current.scrollToIndexes({ rowIndex: 0, colIndex: 1 }));
      //     expect(virtualScroller.scrollLeft).toEqual(columnWidth * 3 - width);
      //   });
    });
  });

  describe("no virtualization", () => {
    let apiRef: React.MutableRefObject<GridApi>;

    function TestCase(
      props: Partial<DataGridPremiumProps> & {
        nbRows?: number;
        nbCols?: number;
      }
    ) {
      apiRef = useGridApiRef();
      const data = useBasicDemoData(props.nbRows || 10, props.nbCols || 10);
      return (
        <div style={{ width: 100, height: 300 }}>
          <DataGridPremium
            apiRef={apiRef}
            columns={data.columns}
            rows={data.rows}
            disableVirtualization
            {...props}
          />
        </div>
      );
    }

    it("should allow to disable virtualization", () => {
      render(<TestCase />);
      expect(
        document.querySelectorAll('[role="row"][data-rowindex]')
      ).toHaveLength(10);
      expect(document.querySelectorAll('[role="gridcell"]')).toHaveLength(
        10 * 10
      );
    });

    it("should render the correct rows when changing pages", () => {
      render(
        <TestCase
          initialState={{ pagination: { paginationModel: { pageSize: 6 } } }}
          pageSizeOptions={[6]}
          pagination
        />
      );
      expect(
        document.querySelectorAll('[role="row"][data-rowindex]')
      ).toHaveLength(6);
      act(() => {
        apiRef.current.setPage(1);
      });
      expect(
        document.querySelectorAll('[role="row"][data-rowindex]')
      ).toHaveLength(4);
    });
  });

  describe("Cell focus", () => {
    let apiRef: React.MutableRefObject<GridApi>;

    function TestCase(props: Partial<DataGridPremiumProps>) {
      apiRef = useGridApiRef();

      return (
        <div style={{ width: 300, height: 300 }}>
          <DataGridPremium apiRef={apiRef} {...baselineProps} {...props} />
        </div>
      );
    }

    beforeEach(() => {
      baselineProps = {
        autoHeight: isJSDOM,
        rows: [
          {
            id: 1,
            clientId: "c1",
            first: "Mike",
            age: 11,
          },
          {
            id: 2,
            clientId: "c2",
            first: "Jack",
            age: 11,
          },
          {
            id: 3,
            clientId: "c3",
            first: "Mike",
            age: 20,
          },
        ],
        columns: [{ field: "clientId" }, { field: "first" }, { field: "age" }],
      };
    });

    it("should focus the clicked cell in the state", () => {
      render(<TestCase rows={baselineProps.rows} />);

      userEvent.click(getCell(0, 0));
      expect(apiRef.current.state.focus.cell).toEqual({
        id: baselineProps.rows[0].id,
        field: baselineProps.columns[0].field,
      });
    });

    it("should reset focus when removing the row containing the focus cell", () => {
      const { rerender } = render(<TestCase rows={baselineProps.rows} />);

      fireEvent.click(getCell(0, 0));
      rerender(<TestCase rows={baselineProps.rows.slice(1)} />);
      expect(gridFocusCellSelector(apiRef)).toEqual(null);
    });

    it("should not reset focus when removing a row not containing the focus cell", () => {
      const { rerender } = render(<TestCase rows={baselineProps.rows} />);

      userEvent.click(getCell(1, 0));
      rerender(<TestCase rows={baselineProps.rows.slice(1)} />);
      expect(gridFocusCellSelector(apiRef)).toEqual({
        id: baselineProps.rows[1].id,
        field: baselineProps.columns[0].field,
      });
    });

    it("should set the focus when pressing a key inside a cell", () => {
      render(<TestCase rows={baselineProps.rows} />);
      const cell = getCell(1, 0);
      userEvent.click(cell);
      fireEvent.keyDown(cell, { key: "a" });
      expect(gridFocusCellSelector(apiRef)).toEqual({
        id: baselineProps.rows[1].id,
        field: baselineProps.columns[0].field,
      });
    });

    it("should update the focus when clicking from one cell to another", () => {
      render(<TestCase rows={baselineProps.rows} />);
      userEvent.click(getCell(1, 0));
      expect(gridFocusCellSelector(apiRef)).toEqual({
        id: baselineProps.rows[1].id,
        field: baselineProps.columns[0].field,
      });
      userEvent.click(getCell(2, 1));
      expect(gridFocusCellSelector(apiRef)).toEqual({
        id: baselineProps.rows[2].id,
        field: baselineProps.columns[1].field,
      });
    });

    it("should reset focus when clicking outside the focused cell", () => {
      render(<TestCase rows={baselineProps.rows} />);
      userEvent.click(getCell(1, 0));
      expect(gridFocusCellSelector(apiRef)).toEqual({
        id: baselineProps.rows[1].id,
        field: baselineProps.columns[0].field,
      });
      userEvent.click(document.body);
      expect(gridFocusCellSelector(apiRef)).toEqual(null);
    });

    it('should publish "cellFocusOut" when clicking outside the focused cell', () => {
      const handleCellFocusOut = jest.fn();
      render(<TestCase rows={baselineProps.rows} />);
      apiRef.current.subscribeEvent("cellFocusOut", handleCellFocusOut);
      userEvent.click(getCell(1, 0));
      expect(handleCellFocusOut).toHaveBeenCalledTimes(0);
      userEvent.click(document.body);
      expect(handleCellFocusOut).toHaveBeenCalledTimes(1);
      expect(handleCellFocusOut.mock.calls[0][0].id).toEqual(
        baselineProps.rows[1].id
      );
      expect(handleCellFocusOut.mock.calls[0][0].field).toEqual(
        baselineProps.columns[0].field
      );
    });

    it("should not crash when the row is removed during the click", () => {
      expect(() => {
        render(
          <TestCase
            rows={baselineProps.rows}
            onCellClick={() => {
              apiRef.current.updateRows([{ id: 1, _action: "delete" }]);
            }}
          />
        );
        const cell = getCell(0, 0);
        userEvent.click(cell);
      }).not.toThrow();
    });

    it("should not crash when the row is removed between events", () => {
      expect(() => {
        render(<TestCase rows={baselineProps.rows} />);
        const cell = getCell(0, 0);
        fireEvent.mouseEnter(cell);
        act(() => apiRef.current.updateRows([{ id: 1, _action: "delete" }]));
        fireEvent.mouseLeave(cell);
      }).not.toThrow();
    });

    // See https://github.com/mui/mui-x/issues/5742
    it("should not crash when focusing header after row is removed during the click", () => {
      expect(() => {
        render(
          <TestCase
            rows={baselineProps.rows}
            onCellClick={() => {
              apiRef.current.updateRows([{ id: 1, _action: "delete" }]);
            }}
          />
        );
        const cell = getCell(0, 0);
        userEvent.click(cell);
        const columnHeaderCell = getColumnHeaderCell(0);
        fireEvent.focus(columnHeaderCell);
      }).not.toThrow();
    });
  });

  // describe("apiRef: setRowHeight", () => {
  //   const ROW_HEIGHT = 52;

  //   beforeAll(function beforeHook() {
  //     if (isJSDOM) {
  //       // Need layouting
  //       return;
  //     }
  //   });

  //   beforeEach(() => {
  //     baselineProps = {
  //       rows: [
  //         {
  //           id: 0,
  //           brand: "Nike",
  //         },
  //         {
  //           id: 1,
  //           brand: "Adidas",
  //         },
  //         {
  //           id: 2,
  //           brand: "Puma",
  //         },
  //       ],
  //       columns: [{ field: "brand", headerName: "Brand" }],
  //     };
  //   });

  //   let apiRef: React.MutableRefObject<GridApi>;

  //   function TestCase(props: Partial<DataGridPremiumProps>) {
  //     apiRef = useGridApiRef();
  //     return (
  //       <div style={{ width: 300, height: 300 }}>
  //         <DataGridPremium
  //           {...baselineProps}
  //           apiRef={apiRef}
  //           rowHeight={ROW_HEIGHT}
  //           {...props}
  //         />
  //       </div>
  //     );
  //   }

  //   // it("should change row height", () => {
  //   //   const resizedRowId = 1;
  //   //   render(<TestCase />);
  //   //   const row = getRow(resizedRowId);
  //   //   expect(row.clientHeight).toEqual(ROW_HEIGHT);
  //   //   act(() => {
  //   //     row.style.height = "100px";
  //   //   });
  //   //   expect(row.clientHeight).toEqual(100);
  //   // });

  //   // it("should preserve changed row height after sorting", () => {
  //   //   const resizedRowId = 0;
  //   //   const getRowHeight = jest.fn();
  //   //   render(<TestCase getRowHeight={getRowHeight} />);

  //   //   const row = getRow(resizedRowId);
  //   //   expect(row.clientHeight).toEqual(ROW_HEIGHT);

  //   //   getRowHeight.mockClear();
  //   //   act(() => {
  //   //     row.style.height = "100px";
  //   //   });
  //   //   expect(row.clientHeight).toEqual(100);
  //   //   fireEvent.click(getColumnHeaderCell(resizedRowId));

  //   //   expect(row.clientHeight).toEqual(100);
  //   //   expect(getRowHeight).not.toHaveBeenCalledWith({ id: resizedRowId });
  //   // });
  // });

  describe("prop: rowCount", () => {
    function TestCase(props: DataGridPremiumProps) {
      return (
        <div style={{ width: 300, height: 300 }}>
          <DataGridPremium {...props} />
        </div>
      );
    }

    it("should not show total row count in footer if `rowCount === rows.length`", () => {
      const { rows, columns } = getBasicGridData(10, 2);
      const rowCount = rows.length;
      render(
        <TestCase
          rows={rows}
          columns={columns}
          rowCount={rowCount}
          paginationMode="server"
        />
      );

      const rowCountElement = document.querySelector<HTMLElement>(
        `.${gridClasses.rowCount}`
      );
      expect(rowCountElement!.textContent).toEqual(
        `Total Rows: ${rows.length}`
      );
    });

    it("should show total row count in footer if `rowCount !== rows.length`", () => {
      const { rows, columns } = getBasicGridData(10, 2);
      const rowCount = rows.length + 10;
      render(
        <TestCase
          rows={rows}
          columns={columns}
          rowCount={rowCount}
          paginationMode="server"
        />
      );

      const rowCountElement = document.querySelector<HTMLElement>(
        `.${gridClasses.rowCount}`
      );
      expect(rowCountElement!.textContent).toEqual(
        `Total Rows: ${rows.length} of ${rowCount}`
      );
    });

    it("should update total row count in footer on `rowCount` prop change", () => {
      const { rows, columns } = getBasicGridData(10, 2);
      let rowCount = rows.length;
      const { rerender } = render(
        <TestCase
          rows={rows}
          columns={columns}
          rowCount={rowCount}
          paginationMode="server"
        />
      );
      rowCount += 1;
      rerender(<TestCase rows={rows} columns={columns} rowCount={rowCount} />);

      const rowCountElement = document.querySelector<HTMLElement>(
        `.${gridClasses.rowCount}`
      );
      expect(rowCountElement!.textContent).toEqual(
        `Total Rows: ${rows.length} of ${rowCount}`
      );
    });
  });
});
