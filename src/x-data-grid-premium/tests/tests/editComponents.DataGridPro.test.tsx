import * as React from "react";
import {
  GridApi,
  DataGridProProps,
  useGridApiRef,
  DataGridPro,
  GridEditCellValueParams,
  renderEditBooleanCell,
  renderEditDateCell,
  renderEditInputCell,
  renderEditSingleSelectCell,
} from "@mui/x-data-grid-pro";
// import { act, createRenderer, fireEvent, screen, waitFor, within } from '@mui/internal-test-utils';
import {
  render,
  screen,
  within,
  act,
  waitFor,
  fireEvent,
} from "@testing-library/react";
// import { expect } from 'chai';
import { getCell, spyApi } from "../helperFn";
// import { fireUserEvent } from 'test/utils/fireUserEvent';
// import { spy, SinonSpy } from 'sinon';
import userEvent from "@testing-library/user-event";

/**
 * Creates a date that is compatible with years before 1901
 * `new Date(0001)` creates a date for 1901, not 0001
 */
const generateDate = (year: number, month: number, date: number, hours = 0, minutes = 0) => {
  const rawDate = new Date(Date.UTC(year, month, date, hours, minutes, 0, 0));
  return rawDate.getTime();
};

describe("<DataGridPro /> - Edit components", () => {
  // const { render, clock } = createRenderer();

  let apiRef: React.MutableRefObject<GridApi>;

  const defaultData: Pick<DataGridProProps, "rows" | "columns"> = {
    columns: [],
    rows: [],
  };

  function TestCase(props: Partial<DataGridProProps>) {
    apiRef = useGridApiRef();
    return (
      <div style={{ width: 300, height: 300 }}>
        <DataGridPro apiRef={apiRef} {...defaultData} {...props} />
      </div>
    );
  }

  describe("column type: string", () => {
    beforeEach(() => {
      defaultData.rows = [{ id: 0, brand: "Nike" }];
      defaultData.columns = [
        { field: "brand", type: "string", editable: true },
      ];
    });

    it("should call setEditCellValue with debounce", () => {
      render(<TestCase />);
      const spiedSetEditCellValue = spyApi(apiRef.current, "setEditCellValue");

      const cell = getCell(0, 0);
      fireEvent.doubleClick(cell);

      const input = within(cell).getByRole<HTMLInputElement>("textbox");
      expect(input.value).toEqual("Nike");
      fireEvent.change(input, { target: { value: "Puma" } });
      const lastCall = spiedSetEditCellValue.mock.calls.at(-1);
      expect(lastCall?.[0].id).toEqual(0);
    });

    it("should pass the value prop to the input", async () => {
      defaultData.columns[0].valueParser = (value) =>
        (value as string).toUpperCase();
      render(<TestCase />);

      const cell = getCell(0, 0);
      act(() => {
        fireEvent.doubleClick(cell);
      });
      const input = within(cell).getByRole<HTMLInputElement>("textbox");
      expect(input.value).toEqual("Nike");

      fireEvent.change(input, { target: { value: "Puma" } });
      expect(input.value).toEqual("PUMA");
    });

    describe("with fake timers", () => {
      jest.useFakeTimers();

      it("should display a indicator while processing the props", async () => {
        defaultData.columns[0].preProcessEditCellProps = ({ props }) =>
          new Promise((resolve) => {
            setTimeout(() => resolve(props), 500);
          });
        render(<TestCase />);

        const cell = getCell(0, 0);
        fireEvent.doubleClick(cell);

        const input = within(cell).getByRole<HTMLInputElement>("textbox");
        expect(input.value).toEqual("Nike");

        expect(screen.queryByTestId("LoadIcon")).toEqual(null);
        fireEvent.change(input, { target: { value: "Puma" } });

        await act(async () => {
          jest.advanceTimersByTime(200);
        });
        expect(screen.queryByTestId("LoadIcon")).not.toEqual(null);

        await act(async () => {
          jest.advanceTimersByTime(500);
        });
        await act(() => Promise.resolve());
        expect(screen.queryByTestId("LoadIcon")).toEqual(null);
      });
    });

    it("should call onValueChange if defined", async () => {
      const onValueChange = jest.fn();

      defaultData.columns[0].renderEditCell = (params) =>
        renderEditInputCell({ ...params, onValueChange });

      render(<TestCase />);

      const cell = getCell(0, 0);
      fireEvent.dblClick(cell);

      const input = within(cell).getByRole<HTMLInputElement>("textbox");
      fireEvent.change(input, { target: { value: "Puma" } });
      await act(() => Promise.resolve());

      expect(onValueChange).toHaveBeenCalledTimes(1);
      expect(onValueChange.mock.calls.at(-1)?.[1]).toEqual("Puma");
    });
  });

  describe("column type: number", () => {
    beforeEach(() => {
      defaultData.rows = [{ id: 0, quantity: 100 }];
      defaultData.columns = [
        { field: "quantity", type: "number", editable: true },
      ];
    });

    it("should call setEditCellValue with debounce", () => {
      render(<TestCase />);
      const spiedSetEditCellValue = spyApi(apiRef.current, "setEditCellValue");

      const cell = getCell(0, 0);
      fireEvent.doubleClick(cell);

      const input = within(cell).getByRole<HTMLInputElement>("spinbutton");
      expect(input.value).toEqual("100");

      fireEvent.change(input, { target: { value: "110" } });
      const lastCall = spiedSetEditCellValue.mock.calls.at(-1);
      expect(lastCall?.[0].id).toEqual(0);
    });

    it("should the value prop to the input", async () => {
      render(<TestCase />);

      const cell = getCell(0, 0);
      await userEvent.dblClick(cell);

      const input = within(cell).getByRole<HTMLInputElement>("spinbutton");
      expect(input.value).toEqual("100");

      fireEvent.change(input, { target: { value: "110" } });
      expect(input.value).toEqual("110");
    });

    it("should keep values as numbers", async () => {
      const preProcessEditCellPropsSpy = jest.fn(({ props }) => props);
      defaultData.columns[0].preProcessEditCellProps =
        preProcessEditCellPropsSpy;
      render(<TestCase />);

      const cell = getCell(0, 0);
      await userEvent.dblClick(cell);

      const input = within(cell).getByRole<HTMLInputElement>("spinbutton");
      expect(input.value).toEqual("100");

      fireEvent.change(input, { target: { value: "110" } });
      await waitFor(() =>
        expect(
          preProcessEditCellPropsSpy.mock.calls.at(-1)?.[0].props.value
        ).toEqual(110)
      );
    });

    describe("with fake timers", () => {
      jest.useFakeTimers();

      it("should display a indicator while processing the props", async () => {
        defaultData.columns[0].preProcessEditCellProps = ({ props }) =>
          new Promise((resolve) => {
            setTimeout(() => resolve(props), 500);
          });
        render(<TestCase />);

        const cell = getCell(0, 0);
        fireEvent.doubleClick(cell);

        const input = within(cell).getByRole<HTMLInputElement>("spinbutton");
        expect(input.value).toEqual("100");

        expect(screen.queryByTestId("LoadIcon")).toEqual(null);
        fireEvent.change(input, { target: { value: 110 } });
        await act(async () => {
          jest.advanceTimersByTime(200);
        });
        expect(screen.queryByTestId("LoadIcon")).not.toEqual(null);

        await act(async () => {
          jest.advanceTimersByTime(500);
        });
        await act(() => Promise.resolve());
        expect(screen.queryByTestId("LoadIcon")).toEqual(null);
      });
    });
  });

  describe("column type: date", () => {
    beforeEach(() => {
      defaultData.rows = [{ id: 0, createdAt: new Date(2022, 1, 18) }];
      defaultData.columns = [
        { field: "createdAt", type: "date", editable: true },
      ];
    });

    it("should call setEditCellValue with the value converted to Date", () => {
      render(<TestCase />);
      const spiedSetEditCellValue = spyApi(apiRef.current, "setEditCellValue");

      const cell = getCell(0, 0);
      fireEvent.doubleClick(cell);

      const input = cell.querySelector("input")!;
      expect(input.value).toEqual("2022-02-18");

      fireEvent.change(input, { target: { value: "2022-02-10" } });

      const lastCall = spiedSetEditCellValue.mock.calls.at(-1);
      expect(lastCall?.[0].id).toEqual(0);
      expect(lastCall?.[0].field).toEqual("createdAt");
      expect(lastCall?.[0].debounceMs).toEqual(undefined);
      expect((lastCall?.[0].value as Date).toISOString()).toEqual(
        new Date(2022, 1, 10).toISOString()
      );
    });

    it("should call setEditCellValue with null when entered an empty value", () => {
      render(<TestCase />);
      const spiedSetEditCellValue = spyApi(apiRef.current, "setEditCellValue");

      const cell = getCell(0, 0);
      fireEvent.doubleClick(cell);

      const input = cell.querySelector("input")!;
      fireEvent.change(input, { target: { value: "" } });
      const lastCall = spiedSetEditCellValue.mock.calls.at(-1);
      expect(lastCall?.[0]?.value).toEqual(null);
    });

    it("should pass the value prop to the input", async () => {
      render(<TestCase />);

      const cell = getCell(0, 0);
      fireEvent.doubleClick(cell);

      const input = cell.querySelector("input")!;
      expect(input.value).toEqual("2022-02-18");
      await act(async () => {
        apiRef.current.setEditCellValue({
          id: 0,
          field: "createdAt",
          value: new Date(2022, 1, 10),
        });
      });
      expect(input.value).toEqual("2022-02-10");
    });

    // it("should handle correctly dates with partial years", () => {
    //   render(<TestCase />);
    //   const spiedSetEditCellValue = spyApi(
    //     apiRef.current,
    //     "setEditCellValue"
    //   ) as jest.Mock;

    //   const cell = getCell(0, 0);
    //   fireEvent.doubleClick(cell);

    //   const input = cell.querySelector("input")!;
    //   expect(input.value).toEqual("2022-02-18");

    //   fireEvent.change(input, { target: { value: "2021-01-05" } });
    //   const lastCall =
    //     spiedSetEditCellValue.mock.calls[
    //       spiedSetEditCellValue.mock.calls.length - 1
    //     ];
    //   expect(lastCall[0].value.getTime()).toEqual(generateDate(2021, 0, 5));

    //   fireEvent.change(input, { target: { value: "2021-01-01" } });
    //   expect(lastCall[0].value.getTime()).toEqual(generateDate(2021, 0, 1));

    //   fireEvent.change(input, { target: { value: "0001-01-01" } });
    //   expect(lastCall[0].value.getTime()).toEqual(generateDate(1, 0, 1));

    //   fireEvent.change(input, { target: { value: "0019-01-01" } });
    //   expect(lastCall[0].value.getTime()).toEqual(generateDate(19, 0, 1));

    //   fireEvent.change(input, { target: { value: "0199-01-01" } });
    //   expect(lastCall[0].value.getTime()).toEqual(generateDate(199, 0, 1));

    //   fireEvent.change(input, { target: { value: "1999-01-01" } });
    //   expect(lastCall[0].value.getTime()).toEqual(generateDate(1999, 0, 1));
    // });

    it("should call onValueChange if defined", async () => {
      const onValueChange = jest.fn();

      defaultData.columns[0].renderEditCell = (params) =>
        renderEditDateCell({ ...params, onValueChange });

      render(<TestCase />);

      const cell = getCell(0, 0);
      fireEvent.doubleClick(cell);

      const input = cell.querySelector("input")!;
      fireEvent.change(input, { target: { value: "2022-02-10" } });
      await act(() => Promise.resolve());

      expect(onValueChange).toHaveBeenCalledTimes(1);
      expect(
        (onValueChange.mock.calls.at(-1)?.[1] as Date).toISOString()
      ).toEqual(new Date(2022, 1, 10).toISOString());
    });
  });

  describe("column type: dateTime", () => {
    beforeEach(() => {
      defaultData.rows = [{ id: 0, createdAt: new Date(2022, 1, 18, 14, 30) }];
      defaultData.columns = [
        { field: "createdAt", type: "dateTime", editable: true },
      ];
    });

    it("should call setEditCellValue with the value converted to Date", () => {
      render(<TestCase />);
      const spiedSetEditCellValue = spyApi(apiRef.current, "setEditCellValue");

      const cell = getCell(0, 0);
      fireEvent.doubleClick(cell);

      const input = cell.querySelector("input")!;
      expect(input.value).toEqual("2022-02-18T14:30");

      fireEvent.change(input, { target: { value: "2022-02-10T15:30:00" } });

      const lastCall = spiedSetEditCellValue.mock.calls.at(-1);
      expect(lastCall?.[0].id).toEqual(0);
      expect(lastCall?.[0].field).toEqual("createdAt");
      expect(lastCall?.[0].debounceMs).toEqual(undefined);
      expect((lastCall?.[0].value as Date).toISOString()).toEqual(
        new Date(2022, 1, 10, 15, 30, 0).toISOString()
      );
    });

    it("should call setEditCellValue with null when entered an empty value", () => {
      render(<TestCase />);
      const spiedSetEditCellValue = spyApi(apiRef.current, "setEditCellValue");

      const cell = getCell(0, 0);
      fireEvent.doubleClick(cell);

      const input = cell.querySelector("input")!;
      fireEvent.change(input, { target: { value: "" } });
      const lastCall = spiedSetEditCellValue.mock.calls.at(-1);
      expect(lastCall?.[0]?.value).toEqual(null);
    });

    it("should pass the value prop to the input", async () => {
      render(<TestCase />);

      const cell = getCell(0, 0);
      fireEvent.doubleClick(cell);

      const input = cell.querySelector("input")!;
      expect(input.value).toEqual("2022-02-18T14:30");
      await act(async () => {
        apiRef.current.setEditCellValue({
          id: 0,
          field: "createdAt",
          value: new Date(2022, 1, 10, 15, 10, 0),
        });
      });
      expect(input.value).toEqual("2022-02-10T15:10");
    });

    // it("should handle correctly dates with partial years", () => {
    //   render(<TestCase />);
    //   const spiedSetEditCellValue = spyApi(
    //     apiRef.current,
    //     "setEditCellValue"
    //   ) as jest.Mock;

    //   const cell = getCell(0, 0);
    //   act(() => {
    //     fireEvent.doubleClick(cell);
    //   });
    //   const input = cell.querySelector("input")!;
    //   expect(input.value).toEqual("2022-02-18T14:30");

    //   fireEvent.change(input, { target: { value: "2021-01-05T14:30" } });
    //   const lastCall =
    //     spiedSetEditCellValue.mock.calls[
    //       spiedSetEditCellValue.mock.calls.length - 1
    //     ];
    //   expect(lastCall[0].value.getTime()).toEqual(
    //     generateDate(2021, 0, 5, 14, 30)
    //   );

    //   fireEvent.change(input, { target: { value: "2021-01-01T14:30" } });
    //   expect(lastCall[0].value.getTime()).toEqual(
    //     generateDate(2021, 0, 1, 14, 30)
    //   );

    //   fireEvent.change(input, { target: { value: "0001-01-01T14:30" } });
    //   expect(lastCall[0].value.getTime()).toEqual(
    //     generateDate(1, 0, 1, 14, 30)
    //   );

    //   fireEvent.change(input, { target: { value: "0019-01-01T14:30" } });
    //   expect(lastCall[0].value.getTime()).toEqual(
    //     generateDate(19, 0, 1, 14, 30)
    //   );

    //   fireEvent.change(input, { target: { value: "0199-01-01T14:30" } });
    //   expect(lastCall[0].value.getTime()).toEqual(
    //     generateDate(199, 0, 1, 14, 30)
    //   );

    //   fireEvent.change(input, { target: { value: "1999-01-01T14:30" } });
    //   expect(lastCall[0].value.getTime()).toEqual(
    //     generateDate(1999, 0, 1, 14, 30)
    //   );

    //   fireEvent.change(input, { target: { value: "1999-01-01T20:30" } });
    //   expect(lastCall[0].value.getTime()).toEqual(
    //     generateDate(1999, 0, 1, 20, 30)
    //   );

    //   fireEvent.change(input, { target: { value: "1999-01-01T20:02" } });
    //   expect(lastCall[0].value.getTime()).toEqual(
    //     generateDate(1999, 0, 1, 20, 2)
    //   );

    //   fireEvent.change(input, { target: { value: "1999-01-01T20:25" } });
    //   expect(lastCall[0].value.getTime()).toEqual(
    //     generateDate(1999, 0, 1, 20, 25)
    //   );
    // });
  });

  describe("column type: singleSelect", () => {
    beforeEach(() => {
      defaultData.rows = [{ id: 0, brand: "Nike" }];
      defaultData.columns = [
        {
          field: "brand",
          type: "singleSelect",
          valueOptions: ["Nike", "Adidas"],
          editable: true,
        },
      ];
    });

    it("should call setEditCellValue with the correct value when valueOptions is an array of strings", async () => {
      render(<TestCase />);
      const spiedSetEditCellValue = spyApi(apiRef.current, "setEditCellValue");

      const cell = getCell(0, 0);
      await userEvent.dblClick(cell);
      await userEvent.click(screen.queryAllByRole("option")[1]);

      const lastCall = spiedSetEditCellValue.mock.calls.at(-1);
      expect(lastCall?.[0]?.value).toEqual("Adidas");
    });

    it("should call setEditCellValue with the correct value when valueOptions is an array of objects", async () => {
      defaultData.rows = [{ id: 0, brand: 0 }];
      defaultData.columns = [
        {
          field: "brand",
          type: "singleSelect",
          valueOptions: [
            { value: 0, label: "Nike" },
            { value: 1, label: "Adidas" },
          ],
          editable: true,
        },
      ];
      render(<TestCase />);
      const spiedSetEditCellValue = spyApi(apiRef.current, "setEditCellValue");

      const cell = getCell(0, 0);
      await userEvent.dblClick(cell);
      await userEvent.click(screen.queryAllByRole("option")[1]);

      const lastCall = spiedSetEditCellValue.mock.calls.at(-1);
      expect(lastCall?.[0]?.value).toEqual(1);
    });

    it("should call setEditCellValue with the correct value when valueOptions is a function", async () => {
      defaultData.columns = [
        {
          field: "brand",
          type: "singleSelect",
          valueOptions: () => ["Nike", "Adidas"],
          editable: true,
        },
      ];
      render(<TestCase />);
      const spiedSetEditCellValue = spyApi(apiRef.current, "setEditCellValue");
      const cell = getCell(0, 0);
      await userEvent.dblClick(cell);
      await userEvent.click(screen.queryAllByRole("option")[1]);
      const lastCall = spiedSetEditCellValue.mock.calls.at(-1);
      expect(lastCall?.[0]?.value).toEqual("Adidas");
    });

    it("should pass the value prop to the select", async () => {
      render(<TestCase />);

      const cell = getCell(0, 0);
      fireEvent.doubleClick(cell);

      expect(cell.textContent!.replace(/[\W]+/, "")).toEqual("Nike"); // We use .replace to remove &ZeroWidthSpace;
      await act(async () => {
        apiRef.current.setEditCellValue({
          id: 0,
          field: "brand",
          value: "Adidas",
        });
      });
      expect(cell.textContent!.replace(/[\W]+/, "")).toEqual("Adidas");
    });

    it("should call onValueChange if defined", async () => {
      const onValueChange = jest.fn();

      defaultData.columns[0].renderEditCell = (params) =>
        renderEditSingleSelectCell({ ...params, onValueChange });

      render(<TestCase />);

      const cell = getCell(0, 0);
      fireEvent.doubleClick(cell);
      fireEvent.click(screen.queryAllByRole("option")[1]);
      await act(() => Promise.resolve());

      expect(onValueChange).toHaveBeenCalledTimes(1);
      expect(onValueChange.mock.calls.at(-1)?.[1]).toEqual("Adidas");
    });

    it("should call onCellEditStop", async () => {
      const onCellEditStop = jest.fn();

      render(
        <div>
          <TestCase onCellEditStop={onCellEditStop} />
          <div id="outside-grid" />
        </div>
      );

      const cell = getCell(0, 0);
      fireEvent.doubleClick(cell);
      userEvent.click(document.getElementById("outside-grid")!);
      await act(() => Promise.resolve());

      expect(onCellEditStop).toHaveBeenCalledTimes(1);
    });

    it("should not open the suggestions when Enter is pressed", async () => {
      let resolveCallback: () => void;
      const processRowUpdate = (newRow: any) =>
        new Promise((resolve) => {
          resolveCallback = () => resolve(newRow);
        });

      defaultData.columns[0].renderEditCell = (params) =>
        renderEditSingleSelectCell(params);

      render(<TestCase processRowUpdate={processRowUpdate} />);

      const cell = getCell(0, 0);
      fireEvent.doubleClick(cell);
      userEvent.click(screen.queryAllByRole("option")[1]);
      await waitFor(() => expect(screen.queryByRole("listbox")).toEqual(null));
      fireEvent.keyDown(screen.getByRole("combobox"), { key: "Enter" });
      expect(screen.queryByRole("listbox")).toEqual(null);

      resolveCallback!();
      await act(() => Promise.resolve());
    });
  });

  describe("column type: boolean", () => {
    beforeEach(() => {
      defaultData.rows = [{ id: 0, isAdmin: false }];
      defaultData.columns = [
        { field: "isAdmin", type: "boolean", editable: true },
      ];
    });

    it("should call setEditCellValue", () => {
      render(<TestCase />);
      const spiedSetEditCellValue = spyApi(apiRef.current, "setEditCellValue");

      const cell = getCell(0, 0);
      fireEvent.doubleClick(cell);

      const input = within(cell).getByRole<HTMLInputElement>("checkbox");
      expect(input.checked).toEqual(false);

      fireEvent.click(input);
      const lastCall = spiedSetEditCellValue.mock.calls.at(-1);
      expect(lastCall?.[0]?.value).toEqual(true);
    });

    it("should call onValueChange if defined", async () => {
      const onValueChange = jest.fn();

      defaultData.columns[0].renderEditCell = (params) =>
        renderEditBooleanCell({ ...params, onValueChange });

      render(<TestCase />);

      const cell = getCell(0, 0);
      await userEvent.dblClick(cell);

      const input = within(cell).getByRole<HTMLInputElement>("checkbox");
      await userEvent.click(input);

      expect(onValueChange).toHaveBeenCalledTimes(1);
      expect(onValueChange.mock.calls.at(-1)?.[1]).toEqual(true);
    });
  });
});
