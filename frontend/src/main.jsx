// src/main.jsx
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import App from "./App";
import Home from "./pages/Home";
import Aplication from "./pages/Aplication";
import ChatApp from "./pages/ChatApp";
import "./styles/global.css";
import "./styles/chat.css";

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
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);