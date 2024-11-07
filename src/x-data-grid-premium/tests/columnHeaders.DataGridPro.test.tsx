import * as React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { gridClasses } from "@mui/x-data-grid-pro";
import userEvent from "@testing-library/user-event";
import { DataGridPremium } from "../DataGridPremium/DataGridPremium";
import { DataGridPremiumProps } from "../models/dataGridPremiumProps";
import { getColumnHeaderCell, getColumnValues } from "./helperFn";

const isJSDOM = /jsdom/.test(window.navigator.userAgent);
const fs = require("fs");
const path = require("path");

describe("<DataGridPro /> - Column headers", () => {
  const baselineProps = {
    autoHeight: isJSDOM,
    disableColumnResize: false,
    rows: [
      {
        id: 0,
        brand: "Nike",
        foundationYear: 1964,
      },
      {
        id: 1,
        brand: "Adidas",
        foundationYear: 1949,
      },
      {
        id: 2,
        brand: "Puma",
        foundationYear: 1948,
      },
    ],
  };

  it("should not scroll the column headers when a column is focused", function test() {
    if (isJSDOM) {
      return; // JSDOM version of .focus() doesn't scroll
    }
    render(
      <div style={{ width: 102, height: 500 }}>
        <DataGridPremium
          {...baselineProps}
          columns={[{ field: "brand" }, { field: "foundationYear" }]}
        />
      </div>
    );
    const columnHeaders = document.querySelector(".MuiDataGrid-columnHeaders")!;
    expect(columnHeaders.scrollLeft).toEqual(0);
    const columnCell = getColumnHeaderCell(0);
    columnCell.focus();
    fireEvent.keyDown(columnCell, { key: "End" });
    expect(columnHeaders.scrollLeft).toEqual(0);
  });

  describe("GridColumnHeaderMenu", () => {
    it("should close the menu when the window is scrolled", async () => {
      render(
        <div style={{ width: 300, height: 200 }}>
          <DataGridPremium {...baselineProps} columns={[{ field: "brand" }]} />
        </div>
      );
      const columnCell = getColumnHeaderCell(0);
      const menuIconButton = columnCell.querySelector(
        'button[aria-label="Menu"]'
      )!;
      fireEvent.click(menuIconButton);
      expect(screen.queryByRole("menu")).not.toEqual(null);
      const virtualScroller = document.querySelector(
        ".MuiDataGrid-virtualScroller"
      )!;
      fireEvent.wheel(virtualScroller);
      await waitFor(() => {
        expect(screen.queryByRole("menu")).toEqual(null);
      });
    });

    it("should not close the menu when updating the rows prop", () => {
      function Test(props: Partial<DataGridPremiumProps>) {
        return (
          <div style={{ width: 300, height: 500 }}>
            <DataGridPremium
              {...baselineProps}
              columns={[{ field: "brand" }]}
              {...props}
            />
          </div>
        );
      }
      const { rerender } = render(<Test />);
      const columnCell = getColumnHeaderCell(0);
      const menuIconButton = columnCell.querySelector(
        'button[aria-label="Menu"]'
      )!;
      fireEvent.click(menuIconButton);
      jest.useFakeTimers();
      expect(screen.queryByRole("menu")).not.toEqual(null);
      rerender(<Test rows={[...baselineProps.rows]} />);
      jest.useFakeTimers();
      expect(screen.queryByRole("menu")).not.toEqual(null);
    });

    it("should not modify column order when menu is clicked", () => {
      render(
        <div style={{ width: 300, height: 500 }}>
          <DataGridPremium {...baselineProps} columns={[{ field: "brand" }]} />
        </div>
      );
      expect(getColumnValues(0)).toEqual(["Nike", "Adidas", "Puma"]);
      const columnCell = getColumnHeaderCell(0);
      const menuIconButton = columnCell.querySelector(
        'button[aria-label="Menu"]'
      )!;
      fireEvent.click(menuIconButton);
      jest.useFakeTimers();
      expect(screen.queryByRole("menu")).not.toEqual(null);
      fireEvent.click(screen.getByRole("menu"));
      expect(getColumnValues(0)).toEqual(["Nike", "Adidas", "Puma"]);
    });

    it("should sort column when sort by Asc is clicked", () => {
      render(
        <div style={{ width: 300, height: 500 }}>
          <DataGridPremium {...baselineProps} columns={[{ field: "brand" }]} />
        </div>
      );
      const columnCell = getColumnHeaderCell(0);
      const menuIconButton = columnCell.querySelector(
        'button[aria-label="Menu"]'
      )!;
      expect(getColumnValues(0)).toEqual(["Nike", "Adidas", "Puma"]);
      fireEvent.click(menuIconButton);
      jest.useFakeTimers();
      expect(screen.queryByRole("menu")).not.toEqual(null);
      fireEvent.click(screen.getByRole("menuitem", { name: "Sort by ASC" }));
      expect(getColumnValues(0)).toEqual(["Adidas", "Nike", "Puma"]);
    });

    it("should close the menu of a column when resizing this column", async () => {
      render(
        <div style={{ width: 300, height: 500 }}>
          <DataGridPremium
            {...baselineProps}
            columns={[
              { field: "brand", resizable: true },
              { field: "foundationYear", resizable: true },
            ]}
          />
        </div>
      );
      const columnCell = getColumnHeaderCell(0);
      const menuIconButton = columnCell.querySelector(
        'button[aria-label="Menu"]'
      )!;
      fireEvent.click(menuIconButton);
      expect(screen.queryByRole("menu")).not.toEqual(null);
      const separator = columnCell.querySelector(".MuiDataGrid-iconSeparator")!;
      fireEvent.mouseDown(separator);
      // TODO remove mouseUp once useGridColumnReorder will handle cleanup properly
      fireEvent.mouseUp(separator);
      await waitFor(() => {
        expect(screen.queryByRole("menu")).toEqual(null);
      });
    });

    it("should close the menu of a column when resizing another column", async () => {
      render(
        <div style={{ width: 300, height: 500 }}>
          <DataGridPremium
            {...baselineProps}
            columns={[
              { field: "brand", resizable: true },
              { field: "foundationYear", resizable: true },
            ]}
          />
        </div>
      );
      const columnWithMenuCell = getColumnHeaderCell(0);
      const columnToResizeCell = getColumnHeaderCell(1);
      const menuIconButton = columnWithMenuCell.querySelector(
        'button[aria-label="Menu"]'
      )!;
      fireEvent.click(menuIconButton);
      expect(screen.queryByRole("menu")).not.toEqual(null);
      const separator = columnToResizeCell.querySelector(
        `.${gridClasses["columnSeparator--resizable"]}`
      )!;
      fireEvent.mouseDown(separator);
      await waitFor(() => {
        expect(screen.queryByRole("menu")).toEqual(null);
      });
      // cleanup
      fireEvent.mouseUp(separator);
    });

    it("should close the menu of a column when pressing the Escape key", async () => {
      render(
        <div style={{ width: 300, height: 500 }}>
          <DataGridPremium {...baselineProps} columns={[{ field: "brand" }]} />
        </div>
      );
      const columnCell = getColumnHeaderCell(0);
      const menuIconButton = columnCell.querySelector(
        'button[aria-label="Menu"]'
      )!;
      fireEvent.click(menuIconButton);
      expect(screen.queryByRole("menu")).not.toEqual(null);
      /* eslint-disable material-ui/disallow-active-element-as-key-event-target */
      fireEvent.keyDown(document.activeElement!, { key: "Escape" });
      await waitFor(() => {
        expect(screen.queryByRole("menu")).toEqual(null);
      });
    });

    it("should remove the MuiDataGrid-menuOpen CSS class only after the transition has ended",async () => {
      render(
        <div style={{ width: 300, height: 500 }}>
          <DataGridPremium {...baselineProps} columns={[{ field: "brand" }]} />
        </div>
      );
      const columnCell = getColumnHeaderCell(0);
      const menuIconButton = columnCell.querySelector(
        'button[aria-label="Menu"]'
      )!;
      fireEvent.click(menuIconButton);
      expect(menuIconButton?.parentElement).toHaveClass(gridClasses.menuIcon);
      fireEvent.keyDown(document.activeElement!, { key: "Escape" });
      expect(menuIconButton?.parentElement).toHaveClass(gridClasses.menuIcon);
      await waitFor(() => {
        expect(menuIconButton?.parentElement).not.toHaveClass(
          gridClasses.menuOpen
        );
      });
    });

    it("should restore focus to the column header when dismissing the menu by selecting any item",async () => {
      function Test(props: Partial<DataGridPremiumProps>) {
        return (
          <div style={{ width: 300, height: 500 }}>
            <DataGridPremium
              {...baselineProps}
              columns={[{ field: "brand" }]}
              initialState={{
                sorting: { sortModel: [{ field: "brand", sort: "asc" }] },
              }}
              {...props}
            />
          </div>
        );
      }
      render(<Test />);
      const columnCell = getColumnHeaderCell(0);
      const menuIconButton = columnCell.querySelector(
        'button[aria-label="Menu"]'
      )!;
      fireEvent.click(menuIconButton);
      const menu = screen.getByRole("menu");
      const descMenuitem = screen.getByRole("menuitem", {
        name: /sort by desc/i,
      });
      expect(menu).toHaveFocus();
      fireEvent.keyDown(menu, { key: "ArrowDown" });
      expect(descMenuitem).toHaveFocus();
      fireEvent.keyDown(descMenuitem, { key: "Enter" });
      expect(columnCell).toHaveFocus();
    });

    it("should restore focus to the column header when dismissing the menu by selecting any item", async () => {
    render(
        <div style={{ width: 300, height: 500 }}>
          <DataGridPremium {...baselineProps} columns={[{ field: "brand" }]} />
        </div>
      );
      const columnCell = getColumnHeaderCell(0);
      const menuIconButton = columnCell.querySelector('button[aria-label="Menu"]')!;
      fireEvent.click(menuIconButton);
      const menu = screen.getByRole('menu');
      expect(menu).toHaveFocus();
      fireEvent.keyDown(menu, { key: 'Escape' });
      expect(menu).not.toHaveFocus();
      expect(columnCell).toHaveFocus();
    });
  });
});
