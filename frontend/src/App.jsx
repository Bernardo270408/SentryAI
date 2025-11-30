import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import AppHeader from "./components/AppHeader";

export default function App() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || { name: "Usuário", initial: "U" };

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  }

  return (
    <div className="app-root">
      {/* Passamos apenas a função de logout e o usuário; AppHeader usa useNavigate internamente */}
      <AppHeader user={user} onLogout={handleLogout} />

      <main className="main-wrapper">
        <Outlet />
      </main>
    </div>
  );
}