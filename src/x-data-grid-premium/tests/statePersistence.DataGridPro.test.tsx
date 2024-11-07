import * as React from 'react';
import {
  getDefaultGridFilterModel,
  GridColDef,
  GridPreferencePanelsValue,
  GridRowsProp
} from '@mui/x-data-grid';
import { GridInitialStatePremium } from "../models/gridStatePremium";
import { GridApi } from "../typeOverloads/reexports";
import { useGridApiRef } from "../hooks/utils/useGridApiRef";
import { DataGridPremium } from "../DataGridPremium/DataGridPremium";
import { DataGridPremiumProps } from "../models/dataGridPremiumProps";
import { render, act, screen } from "@testing-library/react";
import {
  getColumnHeaderCell,
  getColumnHeadersTextContent,
  getColumnValues,
} from './helperFn';

const isJSDOM = /jsdom/.test(window.navigator.userAgent);

const rows: GridRowsProp = [
  { id: 0, category: 'Cat A' },
  { id: 1, category: 'Cat A' },
  { id: 2, category: 'Cat A' },
  { id: 3, category: 'Cat B' },
  { id: 4, category: 'Cat B' },
  { id: 5, category: 'Cat B' },
];

const columns: GridColDef[] = [
  {
    field: 'id',
    type: 'number',
  },
  {
    field: 'idBis',
    type: 'number',
    valueGetter: (value, row) => row.id,
  },
  {
    field: 'category',
  },
];

const FULL_INITIAL_STATE: GridInitialStatePremium = {
  columns: {
    columnVisibilityModel: { idBis: false },
    orderedFields: ['id', 'category', 'idBis'],
    dimensions: {
      category: {
        width: 75,
        maxWidth: -1,
        minWidth: 50,
        flex: undefined,
      },
    },
  },
  filter: {
    filterModel: {
      items: [{ field: 'id', operator: '>=', value: '0' }],
    },
  },
  pagination: {
    meta: {},
    paginationModel: { page: 1, pageSize: 2 },
    rowCount: 6,
  },
  pinnedColumns: {
    left: ['id'],
  },
  preferencePanel: {
    open: true,
    openedPanelValue: GridPreferencePanelsValue.filters,
    panelId: undefined,
    labelId: undefined,
  },
  sorting: {
    sortModel: [{ field: 'id', sort: 'desc' }],
  },
  density: 'compact',
  rowGrouping: {
    model: [],
  },
};


