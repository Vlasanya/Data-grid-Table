import React, { useReducer, useEffect } from "react";
import { GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import { DataGridPremium } from "../x-data-grid-premium/DataGridPremium/DataGridPremium";
import {
  IconButton,
  Box,
  Pagination,
  Select,
  MenuItem as SelectMenuItem,
  FormControl,
  InputLabel,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import FirstPageRoundedIcon from "@mui/icons-material/FirstPageRounded";
import LastPageRoundedIcon from "@mui/icons-material/LastPageRounded";

interface User {
  id: number;
  name: string;
}

interface Post {
  id: number;
  title: string;
  userId: number;
}

interface Comment {
  id: number;
  body: string;
  postId: number;
}

export interface RowData {
  id: string;
  name: string;
  category: string;
  path: string;
}

interface State {
  rows: RowData[];
  paginationModel: GridPaginationModel;
  errorMessage: string | null;
}

const initialState: State = {
  rows: [],
  paginationModel: { page: 0, pageSize: 10 },
  errorMessage: null,
};

type Action =
  | { type: "SET_ROWS"; payload: RowData[] }
  | { type: "SET_PAGINATION"; payload: GridPaginationModel }
  | { type: "SET_ERROR"; payload: string | null };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_ROWS":
      return { ...state, rows: action.payload };
    case "SET_PAGINATION":
      return { ...state, paginationModel: action.payload };
    case "SET_ERROR":
      return { ...state, errorMessage: action.payload };
    default:
      return state;
  }
}
const pageSizeOptions = [10, 20, 30];
const DataGridCustomTree: React.FC = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const navigate = useNavigate();

  const fetchData = () => {
    Promise.allSettled([
      fetch(`https://jsonplaceholder.typicode.com/users`).then((response) =>
        response.json()
      ),
      fetch(`https://jsonplaceholder.typicode.com/posts`).then((response) =>
        response.json()
      ),
      fetch(`https://jsonplaceholder.typicode.com/comments`).then((response) =>
        response.json()
      ),
    ])
      .then((results) => {
        const [usersResult, postsResult, commentsResult] = results;

        const users: User[] =
          usersResult.status === "fulfilled" ? usersResult.value : [];
        const posts: Post[] =
          postsResult.status === "fulfilled" ? postsResult.value : [];
        const comments: Comment[] =
          commentsResult.status === "fulfilled" ? commentsResult.value : [];

        if (usersResult.status === "rejected") {
          dispatch({ type: "SET_ERROR", payload: "Failed to load users." });
        }
        if (postsResult.status === "rejected") {
          dispatch({ type: "SET_ERROR", payload: "Failed to load posts." });
        }
        if (commentsResult.status === "rejected") {
          dispatch({
            type: "SET_ERROR",
            payload: "Failed to load comments.",
          });
        }

        if (!users.length) {
          console.error("Error: No users available.");
          dispatch({ type: "SET_ERROR", payload: "No users available." });
          return;
        }

        const rowsData = users.flatMap((user: User) => {
          const userPath = user.name;
          const userId = `user-${user.id}`;
          const userRow: RowData = {
            id: userId,
            name: user.name,
            category: "User",
            path: userPath,
          };

          const postsRows =
            posts.length > 0
              ? posts
                  .filter((post: Post) => post.userId === user.id)
                  .flatMap((post: Post) => {
                    const postPath = `${userPath}/${post.title}`;
                    const postId = `post-${post.id}`;
                    const postRow: RowData = {
                      id: postId,
                      name: `Post: ${post.title}`,
                      category: "Post",
                      path: postPath,
                    };

                    const commentRows =
                      comments.length > 0
                        ? comments
                            .filter(
                              (comment: Comment) => comment.postId === post.id
                            )
                            .map((comment: Comment) => ({
                              id: `comment-${comment.id}`,
                              name: `Comment: ${comment.body.slice(0, 20)}...`,
                              category: "Comment",
                              path: `${postPath}/${comment.body.slice(0, 20)}`,
                            }))
                        : [];

                    return [postRow, ...commentRows];
                  })
              : [];

          return [userRow, ...postsRows];
        });

        dispatch({ type: "SET_ROWS", payload: rowsData });
      })
      .catch((error) => {
        console.error("Error processing requests:", error);
        dispatch({
          type: "SET_ERROR",
          payload: "Error processing requests.",
        });
      });
  };

  useEffect(() => {
    fetchData();
  }, [state.paginationModel]);

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 100 },
    { field: "name", headerName: "Name", width: 200 },
    { field: "category", headerName: "Category", width: 150 },
  ];

  const handleNavigateBack = () => {
    navigate("/");
  };

  const handlePaginationModelChange = (newModel: GridPaginationModel) => {
    dispatch({ type: "SET_PAGINATION", payload: newModel });
  };

  return (
    <Box
      sx={{
        height: 600,
        width: "100%",
        backgroundColor: "#fff",
        borderRadius: 2,
      }}
    >
      <Button variant="contained" color="primary" onClick={handleNavigateBack}>
        Go Back
      </Button>
      {state.errorMessage && (
        <Box sx={{ color: "red", marginBottom: 2 }}>{state.errorMessage}</Box>
      )}
      <DataGridPremium
        rows={state.rows}
        columns={columns}
        paginationModel={state.paginationModel}
        onPaginationModelChange={handlePaginationModelChange}
        treeData
        getTreeDataPath={(row: RowData) => row.path.split("/")}
        slots={{
          toolbar: () => (
            <Box
              sx={{ display: "flex", justifyContent: "flex-end", padding: 2 }}
            >
              <span>Total Rows: {state.rows.length}</span>
            </Box>
          ),
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
                  handlePaginationModelChange({
                    ...state.paginationModel,
                    page: 0,
                  })
                }
                disabled={state.paginationModel.page === 0}
                sx={{ p: 0 }}
              >
                <FirstPageRoundedIcon />
              </IconButton>
              <Pagination
                count={Math.ceil(
                  state.rows.length / state.paginationModel.pageSize
                )}
                page={state.paginationModel.page + 1}
                onChange={(_, page) =>
                  handlePaginationModelChange({
                    ...state.paginationModel,
                    page: page - 1,
                  })
                }
              />
              <IconButton
                onClick={() =>
                  handlePaginationModelChange({
                    ...state.paginationModel,
                    page:
                      Math.ceil(
                        state.rows.length / state.paginationModel.pageSize
                      ) - 1,
                  })
                }
                disabled={
                  state.paginationModel.page ===
                  Math.ceil(
                    state.rows.length / state.paginationModel.pageSize
                  ) -
                    1
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
                    handlePaginationModelChange({
                      ...state.paginationModel,
                      pageSize: parseInt(e.target.value as string, 10),
                    })
                  }
                  sx={{
                    "& .MuiSelect-select": {
                      p: "2px 32px 2px 2px",
                    },
                  }}
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
        pagination
        pageSizeOptions={pageSizeOptions}
      />
    </Box>
  );
};

export default DataGridCustomTree;
