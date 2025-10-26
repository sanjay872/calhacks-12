import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import SignIn from "./pages/signin";
import SignUp from "./pages/signup";
import Home from "./pages/home";
import ViewContract from "./pages/view-contract";
import { LucideFolderMinus } from "lucide-react";

import "./App.css";
import CreateContract from "./pages/create-contract"; 
class Contract {
  constructor(title: string, date: string, signatory: string, overleafFile: string) {
    this.title = title
    this.date = date
    this.signatory = signatory
    this.overleafFile = overleafFile
  }
}


function App() {
  return (
    
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/view-contract" element={<ViewContract />} />
        <Route path="/create-contract" element={<CreateContract />} />
      </Routes>
    </BrowserRouter>
  );
}

export const demoUser = {
  pastContracts: [
    new Contract("Contract 1", "2025-01-01", "Chase", '/demo/contract.tex'),
    new Contract("Contract 2", "2025-01-02", "Amazon", "/demo/contract.tex"),
    new Contract("Contract 3", "2025-01-03", "Wells Fargo", "/demo/contract.tex"),
    new Contract("Contract 4", "2025-01-04", "Intel", "/demo/contract.tex")
  ]
}
/* export const demoUser = {
  pastContracts: []
} */
export default App;
