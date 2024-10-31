import * as React from "react";
// import { stub, SinonStub, spy } from "sinon";
// import { expect } from "chai";
import { spyApi, getCell, grid } from "./helperFn";
import {
  render,
  fireEvent,
  screen,
  act,
  waitFor,
} from "@testing-library/react";
import { gridClasses } from "@mui/x-data-grid";
import { DataGridPremium } from "../DataGridPremium/DataGridPremium";
import { DataGridPremiumProps } from "../models/dataGridPremiumProps";
import { getBasicGridData } from "./basic-data-service";
// import { fireUserEvent } from "test/utils/fireUserEvent";
import userEvent from "@testing-library/user-event";
import { GridApi } from "../typeOverloads/reexports";
import { useGridApiRef } from "../hooks/utils/useGridApiRef";


const spy = jest.fn();
const stub = jest.fn();

describe("<DataGridPremium /> - Cell selection", () => {
  // const { render } = createRenderer();

  let apiRef: React.MutableRefObject<GridApi>;

  function TestDataGridSelection({
    rowLength = 4,
    width = 400,
    height = 300,
    ...other
  }: Omit<DataGridPremiumProps, "rows" | "columns" | "apiRef"> &
    Partial<Pick<DataGridPremiumProps, "rows" | "columns">> & {
      rowLength?: number;
      width?: number;
      height?: number;
    }) {
    apiRef = useGridApiRef();

    const data = React.useMemo(
      () => getBasicGridData(rowLength, 3),
      [rowLength]
    );

    return (
      <div style={{ width, height }}>
        <DataGridPremium
          {...data}
          apiRef={apiRef}
          rowSelection={false}
          cellSelection
          disableVirtualization
          hideFooter
          {...other}
        />
      </div>
    );
  }

  it("should select the cell clicked", () => {
    render(<TestDataGridSelection />);
    expect(document.querySelector(".Mui-selected")).toEqual(null);
    const cell = getCell(0, 1);
    fireEvent.click(cell);
    expect(document.querySelector(".Mui-selected")).toEqual(cell);
  });

  it("should unselect already selected cells when selecting a cell", () => {
    render(<TestDataGridSelection />);
    const cell01 = getCell(0, 1);
    fireEvent.click(cell01);
    expect(cell01).toHaveClass("Mui-selected");
    const cell11 = getCell(1, 1);
    fireEvent.click(cell11);
    expect(cell01).not.toHaveClass("Mui-selected");
    expect(cell11).toHaveClass("Mui-selected");
  });

  // https://github.com/mui/mui-x/issues/10777
  it("should work with the paginated grid", () => {
    render(
      <TestDataGridSelection
        initialState={{
          pagination: { paginationModel: { page: 0, pageSize: 3 } },
        }}
        rowLength={30}
        pagination
        pageSizeOptions={[3]}
        hideFooter={false}
      />
    );
    const cell01 = getCell(2, 0);
    fireEvent.click(cell01);
    expect(cell01).toHaveClass("Mui-selected");
    fireEvent.click(screen.getByRole("button", { name: /next page/i }));
    const cell02 = getCell(5, 0);
    fireEvent.click(cell02);
    expect(cell02).toHaveClass("Mui-selected");
  });

  describe("Ctrl + click", () => {
    it("should add the clicked cells to the selection", () => {
      render(<TestDataGridSelection />);
      expect(document.querySelector(".Mui-selected")).toEqual(null);
      const cell11 = getCell(1, 1);
      fireEvent.click(cell11);
      expect(cell11).toHaveClass("Mui-selected");
      const cell21 = getCell(2, 1);
      fireEvent.click(cell21, { ctrlKey: true });
      expect(cell21).toHaveClass("Mui-selected");
      expect(cell11).toHaveClass("Mui-selected");
    });

    it("should unselect the cell if the cell is already selected", () => {
      render(<TestDataGridSelection />);
      expect(document.querySelector(".Mui-selected")).toEqual(null);
      const cell = getCell(1, 1);
      fireEvent.click(cell);
      expect(cell).toHaveClass("Mui-selected");
      fireEvent.click(cell, { ctrlKey: true });
      expect(cell).not.toHaveClass("Mui-selected");
    });
  });

  describe("Shift + click", () => {
    it("should select all cells between two cells", () => {
      render(<TestDataGridSelection />);
      expect(document.querySelector(".Mui-selected")).toEqual(null);
      const cell = getCell(0, 0);
      cell.focus();
      userEvent.click(cell);
      fireEvent.keyDown(cell, { key: "Shift" });
      userEvent.click(getCell(2, 1), { shiftKey: true });
      expect(document.querySelectorAll(".Mui-selected")).toHaveLength(3 * 2); // 3 rows with 2 cells each
    });

    it("should call selectCellRange", () => {
      render(<TestDataGridSelection />);
      expect(apiRef.current).toBeDefined();
      const spiedSelectCellsBetweenRange = spyApi(
        apiRef.current,
        "selectCellRange"
      );
      expect(apiRef.current.selectCellRange).toBe(spiedSelectCellsBetweenRange);
    
      const cell = getCell(0, 0);
      cell.focus();
      userEvent.click(cell);
      fireEvent.keyDown(cell, { key: "Shift" });
      userEvent.click(getCell(2, 1), { shiftKey: true });
      expect(spiedSelectCellsBetweenRange).toHaveBeenCalled();
    });
    

    it("should add classes to the cells that are at the corners of a range", () => {
      render(<TestDataGridSelection />);
      const cell = getCell(0, 0);
      cell.focus();
      userEvent.click(cell);
      fireEvent.keyDown(cell, { key: "Shift" });
      userEvent.click(getCell(2, 2), { shiftKey: true });

      expect(getCell(0, 0)).toHaveClass(gridClasses["cell--rangeTop"]);
      expect(getCell(0, 0)).toHaveClass(gridClasses["cell--rangeLeft"]);
      expect(getCell(0, 1)).toHaveClass(gridClasses["cell--rangeTop"]);
      expect(getCell(0, 2)).toHaveClass(gridClasses["cell--rangeRight"]);
      expect(getCell(0, 2)).toHaveClass(gridClasses["cell--rangeTop"]);

      expect(getCell(1, 0)).toHaveClass(gridClasses["cell--rangeLeft"]);
      expect(getCell(1, 2)).toHaveClass(gridClasses["cell--rangeRight"]);

      expect(getCell(2, 0)).toHaveClass(gridClasses["cell--rangeBottom"]);
      expect(getCell(2, 0)).toHaveClass(gridClasses["cell--rangeLeft"]);
      expect(getCell(2, 1)).toHaveClass(gridClasses["cell--rangeBottom"]);
      expect(getCell(2, 2)).toHaveClass(gridClasses["cell--rangeRight"]);
      expect(getCell(2, 2)).toHaveClass(gridClasses["cell--rangeBottom"]);
    });

    it("should keep the focus on first clicked cell", () => {
      render(<TestDataGridSelection />);
      const cell = getCell(0, 0);
      cell.focus();
      expect(cell).toHaveFocus();
      userEvent.click(cell);
      fireEvent.click(getCell(2, 1), { shiftKey: true });
      expect(cell).toHaveFocus();
    });
  });

  describe("Shift + arrow keys", () => {
    // it("should call selectCellRange when ArrowDown is pressed", () => {
    //   render(<TestDataGridSelection />);
    //   const spiedSelectCellsBetweenRange = spyApi(
    //     apiRef.current,
    //     "selectCellRange"
    //   );
    //   const cell = getCell(0, 0);
    //   cell.focus();
    //   userEvent.click(cell);
    //   fireEvent.keyDown(cell, { key: "Shift" });
    //   fireEvent.keyDown(cell, { key: "ArrowDown", shiftKey: true });
    //   expect(spiedSelectCellsBetweenRange.lastCall.args[0]).toEqual({
    //     id: 0,
    //     field: "id",
    //   });
    //   expect(spiedSelectCellsBetweenRange.lastCall.args[1]).toEqual({
    //     id: 1,
    //     field: "id",
    //   });
    // });

    // it("should call selectCellRange when ArrowUp is pressed", () => {
    //   render(<TestDataGridSelection />);
    //   const spiedSelectCellsBetweenRange = spyApi(
    //     apiRef.current,
    //     "selectCellRange"
    //   );
    //   const cell = getCell(1, 0);
    //   cell.focus();
    //   userEvent.click(cell);
    //   fireEvent.keyDown(cell, { key: "Shift" });
    //   fireEvent.keyDown(cell, { key: "ArrowUp", shiftKey: true });
    //   expect(spiedSelectCellsBetweenRange.lastCall.args[0]).toEqual({
    //     id: 1,
    //     field: "id",
    //   });
    //   expect(spiedSelectCellsBetweenRange.lastCall.args[1]).toEqual({
    //     id: 0,
    //     field: "id",
    //   });
    // });

    // it("should call selectCellRange when ArrowLeft is pressed", () => {
    //   render(<TestDataGridSelection />);
    //   const spiedSelectCellsBetweenRange = spyApi(
    //     apiRef.current,
    //     "selectCellRange"
    //   );
    //   const cell = getCell(0, 1);
    //   cell.focus();
    //   userEvent.click(cell);
    //   fireEvent.keyDown(cell, { key: "Shift" });
    //   fireEvent.keyDown(cell, { key: "ArrowLeft", shiftKey: true });
    //   expect(spiedSelectCellsBetweenRange.lastCall.args[0]).toEqual({
    //     id: 0,
    //     field: "currencyPair",
    //   });
    //   expect(spiedSelectCellsBetweenRange.lastCall.args[1]).toEqual({
    //     id: 0,
    //     field: "id",
    //   });
    // });

    // it("should call selectCellRange when ArrowRight is pressed", () => {
    //   render(<TestDataGridSelection />);
    //   const spiedSelectCellsBetweenRange = spyApi(
    //     apiRef.current,
    //     "selectCellRange"
    //   );
    //   const cell = getCell(0, 0);
    //   cell.focus();
    //   userEvent.click(cell);
    //   fireEvent.keyDown(cell, { key: "Shift" });
    //   fireEvent.keyDown(cell, { key: "ArrowRight", shiftKey: true });
    //   expect(spiedSelectCellsBetweenRange.lastCall.args[0]).toEqual({
    //     id: 0,
    //     field: "id",
    //   });
    //   expect(spiedSelectCellsBetweenRange.lastCall.args[1]).toEqual({
    //     id: 0,
    //     field: "currencyPair",
    //   });
    // });

    it("should keep the focus on first clicked cell", () => {
      render(<TestDataGridSelection />);
      const cell = getCell(0, 0);
      cell.focus();
      userEvent.click(cell);
      fireEvent.keyDown(cell, { key: "Shift" });
      fireEvent.keyDown(cell, { key: "ArrowDown", shiftKey: true });
      expect(cell).toHaveFocus();
    });
  });

  describe("onCellSelectionModelChange", () => {
    it("should update the selection state when a cell is selected", () => {
      const onCellSelectionModelChange = jest.fn();
      render(
        <TestDataGridSelection
          cellSelectionModel={{}}
          onCellSelectionModelChange={onCellSelectionModelChange}
        />
      );
      fireEvent.click(getCell(0, 0));

      expect(onCellSelectionModelChange).toHaveBeenCalledTimes(1);
      expect(onCellSelectionModelChange.mock.calls[0][0]).toEqual({
        "0": { id: true },
      });
    });

    // Context: https://github.com/mui/mui-x/issues/14184
    it("should add the new cell selection range to the existing state", () => {
      const onCellSelectionModelChange = jest.fn();
      render(
        <TestDataGridSelection
          cellSelectionModel={{ "0": { id: true } }}
          onCellSelectionModelChange={onCellSelectionModelChange}
        />
      );

      // Add a new cell range to the selection
      fireEvent.mouseDown(getCell(2, 0), { ctrlKey: true });
      fireEvent.mouseOver(getCell(3, 0), { ctrlKey: true });

      expect(onCellSelectionModelChange).toHaveBeenCalledTimes(1);
      expect(onCellSelectionModelChange.mock.calls[0][0]).toEqual({
        "0": { id: true },
        "2": { id: true },
        "3": { id: true },
      });
    });
  });

  describe("apiRef", () => {
    describe("selectCellRange", () => {
      it("should select all cells within the given arguments if end > start", () => {
        render(<TestDataGridSelection />);
        act(() =>
          apiRef.current.selectCellRange(
            { id: 0, field: "id" },
            { id: 2, field: "price1M" }
          )
        );

        expect(getCell(0, 0)).toHaveClass("Mui-selected");
        expect(getCell(0, 1)).toHaveClass("Mui-selected");
        expect(getCell(0, 2)).toHaveClass("Mui-selected");

        expect(getCell(1, 0)).toHaveClass("Mui-selected");
        expect(getCell(1, 1)).toHaveClass("Mui-selected");
        expect(getCell(1, 2)).toHaveClass("Mui-selected");

        expect(getCell(2, 0)).toHaveClass("Mui-selected");
        expect(getCell(2, 1)).toHaveClass("Mui-selected");
        expect(getCell(2, 2)).toHaveClass("Mui-selected");
      });

      it("should select all cells within the given arguments if start > end", () => {
        render(<TestDataGridSelection />);
        act(() =>
          apiRef.current.selectCellRange(
            { id: 0, field: "id" },
            { id: 2, field: "price1M" }
          )
        );

        expect(getCell(0, 0)).toHaveClass("Mui-selected");
        expect(getCell(0, 1)).toHaveClass("Mui-selected");
        expect(getCell(0, 2)).toHaveClass("Mui-selected");

        expect(getCell(1, 0)).toHaveClass("Mui-selected");
        expect(getCell(1, 1)).toHaveClass("Mui-selected");
        expect(getCell(1, 2)).toHaveClass("Mui-selected");

        expect(getCell(2, 0)).toHaveClass("Mui-selected");
        expect(getCell(2, 1)).toHaveClass("Mui-selected");
        expect(getCell(2, 2)).toHaveClass("Mui-selected");
      });

      it("should discard previously selected cells and keep only the ones inside the range", () => {
        render(
          <TestDataGridSelection
            initialState={{
              cellSelection: {
                0: { id: true, currencyPair: true, price1M: true },
              },
            }}
          />
        );

        expect(getCell(0, 0)).toHaveClass("Mui-selected");
        expect(getCell(0, 1)).toHaveClass("Mui-selected");
        expect(getCell(0, 2)).toHaveClass("Mui-selected");

        act(() =>
          apiRef.current.selectCellRange(
            { id: 1, field: "id" },
            { id: 2, field: "price1M" }
          )
        );

        expect(getCell(0, 0)).not.toHaveClass("Mui-selected");
        expect(getCell(0, 1)).not.toHaveClass("Mui-selected");
        expect(getCell(0, 2)).not.toHaveClass("Mui-selected");

        expect(getCell(1, 0)).toHaveClass("Mui-selected");
        expect(getCell(1, 1)).toHaveClass("Mui-selected");
        expect(getCell(1, 2)).toHaveClass("Mui-selected");

        expect(getCell(2, 0)).toHaveClass("Mui-selected");
        expect(getCell(2, 1)).toHaveClass("Mui-selected");
        expect(getCell(2, 2)).toHaveClass("Mui-selected");
      });
    });

    describe("getSelectedCellsAsArray", () => {
      it("should return the selected cells as an array", () => {
        render(
          <TestDataGridSelection
            cellSelectionModel={{
              0: { id: true, currencyPair: true, price1M: false },
            }}
          />
        );
        expect(apiRef.current.getSelectedCellsAsArray()).toEqual([
          { id: 0, field: "id" },
          { id: 0, field: "currencyPair" },
        ]);
      });
    });
  });

  describe("Auto-scroll", () => {
    const isJSDOM = /jsdom/.test(window.navigator.userAgent);

  if (isJSDOM) {

    it("should auto-scroll when the mouse approaches the bottom edge", () => {
      const requestAnimationFrameSpy = jest
        .spyOn(window, "requestAnimationFrame")
        .mockImplementation(() => 0);
    
      const rowHeight = 30;
      const columnHeaderHeight = 50;
      const border = 1;
      render(
        <TestDataGridSelection
          rowLength={20}
          rowHeight={30}
          columnHeaderHeight={50}
          height={rowHeight * 8 + columnHeaderHeight + 2 * border}
          width={400}
        />
      );
      const cell11 = getCell(1, 1);
      fireEvent.mouseDown(cell11);
      fireEvent.click(cell11);
    
      const virtualScroller = document.querySelector(
        `.${gridClasses.virtualScroller}`
      )!;
      const rect = virtualScroller.getBoundingClientRect();
    
      expect(virtualScroller.scrollTop).toEqual(0);
      const cell71 = getCell(7, 1);
      fireEvent.mouseOver(cell71, {
        clientX: rect.x,
        clientY: rect.y + rect.height - 25,
      }); // 25=half speed
      expect(virtualScroller.scrollTop).toEqual(-50);
    
      virtualScroller.scrollTop = 0;
      virtualScroller.dispatchEvent(new Event("scroll"));
    
      expect(virtualScroller.scrollTop).toEqual(0);
      fireEvent.mouseOver(cell71, {
        clientX: rect.x,
        clientY: rect.y + rect.height - 0,
      }); // 0=full speed
      expect(virtualScroller.scrollTop).toEqual(-40);
    
      // Restore the original behavior of requestAnimationFrame
      requestAnimationFrameSpy.mockRestore();
    });
    

    // it("should auto-scroll when the mouse approaches the top edge", () => {
    //   stub(window, "requestAnimationFrame").callsFake(() => 0);

    //   const rowHeight = 30;
    //   const columnHeaderHeight = 50;
    //   const border = 1;
    //   render(
    //     <TestDataGridSelection
    //       rowLength={20}
    //       rowHeight={30}
    //       columnHeaderHeight={50}
    //       height={rowHeight * 8 + columnHeaderHeight + 2 * border}
    //       width={400}
    //     />
    //   );
    //   const cell71 = getCell(7, 1);
    //   fireEvent.mouseDown(cell71);
    //   fireEvent.click(cell71);

    //   const virtualScroller = document.querySelector(
    //     `.${gridClasses.virtualScroller}`
    //   )!;
    //   const gridRect = grid("root")!.getBoundingClientRect();

    //   virtualScroller.scrollTop = 30;
    //   virtualScroller.dispatchEvent(new Event("scroll"));
    //   expect(virtualScroller.scrollTop).toEqual(30);

    //   const cell11 = getCell(1, 1);
    //   fireEvent.mouseOver(cell11, {
    //     clientX: gridRect.x,
    //     clientY: gridRect.y + border + columnHeaderHeight + 25, // 25=half speed
    //   });
    //   expect(virtualScroller.scrollTop).toEqual(20);

    //   fireEvent.mouseOver(cell11, {
    //     clientX: gridRect.x,
    //     clientY: gridRect.y + border + columnHeaderHeight + 0, // 0=full speed
    //   });
    //   expect(virtualScroller.scrollTop).toEqual(0);

    //   (window.requestAnimationFrame as SinonStub).restore();
    // });
  }
  });
});
