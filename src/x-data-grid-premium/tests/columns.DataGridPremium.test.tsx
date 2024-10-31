import * as React from 'react';
import {
  render,
  fireEvent,
  screen,
  act,
  waitFor,
} from "@testing-library/react";
// import { expect } from 'chai';
import { gridClasses } from '@mui/x-data-grid';
import { DataGridPremium } from "../DataGridPremium/DataGridPremium";
import { getCell, getColumnHeaderCell } from './helperFn';

const isJSDOM = /jsdom/.test(window.navigator.userAgent);

describe('<DataGridPremium /> - Columns', () => {
  // const { render } = createRenderer();

  describe('resizing', () => {
    // https://github.com/mui/mui-x/issues/10078
    it('should properly resize aggregated column', function test() {
      if (isJSDOM) {
        // Need layouting
        return;
      }

      render(
        <div style={{ width: 300, height: 300 }}>
          <DataGridPremium
            rows={[
              { id: 0, brand: 'Nike' },
              { id: 1, brand: 'Adidas' },
              { id: 2, brand: 'Puma' },
              { id: 3, brand: 'Reebok' },
              { id: 4, brand: 'Under Armour' },
              { id: 5, brand: 'Asics' },
              { id: 6, brand: 'Salomon' },
            ]}
            columns={[{ field: 'brand' }]}
            initialState={{ aggregation: { model: { brand: 'size' } } }}
            showCellVerticalBorder
            rowBufferPx={52}
          />
        </div>,
      );

      const separator = document.querySelector(`.${gridClasses['columnSeparator--resizable']}`)!;
      fireEvent.mouseDown(separator, { clientX: 100 });
      fireEvent.mouseMove(separator, { clientX: 150, buttons: 1 });
      fireEvent.mouseUp(separator);

      expect(getColumnHeaderCell(0)).toHaveStyle({ width: '150px' });
      expect(getCell(0, 0).getBoundingClientRect().width).toEqual(150);

      const virtualScroller = document.querySelector(`.${gridClasses.virtualScroller}`)!;
      virtualScroller.scrollTop = 500; // scroll to the bottom
      act(() => virtualScroller.dispatchEvent(new Event('scroll')));

      expect(getCell(6, 0).getBoundingClientRect().width).toEqual(150);
    });
  });
});
