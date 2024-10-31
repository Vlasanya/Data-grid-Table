// import { createRenderer, act } from '@mui/internal-test-utils';
import { render, act } from "@testing-library/react";
import { getColumnValues } from "../helperFn";
import * as React from "react";
// import { expect } from 'chai';
// import { DataGridPremium, GridApi, useGridApiRef } from '@mui/x-data-grid-pro';
import { GridApi } from "../../typeOverloads/reexports";
import { useGridApiRef } from "../../hooks/utils/useGridApiRef";
import { DataGridPremium } from "../../DataGridPremium/DataGridPremium";
import { useBasicDemoData } from "../test/utils/basic-data-service";
// import { GridApiPro } from "../../models/gridApiPro";

describe("<DataGridPremium /> - Pagination", () => {
  // const { render, clock } = createRenderer({ clock: 'fake' });

  describe("setPage", () => {
    it("should apply valid value", () => {
      let apiRef: React.MutableRefObject<GridApi>;

      function GridTest() {
        const basicData = useBasicDemoData(20, 2);
        apiRef = useGridApiRef();

        return (
          <div style={{ width: 300, height: 300 }}>
            <DataGridPremium
              {...basicData}
              apiRef={apiRef}
              pagination
              initialState={{
                pagination: { paginationModel: { pageSize: 1 } },
              }}
              pageSizeOptions={[1]}
            />
          </div>
        );
      }

      render(<GridTest />);

      expect(getColumnValues(0)).toEqual(["0"]);
      act(() => {
        apiRef.current.setPage(1);
      });
      expect(getColumnValues(0)).toEqual(["1"]);
    });

    it("should apply last page if trying to go to a non-existing page", () => {
      let apiRef: React.MutableRefObject<GridApi>;
      function GridTest() {
        const basicData = useBasicDemoData(20, 2);
        apiRef = useGridApiRef();

        return (
          <div style={{ width: 300, height: 300 }}>
            <DataGridPremium
              {...basicData}
              apiRef={apiRef}
              pagination
              initialState={{
                pagination: { paginationModel: { pageSize: 1 } },
              }}
              pageSizeOptions={[1]}
            />
          </div>
        );
      }

      render(<GridTest />);

      expect(getColumnValues(0)).toEqual(["0"]);
      act(() => {
        apiRef.current.setPage(50);
      });
      expect(getColumnValues(0)).toEqual(["19"]);
    });
  });

  describe("setPageSize", () => {
    it("should apply value", () => {
      let apiRef: React.MutableRefObject<GridApi>;
      function GridTest() {
        const basicData = useBasicDemoData(20, 2);
        apiRef = useGridApiRef();

        return (
          <div style={{ width: 300, height: 300 }}>
            <DataGridPremium
              {...basicData}
              apiRef={apiRef}
              initialState={{
                pagination: { paginationModel: { pageSize: 5 } },
              }}
              pageSizeOptions={[2, 5]}
              pagination
              disableVirtualization
            />
          </div>
        );
      }

      render(<GridTest />);
      jest.useFakeTimers();

      expect(getColumnValues(0)).toEqual(["0", "1", "2", "3", "4"]);
      act(() => {
        apiRef.current.setPageSize(2);
      });

      expect(getColumnValues(0)).toEqual(["0", "1"]);
    });
  });

  it("should log an error if rowCount is used with client-side pagination", () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  
    render(
      <div style={{ width: 300, height: 300 }}>
        <DataGridPremium
          rows={[]}
          columns={[]}
          paginationMode="client"
          rowCount={100}
        />
      </div>
    );
  
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        'MUI X: Usage of the `rowCount` prop with client side pagination (`paginationMode="client"`) has no effect. `rowCount` is only meant to be used with `paginationMode="server"`.'
      )
    );
  
    consoleErrorSpy.mockRestore();
  });  
});
