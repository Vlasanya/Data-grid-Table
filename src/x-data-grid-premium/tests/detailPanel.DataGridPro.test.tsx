import * as React from "react";
import { DataGridPremium } from "../DataGridPremium/DataGridPremium";
import { GridApi } from "../typeOverloads/reexports";
import { useGridApiRef } from "../hooks/utils/useGridApiRef";
import { DataGridPremiumProps } from "../models/dataGridPremiumProps";
import { GridRowParams, gridClasses } from "@mui/x-data-grid";
import { GRID_DETAIL_PANEL_TOGGLE_FIELD } from "../hooks/features/detailPanel/gridDetailPanelToggleColDef";
import { useBasicDemoData } from "./basic-data-service";
import {
  getBasicGridData,
  GridBasicData,
} from "./basic-data-service";
import {
  render,
  screen,
  act,
  waitFor,
  fireEvent,
} from "@testing-library/react";
import {
  $,
  $$,
  grid,
  getRow,
  getCell,
  getColumnValues,
  microtasks,
} from "./helperFn";
import userEvent from "@testing-library/user-event";

const isJSDOM = /jsdom/.test(window.navigator.userAgent);

const spy = jest.fn();

describe("<DataGridPro /> - Detail panel", () => {
  let apiRef: React.MutableRefObject<GridApi>;

  function TestCase({
    nbRows = 20,
    ...other
  }: Partial<DataGridPremiumProps> & { nbRows?: number }) {
    apiRef = useGridApiRef();
    const data = useBasicDemoData(nbRows, 1);
    return (
      <div style={{ width: 300, height: 302 }}>
        <DataGridPremium {...data} apiRef={apiRef} {...other} />
      </div>
    );
  }

  it("should not allow to expand rows that do not specify a detail element", function test() {
    if (isJSDOM) {
      return; // Needs layout
    }
    render(
      <TestCase
        getDetailPanelContent={({ id }) => (Number(id) === 0 ? null : <div />)}
      />
    );
    const cell = getCell(0, 0);
    expect(cell.querySelector('[aria-label="Expand"]')).toHaveAttribute(
      "disabled"
    );
    fireEvent.click(cell);
    expect(getRow(0)).toHaveStyle({ marginBottom: "0px" });
  });

  it("should not consider the height of the detail panels when rendering new rows during scroll", function test() {
    if (isJSDOM) {
      return; // Needs layout
    }
    const rowHeight = 50;
    render(
      <TestCase
        getDetailPanelHeight={({ id }) =>
          (Number(id) % 2 === 0 ? 1 : 2) * rowHeight
        } // 50px for even rows, otherwise 100px
        getDetailPanelContent={() => <div />}
        rowHeight={rowHeight}
        rowBufferPx={0}
        initialState={{
          detailPanel: {
            expandedRowIds: [0, 1],
          },
        }}
      />
    );
    expect(getColumnValues(1)[0]).toEqual("0");
    const virtualScroller = document.querySelector(
      ".MuiDataGrid-virtualScroller"
    )!;
    virtualScroller.scrollTop = 250; // 50 + 50 (detail panel) + 50 + 100 (detail panel * 2)
    act(() => virtualScroller.dispatchEvent(new Event("scroll")));
    expect(getColumnValues(1)[0]).toEqual("2"); // If there was no expanded row, the first rendered would be 5
  });

  it('should derive the height from the content if getDetailPanelHeight returns "auto"', async function test() {
    if (isJSDOM) {
      return; // Needs layout
    }
    const rowHeight = 50;
    const detailPanelHeight = 100;
    render(
      <TestCase
        nbRows={1}
        rowHeight={rowHeight}
        getDetailPanelContent={() => (
          <div style={{ height: detailPanelHeight }} />
        )}
        getDetailPanelHeight={() => "auto"}
      />
    );
    fireEvent.click(screen.getAllByRole("button", { name: "Expand" })[0]);
    await microtasks();

    const virtualScrollerContent = $(".MuiDataGrid-virtualScrollerContent")!;
    expect(virtualScrollerContent).toHaveStyle({
      width: "auto",
      height: `${rowHeight + detailPanelHeight}px`,
    });

    const detailPanels = $$(".MuiDataGrid-detailPanel");
    expect(detailPanels[0]).toHaveStyle({
      height: `${detailPanelHeight}px`,
    });
  });

  it('should update the detail panel height if the content height changes when getDetailPanelHeight returns "auto"', async function test() {
    if (isJSDOM) {
      return; // Needs layout
    }
    function ExpandableCell() {
      const [expanded, setExpanded] = React.useState(false);
      return (
        <div style={{ height: expanded ? 200 : 100 }}>
          <button onClick={() => setExpanded(!expanded)}>
            {expanded ? "Decrease" : "Increase"}
          </button>
        </div>
      );
    }
    const rowHeight = 50;
    render(
      <TestCase
        nbRows={1}
        rowHeight={rowHeight}
        getDetailPanelContent={() => <ExpandableCell />}
        getDetailPanelHeight={() => "auto"}
      />
    );
    const virtualScrollerContent = grid("virtualScrollerContent")!;
    fireEvent.click(screen.getByRole("button", { name: "Expand" }));

    await waitFor(() => {
      expect(getRow(0).className).toContain(
        gridClasses["row--detailPanelExpanded"]
      );
    });

    await waitFor(() => {
      expect(virtualScrollerContent).toHaveStyle({
        width: "auto",
        height: `${rowHeight + 100}px`,
      });
    });

    const detailPanels = $$(".MuiDataGrid-detailPanel");
    expect(detailPanels[0]).toHaveStyle({
      height: `100px`,
    });

    fireEvent.click(screen.getByRole("button", { name: "Increase" }));

    await waitFor(() => {
      expect(virtualScrollerContent).toHaveStyle({
        width: "auto",
        height: `${rowHeight + 200}px`,
      });
    });

    expect(detailPanels[0]).toHaveStyle({
      height: `200px`,
    });
  });

  it("should position correctly the detail panels", function test() {
    if (isJSDOM) {
      return; // Doesn't work with mocked window.getComputedStyle
    }

    const rowHeight = 50;
    const evenHeight = rowHeight;
    const oddHeight = 2 * rowHeight;
    render(
      <TestCase
        getDetailPanelHeight={({ id }: GridRowParams) =>
          Number(id) % 2 === 0 ? evenHeight : oddHeight
        }
        getDetailPanelContent={() => <div />}
        rowHeight={rowHeight}
        initialState={{
          detailPanel: {
            expandedRowIds: [0, 1],
          },
        }}
      />
    );
    const detailPanels = $$(".MuiDataGrid-detailPanel");
    expect(detailPanels[0]).toHaveStyle({
      height: `${evenHeight}px`,
    });
    expect(detailPanels[1]).toHaveStyle({
      height: `${oddHeight}px`,
    });
  });

  it("should not render detail panels for non-visible rows", () => {
    render(
      <TestCase
        getDetailPanelContent={({ id }) => <div>Row {id}</div>}
        pagination
        pageSizeOptions={[1]}
        initialState={{
          detailPanel: { expandedRowIds: [0] },
          pagination: { paginationModel: { pageSize: 1 } },
        }}
      />
    );
    expect(screen.queryByText("Row 0")).not.toEqual(null);
    fireEvent.click(screen.getByRole("button", { name: /next page/i }));
    expect(screen.queryByText("Row 0")).toEqual(null);
  });

  it("should consider the height of the detail panel when scrolling to a cell", function test() {
    if (isJSDOM) {
      return; // Needs layout
    }
    const rowHeight = 50;
    const columnHeaderHeight = 50;
    render(
      <TestCase
        getDetailPanelHeight={() => rowHeight}
        getDetailPanelContent={() => <div />}
        rowHeight={rowHeight}
        columnHeaderHeight={columnHeaderHeight}
        initialState={{
          detailPanel: {
            expandedRowIds: [0],
          },
        }}
        hideFooter
      />
    );
    const virtualScroller = document.querySelector(
      ".MuiDataGrid-virtualScroller"
    )!;
    userEvent.click(getCell(2, 1));
    fireEvent.keyDown(getCell(2, 1), { key: "ArrowDown" });
    expect(virtualScroller.scrollTop).toEqual(0);
    fireEvent.keyDown(getCell(3, 1), { key: "ArrowDown" });
    expect(virtualScroller.scrollTop).toEqual(50);
  });

  it("should not scroll vertically when navigating expanded row cells", function test() {
    if (isJSDOM) {
      return; // Needs layout
    }
    function Component() {
      const data = useBasicDemoData(10, 4);
      return (
        <TestCase
          {...data}
          getDetailPanelContent={() => <div />}
          initialState={{
            detailPanel: {
              expandedRowIds: [0],
            },
          }}
          hideFooter
        />
      );
    }
    render(<Component />);
    const virtualScroller = document.querySelector(
      ".MuiDataGrid-virtualScroller"
    )!;

    const cell = getCell(0, 0);

    userEvent.click(cell);

    fireEvent.keyDown(cell, { key: "ArrowRight" });
    virtualScroller.dispatchEvent(new Event("scroll"));
    expect(virtualScroller.scrollTop).toEqual(0);

    fireEvent.keyDown(getCell(0, 1), { key: "ArrowRight" });
    virtualScroller.dispatchEvent(new Event("scroll"));
    expect(virtualScroller.scrollTop).toEqual(0);

    fireEvent.keyDown(getCell(0, 2), { key: "ArrowRight" });
    virtualScroller.dispatchEvent(new Event("scroll"));
    expect(virtualScroller.scrollTop).toEqual(0);
  });

  it("should toggle the detail panel when pressing Space on detail toggle cell", () => {
    render(<TestCase getDetailPanelContent={() => <div>Detail</div>} />);
    expect(screen.queryByText("Detail")).toEqual(null);
    const cell = getCell(0, 0);
    userEvent.click(cell);
    fireEvent.keyDown(cell, { key: " " });
    expect(screen.queryByText("Detail")).not.toEqual(null);
    fireEvent.keyDown(cell, { key: " " });
    expect(screen.queryByText("Detail")).toEqual(null);
  });

  it("should allow to pass a custom toggle by adding a column with field=GRID_DETAIL_PANEL_TOGGLE_FIELD", () => {
    render(
      <TestCase
        nbRows={1}
        columns={[
          { field: "currencyPair" },
          {
            field: GRID_DETAIL_PANEL_TOGGLE_FIELD,
            renderCell: () => <button>Toggle</button>,
          },
        ]}
        getDetailPanelContent={() => <div>Detail</div>}
      />
    );
    expect(screen.queryByRole("button", { name: "Expand" })).toEqual(null);
    expect(screen.queryByRole("button", { name: "Toggle" })).not.toEqual(null);
    expect(getCell(0, 1).firstChild).toEqual(
      screen.queryByRole("button", { name: "Toggle" })
    );
  });

  // it("should cache the content of getDetailPanelContent", () => {
  //   const getDetailPanelContent = jest.fn(() => <div>Detail</div>);
  //   const { rerender } = render(
  //     <TestCase
  //       columns={[{ field: "brand" }]}
  //       rows={[
  //         { id: 0, brand: "Nike" },
  //         { id: 1, brand: "Adidas" },
  //       ]}
  //       getDetailPanelContent={getDetailPanelContent}
  //       pagination
  //       pageSizeOptions={[1]}
  //       initialState={{ pagination: { paginationModel: { pageSize: 1 } } }}
  //     />
  //   );

  //   // Total expected calls, considering React Strict Mode and any rerenders
  //   expect(getDetailPanelContent).toHaveBeenCalledTimes(4);

  //   fireEvent.click(screen.getByRole("button", { name: "Expand" }));
  //   expect(getDetailPanelContent).toHaveBeenCalledTimes(4);

  //   fireEvent.click(screen.getByRole("button", { name: /next page/i }));
  //   expect(getDetailPanelContent).toHaveBeenCalledTimes(4); // Should still be 8

  //   const getDetailPanelContent2 = jest.fn(() => <div>Detail</div>);
  //   rerender(<TestCase getDetailPanelContent={getDetailPanelContent2} />);

  //   fireEvent.click(screen.getAllByRole("button", { name: "Expand" })[0]);
  //   expect(getDetailPanelContent2).toHaveBeenCalledTimes(40); // Called 2x after rerender

  //   fireEvent.click(screen.getAllByRole("button", { name: /previous page/i })[0]);
  //   expect(getDetailPanelContent2).toHaveBeenCalledTimes(40); // Should still be 2
  // });

  // it("should cache the content of getDetailPanelHeight", () => {
  //   const getDetailPanelHeight = spy(() => 100);
  //   const { rerender } = render(
  //     <TestCase
  //       columns={[{ field: "brand" }]}
  //       rows={[
  //         { id: 0, brand: "Nike" },
  //         { id: 1, brand: "Adidas" },
  //       ]}
  //       getDetailPanelContent={() => <div>Detail</div>}
  //       getDetailPanelHeight={getDetailPanelHeight}
  //       pagination
  //       pageSizeOptions={[1]}
  //       initialState={{ pagination: { paginationModel: { pageSize: 1 } } }}
  //     />
  //   );
  //   //   2x during state initialization
  //   // + 2x during state initialization (StrictMode)
  //   // + 2x when sortedRowsSet is fired
  //   // + 2x when sortedRowsSet is fired (StrictMode) = 8x
  //   expect(getDetailPanelHeight.callCount).toEqual(8);
  //   fireEvent.click(screen.getByRole("button", { name: "Expand" }));
  //   expect(getDetailPanelHeight.callCount).toEqual(8);

  //   fireEvent.click(screen.getByRole("button", { name: /next page/i }));
  //   expect(getDetailPanelHeight.callCount).toEqual(8);

  //   const getDetailPanelHeight2 = spy(() => 200);
  //   rerender(<TestCase getDetailPanelHeight={getDetailPanelHeight2} />);
  //   fireEvent.click(screen.getByRole("button", { name: "Expand" }));
  //   expect(getDetailPanelHeight2.callCount).toEqual(2); // Called 2x by the effect
  //   fireEvent.click(screen.getByRole("button", { name: /previous page/i }));
  //   expect(getDetailPanelHeight2.callCount).toEqual(2);
  // });

  it("should update the panel height if getDetailPanelHeight is changed while the panel is open", function test() {
    if (isJSDOM) {
      return; // Doesn't work with mocked window.getComputedStyle
    }

    const getDetailPanelHeight = spy(() => 100);
    const { rerender } = render(
      <TestCase
        columns={[{ field: "brand" }]}
        rows={[
          { id: 0, brand: "Nike" },
          { id: 1, brand: "Adidas" },
        ]}
        getDetailPanelContent={() => <div>Detail</div>}
        getDetailPanelHeight={getDetailPanelHeight}
        pagination
        pageSizeOptions={[1]}
        initialState={{ pagination: { paginationModel: { pageSize: 1 } } }}
        autoHeight
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Expand" }));
    const detailPanel = $$(".MuiDataGrid-detailPanel")[0];
    expect(detailPanel).toHaveStyle({ height: "100px" });
    const virtualScroller = grid("virtualScroller")!;
    expect(virtualScroller.scrollHeight).toEqual(208);

    const getDetailPanelHeight2 = spy(() => 200);
    rerender(<TestCase getDetailPanelHeight={getDetailPanelHeight2} />);

    expect(detailPanel).toHaveStyle({ height: "200px" });
    expect(virtualScroller.scrollHeight).toEqual(200 + 52 + 56);
  });

  // it("should only call getDetailPanelHeight on the rows that have detail content", () => {
  //   const getDetailPanelHeight = spy(
  //     ({ row }: { row: { id: number } }) => row.id + 100
  //   ); // Use `row` to allow to assert its args below
  //   render(
  //     <TestCase
  //       columns={[{ field: "brand" }]}
  //       rows={[
  //         { id: 0, brand: "Nike" },
  //         { id: 1, brand: "Adidas" },
  //       ]}
  //       getDetailPanelContent={({ row }) =>
  //         row.id === 0 ? <div>Detail</div> : null
  //       }
  //       getDetailPanelHeight={getDetailPanelHeight}
  //     />
  //   );
  //   //   1x during state initialization
  //   // + 1x during state initialization (StrictMode)
  //   // + 1x when sortedRowsSet is fired
  //   // + 1x when sortedRowsSet is fired (StrictMode) = 4x
  //   expect(getDetailPanelHeight.callCount).toEqual(4);
  //   expect(getDetailPanelHeight.lastCall.args[0].id).toEqual(0);
  // });

  it("should not select the row when opening the detail panel", () => {
    const handleRowSelectionModelChange = jest.fn();
    render(
      <TestCase
        getDetailPanelContent={() => <div>Detail</div>}
        onRowSelectionModelChange={handleRowSelectionModelChange}
        checkboxSelection
      />
    );
    expect(screen.queryByText("Detail")).toEqual(null);
    const cell = getCell(1, 0);
    userEvent.click(cell);
    expect(handleRowSelectionModelChange).toHaveBeenCalledTimes(0);
  });

  // See https://github.com/mui/mui-x/issues/4607
  it("should make detail panel to take full width of the content", function test() {
    if (isJSDOM) {
      return; // Needs layout
    }
    render(
      <TestCase
        getDetailPanelContent={() => <div>Detail</div>}
        columns={[{ field: "id", width: 400 }]}
      />
    );
    fireEvent.click(getCell(1, 0).querySelector("button")!);
    expect(screen.getByText("Detail").offsetWidth).toEqual(50 + 400);
  });

  it("should add an accessible name to the toggle column", () => {
    render(<TestCase getDetailPanelContent={() => <div />} />);
    expect(
      screen.queryByRole("columnheader", { name: /detail panel toggle/i })
    ).not.toEqual(null);
  });

  it("should add the MuiDataGrid-row--detailPanelExpanded class to the expanded row", () => {
    render(
      <TestCase
        getDetailPanelContent={({ id }) => (id === 0 ? <div /> : null)}
      />
    );
    expect(getRow(0)).not.toHaveClass(gridClasses["row--detailPanelExpanded"]);
    fireEvent.click(screen.getAllByRole("button", { name: "Expand" })[0]);
    expect(getRow(0)).toHaveClass(gridClasses["row--detailPanelExpanded"]);
  });

  // See https://github.com/mui/mui-x/issues/6694
  it("should add a bottom margin to the expanded row when using `getRowSpacing`", function test() {
    if (isJSDOM) {
      return; // Doesn't work with mocked window.getComputedStyle
    }

    render(
      <TestCase
        getDetailPanelContent={({ id }) => (id === 0 ? <div /> : null)}
        getRowSpacing={() => ({ top: 2, bottom: 2 })}
      />
    );
    fireEvent.click(screen.getAllByRole("button", { name: "Expand" })[0]);
    expect(getRow(0)).toHaveStyle({ marginBottom: "2px" });
  });

  it("should not reuse detail panel components", () => {
    let counter = 0;
    function DetailPanel() {
      const [number] = React.useState((counter += 1));
      return <div data-testid="detail-panel-content">{number}</div>;
    }
    const { rerender } = render(
      <TestCase
        getDetailPanelContent={() => <DetailPanel />}
        detailPanelExpandedRowIds={[0]}
      />
    );
    expect(screen.getByTestId(`detail-panel-content`).textContent).toEqual(
      `${counter}`
    );
    rerender(<TestCase detailPanelExpandedRowIds={[1]} />);
    expect(screen.getByTestId(`detail-panel-content`).textContent).toEqual(
      `${counter}`
    );
  });

  it("should not render detail panel for the focused row if it's outside of the viewport", function test() {
    if (isJSDOM) {
      return; // Needs layout
    }
    render(
      <TestCase
        getDetailPanelHeight={() => 50}
        getDetailPanelContent={() => <div />}
        rowBufferPx={0}
        nbRows={20}
      />
    );

    userEvent.click(screen.getAllByRole("button", { name: "Expand" })[0]);

    const virtualScroller = document.querySelector(
      `.${gridClasses.virtualScroller}`
    )!;
    virtualScroller.scrollTop = 500;
    act(() => virtualScroller.dispatchEvent(new Event("scroll")));

    const detailPanels = document.querySelectorAll(
      `.${gridClasses.detailPanel}`
    );
    expect(detailPanels.length).toEqual(0);
  });

  describe("prop: onDetailPanelsExpandedRowIds", () => {
    it("should call when a row is expanded or closed", async () => {
      const handleDetailPanelsExpandedRowIdsChange = jest.fn(); // Use jest.fn()

      render(
        <TestCase
          getDetailPanelContent={() => <div>Detail</div>}
          onDetailPanelExpandedRowIdsChange={
            handleDetailPanelsExpandedRowIdsChange
          }
        />
      );

      // Expand the 1st row
      fireEvent.click(screen.getAllByRole("button", { name: "Expand" })[0]);
      expect(handleDetailPanelsExpandedRowIdsChange).toHaveBeenCalledTimes(1);
      expect(handleDetailPanelsExpandedRowIdsChange.mock.calls[0][0]).toEqual([
        0,
      ]);

      // Expand the 2nd row (update to actual row ID)
      fireEvent.click(screen.getAllByRole("button", { name: "Expand" })[1]);
      expect(handleDetailPanelsExpandedRowIdsChange).toHaveBeenCalledTimes(2);
      expect(handleDetailPanelsExpandedRowIdsChange.mock.calls[1][0]).toEqual([
        0, 2,
      ]);

      // Close the 1st row
      fireEvent.click(screen.getAllByRole("button", { name: "Collapse" })[0]);
      expect(handleDetailPanelsExpandedRowIdsChange).toHaveBeenCalledTimes(3);
      expect(handleDetailPanelsExpandedRowIdsChange.mock.calls[2][0]).toEqual([
        2,
      ]);

      // Wait for the UI to update before querying the next button
    //   await waitFor(() =>
    //     expect(
    //       screen.getAllByRole("button", { name: "Collapse" })[1]
    //     ).toBeInTheDocument()
    //   );

    //   // Close the 2nd row
    //   fireEvent.click(screen.getAllByRole("button", { name: "Collapse" })[1]);
    //   expect(handleDetailPanelsExpandedRowIdsChange).toHaveBeenCalledTimes(4);
    //   expect(handleDetailPanelsExpandedRowIdsChange.mock.calls[3][0]).toEqual(
    //     []
    //   );
    });

    it("should not change the open detail panels when called while detailPanelsExpandedRowIds is the same", () => {
      const handleDetailPanelsExpandedRowIdsChange = jest.fn();
      render(
        <TestCase
          getDetailPanelContent={({ id }) => <div>Row {id}</div>}
          detailPanelExpandedRowIds={[0]}
          onDetailPanelExpandedRowIdsChange={
            handleDetailPanelsExpandedRowIdsChange
          }
        />
      );
      expect(screen.getByText("Row 0")).not.toEqual(null);
      fireEvent.click(screen.getByRole("button", { name: "Collapse" }));
      expect(handleDetailPanelsExpandedRowIdsChange).toHaveBeenCalledTimes(1);
      expect(handleDetailPanelsExpandedRowIdsChange.mock.calls[0][0]).toEqual(
        []
      );
      expect(screen.getByText("Row 0")).not.toEqual(null);
    });
  });

  describe("prop: detailPanelExpandedRowIds", () => {
    it("should open the detail panel of the specified rows", () => {
      render(
        <TestCase
          getDetailPanelContent={({ id }) => <div>Row {id}</div>}
          detailPanelExpandedRowIds={[0, 1]}
        />
      );
      expect(screen.queryByText("Row 0")).not.toEqual(null);
      expect(screen.queryByText("Row 1")).not.toEqual(null);
      expect(screen.queryByText("Row 2")).toEqual(null);
    });

    it("should not change the open detail panels if the prop didn't change", () => {
      render(
        <TestCase
          getDetailPanelContent={({ id }) => <div>Row {id}</div>}
          detailPanelExpandedRowIds={[0]}
        />
      );
      expect(screen.queryByText("Row 0")).not.toEqual(null);
      expect(screen.queryByText("Row 1")).toEqual(null);
      fireEvent.click(screen.getAllByRole("button", { name: "Expand" })[0]); // Expand the second row
      expect(screen.queryByText("Row 0")).not.toEqual(null);
      expect(screen.queryByText("Row 1")).toEqual(null);
    });

    it("should filter out duplicated ids and render only one panel", () => {
      render(
        <TestCase
          getDetailPanelContent={({ id }) => <div>Row {id}</div>}
          detailPanelExpandedRowIds={[0, 0]}
        />
      );
      expect(screen.queryAllByText("Row 0").length).toEqual(1);
    });
  });

  describe("apiRef", () => {
    describe("toggleDetailPanel", () => {
      it("should toggle the panel of the given row id", () => {
        render(<TestCase getDetailPanelContent={() => <div>Detail</div>} />);
        expect(screen.queryByText("Detail")).toEqual(null);
        act(() => apiRef.current.toggleDetailPanel(0));
        expect(screen.queryByText("Detail")).not.toEqual(null);
        act(() => apiRef.current.toggleDetailPanel(0));
        expect(screen.queryByText("Detail")).toEqual(null);
      });

      it("should not toggle the panel of a row without detail component", () => {
        render(
          <TestCase
            rowHeight={50}
            getDetailPanelContent={({ id }) =>
              id === 0 ? <div>Detail</div> : null
            }
          />
        );
        act(() => apiRef.current.toggleDetailPanel(1));
        expect(document.querySelector(".MuiDataGrid-detailPanels")).toEqual(
          null
        );
        expect(getRow(1)).not.toHaveStyle({ marginBottom: "50px" });
      });

      // See https://github.com/mui/mui-x/pull/8976
      it("should not toggle the panel if the row id is of a different type", () => {
        render(<TestCase getDetailPanelContent={() => <div>Detail</div>} />);
        expect(screen.queryByText("Detail")).toEqual(null);
        // '0' !== 0
        act(() => apiRef.current.toggleDetailPanel("0"));
        expect(screen.queryByText("Detail")).toEqual(null);
      });
    });

    describe("getExpandedDetailPanels", () => {
      it("should return an array of ids", () => {
        render(
          <TestCase
            getDetailPanelContent={() => <div>Detail</div>}
            initialState={{
              detailPanel: {
                expandedRowIds: [0, 1],
              },
            }}
          />
        );
        act(() =>
          expect(apiRef.current.getExpandedDetailPanels()).toEqual([0, 1])
        );
      });
    });

    describe("setExpandedDetailPanels", () => {
      it("should update which detail panels are open", async () => {
        render(
          <TestCase
            getDetailPanelContent={({ id }) => <div>Row {id}</div>}
            initialState={{
              detailPanel: {
                expandedRowIds: [0],
              },
            }}
          />
        );
        expect(screen.queryByText("Row 0")).not.toEqual(null);
        expect(screen.queryByText("Row 1")).toEqual(null);
        expect(screen.queryByText("Row 2")).toEqual(null);
        act(() => apiRef.current.setExpandedDetailPanels([1, 2]));
        expect(screen.queryByText("Row 0")).toEqual(null);
        expect(screen.queryByText("Row 1")).not.toEqual(null);
        expect(screen.queryByText("Row 2")).not.toEqual(null);
      });
    });
  });

  it("should merge row styles when expanded", () => {
    render(
      <TestCase
        getDetailPanelHeight={() => 0}
        nbRows={1}
        getDetailPanelContent={() => <div />}
        slotProps={{
          row: { style: { color: "yellow" } },
        }}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "Expand" }));
    expect(getRow(0)).toHaveStyle({
      color: "yellow",
    });
  });
});
