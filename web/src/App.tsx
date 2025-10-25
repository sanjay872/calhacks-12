import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import Home from "./pages/home";
import "./App.css";
import Contract from "./pages/contract";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contract" element={<Contract />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
