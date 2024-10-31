import {
  getDefaultGridFilterModel,
  GridFilterModel,
  GridLogicOperator,
  GridPreferencePanelsValue,
  GridRowModel,
  GetColumnForNewFilterArgs,
  FilterColumnsArgs,
  GridToolbar,
  gridExpandedSortedRowEntriesSelector,
  gridClasses,
  GridColDef,
  getGridStringOperators,
} from "@mui/x-data-grid";
import { DATA_GRID_PRO_PROPS_DEFAULT_VALUES } from "../../DataGridPremium/useDataGridProProps";
import { GridApi } from "../../typeOverloads/reexports";
import { useGridApiRef } from "../../hooks/utils/useGridApiRef";
import { DataGridPremium } from "../../DataGridPremium/DataGridPremium";
import { DataGridPremiumProps } from "../../models/dataGridPremiumProps";
// import { createRenderer, fireEvent, screen, act, within } from '@mui/internal-test-utils';
import { render, fireEvent, screen, act, within } from "@testing-library/react";
// import { expect } from 'chai';
import * as React from "react";
// import { spy } from 'sinon';
import {
  getColumnHeaderCell,
  getColumnValues,
  getSelectInput,
  grid,
} from "../helperFn";

const SUBMIT_FILTER_STROKE_TIME =
  DATA_GRID_PRO_PROPS_DEFAULT_VALUES.filterDebounceMs;

const isJSDOM = /jsdom/.test(window.navigator.userAgent);

