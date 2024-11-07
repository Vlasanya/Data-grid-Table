import * as React from 'react';
import { render, act } from "@testing-library/react";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { GridApi } from "../typeOverloads/reexports";
import { useGridApiRef } from "../hooks/utils/useGridApiRef";
import { DataGridPremium } from "../DataGridPremium/DataGridPremium";
import { DataGridPremiumProps } from "../models/dataGridPremiumProps";
import { ptBR } from '@mui/x-data-grid-pro/locales';
import { grid } from './helperFn';

describe('<DataGridPremium /> - Layout', () => {
  const baselineProps = {
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

  beforeAll(function beforeHook() {
    if (/jsdom/.test(window.navigator.userAgent)) {
      // Need layouting
      return;
    }
  });

  // Adaptation of describeConformance()
  describe('MUI component API', () => {
    it(`attaches the ref`, () => {
      const ref = React.createRef<HTMLDivElement>();
      const { container } = render(
        <div style={{ width: 300, height: 300 }}>
          <DataGridPremium {...baselineProps} ref={ref} />
        </div>,
      );
      expect(ref.current).toBeInstanceOf(window.HTMLDivElement);
      expect(ref.current).toEqual(container.firstChild?.firstChild);
    });

    function randomStringValue() {
      return `r${Math.random().toString(36).slice(2)}`;
    }

    it('applies the className to the root component', () => {
      const className = randomStringValue();

      const { container } = render(
        <div style={{ width: 300, height: 300 }}>
          <DataGridPremium {...baselineProps} className={className} />
        </div>,
      );

      expect(container.firstChild?.firstChild).toHaveClass(className);
      expect(container.firstChild?.firstChild).toHaveClass('MuiDataGrid-root');
    });

    it('applies the style to the root component', () => {
      render(
        <div style={{ width: 300, height: 300 }}>
          <DataGridPremium
            {...baselineProps}
            style={{
              mixBlendMode: 'darken',
            }}
          />
        </div>,
      );

      expect(document.querySelector('.MuiDataGrid-root')).toHaveStyle({
        mixBlendMode: 'darken',
      });
    });
  });

  describe('columns width', () => {
    // it('should resize flex: 1 column when changing column visibility to avoid exceeding grid width (apiRef setColumnVisibility method call)', () => {
    //   let apiRef: React.MutableRefObject<GridApi>;

    //   function TestCase(props: Omit<DataGridPremiumProps, 'apiRef'>) {
    //     apiRef = useGridApiRef();

    //     return (
    //       <div style={{ width: 300, height: 500 }}>
    //         <DataGridPremium {...props} apiRef={apiRef} />
    //       </div>
    //     );
    //   }

    //   render(
    //     <TestCase
    //       rows={[
    //         {
    //           id: 1,
    //           first: 'Mike',
    //           age: 11,
    //         },
    //         {
    //           id: 2,
    //           first: 'Jack',
    //           age: 11,
    //         },
    //         {
    //           id: 3,
    //           first: 'Mike',
    //           age: 20,
    //         },
    //       ]}
    //       columns={[
    //         { field: 'id', flex: 1 },
    //         { field: 'first', width: 100 },
    //         { field: 'age', width: 50 },
    //       ]}
    //       initialState={{
    //         columns: {
    //           columnVisibilityModel: {
    //             age: false,
    //           },
    //         },
    //       }}
    //     />,
    //   );

    //   let firstColumn = document.querySelector('[role="columnheader"][aria-colindex="1"]');
    //   expect(firstColumn).toHaveStyle({
    //     width: '198px', // because of the 2px border
    //   });

    //   act(() => apiRef!.current.setColumnVisibility('age', true));
    //   firstColumn = document.querySelector('[role="columnheader"][aria-colindex="1"]');
    //   expect(firstColumn).toHaveStyle({
    //     width: '148px', // because of the 2px border
    //   });
    // });
  });

  // it('should work with `headerFilterHeight` prop', () => {
  //   render(
  //     <div style={{ width: 300, height: 300 }}>
  //       <DataGridPremium
  //         {...baselineProps}
  //         autoHeight
  //         headerFilters
  //         columnHeaderHeight={20}
  //         headerFilterHeight={32}
  //         rowHeight={20}
  //       />
  //     </div>,
  //   );
  //   expect(grid('main')!.clientHeight).toEqual(baselineProps.rows.length * 20 + 20 + 32);
  // });

  it('should support translations in the theme', () => {
    render(
      <ThemeProvider theme={createTheme({}, ptBR)}>
        <div style={{ width: 300, height: 300 }}>
          <DataGridPremium {...baselineProps} />
        </div>
      </ThemeProvider>,
    );
    expect(document.querySelector('[title="Ordenar"]')).not.toEqual(null);
  });

  it('should support the sx prop', function test() {
    if (/jsdom/.test(window.navigator.userAgent)) {
      return; // Doesn't work with mocked window.getComputedStyle
    }

    const theme = createTheme({
      palette: {
        primary: {
          main: 'rgb(0, 0, 255)',
        },
      },
    });

    render(
      <ThemeProvider theme={theme}>
        <div style={{ width: 300, height: 300 }}>
          <DataGridPremium columns={[]} rows={[]} sx={{ color: 'primary.main' }} />
        </div>
      </ThemeProvider>,
    );

    expect(grid('root')).toHaveStyle({
      color: 'rgb(0, 0, 255)',
    });
  });

  it('should have ownerState in the theme style overrides', () => {
    expect(() =>
      render(
        <ThemeProvider
          theme={createTheme({
            components: {
              MuiDataGrid: {
                styleOverrides: {
                  root: ({ ownerState }) => ({
                    // test that ownerState is not undefined
                    ...(ownerState.columns && {}),
                  }),
                },
              },
            },
          })}
        >
          <div style={{ width: 300, height: 300 }}>
            <DataGridPremium {...baselineProps} />
          </div>
        </ThemeProvider>,
      ),
    ).not.toThrow();
  });
});
