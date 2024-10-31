import * as React from 'react';
// import { spy } from 'sinon';
// import { expect } from 'chai';
// import { createRenderer, fireEvent, act, screen } from '@mui/internal-test-utils';
import {
  render,
  screen,
  act,
  fireEvent,
} from "@testing-library/react";
import {
  gridClasses,
  GridColDef,
  gridColumnVisibilityModelSelector,
  GridPreferencePanelsValue,
  GridRowsProp,
} from '@mui/x-data-grid';
import { GridApi } from "../../typeOverloads/reexports";
import { useGridApiRef } from "../../hooks/utils/useGridApiRef";
import { getColumnHeadersTextContent } from '../helperFn';
import { DataGridPremium } from "../../DataGridPremium/DataGridPremium";
import { DataGridPremiumProps } from "../../models/dataGridPremiumProps";

const isJSDOM = /jsdom/.test(window.navigator.userAgent);

const rows: GridRowsProp = [{ id: 1 }];

const columns: GridColDef[] = [{ field: 'id' }, { field: 'idBis' }];

describe('<DataGridPro /> - Columns visibility', () => {
  // const { render } = createRenderer({ clock: 'fake' });

  let apiRef: React.MutableRefObject<GridApi>;

  function TestDataGridPremium(
    props: Omit<DataGridPremiumProps, 'columns' | 'rows' | 'apiRef'> &
      Partial<Pick<DataGridPremiumProps, 'rows' | 'columns'>>,
  ) {
    apiRef = useGridApiRef();

    return (
      <div style={{ width: 300, height: 300 }}>
        <DataGridPremium
          columns={columns}
          rows={rows}
          {...props}
          apiRef={apiRef}
          autoHeight={isJSDOM}
        />
      </div>
    );
  }

  // describe('apiRef: updateColumns', () => {
  //   it('should not call `onColumnVisibilityModelChange` when no column visibility has changed', () => {
  //     const onColumnVisibilityModelChange = jest.fn();
  //     render(
  //       <TestDataGridPremium
  //         columnVisibilityModel={{ idBis: false }}
  //         onColumnVisibilityModelChange={onColumnVisibilityModelChange}
  //       />,
  //     );

  //     act(() => apiRef.current.updateColumns([{ field: 'id', width: 300 }]));
  //     expect(onColumnVisibilityModelChange.mock.calls[0]).toHaveBeenCalledTimes(0);
  //   });
  // });

  describe('apiRef: setColumnVisibility', () => {
    it('should update `columnVisibilityModel` in state', () => {
      render(
        <TestDataGridPremium initialState={{ columns: { columnVisibilityModel: { idBis: false } } }} />,
      );
      act(() => apiRef.current.setColumnVisibility('id', false));
      expect(gridColumnVisibilityModelSelector(apiRef)).toEqual({
        id: false,
        idBis: false,
      });

      act(() => apiRef.current.setColumnVisibility('id', true));
      expect(gridColumnVisibilityModelSelector(apiRef)).toEqual({
        id: true,
        idBis: false,
      });
    });

    // it('should call `onColumnVisibilityModelChange` with the new model', () => {
    //   const onColumnVisibilityModelChange = jest.fn();

    //   render(
    //     <TestDataGridPremium
    //       initialState={{ columns: { columnVisibilityModel: { idBis: false } } }}
    //       onColumnVisibilityModelChange={onColumnVisibilityModelChange}
    //     />,
    //   );

    //   act(() => apiRef.current.setColumnVisibility('id', false));
    //   expect(onColumnVisibilityModelChange.mock.calls[0]).toHaveBeenCalledTimes(1);
    //   expect(onColumnVisibilityModelChange.mock.calls.at(-1)?.[0]).toEqual({
    //     id: false,
    //     idBis: false,
    //   });

    //   act(() => apiRef.current.setColumnVisibility('id', true));
    //   expect(onColumnVisibilityModelChange.mock.calls[0]).toHaveBeenCalledTimes(2);
    //   expect(onColumnVisibilityModelChange.mock.calls.at(-1)?.[0]).toEqual({
    //     idBis: false,
    //     id: true,
    //   });
    // });
  });

  // describe('apiRef: setColumnVisibilityModel', () => {
  //   it('should update `setColumnVisibilityModel` in state and call `onColumnVisibilityModelChange`', () => {
  //     const onColumnVisibilityModelChange = jest.fn();

  //     render(
  //       <TestDataGridPremium
  //         initialState={{ columns: { columnVisibilityModel: { idBis: false } } }}
  //         onColumnVisibilityModelChange={onColumnVisibilityModelChange}
  //       />,
  //     );
  //     act(() => apiRef.current.setColumnVisibilityModel({}));
  //     expect(onColumnVisibilityModelChange.mock.calls[0]).toHaveBeenCalledTimes(1);
  //     expect(onColumnVisibilityModelChange.mock.calls.at(-1)?.[0]).toEqual({});
  //   });
  // });

  it('should not hide column when resizing a column after hiding it and showing it again', () => {
    render(
      <TestDataGridPremium
        initialState={{
          columns: { columnVisibilityModel: {} },
          preferencePanel: { open: true, openedPanelValue: GridPreferencePanelsValue.columns },
        }}
      />,
    );

    const showHideAllCheckbox = screen.getByRole('checkbox', { name: 'Show/Hide All' });
    fireEvent.click(showHideAllCheckbox);
    expect(getColumnHeadersTextContent()).toEqual([]);
    fireEvent.click(document.querySelector('[role="tooltip"] [name="id"]')!);
    expect(getColumnHeadersTextContent()).toEqual(['id']);

    const separator = document.querySelector(`.${gridClasses['columnSeparator--resizable']}`)!;
    fireEvent.mouseDown(separator, { clientX: 100 });
    fireEvent.mouseMove(separator, { clientX: 110, buttons: 1 });
    fireEvent.mouseUp(separator);

    expect(getColumnHeadersTextContent()).toEqual(['id']);
  });
});
