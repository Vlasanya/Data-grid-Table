import * as React from 'react';
// import { DataGridPro, DataGridProProps } from '@mui/x-data-grid-pro';
// import { createRenderer, fireEvent, act } from '@mui/internal-test-utils';
// import { expect } from 'chai';
// import { SinonSpy, spy } from 'sinon';
import { render, act, fireEvent } from "@testing-library/react";
import { getCell } from '../helperFn';
// import { fireUserEvent } from 'test/utils/fireUserEvent';
import userEvent from "@testing-library/user-event";
import { GridApi } from "../../typeOverloads/reexports";
import { useGridApiRef } from "../../hooks/utils/useGridApiRef";
import { DataGridPremium } from "../../DataGridPremium/DataGridPremium";
import { DataGridPremiumProps } from "../../models/dataGridPremiumProps";

const isJSDOM = /jsdom/.test(window.navigator.userAgent);

describe('<DataGridPro /> - Clipboard', () => {
  // const { render } = createRenderer();

  const baselineProps = {
    autoHeight: isJSDOM,
  };

  const columns = [{ field: 'id' }, { field: 'brand', headerName: 'Brand' }];

  let apiRef: React.MutableRefObject<GridApi>;

  function Test(props: Partial<DataGridPremiumProps>) {
    apiRef = useGridApiRef();

    return (
      <div style={{ width: 300, height: 300 }}>
        <DataGridPremium
          {...baselineProps}
          apiRef={apiRef}
          columns={columns}
          rows={[
            { id: 0, brand: 'Nike' },
            { id: 1, brand: 'Adidas' },
            { id: 2, brand: 'Puma' },
          ]}
          {...props}
        />
      </div>
    );
  }

  describe('copy to clipboard', () => {
    let writeText: jest.SpyInstance<Promise<void>, [string]> | undefined;

    afterEach(() => {
      if (writeText) {
        writeText.mockRestore();
      }
    });

    ['ctrlKey', 'metaKey'].forEach((key) => {
      // it(`should copy the selected rows to the clipboard when ${key} + C is pressed`, () => {
      //   render(<Test disableRowSelectionOnClick />);

      //   // Use jest.spyOn to mock navigator.clipboard.writeText
      //   writeText = jest.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();

      //   act(() => apiRef.current.selectRows([0, 1]));
      //   const cell = getCell(0, 0);
      //   userEvent.click(cell);
      //   fireEvent.keyDown(cell, { key: 'c', keyCode: 67, [key]: true });

      //   expect(writeText).toHaveBeenCalledTimes(1);
      //   expect(writeText).toHaveBeenCalledWith(['0\tNike', '1\tAdidas'].join('\r\n'));
      // });
    });

    // it('should not escape double quotes when copying a single cell to clipboard', () => {
    //   render(
    //     <Test
    //       columns={[{ field: 'value' }]}
    //       rows={[{ id: 0, value: '1 " 1' }]}
    //       disableRowSelectionOnClick
    //     />,
    //   );

    //   writeText = jest.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();

    //   const cell = getCell(0, 0);
    //   cell.focus();
    //   userEvent.click(cell);

    //   fireEvent.keyDown(cell, { key: 'c', keyCode: 67, ctrlKey: true });
    //   expect(writeText).toHaveBeenCalledWith('1 " 1');
    // });

    // it('should not escape double quotes when copying rows to clipboard', () => {
    //   render(
    //     <Test
    //       columns={[{ field: 'value' }]}
    //       rows={[
    //         { id: 0, value: '1 " 1' },
    //         { id: 1, value: '2' },
    //       ]}
    //       disableRowSelectionOnClick
    //     />,
    //   );

    //   writeText = jest.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();

    //   act(() => apiRef.current.selectRows([0, 1]));
    //   const cell = getCell(0, 0);
    //   userEvent.click(cell);
    //   fireEvent.keyDown(cell, { key: 'c', keyCode: 67, ctrlKey: true });

    //   expect(writeText).toHaveBeenCalledWith(['1 " 1', '2'].join('\r\n'));
    // });
  });
});
