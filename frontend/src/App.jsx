// src/App.jsx
import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Header from "./components/Header";

export default function App() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  }

  return (
    <div className="app-root">
      <Header onLogout={handleLogout} />

      <main className="main-wrapper">
        <Outlet />
      </main>
    </div>
  );
}