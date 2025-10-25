import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import SignIn from "./pages/signin";
import SignUp from "./pages/signup";
import Home from "./pages/home";
import Contract from "./pages/contract";
import "./App.css";
import CreateContract from "./pages/create-contract";

function App() {
  return (
    
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contract" element={<Contract />} />
        <Route path="/create-contract" element={<CreateContract />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
