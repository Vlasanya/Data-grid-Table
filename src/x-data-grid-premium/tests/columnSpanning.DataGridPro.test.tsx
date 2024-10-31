import * as React from 'react';
// import { createRenderer, fireEvent, act } from '@mui/internal-test-utils';
import { render, fireEvent, act, waitFor } from "@testing-library/react";
// // import { expect } from 'chai';
import { GridColDef, gridClasses } from '@mui/x-data-grid';
import { getActiveCell, getCell, getColumnHeaderCell } from './helperFn';
import { GridApi } from "../typeOverloads/reexports";
import { useGridApiRef } from "../hooks/utils/useGridApiRef";
// import { fireUserEvent } from 'test/utils/fireUserEvent';
import { DataGridPremium } from "../DataGridPremium/DataGridPremium";
import userEvent from "@testing-library/user-event";

const isJSDOM = /jsdom/.test(window.navigator.userAgent);

describe('<DataGridPro /> - Column spanning', () => {
//   const { render } = createRenderer({ clock: 'fake' });

  const baselineProps = {
    rows: [
      {
        id: 0,
        brand: 'Nike',
        category: 'Shoes',
        price: '$120',
        rating: '4.5',
      },
      {
        id: 1,
        brand: 'Adidas',
        category: 'Shoes',
        price: '$100',
        rating: '4.5',
      },
      {
        id: 2,
        brand: 'Puma',
        category: 'Shoes',
        price: '$90',
        rating: '4.5',
      },
    ],
  };

  it('should not apply `colSpan` in pinned columns section if there is only one column there', function test() {
    if (isJSDOM) {
      // Need layouting
      return;
    }

    render(
      <div style={{ width: 500, height: 300 }}>
        <DataGridPremium
          {...baselineProps}
          columns={[
            { field: 'brand', colSpan: 2, width: 110 },
            { field: 'category' },
            { field: 'price' },
          ]}
          initialState={{ pinnedColumns: { left: ['brand'], right: [] } }}
        />
      </div>,
    );

    expect(getCell(0, 0).offsetWidth).toEqual(110);
    expect(() => getCell(0, 0)).not.toThrow();
    expect(() => getCell(0, 1)).not.toThrow();
    expect(() => getCell(0, 2)).not.toThrow();
  });

  it('should apply `colSpan` inside pinned columns section', () => {
    render(
      <div style={{ width: 500, height: 300 }}>
        <DataGridPremium
          {...baselineProps}
          columns={[{ field: 'brand', colSpan: 2 }, { field: 'category' }, { field: 'price' }]}
          initialState={{ pinnedColumns: { left: ['brand', 'category'], right: [] } }}
        />
      </div>,
    );

    expect(() => getCell(0, 0)).not.toThrow();
    expect(() => getCell(0, 1)).toThrow(/not found/);
    expect(() => getCell(0, 2)).not.toThrow();
  });

  describe('key navigation', () => {
    const columns: GridColDef[] = [
      { field: 'brand', colSpan: (value, row) => (row.brand === 'Nike' ? 2 : 1) },
      { field: 'category', colSpan: (value, row) => (row.brand === 'Adidas' ? 2 : 1) },
      { field: 'price', colSpan: (value, row) => (row.brand === 'Puma' ? 2 : 1) },
      { field: 'rating' },
    ];

    it('should work after column reordering', () => {
      let apiRef: React.MutableRefObject<GridApi>;

      function Test() {
        apiRef = useGridApiRef();

        return (
          <div style={{ width: 500, height: 300 }}>
            <DataGridPremium apiRef={apiRef} {...baselineProps} columns={columns} />
          </div>
        );
      }

      render(<Test />);

      act(() => apiRef!.current.setColumnIndex('price', 1));

      userEvent.click(getCell(1, 1));
      fireEvent.keyDown(getCell(1, 1), { key: 'ArrowRight' });
      expect(getActiveCell()).toEqual('1-2');
    });
  });

  it('should recalculate cells after column reordering', () => {
    let apiRef: React.MutableRefObject<GridApi>;

    function Test() {
      apiRef = useGridApiRef();

      return (
        <div style={{ width: 500, height: 300 }}>
          <DataGridPremium
            apiRef={apiRef}
            {...baselineProps}
            columns={[
              { field: 'brand', colSpan: (value, row) => (row.brand === 'Nike' ? 2 : 1) },
              { field: 'category', colSpan: (value, row) => (row.brand === 'Adidas' ? 2 : 1) },
              { field: 'price', colSpan: (value, row) => (row.brand === 'Puma' ? 2 : 1) },
              { field: 'rating' },
            ]}
            disableVirtualization={isJSDOM}
          />
        </div>
      );
    }

    render(<Test />);

    act(() => apiRef!.current.setColumnIndex('brand', 1));

    // Nike row
    expect(() => getCell(0, 0)).not.toThrow();
    expect(() => getCell(0, 1)).not.toThrow();
    expect(() => getCell(0, 2)).toThrow(/not found/);
    expect(() => getCell(0, 3)).not.toThrow();

    // Adidas row
    expect(() => getCell(1, 0)).not.toThrow();
    expect(() => getCell(1, 1)).toThrow(/not found/);
    expect(() => getCell(1, 2)).not.toThrow();
    expect(() => getCell(1, 3)).not.toThrow();

    // Puma row
    expect(() => getCell(2, 0)).not.toThrow();
    expect(() => getCell(2, 1)).not.toThrow();
    expect(() => getCell(2, 2)).not.toThrow();
    expect(() => getCell(2, 3)).toThrow(/not found/);
  });

  it('should work with column resizing', function test() {
    if (isJSDOM) {
      // Need layouting
     return;
    }

    const columns = [{ field: 'brand', colSpan: 2 }, { field: 'category' }, { field: 'price' }];

    render(
      <div style={{ width: 500, height: 300 }}>
        <DataGridPremium {...baselineProps} columns={columns} />
      </div>,
    );

    expect(getColumnHeaderCell(0).offsetWidth).toEqual(100);
    expect(getColumnHeaderCell(1).offsetWidth).toEqual(100);
    expect(getCell(0, 0).offsetWidth).toEqual(200);

    const separator = document.querySelector(`.${gridClasses['columnSeparator--resizable']}`)!;
    fireEvent.mouseDown(separator, { clientX: 100 });
    fireEvent.mouseMove(separator, { clientX: 200, buttons: 1 });
    fireEvent.mouseUp(separator);

    expect(getColumnHeaderCell(0).offsetWidth).toEqual(200);
    expect(getColumnHeaderCell(1).offsetWidth).toEqual(100);
    expect(getCell(0, 0).offsetWidth).toEqual(300);
  });

  it('should apply `colSpan` correctly on GridApiRef setRows', () => {
    const columns: GridColDef[] = [
      { field: 'brand', colSpan: (value, row) => (row.brand === 'Nike' ? 2 : 1) },
      { field: 'category', colSpan: (value, row) => (row.brand === 'Adidas' ? 2 : 1) },
      { field: 'price', colSpan: (value, row) => (row.brand === 'Puma' ? 2 : 1) },
      { field: 'rating' },
    ];

    let apiRef: React.MutableRefObject<GridApi>;

    function Test() {
      apiRef = useGridApiRef();

      return (
        <div style={{ width: 500, height: 300 }}>
          <DataGridPremium
            apiRef={apiRef}
            {...baselineProps}
            columns={columns}
            disableVirtualization={isJSDOM}
          />
        </div>
      );
    }

    render(<Test />);

    act(() =>
      apiRef!.current.setRows([
        {
          id: 0,
          brand: 'Adidas',
          category: 'Shoes',
          price: '$100',
          rating: '4.5',
        },
        {
          id: 1,
          brand: 'Nike',
          category: 'Shoes',
          price: '$120',
          rating: '4.5',
        },
        {
          id: 2,
          brand: 'Reebok',
          category: 'Shoes',
          price: '$90',
          rating: '4.5',
        },
      ]),
    );

    // Adidas row
    expect(() => getCell(0, 0)).not.toThrow();
    expect(() => getCell(0, 1)).not.toThrow();
    expect(() => getCell(0, 2)).toThrow(/not found/);
    expect(() => getCell(0, 3)).not.toThrow();

    // Nike row
    expect(() => getCell(1, 0)).not.toThrow();
    expect(() => getCell(1, 1)).toThrow(/not found/);
    expect(() => getCell(1, 2)).not.toThrow();
    expect(() => getCell(1, 3)).not.toThrow();

    // Reebok row
    expect(() => getCell(2, 0)).not.toThrow();
    expect(() => getCell(2, 1)).not.toThrow();
    expect(() => getCell(2, 2)).not.toThrow();
    expect(() => getCell(2, 3)).not.toThrow();
  });
});