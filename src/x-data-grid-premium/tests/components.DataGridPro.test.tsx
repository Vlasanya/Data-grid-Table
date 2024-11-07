import * as React from 'react';
import {
  render,
  screen,
  within,
  act,
  waitFor,
  fireEvent,
} from "@testing-library/react";
import {
  DataGridPro,
  gridClasses,
  useGridApiRef,
  DataGridProProps,
  GridApi,
} from '@mui/x-data-grid-pro';
import { useBasicDemoData } from './basic-data-service';
import { getCell, getRow } from './helperFn';
import userEvent from "@testing-library/user-event";

describe('<DataGridPro/> - Components', () => {
  let apiRef: React.MutableRefObject<GridApi>;

  function TestCase(props: Partial<DataGridProProps>) {
    apiRef = useGridApiRef();
    const data = useBasicDemoData(100, 1);
    return (
      <div style={{ width: 500, height: 300 }}>
        <DataGridPro apiRef={apiRef} {...data} disableVirtualization {...props} />
      </div>
    );
  }

  describe('footer', () => {
    it('should hide the row count if `hideFooterRowCount` prop is set', () => {
      render(<TestCase hideFooterRowCount />);
      expect(document.querySelector(`.${gridClasses.rowCount}`)).toEqual(null);
    });

    it('should throw a console error if hideFooterRowCount is used with pagination', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      render(<TestCase hideFooterRowCount pagination />);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('MUI X: The `hideFooterRowCount` prop has no effect when the pagination is enabled.'),
      );
      consoleSpy.mockRestore();
    });
  });

  describe('components', () => {
    (
      [
        ['onClick', 'cellClick'],
        ['onDoubleClick', 'cellDoubleClick'],
        ['onMouseDown', 'cellMouseDown'],
        ['onMouseUp', 'cellMouseUp'],
        ['onDragEnter', 'cellDragEnter'],
        ['onDragOver', 'cellDragOver'],
      ] as const
    ).forEach(([prop, event]) => {
      it(`should still publish the '${event}' event when overriding the '${prop}' prop in slots.cell`, () => {
        const propHandler = jest.fn();
        const eventHandler = jest.fn();
        render(<TestCase slotProps={{ cell: { [prop]: propHandler } }} />);
        apiRef!.current.subscribeEvent(event, eventHandler);

        expect(propHandler.mock.calls).toHaveLength(0);
        expect(eventHandler.mock.calls).toHaveLength(0);

        const eventToFire = prop.replace(/^on([A-Z])/, (match) =>
          match.slice(2).toLowerCase(),
        ) as keyof typeof fireEvent; 
        const cell = getCell(0, 0);

        if (event !== 'cellMouseUp') {
          fireEvent.mouseUp(cell);
        }

        fireEvent[eventToFire](cell);

        expect(propHandler.mock.calls).toHaveLength(1);
        expect(propHandler.mock.calls.at(-1)?.[0]).not.toEqual(undefined);
        expect(eventHandler.mock.calls).toHaveLength(1);
      });
    });
    it(`should still publish the 'cellKeyDown' event when overriding the 'onKeyDown' prop in slots.cell`, () => {
      const propHandler = jest.fn();
      const eventHandler = jest.fn();
      render(<TestCase slotProps={{ cell: { onKeyDown: propHandler } }} />);
      apiRef!.current.subscribeEvent('cellKeyDown', eventHandler);

      expect(propHandler.mock.calls).toHaveLength(0);
      expect(eventHandler.mock.calls).toHaveLength(0);

      userEvent.click(getCell(0, 0));
      fireEvent.keyDown(getCell(0, 0));

      expect(propHandler.mock.calls).toHaveLength(1);
      expect(propHandler.mock.calls.at(-1)?.[0]).not.toEqual(undefined);
      expect(eventHandler.mock.calls).toHaveLength(1);
    });

    (
      [
        ['onClick', 'rowClick'],
        ['onDoubleClick', 'rowDoubleClick'],
      ] as const
    ).forEach(([prop, event]) => {
      it(`should still publish the '${event}' event when overriding the '${prop}' prop in slots.row`, () => {
        const propHandler = jest.fn();
        const eventHandler = jest.fn();
        render(<TestCase slotProps={{ row: { [prop]: propHandler } }} />);
        apiRef!.current.subscribeEvent(event, eventHandler);

        expect(propHandler.mock.calls).toHaveLength(0);
        expect(eventHandler.mock.calls).toHaveLength(0);

        const eventToFire = prop.replace(/^on([A-Z])/, (match) =>
          match.slice(2).toLowerCase(),
        ) as keyof typeof fireEvent;
        fireEvent[eventToFire](getRow(0));

        expect(propHandler.mock.calls).toHaveLength(1);
        expect(propHandler.mock.calls.at(-1)?.[0]).not.toEqual(undefined);
        expect(eventHandler.mock.calls).toHaveLength(1);
      });
    });
  });
});
