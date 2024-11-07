import * as React from "react";
import { getCell, getColumnValues, getRows } from "./helperFn";
import { render, fireEvent, screen, act, waitFor } from "@testing-library/react";
import {
  GridRowSelectionModel,
  GridRowsProp,
  GridColDef,
} from "@mui/x-data-grid";
import { GridApi } from "../typeOverloads/reexports";
import { useGridApiRef } from "../hooks/utils/useGridApiRef";
import { DataGridPremium } from "../DataGridPremium/DataGridPremium";
import { DataGridPremiumProps } from "../models/dataGridPremiumProps";
import { getBasicGridData } from "./basic-data-service";

function getSelectedRowIds() {
  const hasCheckbox = !!document.querySelector('input[type="checkbox"]');
  return Array.from(getRows())
    .filter((row) => row.classList.contains("Mui-selected"))
    .map((row) =>
      Number(
        row.querySelector(
          `[role="gridcell"][data-colindex="${hasCheckbox ? 1 : 0}"]`
        )!.textContent
      )
    );
}

const isJSDOM = /jsdom/.test(window.navigator.userAgent);

interface BaselineProps extends DataGridPremiumProps {
  rows: GridRowsProp;
}

const rows: GridRowsProp = [
  { id: 0, category1: "Cat A", category2: "Cat 1" },
  { id: 1, category1: "Cat A", category2: "Cat 2" },
  { id: 2, category1: "Cat A", category2: "Cat 2" },
  { id: 3, category1: "Cat B", category2: "Cat 2" },
  { id: 4, category1: "Cat B", category2: "Cat 1" },
];

const baselineProps: BaselineProps = {
  autoHeight: isJSDOM,
  disableVirtualization: true,
  rows,
  columns: [
    {
      field: "id",
      type: "number",
    },
    {
      field: "category1",
    },
    {
      field: "category2",
    },
  ],
};

