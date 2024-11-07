import * as React from "react";
import { render, act } from "@testing-library/react";
import { GridToolbar } from "@mui/x-data-grid";
import { DataGridPremium as DataGrid } from "../DataGridPremium/DataGridPremium";
import { DataGridPremiumProps as DataGridProps } from "../models/dataGridPremiumProps";
import { GridApi } from "../typeOverloads/reexports";
import { useGridApiRef } from "../hooks/utils/useGridApiRef";
import { getColumnValues } from "./helperFn";

const isJSDOM = /jsdom/.test(window.navigator.userAgent);

describe("<DataGrid /> - Quick filter", () => {
  const baselineProps = {
    autoHeight: isJSDOM,
    disableVirtualization: true,
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
    columns: [{ field: "brand" }],
  };

  let apiRef: React.MutableRefObject<GridApi>;

  function TestCase(props: Partial<DataGridProps>) {
    apiRef = useGridApiRef();

    return (
      <div style={{ width: 300, height: 300 }}>
        <DataGrid
          {...baselineProps}
          apiRef={apiRef}
          slots={{ toolbar: GridToolbar }}
          disableColumnSelector
          disableDensitySelector
          disableColumnFilter
          {...props}
          slotProps={{
            ...props?.slotProps,
            toolbar: {
              showQuickFilter: true,
              ...props?.slotProps?.toolbar,
            },
          }}
        />
      </div>
    );
  }

  // https://github.com/mui/mui-x/issues/9677
  it("should not fail when adding a grouping criterion", () => {
    const { rerender } = render(
      <TestCase
        rows={[
          {
            id: 1,
            company: "20th Century Fox",
            director: "James Cameron",
            year: 1999,
            title: "Titanic",
          },
        ]}
        columns={[
          { field: "company" },
          { field: "director" },
          { field: "year" },
          { field: "title" },
        ]}
        initialState={{
          rowGrouping: {
            model: ["company"],
          },
          aggregation: {
            model: {
              director: "size",
            },
          },
        }}
      />
    );

    act(() => apiRef.current.addRowGroupingCriteria("year"));

    rerender(
      <TestCase
        rows={[
          {
            id: 1,
            company: "20th Century Fox",
            director: "James Cameron",
            year: 1999,
            title: "Titanic",
          },
        ]}
        columns={[
          { field: "company" },
          { field: "director" },
          { field: "year" },
          { field: "title" },
        ]}
        initialState={{
          rowGrouping: {
            model: ["company"],
          },
          aggregation: {
            model: {
              director: "size",
            },
          },
        }}
        filterModel={{
          items: [],
          quickFilterValues: ["Cameron"],
        }}
      />
    );

    expect(getColumnValues(0)).toEqual(["20th Century Fox (1)", ""]);
  });
});
