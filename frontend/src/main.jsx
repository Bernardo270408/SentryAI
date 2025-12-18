import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'react-hot-toast';

import App from "./App";
import Home from "./pages/Home";
import AdminPanel from "./pages/AdminPanel";
import Aplication from "./pages/Aplication";
import Dashboard from "./pages/Dashboard";
import ChatPage from "./pages/ChatPage";
import Profile from "./pages/Profile";
import RightsExplorer from "./pages/RightsExplorer";
import ContractAnalysis from "./pages/ContractAnalysis";
import BannedPage from "./pages/BannedPage";
import AppealPage from "./pages/AppealPage";
import Settings from "./pages/Settings";
import KnowledgeBase from "./pages/KnowledgeBase";
import Documentation from "./pages/Documentation";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Disclaimer from "./pages/Disclaimer";
import "./styles/global.css";



const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

/* =========================
   PROTEÇÕES DE ROTA
   ========================= */

// Verifica apenas se está logado
function Protected() {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/" replace />;
  return <Outlet />;
}

// Verifica login + permissão de admin
function AdminRoute({ children }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!token) return <Navigate to="/" replace />;
  if (!user.is_admin) return <Navigate to="/app" replace />;

  return children;
}

/* =========================
   RENDER
   ========================= */

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#18181b",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.1)"
          }
        }}
      />

      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <Routes>

          {/* APP = LAYOUT GLOBAL (SEMPRE RENDERIZA) */}
          <Route element={<App />}>

            {/* ===== ROTAS PÚBLICAS ===== */}
            <Route path="/" element={<Home />} />
            <Route path="/knowledge-base" element={<KnowledgeBase />} />
            <Route path="/docs" element={<Documentation />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/disclaimer" element={<Disclaimer />} />
            <Route path="/banned" element={<BannedPage />} />
            <Route path="/appeal" element={<AppealPage />} />

            {/* ===== ROTAS PROTEGIDAS ===== */}
            <Route element={<Protected />}>
              <Route path="/app" element={<Aplication />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/rights" element={<RightsExplorer />} />
              <Route path="/contract-analysis" element={<ContractAnalysis />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />

              {/* ===== ADMIN ===== */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminPanel />
                  </AdminRoute>
                }
              />
            </Route>

          </Route>

          {/* ===== FALLBACK ===== */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