describe("<DataGridPremium /> - Row selection", () => {
  let apiRef: React.MutableRefObject<GridApi>;

  function TestDataGridSelection({
    rowLength = 4,
    ...other
  }: Omit<DataGridPremiumProps, "rows" | "columns" | "apiRef"> &
    Partial<Pick<DataGridPremiumProps, "rows" | "columns">> & {
      rowLength?: number;
    }) {
    apiRef = useGridApiRef();

    const data = React.useMemo(
      () => getBasicGridData(rowLength, 2),
      [rowLength]
    );

    return (
      <div style={{ width: 300, height: 300 }}>
        <DataGridPremium
          {...data}
          {...other}
          apiRef={apiRef}
          disableVirtualization
        />
      </div>
    );
  }

  const rows: GridRowsProp = [
    {
      hierarchy: ["Sarah"],
      jobTitle: "Head of Human Resources",
      recruitmentDate: new Date(2020, 8, 12),
      id: 0,
    },
    {
      hierarchy: ["Thomas"],
      jobTitle: "Head of Sales",
      recruitmentDate: new Date(2017, 3, 4),
      id: 1,
    },
    {
      hierarchy: ["Thomas", "Robert"],
      jobTitle: "Sales Person",
      recruitmentDate: new Date(2020, 11, 20),
      id: 2,
    },
    {
      hierarchy: ["Thomas", "Karen"],
      jobTitle: "Sales Person",
      recruitmentDate: new Date(2020, 10, 14),
      id: 3,
    },
    {
      hierarchy: ["Thomas", "Nancy"],
      jobTitle: "Sales Person",
      recruitmentDate: new Date(2017, 10, 29),
      id: 4,
    },
    {
      hierarchy: ["Thomas", "Daniel"],
      jobTitle: "Sales Person",
      recruitmentDate: new Date(2020, 7, 21),
      id: 5,
    },
    {
      hierarchy: ["Thomas", "Christopher"],
      jobTitle: "Sales Person",
      recruitmentDate: new Date(2020, 7, 20),
      id: 6,
    },
    {
      hierarchy: ["Thomas", "Donald"],
      jobTitle: "Sales Person",
      recruitmentDate: new Date(2019, 6, 28),
      id: 7,
    },
    {
      hierarchy: ["Mary"],
      jobTitle: "Head of Engineering",
      recruitmentDate: new Date(2016, 3, 14),
      id: 8,
    },
    {
      hierarchy: ["Mary", "Jennifer"],
      jobTitle: "Tech lead front",
      recruitmentDate: new Date(2016, 5, 17),
      id: 9,
    },
    {
      hierarchy: ["Mary", "Jennifer", "Anna"],
      jobTitle: "Front-end developer",
      recruitmentDate: new Date(2019, 11, 7),
      id: 10,
    },
    {
      hierarchy: ["Mary", "Michael"],
      jobTitle: "Tech lead devops",
      recruitmentDate: new Date(2021, 7, 1),
      id: 11,
    },
    {
      hierarchy: ["Mary", "Linda"],
      jobTitle: "Tech lead back",
      recruitmentDate: new Date(2017, 0, 12),
      id: 12,
    },
    {
      hierarchy: ["Mary", "Linda", "Elizabeth"],
      jobTitle: "Back-end developer",
      recruitmentDate: new Date(2019, 2, 22),
      id: 13,
    },
    {
      hierarchy: ["Mary", "Linda", "William"],
      jobTitle: "Back-end developer",
      recruitmentDate: new Date(2018, 4, 19),
      id: 14,
    },
  ];

  const columns: GridColDef[] = [
    { field: "jobTitle", headerName: "Job Title", width: 200 },
    {
      field: "recruitmentDate",
      headerName: "Recruitment Date",
      type: "date",
      width: 150,
    },
  ];

  const getTreeDataPath: DataGridPremiumProps["getTreeDataPath"] = (row) =>
    row.hierarchy;

  function TreeDataGrid(props: Partial<DataGridPremiumProps>) {
    apiRef = useGridApiRef();
    return (
      <div style={{ height: 800, width: "100%" }}>
        <DataGridPremium
          apiRef={apiRef}
          treeData
          rows={rows}
          columns={columns}
          getTreeDataPath={getTreeDataPath}
          checkboxSelection
          {...props}
        />
      </div>
    );
  }

  it("should keep the previously selected tree data parent selected if it becomes leaf after filtering", () => {
    render(
      <TreeDataGrid defaultGroupingExpansionDepth={-1} density="compact" />
    );

    fireEvent.click(
      screen.getByRole("checkbox", {
        name: /select all rows/i,
      })
    );
    expect(apiRef.current.getSelectedRows().size).toBe(15);
    act(() => {
      apiRef.current.setFilterModel({
        items: [
          {
            field: "jobTitle",
            value: "Head of Sales",
            operator: "equals",
          },
        ],
      });
    });

    expect(Array.from(apiRef.current.getSelectedRows().keys())).toEqual([1]);
  });

  it("should put the parent into indeterminate if some but not all the children are selected", () => {
    render(
      <TreeDataGrid defaultGroupingExpansionDepth={-1} density="compact" />
    );

    fireEvent.click(getCell(2, 0).querySelector("input")!);
    expect(getCell(1, 0).querySelector("input")!).toHaveAttribute(
      "data-indeterminate",
      "true"
    );
  });

  // Context: https://github.com/mui/mui-x/issues/14859
  it("should not throw when controlling a selection model", () => {
    function TestDataGrid() {
      const [rowSelectionModel, setRowSelectionModel] =
        React.useState<GridRowSelectionModel>([]);
      return (
        <TreeDataGrid
          rowSelectionModel={rowSelectionModel}
          onRowSelectionModelChange={setRowSelectionModel}
        />
      );
    }
    expect(() => {
      render(<TestDataGrid />);
    }).not.toThrow();
  });

  describe("prop: checkboxSelectionVisibleOnly = false", () => {
    it("should select all rows of all pages if no row is selected", () => {
      render(
        <TestDataGridSelection
          checkboxSelection
          initialState={{ pagination: { paginationModel: { pageSize: 2 } } }}
          pagination
          pageSizeOptions={[2]}
        />
      );
      const selectAllCheckbox: HTMLInputElement = screen.getByRole("checkbox", {
        name: /select all rows/i,
      });
      fireEvent.click(selectAllCheckbox);
      expect(apiRef.current.getSelectedRows().size).toBe(4);
      expect(selectAllCheckbox.checked).toEqual(true);
    });

    it("should unselect all rows of all the pages if 1 row of another page is selected", () => {
      render(
        <TestDataGridSelection
          checkboxSelection
          initialState={{ pagination: { paginationModel: { pageSize: 2 } } }}
          pagination
          pageSizeOptions={[2]}
        />
      );
      fireEvent.click(getCell(0, 0).querySelector("input")!);
      expect(Array.from(apiRef.current.getSelectedRows().keys())).toEqual([0]);
      fireEvent.click(screen.getByRole("button", { name: /next page/i }));
      const selectAllCheckbox: HTMLInputElement = screen.getByRole("checkbox", {
        name: /select all rows/i,
      });
      fireEvent.click(selectAllCheckbox);
      expect(apiRef.current.getSelectedRows().size).toBe(0);
      expect(selectAllCheckbox.checked).toEqual(false);
    });

    it("should select all visible rows if pagination is not enabled", () => {
      const rowLength = 10;

      render(
        <TestDataGridSelection
          checkboxSelection
          checkboxSelectionVisibleOnly={false}
          rowLength={rowLength}
        />
      );

      const selectAllCheckbox: HTMLInputElement = screen.getByRole("checkbox", {
        name: /select all rows/i,
      });
      fireEvent.click(selectAllCheckbox);
      expect(apiRef.current.getSelectedRows().size).toBe(rowLength);
      expect(selectAllCheckbox.checked).toEqual(true);
    });

    it("should set the header checkbox in a indeterminate state when some rows of other pages are not selected", () => {
      render(
        <TestDataGridSelection
          checkboxSelection
          checkboxSelectionVisibleOnly={false}
          initialState={{ pagination: { paginationModel: { pageSize: 2 } } }}
          pagination
          pageSizeOptions={[2]}
        />
      );

      const selectAllCheckbox = screen.getByRole("checkbox", {
        name: /select all rows/i,
      });

      fireEvent.click(getCell(0, 0).querySelector("input")!);
      fireEvent.click(getCell(1, 0).querySelector("input")!);
      fireEvent.click(screen.getByRole("button", { name: /next page/i }));
      expect(selectAllCheckbox).toHaveAttribute("data-indeterminate", "true");
    });

    it("should not select more than one row when disableMultipleRowSelection = true", () => {
      render(
        <TestDataGridSelection checkboxSelection disableMultipleRowSelection />
      );
      const input1 = getCell(0, 0).querySelector("input")!;
      fireEvent.click(input1);
      expect(input1.checked).toEqual(true);

      const input2 = getCell(1, 0).querySelector("input")!;
      fireEvent.click(input2);
      expect(input1.checked).toEqual(false);
      expect(input2.checked).toEqual(true);
    });
  });

  describe("prop: checkboxSelectionVisibleOnly = true", () => {
    it("should throw a console error if used without pagination", () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      render(
        <TestDataGridSelection
          checkboxSelection
          checkboxSelectionVisibleOnly
          rowLength={100}
        />
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          "MUI X: The `checkboxSelectionVisibleOnly` prop has no effect when the pagination is not enabled."
        )
      );
      consoleErrorSpy.mockRestore();
    });

    it("should select all the rows of the current page if no row of the current page is selected", () => {
      render(
        <TestDataGridSelection
          checkboxSelection
          checkboxSelectionVisibleOnly
          initialState={{ pagination: { paginationModel: { pageSize: 2 } } }}
          pagination
          pageSizeOptions={[2]}
        />
      );

      fireEvent.click(getCell(0, 0).querySelector("input")!);
      expect(Array.from(apiRef.current.getSelectedRows().keys())).toEqual([0]);
      fireEvent.click(screen.getByRole("button", { name: /next page/i }));
      const selectAllCheckbox: HTMLInputElement = screen.getByRole("checkbox", {
        name: /select all rows/i,
      });
      fireEvent.click(selectAllCheckbox);
      expect(Array.from(apiRef.current.getSelectedRows().keys())).toEqual([
        0, 2, 3,
      ]);
      expect(selectAllCheckbox.checked).toEqual(true);
    });

    it("should unselect all the rows of the current page if 1 row of the current page is selected", () => {
      render(
        <TestDataGridSelection
          checkboxSelection
          initialState={{ pagination: { paginationModel: { pageSize: 2 } } }}
          pagination
          checkboxSelectionVisibleOnly
          pageSizeOptions={[2]}
        />
      );

      fireEvent.click(getCell(0, 0).querySelector("input")!);
      expect(Array.from(apiRef.current.getSelectedRows().keys())).toEqual([0]);
      fireEvent.click(screen.getByRole("button", { name: /next page/i }));
      fireEvent.click(getCell(2, 0).querySelector("input")!);
      expect(Array.from(apiRef.current.getSelectedRows().keys())).toEqual([
        0, 2,
      ]);
      const selectAllCheckbox: HTMLInputElement = screen.getByRole("checkbox", {
        name: /select all rows/i,
      });
      fireEvent.click(selectAllCheckbox);
      expect(Array.from(apiRef.current.getSelectedRows().keys())).toEqual([0]);
      expect(selectAllCheckbox.checked).toEqual(false);
    });

    it("should not set the header checkbox in a indeterminate state when some rows of other pages are not selected", () => {
      render(
        <TestDataGridSelection
          checkboxSelection
          initialState={{ pagination: { paginationModel: { pageSize: 2 } } }}
          pagination
          pageSizeOptions={[2]}
        />
      );

      fireEvent.click(getCell(0, 0));
      fireEvent.click(getCell(1, 0));
      fireEvent.click(screen.getByRole("button", { name: /next page/i }));
      const selectAllCheckbox = screen.getByRole("checkbox", {
        name: /select all rows/i,
      });
      expect(selectAllCheckbox).toHaveAttribute("data-indeterminate", "false");
    });

    it('should allow to select all the current page rows when props.paginationMode="server"', () => {
      function TestDataGridSelectionServerSide({
        rowLength = 4,
      }: Omit<DataGridPremiumProps, "rows" | "columns" | "apiRef"> &
        Partial<Pick<DataGridPremiumProps, "rows" | "columns">> & {
          rowLength?: number;
        }) {
        apiRef = useGridApiRef();
        const paginationModel = { pageSize: 2, page: 1 };

        const data = React.useMemo(
          () => getBasicGridData(rowLength, 2),
          [rowLength]
        );

        return (
          <div style={{ width: 300, height: 300 }}>
            <DataGridPremium
              {...data}
              rows={data.rows.slice(
                paginationModel.pageSize * paginationModel.page,
                paginationModel.pageSize * (paginationModel.page + 1)
              )}
              checkboxSelection
              checkboxSelectionVisibleOnly
              initialState={{ pagination: { paginationModel } }}
              pagination
              paginationMode="server"
              pageSizeOptions={[2]}
              apiRef={apiRef}
              rowCount={rowLength}
              disableVirtualization
            />
          </div>
        );
      }
      render(<TestDataGridSelectionServerSide />);

      const selectAllCheckbox = screen.getByRole("checkbox", {
        name: /select all rows/i,
      });

      fireEvent.click(selectAllCheckbox);
      expect(apiRef.current.getSelectedRows().size).toBe(2);
    });

    // https://github.com/mui/mui-x/issues/14074
    it("should select all the rows of the current page keeping the previously selected rows when a filter is applied", () => {
      render(
        <TestDataGridSelection
          rowLength={50}
          checkboxSelection
          checkboxSelectionVisibleOnly
          initialState={{
            pagination: { paginationModel: { pageSize: 2 } },
            filter: {
              filterModel: {
                items: [
                  {
                    field: "currencyPair",
                    value: "usd",
                    operator: "contains",
                  },
                ],
              },
            },
          }}
          pagination
          pageSizeOptions={[2]}
        />
      );

      fireEvent.click(getCell(0, 0).querySelector("input")!);
      expect(Array.from(apiRef.current.getSelectedRows().keys())).toEqual([0]);
      fireEvent.click(screen.getByRole("button", { name: /next page/i }));
      const selectAllCheckbox: HTMLInputElement = screen.getByRole("checkbox", {
        name: /select all rows/i,
      });
      fireEvent.click(selectAllCheckbox);
      expect(Array.from(apiRef.current.getSelectedRows().keys())).toEqual([
        0, 3, 4,
      ]);
      expect(selectAllCheckbox.checked).toEqual(true);
    });
  });

  describe("prop: rowSelectionPropagation = { descendants: false, parents: false }", () => {
    function SelectionPropagationGrid(props: Partial<DataGridPremiumProps>) {
      return (
        <TreeDataGrid
          rowSelectionPropagation={{ descendants: false, parents: false }}
          {...props}
        />
      );
    }

    it("should select the parent only when selecting it", () => {
      render(<SelectionPropagationGrid />);

      fireEvent.click(getCell(1, 0).querySelector("input")!);
      expect(Array.from(apiRef.current.getSelectedRows().keys())).toEqual([1]);
    });

    it("should deselect the parent only when deselecting it", () => {
      render(
        <SelectionPropagationGrid
          defaultGroupingExpansionDepth={-1}
          density="compact"
        />
      );

      fireEvent.click(getCell(1, 0).querySelector("input")!);
      fireEvent.click(getCell(2, 0).querySelector("input")!);
      expect(Array.from(apiRef.current.getSelectedRows().keys())).toEqual([
        1, 2,
      ]);
      fireEvent.click(getCell(1, 0).querySelector("input")!);
      expect(Array.from(apiRef.current.getSelectedRows().keys())).toEqual([2]);
    });

    it("should not auto select the parent if all the children are selected", () => {
      render(
        <SelectionPropagationGrid
          defaultGroupingExpansionDepth={-1}
          density="compact"
        />
      );

      fireEvent.click(getCell(2, 0).querySelector("input")!);
      fireEvent.click(getCell(3, 0).querySelector("input")!);
      fireEvent.click(getCell(4, 0).querySelector("input")!);
      fireEvent.click(getCell(5, 0).querySelector("input")!);
      fireEvent.click(getCell(6, 0).querySelector("input")!);
      fireEvent.click(getCell(7, 0).querySelector("input")!);
      // The parent row (Thomas, id: 1) should not be among the selected rows
      expect(Array.from(apiRef.current.getSelectedRows().keys())).toEqual([
        2, 3, 4, 5, 6, 7,
      ]);
    });

    it("should not deselect selected parent if one of the children is deselected", () => {
      render(
        <SelectionPropagationGrid
          defaultGroupingExpansionDepth={-1}
          density="compact"
        />
      );

      fireEvent.click(getCell(1, 0).querySelector("input")!);
      fireEvent.click(getCell(2, 0).querySelector("input")!);
      fireEvent.click(getCell(3, 0).querySelector("input")!);
      fireEvent.click(getCell(4, 0).querySelector("input")!);
      fireEvent.click(getCell(5, 0).querySelector("input")!);
      fireEvent.click(getCell(6, 0).querySelector("input")!);
      fireEvent.click(getCell(7, 0).querySelector("input")!);
      expect(Array.from(apiRef.current.getSelectedRows().keys())).toEqual([
        1, 2, 3, 4, 5, 6, 7,
      ]);
      fireEvent.click(getCell(2, 0).querySelector("input")!);
      // The parent row (Thomas, id: 1) should still be among the selected rows
      expect(Array.from(apiRef.current.getSelectedRows().keys())).toEqual([
        1, 3, 4, 5, 6, 7,
      ]);
    });

    it('should select only the unwrapped rows when clicking "Select All" checkbox', () => {
      render(<SelectionPropagationGrid />);

      fireEvent.click(
        screen.getByRole("checkbox", { name: /select all rows/i })
      );
      expect(Array.from(apiRef.current.getSelectedRows().keys())).toEqual([
        0, 1, 8,
      ]);
    });

    it('should deselect only the unwrapped rows when clicking "Select All" checkbox', () => {
      render(<SelectionPropagationGrid />);

      fireEvent.click(
        screen.getByRole("checkbox", { name: /select all rows/i })
      );
      expect(Array.from(apiRef.current.getSelectedRows().keys())).toEqual([
        0, 1, 8,
      ]);
      fireEvent.click(
        screen.getByRole("checkbox", { name: /select all rows/i })
      );
      expect(apiRef.current.getSelectedRows().size).toEqual(0);
    });
  });

  describe("prop: rowSelectionPropagation = { descendants: true, parents: false }", () => {
    function SelectionPropagationGrid(props: Partial<DataGridPremiumProps>) {
      return (
        <TreeDataGrid
          rowSelectionPropagation={{ descendants: true, parents: false }}
          {...props}
        />
      );
    }

    it("should select all the children when selecting a parent", () => {
      render(<SelectionPropagationGrid />);

      fireEvent.click(getCell(1, 0).querySelector("input")!);
      expect(Array.from(apiRef.current.getSelectedRows().keys())).toEqual([
        1, 2, 3, 4, 5, 6, 7,
      ]);
    });

    it("should deselect all the children when deselecting a parent", () => {
      render(<SelectionPropagationGrid />);

      fireEvent.click(getCell(1, 0).querySelector("input")!);
      expect(Array.from(apiRef.current.getSelectedRows().keys())).toEqual([
        1, 2, 3, 4, 5, 6, 7,
      ]);
      fireEvent.click(getCell(1, 0).querySelector("input")!);
      expect(apiRef.current.getSelectedRows().size).toEqual(0);
    });

    it("should not auto select the parent if all the children are selected", () => {
      render(
        <SelectionPropagationGrid
          defaultGroupingExpansionDepth={-1}
          density="compact"
        />
      );

      fireEvent.click(getCell(2, 0).querySelector("input")!);
      fireEvent.click(getCell(3, 0).querySelector("input")!);
      fireEvent.click(getCell(4, 0).querySelector("input")!);
      fireEvent.click(getCell(5, 0).querySelector("input")!);
      fireEvent.click(getCell(6, 0).querySelector("input")!);
      fireEvent.click(getCell(7, 0).querySelector("input")!);
      // The parent row (Thomas, id: 1) should not be among the selected rows
      expect(Array.from(apiRef.current.getSelectedRows().keys())).toEqual([
        2, 3, 4, 5, 6, 7,
      ]);
    });

    it("should not deselect selected parent if one of the children is deselected", () => {
      render(
        <SelectionPropagationGrid
          defaultGroupingExpansionDepth={-1}
          density="compact"
        />
      );

      fireEvent.click(getCell(1, 0).querySelector("input")!);
      expect(Array.from(apiRef.current.getSelectedRows().keys())).toEqual([
        1, 2, 3, 4, 5, 6, 7,
      ]);
      fireEvent.click(getCell(2, 0).querySelector("input")!);
      // The parent row (Thomas, id: 1) should still be among the selected rows
      expect(Array.from(apiRef.current.getSelectedRows().keys())).toEqual([
        1, 3, 4, 5, 6, 7,
      ]);
    });

    it('should select all the nested rows when clicking "Select All" checkbox', () => {
      render(<SelectionPropagationGrid />);

      fireEvent.click(
        screen.getByRole("checkbox", { name: /select all rows/i })
      );
      expect(apiRef.current.getSelectedRows().size).toEqual(15);
    });

    it('should deselect all the nested rows when clicking "Select All" checkbox', () => {
      render(<SelectionPropagationGrid />);

      fireEvent.click(
        screen.getByRole("checkbox", { name: /select all rows/i })
      );
      expect(apiRef.current.getSelectedRows().size).toEqual(15);
      fireEvent.click(
        screen.getByRole("checkbox", { name: /select all rows/i })
      );
      expect(apiRef.current.getSelectedRows().size).toEqual(0);
    });

    describe("prop: isRowSelectable", () => {
      it("should not select a parent or it's descendants if not allowed", () => {
        render(
          <SelectionPropagationGrid
            defaultGroupingExpansionDepth={-1}
            density="compact"
            isRowSelectable={(params) => params.id !== 1}
          />
        );

        fireEvent.click(getCell(1, 0).querySelector("input")!);
        expect(apiRef.current.getSelectedRows().size).toEqual(0);
      });

      it("should not auto-select a descendant if not allowed", () => {
        render(
          <SelectionPropagationGrid
            defaultGroupingExpansionDepth={-1}
            density="compact"
            isRowSelectable={(params) => params.id !== 2}
          />
        );

        fireEvent.click(getCell(1, 0).querySelector("input")!);
        expect(Array.from(apiRef.current.getSelectedRows().keys())).toEqual([
          1, 3, 4, 5, 6, 7,
        ]);
      });
    });
  });

  describe("prop: rowSelectionPropagation = { descendants: false, parents: true }", () => {
    function SelectionPropagationGrid(props: Partial<DataGridPremiumProps>) {
      return (
        <TreeDataGrid
          rowSelectionPropagation={{ descendants: false, parents: true }}
          {...props}
        />
      );
    }

    it("should select the parent only when selecting it", () => {
      render(<SelectionPropagationGrid />);

      fireEvent.click(getCell(1, 0).querySelector("input")!);
      expect(Array.from(apiRef.current.getSelectedRows().keys())).toEqual([1]);
    });

    it("should deselect the parent only when deselecting it", () => {
      render(
        <SelectionPropagationGrid
          defaultGroupingExpansionDepth={-1}
          density="compact"
        />
      );

      fireEvent.click(getCell(1, 0).querySelector("input")!);
      fireEvent.click(getCell(2, 0).querySelector("input")!);
      expect(Array.from(apiRef.current.getSelectedRows().keys())).toEqual([
        1, 2,
      ]);
      fireEvent.click(getCell(1, 0).querySelector("input")!);
      expect(Array.from(apiRef.current.getSelectedRows().keys())).toEqual([2]);
    });

    it("should auto select the parent if all the children are selected", () => {
      render(
        <SelectionPropagationGrid
          defaultGroupingExpansionDepth={-1}
          density="compact"
        />
      );

      fireEvent.click(getCell(2, 0).querySelector("input")!);
      fireEvent.click(getCell(3, 0).querySelector("input")!);
      fireEvent.click(getCell(4, 0).querySelector("input")!);
      fireEvent.click(getCell(5, 0).querySelector("input")!);
      fireEvent.click(getCell(6, 0).querySelector("input")!);
      fireEvent.click(getCell(7, 0).querySelector("input")!);
      // The parent row (Thomas, id: 1) should be among the selected rows
      expect(Array.from(apiRef.current.getSelectedRows().keys())).toEqual([
        2, 3, 4, 5, 6, 7, 1,
      ]);
    });

    it("should deselect selected parent if one of the children is deselected", () => {
      render(
        <SelectionPropagationGrid
          defaultGroupingExpansionDepth={-1}
          density="compact"
        />
      );

      fireEvent.click(getCell(2, 0).querySelector("input")!);
      fireEvent.click(getCell(3, 0).querySelector("input")!);
      fireEvent.click(getCell(4, 0).querySelector("input")!);
      fireEvent.click(getCell(5, 0).querySelector("input")!);
      fireEvent.click(getCell(6, 0).querySelector("input")!);
      fireEvent.click(getCell(7, 0).querySelector("input")!);
      expect(Array.from(apiRef.current.getSelectedRows().keys())).toEqual([
        2, 3, 4, 5, 6, 7, 1,
      ]);
      fireEvent.click(getCell(2, 0).querySelector("input")!);
      // The parent row (Thomas, id: 1) should not be among the selected rows
      expect(Array.from(apiRef.current.getSelectedRows().keys())).toEqual([
        3, 4, 5, 6, 7,
      ]);
    });

    describe("prop: isRowSelectable", () => {
      it("should not auto select a parent if not allowed", () => {
        render(
          <SelectionPropagationGrid
            defaultGroupingExpansionDepth={-1}
            density="compact"
            isRowSelectable={(params) => params.id !== 1}
          />
        );

        fireEvent.click(getCell(2, 0).querySelector("input")!);
        fireEvent.click(getCell(3, 0).querySelector("input")!);
        fireEvent.click(getCell(4, 0).querySelector("input")!);
        fireEvent.click(getCell(5, 0).querySelector("input")!);
        fireEvent.click(getCell(6, 0).querySelector("input")!);
        fireEvent.click(getCell(7, 0).querySelector("input")!);
        // The parent row (Thomas, id: 1) should still not be among the selected rows
        expect(Array.from(apiRef.current.getSelectedRows().keys())).toEqual([
          2, 3, 4, 5, 6, 7,
        ]);
      });
    });
  });

  describe("prop: rowSelectionPropagation = { descendants: true, parents: true }", () => {
    function SelectionPropagationGrid(props: Partial<DataGridPremiumProps>) {
      return (
        <TreeDataGrid
          rowSelectionPropagation={{ descendants: true, parents: true }}
          {...props}
        />
      );
    }

    it("should select all the children when selecting a parent", () => {
      render(<SelectionPropagationGrid />);

      fireEvent.click(getCell(1, 0).querySelector("input")!);
      expect(Array.from(apiRef.current.getSelectedRows().keys())).toEqual([
        1, 2, 3, 4, 5, 6, 7,
      ]);
    });

    it("should deselect all the children when deselecting a parent", () => {
      render(<SelectionPropagationGrid />);

      fireEvent.click(getCell(1, 0).querySelector("input")!);
      expect(Array.from(apiRef.current.getSelectedRows().keys())).toEqual([
        1, 2, 3, 4, 5, 6, 7,
      ]);
      fireEvent.click(getCell(1, 0).querySelector("input")!);
      expect(apiRef.current.getSelectedRows().size).toEqual(0);
    });

    it("should auto select the parent if all the children are selected", () => {
      render(
        <SelectionPropagationGrid
          defaultGroupingExpansionDepth={-1}
          density="compact"
        />
      );

      fireEvent.click(getCell(9, 0).querySelector("input")!);
      fireEvent.click(getCell(11, 0).querySelector("input")!);
      fireEvent.click(getCell(12, 0).querySelector("input")!);

      // The parent row (Mary, id: 8) should be among the selected rows
      expect(Array.from(apiRef.current.getSelectedRows().keys()).sort()).toEqual(
        [9, 10, 11, 12, 8, 13, 14].sort()
      );
    });

    it("should deselect auto selected parent if one of the children is deselected", () => {
      render(
        <SelectionPropagationGrid
          defaultGroupingExpansionDepth={-1}
          density="compact"
        />
      );

      fireEvent.click(getCell(9, 0).querySelector("input")!);
      fireEvent.click(getCell(11, 0).querySelector("input")!);
      fireEvent.click(getCell(12, 0).querySelector("input")!);
      expect(Array.from(apiRef.current.getSelectedRows().keys()).sort()).toEqual(
        [9, 10, 11, 12, 8, 13, 14].sort()
      );
      fireEvent.click(getCell(9, 0).querySelector("input")!);
      expect(Array.from(apiRef.current.getSelectedRows().keys())).toEqual([
        11, 12, 13, 14,
      ]);
    });

    describe("prop: indeterminateCheckboxAction = 'select'", () => {
      it("should select all the children when selecting an indeterminate parent", () => {
        render(
          <SelectionPropagationGrid
            defaultGroupingExpansionDepth={-1}
            density="compact"
            indeterminateCheckboxAction="select"
          />
        );

        fireEvent.click(getCell(2, 0).querySelector("input")!);
        expect(getCell(1, 0).querySelector("input")!).toHaveAttribute(
          "data-indeterminate",
          "true"
        );
        fireEvent.click(getCell(1, 0).querySelector("input")!);
        expect(Array.from(apiRef.current.getSelectedRows().keys()).sort()).toEqual([
          1, 2, 3, 4, 5, 6, 7,
        ]);
      });
    });

    describe("prop: indeterminateCheckboxAction = 'deselect'", () => {
      it("should deselect all the children when selecting an indeterminate parent", () => {
        render(
          <SelectionPropagationGrid
            defaultGroupingExpansionDepth={-1}
            density="compact"
            indeterminateCheckboxAction="deselect"
          />
        );

        fireEvent.click(getCell(2, 0).querySelector("input")!);
        expect(getCell(1, 0).querySelector("input")!).toHaveAttribute(
          "data-indeterminate",
          "true"
        );
        fireEvent.click(getCell(1, 0).querySelector("input")!);
        expect(apiRef.current.getSelectedRows().size).toEqual(0);
      });
    });

    describe("prop: keepNonExistentRowsSelected = true", () => {
      it("should keep non-existent rows selected on filtering", () => {
        render(<SelectionPropagationGrid keepNonExistentRowsSelected />);

        fireEvent.click(getCell(1, 0).querySelector("input")!);
        expect(Array.from(apiRef.current.getSelectedRows().keys())).toEqual([
          1, 2, 3, 4, 5, 6, 7,
        ]);

        act(() => {
          apiRef.current.setFilterModel({
            items: [
              {
                field: "jobTitle",
                value: "Head of Human Resources",
                operator: "equals",
              },
            ],
          });
        });

        fireEvent.click(getCell(0, 0).querySelector("input")!);

        expect(Array.from(apiRef.current.getSelectedRows().keys()).sort()).toEqual([
          0, 1, 2, 3, 4, 5, 6, 7,
        ]);
      });
    });
  });

  describe("apiRef: getSelectedRows", () => {
    it("should handle the event internally before triggering onRowSelectionModelChange", () => {
      render(
        <TestDataGridSelection
          onRowSelectionModelChange={(model) => {
            expect(apiRef.current.getSelectedRows().size).toBe(1);
            expect(model).toEqual([1]);
          }}
        />
      );
      expect(apiRef.current.getSelectedRows().size).toBe(0);
      act(() => apiRef.current.selectRow(1));
      expect(apiRef.current.getSelectedRows().get(1)).toEqual({
        id: 1,
        currencyPair: "USDEUR",
      });
    });
  });

  describe("apiRef: isRowSelected", () => {
    it("should check if the rows selected by clicking on the rows are selected", () => {
      render(<TestDataGridSelection />);

      fireEvent.click(getCell(1, 0));

      expect(apiRef.current.isRowSelected(0)).toEqual(false);
      expect(apiRef.current.isRowSelected(1)).toEqual(true);
    });

    it("should check if the rows selected with the rowSelectionModel prop are selected", () => {
      render(<TestDataGridSelection rowSelectionModel={[1]} />);

      expect(apiRef.current.isRowSelected(0)).toEqual(false);
      expect(apiRef.current.isRowSelected(1)).toEqual(true);
    });
  });

  describe("apiRef: selectRow", () => {
    it("should call onRowSelectionModelChange with the ids selected", () => {
      const handleRowSelectionModelChange = jest.fn();
      render(
        <TestDataGridSelection
          onRowSelectionModelChange={handleRowSelectionModelChange}
        />
      );
      act(() => apiRef.current.selectRow(1));
      expect(
        handleRowSelectionModelChange.mock.calls[
          handleRowSelectionModelChange.mock.calls.length - 1
        ][0]
      ).toEqual([1]);
      // Reset old selection
      act(() => apiRef.current.selectRow(2, true, true));
      expect(
        handleRowSelectionModelChange.mock.calls[
          handleRowSelectionModelChange.mock.calls.length - 1
        ][0]
      ).toEqual([2]);
      // Keep old selection
      act(() => apiRef.current.selectRow(3));
      expect(
        handleRowSelectionModelChange.mock.calls[
          handleRowSelectionModelChange.mock.calls.length - 1
        ][0]
      ).toEqual([2, 3]);
      act(() => apiRef.current.selectRow(3, false));
      expect(
        handleRowSelectionModelChange.mock.calls[
          handleRowSelectionModelChange.mock.calls.length - 1
        ][0]
      ).toEqual([2]);
    });

    it("should not call onRowSelectionModelChange if the row is unselectable", () => {
      const handleRowSelectionModelChange = jest.fn();
      render(
        <TestDataGridSelection
          isRowSelectable={(params) => Number(params.id) > 0}
          onRowSelectionModelChange={handleRowSelectionModelChange}
        />
      );
      act(() => apiRef.current.selectRow(0));
      expect(handleRowSelectionModelChange).toHaveBeenCalledTimes(0);
      act(() => apiRef.current.selectRow(1));
      expect(handleRowSelectionModelChange).toHaveBeenCalledTimes(1);
    });
  });

  describe("apiRef: selectRows", () => {
    it("should call onRowSelectionModelChange with the ids selected", () => {
      const handleRowSelectionModelChange = jest.fn();
      render(
        <TestDataGridSelection
          onRowSelectionModelChange={handleRowSelectionModelChange}
        />
      );

      act(() => apiRef.current.selectRows([1, 2]));
      expect(
        handleRowSelectionModelChange.mock.calls[
          handleRowSelectionModelChange.mock.calls.length - 1
        ][0]
      ).toEqual([1, 2]);

      act(() => apiRef.current.selectRows([3]));
      expect(
        handleRowSelectionModelChange.mock.calls[
          handleRowSelectionModelChange.mock.calls.length - 1
        ][0]
      ).toEqual([1, 2, 3]);

      act(() => apiRef.current.selectRows([1, 2], false));
      expect(
        handleRowSelectionModelChange.mock.calls[
          handleRowSelectionModelChange.mock.calls.length - 1
        ][0]
      ).toEqual([3]);

      // Deselect others
      act(() => apiRef.current.selectRows([4, 5], true, true));
      expect(
        handleRowSelectionModelChange.mock.calls[
          handleRowSelectionModelChange.mock.calls.length - 1
        ][0]
      ).toEqual([4, 5]);
    });

    it("should filter out unselectable rows before calling onRowSelectionModelChange", () => {
      const handleRowSelectionModelChange = jest.fn();
      render(
        <TestDataGridSelection
          isRowSelectable={(params) => Number(params.id) > 0}
          onRowSelectionModelChange={handleRowSelectionModelChange}
        />
      );
      act(() => apiRef.current.selectRows([0, 1, 2]));
      expect(
        handleRowSelectionModelChange.mock.calls[
          handleRowSelectionModelChange.mock.calls.length - 1
        ][0]
      ).toEqual([1, 2]);
    });

    it("should not select a range of several elements when disableMultipleRowSelection = true", () => {
      render(<TestDataGridSelection disableMultipleRowSelection />);

      act(() => apiRef.current.selectRows([0, 1, 2], true));
      expect(getSelectedRowIds()).toEqual([]);
    });
  });

  describe("apiRef: selectRowRange", () => {
    it("should select all the rows in the range", () => {
      render(<TestDataGridSelection />);

      act(() => apiRef.current.selectRowRange({ startId: 1, endId: 3 }, true));
      expect(getSelectedRowIds()).toEqual([1, 2, 3]);
    });

    it("should unselect all the rows in the range", () => {
      render(<TestDataGridSelection />);

      act(() => apiRef.current.setRowSelectionModel([2, 3]));
      expect(getSelectedRowIds()).toEqual([2, 3]);
      act(() => apiRef.current.selectRowRange({ startId: 0, endId: 3 }, false));
      expect(getSelectedRowIds()).toEqual([]);
    });

    it("should not unselect the selected elements if the range is to be selected", () => {
      render(<TestDataGridSelection />);

      act(() => {
        apiRef.current.setRowSelectionModel([2]);
        apiRef.current.selectRowRange({ startId: 1, endId: 3 }, true);
      });
      expect(getSelectedRowIds()).toEqual([1, 2, 3]);
    });

    it("should not reset the other selections when resetSelection = false", () => {
      render(<TestDataGridSelection />);

      act(() => {
        apiRef.current.setRowSelectionModel([0]);
        apiRef.current.selectRowRange({ startId: 2, endId: 3 }, true, false);
      });
      expect(getSelectedRowIds()).toEqual([0, 2, 3]);
    });

    it("should reset the other selections when resetSelection = true", () => {
      render(<TestDataGridSelection />);

      act(() => {
        apiRef.current.setRowSelectionModel([0]);
        apiRef.current.selectRowRange({ startId: 2, endId: 3 }, true, true);
      });
      expect(getSelectedRowIds()).toEqual([2, 3]);
    });

    it("should not select unselectable rows inside the range", () => {
      render(
        <TestDataGridSelection
          isRowSelectable={(params) => Number(params.id) % 2 === 1}
        />
      );

      act(() => apiRef.current.selectRowRange({ startId: 1, endId: 3 }, true));
      expect(getSelectedRowIds()).toEqual([1, 3]);
    });

    it("should not select a range of several elements when disableMultipleRowSelection = true", () => {
      render(<TestDataGridSelection disableMultipleRowSelection />);

      act(() => apiRef.current.selectRowRange({ startId: 1, endId: 3 }, true));
      expect(getSelectedRowIds()).toEqual([]);
    });

    it("should select only filtered rows selecting a range", () => {
      render(
        <TestDataGridSelection
          filterModel={{ items: [{ field: "id", value: 1, operator: "!=" }] }}
        />
      );
      act(() => apiRef.current.selectRowRange({ startId: 0, endId: 2 }, true));
      expect(getSelectedRowIds()).toEqual([0, 2]);
    });
  });

  it("should select only filtered rows after filter is applied", () => {
    render(<TestDataGridSelection checkboxSelection />);
    const selectAll = screen.getByRole("checkbox", {
      name: /select all rows/i,
    });
    act(() =>
      apiRef.current.setFilterModel({
        items: [
          {
            field: "currencyPair",
            value: "usd",
            operator: "startsWith",
          },
        ],
      })
    );
    expect(getColumnValues(1)).toEqual(["0", "1"]);
    fireEvent.click(selectAll);
    expect(getSelectedRowIds()).toEqual([0, 1]);
    fireEvent.click(selectAll);
    expect(getSelectedRowIds()).toEqual([]);
    fireEvent.click(selectAll);
    expect(getSelectedRowIds()).toEqual([0, 1]);
    fireEvent.click(selectAll);
    expect(getSelectedRowIds()).toEqual([]);
  });

  describe("controlled selection", () => {
    it('should not publish "rowSelectionChange" if the selection state did not change ', () => {
      const handleSelectionChange = jest.fn();
      const rowSelectionModel: GridRowSelectionModel = [];
      render(<TestDataGridSelection rowSelectionModel={rowSelectionModel} />);
      apiRef.current.subscribeEvent(
        "rowSelectionChange",
        handleSelectionChange
      );
      apiRef.current.setRowSelectionModel(rowSelectionModel);
      expect(handleSelectionChange).toHaveBeenCalledTimes(0);
    });

    it("should not call onRowSelectionModelChange on initialization if rowSelectionModel contains more than one id and checkboxSelection=false", () => {
      const onRowSelectionModelChange = jest.fn();
      render(
        <TestDataGridSelection
          onRowSelectionModelChange={onRowSelectionModelChange}
          rowSelectionModel={[0, 1]}
        />
      );
      expect(onRowSelectionModelChange).toHaveBeenCalledTimes(0);
    });
  });
});

