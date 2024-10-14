import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import DataGridProCustom from "./components/dataGridProCustom";
import DataGridCustomTree from "./components/dataGridSWAPI";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="App">
        <header className="App-header">
          <p>
            Edit <code>src/App.tsx</code> and save to reload.
          </p>
        </header>
        <div style={{ height: "80%", width: "100%" }}>
          <Routes>
            <Route path="/" element={<DataGridProCustom />} />
            <Route path="/swapi" element={<DataGridCustomTree />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default App;
