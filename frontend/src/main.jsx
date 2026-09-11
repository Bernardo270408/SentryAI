import React, { lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'react-hot-toast';

import App from "./App";
import { MotionConfig } from "framer-motion";
const Home = lazy(() => import("./pages/Home"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const Aplication = lazy(() => import("./pages/Aplication"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ChatPage = lazy(() => import("./pages/ChatPage"));
const Profile = lazy(() => import("./pages/Profile"));
const RightsExplorer = lazy(() => import("./pages/RightsExplorer"));
const ContractAnalysis = lazy(() => import("./pages/ContractAnalysis"));
const BannedPage = lazy(() => import("./pages/BannedPage"));
const AppealPage = lazy(() => import("./pages/AppealPage"));
const Settings = lazy(() => import("./pages/Settings"));
const KnowledgeBase = lazy(() => import("./pages/KnowledgeBase"));
const Documentation = lazy(() => import("./pages/Documentation"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Disclaimer = lazy(() => import("./pages/Disclaimer"));
import "./styles/global.css";
import "./styles/refinements.css";



const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function Protected() {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/" replace />;
  return <Outlet />;
}

function AdminRoute({ children }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!token) return <Navigate to="/" replace />;
  if (!user.is_admin) return <Navigate to="/app" replace />;

  return children;
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <MotionConfig reducedMotion="user">
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
        <Suspense fallback={<p role="status" style={{ padding: 32 }}>Carregando...</p>}>
        <Routes>

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
              <Route path="/profile/:id" element={<Profile />} />
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
        </Suspense>
      </BrowserRouter>
    </GoogleOAuthProvider>
    </MotionConfig>
  </React.StrictMode>
);