describe("<DataGridPremium /> - Row selection", () => {
  // const { render } = createRenderer();

  describe("props: rowSelectionPropagation = { descendants: true, parents: true }", () => {
    let apiRef: React.MutableRefObject<GridApi>;

    function Test(props: Partial<DataGridPremiumProps>) {
      apiRef = useGridApiRef();

      return (
        <div style={{ width: 300, height: 300 }}>
          <DataGridPremium
            {...baselineProps}
            checkboxSelection
            apiRef={apiRef}
            rowSelectionPropagation={{
              descendants: true,
              parents: true,
            }}
            initialState={{ rowGrouping: { model: ["category1"] } }}
            {...props}
          />
        </div>
      );
    }

    it("should select all the children when selecting a parent", () => {
      render(<Test />);

      fireEvent.click(getCell(1, 0).querySelector("input")!);
      expect(Array.from(apiRef.current.getSelectedRows().keys())).toEqual([
        "auto-generated-row-category1/Cat B",
        3,
        4,
      ]);
    });

    it("should deselect all the children when deselecting a parent", () => {
      render(<Test />);

      fireEvent.click(getCell(1, 0).querySelector("input")!);
      expect(Array.from(apiRef.current.getSelectedRows().keys())).toEqual([
        "auto-generated-row-category1/Cat B",
        3,
        4,
      ]);
      fireEvent.click(getCell(1, 0).querySelector("input")!);
      expect(apiRef.current.getSelectedRows().size).toEqual(0);
    });

    it("should auto select the parent if all the children are selected", () => {
      render(<Test defaultGroupingExpansionDepth={-1} density="compact" />);

      fireEvent.click(getCell(1, 0).querySelector("input")!);
      fireEvent.click(getCell(2, 0).querySelector("input")!);
      fireEvent.click(getCell(3, 0).querySelector("input")!);
      expect(Array.from(apiRef.current.getSelectedRows().keys())).toEqual([
        0,
        1,
        2,
        "auto-generated-row-category1/Cat A",
      ]);
    });

    it("should deselect auto selected parent if one of the children is deselected", () => {
      render(<Test defaultGroupingExpansionDepth={-1} density="compact" />);

      fireEvent.click(getCell(1, 0).querySelector("input")!);
      fireEvent.click(getCell(2, 0).querySelector("input")!);
      fireEvent.click(getCell(3, 0).querySelector("input")!);
      expect(Array.from(apiRef.current.getSelectedRows().keys())).toEqual([
        0,
        1,
        2,
        "auto-generated-row-category1/Cat A",
      ]);
      fireEvent.click(getCell(2, 0).querySelector("input")!);
      expect(Array.from(apiRef.current.getSelectedRows().keys())).toEqual([0, 2]);
    });

    describe("prop: indeterminateCheckboxAction = 'select'", () => {
      it("should select all the children when selecting an indeterminate parent", async () => {
        render(
          <Test
            defaultGroupingExpansionDepth={-1}
            density="compact"
            indeterminateCheckboxAction="select"
          />
        );

        fireEvent.click(getCell(2, 0).querySelector("input")!);
        expect(getCell(0, 0).querySelector("input")!).toHaveAttribute(
          "data-indeterminate",
          "true"
        );
        fireEvent.click(getCell(0, 0).querySelector("input")!);
        await waitFor(() => {
          expect(Array.from(apiRef.current.getSelectedRows().keys())).toEqual(
            expect.arrayContaining([0, 1, 2, "auto-generated-row-category1/Cat A"])
          );
        });               
      });
    });

    describe("prop: indeterminateCheckboxAction = 'deselect'", () => {
      it("should deselect all the children when selecting an indeterminate parent", () => {
        render(
          <Test
            defaultGroupingExpansionDepth={-1}
            density="compact"
            indeterminateCheckboxAction="deselect"
          />
        );

        fireEvent.click(getCell(2, 0).querySelector("input")!);
        expect(getCell(0, 0).querySelector("input")!).toHaveAttribute(
          "data-indeterminate",
          "true"
        );
        fireEvent.click(getCell(0, 0).querySelector("input")!);
        expect(apiRef.current.getSelectedRows().size).toEqual(0);
      });
    });
  });
});

