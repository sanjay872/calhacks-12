import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import SignIn from "./pages/signin";
import SignUp from "./pages/signup";
import Home from "./pages/home";
import ViewContract from "./pages/view-contract";
import EditContract from "./pages/edit-contract";

import "./App.css";
import CreateContract from "./pages/create-contract";
import { useState, useEffect } from "react";

function App() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    console.log("User:", user);
  }, [user]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/signin" element={<SignIn setUser={setUser} />} />
        <Route path="/signup" element={<SignUp setUser={setUser} />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/view-contract"
          element={
            <ProtectedRoute>
              <ViewContract />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-contract"
          element={
            <ProtectedRoute>
              <EditContract />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-contract"
          element={
            <ProtectedRoute>
              <CreateContract />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
