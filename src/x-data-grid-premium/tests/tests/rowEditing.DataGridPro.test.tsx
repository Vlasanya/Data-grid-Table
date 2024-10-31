import * as React from "react";
// import { expect } from 'chai';
// import { spy } from 'sinon';
import {
  GridRenderEditCellParams,
  GridValueSetter,
  GridPreProcessEditCellProps,
} from "@mui/x-data-grid";
import Portal from "@mui/material/Portal";
import { getBasicGridData } from "../test/utils/basic-data-service";
// import { createRenderer, fireEvent, act, screen } from '@mui/internal-test-utils';
import { getCell, getRow, spyApi } from "../helperFn";
// import { userEvent } from 'test/utils/userEvent';
import userEvent from "@testing-library/user-event";
import { GridApi } from "../../typeOverloads/reexports";
import { useGridApiRef } from "../../hooks/utils/useGridApiRef";
import { DataGridPremium } from "../../DataGridPremium/DataGridPremium";
import { DataGridPremiumProps } from "../../models/dataGridPremiumProps";
// import { createRenderer, act } from '@mui/internal-test-utils';
import {
  render,
  fireEvent,
  act,
  screen,
  waitFor,
} from "@testing-library/react";
import { GridRowModes } from "@mui/x-data-grid";

describe("<DataGridPremium /> - Row editing", () => {
  // const { render, clock } = createRenderer();

  let apiRef: React.MutableRefObject<GridApi>;

  const defaultData = getBasicGridData(4, 4);

  function CustomEditComponent({ hasFocus }: GridRenderEditCellParams) {
    const ref = React.useRef<HTMLInputElement>(null);
    React.useLayoutEffect(() => {
      if (hasFocus) {
        ref.current!.focus({ preventScroll: true });
      }
    }, [hasFocus]);
    return <input ref={ref} />;
  }

  const defaultRenderEditCell = (props: GridRenderEditCellParams) => (
    <CustomEditComponent {...props} />
  );

  function TestCase(
    props: Partial<DataGridPremiumProps> & {
      column1Props?: any;
      column2Props?: any;
    }
  ) {
    apiRef = useGridApiRef();
    const { column1Props = {}, column2Props = {}, ...rest } = props;
    return (
      <div style={{ width: 300, height: 300 }}>
        <DataGridPremium
          apiRef={apiRef}
          editMode="row"
          disableVirtualization
          {...defaultData}
          columns={defaultData.columns.map((column) => {
            if (column.field === "currencyPair") {
              return {
                ...column,
                renderEditCell: defaultRenderEditCell,
                editable: true,
                ...column1Props,
              };
            }
            if (column.field === "price1M") {
              return {
                ...column,
                renderEditCell: defaultRenderEditCell,
                editable: true,
                ...column2Props,
              };
            }
            return column;
          })}
          {...rest}
        />
      </div>
    );
  }

  describe("apiRef", () => {
    describe("startRowEditMode", () => {
      it("should throw when the row is already in edit mode", () => {
        render(<TestCase />);
        act(() => apiRef.current.startRowEditMode({ id: 0 }));
        expect(() =>
          act(() => apiRef.current.startRowEditMode({ id: 0 }))
        ).toThrow("MUI X: The row with id=0 is not in view mode.");
      });

      it("should update the CSS class of all editable cells", () => {
        render(<TestCase />);
        expect(getCell(0, 1)).not.toHaveClass("MuiDataGrid-cell--editing");
        act(() => apiRef.current.startRowEditMode({ id: 0 }));
        expect(getCell(0, 1)).toHaveClass("MuiDataGrid-cell--editing");
        expect(getCell(0, 2)).toHaveClass("MuiDataGrid-cell--editing");
        expect(getCell(0, 3)).not.toHaveClass("MuiDataGrid-cell--editing");
      });

      it("should update the CSS class of the row", () => {
        render(<TestCase />);
        expect(getRow(0)).not.toHaveClass("MuiDataGrid-row--editing");
        act(() => apiRef.current.startRowEditMode({ id: 0 }));
        expect(getRow(0)).toHaveClass("MuiDataGrid-row--editing");
      });

      it("should render the components given in renderEditCell", () => {
        const renderEditCell1 = jest.fn(defaultRenderEditCell);
        const renderEditCell2 = jest.fn(defaultRenderEditCell);

        render(
          <TestCase
            column1Props={{ renderEditCell: renderEditCell1 }}
            column2Props={{ renderEditCell: renderEditCell2 }}
          />
        );
        expect(renderEditCell1.mock.calls).toEqual([]);
        expect(renderEditCell2.mock.calls).toEqual([]);
        act(() => apiRef.current.startRowEditMode({ id: 0 }));
        expect(renderEditCell1.mock.calls).not.toEqual(0);
        expect(renderEditCell2.mock.calls).not.toEqual(0);
      });

      it("should pass props to renderEditCell", () => {
        const renderEditCell1 = jest.fn(defaultRenderEditCell);
        const renderEditCell2 = jest.fn(defaultRenderEditCell);

        render(
          <TestCase
            column1Props={{ renderEditCell: renderEditCell1 }}
            column2Props={{ renderEditCell: renderEditCell2 }}
          />
        );
        act(() => apiRef.current.startRowEditMode({ id: 0 }));
        expect(
          renderEditCell1.mock.calls[renderEditCell1.mock.calls.length - 1][0]
            .value
        ).toEqual("USDGBP");
        expect(
          renderEditCell1.mock.calls[renderEditCell1.mock.calls.length - 1][0]
            .error
        ).toEqual(false);
        expect(
          renderEditCell1.mock.calls[renderEditCell1.mock.calls.length - 1][0]
            .isProcessingProps
        ).toEqual(false);
        expect(
          renderEditCell2.mock.calls[renderEditCell1.mock.calls.length - 1][0]
            .value
        ).toEqual(1);
        expect(
          renderEditCell2.mock.calls[renderEditCell1.mock.calls.length - 1][0]
            .error
        ).toEqual(false);
        expect(
          renderEditCell2.mock.calls[renderEditCell1.mock.calls.length - 1][0]
            .isProcessingProps
        ).toEqual(false);
      });

      it("should empty the value if deleteValue is true", () => {
        const renderEditCell1 = jest.fn(defaultRenderEditCell);
        const renderEditCell2 = jest.fn(defaultRenderEditCell);

        render(
          <TestCase
            column1Props={{ renderEditCell: renderEditCell1 }}
            column2Props={{ renderEditCell: renderEditCell2 }}
          />
        );

        act(() =>
          apiRef.current.startRowEditMode({
            id: 0,
            fieldToFocus: "currencyPair",
            deleteValue: true,
          })
        );
        expect(
          renderEditCell1.mock.calls[renderEditCell1.mock.calls.length - 1][0]
            .value
        ).toEqual("");
        expect(
          renderEditCell2.mock.calls[renderEditCell1.mock.calls.length - 1][0]
            .value
        ).toEqual(1);
      });
    });

    describe("setEditCellValue", () => {
      it("should update the value prop given to renderEditCell", async () => {
        const renderEditCell1 = jest.fn(defaultRenderEditCell);
        const renderEditCell2 = jest.fn(defaultRenderEditCell);

        render(
          <TestCase
            column1Props={{ renderEditCell: renderEditCell1 }}
            column2Props={{ renderEditCell: renderEditCell2 }}
          />
        );

        act(() => apiRef.current.startRowEditMode({ id: 0 }));
        expect(
          renderEditCell1.mock.calls[renderEditCell1.mock.calls.length - 1][0]
            .value
        ).toEqual("USDGBP");
        // await act(() =>
        //   apiRef.current.setEditCellValue({ id: 0, field: 'currencyPair', value: 'usdgbp' }),
        // );
        await act(async () =>
          apiRef.current.setEditCellValue({
            id: 0,
            field: "currencyPair",
            value: "usdgbp",
          })
        );
        expect(
          renderEditCell1.mock.calls[renderEditCell1.mock.calls.length - 1][0]
            .value
        ).toEqual("usdgbp");
      });

      it("should pass to renderEditCell the row with the values updated", async () => {
        const valueSetter: GridValueSetter = (value, row) => ({
          ...row,
          currencyPair: value.trim(),
        });
        const renderEditCell1 = jest.fn(defaultRenderEditCell);
        const renderEditCell2 = jest.fn(defaultRenderEditCell);

        render(
          <TestCase
            column1Props={{ renderEditCell: renderEditCell1, valueSetter }}
            column2Props={{ renderEditCell: renderEditCell2 }}
          />
        );
        act(() => apiRef.current.startRowEditMode({ id: 0 }));
        expect(
          renderEditCell1.mock.calls[renderEditCell1.mock.calls.length - 1][0]
            .row
        ).toEqual(defaultData.rows[0]);
        await act(async () =>
          apiRef.current.setEditCellValue({
            id: 0,
            field: "currencyPair",
            value: " usdgbp ",
          })
        );
        await act(async () =>
          apiRef.current.setEditCellValue({
            id: 0,
            field: "price1M",
            value: 100,
          })
        );
        expect(
          renderEditCell2.mock.calls[renderEditCell1.mock.calls.length - 1][0]
            .row
        ).toEqual({
          ...defaultData.rows[0],
          currencyPair: "usdgbp",
          price1M: 100,
        });
      });

      it("should pass the new value through the value parser if defined", async () => {
        const valueParser = jest.fn((value) => value.toLowerCase());
        const renderEditCell = jest.fn(defaultRenderEditCell);

        render(<TestCase column1Props={{ renderEditCell, valueParser }} />);
        act(() => apiRef.current.startRowEditMode({ id: 0 }));
        expect(valueParser.mock.calls).toEqual([]);
        await act(async () =>
          apiRef.current.setEditCellValue({
            id: 0,
            field: "currencyPair",
            value: "USD GBP",
          })
        );
        expect(valueParser).toHaveBeenCalledTimes(1);
        expect(
          renderEditCell.mock.calls[renderEditCell.mock.calls.length - 1][0]
            .value
        ).toEqual("usd gbp");
      });

      it("should return true if no preProcessEditCellProps is defined", async () => {
        render(<TestCase />);
        act(() => apiRef.current.startRowEditMode({ id: 0 }));
        expect(
          await act(async () =>
            apiRef.current.setEditCellValue({
              id: 0,
              field: "currencyPair",
              value: "USD GBP",
            })
          )
        ).toEqual(true);
      });

      it("should set isProcessingProps to true before calling preProcessEditCellProps", async () => {
        const preProcessEditCellProps = () => new Promise(() => {});
        const renderEditCell = jest.fn(defaultRenderEditCell);
        render(
          <TestCase
            column1Props={{ preProcessEditCellProps, renderEditCell }}
          />
        );
        act(() => apiRef.current.startRowEditMode({ id: 0 }));
        await act(
          () =>
            new Promise<void>((resolve) => {
              apiRef.current.setEditCellValue({
                id: 0,
                field: "currencyPair",
                value: "USD GBP",
              });
              resolve();
            })
        );
        expect(
          renderEditCell.mock.calls[renderEditCell.mock.calls.length - 1][0]
            .isProcessingProps
        ).toEqual(true);
      });

      it("should call all preProcessEditCellProps with the correct params", async () => {
        const preProcessEditCellProps1 = jest.fn(
          ({ props }: GridPreProcessEditCellProps) => props
        );
        const preProcessEditCellProps2 = jest.fn(
          ({ props }: GridPreProcessEditCellProps) => props
        );
        render(
          <TestCase
            column1Props={{ preProcessEditCellProps: preProcessEditCellProps1 }}
            column2Props={{ preProcessEditCellProps: preProcessEditCellProps2 }}
          />
        );
        act(() => apiRef.current.startRowEditMode({ id: 0 }));
        await act(async () =>
          apiRef.current.setEditCellValue({
            id: 0,
            field: "currencyPair",
            value: "USD GBP",
          })
        );

        const args1 =
          preProcessEditCellProps1.mock.calls[
            preProcessEditCellProps1.mock.calls.length - 1
          ][0];
        expect(args1.id).toEqual(0);
        expect(args1.row).toEqual(defaultData.rows[0]);
        expect(args1.hasChanged).toEqual(true);
        expect(args1.props).toEqual({
          value: "USD GBP",
          error: false,
          isProcessingProps: true,
          changeReason: "setEditCellValue",
        });

        const args2 =
          preProcessEditCellProps2.mock.calls[
            preProcessEditCellProps2.mock.calls.length - 1
          ][0];
        expect(args2.id).toEqual(0);
        expect(args2.row).toEqual(defaultData.rows[0]);
        expect(args2.hasChanged).toEqual(false);
        expect(args2.props).toEqual({
          value: 1,
          error: false,
          isProcessingProps: true,
        });
      });

      it("should pass to renderEditCell the props returned by preProcessEditCellProps", async () => {
        const renderEditCell = jest.fn(defaultRenderEditCell);
        const preProcessEditCellProps = ({
          props,
        }: GridPreProcessEditCellProps) => ({
          ...props,
          foo: "bar",
        });
        render(
          <TestCase
            column1Props={{ preProcessEditCellProps, renderEditCell }}
          />
        );
        act(() => apiRef.current.startRowEditMode({ id: 0 }));
        expect(
          renderEditCell.mock.calls[renderEditCell.mock.calls.length - 1][0].foo
        ).toEqual(undefined);
        await act(async () =>
          apiRef.current.setEditCellValue({
            id: 0,
            field: "currencyPair",
            value: "USD GBP",
          })
        );
        expect(
          renderEditCell.mock.calls[renderEditCell.mock.calls.length - 1][0].foo
        ).toEqual("bar");
      });

      it("should not pass to renderEditCell the value returned by preProcessEditCellProps", async () => {
        const renderEditCell = jest.fn(defaultRenderEditCell);
        const preProcessEditCellProps = ({
          props,
        }: GridPreProcessEditCellProps) => ({
          ...props,
          value: "foobar",
        });
        render(
          <TestCase
            column1Props={{ preProcessEditCellProps, renderEditCell }}
          />
        );
        act(() => apiRef.current.startRowEditMode({ id: 0 }));
        expect(
          renderEditCell.mock.calls[renderEditCell.mock.calls.length - 1][0]
            .value
        ).toEqual("USDGBP");
        await act(async () =>
          apiRef.current.setEditCellValue({
            id: 0,
            field: "currencyPair",
            value: "USD GBP",
          })
        );
        expect(
          renderEditCell.mock.calls[renderEditCell.mock.calls.length - 1][0]
            .value
        ).toEqual("USD GBP");
      });

      it("should set isProcessingProps to false after calling preProcessEditCellProps", async () => {
        let resolve1: () => void;
        let resolve2: () => void;
        const renderEditCell1 = jest.fn(defaultRenderEditCell);
        const renderEditCell2 = jest.fn(defaultRenderEditCell);

        const preProcessEditCellProps1 = ({
          props,
        }: GridPreProcessEditCellProps) =>
          new Promise((resolve) => {
            resolve1 = () => resolve(props);
          });
        const preProcessEditCellProps2 = ({
          props,
        }: GridPreProcessEditCellProps) =>
          new Promise((resolve) => {
            resolve2 = () => resolve(props);
          });

        render(
          <TestCase
            column1Props={{
              preProcessEditCellProps: preProcessEditCellProps1,
              renderEditCell: renderEditCell1,
            }}
            column2Props={{
              preProcessEditCellProps: preProcessEditCellProps2,
              renderEditCell: renderEditCell2,
            }}
          />
        );
        act(() => apiRef.current.startRowEditMode({ id: 0 }));
        let promise: Promise<boolean>;
        await act(
          () =>
            new Promise<void>((resolve) => {
              promise = apiRef.current.setEditCellValue({
                id: 0,
                field: "currencyPair",
                value: "USD GBP",
              }) as Promise<boolean>;
              resolve();
            })
        );
        expect(
          renderEditCell1.mock.calls[renderEditCell1.mock.calls.length - 1][0]
            .isProcessingProps
        ).toEqual(true);
        expect(
          renderEditCell2.mock.calls[renderEditCell1.mock.calls.length - 1][0]
            .isProcessingProps
        ).toEqual(true);
        resolve1!();
        resolve2!();
        await act(() => promise);
        expect(
          renderEditCell1.mock.calls[renderEditCell1.mock.calls.length - 1][0]
            .isProcessingProps
        ).toEqual(false);
        expect(
          renderEditCell2.mock.calls[renderEditCell1.mock.calls.length - 1][0]
            .isProcessingProps
        ).toEqual(false);
      });

      it("should return false if preProcessEditCellProps sets an error", async () => {
        const preProcessEditCellProps = ({
          props,
        }: GridPreProcessEditCellProps) => ({
          ...props,
          error: true,
        });
        render(<TestCase column1Props={{ preProcessEditCellProps }} />);
        act(() => apiRef.current.startRowEditMode({ id: 0 }));
        expect(
          await act(async () =>
            apiRef.current.setEditCellValue({
              id: 0,
              field: "currencyPair",
              value: "USD GBP",
            })
          )
        ).toEqual(false);
      });

      it("should return false if the cell left the edit mode while calling preProcessEditCellProps", async () => {
        let resolveCallback: () => void;
        const preProcessEditCellProps = ({
          props,
        }: GridPreProcessEditCellProps) =>
          new Promise((resolve) => {
            resolveCallback = () => resolve(props);
          });
        render(<TestCase column1Props={{ preProcessEditCellProps }} />);
        act(() => apiRef.current.startRowEditMode({ id: 0 }));

        let promise: Promise<boolean>;
        act(() => {
          promise = apiRef.current.setEditCellValue({
            id: 0,
            field: "currencyPair",
            value: "USD GBP",
          }) as Promise<boolean>;
        });

        act(() =>
          apiRef.current.stopRowEditMode({
            id: 0,
            ignoreModifications: true,
          })
        );

        resolveCallback!();

        expect(await act(async () => promise)).toEqual(false);
      });

      describe("with debounceMs > 0", () => {
        jest.useFakeTimers();

        it("should debounce multiple changes if debounceMs > 0", async () => {
          const renderEditCell = jest.fn(defaultRenderEditCell);
          render(<TestCase column1Props={{ renderEditCell }} />);
          act(() => apiRef.current.startRowEditMode({ id: 0 }));
          expect(
            renderEditCell.mock.calls[renderEditCell.mock.calls.length - 1][0]
              .value
          ).toEqual("USDGBP");
          renderEditCell.mockClear();
          act(() => {
            apiRef.current.setEditCellValue({
              id: 0,
              field: "currencyPair",
              value: "USD",
              debounceMs: 100,
            });
          });
          expect(renderEditCell.mock.calls).toEqual([]);
          act(() => {
            apiRef.current.setEditCellValue({
              id: 0,
              field: "currencyPair",
              value: "USD GBP",
              debounceMs: 100,
            });
          });
          expect(renderEditCell.mock.calls).toEqual([]);
          act(() => jest.advanceTimersByTime(100));
          await waitFor(() => {
            expect(renderEditCell.mock.calls).not.toHaveLength(0);
            expect(
              renderEditCell.mock.calls[renderEditCell.mock.calls.length - 1][0]
                .value
            ).toEqual("USD GBP");
          });
        });
      });
    });

    describe("stopRowEditMode", () => {
      it("should reject when the cell is not in edit mode", async () => {
        render(<TestCase />);
        expect(() => apiRef.current.stopRowEditMode({ id: 0 })).toThrow(
          "MUI X: The row with id=0 is not in edit mode."
        );
      });

      it("should update the row with the new value stored", async () => {
        render(<TestCase />);
        await act(async () => apiRef.current.startRowEditMode({ id: 0 }));
        await act(async () =>
          apiRef.current.setEditCellValue({
            id: 0,
            field: "currencyPair",
            value: "USD GBP",
          })
        );
        await act(async () => apiRef.current.stopRowEditMode({ id: 0 }));
        expect(getCell(0, 1).textContent).toEqual("USD GBP");
      });

      it("should not update the row if ignoreModifications=true", async () => {
        render(<TestCase />);
        act(() => apiRef.current.startRowEditMode({ id: 0 }));
        await act(async () =>
          apiRef.current.setEditCellValue({
            id: 0,
            field: "currencyPair",
            value: "USD GBP",
          })
        );
        act(() =>
          apiRef.current.stopRowEditMode({ id: 0, ignoreModifications: true })
        );
        expect(getCell(0, 1).textContent).toEqual("USDGBP");
      });

      it("should do nothing if props are still being processed and ignoreModifications=false", async () => {
        let resolveCallback: () => void;
        const preProcessEditCellProps = ({
          props,
        }: GridPreProcessEditCellProps) =>
          new Promise((resolve) => {
            resolveCallback = () => resolve(props);
          });

        render(<TestCase column1Props={{ preProcessEditCellProps }} />);
        act(() => apiRef.current.startRowEditMode({ id: 0 }));

        let promise: Promise<boolean>;
        act(() => {
          promise = apiRef.current.setEditCellValue({
            id: 0,
            field: "currencyPair",
            value: "USD GBP",
          }) as Promise<boolean>;
        });

        // Simulates the user stopping the editing while processing the props
        act(() => apiRef.current.stopRowEditMode({ id: 0 }));

        expect(getCell(0, 1)).toHaveClass("MuiDataGrid-cell--editing");

        resolveCallback!();

        await act(() => promise); // Run all updates scheduled for when preProcessEditCellProps resolves
      });

      it("should do nothing if props of any column contains error=true", async () => {
        const preProcessEditCellProps = ({
          props,
        }: GridPreProcessEditCellProps) => ({
          ...props,
          error: true,
        });
        render(<TestCase column1Props={{ preProcessEditCellProps }} />);
        act(() => apiRef.current.startRowEditMode({ id: 0 }));
        await act(async () =>
          apiRef.current.setEditCellValue({
            id: 0,
            field: "currencyPair",
            value: "USD GBP",
          })
        );
        act(() => apiRef.current.stopRowEditMode({ id: 0 }));
        expect(getCell(0, 1)).toHaveClass("MuiDataGrid-cell--editing");
      });

      it("should keep mode=edit if props of any column contains error=true", async () => {
        const preProcessEditCellProps = ({
          props,
        }: GridPreProcessEditCellProps) => ({
          ...props,
          error: true,
        });
        const onRowModesModelChange = jest.fn();
        render(
          <TestCase
            onRowModesModelChange={onRowModesModelChange}
            column1Props={{ preProcessEditCellProps }}
          />
        );
        act(() => apiRef.current.startRowEditMode({ id: 0 }));
        await act(async () =>
          apiRef.current.setEditCellValue({
            id: 0,
            field: "currencyPair",
            value: "USD GBP",
          })
        );
        act(() => apiRef.current.stopRowEditMode({ id: 0 }));
        expect(
          onRowModesModelChange.mock.calls[
            onRowModesModelChange.mock.calls.length - 1
          ][0]
        ).toEqual({ 0: { mode: "edit" } });
      });

      it("should allow a 2nd call if the first call was when error=true", async () => {
        const preProcessEditCellProps = ({
          props,
        }: GridPreProcessEditCellProps) => ({
          ...props,
          error: props.value.length === 0,
        });
        render(<TestCase column1Props={{ preProcessEditCellProps }} />);
        act(() => apiRef.current.startRowEditMode({ id: 0 }));

        await act(async () =>
          apiRef.current.setEditCellValue({
            id: 0,
            field: "currencyPair",
            value: "",
          })
        );
        act(() => apiRef.current.stopRowEditMode({ id: 0 }));
        expect(getCell(0, 1)).toHaveClass("MuiDataGrid-cell--editing");

        await act(async () =>
          apiRef.current.setEditCellValue({
            id: 0,
            field: "currencyPair",
            value: "USD GBP",
          })
        );
        act(() => apiRef.current.stopRowEditMode({ id: 0 }));
        expect(getCell(0, 1)).not.toHaveClass("MuiDataGrid-cell--editing");
      });

      it("should update the CSS class of the cell", async () => {
        render(<TestCase />);
        act(() => apiRef.current.startRowEditMode({ id: 0 }));
        expect(getCell(0, 1)).toHaveClass("MuiDataGrid-cell--editing");
        await act(async () =>
          apiRef.current.setEditCellValue({
            id: 0,
            field: "currencyPair",
            value: "USD GBP",
          })
        );
        act(() => apiRef.current.stopRowEditMode({ id: 0 }));
        expect(getCell(0, 1)).not.toHaveClass("MuiDataGrid-cell--editing");
      });

      it("should call processRowUpdate before updating the row", async () => {
        const processRowUpdate = jest.fn((row) => ({
          ...row,
          currencyPair: "USD-GBP",
        }));
        render(<TestCase processRowUpdate={processRowUpdate} />);
        act(() => apiRef.current.startRowEditMode({ id: 0 }));
        await act(async () =>
          apiRef.current.setEditCellValue({
            id: 0,
            field: "currencyPair",
            value: "USD GBP",
          })
        );
        act(() => apiRef.current.stopRowEditMode({ id: 0 }));
        await act(() => Promise.resolve());
        expect(processRowUpdate).toHaveBeenCalledTimes(1);
        expect(getCell(0, 1).textContent).toEqual("USD-GBP");
      });

      it("should call processRowUpdate with the new and old row", async () => {
        const processRowUpdate = jest.fn((newRow, oldRow) => ({
          ...oldRow,
          ...newRow,
        }));
        render(<TestCase processRowUpdate={processRowUpdate} />);
        act(() => apiRef.current.startRowEditMode({ id: 0 }));
        await act(async () =>
          apiRef.current.setEditCellValue({
            id: 0,
            field: "currencyPair",
            value: "USD GBP",
          })
        );
        act(() => apiRef.current.stopRowEditMode({ id: 0 }));
        await act(() => Promise.resolve());
        expect(
          processRowUpdate.mock.calls[processRowUpdate.mock.calls.length - 1][0]
        ).toEqual({
          ...defaultData.rows[0],
          currencyPair: "USD GBP",
        });
        expect(
          processRowUpdate.mock.calls[processRowUpdate.mock.calls.length - 1][1]
        ).toEqual(defaultData.rows[0]);
      });

      it("should stay in edit mode if processRowUpdate throws an error", async () => {
        const processRowUpdate = jest.fn(() => {
          throw new Error("Something went wrong");
        });

        render(<TestCase processRowUpdate={processRowUpdate} />);
        act(() => apiRef.current.startRowEditMode({ id: 0 }));

        try {
          await act(async () => {
            apiRef.current.stopRowEditMode({ id: 0 });
          });
        } catch (err) {
          expect((err as Error).message).toBe(
            "MUI X: A call to `processRowUpdate` threw an error which was not handled because `onProcessRowUpdateError` is missing."
          );
        }
        expect(getCell(0, 1)).toHaveClass("MuiDataGrid-cell--editing");
      });

      it("should call onProcessRowUpdateError if processRowUpdate throws an error", () => {
        const error = new Error("Something went wrong");
        const processRowUpdate = () => {
          throw error;
        };
        const onProcessRowUpdateError = jest.fn();
        render(
          <TestCase
            processRowUpdate={processRowUpdate}
            onProcessRowUpdateError={onProcessRowUpdateError}
          />
        );
        act(() => apiRef.current.startRowEditMode({ id: 0 }));
        act(() => apiRef.current.stopRowEditMode({ id: 0 }));
        expect(
          onProcessRowUpdateError.mock.calls[
            onProcessRowUpdateError.mock.calls.length - 1
          ][0]
        ).toEqual(error);
      });

      it("should call onProcessRowUpdateError if processRowUpdate rejects", async () => {
        const error = new Error("Something went wrong");
        const processRowUpdate = () => {
          throw error;
        };
        const onProcessRowUpdateError = jest.fn();
        render(
          <TestCase
            processRowUpdate={processRowUpdate}
            onProcessRowUpdateError={onProcessRowUpdateError}
          />
        );
        act(() => apiRef.current.startRowEditMode({ id: 0 }));
        act(() => apiRef.current.stopRowEditMode({ id: 0 }));
        await Promise.resolve();
        expect(
          onProcessRowUpdateError.mock.calls[
            onProcessRowUpdateError.mock.calls.length - 1
          ][0]
        ).toEqual(error);
      });

      it("should keep mode=edit if processRowUpdate rejects", async () => {
        const error = new Error("Something went wrong");
        const processRowUpdate = () => {
          throw error;
        };
        const onProcessRowUpdateError = jest.fn();
        const onRowModesModelChange = jest.fn();
        render(
          <TestCase
            onRowModesModelChange={onRowModesModelChange}
            processRowUpdate={processRowUpdate}
            onProcessRowUpdateError={onProcessRowUpdateError}
          />
        );
        act(() => apiRef.current.startRowEditMode({ id: 0 }));
        await act(async () =>
          apiRef.current.setEditCellValue({
            id: 0,
            field: "currencyPair",
            value: "USD GBP",
          })
        );
        act(() => apiRef.current.stopRowEditMode({ id: 0 }));
        expect(
          onRowModesModelChange.mock.calls[
            onRowModesModelChange.mock.calls.length - 1
          ][0]
        ).toEqual({ 0: { mode: "edit" } });
      });

      it("should pass the new value through all value setters before calling processRowUpdate", async () => {
        const valueSetter1 = jest.fn((value, row) => ({
          ...row,
          _currencyPair: value,
        }));
        const valueSetter2 = jest.fn((value, row) => ({
          ...row,
          _price1M: value,
        }));
        const processRowUpdate = jest.fn((newRow) => newRow);
        render(
          <TestCase
            processRowUpdate={processRowUpdate}
            column1Props={{ valueSetter: valueSetter1 }}
            column2Props={{ valueSetter: valueSetter2 }}
          />
        );
        act(() => apiRef.current.startRowEditMode({ id: 0 }));
        await act(async () =>
          apiRef.current.setEditCellValue({
            id: 0,
            field: "currencyPair",
            value: "USD GBP",
          })
        );
        act(() => apiRef.current.stopRowEditMode({ id: 0 }));
        await act(() => Promise.resolve());
        expect(
          processRowUpdate.mock.calls[processRowUpdate.mock.calls.length - 1][0]
        ).toEqual({
          ...defaultData.rows[0],
          currencyPair: "USDGBP",
          _currencyPair: "USD GBP",
          price1M: 1,
          _price1M: 1,
        });
        expect(
          valueSetter1.mock.calls[valueSetter1.mock.calls.length - 1][0]
        ).toEqual("USD GBP");
        expect(
          valueSetter1.mock.calls[valueSetter1.mock.calls.length - 1][1]
        ).toEqual(defaultData.rows[0]);

        expect(
          valueSetter2.mock.calls[valueSetter2.mock.calls.length - 1][0]
        ).toEqual(1);
        expect(
          valueSetter2.mock.calls[valueSetter2.mock.calls.length - 1][1]
        ).toEqual({
          // Ensure that the row contains the values from the previous setter);
          ...defaultData.rows[0],
          currencyPair: "USDGBP",
          _currencyPair: "USD GBP",
        });
      });

      it("should move focus to the cell below when cellToFocusAfter=below", () => {
        render(<TestCase />);
        act(() =>
          apiRef.current.startRowEditMode({
            id: 0,
            fieldToFocus: "currencyPair",
          })
        );
        expect(getCell(0, 1).querySelector("input")).toHaveFocus();
        act(() =>
          apiRef.current.stopRowEditMode({
            id: 0,
            field: "currencyPair",
            cellToFocusAfter: "below",
          })
        );
        expect(getCell(1, 1)).toHaveFocus();
      });

      it("should move focus to the cell below when cellToFocusAfter=right", () => {
        render(<TestCase />);
        act(() =>
          apiRef.current.startRowEditMode({
            id: 0,
            fieldToFocus: "currencyPair",
          })
        );
        expect(getCell(0, 1).querySelector("input")).toHaveFocus();
        act(() =>
          apiRef.current.stopRowEditMode({
            id: 0,
            field: "currencyPair",
            cellToFocusAfter: "right",
          })
        );
        expect(getCell(0, 2)).toHaveFocus();
      });

      it("should move focus to the cell below when cellToFocusAfter=left", () => {
        render(<TestCase />);
        act(() =>
          apiRef.current.startRowEditMode({ id: 0, fieldToFocus: "price1M" })
        );
        expect(getCell(0, 2).querySelector("input")).toHaveFocus();
        act(() =>
          apiRef.current.stopRowEditMode({
            id: 0,
            field: "price1M",
            cellToFocusAfter: "left",
          })
        );
        expect(getCell(0, 1)).toHaveFocus();
      });

      // it("should keep in edit mode the cells that entered edit mode while processRowUpdate is called", async () => {
      //   const onRowModesModelChange = jest.fn();
      //   let resolveCallback: (() => void) | undefined;
      //   const processRowUpdate = (newRow: Record<string, unknown>) =>
      //     new Promise<void>((resolve) => {
      //       resolveCallback = resolve;
      //     });
      //   render(
      //     <TestCase
      //       processRowUpdate={processRowUpdate}
      //       onRowModesModelChange={onRowModesModelChange}
      //     />
      //   );
      //   act(() => apiRef.current.startRowEditMode({ id: 0, fieldToFocus: "price1M" }));
      //   await act(async () => {
      //     apiRef.current.setEditCellValue({
      //       id: 0,
      //       field: "currencyPair",
      //       value: "USD GBP",
      //     });
      //   });
      //   act(() => apiRef.current.stopRowEditMode({ id: 0, field: "price1M" }));
      //   await new Promise((resolve) => setTimeout(resolve, 10));
      //   expect(onRowModesModelChange.mock.calls[onRowModesModelChange.mock.calls.length - 1][0])
      //     .toHaveProperty("0", { mode: "edit", field: "price1M" });
      //   act(() => resolveCallback!());
      //   await act(() => Promise.resolve());
      //   expect(onRowModesModelChange.mock.calls[onRowModesModelChange.mock.calls.length - 1][0])
      //     .toHaveProperty("0", { mode: "view", field: "price1M" });
      // });      
      
      describe("with pending value mutation", () => {
        jest.useFakeTimers();

        it("should run all pending value mutations before calling processRowUpdate", async () => {
          const processRowUpdate = jest.fn((newRow) => newRow);
          const renderEditCell = jest.fn(defaultRenderEditCell);

          render(
            <TestCase
              processRowUpdate={processRowUpdate}
              column1Props={{ renderEditCell }}
            />
          );
          act(() => apiRef.current.startRowEditMode({ id: 0 }));
          await act(async () => {
            apiRef.current.setEditCellValue({
              id: 0,
              field: "currencyPair",
              value: "USD GBP",
              debounceMs: 100,
            });
          });
          act(() => apiRef.current.stopRowEditMode({ id: 0 }));
          await act(() => Promise.resolve());
          expect(
            renderEditCell.mock.calls[renderEditCell.mock.calls.length - 1][0]
              .value
          ).toEqual("USD GBP");
          expect(
            processRowUpdate.mock.calls[
              processRowUpdate.mock.calls.length - 1
            ][0].currencyPair
          ).toEqual("USD GBP");
        });
      });
    });
  });

  describe("start edit mode", () => {
    describe("by double-click", () => {
      it(`should publish 'rowEditStart' with reason=cellDoubleClick`, () => {
        render(<TestCase />);
        const listener = jest.fn();
        apiRef.current.subscribeEvent("rowEditStart", listener);
        const cell = getCell(0, 1);
        fireEvent.doubleClick(cell);
        expect(
          listener.mock.calls[listener.mock.calls.length - 1][0].reason
        ).toEqual("cellDoubleClick");
      });

      it(`should not publish 'rowEditStart' if the cell is not editable`, () => {
        render(<TestCase />);
        const listener = jest.fn();
        apiRef.current.subscribeEvent("rowEditStart", listener);
        const cell = getCell(0, 0);
        fireEvent.doubleClick(cell);
        expect(listener.mock.calls).toEqual([]);
      });

      it("should call startRowEditMode", () => {
        render(<TestCase />);
        const spiedStartRowEditMode = spyApi(
          apiRef.current,
          "startRowEditMode"
        );
        const cell = getCell(0, 1);
        fireEvent.doubleClick(cell);
        expect(spiedStartRowEditMode).toHaveBeenCalledTimes(1);
      });
    });

    describe("by pressing Enter", () => {
      it(`should publish 'rowEditStart' with reason=enterKeyDown`, () => {
        render(<TestCase />);
        const listener = jest.fn();
        apiRef.current.subscribeEvent("rowEditStart", listener);
        const cell = getCell(0, 1);
        userEvent.click(cell);
        fireEvent.keyDown(cell, { key: "Enter" });
        expect(
          listener.mock.calls[listener.mock.calls.length - 1][0].reason
        ).toEqual("enterKeyDown");
      });

      it(`should not publish 'rowEditStart' if the cell is not editable`, () => {
        render(<TestCase />);
        const listener = jest.fn();
        apiRef.current.subscribeEvent("rowEditStart", listener);
        const cell = getCell(0, 0);
        userEvent.click(cell);
        fireEvent.keyDown(cell, { key: "Enter" });
        expect(listener.mock.calls).toEqual([]);
      });

      it("should call startRowEditMode passing fieldToFocus", () => {
        render(<TestCase />);
        const spiedStartRowEditMode = spyApi(
          apiRef.current,
          "startRowEditMode"
        );
        const cell = getCell(0, 1);
        userEvent.click(cell);
        fireEvent.keyDown(cell, { key: "Enter" });
        expect(spiedStartRowEditMode).toHaveBeenCalledTimes(1);
        expect(
          spiedStartRowEditMode.mock.calls[
            spiedStartRowEditMode.mock.calls.length - 1
          ][0]
        ).toEqual({
          id: 0,
          fieldToFocus: "currencyPair",
        });
      });
    });

    describe("by pressing Delete", () => {
      it(`should publish 'rowEditStart' with reason=deleteKeyDown`, () => {
        render(<TestCase />);
        const listener = jest.fn();
        apiRef.current.subscribeEvent("rowEditStart", listener);
        const cell = getCell(0, 1);
        userEvent.click(cell);
        fireEvent.keyDown(cell, { key: "Delete" });
        expect(
          listener.mock.calls[listener.mock.calls.length - 1][0].reason
        ).toEqual("deleteKeyDown");
      });

      it(`should not publish 'rowEditStart' if the cell is not editable`, () => {
        render(<TestCase />);
        const listener = jest.fn();
        apiRef.current.subscribeEvent("rowEditStart", listener);
        const cell = getCell(0, 0);
        userEvent.click(cell);
        fireEvent.keyDown(cell, { key: "Delete" });
        expect(listener.mock.calls).toEqual([]);
      });

      it("should call startRowEditMode passing fieldToFocus and deleteValue", () => {
        render(<TestCase />);
        const spiedStartRowEditMode = spyApi(
          apiRef.current,
          "startRowEditMode"
        );
        const cell = getCell(0, 1);
        userEvent.click(cell);
        fireEvent.keyDown(cell, { key: "Delete" });
        expect(spiedStartRowEditMode).toHaveBeenCalledTimes(1);
        expect(
          spiedStartRowEditMode.mock.calls[
            spiedStartRowEditMode.mock.calls.length - 1
          ][0]
        ).toEqual({
          id: 0,
          fieldToFocus: "currencyPair",
          deleteValue: true,
        });
      });
    });

    describe("by pressing a printable character", () => {
      it(`should publish 'rowEditStart' with reason=printableKeyDown`, () => {
        render(<TestCase />);
        const listener = jest.fn();
        apiRef.current.subscribeEvent("rowEditStart", listener);
        const cell = getCell(0, 1);
        userEvent.click(cell);
        fireEvent.keyDown(cell, { key: "a" });
        expect(
          listener.mock.calls[listener.mock.calls.length - 1][0].reason
        ).toEqual("printableKeyDown");
      });

      it(`should not publish 'rowEditStart' if the cell is not editable`, () => {
        render(<TestCase />);
        const listener = jest.fn();
        apiRef.current.subscribeEvent("rowEditStart", listener);
        const cell = getCell(0, 0);
        userEvent.click(cell);
        fireEvent.keyDown(cell, { key: "a" });
        expect(listener.mock.calls).toEqual([]);
      });

      ["ctrlKey", "metaKey"].forEach((key) => {
        it(`should not publish 'rowEditStart' if ${key} is pressed`, () => {
          render(<TestCase />);
          const listener = jest.fn();
          apiRef.current.subscribeEvent("rowEditStart", listener);
          const cell = getCell(0, 1);
          userEvent.click(cell);
          fireEvent.keyDown(cell, { key: "a", [key]: true });
          expect(listener.mock.calls).toEqual([]);
        });
      });

      it(`should call startRowEditMode if shiftKey is pressed with a letter`, () => {
        render(<TestCase />);
        const listener = jest.fn();
        apiRef.current.subscribeEvent("rowEditStart", listener);
        const cell = getCell(0, 1);
        userEvent.click(cell);
        fireEvent.keyDown(cell, { key: "a", shiftKey: true });
        expect(listener).toHaveBeenCalledTimes(1);
      });

      it("should not call startRowEditMode if space is pressed", () => {
        render(<TestCase autoHeight />);
        const listener = jest.fn();
        apiRef.current.subscribeEvent("rowEditStart", listener);
        const cell = getCell(0, 1);
        userEvent.click(cell);
        fireEvent.keyDown(cell, { key: " " });
        expect(listener.mock.calls).toEqual([]);
      });

      it(`should call startRowEditMode if ctrl+V is pressed`, () => {
        render(<TestCase />);
        const listener = jest.fn();
        apiRef.current.subscribeEvent("rowEditStart", listener);
        const cell = getCell(0, 1);
        userEvent.click(cell);
        fireEvent.keyDown(cell, { key: "v", ctrlKey: true });
        expect(listener.mock.calls).toEqual([]);
      });

      it("should call startRowEditMode passing fieldToFocus and deleteValue", () => {
        render(<TestCase />);
        const spiedStartRowEditMode = spyApi(
          apiRef.current,
          "startRowEditMode"
        );
        const cell = getCell(0, 1);
        userEvent.click(cell);
        fireEvent.keyDown(cell, { key: "a" });
        expect(spiedStartRowEditMode).toHaveBeenCalledTimes(1);
        expect(
          spiedStartRowEditMode.mock.calls[
            spiedStartRowEditMode.mock.calls.length - 1
          ][0]
        ).toEqual({
          id: 0,
          fieldToFocus: "currencyPair",
          deleteValue: true,
        });
      });

      it(`should ignore keydown event until the IME is confirmed with a letter`, () => {
        render(<TestCase />);
        const listener = jest.fn();
        apiRef.current.subscribeEvent("rowEditStop", listener);
        const cell = getCell(0, 1);
        fireEvent.doubleClick(cell);
        const input = cell.querySelector("input")!;
        fireEvent.change(input, { target: { value: "あ" } });
        fireEvent.keyDown(input, { key: "Enter", keyCode: 229 });
        expect(listener.mock.calls).toEqual([]);
        fireEvent.keyDown(input, { key: "Enter", keyCode: 13 });
        expect(listener).toHaveBeenCalledTimes(1);
        expect(input.value).toEqual("あ");
        expect(
          listener.mock.calls[listener.mock.calls.length - 1][0].reason
        ).toEqual("enterKeyDown");
      });

      it(`should ignore keydown event until the IME is confirmed with multiple letters`, () => {
        render(<TestCase />);
        const listener = jest.fn();
        apiRef.current.subscribeEvent("rowEditStop", listener);
        const cell = getCell(0, 1);
        fireEvent.doubleClick(cell);
        const input = cell.querySelector("input")!;
        fireEvent.change(input, { target: { value: "ありがとう" } });
        fireEvent.keyDown(input, { key: "Enter", keyCode: 229 });
        expect(listener.mock.calls).toEqual([]);
        fireEvent.keyDown(input, { key: "Enter", keyCode: 13 });
        expect(listener).toHaveBeenCalledTimes(1);
        expect(input.value).toEqual("ありがとう");
        expect(
          listener.mock.calls[listener.mock.calls.length - 1][0].reason
        ).toEqual("enterKeyDown");
      });
    });
  });

  describe("stop edit mode", () => {
    describe("by clicking outside the cell", () => {
      jest.useFakeTimers();

      it(`should publish 'rowEditStop' with reason=rowFocusOut`, () => {
        render(<TestCase />);
        const listener = jest.fn();
        apiRef.current.subscribeEvent("rowEditStop", listener);
        fireEvent.doubleClick(getCell(0, 1));
        expect(listener.mock.calls).toEqual([]);
        userEvent.click(getCell(1, 1));
        jest.runAllTimers();
        expect(
          listener.mock.calls[listener.mock.calls.length - 1][0].reason
        ).toEqual("rowFocusOut");
      });

      it(`should not publish 'rowEditStop' if field has error`, async () => {
        const preProcessEditCellProps = ({
          props,
        }: GridPreProcessEditCellProps) => ({
          ...props,
          error: true,
        });
        render(<TestCase column1Props={{ preProcessEditCellProps }} />);
        const listener = jest.fn();
        apiRef.current.subscribeEvent("rowEditStop", listener);
        const cell = getCell(0, 1);
        fireEvent.doubleClick(cell);
        await act(async () =>
          apiRef.current.setEditCellValue({
            id: 0,
            field: "currencyPair",
            value: "USD GBP",
          })
        );
        expect(listener.mock.calls).toEqual([]);

        userEvent.click(getCell(1, 1));
        jest.runAllTimers();
        expect(listener.mock.calls).toEqual([]);
      });

      it("should call stopRowEditMode with ignoreModifications=false and no cellToFocusAfter", () => {
        render(<TestCase />);
        const spiedStopRowEditMode = spyApi(apiRef.current, "stopRowEditMode");
        fireEvent.doubleClick(getCell(0, 1));
        userEvent.click(getCell(1, 1));
        jest.runAllTimers();
        expect(spiedStopRowEditMode).toHaveBeenCalledTimes(1);
        expect(
          spiedStopRowEditMode.mock.calls[
            spiedStopRowEditMode.mock.calls.length - 1
          ][0]
        ).toEqual({
          id: 0,
          ignoreModifications: false,
          field: "currencyPair",
          cellToFocusAfter: undefined,
        });
      });

      it("should call stopRowEditMode with ignoreModifications=false if the props are being processed", async () => {
        const preProcessEditCellProps = () => new Promise(() => {});
        render(<TestCase column1Props={{ preProcessEditCellProps }} />);
        const spiedStopRowEditMode = spyApi(apiRef.current, "stopRowEditMode");
        fireEvent.doubleClick(getCell(0, 1));
        act(() => {
          apiRef.current.setEditCellValue({
            id: 0,
            field: "currencyPair",
            value: "USD GBP",
          });
        });
        userEvent.click(getCell(1, 1));
        jest.runAllTimers();
        expect(spiedStopRowEditMode).toHaveBeenCalledTimes(1);
        expect(
          spiedStopRowEditMode.mock.calls[
            spiedStopRowEditMode.mock.calls.length - 1
          ][0].ignoreModifications
        ).toEqual(false);
      });
    });

    describe("by pressing Escape", () => {
      it(`should publish 'rowEditStop' with reason=escapeKeyDown`, () => {
        render(<TestCase />);
        const listener = jest.fn();
        apiRef.current.subscribeEvent("rowEditStop", listener);
        const cell = getCell(0, 1);
        userEvent.click(cell);
        fireEvent.doubleClick(cell);
        expect(listener.mock.calls).toEqual([]);
        fireEvent.keyDown(cell.querySelector("input")!, { key: "Escape" });
        expect(
          listener.mock.calls[listener.mock.calls.length - 1][0].reason
        ).toEqual("escapeKeyDown");
      });

      it(`should publish 'rowEditStop' even if field has error`, async () => {
        const preProcessEditCellProps = ({
          props,
        }: GridPreProcessEditCellProps) => ({
          ...props,
          error: true,
        });
        render(<TestCase column1Props={{ preProcessEditCellProps }} />);
        const listener = jest.fn();
        apiRef.current.subscribeEvent("rowEditStop", listener);
        const cell = getCell(0, 1);
        fireEvent.doubleClick(cell);
        await act(async () =>
          apiRef.current.setEditCellValue({
            id: 0,
            field: "currencyPair",
            value: "USD GBP",
          })
        );
        expect(listener.mock.calls).toEqual([]);

        fireEvent.keyDown(cell.querySelector("input")!, { key: "Escape" });
        expect(
          listener.mock.calls[listener.mock.calls.length - 1][0].reason
        ).toEqual("escapeKeyDown");
      });

      it("should call stopRowEditMode with ignoreModifications=true", () => {
        render(<TestCase />);
        const spiedStopRowEditMode = spyApi(apiRef.current, "stopRowEditMode");
        const cell = getCell(0, 1);
        userEvent.click(cell);
        fireEvent.doubleClick(cell);
        fireEvent.keyDown(cell.querySelector("input")!, { key: "Escape" });
        expect(spiedStopRowEditMode).toHaveBeenCalledTimes(1);
        expect(
          spiedStopRowEditMode.mock.calls[
            spiedStopRowEditMode.mock.calls.length - 1
          ][0]
        ).toEqual({
          id: 0,
          ignoreModifications: true,
          field: "currencyPair",
          cellToFocusAfter: undefined,
        });
      });
    });

    describe("by pressing Enter", () => {
      it(`should publish 'rowEditStop' with reason=enterKeyDown`, () => {
        render(<TestCase />);
        const listener = jest.fn();
        apiRef.current.subscribeEvent("rowEditStop", listener);
        const cell = getCell(0, 1);
        userEvent.click(cell);
        fireEvent.doubleClick(cell);
        expect(listener.mock.calls).toEqual([]);
        fireEvent.keyDown(cell.querySelector("input")!, { key: "Enter" });
        expect(
          listener.mock.calls[listener.mock.calls.length - 1][0].reason
        ).toEqual("enterKeyDown");
      });

      it(`should not publish 'rowEditStop' if field has error`, async () => {
        const preProcessEditCellProps = ({
          props,
        }: GridPreProcessEditCellProps) => ({
          ...props,
          error: true,
        });
        render(<TestCase column1Props={{ preProcessEditCellProps }} />);
        const listener = jest.fn();
        apiRef.current.subscribeEvent("rowEditStop", listener);
        const cell = getCell(0, 1);
        fireEvent.doubleClick(cell);
        await act(async () =>
          apiRef.current.setEditCellValue({
            id: 0,
            field: "currencyPair",
            value: "USD GBP",
          })
        );
        expect(listener.mock.calls).toEqual([]);

        fireEvent.keyDown(cell.querySelector("input")!, { key: "Enter" });
        expect(listener.mock.calls).toEqual([]);
      });

      it("should call stopRowEditMode with ignoreModifications=false and cellToFocusAfter=below", () => {
        render(<TestCase />);
        const spiedStopRowEditMode = spyApi(apiRef.current, "stopRowEditMode");
        const cell = getCell(0, 1);
        userEvent.click(cell);
        fireEvent.doubleClick(cell);
        fireEvent.keyDown(cell.querySelector("input")!, { key: "Enter" });
        expect(spiedStopRowEditMode).toHaveBeenCalledTimes(1);
        expect(
          spiedStopRowEditMode.mock.calls[
            spiedStopRowEditMode.mock.calls.length - 1
          ][0]
        ).toEqual({
          id: 0,
          ignoreModifications: false,
          field: "currencyPair",
          cellToFocusAfter: "below",
        });
      });

      it("should call stopRowEditMode with ignoreModifications=false if the props are being processed", async () => {
        const preProcessEditCellProps = () => new Promise(() => {});
        render(<TestCase column1Props={{ preProcessEditCellProps }} />);
        const spiedStopRowEditMode = spyApi(apiRef.current, "stopRowEditMode");
        const cell = getCell(0, 1);
        userEvent.click(cell);
        fireEvent.doubleClick(cell);
        act(() => {
          apiRef.current.setEditCellValue({
            id: 0,
            field: "currencyPair",
            value: "USD GBP",
          });
        });
        fireEvent.keyDown(cell.querySelector("input")!, { key: "Enter" });
        expect(spiedStopRowEditMode).toHaveBeenCalledTimes(1);
        expect(
          spiedStopRowEditMode.mock.calls[
            spiedStopRowEditMode.mock.calls.length - 1
          ][0].ignoreModifications
        ).toEqual(false);
      });
    });

    describe("by pressing Tab", () => {
      it(`should publish 'rowEditStop' with reason=tabKeyDown if on the last column`, () => {
        render(<TestCase />);
        const listener = jest.fn();
        apiRef.current.subscribeEvent("rowEditStop", listener);
        const cell = getCell(0, 2);
        userEvent.click(cell);
        fireEvent.doubleClick(cell);
        expect(listener.mock.calls).toEqual([]);
        fireEvent.keyDown(cell.querySelector("input")!, { key: "Tab" });
        expect(
          listener.mock.calls[listener.mock.calls.length - 1][0].reason
        ).toEqual("tabKeyDown");
      });

      it(`should publish 'rowEditStop' with reason=shiftTabKeyDown if on the first column and Shift is pressed`, () => {
        render(<TestCase />);
        const listener = jest.fn();
        apiRef.current.subscribeEvent("rowEditStop", listener);
        const cell = getCell(0, 1);
        userEvent.click(cell);
        fireEvent.doubleClick(cell);
        expect(listener.mock.calls).toEqual([]);
        fireEvent.keyDown(cell.querySelector("input")!, {
          key: "Tab",
          shiftKey: true,
        });
        expect(
          listener.mock.calls[listener.mock.calls.length - 1][0].reason
        ).toEqual("shiftTabKeyDown");
      });

      it("should call stopRowEditMode with ignoreModifications=false and cellToFocusAfter=right", () => {
        render(<TestCase />);
        const spiedStopRowEditMode = spyApi(apiRef.current, "stopRowEditMode");
        const cell = getCell(0, 2);
        userEvent.click(cell);
        fireEvent.doubleClick(cell);
        fireEvent.keyDown(cell.querySelector("input")!, { key: "Tab" });
        expect(spiedStopRowEditMode).toHaveBeenCalledTimes(1);
        expect(
          spiedStopRowEditMode.mock.calls[
            spiedStopRowEditMode.mock.calls.length - 1
          ][0]
        ).toEqual({
          id: 0,
          ignoreModifications: false,
          field: "price1M",
          cellToFocusAfter: "right",
        });
      });

      it("should call stopRowEditMode with ignoreModifications=false and cellToFocusAfter=left if Shift is pressed", () => {
        render(<TestCase />);
        const spiedStopRowEditMode = spyApi(apiRef.current, "stopRowEditMode");
        const cell = getCell(0, 1);
        userEvent.click(cell);
        fireEvent.doubleClick(cell);
        fireEvent.keyDown(cell.querySelector("input")!, {
          key: "Tab",
          shiftKey: true,
        });
        expect(spiedStopRowEditMode).toHaveBeenCalledTimes(1);
        expect(
          spiedStopRowEditMode.mock.calls[
            spiedStopRowEditMode.mock.calls.length - 1
          ][0]
        ).toEqual({
          id: 0,
          ignoreModifications: false,
          field: "currencyPair",
          cellToFocusAfter: "left",
        });
      });

      it("should call stopRowEditMode with ignoreModifications=false if the props are being processed", async () => {
        const preProcessEditCellProps = () => new Promise(() => {});
        render(<TestCase column1Props={{ preProcessEditCellProps }} />);
        const spiedStopRowEditMode = spyApi(apiRef.current, "stopRowEditMode");
        const cell = getCell(0, 2);
        userEvent.click(cell);
        fireEvent.doubleClick(cell);
        await act(async () => {
          apiRef.current.setEditCellValue({
            id: 0,
            field: "price1M",
            value: "USD GBP",
          });
        });
        fireEvent.keyDown(cell.querySelector("input")!, { key: "Tab" });
        expect(spiedStopRowEditMode).toHaveBeenCalledTimes(1);
        expect(
          spiedStopRowEditMode.mock.calls[
            spiedStopRowEditMode.mock.calls.length - 1
          ][0].ignoreModifications
        ).toEqual(false);
      });

      it("should keep focus on the first column when editing the first column of the first row of the 2nd page", () => {
        render(
          <TestCase
            pageSizeOptions={[2]}
            initialState={{
              pagination: { paginationModel: { pageSize: 2, page: 1 } },
            }}
            columnVisibilityModel={{ id: false }}
            pagination
          />
        );
        const cell = getCell(2, 0);
        fireEvent.doubleClick(cell);
        expect(cell.querySelector("input")).toHaveFocus();
        fireEvent.keyDown(cell.querySelector("input")!, {
          key: "Tab",
          shiftKey: true,
        });
        expect(getCell(2, 0)).toHaveFocus();
      });

      it("should keep focus on the last column when editing the last column of the last row of the 2nd page", () => {
        render(
          <TestCase
            pageSizeOptions={[2]}
            initialState={{
              pagination: { paginationModel: { pageSize: 2, page: 1 } },
            }}
            columnVisibilityModel={{ price2M: false, price3M: false }}
            pagination
          />
        );
        const cell = getCell(3, 2);
        fireEvent.doubleClick(cell);
        expect(cell.querySelector("input")).toHaveFocus();
        fireEvent.keyDown(cell.querySelector("input")!, { key: "Tab" });
        expect(getCell(3, 2)).toHaveFocus();
      });
    });
  });

  describe("prop: rowModesModel", () => {
    describe("mode=view to mode=edit", () => {
      it("should start edit mode", () => {
        const { rerender } = render(<TestCase />);
        expect(getCell(0, 1)).not.toHaveClass("MuiDataGrid-cell--editing");
        // setProps({ rowModesModel: { 0: { mode: GridRowModes.Edit } } });
        rerender(
          <TestCase rowModesModel={{ 0: { mode: GridRowModes.Edit } }} />
        );
        expect(getCell(0, 1)).toHaveClass("MuiDataGrid-cell--editing");
      });
    });

    describe("mode=edit to mode=view", () => {
      it("should stop edit mode", () => {
        const { rerender } = render(
          <TestCase rowModesModel={{ 0: { mode: GridRowModes.Edit } }} />
        );
        expect(getCell(0, 1)).toHaveClass("MuiDataGrid-cell--editing");
        // setProps({ rowModesModel: { 0: { mode: GridRowModes.View } } });
        rerender(
          <TestCase rowModesModel={{ 0: { mode: GridRowModes.View } }} />
        );
        expect(getCell(0, 1)).not.toHaveClass("MuiDataGrid-cell--editing");
      });

      it("should stop edit mode when rowModesModel empty", () => {
        const { rerender } = render(
          <TestCase rowModesModel={{ 0: { mode: GridRowModes.Edit } }} />
        );
        expect(getCell(0, 1)).toHaveClass("MuiDataGrid-cell--editing");
        // setProps({ rowModesModel: {} });
        rerender(<TestCase rowModesModel={{}} />);
        expect(getCell(0, 1)).not.toHaveClass("MuiDataGrid-cell--editing");
      });

      it("should ignode modifications if ignoreModifications=true", async () => {
        const { rerender } = render(
          <TestCase rowModesModel={{ 0: { mode: GridRowModes.Edit } }} />
        );
        await act(async () =>
          apiRef.current.setEditCellValue({
            id: 0,
            field: "currencyPair",
            value: "USD GBP",
          })
        );
        // setProps({ rowModesModel: { 0: { mode: GridRowModes.View, ignoreModifications: true } } });
        rerender(
          <TestCase
            rowModesModel={{
              0: { mode: GridRowModes.View, ignoreModifications: true },
            }}
          />
        );
        expect(getCell(0, 1).textContent).toEqual("USDGBP");
      });

      // it("should move focus to the cell that is set in cellToFocusAfter", async () => {
      //   const { rerender } = render(
      //     <TestCase rowModesModel={{ 0: { mode: GridRowModes.Edit } }} />
      //   );
      //   await act(async () => {
      //     apiRef.current.setEditCellValue({
      //       id: 0,
      //       field: "currencyPair",
      //       value: "USD GBP",
      //     });
      //   });
      //   rerender(
      //     <TestCase rowModesModel={{ 0: { mode: GridRowModes.View, cellToFocusAfter: "below" } }} />
      //   );
      //   await waitFor(() => expect(getCell(1, 1)).toHaveFocus());
      // });      
    });

    it(`should publish 'rowModesModelChange' when the model changes`, () => {
      render(<TestCase />);
      const listener = jest.fn();
      act(() => apiRef.current.subscribeEvent("rowModesModelChange", listener));
      const cell = getCell(0, 1);
      fireEvent.doubleClick(cell);
      expect(listener.mock.calls[listener.mock.calls.length - 1][0]).toEqual({
        0: { mode: "edit", fieldToFocus: "currencyPair" },
      });
    });

    it(`should publish 'rowModesModelChange' when the prop changes`, () => {
      const { rerender } = render(<TestCase rowModesModel={{}} />);
      const listener = jest.fn();
      expect(listener.mock.calls).toEqual([]);
      act(() => apiRef.current.subscribeEvent("rowModesModelChange", listener));
      rerender(<TestCase rowModesModel={{ 0: { mode: GridRowModes.Edit } }} />);
      expect(listener.mock.calls[listener.mock.calls.length - 1][0]).toEqual({
        0: { mode: "edit" },
      });
    });

    it(`should not publish 'rowModesModelChange' when the model changes and rowModesModel is set`, () => {
      render(<TestCase rowModesModel={{}} />);
      const listener = jest.fn();
      act(() => apiRef.current.subscribeEvent("rowModesModelChange", listener));
      const cell = getCell(0, 1);
      fireEvent.doubleClick(cell);
      expect(listener.mock.calls).toEqual([]);
    });

    it("should not mutate the rowModesModel prop if props of any column contains error=true", async () => {
      const preProcessEditCellProps = ({
        props,
      }: GridPreProcessEditCellProps) => ({
        ...props,
        error: true,
      });
      const { rerender } = render(
        <TestCase column1Props={{ preProcessEditCellProps }} />
      );
      const cell = getCell(0, 1);
      fireEvent.mouseUp(cell);
      fireEvent.click(cell);
      fireEvent.doubleClick(cell);

      await act(async () =>
        apiRef.current.setEditCellValue({
          id: 0,
          field: "currencyPair",
          value: "USD GBP",
        })
      );

      const rowModesModel = { 0: { mode: GridRowModes.View } };
      rerender(<TestCase rowModesModel={rowModesModel} />);
      expect(rowModesModel).toEqual({ 0: { mode: "view" } });
    });
  });

  describe("prop: onRowModesModelChange", () => {
    it("should call with mode=edit when startEditMode is called", () => {
      const onRowModesModelChange = jest.fn();
      render(<TestCase onRowModesModelChange={onRowModesModelChange} />);
      expect(onRowModesModelChange.mock.calls).toEqual([]);
      act(() =>
        apiRef.current.startRowEditMode({ id: 0, fieldToFocus: "currencyPair" })
      );
      expect(onRowModesModelChange).toHaveBeenCalledTimes(1);
      expect(
        onRowModesModelChange.mock.calls[
          onRowModesModelChange.mock.calls.length - 1
        ][0]
      ).toEqual({
        0: { mode: "edit", fieldToFocus: "currencyPair" },
      });
    });

    it("should call with mode=view when stopEditMode is called", () => {
      const onRowModesModelChange = jest.fn();
      render(<TestCase onRowModesModelChange={onRowModesModelChange} />);
      act(() =>
        apiRef.current.startRowEditMode({ id: 0, fieldToFocus: "currencyPair" })
      );
      onRowModesModelChange.mockClear();
      act(() => apiRef.current.stopRowEditMode({ id: 0 }));
      expect(onRowModesModelChange.mock.calls[0][0]).toEqual({
        0: { mode: "view" },
      });
      expect(onRowModesModelChange.mock.calls[1][0]).toEqual({});
    });

    it(`should not be called when changing the rowModesModel prop`, () => {
      const onRowModesModelChange = jest.fn();
      const { rerender } = render(
        <TestCase
          rowModesModel={{}}
          onRowModesModelChange={onRowModesModelChange}
        />
      );
      expect(onRowModesModelChange.mock.calls).toEqual([]);
      // setProps({ rowModesModel: { 0: { mode: 'edit' } } });
      rerender(<TestCase rowModesModel={{ 0: { mode: GridRowModes.Edit } }} />);
      expect(onRowModesModelChange.mock.calls).toEqual([]);
    });
  });

  it("should correctly handle Portals when pressing Tab to go to the next column", () => {
    function PortaledEditComponent({ hasFocus }: GridRenderEditCellParams) {
      const [inputRef, setInputRef] = React.useState<HTMLInputElement | null>(
        null
      );
      React.useLayoutEffect(() => {
        if (hasFocus && inputRef) {
          inputRef.focus();
        }
      }, [hasFocus, inputRef]);
      return (
        <Portal>
          <input ref={setInputRef} data-testid="input" />
        </Portal>
      );
    }
    const renderEditCell = (props: GridRenderEditCellParams) => (
      <PortaledEditComponent {...props} />
    );
    render(<TestCase column1Props={{ renderEditCell }} />);
    fireEvent.doubleClick(getCell(0, 1));
    const input = screen.getByTestId("input");
    expect(input).toHaveFocus();
    fireEvent.keyDown(input, { key: "Tab" });
    expect(getCell(0, 2).querySelector("input")).toHaveFocus();
  });

  it("should correctly handle Portals when pressing Shift+Tab to go to the previous column", () => {
    function PortaledEditComponent({ hasFocus }: GridRenderEditCellParams) {
      const [inputRef, setInputRef] = React.useState<HTMLInputElement | null>(
        null
      );
      React.useLayoutEffect(() => {
        if (hasFocus && inputRef) {
          inputRef.focus();
        }
      }, [hasFocus, inputRef]);
      return (
        <Portal>
          <input ref={(ref) => setInputRef(ref)} data-testid="input" />
        </Portal>
      );
    }
    const renderEditCell = (props: GridRenderEditCellParams) => (
      <PortaledEditComponent {...props} />
    );
    render(<TestCase column2Props={{ renderEditCell }} />);
    fireEvent.doubleClick(getCell(0, 2));
    const input = screen.getByTestId("input");
    expect(input).toHaveFocus();
    fireEvent.keyDown(input, { key: "Tab", shiftKey: true });
    expect(getCell(0, 1).querySelector("input")).toHaveFocus();
  });
});
