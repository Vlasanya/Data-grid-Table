import * as React from "react";
import { GridSortModel, GridColDef } from "@mui/x-data-grid";
import { GridApi } from "../typeOverloads/reexports";
import { useGridApiRef } from "../hooks/utils/useGridApiRef";
import { DataGridPremium } from "../DataGridPremium/DataGridPremium";
import { DataGridPremiumProps } from "../models/dataGridPremiumProps";
import { render, fireEvent, screen, act } from "@testing-library/react";
import { getColumnValues, getCell, getColumnHeaderCell } from "./helperFn";

const isJSDOM = /jsdom/.test(window.navigator.userAgent);

describe("<DataGridPremium /> - Sorting", () => {
  const baselineProps: DataGridPremiumProps = {
    autoHeight: isJSDOM,
    rows: [
      {
        id: 0,
        brand: "Nike",
        year: "1940",
      },
      {
        id: 1,
        brand: "Adidas",
        year: "1940",
      },
      {
        id: 2,
        brand: "Puma",
        year: "1950",
      },
    ],
    columns: [{ field: "brand" }, { field: "year", type: "number" }],
  };

  let apiRef: React.MutableRefObject<GridApi>;

  function TestCase(props: Partial<DataGridPremiumProps>) {
    const { rows, ...other } = props;
    apiRef = useGridApiRef();
    return (
      <div style={{ width: 300, height: 300 }}>
        <DataGridPremium
          apiRef={apiRef}
          {...baselineProps}
          rows={props.rows || baselineProps.rows}
          {...other}
        />
      </div>
    );
  }

  const renderBrandSortedAsc = () => {
    const sortModel: GridSortModel = [{ field: "brand", sort: "asc" }];

    render(<TestCase sortModel={sortModel} />);
  };

  it("should apply the sortModel prop correctly", () => {
    renderBrandSortedAsc();
    expect(getColumnValues(0)).toEqual(["Adidas", "Nike", "Puma"]);
  });

  it("should apply the sortModel prop correctly on GridApiRef setRows", () => {
    renderBrandSortedAsc();
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
    expect(getColumnValues(0)).toEqual(["Asics", "Hugo", "RedBull"]);
  });

  it("should apply the sortModel prop correctly on GridApiRef update row data", () => {
    renderBrandSortedAsc();
    act(() => apiRef.current.updateRows([{ id: 1, brand: "Fila" }]));
    act(() => apiRef.current.updateRows([{ id: 0, brand: "Patagonia" }]));
    expect(getColumnValues(0)).toEqual(["Fila", "Patagonia", "Puma"]);
  });

  it("should allow apiRef to setSortModel", () => {
    render(<TestCase />);

    act(() => apiRef.current.setSortModel([{ field: "brand", sort: "desc" }]));
    expect(getColumnValues(0)).toEqual(["Puma", "Nike", "Adidas"]);
  });

  it("should allow multiple sort columns and", () => {
    const sortModel: GridSortModel = [
      { field: "year", sort: "desc" },
      { field: "brand", sort: "asc" },
    ];
    render(<TestCase sortModel={sortModel} />);
    expect(getColumnValues(0)).toEqual(["Puma", "Adidas", "Nike"]);
  });

  it("should allow to set multiple Sort items via apiRef", () => {
    render(<TestCase />);

    const sortModel: GridSortModel = [
      { field: "year", sort: "desc" },
      { field: "brand", sort: "asc" },
    ];

    act(() => apiRef.current.setSortModel(sortModel));
    expect(getColumnValues(0)).toEqual(["Puma", "Adidas", "Nike"]);
  });

  describe("multi-sorting", () => {
    ["shiftKey", "metaKey", "ctrlKey"].forEach((key) => {
      it(`should do a multi-sorting when clicking the header cell while ${key} is pressed`, () => {
        render(<TestCase />);
        act(() =>
          apiRef.current.setSortModel([{ field: "year", sort: "desc" }])
        );
        expect(getColumnValues(0)).toEqual(["Puma", "Nike", "Adidas"]);
        fireEvent.click(getColumnHeaderCell(0), { [key]: true });
        expect(getColumnValues(0)).toEqual(["Puma", "Adidas", "Nike"]);
      });
    });

    ["metaKey", "ctrlKey"].forEach((key) => {
      it(`should do nothing when pressing Enter while ${key} is pressed`, () => {
        render(<TestCase />);
        act(() =>
          apiRef.current.setSortModel([{ field: "year", sort: "desc" }])
        );
        expect(getColumnValues(0)).toEqual(["Puma", "Nike", "Adidas"]);
        act(() => getColumnHeaderCell(1).focus());
        fireEvent.keyDown(getColumnHeaderCell(1), {
          key: "Enter",
          [key]: true,
        });
        expect(getColumnValues(0)).toEqual(["Puma", "Nike", "Adidas"]);
      });
    });

    it("should do a multi-sorting pressing Enter while shiftKey is pressed", () => {
      render(<TestCase />);
      act(() => apiRef.current.setSortModel([{ field: "year", sort: "desc" }]));
      expect(getColumnValues(0)).toEqual(["Puma", "Nike", "Adidas"]);
      act(() => getColumnHeaderCell(0).focus());
      fireEvent.keyDown(getColumnHeaderCell(0), {
        key: "Enter",
        shiftKey: true,
      });
      expect(getColumnValues(0)).toEqual(["Puma", "Adidas", "Nike"]);
    });

    it(`should not do a multi-sorting if no multiple key is pressed`, () => {
      render(<TestCase />);
      act(() => apiRef.current.setSortModel([{ field: "year", sort: "desc" }]));
      expect(getColumnValues(0)).toEqual(["Puma", "Nike", "Adidas"]);
      fireEvent.click(getColumnHeaderCell(0));
      expect(getColumnValues(0)).toEqual(["Adidas", "Nike", "Puma"]);
    });

    it("should not do a multi-sorting if disableMultipleColumnsSorting is true", () => {
      render(<TestCase disableMultipleColumnsSorting />);
      act(() => apiRef.current.setSortModel([{ field: "year", sort: "desc" }]));
      expect(getColumnValues(0)).toEqual(["Puma", "Nike", "Adidas"]);
      fireEvent.click(getColumnHeaderCell(0), { shiftKey: true });
      expect(getColumnValues(0)).toEqual(["Adidas", "Nike", "Puma"]);
    });
  });

  it("should prune rendering on cells", function test() {
    // The number of renders depends on the user-agent
    if (!/HeadlessChrome/.test(window.navigator.userAgent) || !isJSDOM) {
      return;
    }

    let renderCellCount: number = 0;

    function CounterRender(props: { value: string }) {
      React.useEffect(() => {
        if (props.value === "Nike") {
          renderCellCount += 1;
        }
      });
      return <React.Fragment>{props.value}</React.Fragment>;
    }

    const columns: GridColDef[] = [
      {
        field: "brand",
        renderCell: (params) => <CounterRender value={params.value} />,
      },
    ];

    function Test(props: Omit<DataGridPremiumProps, "columns" | "rows">) {
      return (
        <div style={{ width: 300, height: 300 }}>
          <DataGridPremium
            {...baselineProps}
            columns={columns}
            checkboxSelection
            {...props}
          />
        </div>
      );
    }

    const { rerender } = render(<Test />);
    expect(renderCellCount).toEqual(1);
    const cell = getCell(1, 0);
    cell.focus();
    fireEvent.click(cell);
    expect(renderCellCount).toEqual(2);
    rerender(<Test {...baselineProps} />);
    expect(renderCellCount).toEqual(2);
  });

  describe("control Sorting", () => {
    it("should update the sorting state when neither the model nor the onChange are set", () => {
      render(<TestCase />);
      expect(getColumnValues(0)).toEqual(["Nike", "Adidas", "Puma"]);
      fireEvent.click(getColumnHeaderCell(0));
      expect(getColumnValues(0)).toEqual(["Adidas", "Nike", "Puma"]);
    });

    it("should not update the sort model when the sortModelProp is set", () => {
      const testSortModel: GridSortModel = [{ field: "brand", sort: "desc" }];
      render(<TestCase sortModel={testSortModel} />);
      expect(getColumnValues(0)).toEqual(["Puma", "Nike", "Adidas"]);
      fireEvent.click(getColumnHeaderCell(0));
      expect(getColumnValues(0)).toEqual(["Puma", "Nike", "Adidas"]);
    });

    it("should update the sort state when the model is not set, but the onChange is set", () => {
      const onModelChange = jest.fn();
      render(<TestCase onSortModelChange={onModelChange} />);
      expect(onModelChange).toHaveBeenCalledTimes(0);
      fireEvent.click(getColumnHeaderCell(0));
      expect(onModelChange).toHaveBeenCalledTimes(1);
      expect(onModelChange.mock.calls[onModelChange.mock.calls.length - 1][0]).toEqual([{ field: "brand", sort: "asc" }]);
    });

    it("should control sort state when the model and the onChange are set", () => {
      let expectedModel: GridSortModel = [];
      function ControlCase(props: Partial<DataGridPremiumProps>) {
        const { rows, columns, ...others } = props;
        const [caseSortModel, setSortModel] = React.useState<GridSortModel>([]);
        const handleSortChange: DataGridPremiumProps["onSortModelChange"] = (
          newModel
        ) => {
          setSortModel(newModel);
          expectedModel = newModel;
        };

        return (
          <div style={{ width: 300, height: 300 }}>
            <DataGridPremium
              autoHeight={isJSDOM}
              columns={columns || baselineProps.columns}
              rows={rows || baselineProps.rows}
              sortModel={caseSortModel}
              onSortModelChange={handleSortChange}
              {...others}
            />
          </div>
        );
      }

      render(<ControlCase />);
      fireEvent.click(getColumnHeaderCell(0));
      expect(getColumnValues(0)).toEqual(["Adidas", "Nike", "Puma"]);
      expect(expectedModel).toEqual([{ field: "brand", sort: "asc" }]);
    });

    it("should not call onSortModelChange on initialization or on sortModel prop change", () => {
      const onSortModelChange = jest.fn();

      function Test(props: Partial<DataGridPremiumProps>) {
        return (
          <div style={{ width: 300, height: 300 }}>
            <DataGridPremium
              autoHeight={isJSDOM}
              columns={baselineProps.columns}
              rows={baselineProps.rows}
              onSortModelChange={onSortModelChange}
              {...props}
            />
          </div>
        );
      }

      const { rerender } = render(
        <Test
          sortModel={[
            { field: "year", sort: "desc" },
            { field: "brand", sort: "asc" },
          ]}
        />
      );

      expect(onSortModelChange).toHaveBeenCalledTimes(0);
      rerender(<Test sortModel={[{ field: "year", sort: "asc" }, { field: "brand", sort: "asc" }]} />);

      expect(onSortModelChange).toHaveBeenCalledTimes(0);
    });
  });
});
