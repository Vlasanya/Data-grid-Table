import * as React from "react";
import {
  gridClasses,
  GridPinnedColumnPosition,
  GridColumnGroupingModel,
  GridColDef,
} from "@mui/x-data-grid";
import { GridApi } from "../typeOverloads/reexports";
import { useGridApiRef } from "../hooks/utils/useGridApiRef";
import { DataGridPremium } from "../DataGridPremium/DataGridPremium";
import { DataGridPremiumProps } from "../models/dataGridPremiumProps";
import { useBasicDemoData } from "./basic-data-service";
import {
  render,
  screen,
  act,
  createEvent,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
import {
  $,
  $$,
  microtasks,
  getCell,
  getColumnHeaderCell,
  getColumnHeadersTextContent,
  grid,
} from "./helperFn";
import userEvent from "@testing-library/user-event";

// TODO Move to utils
// Fix https://github.com/mui/mui-x/pull/2085/files/058f56ac3c729b2142a9a28b79b5b13535cdb819#diff-db85480a519a5286d7341e9b8957844762cf04cdacd946331ebaaaff287482ec
function createDragOverEvent(target: ChildNode) {
  const dragOverEvent = createEvent.dragOver(target);
  // Safari 13 doesn't have DragEvent.
  // RTL fallbacks to Event which doesn't allow to set these fields during initialization.
  Object.defineProperty(dragOverEvent, "clientX", { value: 1 });
  Object.defineProperty(dragOverEvent, "clientY", { value: 1 });

  return dragOverEvent;
}

const isJSDOM = /jsdom/.test(window.navigator.userAgent);

describe("<DataGridPro /> - Column pinning", () => {
  let apiRef: React.MutableRefObject<GridApi>;

  function TestCase({
    nbCols = 20,
    ...other
  }: Partial<DataGridPremiumProps> & { nbCols?: number }) {
    apiRef = useGridApiRef();
    const data = useBasicDemoData(1, nbCols);
    return (
      <div style={{ width: 302, height: 300 }}>
        <DataGridPremium {...data} apiRef={apiRef} {...other} />
      </div>
    );
  }

  function ResizeObserverMock(
    callback: (entries: { borderBoxSize: [{ blockSize: number }] }[]) => void
  ) {
    let timeout: ReturnType<typeof setTimeout>;

    return {
      observe: (element: HTMLElement) => {
        // Simulates the async behavior of the native ResizeObserver
        timeout = setTimeout(() => {
          callback([{ borderBoxSize: [{ blockSize: element.clientHeight }] }]);
        });
      },
      disconnect: () => {
        clearTimeout(timeout);
      },
      unobserve: () => {
        clearTimeout(timeout);
      },
    };
  }

  const originalResizeObserver = window.ResizeObserver;

  beforeEach(() => {
    const { userAgent } = window.navigator;

    if (userAgent.includes("Chrome") && !userAgent.includes("Headless")) {
      // Only use the mock in non-headless Chrome
      window.ResizeObserver = ResizeObserverMock as any;
    }
  });

  afterEach(() => {
    window.ResizeObserver = originalResizeObserver;
    cleanup();
  });

  it("should scroll when the next cell to focus is covered by the left pinned columns", function test() {
    if (isJSDOM) {
      // Need layouting
      return;
    }
    render(<TestCase initialState={{ pinnedColumns: { left: ["id"] } }} />);
    const virtualScroller = document.querySelector(
      `.${gridClasses.virtualScroller}`
    )!;
    virtualScroller.scrollLeft = 100;
    act(() => virtualScroller.dispatchEvent(new Event("scroll")));
    const cell = getCell(0, 2);
    userEvent.click(cell);
    fireEvent.keyDown(cell, { key: "ArrowLeft" });
    expect(virtualScroller.scrollLeft).toEqual(0);
  });

  it("should scroll when the next cell to focus is covered by the right pinned columns", function test() {
    if (isJSDOM) {
      // Need layouting
      return;
    }
    render(
      <TestCase initialState={{ pinnedColumns: { right: ["price16M"] } }} />
    );
    const virtualScroller = document.querySelector(
      `.${gridClasses.virtualScroller}`
    )!;
    expect(virtualScroller.scrollLeft).toEqual(0);
    const cell = getCell(0, 1);
    userEvent.click(cell);
    fireEvent.keyDown(cell, { key: "ArrowRight" });
    expect(virtualScroller.scrollLeft).toEqual(100);
  });

  it("should increase the width of right pinned columns by resizing to the left", function test() {
    if (isJSDOM) {
      // Need layouting
      return;
    }
    render(
      <TestCase
        nbCols={3}
        initialState={{ pinnedColumns: { right: ["price1M"] } }}
      />
    );
    const columnHeader = getColumnHeaderCell(2);
    expect(columnHeader).toHaveStyle({ width: "100px" });

    const separator = columnHeader.querySelector(
      `.${gridClasses["columnSeparator--resizable"]}`
    )!;
    fireEvent.mouseDown(separator, { clientX: 200 });
    fireEvent.mouseMove(separator, { clientX: 190, buttons: 1 });
    fireEvent.mouseUp(separator);

    expect(columnHeader).toHaveStyle({ width: "110px" });
    expect(separator).toHaveClass(gridClasses["columnSeparator--sideLeft"]);
  });

  it("should reduce the width of right pinned columns by resizing to the right", function test() {
    if (isJSDOM) {
      // Need layouting
      return;
    }
    render(
      <TestCase
        nbCols={3}
        initialState={{ pinnedColumns: { right: ["price1M"] } }}
      />
    );
    const columnHeader = getColumnHeaderCell(2);
    expect(columnHeader).toHaveStyle({ width: "100px" });

    const separator = columnHeader.querySelector(
      `.${gridClasses["columnSeparator--resizable"]}`
    )!;
    fireEvent.mouseDown(separator, { clientX: 200 });
    fireEvent.mouseMove(separator, { clientX: 210, buttons: 1 });
    fireEvent.mouseUp(separator);

    expect(columnHeader).toHaveStyle({ width: "90px" });
    expect(separator).toHaveClass(gridClasses["columnSeparator--sideLeft"]);
  });

  it("should not allow to drag pinned columns", () => {
    render(
      <TestCase
        nbCols={3}
        initialState={{ pinnedColumns: { left: ["id"], right: ["price1M"] } }}
      />
    );
    expect(getColumnHeaderCell(0).firstChild).toHaveAttribute(
      "draggable",
      "false"
    );
    expect(getColumnHeaderCell(2).firstChild).toHaveAttribute(
      "draggable",
      "false"
    );
  });

  it("should not allow to drop a column on top of a pinned column", () => {
    const onPinnedColumnsChange = jest.fn();
    render(
      <TestCase
        nbCols={3}
        initialState={{ pinnedColumns: { right: ["price1M"] } }}
        onPinnedColumnsChange={onPinnedColumnsChange}
      />
    );

    const dragCol = getColumnHeaderCell(1).firstChild!;
    const targetCell = getCell(0, 2)!;
    fireEvent.dragStart(dragCol);
    fireEvent.dragEnter(targetCell);
    const dragOverEvent = createDragOverEvent(targetCell);
    fireEvent(targetCell, dragOverEvent);
    expect(onPinnedColumnsChange).toHaveBeenCalledTimes(0);
  });

  it("should filter out invalid columns when blocking a column from being dropped", () => {
    render(
      <TestCase
        nbCols={3}
        initialState={{ pinnedColumns: { left: ["foo", "bar"] } }}
      />
    );
    expect(getColumnHeadersTextContent()).toEqual([
      "id",
      "Currency Pair",
      "1M",
    ]);
    const dragCol = getColumnHeaderCell(0).firstChild!;
    const targetCell = getCell(0, 1)!;
    fireEvent.dragStart(dragCol);
    fireEvent.dragEnter(targetCell);
    const dragOverEvent = createDragOverEvent(targetCell);
    fireEvent(targetCell, dragOverEvent);
    expect(getColumnHeadersTextContent()).toEqual([
      "Currency Pair",
      "id",
      "1M",
    ]);
  });

  it("should not override the first left pinned column when checkboxSelection=true", () => {
    render(
      <TestCase
        nbCols={2}
        initialState={{ pinnedColumns: { left: ["id"] } }}
        checkboxSelection
      />
    );
    expect(getColumnHeadersTextContent()).toEqual(["id", "", "Currency Pair"]);
  });

  it("should add border to right pinned columns section when `showCellVerticalBorder={true}`", function test() {
    if (isJSDOM) {
      // Doesn't work with mocked window.getComputedStyle
      return;
    }
    render(
      <div style={{ width: 300, height: 500 }}>
        <TestCase
          showCellVerticalBorder
          initialState={{ pinnedColumns: { right: ["id"] } }}
        />
      </div>
    );
    const computedStyle = window.getComputedStyle(
      document.querySelector<HTMLElement>(".MuiDataGrid-cell--pinnedRight")!
    );
    const borderLeftColor = computedStyle.getPropertyValue("border-left-color");
    const borderLeftWidth = computedStyle.getPropertyValue("border-left-width");
    expect(borderLeftWidth).toEqual("1px");
    // should not be transparent
    expect(borderLeftColor).not.toEqual("rgba(0, 0, 0, 0)");
  });

  // https://github.com/mui/mui-x/issues/12431
  it("should not render unnecessary filler after the last row", function test() {
    if (isJSDOM) {
      // Needs layouting
      return;
    }
    const rowHeight = 50;
    const columns: GridColDef[] = [
      { field: "id", headerName: "ID", width: 120 },
      { field: "name", headerName: "Name", width: 120 },
    ];
    const rows = [
      { id: 1, name: "Robert Cooper" },
      { id: 2, name: "Dora Wallace" },
      { id: 3, name: "Howard Dixon" },
      { id: 4, name: "Essie Reynolds" },
    ];

    render(
      <div style={{ height: 300, width: 300 }}>
        <DataGridPremium
          rows={rows}
          columns={columns}
          initialState={{ pinnedColumns: { left: ["name"] } }}
          rowHeight={rowHeight}
          columnHeaderHeight={rowHeight}
        />
      </div>
    );
    expect(grid("virtualScroller")?.scrollHeight).toEqual(
      (rows.length + 1) * rowHeight
    );
  });

  describe("props: onPinnedColumnsChange", () => {
    it("should call when a column is pinned", () => {
      const handlePinnedColumnsChange = jest.fn();
      render(<TestCase onPinnedColumnsChange={handlePinnedColumnsChange} />);
      act(() =>
        apiRef.current.pinColumn("currencyPair", GridPinnedColumnPosition.LEFT)
      );
      expect(
        handlePinnedColumnsChange.mock.calls[
          handlePinnedColumnsChange.mock.calls.length - 1
        ][0]
      ).toEqual({
        left: ["currencyPair"],
        right: [],
      });
      act(() =>
        apiRef.current.pinColumn("price17M", GridPinnedColumnPosition.RIGHT)
      );
      expect(
        handlePinnedColumnsChange.mock.calls[
          handlePinnedColumnsChange.mock.calls.length - 1
        ][0]
      ).toEqual({
        left: ["currencyPair"],
        right: ["price17M"],
      });
    });

    it("should not change the pinned columns when it is called", async () => {
      const handlePinnedColumnsChange = jest.fn();
      render(
        <TestCase
          pinnedColumns={{ left: ["currencyPair"] }}
          onPinnedColumnsChange={handlePinnedColumnsChange}
        />
      );
      expect(
        $$(`[role="gridcell"].${gridClasses["cell--pinnedLeft"]}`)
      ).toHaveLength(1);
      act(() =>
        apiRef.current.pinColumn("price17M", GridPinnedColumnPosition.LEFT)
      );
      await microtasks();
      expect(
        $$(`[role="gridcell"].${gridClasses["cell--pinnedLeft"]}`)
      ).toHaveLength(1);
      expect(handlePinnedColumnsChange.mock.calls[0][0]).toEqual({
        left: ["currencyPair", "price17M"],
        right: [],
      });
    });
  });

  describe("prop: pinnedColumns", () => {
    it("should pin the columns specified", () => {
      render(<TestCase pinnedColumns={{ left: ["currencyPair"] }} />);
      const cell = document.querySelector<HTMLDivElement>(
        `.${gridClasses["cell--pinnedLeft"]}[data-field="currencyPair"]`
      )!;
      expect(cell).not.toEqual(null);
    });

    it("should not change the pinned columns if the prop didn't change", () => {
      render(<TestCase pinnedColumns={{ left: ["currencyPair"] }} />);
      expect(
        document.querySelector(
          `.${gridClasses["cell--pinnedLeft"]}[data-field="currencyPair"]`
        )
      ).not.toEqual(null);
      act(() =>
        apiRef.current.pinColumn("price17M", GridPinnedColumnPosition.LEFT)
      );
      expect(
        document.querySelector(
          `.${gridClasses["cell--pinnedLeft"]}[data-field="currencyPair"]`
        )
      ).not.toEqual(null);
    });

    it("should filter our duplicated columns", () => {
      render(
        <TestCase
          pinnedColumns={{ left: ["currencyPair"], right: ["currencyPair"] }}
        />
      );
      const cell = document.querySelector<HTMLDivElement>(
        `.${gridClasses["cell--pinnedLeft"]}[data-field="currencyPair"]`
      )!;
      expect(cell).not.toEqual(null);
      expect(
        document.querySelector(
          `.${gridClasses["cell--pinnedRight"]}[data-field="currencyPair"]`
        )
      ).toEqual(null);
    });
  });

  describe("prop: disableColumnPinning", () => {
    it("should not add any button to the column menu", async () => {
      render(<TestCase disableColumnPinning />);
      const columnCell = document.querySelector(
        '[role="columnheader"][data-field="id"]'
      )!;
      const menuIconButton = columnCell.querySelector(
        'button[aria-label="Menu"]'
      )!;

      await userEvent.click(menuIconButton);
      expect(screen.queryByRole("menuitem", { name: "Pin to left" })).toEqual(
        null
      );
      expect(screen.queryByRole("menuitem", { name: "Pin to right" })).toEqual(
        null
      );
    });

    it("should allow to pin column using `initialState.pinnedColumns` prop", () => {
      render(
        <TestCase
          initialState={{ pinnedColumns: { left: ["id"] } }}
          disableColumnPinning
        />
      );
      const cell = document.querySelector<HTMLDivElement>(
        `.${gridClasses["cell--pinnedLeft"]}[data-field="id"]`
      )!;
      expect(cell).not.toEqual(null);
    });

    it("should allow to pin column using `pinnedColumns` prop", () => {
      render(
        <TestCase pinnedColumns={{ left: ["id"] }} disableColumnPinning />
      );
      const cell = document.querySelector<HTMLDivElement>(
        `.${gridClasses["cell--pinnedLeft"]}[data-field="id"]`
      )!;
      expect(cell).not.toEqual(null);
    });

    it("should allow to pin column using `apiRef.current.pinColumn`", () => {
      render(<TestCase disableColumnPinning />);
      act(() => apiRef.current.pinColumn("id", GridPinnedColumnPosition.LEFT));
      const cell = document.querySelector<HTMLDivElement>(
        `.${gridClasses["cell--pinnedLeft"]}[data-field="id"]`
      )!;
      expect(cell).not.toEqual(null);
    });
  });

  describe("apiRef", () => {
    it("should reorder the columns to render the left pinned columns before all other columns", () => {
      render(
        <TestCase
          initialState={{
            pinnedColumns: { left: ["currencyPair", "price1M"] },
          }}
        />
      );
      expect(
        $(`.${gridClasses["cell--pinnedLeft"]}[data-field="currencyPair"]`)
      ).not.toEqual(null);
      expect(
        $(`.${gridClasses["cell--pinnedLeft"]}[data-field="price1M"]`)
      ).not.toEqual(null);
    });

    it("should reorder the columns to render the right pinned columns after all other columns", () => {
      render(
        <TestCase
          initialState={{ pinnedColumns: { right: ["price16M", "price17M"] } }}
        />
      );
      expect(
        $(`.${gridClasses["cell--pinnedRight"]}[data-field="price16M"]`)
      ).not.toEqual(null);
      expect(
        $(`.${gridClasses["cell--pinnedRight"]}[data-field="price17M"]`)
      ).not.toEqual(null);
    });

    it("should not crash if a non-existent column is pinned", () => {
      expect(() => {
        render(
          <TestCase initialState={{ pinnedColumns: { left: ["currency"] } }} />
        );
        render(
          <TestCase initialState={{ pinnedColumns: { right: ["currency"] } }} />
        );
      }).not.toThrow();
    });

    describe("pinColumn", () => {
      it("should pin the given column", () => {
        render(<TestCase />);
        expect($('[data-field="currencyPair"]')?.className).not.toContain(
          "pinned"
        );
        act(() =>
          apiRef.current.pinColumn(
            "currencyPair",
            GridPinnedColumnPosition.LEFT
          )
        );
        expect(
          $(`.${gridClasses["cell--pinnedLeft"]}[data-field="currencyPair"]`)
        ).not.toEqual(null);
      });

      it("should change the side when called on a pinned column", () => {
        render(<TestCase />);

        const renderZone = $(`.${gridClasses.virtualScrollerRenderZone}`)!;

        expect(
          $(renderZone, '[data-field="currencyPair"]')!.className
        ).not.toContain("pinned");

        act(() =>
          apiRef.current.pinColumn(
            "currencyPair",
            GridPinnedColumnPosition.LEFT
          )
        );
        expect(
          $(
            renderZone,
            `.${gridClasses["cell--pinnedLeft"]}[data-field="currencyPair"]`
          )
        ).not.toEqual(null);
        expect(
          $(renderZone, '[data-field="currencyPair"]')!.className
        ).toContain("pinned");

        act(() =>
          apiRef.current.pinColumn(
            "currencyPair",
            GridPinnedColumnPosition.RIGHT
          )
        );
        expect(
          $$(renderZone, `.${gridClasses["cell--pinnedLeft"]}`).length
        ).toEqual(0);
        expect(
          $(
            renderZone,
            `.${gridClasses["cell--pinnedRight"]}[data-field="currencyPair"]`
          )
        ).not.toEqual(null);
      });

      it("should not change the columns when called on a pinned column with the same side ", () => {
        render(<TestCase />);
        act(() =>
          apiRef.current.pinColumn(
            "currencyPair",
            GridPinnedColumnPosition.LEFT
          )
        );
        expect($$(`.${gridClasses["cell--pinnedLeft"]}`)).toHaveLength(1);
        act(() =>
          apiRef.current.pinColumn(
            "currencyPair",
            GridPinnedColumnPosition.LEFT
          )
        );
        expect($$(`.${gridClasses["cell--pinnedLeft"]}`)).toHaveLength(1);
      });
    });

    describe("unpinColumn", () => {
      it("should unpin the given column", () => {
        render(<TestCase />);
        act(() =>
          apiRef.current.pinColumn(
            "currencyPair",
            GridPinnedColumnPosition.LEFT
          )
        );
        expect($$(`.${gridClasses["cell--pinnedLeft"]}`).length).not.toEqual(0);
        act(() => apiRef.current.unpinColumn("currencyPair"));
        expect($$(`.${gridClasses["cell--pinnedLeft"]}`).length).toEqual(0);
        const renderZone = $(`.${gridClasses.virtualScrollerRenderZone}`)!;
        expect(
          renderZone.querySelector('[data-field="currencyPair"]')
        ).not.toEqual(null);
      });
    });

    describe("isColumnPinned", () => {
      it("should return the correct value", () => {
        render(
          <TestCase
            initialState={{
              pinnedColumns: { left: ["id"], right: ["price16M"] },
            }}
          />
        );
        expect(apiRef.current.isColumnPinned("id")).toEqual(
          GridPinnedColumnPosition.LEFT
        );
        expect(apiRef.current.isColumnPinned("price16M")).toEqual(
          GridPinnedColumnPosition.RIGHT
        );
        expect(apiRef.current.isColumnPinned("currencyPair")).toEqual(false);
      });
    });

    // See https://github.com/mui/mui-x/issues/7819
    describe("`getCellElement` method should return cell element", () => {
      it("should return the correct value", () => {
        render(
          <TestCase
            initialState={{
              pinnedColumns: { left: ["id"], right: ["price16M"] },
            }}
          />
        );
        const cellElement = apiRef.current.getCellElement(0, "currencyPair");
        expect(cellElement).not.toEqual(null);
      });
    });
  });

  describe("column menu", () => {
    it('should pin the column to the left when clicking the "Pin to left" pinning button', async () => {
      render(<TestCase />);
      const columnCell = $('[role="columnheader"][data-field="id"]')!;
      const menuIconButton = columnCell.querySelector(
        'button[aria-label="Menu"]'
      )!;
      await userEvent.click(menuIconButton);
      await userEvent.click(
        screen.getByRole("menuitem", { name: "Pin to left" })
      );
      expect(
        $(`.${gridClasses["cell--pinnedLeft"]}[data-field="id"]`)
      ).not.toEqual(null);
    });

    it('should pin the column to the right when clicking the "Pin to right" pinning button', async () => {
      render(<TestCase />);
      const columnCell = $('[role="columnheader"][data-field="id"]')!;
      const menuIconButton = columnCell.querySelector(
        'button[aria-label="Menu"]'
      )!;
      await userEvent.click(menuIconButton);
      await userEvent.click(
        screen.getByRole("menuitem", { name: "Pin to right" })
      );
      expect(
        $(`.${gridClasses["cell--pinnedRight"]}[data-field="id"]`)
      ).not.toEqual(null);
    });

    it('should allow to invert the side when clicking on "Pin to right" pinning button on a left pinned column', async () => {
      render(<TestCase initialState={{ pinnedColumns: { left: ["id"] } }} />);
      const columnCell = $('[role="columnheader"][data-field="id"]')!;
      const menuIconButton = columnCell.querySelector(
        'button[aria-label="Menu"]'
      )!;
      await userEvent.click(menuIconButton);
      await userEvent.click(
        screen.getByRole("menuitem", { name: "Pin to right" })
      );
      expect($(`.${gridClasses["cell--pinnedLeft"]}[data-field="id"]`)).toEqual(
        null
      );
      expect(
        $(`.${gridClasses["cell--pinnedRight"]}[data-field="id"]`)
      ).not.toEqual(null);
    });

    it('should allow to invert the side when clicking on "Pin to left" pinning button on a right pinned column', async () => {
      render(<TestCase initialState={{ pinnedColumns: { right: ["id"] } }} />);
      const columnCell = $('[role="columnheader"][data-field="id"]')!;
      const menuIconButton = columnCell.querySelector(
        'button[aria-label="Menu"]'
      )!;
      await userEvent.click(menuIconButton);
      await userEvent.click(
        screen.getByRole("menuitem", { name: "Pin to left" })
      );
      expect(
        $(`.${gridClasses["cell--pinnedRight"]}[data-field="id"]`)
      ).toEqual(null);
      expect(
        $(`.${gridClasses["cell--pinnedLeft"]}[data-field="id"]`)
      ).not.toEqual(null);
    });

    it('should allow to unpin a pinned left column when clicking "Unpin" pinning button', async () => {
      render(<TestCase initialState={{ pinnedColumns: { left: ["id"] } }} />);
      const columnCell = $('[role="columnheader"][data-field="id"]')!;
      const menuIconButton = columnCell.querySelector(
        'button[aria-label="Menu"]'
      )!;
      await userEvent.click(menuIconButton);
      await userEvent.click(screen.getByRole("menuitem", { name: "Unpin" }));
      expect($(`.${gridClasses["cell--pinnedLeft"]}[data-field="id"]`)).toEqual(
        null
      );
    });

    describe("with fake timers", () => {

      it("should not render menu items if the column has `pinnable` equals to false", async () => {
        render(
          <TestCase
            columns={[
              { field: "brand", pinnable: true },
              { field: "year", pinnable: false },
            ]}
            rows={[{ id: 0, brand: "Nike", year: 1941 }]}
          />
        );
        const brandHeader = document.querySelector(
          '[role="columnheader"][data-field="brand"]'
        )!;
        fireEvent.click(
          brandHeader.querySelector('button[aria-label="Menu"]')!
        );
        expect(
          screen.queryByRole("menuitem", { name: "Pin to left" })
        ).not.toEqual(null);
        fireEvent.keyDown(screen.getByRole("menu"), { key: "Escape" });
        await waitFor(() => {
          expect(
            screen.queryByRole("menuitem", { name: "Pin to left" })
          ).toEqual(null);
        });
        const yearHeader = document.querySelector(
          '[role="columnheader"][data-field="year"]'
        )!;
        fireEvent.click(yearHeader.querySelector('button[aria-label="Menu"]')!);
        await waitFor(() => {
          expect(
            screen.queryByRole("menuitem", { name: "Pin to left" })
          ).toEqual(null);
        });
      });
    });
  });

  describe("restore column position after unpinning", () => {
    // it("should restore the position when unpinning existing columns", async () => {
    //   const { rerender } = render(
    //     <TestCase
    //       columns={[
    //         { field: "id", headerName: "ID" },
    //         { field: "currencyPair", headerName: "Currency Pair" },
    //         { field: "price1M", headerName: "1M" },
    //         { field: "price2M", headerName: "2M" },
    //       ]}
    //       checkboxSelection
    //       disableVirtualization
    //     />
    //   );
    //   expect(getColumnHeadersTextContent()).toEqual(['', 'ID', 'Currency Pair', '1M', '2M']);
    //   rerender(
    //     <TestCase
    //       columns={[
    //         { field: "id", headerName: "ID" },
    //         { field: "currencyPair", headerName: "Currency Pair" },
    //         { field: "price1M", headerName: "1M" },
    //         { field: "price2M", headerName: "2M" },
    //       ]}
    //       pinnedColumns={{ left: ['currencyPair', 'id'], right: ['__check__'] }}
    //     />
    //   );
    //   await act(() => new Promise((r) => setTimeout(r, 300)));
    //   // await waitFor(() => {
    //   //   expect(getColumnHeadersTextContent()).toEqual(['Currency Pair', 'ID', '1M', '2M', '']);
    //   // });
    //   rerender(
    //     <TestCase
    //       columns={[
    //         { field: "id", headerName: "ID" },
    //         { field: "currencyPair", headerName: "Currency Pair" },
    //         { field: "price1M", headerName: "1M" },
    //         { field: "price2M", headerName: "2M" },
    //       ]}
    //       pinnedColumns={{ left: [], right: [] }}
    //     />
    //   );
    //   await waitFor(() => {
    //     expect(getColumnHeadersTextContent()).toEqual(['', 'ID', 'Currency Pair', '1M', '2M']);
    //   });
    // });

    it("should restore the position when unpinning a column added after the first pinned column", () => {
      const { rerender } = render(
        <TestCase
          columns={[
            { field: "id", headerName: "ID" },
            { field: "currencyPair", headerName: "Currency Pair" },
          ]}
          disableVirtualization
        />
      );
      expect(getColumnHeadersTextContent()).toEqual([
        "ID",
        "Currency Pair",
      ]);
      rerender(
        <TestCase
          columns={[
            { field: "id", headerName: "ID" },
            { field: "currencyPair", headerName: "Currency Pair" },
          ]}
          pinnedColumns={{ left: ["currencyPair"] }}
        />
      );
      expect(getColumnHeadersTextContent()).toEqual([
        "Currency Pair",
        "ID",
      ]);
      act(() =>
        apiRef.current.updateColumns([
          { field: "foo", headerName: "Foo" },
          { field: "bar", headerName: "Bar" }
        ])
      );
      expect(getColumnHeadersTextContent()).toEqual([
        "Currency Pair",
        "ID",
        "Foo",
        "Bar",
      ]);
      rerender(
        <TestCase
          columns={[
            { field: "id", headerName: "ID" },
            { field: "currencyPair", headerName: "Currency Pair" },
            { field: "foo", headerName: "Foo" },
            { field: "bar", headerName: "Bar" }
          ]}
          pinnedColumns={{ left: ["currencyPair", "foo"] }}
        />
      );
      expect(getColumnHeadersTextContent()).toEqual([
        "Currency Pair",
        "Foo",
        "ID",
        "Bar",
      ]);
      rerender(
        <TestCase
          columns={[
            { field: "id", headerName: "ID" },
            { field: "currencyPair", headerName: "Currency Pair" },
            { field: "foo", headerName: "Foo" },
            { field: "bar", headerName: "Bar" }
          ]}
          pinnedColumns={{}}
        />
      );
      expect(getColumnHeadersTextContent()).toEqual([
        "ID",
        "Currency Pair",
        "Foo",
        "Bar",
      ]);
    });

    it("should restore the position of a column pinned before it is added", async () => {
      const { rerender } = render(
        <TestCase
          columns={[
            { field: "id" },
            { field: "currencyPair", headerName: "Currency Pair" }
          ]}
          pinnedColumns={{ left: ["foo"] }}
          disableVirtualization
        />
      );
      expect(getColumnHeadersTextContent()).toEqual([
        "id",
        "Currency Pair",
      ]);
      act(() =>
        apiRef.current.updateColumns([
          { field: "foo", headerName: "Foo" },
          { field: "bar", headerName: "Bar" }
        ])
      );
      expect(getColumnHeadersTextContent()).toEqual([
        "Foo",
        "id",
        "Currency Pair",
        "Bar",
      ]);
      rerender(
        <TestCase
          columns={[
            { field: "id" },
            { field: "currencyPair", headerName: "Currency Pair" },
            { field: "foo", headerName: "Foo" },
            { field: "bar", headerName: "Bar" }
          ]}
          pinnedColumns={{}}
        />
      );
      await waitFor(() => {
        expect(getColumnHeadersTextContent()).toEqual([
          "id",
          "Currency Pair",
          "Foo",
          "Bar",
        ]);
      });
    });

    it("should restore the position of a column unpinned after a column is removed", () => {
      const { rerender } = render(
        <TestCase
          nbCols={3}
          columns={[
            { field: "id" },
            { field: "currencyPair" },
            { field: "price1M" },
          ]}
          pinnedColumns={{ left: ["price1M"] }}
          disableVirtualization
        />
      );
      expect(getColumnHeadersTextContent()).toEqual([
        "price1M",
        "id",
        "currencyPair",
      ]);
      rerender(<TestCase columns={[{ field: "id" }, { field: "price1M" }]} />);
      expect(getColumnHeadersTextContent()).toEqual(["price1M", "id"]);
      rerender(
        <TestCase
          columns={[{ field: "id" }, { field: "price1M" }]}
          pinnedColumns={{}}
        />
      );
      expect(getColumnHeadersTextContent()).toEqual(["id", "price1M"]);
    });

    // it.only("should restore the position when the neighboring columns are reordered", async () => {
    //   const { rerender } = render(
    //     <TestCase
    //       columns={[
    //         { field: "id" },
    //         { field: "currencyPair", headerName: "Currency Pair" },
    //         { field: "price1M", headerName: "1M" },
    //         { field: "price2M", headerName: "2M" },
    //       ]}
    //       disableVirtualization
    //     />
    //   );
    //   expect(getColumnHeadersTextContent()).toEqual([
    //     "id",
    //     "Currency Pair",
    //     "1M",
    //     "2M",
    //   ]);
    //   rerender(
    //     <TestCase
    //       columns={[
    //         { field: "id" },
    //         { field: "currencyPair", headerName: "Currency Pair" },
    //         { field: "price1M", headerName: "1M" },
    //         { field: "price2M", headerName: "2M" },
    //       ]}
    //       pinnedColumns={{ left: ["price1M"] }}
    //     />
    //   );
    
    //   await waitFor(() => {
    //     expect(getColumnHeadersTextContent()).toEqual([
    //       "1M",
    //       "id",
    //       "Currency Pair",
    //       "2M",
    //     ]);
    //   });
    //   await act(async () => {
    //     apiRef.current.setColumnIndex("id", 2);
    //   });
    
    //   await waitFor(() => {
    //     expect(getColumnHeadersTextContent()).toEqual([
    //       "1M",
    //       "Currency Pair",
    //       "id",
    //       "2M",
    //     ]);
    //   });
    //   rerender(
    //     <TestCase
    //       columns={[
    //         { field: "id" },
    //         { field: "currencyPair", headerName: "Currency Pair" },
    //         { field: "price1M", headerName: "1M" },
    //         { field: "price2M", headerName: "2M" },
    //       ]}
    //       pinnedColumns={{}}
    //     />
    //   );
    //   await act(async () => {
    //     apiRef.current.setColumnIndex("id", 0);
    //     apiRef.current.setColumnIndex("currencyPair", 1);
    //     apiRef.current.setColumnIndex("price1M", 2);
    //     apiRef.current.setColumnIndex("price2M", 3);
    //   });
    
    //   await waitFor(() => {
    //     expect(getColumnHeadersTextContent()).toEqual([
    //       "Currency Pair",
    //       "id",
    //       "1M",
    //       "2M",
    //     ]);
    //   });
    // });

    it("should not crash when unpinning the first column", () => {
      const { rerender } = render(
        <TestCase
          columns={[
            { field: "id" },
            { field: "currencyPair" },
            { field: "price1M" },
          ]}
          pinnedColumns={{ left: ["id", "currencyPair"] }}
          disableVirtualization
        />
      );
      expect(getColumnHeadersTextContent()).toEqual([
        "id",
        "currencyPair",
        "price1M",
      ]);
      rerender(<TestCase columns={[{ field: "id" }, { field: "currencyPair" }, { field: "price1M" }]} pinnedColumns={{ left: ["currencyPair"] }} />);
      expect(getColumnHeadersTextContent()).toEqual([
        "currencyPair",
        "id",
        "price1M",
      ]);
    });

    it("should not crash when unpinning the last column", () => {
      const { rerender } = render(
        <TestCase
          nbCols={3}
          columns={[
            { field: "id" },
            { field: "currencyPair" },
            { field: "price1M" },
          ]}
          pinnedColumns={{ right: ["currencyPair", "price1M"] }}
          disableVirtualization
        />
      );
      expect(getColumnHeadersTextContent()).toEqual([
        "id",
        "currencyPair",
        "price1M",
      ]);
      rerender(
        <TestCase
          columns={[
            { field: "id" },
            { field: "currencyPair" },
            { field: "price1M" },
          ]}
          pinnedColumns={{ right: ["currencyPair"] }}
        />
      );
      expect(getColumnHeadersTextContent()).toEqual([
        "id",
        "price1M",
        "currencyPair",
      ]);
    });

    it("should not crash when removing a pinned column", () => {
      const { rerender } = render(
        <TestCase
          nbCols={3}
          columns={[
            { field: "id" },
            { field: "currencyPair" },
            { field: "price1M" },
          ]}
          pinnedColumns={{ right: ["currencyPair"] }}
          disableVirtualization
        />
      );
      expect(getColumnHeadersTextContent()).toEqual([
        "id",
        "price1M",
        "currencyPair",
      ]);
      rerender(
        <TestCase
          pinnedColumns={{ right: [] }}
          columns={[{ field: "id" }, { field: "price1M" }]}
        />
      );
      expect(getColumnHeadersTextContent()).toEqual(["id", "price1M"]);
    });
  });

  describe("Column grouping", () => {
    const columns: GridColDef[] = [
      { field: "id", headerName: "ID", width: 90 },
      {
        field: "firstName",
        headerName: "First name",
        width: 150,
      },
      {
        field: "lastName",
        headerName: "Last name",
        width: 150,
      },
      {
        field: "age",
        headerName: "Age",
        type: "number",
        width: 110,
      },
    ];

    const rows = [
      { id: 1, lastName: "Snow", firstName: "Jon", age: 35 },
      { id: 2, lastName: "Lannister", firstName: "Cersei", age: 42 },
      { id: 3, lastName: "Lannister", firstName: "Jaime", age: 45 },
      { id: 4, lastName: "Stark", firstName: "Arya", age: 16 },
      { id: 5, lastName: "Targaryen", firstName: "Daenerys", age: null },
      { id: 6, lastName: "Melisandre", firstName: null, age: 150 },
      { id: 7, lastName: "Clifford", firstName: "Ferrara", age: 44 },
      { id: 8, lastName: "Frances", firstName: "Rossini", age: 36 },
      { id: 9, lastName: "Roxie", firstName: "Harvey", age: 65 },
    ];

    const columnGroupingModel: GridColumnGroupingModel = [
      {
        groupId: "Internal",
        description: "",
        children: [{ field: "id" }],
      },
      {
        groupId: "Basic info",
        children: [
          {
            groupId: "Full name",
            children: [{ field: "lastName" }, { field: "firstName" }],
          },
          { field: "age" },
        ],
      },
    ];

    it("should create separate column groups for pinned and non-pinned columns having same column group", () => {
      render(
        <TestCase
          columns={columns}
          rows={rows}
          columnGroupingModel={columnGroupingModel}
          initialState={{ pinnedColumns: { right: ["age"] } }}
        />
      );

      const firstNameLastNameColumnGroupHeader = document.querySelector(
        '[role="columnheader"][data-fields="|-firstName-|-lastName-|"]'
      )!;
      expect(firstNameLastNameColumnGroupHeader.textContent).toEqual(
        "Basic info"
      );
      const ageCellColumnGroupHeader = document.querySelector(
        '[role="columnheader"][data-fields="|-age-|"]'
      )!;
      expect(ageCellColumnGroupHeader.textContent).toEqual("Basic info");
    });
  });
});
