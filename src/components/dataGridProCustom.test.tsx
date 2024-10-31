// import React from "react";
// import { render, screen, fireEvent, waitFor } from "@testing-library/react";
// import DataGridProCustom from "./dataGridProCustom";
// import { BrowserRouter } from "react-router-dom";

// global.fetch = jest.fn(() =>
//   Promise.resolve({
//     json: () =>
//       Promise.resolve({
//         results: [
//           { id: 1, name: "Rick", status: "Alive", species: "Human", gender: "Male", episode: [] },
//           { id: 2, name: "Morty", status: "Alive", species: "Human", gender: "Male", episode: [] },
//         ],
//         info: { count: 2 },
//       }),
//   }),
// ) as jest.Mock;

// describe("<DataGridProCustom />", () => {
//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   it("should render custom DataGridPremium component", async () => {
//     render(
//       <BrowserRouter>
//         <DataGridProCustom />
//       </BrowserRouter>,
//     );

//     expect(screen.getByText(/Go to SWAPI/i)).toBeInTheDocument();

//     await waitFor(() => {
//       expect(screen.getByRole("grid")).toBeInTheDocument();
//     });

//     await waitFor(() => {
//       expect(screen.getByText("Rick")).toBeInTheDocument();
//       expect(screen.getByText("Morty")).toBeInTheDocument();
//     });
//   });

//   it("should navigate to /swapi when the button is clicked", () => {
//     const mockNavigate = jest.fn();
//     jest.mock("react-router-dom", () => ({
//       ...jest.requireActual("react-router-dom"),
//       useNavigate: () => mockNavigate,
//     }));

//     render(
//       <BrowserRouter>
//         <DataGridProCustom />
//       </BrowserRouter>,
//     );

//     fireEvent.click(screen.getByText(/Go to SWAPI/i));

//     expect(mockNavigate).toHaveBeenCalledWith("/swapi");
//   });

//   it("should trigger pagination changes", async () => {
//     render(
//       <BrowserRouter>
//         <DataGridProCustom />
//       </BrowserRouter>,
//     );

//     await waitFor(() => expect(screen.getByRole("grid")).toBeInTheDocument());

//     expect(screen.getByText("Rick")).toBeInTheDocument();
//     expect(screen.getByText("Morty")).toBeInTheDocument();

//     const pagination = screen.getByRole("button", { name: /2/i });
//     fireEvent.click(pagination);

//     await waitFor(() => {
//       expect(global.fetch).toHaveBeenCalledWith(
//         expect.stringContaining("page=2"),
//       );
//     });
//   });

//   it("should handle page size change", async () => {
//     render(
//       <BrowserRouter>
//         <DataGridProCustom />
//       </BrowserRouter>,
//     );

//     await waitFor(() => expect(screen.getByRole("grid")).toBeInTheDocument());

//     fireEvent.mouseDown(screen.getByLabelText("Results per page"));
//     fireEvent.click(screen.getByText("40"));

//     await waitFor(() => {
//       expect(global.fetch).toHaveBeenCalledWith(
//         expect.stringContaining("limit=40"),
//       );
//     });
//   });

//   it("should sort the data when the column header is clicked", async () => {
//     render(
//       <BrowserRouter>
//         <DataGridProCustom />
//       </BrowserRouter>,
//     );

//     await waitFor(() => expect(screen.getByRole("grid")).toBeInTheDocument());

//     const nameHeader = screen.getByRole("columnheader", { name: "Name" });
//     fireEvent.click(nameHeader);

//     await waitFor(() => {
//       expect(global.fetch).toHaveBeenCalledWith(
//         expect.stringContaining("&sortField=name&sortDirection=asc"),
//       );
//     });
//   });

//   it("should display the custom toolbar", async () => {
//     render(
//       <BrowserRouter>
//         <DataGridProCustom />
//       </BrowserRouter>,
//     );

//     await waitFor(() => expect(screen.getByRole("grid")).toBeInTheDocument());

//     expect(screen.getByText(/Custom Toolbar/i)).toBeInTheDocument();
//   });
// });
