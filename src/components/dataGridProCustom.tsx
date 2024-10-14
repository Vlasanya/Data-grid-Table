import React, { useReducer, useEffect } from "react";
import {
  DataGridPremium,
  GridColDef,
  GridPaginationModel,
  GridSortModel,
  GridRowParams,
} from "@mui/x-data-grid-premium";
import {
  IconButton,
  Box,
  Button,
  Pagination,
  Select,
  MenuItem as SelectMenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import FirstPageRoundedIcon from "@mui/icons-material/FirstPageRounded";
import LastPageRoundedIcon from "@mui/icons-material/LastPageRounded";
import DetailPanelContent from "./getDetailPanelContent";
import CustomToolbar from "./customToolbar";

interface State {
  rows: RowData[];
  paginationModel: GridPaginationModel;
  rowCount: number;
  sortModel: GridSortModel;
}

type Action =
  | { type: "SET_ROWS"; payload: { rows: RowData[]; rowCount: number } }
  | { type: "SET_PAGINATION"; payload: GridPaginationModel }
  | { type: "SET_SORT"; payload: GridSortModel };

const initialState: State = {
  rows: [],
  paginationModel: { page: 0, pageSize: 20 },
  rowCount: 0,
  sortModel: [],
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_ROWS":
      return {
        ...state,
        rows: action.payload.rows,
        rowCount: action.payload.rowCount,
      };
    case "SET_PAGINATION":
      return { ...state, paginationModel: action.payload };
    case "SET_SORT":
      return { ...state, sortModel: action.payload };
    default:
      return state;
  }
}

export interface RowData {
  id: number;
  name: string;
  status: string;
  species: string;
  gender: string;
  episode: string[];
}

interface ApiCharacter {
  id: number;
  name: string;
  status: string;
  species: string;
  gender: string;
  episode: string[];
}

const pageSizeOptions = [20, 40, 60];

const DataGridProCustom: React.FC = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const navigate = useNavigate();

  const fetchData = (
    page: number,
    pageSize: number,
    sortModel: GridSortModel,
  ) => {
    const sortQuery = sortModel
      .map(({ field, sort }) => `&sortField=${field}&sortDirection=${sort}`)
      .join("");

    fetch(
      `https://rickandmortyapi.com/api/character?page=${page + 1}&limit=${pageSize}${sortQuery}`,
    )
      .then((response) => response.json())
      .then((data) => {
        const characters: RowData[] = data.results.map(
          (character: ApiCharacter) => ({
            id: character.id,
            name: character.name,
            status: character.status,
            species: character.species,
            gender: character.gender,
            episode: character.episode,
          }),
        );
        dispatch({
          type: "SET_ROWS",
          payload: { rows: characters, rowCount: data.info.count },
        });
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  useEffect(() => {
    fetchData(
      state.paginationModel.page,
      state.paginationModel.pageSize,
      state.sortModel,
    );
  }, [state.paginationModel, state.sortModel]);

  const handleSortChange = (newSortModel: GridSortModel) => {
    dispatch({ type: "SET_SORT", payload: newSortModel });
  };

  const handlePaginationChange = (newPaginationModel: GridPaginationModel) => {
    dispatch({ type: "SET_PAGINATION", payload: newPaginationModel });
  };

  const handleNavigateToSwapi = () => {
    navigate("/swapi");
  };

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 120 },
    { field: "name", headerName: "Name", width: 120 },
    { field: "status", headerName: "Status", width: 120 },
    { field: "species", headerName: "Species", width: 120 },
    { field: "gender", headerName: "Gender", width: 120 },
  ];

  return (
    <Box
      sx={{
        height: 600,
        width: "100%",
        backgroundColor: "#fff",
        borderRadius: 2,
      }}
    >
      <Button
        variant="contained"
        color="primary"
        onClick={handleNavigateToSwapi}
      >
        Go to SWAPI
      </Button>
      <DataGridPremium
        rows={state.rows}
        columns={columns}
        paginationModel={state.paginationModel}
        onPaginationModelChange={handlePaginationChange}
        onSortModelChange={handleSortChange}
        rowCount={state.rowCount}
        paginationMode="server"
        slots={{
          toolbar: () => <CustomToolbar rowCount={state.rowCount} />,
          footer: () => (
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
                padding: "10px",
                backgroundColor: "#f5f5f5",
                gap: 2,
              }}
            >
              <IconButton
                onClick={() =>
                  handlePaginationChange({ ...state.paginationModel, page: 0 })
                }
                disabled={state.paginationModel.page === 0}
                sx={{ p: 0 }}
              >
                <FirstPageRoundedIcon />
              </IconButton>
              <Pagination
                count={Math.ceil(
                  state.rowCount / state.paginationModel.pageSize,
                )}
                page={state.paginationModel.page + 1}
                onChange={(_, page) =>
                  handlePaginationChange({
                    ...state.paginationModel,
                    page: page - 1,
                  })
                }
                sx={{
                  "& .Mui-selected": {
                    backgroundColor: "#4D1A69",
                    color: "white",
                  },
                }}
              />
              <IconButton
                onClick={() =>
                  handlePaginationChange({
                    ...state.paginationModel,
                    page:
                      Math.ceil(
                        state.rowCount / state.paginationModel.pageSize,
                      ) - 1,
                  })
                }
                disabled={
                  state.paginationModel.page ===
                  Math.ceil(state.rowCount / state.paginationModel.pageSize) - 1
                }
                sx={{ p: 0 }}
              >
                <LastPageRoundedIcon />
              </IconButton>
              <FormControl sx={{ minWidth: 20, marginRight: 2 }}>
                <Select
                  labelId="page-size-label"
                  id="page-size-select"
                  value={state.paginationModel.pageSize}
                  onChange={(e) =>
                    handlePaginationChange({
                      ...state.paginationModel,
                      pageSize: parseInt(e.target.value as string, 10),
                    })
                  }
                >
                  {pageSizeOptions.map((size) => (
                    <SelectMenuItem key={size} value={size}>
                      {size}
                    </SelectMenuItem>
                  ))}
                </Select>
              </FormControl>
              <InputLabel id="page-size-label">Results per page</InputLabel>
            </Box>
          ),
        }}
        checkboxSelection
        getDetailPanelContent={(params: GridRowParams<RowData>) => (
          <DetailPanelContent row={params.row} />
        )}
        getDetailPanelHeight={() => 200}
        pagination
        pageSizeOptions={pageSizeOptions}
      />
    </Box>
  );
};

export default DataGridProCustom;