describe('<DataGridPremium /> - State persistence', () => {
  let apiRef: React.MutableRefObject<GridApi>;

  function TestCase(props: Omit<DataGridPremiumProps, 'rows' | 'columns' | 'apiRef'>) {
    apiRef = useGridApiRef();

    return (
      <div style={{ width: 300, height: 300 }}>
        <DataGridPremium
          rows={rows}
          columns={columns}
          pagination
          autoHeight={isJSDOM}
          apiRef={apiRef}
          disableVirtualization
          pageSizeOptions={[100, 2]}
          {...props}
          initialState={{
            ...props.initialState,
            columns: {
              ...props.initialState?.columns,
              columnVisibilityModel: {
                ...props.initialState?.columns?.columnVisibilityModel,
              }, // To enable the `columnVisibilityModel` in export / restore
            },
          }}
        />
      </div>
    );
  }

  describe('apiRef: exportState', () => {
    it('should export the default values of the models', () => {
      render(<TestCase />);
      expect(apiRef.current.exportState()).toEqual({
        columns: {
          columnVisibilityModel: {},
          orderedFields: ['id', 'idBis', 'category'],
        },
        filter: {
          filterModel: getDefaultGridFilterModel(),
        },
        pagination: {
          meta: {},
          paginationModel: { page: 0, pageSize: 100 },
          rowCount: 6,
        },
        pinnedColumns: {},
        preferencePanel: {
          open: false,
        },
        rowGrouping: {
          model: [],
        },
        sorting: {
          sortModel: [],
        },
        density: 'standard',
      });
    });    

    it('should not export the default values of the models when using exportOnlyDirtyModels', () => {
      render(<TestCase />);
      expect(apiRef.current.exportState({ exportOnlyDirtyModels: true })).toEqual({
        columns: {
          orderedFields: ['id', 'idBis', 'category'],
        },
      });
    });

    it('should export the initial values of the models', () => {
      render(<TestCase initialState={FULL_INITIAL_STATE} />);
      expect(apiRef.current.exportState()).toEqual(FULL_INITIAL_STATE);
    });

    it('should export the controlled values of the models', () => {
      render(
        <TestCase
          filterModel={FULL_INITIAL_STATE.filter?.filterModel}
          sortModel={FULL_INITIAL_STATE.sorting?.sortModel}
          columnVisibilityModel={FULL_INITIAL_STATE.columns?.columnVisibilityModel}
          paginationModel={{
            page: FULL_INITIAL_STATE.pagination?.paginationModel?.page!,
            pageSize: FULL_INITIAL_STATE.pagination?.paginationModel?.pageSize!,
          }}
          paginationMode="server"
          rowCount={FULL_INITIAL_STATE.pagination?.rowCount}
          pinnedColumns={FULL_INITIAL_STATE.pinnedColumns}
          density={FULL_INITIAL_STATE.density}
          // Some portable states don't have a controllable model
          initialState={{
            columns: {
              orderedFields: FULL_INITIAL_STATE.columns?.orderedFields,
              dimensions: FULL_INITIAL_STATE.columns?.dimensions,
            },
            preferencePanel: FULL_INITIAL_STATE.preferencePanel,
          }}
        />,
      );
      expect(apiRef.current.exportState()).toEqual(FULL_INITIAL_STATE);
    });

    it('should export the controlled values of the models when using exportOnlyDirtyModels', () => {
      render(
        <TestCase
          filterModel={FULL_INITIAL_STATE.filter?.filterModel}
          sortModel={FULL_INITIAL_STATE.sorting?.sortModel}
          columnVisibilityModel={FULL_INITIAL_STATE.columns?.columnVisibilityModel}
          paginationModel={{
            page: FULL_INITIAL_STATE.pagination?.paginationModel?.page!,
            pageSize: FULL_INITIAL_STATE.pagination?.paginationModel?.pageSize!,
          }}
          paginationMode="server"
          rowCount={FULL_INITIAL_STATE.pagination?.rowCount}
          paginationMeta={FULL_INITIAL_STATE.pagination?.meta}
          pinnedColumns={FULL_INITIAL_STATE.pinnedColumns}
          density={FULL_INITIAL_STATE.density}
          // Some portable states don't have a controllable model
          initialState={{
            columns: {
              orderedFields: FULL_INITIAL_STATE.columns?.orderedFields,
              dimensions: FULL_INITIAL_STATE.columns?.dimensions,
            },
            preferencePanel: FULL_INITIAL_STATE.preferencePanel,
          }}
        />,
      );
      const expectedState = {
        ...FULL_INITIAL_STATE,
        rowGrouping: undefined,
      };
      expect(apiRef.current.exportState({ exportOnlyDirtyModels: true })).toEqual(expectedState);
    });

    it('should export the initial values of the models when using exportOnlyUserModels', () => {
      render(<TestCase initialState={FULL_INITIAL_STATE} />);
      expect(apiRef.current.exportState({ exportOnlyDirtyModels: true })).toEqual(
        FULL_INITIAL_STATE,
      );
    });


    it('should not export the default values of the models when using exportOnlyDirtyModels', () => {
      render(<TestCase />);
      expect(apiRef.current.exportState({ exportOnlyDirtyModels: true })).toEqual({
        columns: {
          orderedFields: ['id', 'idBis', 'category'],
        },
      });
    });

    it('should export the current version of the exportable state', () => {
      render(<TestCase />);
      act(() => {
        apiRef.current.setPaginationModel({ page: 1, pageSize: 2 });
        apiRef.current.setPinnedColumns({ left: ['id'] });
        apiRef.current.showPreferences(GridPreferencePanelsValue.filters);
        apiRef.current.setSortModel([{ field: 'id', sort: 'desc' }]);
        apiRef.current.setFilterModel({
          items: [{ field: 'id', operator: '>=', value: '0' }],
        });
        apiRef.current.setColumnIndex('category', 1);
        apiRef.current.setColumnWidth('category', 75);
        apiRef.current.setColumnVisibilityModel({ idBis: false });
        apiRef.current.setDensity('compact');
      });
      expect(apiRef.current.exportState()).toEqual(FULL_INITIAL_STATE);
    });
  });

  describe('apiRef: restoreState', () => {
    it('should restore the whole exportable state', () => {
      render(<TestCase />);

      act(() => apiRef.current.restoreState(FULL_INITIAL_STATE));

      // Pinning, pagination, sorting and filtering
      expect(getColumnValues(0)).toEqual(['3', '2']);

      // Preference panel
      expect(screen.getByRole('button', { name: /Add Filter/i })).not.toEqual(null);

      // Columns visibility
      expect(getColumnHeadersTextContent()).toEqual(['id', 'category']);

      // Columns dimensions
      expect(getColumnHeaderCell(1)).toHaveStyle({ width: '75px' });
    });

    it('should restore partial exportable state', () => {
      render(<TestCase />);

      act(() =>
        apiRef.current.restoreState({
          pagination: {
            paginationModel: { page: 1, pageSize: 2 },
          },
        }),
      );

      expect(getColumnValues(0)).toEqual(['2', '3']);
    });

    it('should restore controlled sub-state', () => {
      function ControlledTest() {
        const [paginationModel, setPaginationModel] = React.useState({ page: 0, pageSize: 5 });

        return (
          <TestCase
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[2, 5]}
          />
        );
      }

      render(<ControlledTest />);
      act(() =>
        apiRef.current.restoreState({
          pagination: {
            paginationModel: { page: 1, pageSize: 2 },
          },
        }),
      );
      jest.runAllTimers();
      expect(getColumnValues(0)).toEqual(['2', '3']);
    });
  });
});
