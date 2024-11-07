import * as React from 'react';
import { render, fireEvent, screen } from "@testing-library/react";
import { getColumnValues } from './helperFn';
import { GridApi } from "../typeOverloads/reexports";
import { useGridApiRef } from "../hooks/utils/useGridApiRef";
import { DataGridPremium } from "../DataGridPremium/DataGridPremium";
import { DataGridPremiumProps } from "../models/dataGridPremiumProps";

const isJSDOM = /jsdom/.test(window.navigator.userAgent);

describe('<DataGridPremium /> - State', () => {
  const baselineProps = {
    autoHeight: isJSDOM,
    rows: [
      {
        id: 0,
        brand: 'Nike',
      },
      {
        id: 1,
        brand: 'Adidas',
      },
      {
        id: 2,
        brand: 'Puma',
      },
    ],
    columns: [{ field: 'brand', width: 100 }],
  };

  it('should trigger on state change and pass the correct params', () => {
    let onStateParams;
    let apiRef: React.MutableRefObject<GridApi>;

    function Test() {
      apiRef = useGridApiRef();
      const onStateChange: DataGridPremiumProps['onStateChange'] = (params) => {
        onStateParams = params;
      };

      return (
        <div style={{ width: 300, height: 300 }}>
          <DataGridPremium {...baselineProps} onStateChange={onStateChange} apiRef={apiRef} />
        </div>
      );
    }

    render(<Test />);
    const header = screen.getByRole('columnheader', { name: 'brand' });
    fireEvent.click(header);
    expect(onStateParams).toEqual(apiRef!.current.state);
    expect(onStateParams).not.toEqual(undefined);
  });

  it('should allow to control the state using apiRef', () => {
    function GridStateTest() {
      const apiRef = useGridApiRef();

      React.useEffect(() => {
        apiRef.current.setState((prev) => ({
          ...prev,
          sorting: { ...prev.sorting, sortModel: [{ field: 'brand', sort: 'asc' }] },
        }));
        apiRef.current.applySorting();
      }, [apiRef]);
      return (
        <div style={{ width: 300, height: 300 }}>
          <DataGridPremium {...baselineProps} apiRef={apiRef} />
        </div>
      );
    }

    render(<GridStateTest />);
    expect(getColumnValues(0)).toEqual(['Adidas', 'Nike', 'Puma']);
  });
});
