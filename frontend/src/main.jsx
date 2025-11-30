// src/main.jsx
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import App from "./App";
import Home from "./pages/Home";
import Aplication from "./pages/Aplication";
import Dashboard from "./pages/Dashboard";
import ChatPage from "./pages/ChatPage";
import RightsExplorer from "./pages/RightsExplorer";
import ContractAnalysis from "./pages/ContractAnalysis";
import Settings from "./pages/Settings";
import "./styles/global.css";

function Protected({ children }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/" replace />;
  return children;
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home />} />

        <Route
          path="/app"
          element={
            <Protected>
              <App />
            </Protected>
          }
        >
          <Route index element={<Aplication />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="rights" element={<RightsExplorer />} />
            <Route path="contract-analysis" element={<ContractAnalysis />} />
            <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);