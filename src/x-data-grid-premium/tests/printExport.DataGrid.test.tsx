import * as React from "react";
import { GridToolbar } from "@mui/x-data-grid";
import { GridApi } from "../typeOverloads/reexports";
import { DataGridPremiumProps } from "../models/dataGridPremiumProps";
import { useGridApiRef } from "../hooks/utils/useGridApiRef";
import { DataGridPremium } from "../DataGridPremium/DataGridPremium";
import { getBasicGridData } from "./basic-data-service";
import { render, screen, fireEvent, act } from "@testing-library/react";

describe("<DataGridPremium /> - Print export", () => {
  const NB_ROWS = 2;
  const defaultData = getBasicGridData(NB_ROWS, 2);
  let apiRef: React.MutableRefObject<GridApi>;

  const baselineProps = {
    ...defaultData,
    // A hack to remove the warning on print
    pageSizeOptions: [NB_ROWS, 100],
  };

  function Test(props: Partial<DataGridPremiumProps>) {
    apiRef = useGridApiRef();

    return (
      <div style={{ width: 300, height: 300 }}>
        <DataGridPremium {...baselineProps} apiRef={apiRef} {...props} />
      </div>
    );
  }

  const allBooleanConfigurations = [
    {
      printVisible: true,
      gridVisible: true,
    },
    {
      printVisible: false,
      gridVisible: true,
    },
    {
      printVisible: true,
      gridVisible: false,
    },
    {
      printVisible: false,
      gridVisible: false,
    },
  ];

  describe("Export toolbar", () => {
    jest.useRealTimers();

    it("should display print button by default", () => {
      render(<Test slots={{ toolbar: GridToolbar }} />);
      fireEvent.click(screen.getByRole("button", { name: "Export" }));
      expect(screen.queryByRole("menu")).not.toEqual(null);
      expect(screen.queryByRole("menuitem", { name: "Print" })).not.toEqual(
        null
      );
    });

    it("should disable print export when passing `printOptions.disableToolbarButton`", () => {
      render(
        <Test
          slots={{ toolbar: GridToolbar }}
          slotProps={{
            toolbar: { printOptions: { disableToolbarButton: true } },
          }}
        />
      );
      fireEvent.click(screen.getByRole("button", { name: "Export" }));
      expect(screen.queryByRole("menu")).not.toEqual(null);
      expect(screen.queryByRole("menuitem", { name: "Print" })).toEqual(null);
    });
  });

  describe("column visibility with initialState", () => {
    allBooleanConfigurations.forEach(({ printVisible, gridVisible }) => {
      it(`should have 'currencyPair' ${printVisible ? "'visible'" : "'hidden'"} in print and ${
        gridVisible ? "'visible'" : "'hidden'"
      } in screen`, async () => {
        const onColumnVisibilityModelChange = jest.fn();

        render(
          <Test
            onColumnVisibilityModelChange={onColumnVisibilityModelChange}
            initialState={{
              columns: {
                columnVisibilityModel: {
                  currencyPair: gridVisible,
                  id: false,
                },
              },
            }}
          />
        );

        expect(onColumnVisibilityModelChange.mock.calls.length).toBe(0);

        await act(() =>
          apiRef.current.exportDataAsPrint({
            fields: printVisible ? ["currencyPair", "id"] : ["id"],
          })
        );

        expect(onColumnVisibilityModelChange.mock.calls.length).toBe(2);
        // verify column visibility has been set
        expect(onColumnVisibilityModelChange.mock.calls[0][0]).toEqual({
          currencyPair: printVisible,
          id: true,
        });

        // verify column visibility has been restored
        expect(onColumnVisibilityModelChange.mock.calls[1][0]).toEqual(
          {
            currencyPair: gridVisible,
            id: false,
          }
        );
      });
    });
  });

  describe("columns to print", () => {
    it(`should ignore 'allColumns' if 'fields' is provided`, async () => {
      const onColumnVisibilityModelChange = jest.fn();

      render(
        <Test onColumnVisibilityModelChange={onColumnVisibilityModelChange} />
      );

      expect(onColumnVisibilityModelChange.mock.calls).toEqual([]);

      await act(() =>
        apiRef.current.exportDataAsPrint({ fields: ["id"], allColumns: true })
      );

      expect(onColumnVisibilityModelChange.mock.calls[0][0]).toEqual({
        currencyPair: false,
        id: true,
      });
    });

    it(`should ignore 'disableExport' if 'fields' is provided`, async () => {
      const onColumnVisibilityModelChange = jest.fn();

      render(
        <Test
          onColumnVisibilityModelChange={onColumnVisibilityModelChange}
          columns={[
            { field: "currencyPair" },
            { field: "id", disableExport: true },
          ]}
        />
      );

      expect(onColumnVisibilityModelChange.mock.calls).toEqual([]);

      await act(() =>
        apiRef.current.exportDataAsPrint({ fields: ["id"], allColumns: true })
      );

      expect(onColumnVisibilityModelChange.mock.calls[0][0]).toEqual({
        currencyPair: false,
        id: true,
      });
    });

    it(`should apply 'disableExport' even if 'allColumns' is set`, async () => {
      const onColumnVisibilityModelChange = jest.fn();

      render(
        <Test
          onColumnVisibilityModelChange={onColumnVisibilityModelChange}
          columns={[
            { field: "currencyPair" },
            { field: "id", disableExport: true },
          ]}
        />
      );

      expect(onColumnVisibilityModelChange.mock.calls).toEqual([]);

      await act(() => apiRef.current.exportDataAsPrint({ allColumns: true }));

      expect(onColumnVisibilityModelChange.mock.calls[0][0]).toEqual({
        currencyPair: true,
        id: false,
      });
    });

    it(`should print hidden columns if 'allColumns' set to true`, async () => {
      const onColumnVisibilityModelChange = jest.fn();

      render(
        <Test
          columnVisibilityModel={{ id: false }}
          onColumnVisibilityModelChange={onColumnVisibilityModelChange}
          columns={[{ field: "currencyPair" }, { field: "id" }]}
        />
      );

      expect(onColumnVisibilityModelChange.mock.calls).toEqual([]);

      await act(() => apiRef.current.exportDataAsPrint({ allColumns: true }));

      expect(onColumnVisibilityModelChange.mock.calls[0][0]).toEqual({
        currencyPair: true,
        id: true,
      });
    });
  });
});