describe("<DataGridPremium /> - Filter", () => {
  // const { clock, render } = createRenderer({ clock: 'fake' });

  let apiRef: React.MutableRefObject<GridApi>;

  const baselineProps = {
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
    columns: [{ field: "brand" }],
  };

  function TestCase(props: Partial<DataGridPremiumProps>) {
    const { rows, ...other } = props;
    apiRef = useGridApiRef();
    return (
      <div style={{ width: 300, height: 300 }}>
        <DataGridPremium
          apiRef={apiRef}
          {...baselineProps}
          rows={rows || baselineProps.rows}
          disableColumnFilter={false}
          {...other}
        />
      </div>
    );
  }

  const filterModel = {
    items: [
      {
        field: "brand",
        value: "a",
        operator: "contains",
      },
    ],
  };

  describe("api method: `upsertFilterItems`", () => {
    it("should be able to add multiple filters", () => {
      render(<TestCase getRowId={(row) => row.brand} />);

      act(() =>
        apiRef.current.upsertFilterItems([
          {
            field: "brand",
            value: "i",
            operator: "contains",
            id: 1,
          },
          {
            field: "brand",
            value: "as",
            operator: "contains",
            id: 2,
          },
        ])
      );
      expect(getColumnValues(0)).toEqual(["Adidas"]);
    });

    // See https://github.com/mui/mui-x/issues/11793
    it("should not remove filters which are not passed to `upsertFilterItems`", () => {
      render(<TestCase getRowId={(row) => row.brand} />);

      act(() =>
        apiRef.current.upsertFilterItems([
          {
            field: "brand",
            value: "i",
            operator: "contains",
            id: 1,
          },
          {
            field: "brand",
            value: "as",
            operator: "contains",
            id: 2,
          },
        ])
      );
      expect(getColumnValues(0)).toEqual(["Adidas"]);
      act(() =>
        apiRef.current.upsertFilterItems([
          {
            field: "brand",
            value: "",
            operator: "contains",
            id: 2,
          },
        ])
      );
      expect(getColumnValues(0)).toEqual(["Nike", "Adidas"]);
    });
  });

  it("slotProps `filterColumns` and `getColumnForNewFilter` should allow custom filtering", () => {
    const filterColumns = ({
      field,
      columns,
      currentFilters,
    }: FilterColumnsArgs) => {
      // remove already filtered fields from list of columns
      const filteredFields = currentFilters?.map((item) => item.field);
      return columns
        .filter(
          (colDef) =>
            colDef.filterable &&
            (colDef.field === field || !filteredFields.includes(colDef.field))
        )
        .map((column) => column.field);
    };

    const getColumnForNewFilter = ({
      currentFilters,
      columns,
    }: GetColumnForNewFilterArgs) => {
      const filteredFields = currentFilters?.map(({ field }) => field);
      const columnForNewFilter = columns
        .filter(
          (colDef) =>
            colDef.filterable && !filteredFields.includes(colDef.field)
        )
        .find((colDef) => colDef.filterOperators?.length);
      return columnForNewFilter?.field ?? null;
    };

    render(
      <TestCase
        initialState={{
          preferencePanel: {
            open: true,
            openedPanelValue: GridPreferencePanelsValue.filters,
          },
        }}
        slots={{ toolbar: GridToolbar }}
        slotProps={{
          filterPanel: {
            filterFormProps: {
              filterColumns,
            },
            getColumnForNewFilter,
          },
        }}
      />
    );
    const addButton = screen.getByRole("button", { name: /Add Filter/i });
    fireEvent.click(addButton);
    // Shouldn't allow adding multi-filters for same column
    // Since we have only one column, filter shouldn't be applied onClick
    const filterForms = document.querySelectorAll(`.MuiDataGrid-filterForm`);
    expect(filterForms).toHaveLength(1);
  });

  // it("should call `getColumnForNewFilter` when filters are added", () => {
  //   const getColumnForNewFilter = jest.fn();
  //   render(
  //     <TestCase
  //       initialState={{
  //         preferencePanel: {
  //           open: true,
  //           openedPanelValue: GridPreferencePanelsValue.filters,
  //         },
  //       }}
  //       slots={{ toolbar: GridToolbar }}
  //       slotProps={{
  //         filterPanel: {
  //           getColumnForNewFilter,
  //         },
  //       }}
  //     />
  //   );
  //   expect(getColumnForNewFilter.mock.calls.length).toEqual(2);
  //   const addButton = screen.getByRole("button", { name: /Add Filter/i });
  //   fireEvent.click(addButton);
  //   expect(getColumnForNewFilter.mock.calls.length).toEqual(4);
  //   fireEvent.click(addButton);
  //   expect(getColumnForNewFilter.mock.calls.length).toEqual(6);
  // });

  it("should pass columns filtered by `filterColumns` to filters column list", () => {
    const filterColumns = () => ["testField"];
    render(
      <TestCase
        initialState={{
          preferencePanel: {
            open: true,
            openedPanelValue: GridPreferencePanelsValue.filters,
          },
        }}
        slots={{ toolbar: GridToolbar }}
        slotProps={{
          filterPanel: {
            filterFormProps: {
              filterColumns,
            },
          },
        }}
        columns={[...baselineProps.columns, { field: "testField" }]}
      />
    );

    const select = screen.getByRole("combobox", { name: "Columns" });
    fireEvent.mouseDown(select);
    const listbox = screen.getByRole("listbox", { name: "Columns" });
    const availableColumns = within(listbox).getAllByRole("option");
    expect(availableColumns.length).toEqual(1);
  });

  it("should apply the filterModel prop correctly", () => {
    render(<TestCase filterModel={filterModel} />);

    expect(getColumnValues(0)).toEqual(["Adidas", "Puma"]);
  });

  it("should not apply items that are incomplete with AND operator", () => {
    render(
      <TestCase
        filterModel={{
          items: [
            {
              id: 1,
              field: "brand",
              value: "a",
              operator: "contains",
            },
            {
              id: 2,
              field: "brand",
              operator: "contains",
            },
          ],
          logicOperator: GridLogicOperator.And,
        }}
      />
    );
    expect(getColumnValues(0)).toEqual(["Adidas", "Puma"]);
  });

  it("should not apply items that are incomplete with OR operator", () => {
    render(
      <TestCase
        filterModel={{
          logicOperator: GridLogicOperator.Or,
          items: [
            {
              id: 1,
              field: "brand",
              value: "a",
              operator: "contains",
            },
            {
              id: 2,
              field: "brand",
              operator: "contains",
            },
          ],
        }}
      />
    );
    expect(getColumnValues(0)).toEqual(["Adidas", "Puma"]);
  });

  it("should apply the filterModel prop correctly on GridApiRef setRows", () => {
    render(<TestCase filterModel={filterModel} />);

    const newRows = [
      {
        id: 3,
        brand: "Asics",
      },
      {
        id: 4,
        brand: "RedBull",
      },
      {
        id: 5,
        brand: "Hugo",
      },
    ];
    act(() => apiRef.current.setRows(newRows));
    expect(getColumnValues(0)).toEqual(["Asics"]);
  });

  it("should apply the filterModel prop correctly on GridApiRef update row data", () => {
    render(<TestCase filterModel={filterModel} />);
    act(() => apiRef.current.updateRows([{ id: 1, brand: "Fila" }]));
    act(() => apiRef.current.updateRows([{ id: 0, brand: "Patagonia" }]));
    expect(getColumnValues(0)).toEqual(["Patagonia", "Fila", "Puma"]);
  });

  it("should allow apiRef to setFilterModel", () => {
    render(<TestCase />);
    act(() =>
      apiRef.current.setFilterModel({
        items: [
          {
            field: "brand",
            value: "a",
            operator: "startsWith",
          },
        ],
      })
    );
    expect(getColumnValues(0)).toEqual(["Adidas"]);
  });

  it("should allow multiple filter and default to AND", () => {
    const newModel = {
      items: [
        {
          id: 1,
          field: "brand",
          value: "a",
          operator: "contains",
        },
        {
          id: 2,
          field: "brand",
          value: "m",
          operator: "contains",
        },
      ],
    };
    render(<TestCase filterModel={newModel} />);
    expect(getColumnValues(0)).toEqual(["Puma"]);
  });

  it("should allow multiple filter via apiRef", () => {
    render(<TestCase />);
    const newModel = {
      items: [
        {
          id: 1,
          field: "brand",
          value: "a",
          operator: "startsWith",
        },
        {
          id: 2,
          field: "brand",
          value: "s",
          operator: "endsWith",
        },
      ],
    };
    act(() => apiRef.current.setFilterModel(newModel));
    expect(getColumnValues(0)).toEqual(["Adidas"]);
  });

  // it('should work as expected with "Add filter" and "Remove all" buttons ', () => {
  //   render(
  //     <TestCase
  //       initialState={{
  //         preferencePanel: {
  //           open: true,
  //           openedPanelValue: GridPreferencePanelsValue.filters,
  //         },
  //       }}
  //     />
  //   );
  //   expect(apiRef.current.state.filter.filterModel.items).toHaveLength(0);
  //   const addButton = screen.getByRole("button", { name: /Add Filter/i });
  //   const removeButton = screen.getByRole("button", { name: /Remove all/i });
  //   fireEvent.click(addButton);
  //   fireEvent.click(addButton);
  //   expect(apiRef.current.state.filter.filterModel.items).toHaveLength(3);
  //   fireEvent.click(removeButton);
  //   expect(apiRef.current.state.filter.filterModel.items).toHaveLength(0);
  //   // clicking on `remove all` should close the panel when no filters
  //   fireEvent.click(removeButton);
  //   jest.advanceTimersByTime(100);
  //   expect(screen.queryByRole("button", { name: /Remove all/i })).toEqual(null);
  // });

  it("should hide `Add filter` in filter panel when `disableAddFilterButton` is `true`", () => {
    render(
      <TestCase
        initialState={{
          preferencePanel: {
            open: true,
            openedPanelValue: GridPreferencePanelsValue.filters,
          },
        }}
        slotProps={{
          filterPanel: {
            disableAddFilterButton: true,
          },
        }}
      />
    );
    expect(screen.queryByRole("button", { name: "Add filter" })).toEqual(null);
    expect(screen.queryByRole("button", { name: "Remove all" })).not.toEqual(
      null
    );
  });

  it("should hide `Remove all` in filter panel when `disableRemoveAllButton` is `true`", () => {
    render(
      <TestCase
        initialState={{
          preferencePanel: {
            open: true,
            openedPanelValue: GridPreferencePanelsValue.filters,
          },
        }}
        slotProps={{
          filterPanel: {
            disableRemoveAllButton: true,
          },
        }}
      />
    );
    expect(screen.queryByRole("button", { name: "Add filter" })).not.toEqual(
      null
    );
    expect(screen.queryByRole("button", { name: "Remove all" })).toEqual(null);
  });

  it("should allow multiple filter and changing the logicOperator", () => {
    const newModel: GridFilterModel = {
      items: [
        {
          id: 1,
          field: "brand",
          value: "a",
          operator: "startsWith",
        },
        {
          id: 2,
          field: "brand",
          value: "a",
          operator: "endsWith",
        },
      ],
      logicOperator: GridLogicOperator.Or,
    };
    render(<TestCase filterModel={newModel} />);
    expect(getColumnValues(0)).toEqual(["Adidas", "Puma"]);
  });

  it("should call onFilterModelChange with reason=changeLogicOperator when the logic operator changes but doesn't change the state", () => {
    const onFilterModelChange = jest.fn();
    const newModel: GridFilterModel = {
      items: [
        {
          id: 1,
          field: "brand",
          value: "a",
          operator: "startsWith",
        },
        {
          id: 2,
          field: "brand",
          value: "a",
          operator: "endsWith",
        },
      ],
    };
    render(
      <TestCase
        filterModel={newModel}
        onFilterModelChange={onFilterModelChange}
        initialState={{
          preferencePanel: {
            openedPanelValue: GridPreferencePanelsValue.filters,
            open: true,
          },
        }}
      />
    );
    expect(onFilterModelChange.mock.calls.length).toEqual(0);
    expect(getColumnValues(0)).toEqual([]);

    // The first combo is hidden and we include hidden elements to make the query faster
    // https://github.com/testing-library/dom-testing-library/issues/820#issuecomment-726936225
    // const input = getSelectInput(
    //   screen.queryAllByRole("combobox", {
    //     name: "Logic operator",
    //     hidden: true,
    //   })[
    //     isJSDOM ? 1 : 0 // https://github.com/testing-library/dom-testing-library/issues/846
    //   ]
    // );
    // fireEvent.change(input!, { target: { value: "or" } });
    // expect(onFilterModelChange.mock.calls.length).toEqual(1);
    // expect(onFilterModelChange.mock.calls[0][1].reason).toEqual(
    //   "changeLogicOperator"
    // );
    expect(getColumnValues(0)).toEqual([]);
  });

  // it("should call onFilterModelChange with reason=upsertFilterItem when the value is emptied", () => {
  //   const onFilterModelChange = jest.fn();
  //   render(
  //     <TestCase
  //       onFilterModelChange={onFilterModelChange}
  //       filterModel={{
  //         items: [
  //           {
  //             id: 1,
  //             field: "brand",
  //             value: "a",
  //             operator: "contains",
  //           },
  //         ],
  //       }}
  //       initialState={{
  //         preferencePanel: {
  //           openedPanelValue: GridPreferencePanelsValue.filters,
  //           open: true,
  //         },
  //       }}
  //     />
  //   );
  //   expect(onFilterModelChange.mock.calls.length).toEqual(0);
  //   fireEvent.change(screen.getByRole("textbox", { name: "Value" }), {
  //     target: { value: "" },
  //   });
  //   jest.advanceTimersByTime(500);
  //   expect(onFilterModelChange.mock.calls.length).toEqual(1);
  //   expect(onFilterModelChange.mock.calls[0][1].reason).toEqual(
  //     "upsertFilterItem"
  //   );
  // });

  it("should call onFilterModelChange with reason=deleteFilterItem when a filter is removed", () => {
    const onFilterModelChange = jest.fn();
    render(
      <TestCase
        onFilterModelChange={onFilterModelChange}
        filterModel={{
          items: [
            {
              id: 1,
              field: "brand",
              value: "a",
              operator: "contains",
            },
            {
              id: 2,
              field: "brand",
              value: "a",
              operator: "endsWith",
            },
          ],
        }}
        initialState={{
          preferencePanel: {
            openedPanelValue: GridPreferencePanelsValue.filters,
            open: true,
          },
        }}
      />
    );
    expect(onFilterModelChange.mock.calls.length).toEqual(0);
    fireEvent.click(screen.queryAllByRole("button", { name: "Delete" })[0]);
    expect(onFilterModelChange.mock.calls.length).toEqual(1);
    expect(onFilterModelChange.mock.calls[0][1].reason).toEqual(
      "deleteFilterItem"
    );
  });

  it("should call onFilterModelChange with reason=upsertFilterItems when a filter is added", () => {
    const onFilterModelChange = jest.fn();
    render(
      <TestCase
        onFilterModelChange={onFilterModelChange}
        filterModel={{
          items: [{ id: 1, field: "brand", value: "a", operator: "contains" }],
        }}
        initialState={{
          preferencePanel: {
            openedPanelValue: GridPreferencePanelsValue.filters,
            open: true,
          },
        }}
      />
    );
    expect(onFilterModelChange.mock.calls.length).toEqual(0);
    fireEvent.click(screen.getByRole("button", { name: "Add filter" }));
    expect(onFilterModelChange.mock.calls.length).toEqual(1);
    expect(onFilterModelChange.mock.calls[0][1].reason).toEqual(
      "upsertFilterItems"
    );
  });

  it("should publish filterModelChange with the reason whenever the model changes", () => {
    const listener = jest.fn();
    render(
      <TestCase
        initialState={{
          preferencePanel: {
            openedPanelValue: GridPreferencePanelsValue.filters,
            open: true,
          },
        }}
      />
    );
    apiRef.current.subscribeEvent("filterModelChange", listener);
    expect(listener.mock.calls.length).toEqual(0);
    fireEvent.click(screen.getByRole("button", { name: "Add filter" }));
    expect(listener.mock.calls.length).toEqual(1);
    expect(listener.mock.calls[0][1].reason).toEqual("upsertFilterItems");
  });

  it("should only select visible rows", () => {
    const newModel: GridFilterModel = {
      items: [
        {
          field: "brand",
          value: "a",
          operator: "startsWith",
        },
      ],
      logicOperator: GridLogicOperator.Or,
    };
    render(<TestCase checkboxSelection filterModel={newModel} />);
    const checkAllCell = getColumnHeaderCell(0).querySelector("input")!;
    fireEvent.click(checkAllCell);
    expect(apiRef.current.state.rowSelection).toEqual([1]);
  });

  it("should allow to clear filters by passing an empty filter model", () => {
    const newModel: GridFilterModel = {
      items: [
        {
          field: "brand",
          value: "a",
          operator: "startsWith",
        },
      ],
    };
    const { rerender } = render(<TestCase filterModel={newModel} />);
    expect(getColumnValues(0)).toEqual(["Adidas"]);
    rerender(<TestCase filterModel={{ items: [] }} />);
    expect(getColumnValues(0)).toEqual(["Nike", "Adidas", "Puma"]);
  });

  // it("should show the latest expandedRows", () => {
  //   render(
  //     <TestCase
  //       initialState={{
  //         preferencePanel: {
  //           open: true,
  //           openedPanelValue: GridPreferencePanelsValue.filters,
  //         },
  //       }}
  //     />
  //   );

  //   const input = screen.getByPlaceholderText("Filter value");
  //   fireEvent.change(input, { target: { value: "ad" } });
  //   jest.advanceTimersByTime(SUBMIT_FILTER_STROKE_TIME);
  //   expect(getColumnValues(0)).toEqual(["Adidas"]);

  //   expect(gridExpandedSortedRowEntriesSelector(apiRef).length).toEqual(1);
  //   expect(gridExpandedSortedRowEntriesSelector(apiRef)[0].model).toEqual({
  //     id: 1,
  //     brand: "Adidas",
  //   });
  // });

  it("should not scroll the page when a filter is removed from the panel", function test() {
    if (isJSDOM) {
      return; // Needs layout
    }
    render(
      <div>
        {/* To simulate a page that needs to be scrolled to reach the grid. */}
        <div style={{ height: "100vh", width: "100vh" }} />
        <TestCase
          initialState={{
            preferencePanel: {
              open: true,
              openedPanelValue: GridPreferencePanelsValue.filters,
            },
            filter: {
              filterModel: {
                logicOperator: GridLogicOperator.Or,
                items: [
                  { id: 1, field: "brand", value: "a", operator: "contains" },
                  { id: 2, field: "brand", value: "m", operator: "contains" },
                ],
              },
            },
          }}
        />
      </div>
    );
    grid("root")!.scrollIntoView();
    const initialScrollPosition = window.scrollY;
    expect(initialScrollPosition).not.toEqual(0);
    fireEvent.click(screen.getAllByRole("button", { name: /delete/i })[1]);
    expect(window.scrollY).toEqual(initialScrollPosition);
  });

  it("should not scroll the page when opening the filter panel and the operator=isAnyOf", function test() {
    if (isJSDOM) {
      return; // Needs layout
    }

    render(
      <div>
        {/* To simulate a page that needs to be scrolled to reach the grid. */}
        <div style={{ height: "100vh", width: "100vh" }} />
        <TestCase
          initialState={{
            preferencePanel: {
              open: true,
              openedPanelValue: GridPreferencePanelsValue.filters,
            },
            filter: {
              filterModel: {
                logicOperator: GridLogicOperator.Or,
                items: [{ id: 1, field: "brand", operator: "isAnyOf" }],
              },
            },
          }}
        />
      </div>
    );

    grid("root")!.scrollIntoView();
    const initialScrollPosition = window.scrollY;
    expect(initialScrollPosition).not.toEqual(0);
    act(() => apiRef.current.hidePreferences());
    jest.advanceTimersByTime(100);
    act(() =>
      apiRef.current.showPreferences(GridPreferencePanelsValue.filters)
    );
    expect(window.scrollY).toEqual(initialScrollPosition);
  });

  describe("Server", () => {
    it("should refresh the filter panel when adding filters", async () => {
      function loadServerRows(commodityFilterValue: string | undefined) {
        const serverRows = [
          { id: "1", commodity: "rice" },
          { id: "2", commodity: "soybeans" },
          { id: "3", commodity: "milk" },
          { id: "4", commodity: "wheat" },
          { id: "5", commodity: "oats" },
        ];

        return new Promise<GridRowModel[]>((resolve) => {
          if (!commodityFilterValue) {
            resolve(serverRows);
            return;
          }
          resolve(
            serverRows.filter(
              (row) =>
                row.commodity.toLowerCase().indexOf(commodityFilterValue) > -1
            )
          );
        });
      }

      const columns = [{ field: "commodity", width: 150 }];

      function AddServerFilterGrid() {
        const [rows, setRows] = React.useState<GridRowModel[]>([]);
        const [filterValue, setFilterValue] = React.useState<string>();

        const handleFilterChange = React.useCallback(
          (newFilterModel: GridFilterModel) => {
            setFilterValue(newFilterModel.items[0].value);
          },
          []
        );

        React.useEffect(() => {
          let active = true;

          (async () => {
            const newRows = await loadServerRows(filterValue);

            if (!active) {
              return;
            }

            setRows(newRows);
          })();

          return () => {
            active = false;
          };
        }, [filterValue]);

        return (
          <div style={{ height: 400, width: 400 }}>
            <DataGridPremium
              rows={rows}
              columns={columns}
              filterMode="server"
              onFilterModelChange={handleFilterChange}
              initialState={{
                preferencePanel: {
                  open: true,
                  openedPanelValue: GridPreferencePanelsValue.filters,
                },
              }}
            />
          </div>
        );
      }

      render(<AddServerFilterGrid />);
      await act(() => Promise.resolve()); // Wait for the server to send rows

      const addButton = screen.getByRole("button", { name: /Add Filter/i });
      fireEvent.click(addButton);
      const filterForms = document.querySelectorAll(`.MuiDataGrid-filterForm`);
      expect(filterForms).toHaveLength(2);
    });
  });

  it("should display the number of results in the footer", () => {
    const { rerender } = render(<TestCase />);
    expect(screen.getByText("Total Rows: 3")).not.toEqual(null);
    // setProps({ filterModel });
    rerender(
      <TestCase
        filterModel={{
          items: [
            {
              field: "brand",
              value: "a",
              operator: "contains",
            },
          ],
        }}
      />
    );
    expect(screen.getByText("Total Rows: 2 of 3")).not.toEqual(null);
  });

  describe("control Filter", () => {
    it("should update the filter state when neither the model nor the onChange are set", () => {
      render(
        <TestCase
          initialState={{
            preferencePanel: {
              open: true,
              openedPanelValue: GridPreferencePanelsValue.filters,
            },
          }}
        />
      );
      const addButton = screen.getByRole("button", { name: /Add Filter/i });
      fireEvent.click(addButton);
      const filterForms = document.querySelectorAll(`.MuiDataGrid-filterForm`);
      expect(filterForms).toHaveLength(2);
    });

    it("should not update the filter state when the filterModelProp is set", () => {
      const testFilterModel: GridFilterModel = {
        items: [],
        logicOperator: GridLogicOperator.Or,
      };
      render(
        <TestCase
          filterModel={testFilterModel}
          initialState={{
            preferencePanel: {
              open: true,
              openedPanelValue: GridPreferencePanelsValue.filters,
            },
          }}
        />
      );
      const addButton = screen.getByRole("button", { name: /Add Filter/i });
      fireEvent.click(addButton);
      expect(apiRef.current.state.filter.filterModel.items).toHaveLength(0);
    });

    it("should update the filter state when the model is not set, but the onChange is set", () => {
      const onModelChange = jest.fn();
      render(
        <TestCase
          onFilterModelChange={onModelChange}
          initialState={{
            preferencePanel: {
              open: true,
              openedPanelValue: GridPreferencePanelsValue.filters,
            },
          }}
        />
      );
      expect(onModelChange.mock.calls.length).toEqual(0);
      const addButton = screen.getByRole("button", { name: /Add Filter/i });
      fireEvent.click(addButton);
      const filterForms = document.querySelectorAll(`.MuiDataGrid-filterForm`);
      expect(filterForms).toHaveLength(2);
      expect(onModelChange.mock.calls.length).toEqual(1);
      expect(
        onModelChange.mock.calls[onModelChange.mock.calls.length - 1][0].items
          .length
      ).toEqual(2);
      expect(
        onModelChange.mock.calls[onModelChange.mock.calls.length - 1][0]
          .logicOperator
      ).toEqual(GridLogicOperator.And);
    });

    it("should control filter state when the model and the onChange are set", () => {
      function ControlCase(props: Partial<DataGridPremiumProps>) {
        const { rows, columns, ...others } = props;
        const [caseFilterModel, setFilterModel] = React.useState(
          getDefaultGridFilterModel
        );
        const handleFilterChange: DataGridPremiumProps["onFilterModelChange"] =
          (newModel) => {
            setFilterModel(newModel);
          };

        return (
          <div style={{ width: 300, height: 300 }}>
            <DataGridPremium
              autoHeight={isJSDOM}
              columns={columns || baselineProps.columns}
              rows={rows || baselineProps.rows}
              filterModel={caseFilterModel}
              onFilterModelChange={handleFilterChange}
              initialState={{
                preferencePanel: {
                  open: true,
                  openedPanelValue: GridPreferencePanelsValue.filters,
                },
              }}
              {...others}
            />
          </div>
        );
      }

      render(<ControlCase />);
      const addButton = screen.getByRole("button", { name: /Add Filter/i });
      fireEvent.click(addButton);

      const filterForms = document.querySelectorAll(`.MuiDataGrid-filterForm`);
      expect(filterForms).toHaveLength(2);
    });
  });

  it("should give a stable ID to the filter item used as placeholder", function test() {
    if (isJSDOM) {
      return; // It's not re-rendering the filter panel correctly
    }

    const { rerender } = render(<TestCase slots={{ toolbar: GridToolbar }} />);
    const filtersButton = screen.getByRole("button", { name: /Filters/i });
    fireEvent.click(filtersButton);

    let filterForm = document.querySelector<HTMLElement>(
      `.${gridClasses.filterForm}`
    );
    const oldId = filterForm!.dataset.id;

    rerender(
      <TestCase
        slots={{ toolbar: GridToolbar }}
        rows={[{ id: 0, brand: "ADIDAS" }]}
      />
    );
    filterForm = document.querySelector<HTMLElement>(
      `.${gridClasses.filterForm}`
    );
    const newId = filterForm!.dataset.id;
    expect(oldId).toEqual(newId);
  });

  describe("Header filters", () => {
    it("should reflect the `filterModel` prop in header filters correctly", () => {
      render(<TestCase filterModel={filterModel} headerFilters />);

      expect(getColumnValues(0)).toEqual(["Adidas", "Puma"]);
      const filterCellInput = getColumnHeaderCell(0, 1).querySelector("input");
      expect(filterCellInput).toHaveValue("a");
    });

    // it("should apply filters on type when the focus is on cell", () => {
    //   render(<TestCase headerFilters />);

    //   expect(getColumnValues(0)).toEqual(["Nike", "Adidas", "Puma"]);
    //   const filterCell = getColumnHeaderCell(0, 1);
    //   const filterCellInput = filterCell.querySelector("input")!;
    //   expect(filterCellInput).not.toHaveFocus();
    //   fireEvent.mouseDown(filterCellInput);
    //   expect(filterCellInput).toHaveFocus();
    //   fireEvent.change(filterCellInput, { target: { value: "ad" } });
    //   jest.advanceTimersByTime(SUBMIT_FILTER_STROKE_TIME);
    //   expect(getColumnValues(0)).toEqual(["Adidas"]);
    // });

    // it("should call `onFilterModelChange` when filters are updated", () => {
    //   const onFilterModelChange = jest.fn();
    //   render(
    //     <TestCase onFilterModelChange={onFilterModelChange} headerFilters />
    //   );

    //   const filterCell = getColumnHeaderCell(0, 1);
    //   const filterCellInput = filterCell.querySelector("input")!;
    //   fireEvent.click(filterCell);
    //   fireEvent.change(filterCellInput, { target: { value: "ad" } });
    //   jest.advanceTimersByTime(SUBMIT_FILTER_STROKE_TIME);
    //   expect(onFilterModelChange.mock.calls.length).toEqual(1);
    // });

    // it("should allow to change the operator from operator menu", () => {
    //   const onFilterModelChange = jest.fn();
    //   render(
    //     <TestCase
    //       initialState={{
    //         filter: {
    //           filterModel: {
    //             items: [
    //               {
    //                 field: "brand",
    //                 operator: "contains",
    //                 value: "a",
    //               },
    //             ],
    //           },
    //         },
    //       }}
    //       onFilterModelChange={onFilterModelChange}
    //       headerFilters
    //     />
    //   );
    //   expect(getColumnValues(0)).toEqual(["Adidas", "Puma"]);

    //   const filterCell = getColumnHeaderCell(0, 1);
    //   fireEvent.click(filterCell);

    //   fireEvent.click(within(filterCell).getByLabelText("Operator"));
    //   fireEvent.click(screen.getByRole("menuitem", { name: "Equals" }));

    //   expect(onFilterModelChange.mock.calls.length).toEqual(1);
    //   expect(onFilterModelChange.mock.calls[0][1].reason).toEqual("equals");
    //   expect(getColumnValues(0)).toEqual([]);
    // });

    it("should allow to clear the filter by clear button", () => {
      render(
        <TestCase
          initialState={{
            filter: {
              filterModel: {
                items: [
                  {
                    field: "brand",
                    operator: "contains",
                    value: "a",
                  },
                ],
              },
            },
          }}
          headerFilters
        />
      );

      expect(getColumnValues(0)).toEqual(["Adidas", "Puma"]);
      fireEvent.click(screen.getByRole("button", { name: "Clear filter" }));
      expect(getColumnValues(0)).toEqual(["Nike", "Adidas", "Puma"]);
    });

    it("should allow to customize header filter cell using `renderHeaderFilter`", () => {
      render(
        <TestCase
          columns={[
            {
              field: "brand",
              headerName: "Brand",
              renderHeaderFilter: () => "Custom Filter Cell",
            },
          ]}
          headerFilters
        />
      );

      expect(getColumnHeaderCell(0, 1).textContent).toEqual(
        "Custom Filter Cell"
      );
    });

    it("should allow to customize header filter cell using `filterOperators`", () => {
      render(
        <TestCase
          columns={[
            {
              field: "brand",
              headerName: "Brand",
              filterOperators: [
                {
                  value: "contains",
                  getApplyFilterFn: () => () => true,
                  InputComponent: () => <div>Custom Input</div>,
                },
              ],
            },
          ]}
          headerFilters
        />
      );

      expect(getColumnHeaderCell(0, 1).textContent).toEqual("Custom Input");
    });

    it("should not cause unexpected behavior when props are explictly set to undefined", () => {
      expect(() => {
        render(
          <TestCase
            columns={[
              {
                field: "actions",
                headerName: "Actions",
                type: "actions",
                width: 80,
                filterOperators: undefined,
                getActions: () => [<React.Fragment>action</React.Fragment>],
              },
            ]}
            headerFilters
          />
        );
      }).not.toThrow("expected error message");
    });

    // See https://github.com/mui/mui-x/issues/13217
    it("should not throw when custom filter operator is used with an initilaized value", () => {
      expect(() => {
        render(
          <TestCase
            columns={[
              {
                field: "brand",
                headerName: "Brand",
                filterOperators: [
                  ...getGridStringOperators(),
                  {
                    value: "looksLike",
                    label: "Looks Like",
                    headerLabel: "Looks Like",
                    getApplyFilterFn: () => () => true,
                    InputComponent: () => <div>Custom Input</div>,
                  },
                ],
              },
            ]}
            initialState={{
              filter: {
                filterModel: {
                  items: [
                    {
                      field: "brand",
                      operator: "looksLike",
                      value: "a",
                    },
                  ],
                },
              },
            }}
            headerFilters
          />
        );
      }).not.toThrow("expected error message");
    });
  });

  describe("Read-only filters", () => {
    const columns: GridColDef[] = [
      {
        field: "id",
        type: "number",
        filterable: false,
      },
      {
        field: "brand",
      },
    ];

    it("should allow multiple filters for `filterable: false` columns", () => {
      const newModel = {
        items: [
          {
            id: 1,
            field: "id",
            value: 0,
            operator: ">",
          },
          {
            id: 2,
            field: "id",
            operator: "isNotEmpty",
          },
          {
            id: 3,
            field: "brand",
            value: "m",
            operator: "contains",
          },
        ],
      };
      render(<TestCase filterModel={newModel} columns={columns} />);
      expect(getColumnValues(0)).toEqual(["2"]);
      expect(getColumnValues(1)).toEqual(["Puma"]);
    });

    // it("should allow updating logic operator even from read-only filters", function test() {
    //   const newModel = {
    //     items: [
    //       {
    //         id: 1,
    //         field: "id",
    //         value: 0,
    //         operator: ">",
    //       },
    //       {
    //         id: 2,
    //         field: "id",
    //         operator: "isNotEmpty",
    //       },
    //     ],
    //   };
    //   const initialState = {
    //     preferencePanel: {
    //       open: true,
    //       openedPanelValue: GridPreferencePanelsValue.filters,
    //     },
    //   };
    //   render(
    //     <TestCase
    //       initialState={initialState}
    //       filterModel={newModel}
    //       columns={columns}
    //     />
    //   );
    //   // For JSDom, the first hidden combo is also found which we are not interested in
    //   const select = screen.getAllByRole("combobox", {
    //     name: "Logic operator",
    //   })[isJSDOM ? 1 : 0];
    //   expect(select).not.toHaveClass("Mui-disabled");
    // });

    // it("should disable `Remove all` button for only read-only filters", () => {
    //   const newModel = {
    //     items: [
    //       {
    //         id: 1,
    //         field: "id",
    //         value: 0,
    //         operator: ">",
    //       },
    //     ],
    //   };

    //   const initialState = {
    //     preferencePanel: {
    //       open: true,
    //       openedPanelValue: GridPreferencePanelsValue.filters,
    //     },
    //   };
    //   const { rerender } = render(
    //     <TestCase initialState={initialState} columns={columns} />
    //   );
    //   expect(screen.queryByRole("button", { name: /Remove all/i })).not.toEqual(
    //     null
    //   );
    //   rerender(<TestCase filterModel={newModel} />);
    //   expect(screen.queryByRole("button", { name: /Remove all/i })).toEqual(
    //     null
    //   );
    // });
  });
});
