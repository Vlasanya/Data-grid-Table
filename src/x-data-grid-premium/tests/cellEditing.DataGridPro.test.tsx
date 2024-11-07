import * as React from "react";
import {
  GridRenderEditCellParams,
  GridValueSetter,
  GridPreProcessEditCellProps,
  GridCellProps,
  GridCellModes,
} from "@mui/x-data-grid";
import { DataGridPremium } from "../DataGridPremium/DataGridPremium";
import { DataGridPremiumProps } from "../models/dataGridPremiumProps";
import { getBasicGridData } from "./basic-data-service";
import { render, act, fireEvent } from "@testing-library/react";
import { getCell, spyApi } from "./helperFn";
import userEvent from "@testing-library/user-event";
import { GridApi } from "../typeOverloads/reexports";
import { useGridApiRef } from "../hooks/utils/useGridApiRef";

describe("<DataGridPro /> - Cell editing", () => {
  let apiRef: React.MutableRefObject<GridApi>;

  const defaultData = getBasicGridData(4, 2);

  const defaultRenderEditCell = (() => <input />) as (
    props: GridRenderEditCellParams
  ) => React.ReactNode;

  function TestCase(
    props: Partial<DataGridPremiumProps> & { columnProps?: Record<string, any> }
  ) {
    apiRef = useGridApiRef();
    const { columnProps = {}, ...rest } = props;
    return (
      <div style={{ width: 300, height: 300 }}>
        <DataGridPremium
          apiRef={apiRef}
          {...defaultData}
          columns={defaultData.columns.map((column) =>
            column.field === "currencyPair"
              ? {
                  ...column,
                  renderEditCell: defaultRenderEditCell,
                  editable: true,
                  ...columnProps,
                }
              : column
          )}
          {...rest}
        />
      </div>
    );
  }

  describe("apiRef", () => {
    describe("startCellEditMode", () => {
      it("should throw when the cell is already in edit mode", () => {
        render(<TestCase />);
        act(() =>
          apiRef.current.startCellEditMode({ id: 0, field: "currencyPair" })
        );
        expect(() => {
          apiRef.current.startCellEditMode({ id: 0, field: "currencyPair" });
        }).toThrow(
          "MUI X: The cell with id=0 and field=currencyPair is not in view mode."
        );
      });

      it("should update the CSS class of the cell", () => {
        render(<TestCase />);
        expect(getCell(0, 1)).not.toHaveClass("MuiDataGrid-cell--editing");
        act(() =>
          apiRef.current.startCellEditMode({ id: 0, field: "currencyPair" })
        );
        expect(getCell(0, 1)).toHaveClass("MuiDataGrid-cell--editing");
      });

      it("should render the component given in renderEditCell", () => {
        const renderEditCell = jest.fn(defaultRenderEditCell);

        render(<TestCase columnProps={{ renderEditCell }} />);
        expect(renderEditCell).toHaveBeenCalledTimes(0);
        act(() =>
          apiRef.current.startCellEditMode({ id: 0, field: "currencyPair" })
        );
        expect(renderEditCell).not.toHaveBeenCalledTimes(0);
      });

      it("should pass props to renderEditCell", () => {
        const renderEditCell = jest.fn(defaultRenderEditCell);
        render(<TestCase columnProps={{ renderEditCell }} />);
        act(() =>
          apiRef.current.startCellEditMode({ id: 0, field: "currencyPair" })
        );
        const lastCallArgs =
          renderEditCell.mock.calls[renderEditCell.mock.calls.length - 1][0];
        expect(lastCallArgs.value).toEqual("USDGBP");
        expect(lastCallArgs.error).toEqual(false);
        expect(lastCallArgs.isProcessingProps).toEqual(false);
      });

      it("should empty the value if deleteValue is true", () => {
        const renderEditCell = jest.fn(defaultRenderEditCell);

        render(<TestCase columnProps={{ renderEditCell }} />);

        act(() =>
          apiRef.current.startCellEditMode({
            id: 0,
            field: "currencyPair",
            deleteValue: true,
          })
        );
        const lastCallArgs =
          renderEditCell.mock.calls[renderEditCell.mock.calls.length - 1][0];
        expect(lastCallArgs.value).toEqual("");
        expect(lastCallArgs.error).toEqual(false);
        expect(lastCallArgs.isProcessingProps).toEqual(false);
      });
    });

    describe("setEditCellValue", () => {
      it("should update the value prop given to renderEditCell", async () => {
        const renderEditCell = jest.fn(defaultRenderEditCell);

        render(<TestCase columnProps={{ renderEditCell }} />);

        act(() =>
          apiRef.current.startCellEditMode({ id: 0, field: "currencyPair" })
        );

        let lastCallArgs =
          renderEditCell.mock.calls[renderEditCell.mock.calls.length - 1][0];
        expect(lastCallArgs.value).toEqual("USDGBP");

        await act(async () => {
          await apiRef.current.setEditCellValue({
            id: 0,
            field: "currencyPair",
            value: "usdgbp",
          });
        });

        lastCallArgs =
          renderEditCell.mock.calls[renderEditCell.mock.calls.length - 1][0];
        expect(lastCallArgs.value).toEqual("usdgbp");
      });

      // it("should pass to renderEditCell the row with the value updated", async () => {
      //   const valueSetter: GridValueSetter = (value: string, row) => ({
      //     ...row,
      //     currencyPair: value.trim(),
      //   });
      //   const renderEditCell = jest.fn(defaultRenderEditCell);
      //   render(<TestCase columnProps={{ valueSetter, renderEditCell }} />);
      //   act(() =>
      //     apiRef.current.startCellEditMode({ id: 0, field: "currencyPair" })
      //   );
      //   let lastCallArgs = renderEditCell.mock.calls[renderEditCell.mock.calls.length - 1][0];
      //   expect(lastCallArgs.value).toEqual(defaultData.rows[0].currencyPair.trim());
      //   await act(async () =>
      //     apiRef.current.setEditCellValue({
      //       id: 0,
      //       field: "currencyPair",
      //       value: " usdgbp ",
      //     })
      //   );
      //   lastCallArgs = renderEditCell.mock.calls[renderEditCell.mock.calls.length - 1][0];
      //   expect(lastCallArgs.value).toEqual("usdgbp");
      // });

      it("should pass the new value through the value parser if defined", async () => {
        const valueParser = jest.fn((value: any) => value.toLowerCase());
        const renderEditCell = jest.fn(defaultRenderEditCell);
        render(<TestCase columnProps={{ valueParser, renderEditCell }} />);
        act(() =>
          apiRef.current.startCellEditMode({ id: 0, field: "currencyPair" })
        );
        expect(valueParser).toHaveBeenCalledTimes(0);
        await act(
          async () =>
            await apiRef.current.setEditCellValue({
              id: 0,
              field: "currencyPair",
              value: "USD GBP",
            })
        );
        expect(valueParser).toHaveBeenCalledTimes(1);
        const lastRenderEditCellCallArgs =
          renderEditCell.mock.calls[renderEditCell.mock.calls.length - 1][0];
        expect(lastRenderEditCellCallArgs.value).toEqual("usd gbp");
      });

      it("should return true if no preProcessEditCellProps is defined", async () => {
        render(<TestCase />);
        act(() =>
          apiRef.current.startCellEditMode({ id: 0, field: "currencyPair" })
        );
        expect(
          await act(
            async () =>
              await apiRef.current.setEditCellValue({
                id: 0,
                field: "currencyPair",
                value: "USD GBP",
              })
          )
        ).toEqual(true);
      });

      it("should set isProcessingProps to true before calling preProcessEditCellProps", async () => {
        const preProcessEditCellProps = jest.fn(
          ({ props }: GridPreProcessEditCellProps) => props
        );
        const renderEditCell = jest.fn(defaultRenderEditCell);
        render(
          <TestCase columnProps={{ preProcessEditCellProps, renderEditCell }} />
        );
        act(() =>
          apiRef.current.startCellEditMode({ id: 0, field: "currencyPair" })
        );
        let promise: Promise<boolean> | null = null;
        act(() => {
          promise = apiRef.current.setEditCellValue({
            id: 0,
            field: "currencyPair",
            value: "USD GBP",
          }) as Promise<boolean>;
        });
        const lastRenderEditCellCallArgs =
          renderEditCell.mock.calls[renderEditCell.mock.calls.length - 1][0];
        expect(lastRenderEditCellCallArgs.isProcessingProps).toEqual(true);
        await act(() => promise!);
      });

      it("should call preProcessEditCellProps with the correct params", async () => {
        const preProcessEditCellProps = jest.fn(
          ({ props }: GridPreProcessEditCellProps) => props
        );
        render(<TestCase columnProps={{ preProcessEditCellProps }} />);
        act(() =>
          apiRef.current.startCellEditMode({ id: 0, field: "currencyPair" })
        );
        await act(async () => {
          await apiRef.current.setEditCellValue({
            id: 0,
            field: "currencyPair",
            value: "USD GBP",
          });
        });
        const lastCallArgs =
          preProcessEditCellProps.mock.calls[
            preProcessEditCellProps.mock.calls.length - 1
          ][0];
        expect(lastCallArgs.id).toEqual(0);
        expect(lastCallArgs.row).toEqual(defaultData.rows[0]);
        expect(lastCallArgs.hasChanged).toEqual(true);
        expect(lastCallArgs.props).toEqual({
          value: "USD GBP",
          error: false,
          isProcessingProps: true,
          changeReason: "setEditCellValue",
        });
      });

      it("should not publish onCellEditStop if field has error", async () => {
        const preProcessEditCellProps = jest.fn(
          ({ props }: GridPreProcessEditCellProps) => ({
            ...props,
            error: true,
          })
        );
        const handleEditCellStop = jest.fn();
        render(
          <TestCase
            onCellEditStop={handleEditCellStop}
            columnProps={{ preProcessEditCellProps }}
          />
        );
        act(() =>
          apiRef.current.startCellEditMode({ id: 0, field: "currencyPair" })
        );
        await act(async () => {
          await apiRef.current.setEditCellValue({
            id: 0,
            field: "currencyPair",
            value: "USD GBP",
          });
        });
        const cell = getCell(0, 1);
        cell.focus();
        fireEvent.keyDown(cell, { key: "Enter" });
        expect(handleEditCellStop).toHaveBeenCalledTimes(0);
      });

      it("should pass to renderEditCell the props returned by preProcessEditCellProps", async () => {
        const preProcessEditCellProps = ({
          props,
        }: GridPreProcessEditCellProps) => ({
          ...props,
          foo: "bar",
        });
        const renderEditCell = jest.fn(defaultRenderEditCell);
        render(
          <TestCase columnProps={{ preProcessEditCellProps, renderEditCell }} />
        );
        act(() =>
          apiRef.current.startCellEditMode({ id: 0, field: "currencyPair" })
        );
        expect(
          renderEditCell.mock.calls[renderEditCell.mock.calls.length - 1][0].foo
        ).toBeUndefined();

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
        const preProcessEditCellProps = ({
          props,
        }: GridPreProcessEditCellProps) => ({
          ...props,
          value: "foobar",
        });
        const renderEditCell = jest.fn(defaultRenderEditCell);
        render(
          <TestCase columnProps={{ preProcessEditCellProps, renderEditCell }} />
        );
        act(() =>
          apiRef.current.startCellEditMode({ id: 0, field: "currencyPair" })
        );
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
        const preProcessEditCellProps = ({
          props,
        }: GridPreProcessEditCellProps) => props;
        const renderEditCell = jest.fn(defaultRenderEditCell);
        render(
          <TestCase columnProps={{ preProcessEditCellProps, renderEditCell }} />
        );
        act(() =>
          apiRef.current.startCellEditMode({ id: 0, field: "currencyPair" })
        );
        let promise: Promise<boolean> | null = null;
        act(() => {
          promise = apiRef.current.setEditCellValue({
            id: 0,
            field: "currencyPair",
            value: "USD GBP",
          }) as Promise<boolean>;
        });
        expect(
          renderEditCell.mock.calls[renderEditCell.mock.calls.length - 1][0]
            .isProcessingProps
        ).toEqual(true);
        await act(() => promise!);
        expect(
          renderEditCell.mock.calls[renderEditCell.mock.calls.length - 1][0]
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
        render(<TestCase columnProps={{ preProcessEditCellProps }} />);
        act(() =>
          apiRef.current.startCellEditMode({ id: 0, field: "currencyPair" })
        );
        expect(
          await act(
            async () =>
              await apiRef.current.setEditCellValue({
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
        render(<TestCase columnProps={{ preProcessEditCellProps }} />);
        act(() =>
          apiRef.current.startCellEditMode({ id: 0, field: "currencyPair" })
        );

        let promise: Promise<boolean>;
        act(() => {
          promise = apiRef.current.setEditCellValue({
            id: 0,
            field: "currencyPair",
            value: "USD GBP",
          }) as Promise<boolean>;
        });

        act(() =>
          apiRef.current.stopCellEditMode({
            id: 0,
            field: "currencyPair",
            ignoreModifications: true,
          })
        );

        resolveCallback!();

        expect(await act(async () => promise)).toEqual(false);
      });

      describe("with debounceMs > 0", () => {
        it("should debounce multiple changes if debounceMs > 0", () => {
          jest.useFakeTimers();
          const renderEditCell = jest.fn(() => <input />);
          render(<TestCase columnProps={{ renderEditCell }} />);
          act(() =>
            apiRef.current.startCellEditMode({ id: 0, field: "currencyPair" })
          );
          if (renderEditCell.mock.calls.length > 0) {
            const lastCallArgs = renderEditCell.mock.calls[
              renderEditCell.mock.calls.length - 1
            ] as unknown as [GridRenderEditCellParams];
            expect(lastCallArgs[0].value).toEqual("USDGBP");
          }
          renderEditCell.mockClear();
          apiRef.current.setEditCellValue({
            id: 0,
            field: "currencyPair",
            value: "USD",
            debounceMs: 100,
          });
          expect(renderEditCell).not.toHaveBeenCalled();
          apiRef.current.setEditCellValue({
            id: 0,
            field: "currencyPair",
            value: "USD GBP",
            debounceMs: 100,
          });
          expect(renderEditCell).not.toHaveBeenCalled();
          jest.advanceTimersByTime(100);
          if (renderEditCell.mock.calls.length > 0) {
            const finalCallArgs = renderEditCell.mock.calls[
              renderEditCell.mock.calls.length - 1
            ] as unknown as [GridRenderEditCellParams];
            expect(finalCallArgs[0].value).toEqual("USD GBP");
          }
          jest.useRealTimers();
        });
      });
    });

    describe("stopCellEditMode", () => {
      function CustomEditComponent({ hasFocus }: GridCellProps) {
        const ref = React.useRef<HTMLInputElement>(null);
        React.useLayoutEffect(() => {
          if (hasFocus) {
            ref.current!.focus();
          }
        }, [hasFocus]);
        return <input ref={ref} />;
      }

      it("should throw an error when the cell is not in edit mode", () => {
        render(<TestCase />);
        expect(() =>
          apiRef.current.stopCellEditMode({ id: 0, field: "currencyPair" })
        ).toThrow(
          "MUI X: The cell with id=0 and field=currencyPair is not in edit mode."
        );
      });

      it("should update the row with the new value stored", async () => {
        render(<TestCase />);
        await act(async () =>
          apiRef.current.startCellEditMode({ id: 0, field: "currencyPair" })
        );
        await act(async () =>
          apiRef.current.setEditCellValue({
            id: 0,
            field: "currencyPair",
            value: "USD GBP",
          })
        );
        await act(async () =>
          apiRef.current.stopCellEditMode({ id: 0, field: "currencyPair" })
        );
        expect(getCell(0, 1).textContent).toEqual("USD GBP");
      });

      it("should not update the row if ignoreModifications=true", async () => {
        render(<TestCase />);
        act(() =>
          apiRef.current.startCellEditMode({ id: 0, field: "currencyPair" })
        );
        await act(
          async () =>
            await apiRef.current.setEditCellValue({
              id: 0,
              field: "currencyPair",
              value: "USD GBP",
            })
        );
        act(() =>
          apiRef.current.stopCellEditMode({
            id: 0,
            field: "currencyPair",
            ignoreModifications: true,
          })
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
        render(<TestCase columnProps={{ preProcessEditCellProps }} />);
        act(() =>
          apiRef.current.startCellEditMode({ id: 0, field: "currencyPair" })
        );

        let promise: Promise<boolean>;
        act(() => {
          promise = apiRef.current.setEditCellValue({
            id: 0,
            field: "currencyPair",
            value: "USD GBP",
          }) as Promise<boolean>;
        });

        act(() =>
          apiRef.current.stopCellEditMode({ id: 0, field: "currencyPair" })
        );

        expect(getCell(0, 1)).toHaveClass("MuiDataGrid-cell--editing");

        resolveCallback!();

        await act(() => promise); // Run all updates scheduled for when preProcessEditCellProps resolves
      });

      it("should do nothing if props contain error=true", async () => {
        const preProcessEditCellProps = ({
          props,
        }: GridPreProcessEditCellProps) => ({
          ...props,
          error: true,
        });
        render(<TestCase columnProps={{ preProcessEditCellProps }} />);
        act(() =>
          apiRef.current.startCellEditMode({ id: 0, field: "currencyPair" })
        );
        await act(
          async () =>
            await apiRef.current.setEditCellValue({
              id: 0,
              field: "currencyPair",
              value: "USD GBP",
            })
        );
        act(() =>
          apiRef.current.stopCellEditMode({ id: 0, field: "currencyPair" })
        );
        expect(getCell(0, 1)).toHaveClass("MuiDataGrid-cell--editing");
      });

      it("should keep mode=edit if props of any column contains error=true", async () => {
        const preProcessEditCellProps = ({
          props,
        }: GridPreProcessEditCellProps) => ({
          ...props,
          error: true,
        });
        const onCellModesModelChange = jest.fn();
        render(
          <TestCase
            onCellModesModelChange={onCellModesModelChange}
            columnProps={{ preProcessEditCellProps }}
          />
        );
        act(() =>
          apiRef.current.startCellEditMode({ id: 0, field: "currencyPair" })
        );
        await act(
          async () =>
            await apiRef.current.setEditCellValue({
              id: 0,
              field: "currencyPair",
              value: "USD GBP",
            })
        );
        act(() =>
          apiRef.current.stopCellEditMode({ id: 0, field: "currencyPair" })
        );
        expect(onCellModesModelChange.mock.calls[0][0]).toEqual({
          0: { currencyPair: { mode: "edit" } },
        });
      });

      it("should allow a 2nd call if the first call was when error=true", async () => {
        const preProcessEditCellProps = ({
          props,
        }: GridPreProcessEditCellProps) => ({
          ...props,
          error: props.value.length === 0,
        });
        render(<TestCase columnProps={{ preProcessEditCellProps }} />);
        act(() =>
          apiRef.current.startCellEditMode({ id: 0, field: "currencyPair" })
        );

        await act(
          async () =>
            await apiRef.current.setEditCellValue({
              id: 0,
              field: "currencyPair",
              value: "",
            })
        );
        act(() =>
          apiRef.current.stopCellEditMode({ id: 0, field: "currencyPair" })
        );
        expect(getCell(0, 1)).toHaveClass("MuiDataGrid-cell--editing");

        await act(
          async () =>
            await apiRef.current.setEditCellValue({
              id: 0,
              field: "currencyPair",
              value: "USD GBP",
            })
        );
        act(() =>
          apiRef.current.stopCellEditMode({ id: 0, field: "currencyPair" })
        );
        expect(getCell(0, 1)).not.toHaveClass("MuiDataGrid-cell--editing");
      });

      it("should update the CSS class of the cell", async () => {
        render(<TestCase />);
        act(() =>
          apiRef.current.startCellEditMode({ id: 0, field: "currencyPair" })
        );
        expect(getCell(0, 1)).toHaveClass("MuiDataGrid-cell--editing");
        await act(
          async () =>
            await apiRef.current.setEditCellValue({
              id: 0,
              field: "currencyPair",
              value: "USD GBP",
            })
        );
        act(() =>
          apiRef.current.stopCellEditMode({ id: 0, field: "currencyPair" })
        );
        expect(getCell(0, 1)).not.toHaveClass("MuiDataGrid-cell--editing");
      });

      it("should call processRowUpdate before updating the row", async () => {
        const processRowUpdate = jest.fn((row: any) => ({
          ...row,
          currencyPair: "USD-GBP",
        }));
        render(<TestCase processRowUpdate={processRowUpdate} />);
        act(() =>
          apiRef.current.startCellEditMode({ id: 0, field: "currencyPair" })
        );
        await act(
          async () =>
            await apiRef.current.setEditCellValue({
              id: 0,
              field: "currencyPair",
              value: "USD GBP",
            })
        );
        act(() =>
          apiRef.current.stopCellEditMode({ id: 0, field: "currencyPair" })
        );
        await act(() => Promise.resolve());
        expect(processRowUpdate).toHaveBeenCalledTimes(1);
        expect(getCell(0, 1).textContent).toEqual("USD-GBP");
      });

      it("should call processRowUpdate with the new and old row", async () => {
        const processRowUpdate = jest.fn((newRow: any, oldRow: any) => ({
          ...oldRow,
          ...newRow,
        }));
        render(<TestCase processRowUpdate={processRowUpdate} />);
        act(() =>
          apiRef.current.startCellEditMode({ id: 0, field: "currencyPair" })
        );
        await act(
          async () =>
            await apiRef.current.setEditCellValue({
              id: 0,
              field: "currencyPair",
              value: "USD GBP",
            })
        );
        act(() =>
          apiRef.current.stopCellEditMode({ id: 0, field: "currencyPair" })
        );
        await act(() => Promise.resolve());
        expect(
          processRowUpdate.mock.calls[processRowUpdate.mock.calls.length - 1][0]
        ).toEqual({ ...defaultData.rows[0], currencyPair: "USD GBP" });

        expect(
          processRowUpdate.mock.calls[processRowUpdate.mock.calls.length - 1][1]
        ).toEqual({ ...defaultData.rows[0] });
      });

      it("should stay in edit mode if processRowUpdate throws an error", async () => {
        const processRowUpdate = () => {
          throw new Error("Something went wrong");
        };
        const onProcessRowUpdateError = jest.fn();
        render(
          <TestCase
            processRowUpdate={processRowUpdate}
            onProcessRowUpdateError={onProcessRowUpdateError}
          />
        );
        act(() =>
          apiRef.current.startCellEditMode({ id: 0, field: "currencyPair" })
        );
        await act(async () => {
          await apiRef.current.stopCellEditMode({
            id: 0,
            field: "currencyPair",
          });
        });
        expect(onProcessRowUpdateError).toHaveBeenCalledTimes(1);
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
        act(() =>
          apiRef.current.startCellEditMode({ id: 0, field: "currencyPair" })
        );
        try {
          act(() =>
            apiRef.current.stopCellEditMode({ id: 0, field: "currencyPair" })
          );
        } catch (e) {}
        expect(onProcessRowUpdateError).toHaveBeenCalledWith(error);
      });

      it("should call onProcessRowUpdateError if processRowUpdate rejects", async () => {
        const error = new Error("Something went wrong");
        const processRowUpdate = async () => {
          throw error;
        };
        const onProcessRowUpdateError = jest.fn();
        render(
          <TestCase
            processRowUpdate={processRowUpdate}
            onProcessRowUpdateError={onProcessRowUpdateError}
          />
        );
        act(() =>
          apiRef.current.startCellEditMode({ id: 0, field: "currencyPair" })
        );
        await act(async () => {
          try {
            await apiRef.current.stopCellEditMode({
              id: 0,
              field: "currencyPair",
            });
          } catch (e) {}
        });
        expect(onProcessRowUpdateError).toHaveBeenCalledWith(error);
      });

      // it("should pass the new value through the value setter before calling processRowUpdate", async () => {
      //   const valueSetter = jest.fn((value: string, row: any) => ({
      //     ...row,
      //     currencyPair: value.trim(),
      //   }));
      //   const processRowUpdate = jest.fn(() => new Promise(() => {}));
      //   render(
      //     <TestCase processRowUpdate={processRowUpdate} columnProps={{ valueSetter }} />
      //   );
      //   act(() =>
      //     apiRef.current.startCellEditMode({ id: 0, field: "currencyPair" })
      //   );
      //   await act(async () =>
      //     apiRef.current.setEditCellValue({
      //       id: 0,
      //       field: "currencyPair",
      //       value: "USD GBP",
      //     })
      //   );
      //   act(() => apiRef.current.stopCellEditMode({ id: 0, field: "currencyPair" }));
      //   await act(async () => Promise.resolve());
      //   expect(processRowUpdate.mock.calls.length).toBeGreaterThan(0);
      //   expect(processRowUpdate.mock.calls[0][0]).toEqual({
      //     ...defaultData.rows[0],
      //     currencyPair: "USDGBP",
      //     _currencyPair: "USD GBP",
      //   });
      //   expect(valueSetter.mock.calls.length).toBeGreaterThan(0);
      //   expect(valueSetter.mock.calls[valueSetter.mock.calls.length - 1][0]).toEqual(
      //     "USD GBP"
      //   );
      //   expect(valueSetter.mock.calls[valueSetter.mock.calls.length - 1][1]).toEqual(
      //     defaultData.rows[0]
      //   );
      // });

      it("should move focus to the cell below when cellToFocusAfter=below", async () => {
        const renderEditCellProp = (props: GridCellProps) => (
          <CustomEditComponent {...props} />
        );
        render(
          <TestCase columnProps={{ renderEditCell: renderEditCellProp }} />
        );
        act(() =>
          apiRef.current.startCellEditMode({ id: 0, field: "currencyPair" })
        );
        expect(getCell(0, 1).querySelector("input")).toHaveFocus();
        act(() =>
          apiRef.current.stopCellEditMode({
            id: 0,
            field: "currencyPair",
            cellToFocusAfter: "below",
          })
        );
        expect(getCell(1, 1)).toHaveFocus();
      });

      it("should move focus to the cell on the right when cellToFocusAfter=right", async () => {
        const renderEditCellProp = (props: GridCellProps) => (
          <CustomEditComponent {...props} />
        );
        render(
          <TestCase
            {...getBasicGridData(1, 3)}
            columns={[
              { field: "id" },
              { field: "currencyPair", editable: true },
              { field: "price1M", editable: true },
            ]}
            columnProps={{ renderEditCell: renderEditCellProp }}
          />
        );
        act(() =>
          apiRef.current.startCellEditMode({ id: 0, field: "currencyPair" })
        );
        expect(getCell(0, 1).querySelector("input")).toHaveFocus();
        act(() =>
          apiRef.current.stopCellEditMode({
            id: 0,
            field: "currencyPair",
            cellToFocusAfter: "right",
          })
        );
        expect(getCell(0, 2)).toHaveFocus();
      });

      it("should move focus to the cell on the left when cellToFocusAfter=left", async () => {
        const renderEditCellProp = (props: GridCellProps) => (
          <CustomEditComponent {...props} />
        );
        render(
          <TestCase
            {...getBasicGridData(1, 3)}
            columns={[
              { field: "id" },
              { field: "currencyPair", editable: true },
              { field: "price1M", editable: true },
            ]}
            columnProps={{ renderEditCell: renderEditCellProp }}
          />
        );

        act(() =>
          apiRef.current.startCellEditMode({ id: 0, field: "price1M" })
        );
        expect(getCell(0, 2).querySelector("input")).toHaveFocus();
        act(() =>
          apiRef.current.stopCellEditMode({
            id: 0,
            field: "price1M",
            cellToFocusAfter: "left",
          })
        );
        expect(getCell(0, 1)).toHaveFocus();
      });

      it("should run all pending value mutations before calling processRowUpdate", async () => {
        const processRowUpdate = jest.fn();
        const renderEditCell = jest.fn(defaultRenderEditCell);
        render(
          <TestCase
            processRowUpdate={processRowUpdate}
            columnProps={{ renderEditCell }}
          />
        );
        act(() =>
          apiRef.current.startCellEditMode({ id: 0, field: "currencyPair" })
        );
        await act(
          () =>
            new Promise<void>((resolve) => {
              apiRef.current.setEditCellValue({
                id: 0,
                field: "currencyPair",
                value: "USD GBP",
                debounceMs: 100,
              });
              resolve();
            })
        );
        act(() =>
          apiRef.current.stopCellEditMode({ id: 0, field: "currencyPair" })
        );
        const lastRenderEditCellCallArgs =
          renderEditCell.mock.calls[renderEditCell.mock.calls.length - 1]?.[0];
        const lastProcessRowUpdateCallArgs =
          processRowUpdate.mock.calls[
            processRowUpdate.mock.calls.length - 1
          ]?.[0];
        expect(lastRenderEditCellCallArgs?.value).toEqual("USD GBP");
        expect(lastProcessRowUpdateCallArgs?.currencyPair).toEqual("USD GBP");
      });

      // it("should keep in edit mode the cells that entered edit mode while processRowUpdate is called", async () => {
      //   const onCellModesModelChange = jest.fn();
      //   let resolveCallback: () => void;
      //   const processRowUpdate = (newRow: any) =>
      //     new Promise((resolve) => {
      //       resolveCallback = () => resolve(newRow);
      //     });

      //   render(
      //     <TestCase
      //       processRowUpdate={processRowUpdate}
      //       onCellModesModelChange={onCellModesModelChange}
      //     />
      //   );

      //   act(() =>
      //     apiRef.current.startCellEditMode({ id: 0, field: "currencyPair" })
      //   );

      //   await act(async () =>
      //     apiRef.current.setEditCellValue({
      //       id: 0,
      //       field: "currencyPair",
      //       value: "USD GBP",
      //     })
      //   );

      //   act(() =>
      //     apiRef.current.stopCellEditMode({ id: 0, field: "currencyPair" })
      //   );

      //   // Очікуємо, що режим залишиться "edit" до завершення processRowUpdate
      //   expect(onCellModesModelChange.mock.calls[0]?.[0]).toEqual({
      //     0: { currencyPair: { mode: "edit" } },
      //   });

      //   act(() =>
      //     apiRef.current.startCellEditMode({ id: 1, field: "currencyPair" })
      //   );

      //   const lastCallKeys = Object.keys(
      //     onCellModesModelChange.mock.calls[
      //       onCellModesModelChange.mock.calls.length - 1
      //     ]?.[0] || {}
      //   );

      //   expect(lastCallKeys).toEqual(["0", "1"]);

      //   const lastCall = onCellModesModelChange.mock.calls[onCellModesModelChange.mock.calls.length - 1]?.[0];
      //   if (lastCall && lastCall["1"]) {
      //     delete lastCall.api;
      //   }

      //   expect(lastCall["1"]).toEqual({
      //     currencyPair: { mode: "edit" },
      //   });
      //   resolveCallback!();
      //   await act(() => Promise.resolve());

      //   expect(onCellModesModelChange.mock.calls[onCellModesModelChange.mock.calls.length - 1]?.[0]).toEqual({
      //     0: { currencyPair: { mode: "view" } },
      //     1: { currencyPair: { mode: "edit" } },
      //   });
      // });
    });
  });

  describe("start edit mode", () => {
    describe("by double-click", () => {
      it(`should publish 'cellEditStart' with reason=cellDoubleClick`, () => {
        render(<TestCase />);
        const listener = jest.fn();
        apiRef.current.subscribeEvent("cellEditStart", listener);
        const cell = getCell(0, 1);
        fireEvent.doubleClick(cell);
        expect(listener).toHaveBeenCalled();
        const eventArg = listener.mock.calls[0][0];
        expect(eventArg?.reason).toEqual("cellDoubleClick");
      });

      it(`should not publish 'cellEditStart' if the cell is not editable`, () => {
        render(<TestCase />);
        const listener = jest.fn();
        apiRef.current.subscribeEvent("cellEditStart", listener);
        const cell = getCell(0, 0);
        fireEvent.doubleClick(cell);
        expect(listener).toHaveBeenCalledTimes(0);
      });

      it("should call startCellEditMode", () => {
        render(<TestCase />);
        const spiedStartCellEditMode = spyApi(
          apiRef.current,
          "startCellEditMode"
        );
        const cell = getCell(0, 1);
        fireEvent.doubleClick(cell);
        expect(spiedStartCellEditMode).toHaveBeenCalledTimes(1);
      });
    });

    describe("by pressing a special character", () => {
      it(`should publish 'cellEditStart' with reason=printableKeyDown`, () => {
        render(<TestCase />);
        const listener = jest.fn();
        apiRef.current.subscribeEvent("cellEditStart", listener);
        const cell = getCell(0, 1);
        userEvent.click(cell);
        fireEvent.keyDown(cell, { key: "$" });
        expect(listener).toHaveBeenCalled();
        const firstCall = listener.mock.calls[0]?.[0];
        expect(firstCall?.reason).toEqual("printableKeyDown");
      });

      it(`should not publish 'cellEditStart' if space is pressed`, () => {
        render(<TestCase autoHeight />);
        const listener = jest.fn();
        apiRef.current.subscribeEvent("cellEditStart", listener);
        const cell = getCell(0, 1);
        userEvent.click(cell);
        fireEvent.keyDown(cell, { key: " " });
        expect(listener).toHaveBeenCalledTimes(0);
      });
    });
    describe("by pressing a number", () => {
      it(`should publish 'cellEditStart' with reason=printableKeyDown`, () => {
        render(<TestCase />);
        const listener = jest.fn();
        apiRef.current.subscribeEvent("cellEditStart", listener);
        const cell = getCell(0, 1);
        userEvent.click(cell);
        fireEvent.keyDown(cell, { key: "1" });
        expect(listener).toHaveBeenCalled();
        const firstCall = listener.mock.calls[0]?.[0];
        expect(firstCall?.reason).toEqual("printableKeyDown");
      });
    });

    describe("by pressing Enter", () => {
      it(`should publish 'cellEditStart' with reason=enterKeyDown`, () => {
        render(<TestCase />);
        const listener = jest.fn();
        apiRef.current.subscribeEvent("cellEditStart", listener);
        const cell = getCell(0, 1);
        userEvent.click(cell);
        fireEvent.keyDown(cell, { key: "Enter" });
        expect(listener).toHaveBeenCalled();
        const firstCall = listener.mock.calls[0]?.[0];
        expect(firstCall?.reason).toEqual("enterKeyDown");
      });

      it(`should not publish 'cellEditStart' if the cell is not editable`, () => {
        render(<TestCase />);
        const listener = jest.fn();
        apiRef.current.subscribeEvent("cellEditStart", listener);
        const cell = getCell(0, 0);
        userEvent.click(cell);
        fireEvent.keyDown(cell, { key: "Enter" });
        expect(listener).toHaveBeenCalledTimes(0);
      });

      // it("should call startCellEditMode", async () => {
      //   render(<TestCase />);
      //   const spiedStartCellEditMode = jest.spyOn(apiRef.current, "startCellEditMode");
      //   const cell = getCell(0, 1);
      //   userEvent.click(cell);
      //   cell.focus();
      //   await act(async () => {
      //     fireEvent.keyDown(cell, { key: "Enter" });
      //   });
      //   expect(spiedStartCellEditMode).toHaveBeenCalledTimes(1);
      //   spiedStartCellEditMode.mockRestore();
      // });
    });

    describe("by pressing Delete", () => {
      it("should publish 'cellEditStart' with reason=deleteKeyDown", () => {
        render(<TestCase />);
        const listener = jest.fn();
        apiRef.current.subscribeEvent("cellEditStart", listener);
        const cell = getCell(0, 1);
        userEvent.click(cell);
        fireEvent.keyDown(cell, { key: "Delete" });
        expect(listener).toHaveBeenCalledTimes(1);
        expect(listener.mock.calls[0][0].reason).toEqual("deleteKeyDown");
      });

      it(`should not publish 'cellEditStart' if the cell is not editable`, () => {
        render(<TestCase />);
        const listener = jest.fn();
        apiRef.current.subscribeEvent("cellEditStart", listener);
        const cell = getCell(0, 0);
        userEvent.click(cell);
        fireEvent.keyDown(cell, { key: "Delete" });
        expect(listener).toHaveBeenCalledTimes(0);
      });

      // it("should call startCellEditMode on Delete key press", () => {
      //   render(<TestCase />);
      //   const spiedStartCellEditMode = jest.spyOn(apiRef.current, "startCellEditMode");
      //   const cell = getCell(0, 1);
      //   userEvent.click(cell);
      //   cell.focus();
      //   fireEvent.keyDown(cell, { key: "Delete" });
      //   expect(spiedStartCellEditMode).toHaveBeenCalledTimes(1);
      //   spiedStartCellEditMode.mockRestore();
      // });

      // it("should empty the cell on Delete key press", () => {
      //   render(<TestCase />);
      //   const spiedStartCellEditMode = spyApi(apiRef.current, "startCellEditMode");
      //   const cell = getCell(0, 1);
      //   userEvent.click(cell);
      //   cell.focus();
      //   fireEvent.keyDown(cell, { key: "Delete" });
      //   expect(spiedStartCellEditMode.callCount).toEqual(1);
      //   expect(spiedStartCellEditMode.lastCall.args[0]).toEqual({
      //     id: 0,
      //     field: "currencyPair",
      //     deleteValue: true,
      //   });
      // });
    });

    describe("by pressing a printable character", () => {
      it("should call startCellEditMode on 'a' key press", () => {
        render(<TestCase />);
        const spiedStartCellEditMode = spyApi(
          apiRef.current,
          "startCellEditMode"
        );
        const cell = getCell(0, 1);
        userEvent.click(cell);
        fireEvent.keyDown(cell, { key: "a" });
        expect(spiedStartCellEditMode).toHaveBeenCalledTimes(1);
      });

      it(`should publish 'cellEditStart' with reason=printableKeyDown`, () => {
        render(<TestCase />);
        const spiedCellEditStart = spyApi(apiRef.current, "publishEvent");
        const cell = getCell(0, 1);
        userEvent.click(cell);
        fireEvent.keyDown(cell, { key: "a" });
        const cellEditStartCall = spiedCellEditStart.mock.calls.find(
          ([eventName]: [string, { reason?: string }]) =>
            eventName === "cellEditStart"
        );
        expect(cellEditStartCall).toBeDefined();
        expect(cellEditStartCall![1].reason).toEqual("printableKeyDown");
      });

      it(`should not publish 'cellEditStart' if the cell is not editable`, () => {
        render(<TestCase />);
        const listener = jest.fn();
        apiRef.current.subscribeEvent("cellEditStart", listener);
        const cell = getCell(0, 0);
        userEvent.click(cell);
        fireEvent.keyDown(cell, { key: "a" }); // A
        expect(listener).toHaveBeenCalledTimes(0);
      });

      ["ctrlKey", "metaKey"].forEach((key) => {
        it(`should not publish 'cellEditStart' if ${key} is pressed`, () => {
          render(<TestCase />);
          const listener = jest.fn();
          apiRef.current.subscribeEvent("cellEditStart", listener);
          const cell = getCell(0, 1);
          userEvent.click(cell);
          fireEvent.keyDown(cell, { key: "a", [key]: true }); // for example Ctrl + A, copy
          expect(listener).toHaveBeenCalledTimes(0);
        });
      });

      it(`should call startCellEditMode if shiftKey is pressed with a letter`, () => {
        render(<TestCase />);
        const listener = jest.fn();
        apiRef.current.subscribeEvent("cellEditStart", listener);
        const cell = getCell(0, 1);
        userEvent.click(cell);
        fireEvent.keyDown(cell, { key: "a", shiftKey: true }); // Print A in uppercase
        expect(listener).toHaveBeenCalledTimes(1);
      });

      // it("should call startCellEditMode if the paste shortcut is pressed", () => {
      //   render(<TestCase />);
      //   const spiedStartCellEditMode = spyApi(apiRef.current, "startCellEditMode");
      //   const cell = getCell(0, 1);
      //   userEvent.click(cell);
      //   fireEvent.keyDown(cell, { key: "v", ctrlKey: true });
      //   expect(spiedStartCellEditMode.callCount).toEqual(1);
      // });

      it(`should call startCellEditMode if a special character on macOS is pressed`, () => {
        render(<TestCase />);
        const listener = jest.fn();
        apiRef.current.subscribeEvent("cellEditStart", listener);
        const cell = getCell(0, 1);
        userEvent.click(cell);
        fireEvent.keyDown(cell, { key: "π", altKey: true }); // ⌥ Option + P
        expect(listener).toHaveBeenCalledTimes(1);
      });

      // it("should empty the cell on key press", () => {
      //   render(<TestCase />);
      //   const spiedStartCellEditMode = spyApi(apiRef.current, "startCellEditMode");

      //   const cell = getCell(0, 1);
      //   userEvent.click(cell);
      //   fireEvent.keyDown(cell, { key: "a" });
      //   expect(spiedStartCellEditMode.callCount).toEqual(1);
      //   expect(spiedStartCellEditMode.lastCall.args[0]).toEqual({
      //     id: 0,
      //     field: "currencyPair",
      //     deleteValue: true,
      //   });
      // });

      it("should ignore keydown event until the IME is confirmed with a letter", () => {
        render(<TestCase />);
        const listener = jest.fn();
        apiRef.current.subscribeEvent("cellEditStop", listener);
        const cell = getCell(0, 1);
        fireEvent.doubleClick(cell);
        const input = cell.querySelector("input")!;
        fireEvent.change(input, { target: { value: "あ" } });
        fireEvent.keyDown(cell, { key: "Enter", keyCode: 229 });
        expect(listener).toHaveBeenCalledTimes(0);
        fireEvent.keyDown(cell, { key: "Enter", keyCode: 13 });
        expect(listener).toHaveBeenCalledTimes(1);
        expect(input.value).toEqual("あ");
        expect(listener.mock.calls[0][0].reason).toEqual("enterKeyDown");
      });

      it("should ignore keydown event until the IME is confirmed with multiple letters", () => {
        render(<TestCase />);
        const listener = jest.fn();
        apiRef.current.subscribeEvent("cellEditStop", listener);
        const cell = getCell(0, 1);
        fireEvent.doubleClick(cell);
        const input = cell.querySelector("input")!;
        fireEvent.change(input, { target: { value: "ありがとう" } });
        fireEvent.keyDown(cell, { key: "Enter", keyCode: 229 });
        expect(listener).toHaveBeenCalledTimes(0);
        fireEvent.keyDown(cell, { key: "Enter", keyCode: 13 });
        expect(listener).toHaveBeenCalledTimes(1);
        expect(input.value).toEqual("ありがとう");
        expect(listener.mock.calls[0][0].reason).toEqual("enterKeyDown");
      });
    });
  });

  describe("stop edit mode", () => {
    describe("by clicking outside the cell", () => {
      it("should publish 'cellEditStop' with reason=cellFocusOut", () => {
        render(<TestCase />);
        const listener = jest.fn();
        apiRef.current.subscribeEvent("cellEditStop", listener);
        fireEvent.doubleClick(getCell(0, 1));
        expect(listener).not.toHaveBeenCalled();
        userEvent.click(getCell(1, 1));
        expect(listener).toHaveBeenCalledTimes(1);
        expect(listener.mock.calls[0][0].reason).toEqual("cellFocusOut");
      });

      it("should call stopCellEditMode with ignoreModifications=false and cellToFocusAfter=undefined", () => {
        render(<TestCase />);
        const spiedStopCellEditMode = spyApi(
          apiRef.current,
          "stopCellEditMode"
        );
        fireEvent.doubleClick(getCell(0, 1));
        userEvent.click(getCell(1, 1));
        expect(spiedStopCellEditMode).toHaveBeenCalledTimes(1);
        expect(spiedStopCellEditMode.mock.calls[0][0]).toEqual({
          id: 0,
          field: "currencyPair",
          cellToFocusAfter: undefined,
          ignoreModifications: false,
        });
      });

      // it("should call stopCellEditMode with ignoreModifications=false if the props are being processed", async () => {
      //   const preProcessEditCellProps = () => new Promise(() => {});
      //   render(<TestCase columnProps={{ preProcessEditCellProps }} />);
      //   const spiedStopCellEditMode = spyApi(apiRef.current, "stopCellEditMode");
      //   fireEvent.doubleClick(getCell(0, 1));
      //   await act(async () => {
      //     await apiRef.current.setEditCellValue({
      //       id: 0,
      //       field: "currencyPair",
      //       value: "USD GBP",
      //     });
      //   });
      //   userEvent.click(getCell(1, 1));
      //   expect(spiedStopCellEditMode).toHaveBeenCalledTimes(1);
      //   expect(spiedStopCellEditMode.mock.calls[0][0].ignoreModifications).toEqual(false);
      // });
    });

    describe("by pressing Escape", () => {
      it("should publish 'cellEditStop' with reason=escapeKeyDown", () => {
        render(<TestCase />);
        const listener = jest.fn();
        apiRef.current.subscribeEvent("cellEditStop", listener);
        const cell = getCell(0, 1);
        userEvent.click(cell);
        fireEvent.doubleClick(cell);
        expect(listener).not.toHaveBeenCalled();
        fireEvent.keyDown(cell, { key: "Escape" });
        expect(listener).toHaveBeenCalledTimes(1);
        expect(listener.mock.calls[0][0].reason).toEqual("escapeKeyDown");
      });

      it("should call stopCellEditMode with ignoreModifications=true and cellToFocusAfter=undefined", () => {
        render(<TestCase />);
        const spiedStopCellEditMode = spyApi(
          apiRef.current,
          "stopCellEditMode"
        );
        const cell = getCell(0, 1);
        userEvent.click(cell);
        fireEvent.doubleClick(cell);
        fireEvent.keyDown(cell, { key: "Escape" });
        expect(spiedStopCellEditMode).toHaveBeenCalledTimes(1);
        expect(spiedStopCellEditMode.mock.calls[0][0]).toEqual({
          id: 0,
          field: "currencyPair",
          cellToFocusAfter: undefined,
          ignoreModifications: true,
        });
      });
    });

    describe("by pressing Enter", () => {
      it("should publish 'cellEditStop' with reason=enterKeyDown", () => {
        render(<TestCase />);
        const listener = jest.fn();
        apiRef.current.subscribeEvent("cellEditStop", listener);
        const cell = getCell(0, 1);
        userEvent.click(cell);
        fireEvent.doubleClick(cell);
        expect(listener).not.toHaveBeenCalled();
        fireEvent.keyDown(cell, { key: "Enter" });
        expect(listener).toHaveBeenCalledTimes(1);
        expect(listener.mock.calls[0][0].reason).toEqual("enterKeyDown");
      });

      it("should call stopCellEditMode with ignoreModifications=false and cellToFocusAfter=below", () => {
        render(<TestCase />);
        const spiedStopCellEditMode = spyApi(
          apiRef.current,
          "stopCellEditMode"
        );

        const cell = getCell(0, 1);
        userEvent.click(cell);
        fireEvent.doubleClick(cell);
        fireEvent.keyDown(cell, { key: "Enter" });
        expect(spiedStopCellEditMode).toHaveBeenCalledTimes(1);
        expect(spiedStopCellEditMode.mock.calls[0][0]).toEqual({
          id: 0,
          field: "currencyPair",
          cellToFocusAfter: "below",
          ignoreModifications: false,
        });
      });

      // it("should call stopCellEditMode with ignoreModifications=false if the props are being processed", async () => {
      //   const preProcessEditCellProps = () => new Promise(() => {});
      //   render(<TestCase columnProps={{ preProcessEditCellProps }} />);
      //   const spiedStopCellEditMode = spyApi(apiRef.current, "stopCellEditMode");

      //   const cell = getCell(0, 1);
      //   userEvent.click(cell); // Enter edit mode
      //   fireEvent.doubleClick(cell);
      //   await act(async () =>
      //     apiRef.current.setEditCellValue({
      //       id: 0,
      //       field: "currencyPair",
      //       value: "USD GBP",
      //     })
      //   );
      //   fireEvent.keyDown(cell, { key: "Enter" });
      //   expect(spiedStopCellEditMode).toHaveBeenCalledTimes(1);
      //   expect(spiedStopCellEditMode.mock.calls[0][0].ignoreModifications).toEqual(false);
      // });
    });

    describe("by pressing Tab", () => {
      it("should publish 'cellEditStop' with reason=tabKeyDown", () => {
        render(<TestCase />);
        const listener = jest.fn();
        apiRef.current.subscribeEvent("cellEditStop", listener);
        const cell = getCell(0, 1);
        userEvent.click(cell);
        fireEvent.doubleClick(cell);
        expect(listener).not.toHaveBeenCalled();
        fireEvent.keyDown(cell, { key: "Tab" });
        expect(listener).toHaveBeenCalledTimes(1);
        expect(listener.mock.calls[0][0].reason).toEqual("tabKeyDown");
      });

      it("should call stopCellEditMode with ignoreModifications=false and cellToFocusAfter=right", () => {
        render(<TestCase />);
        const spiedStopCellEditMode = spyApi(
          apiRef.current,
          "stopCellEditMode"
        );
        const cell = getCell(0, 1);
        userEvent.click(cell);
        fireEvent.doubleClick(cell);
        fireEvent.keyDown(cell, { key: "Tab" });
        expect(spiedStopCellEditMode).toHaveBeenCalledTimes(1);
        expect(spiedStopCellEditMode.mock.calls[0][0]).toEqual({
          id: 0,
          field: "currencyPair",
          cellToFocusAfter: "right",
          ignoreModifications: false,
        });
      });

      // it("should call stopCellEditMode with ignoreModifications=false if the props are being processed", async () => {
      //   const preProcessEditCellProps = () => new Promise(() => {});
      //   render(<TestCase columnProps={{ preProcessEditCellProps }} />);
      //   const spiedStopCellEditMode = spyApi(apiRef.current, "stopCellEditMode");
      //   const cell = getCell(0, 1);
      //   userEvent.click(cell);
      //   fireEvent.doubleClick(cell);
      //   await act(async () =>
      //     apiRef.current.setEditCellValue({
      //       id: 0,
      //       field: "currencyPair",
      //       value: "USD GBP",
      //     })
      //   );
      //   fireEvent.keyDown(cell, { key: "Tab" });
      //   expect(spiedStopCellEditMode).toHaveBeenCalledTimes(1);
      //   expect(spiedStopCellEditMode.mock.calls[0][0].ignoreModifications).toEqual(false);
      // });
    });
  });

  describe("prop: cellModesModel", () => {
    describe("mode=view to mode=edit", () => {
      it("should start edit mode", () => {
        const { rerender } = render(<TestCase />);
        expect(getCell(0, 1)).not.toHaveClass("MuiDataGrid-cell--editing");
        rerender(
          <TestCase
            cellModesModel={{
              0: { currencyPair: { mode: GridCellModes.Edit } },
            }}
          />
        );
        expect(getCell(0, 1)).toHaveClass("MuiDataGrid-cell--editing");
      });
    });

    describe("mode=edit to mode=view", () => {
      it("should stop edit mode", () => {
        const { rerender } = render(
          <TestCase
            cellModesModel={{
              0: { currencyPair: { mode: GridCellModes.Edit } },
            }}
          />
        );
        expect(getCell(0, 1)).toHaveClass("MuiDataGrid-cell--editing");
        rerender(
          <TestCase
            cellModesModel={{
              0: { currencyPair: { mode: GridCellModes.View } },
            }}
          />
        );
        expect(getCell(0, 1)).not.toHaveClass("MuiDataGrid-cell--editing");
      });

      it("should ignode modifications if ignoreModifications=true", async () => {
        const { rerender } = render(
          <TestCase
            cellModesModel={{
              0: { currencyPair: { mode: GridCellModes.Edit } },
            }}
          />
        );
        await act(
          async () =>
            await apiRef.current.setEditCellValue({
              id: 0,
              field: "currencyPair",
              value: "USD GBP",
            })
        );
        rerender(
          <TestCase
            cellModesModel={{
              0: {
                currencyPair: {
                  mode: GridCellModes.View,
                  ignoreModifications: true,
                },
              },
            }}
          />
        );
        expect(getCell(0, 1).textContent).toEqual("USDGBP");
      });

      it("should move focus to the cell that is set in cellToFocusAfter", async () => {
        const { rerender } = render(
          <TestCase
            cellModesModel={{
              0: { currencyPair: { mode: GridCellModes.Edit } },
            }}
          />
        );
        await act(
          async () =>
            await apiRef.current.setEditCellValue({
              id: 0,
              field: "currencyPair",
              value: "USD GBP",
            })
        );
        rerender(
          <TestCase
            cellModesModel={{
              0: {
                currencyPair: {
                  mode: GridCellModes.View,
                  cellToFocusAfter: "below",
                },
              },
            }}
          />
        );
        expect(getCell(1, 1)).toHaveFocus();
      });
    });

    // it("should publish 'cellModesModelChange' when the model changes", () => {
    //   render(<TestCase />);
    //   const listener = jest.fn();
    //   apiRef.current.subscribeEvent("cellModesModelChange", listener);
    //   const cell = getCell(0, 1);
    //   fireEvent.doubleClick(cell);
    //   expect(listener).toHaveBeenCalledTimes(1);
    //   expect(listener).toHaveBeenCalledWith({
    //     0: { currencyPair: { mode: "edit" } },
    //   });
    // });

    // it("should publish 'cellModesModelChange' when the prop changes", () => {
    //   const { rerender } = render(<TestCase cellModesModel={{}} />);
    //   const listener = jest.fn();
    //   expect(listener).not.toHaveBeenCalled();
    //   apiRef.current.subscribeEvent("cellModesModelChange", listener);
    //   rerender(
    //     <TestCase
    //       cellModesModel={{ 0: { currencyPair: { mode: GridCellModes.Edit } } }}
    //     />
    //   );
    //   expect(listener).toHaveBeenCalledTimes(1);
    //   expect(listener).toHaveBeenCalledWith({
    //     0: { currencyPair: { mode: "edit" } },
    //   });
    // });

    it(`should not publish 'cellModesModelChange' when the model changes and cellModesModel is set`, () => {
      render(<TestCase cellModesModel={{}} />);
      const listener = jest.fn();
      apiRef.current.subscribeEvent("cellModesModelChange", listener);
      const cell = getCell(0, 1);
      fireEvent.doubleClick(cell);
      expect(listener).toHaveBeenCalledTimes(0);
    });

    it("should not mutate the cellModesModel prop if props of any column contains error=true", async () => {
      const preProcessEditCellProps = ({
        props,
      }: GridPreProcessEditCellProps) => ({
        ...props,
        error: true,
      });
      const { rerender } = render(
        <TestCase columnProps={{ preProcessEditCellProps }} />
      );
      const cell = getCell(0, 1);
      fireEvent.mouseUp(cell);
      fireEvent.click(cell);
      fireEvent.doubleClick(cell);

      await act(
        async () =>
          await apiRef.current.setEditCellValue({
            id: 0,
            field: "currencyPair",
            value: "USD GBP",
          })
      );

      const cellModesModel = { 0: { currencyPair: { mode: "view" } } };
      rerender(
        <TestCase
          cellModesModel={{ 0: { currencyPair: { mode: GridCellModes.View } } }}
        />
      );
      expect(cellModesModel).toEqual({
        0: { currencyPair: { mode: "view" } },
      });
    });
  });

  describe("prop: onCellModesModelChange", () => {
    it("should call onCellModesModelChange with mode=edit when startEditMode is called", () => {
      const onCellModesModelChange = jest.fn();
      render(<TestCase onCellModesModelChange={onCellModesModelChange} />);
      expect(onCellModesModelChange).not.toHaveBeenCalled();
      act(() =>
        apiRef.current.startCellEditMode({ id: 0, field: "currencyPair" })
      );
      const [modelChangeArgument] = onCellModesModelChange.mock.calls[0];
      expect(modelChangeArgument).toEqual({
        0: { currencyPair: { mode: "edit" } },
      });
    });

    it("should call onCellModesModelChange with mode=view when stopEditMode is called", () => {
      const onCellModesModelChange = jest.fn();
      render(<TestCase onCellModesModelChange={onCellModesModelChange} />);
      act(() =>
        apiRef.current.startCellEditMode({ id: 0, field: "currencyPair" })
      );
      onCellModesModelChange.mockClear();
      act(() =>
        apiRef.current.stopCellEditMode({ id: 0, field: "currencyPair" })
      );
      const [modelChangeArgument] = onCellModesModelChange.mock.calls[0];
      expect(modelChangeArgument).toEqual({
        0: { currencyPair: { mode: "view" } },
      });
    });

    it(`should not be called when changing the cellModesModel prop`, () => {
      const onCellModesModelChange = jest.fn();
      const { rerender } = render(
        <TestCase
          cellModesModel={{}}
          onCellModesModelChange={onCellModesModelChange}
        />
      );
      expect(onCellModesModelChange).toHaveBeenCalledTimes(0);
      rerender(
        <TestCase
          cellModesModel={{ 0: { currencyPair: { mode: GridCellModes.Edit } } }}
        />
      );
      expect(onCellModesModelChange).toHaveBeenCalledTimes(0);
    });
  });
});
