import * as React from "react";
// import { createRenderer, fireEvent, screen, act } from '@mui/internal-test-utils';
import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from "@testing-library/react";
// import { expect } from 'chai';
import {
  GridColumnHeaderParams,
  GridRowParams,
  GridCellParams,
  GridRowsProp,
  GridColDef,
  gridClasses,
  GridActionsCellItem,
  GridEventListener,
} from "@mui/x-data-grid";
import { GridApi } from "../../typeOverloads/reexports";
import { useGridApiRef } from "../../hooks/utils/useGridApiRef";
import { DataGridPremium } from "../../DataGridPremium/DataGridPremium";
import { DataGridPremiumProps } from "../../models/dataGridPremiumProps";
import { getCell, getColumnHeaderCell } from "../helperFn";
// import { spy } from 'sinon';

const isJSDOM = /jsdom/.test(window.navigator.userAgent);

describe("<DataGridPro /> - Events params", () => {
  // const { render, clock } = createRenderer();

  const baselineProps: { rows: GridRowsProp; columns: GridColDef[] } = {
    rows: [
      {
        id: 1,
        first: "Mike",
        age: 11,
      },
      {
        id: 2,
        first: "Jack",
        age: 11,
      },
      {
        id: 3,
        first: "Mike",
        age: 20,
      },
    ],
    columns: [
      { field: "id" },
      { field: "first", editable: true },
      { field: "age" },
      {
        field: "firstAge",
        valueGetter: (value, row) => `${row.first}_${row.age}`,
        valueFormatter: (value) => `${value} yrs`,
      },
    ],
  };

  let apiRef: React.MutableRefObject<GridApi>;

  function TestEvents(props: Partial<DataGridPremiumProps>) {
    apiRef = useGridApiRef();
    return (
      <div style={{ width: 300, height: 300 }}>
        <DataGridPremium
          apiRef={apiRef}
          {...baselineProps}
          {...props}
          disableVirtualization
        />
      </div>
    );
  }

  describe("columnHeaderParams", () => {
    it("should include the correct params", () => {
      let eventArgs: {
        params: GridColumnHeaderParams;
        event: React.MouseEvent;
      } | null = null;
      const handleClick: GridEventListener<"columnHeaderClick"> = (
        params,
        event
      ) => {
        eventArgs = { params, event };
      };
      render(<TestEvents onColumnHeaderClick={handleClick} />);

      const ageColumnElement = getColumnHeaderCell(2);
      fireEvent.click(ageColumnElement);

      expect(eventArgs!.params).toMatchObject({
        colDef: apiRef.current.getColumn("age"),
        field: "age",
      });
    });
  });

  describe("RowsParams", () => {
    it("should include the correct params", () => {
      let eventArgs: { params: GridRowParams; event: React.MouseEvent } | null =
        null;

      const handleClick: GridEventListener<"rowClick"> = (params, event) => {
        eventArgs = { params, event };
      };
      render(<TestEvents onRowClick={handleClick} />);

      const row1 = getCell(1, 0);
      fireEvent.click(row1);

      expect(eventArgs!.params).toMatchObject({
        id: 2,
        row: baselineProps.rows[1],
        columns: apiRef.current.getAllColumns(),
      });
    });
  });

  describe("CellsParams", () => {
    let eventArgs: { params: GridCellParams; event: React.MouseEvent } | null =
      null;
    let cell11;

    it("should include the correct params", () => {
      const handleClick: GridEventListener<"cellClick"> = (params, event) => {
        eventArgs = { params, event };
      };
      render(<TestEvents onCellClick={handleClick} />);
      cell11 = getCell(1, 1);
      fireEvent.click(cell11);

      expect(eventArgs!.params).toMatchObject({
        id: 2,
        value: "Jack",
        formattedValue: "Jack",
        isEditable: true,
        row: baselineProps.rows[1],
        colDef: apiRef.current.getColumn("first"),
        hasFocus: false,
        tabIndex: -1,
      });
    });

    it("should include the correct params when grid is sorted", () => {
      const handleClick: GridEventListener<"cellClick"> = (params, event) => {
        eventArgs = { params, event };
      };
      render(<TestEvents onCellClick={handleClick} />);
      const header = screen
        .getByRole("columnheader", { name: "first" })
        .querySelector(".MuiDataGrid-columnHeaderTitleContainer")!;
      fireEvent.click(header);

      const cell01 = getCell(0, 1);
      fireEvent.click(cell01);

      expect(eventArgs!.params).toMatchObject({
        id: 2,
        value: "Jack",
        formattedValue: "Jack",
        isEditable: true,
        row: baselineProps.rows[1],
        colDef: apiRef.current.getColumn("first"),
        hasFocus: false,
        tabIndex: -1,
      });
    });

    it("should consider value getter", () => {
      const handleClick: GridEventListener<"cellClick"> = (params, event) => {
        eventArgs = { params, event };
      };
      render(<TestEvents onCellClick={handleClick} />);
      const cellFirstAge = getCell(1, 3);
      fireEvent.click(cellFirstAge);

      expect(eventArgs!.params.value).toEqual("Jack_11");
    });

    it("should consider value formatter", () => {
      const handleClick: GridEventListener<"cellClick"> = (params, event) => {
        eventArgs = { params, event };
      };
      render(<TestEvents onCellClick={handleClick} />);
      const cellFirstAge = getCell(1, 3);
      fireEvent.click(cellFirstAge);

      expect(eventArgs!.params.formattedValue).toEqual("Jack_11 yrs");
    });
  });

  describe("onCellClick", () => {
    jest.useFakeTimers();

    let eventStack: string[] = [];
    const push = (name: string) => () => {
      eventStack.push(name);
    };

    beforeEach(() => {
      eventStack = [];
    });

    it("should bubble to the row", () => {
      render(
        <TestEvents
          onCellClick={push("cellClick")}
          onRowClick={push("rowClick")}
        />
      );

      const cell11 = getCell(1, 1);
      fireEvent.click(cell11);
      expect(eventStack).toEqual(["cellClick", "rowClick"]);
    });

    it("should allow to stop propagation", () => {
      const stopClick = (params: GridCellParams, event: React.MouseEvent) => {
        event.stopPropagation();
      };
      render(
        <TestEvents onCellClick={stopClick} onRowClick={push("rowClick")} />
      );

      const cell11 = getCell(1, 1);
      fireEvent.click(cell11);
      expect(eventStack).toEqual([]);
    });

    it("should allow to prevent the default behavior", () => {
      const handleCellDoubleClick = jest.fn(
        (params: GridCellParams, event: React.MouseEvent) => {
          (event as any).defaultMuiPrevented = true;
        }
      );
      render(<TestEvents onCellDoubleClick={handleCellDoubleClick} />);
      const cell = getCell(1, 1);
      fireEvent.doubleClick(cell);
      expect(handleCellDoubleClick).toHaveBeenCalledTimes(1);
      expect(cell).not.toHaveClass(gridClasses["row--editing"]);
    });

    it("should allow to prevent the default behavior while allowing the event to propagate", async () => {
      const handleCellEditStart = jest.fn(
        (params: GridCellParams, event: React.SyntheticEvent) => {
          event.preventDefault();
        }
      );
      const handleCellEditStop = jest.fn();
      render(
        <TestEvents
          onCellEditStart={handleCellEditStart}
          onCellEditStop={handleCellEditStop}
        />
      );
      const cell = getCell(1, 1);
      fireEvent.doubleClick(cell);
      await waitFor(() => {
        expect(handleCellEditStart).toHaveBeenCalledTimes(1);
        expect(cell).toHaveClass(gridClasses["cell--editing"]);
      });

      expect(handleCellEditStop).not.toHaveBeenCalled();
    });

    it("should select a row by default", () => {
      const handleRowSelectionModelChange = jest.fn();
      render(
        <TestEvents onRowSelectionModelChange={handleRowSelectionModelChange} />
      );

      const cell11 = getCell(1, 1);
      fireEvent.click(cell11);
      expect(handleRowSelectionModelChange.mock.calls.length).toEqual(1);
      expect(
        handleRowSelectionModelChange.mock.calls[
          handleRowSelectionModelChange.mock.calls.length - 1
        ][0]
      ).toEqual([2]);
    });

    it("should not select a row if props.disableRowSelectionOnClick", () => {
      const handleRowSelectionModelChange = jest.fn();
      render(
        <TestEvents
          onRowSelectionModelChange={handleRowSelectionModelChange}
          disableRowSelectionOnClick
        />
      );
      const cell11 = getCell(1, 1);
      fireEvent.click(cell11);
      expect(handleRowSelectionModelChange.mock.calls.length).toEqual(0);
    });
  });

  describe("onRowClick", () => {
    let eventStack: string[] = [];
    const push = (name: string) => () => {
      eventStack.push(name);
    };

    beforeEach(() => {
      eventStack = [];
    });

    it("should be called when clicking a cell", () => {
      render(<TestEvents onRowClick={push("rowClick")} />);
      const cell11 = getCell(1, 1);
      fireEvent.click(cell11);
      expect(eventStack).toEqual(["rowClick"]);
    });

    it("should not be called when clicking the checkbox added by checkboxSelection", () => {
      render(<TestEvents onRowClick={push("rowClick")} checkboxSelection />);
      const cell11 = getCell(1, 0).querySelector("input")!;
      fireEvent.click(cell11);
      expect(eventStack).toEqual([]);
    });

    it("should not be called when clicking in an action", () => {
      render(
        <TestEvents
          onRowClick={push("rowClick")}
          rows={[{ id: 0 }]}
          columns={[
            {
              field: "actions",
              type: "actions",
              getActions: () => [
                <GridActionsCellItem icon={<span />} label="print" />,
              ],
            },
          ]}
        />
      );
      fireEvent.click(screen.getByRole("menuitem", { name: "print" }));
      expect(eventStack).toEqual([]);
    });

    it("should not be called when opening the detail panel of a row", () => {
      render(
        <TestEvents
          onRowClick={push("rowClick")}
          getDetailPanelContent={() => <div />}
        />
      );
      fireEvent.click(getCell(0, 0));
      expect(eventStack).toEqual([]);
    });

    it("should not be called when expanding a group of rows", () => {
      render(
        <TestEvents
          onRowClick={push("rowClick")}
          rows={[
            { id: 0, path: ["Group 1"] },
            { id: 1, path: ["Group 1", "Group 2"] },
          ]}
          getTreeDataPath={(row) => row.path}
          treeData
        />
      );
      fireEvent.click(screen.getByRole("button", { name: "see children" }));
      expect(eventStack).toEqual([]);
    });

    it("should not be called when clicking inside a cell being edited", () => {
      render(<TestEvents onRowClick={push("rowClick")} />);
      const cell = getCell(0, 1);
      fireEvent.doubleClick(cell);
      fireEvent.click(cell.querySelector("input")!);
      expect(eventStack).toEqual([]);
    });
  });

  it("publishing GRID_ROWS_SCROLL should call onFetchRows callback when rows lazy loading is enabled", function test() {
    if (isJSDOM) {
      return; // Needs layout
    }
    const handleFetchRows = jest.fn();
    render(
      <TestEvents
        onFetchRows={handleFetchRows}
        sortingMode="server"
        filterMode="server"
        rowsLoadingMode="server"
        paginationMode="server"
        rowCount={50}
      />
    );
    act(() =>
      apiRef.current.publishEvent("scrollPositionChange", {
        left: 0,
        top: 3 * 52,
      })
    );
    expect(handleFetchRows.mock.calls.length).toEqual(1);
  });

  it('should publish "unmount" event when unmounting the Grid', () => {
    const onUnmount = jest.fn();

    const { unmount } = render(<TestEvents />);

    act(() => apiRef.current.subscribeEvent("unmount", onUnmount));
    unmount();
    expect(onUnmount).toHaveBeenCalledTimes(1);
  });
});
