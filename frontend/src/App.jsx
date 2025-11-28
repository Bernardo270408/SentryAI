import React from "react";
import { Outlet, useNavigate } from "react-router-dom";

export default function App() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  }

  return (
    <div className="app-root">

      <main className="main-wrapper">
        <Outlet />
      </main>
    </div>
  );
}