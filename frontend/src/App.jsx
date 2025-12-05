import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import AppHeader from "./components/AppHeader";

export default function App() {
  const navigate = useNavigate();
  const location = useLocation(); // Hook para pegar a rota atual
  const user = JSON.parse(localStorage.getItem("user")) || { name: "Usuário", initial: "U" };

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  }

  // Verificando se é a página de chat
  const isChatPage = location.pathname.includes("/chat");

  return (
    <div className="app-root">
      {/* Renderiza AppHeader APENAS se NÃO for a página de chat */}
      {!isChatPage && <AppHeader user={user} onLogout={handleLogout} />}

      <main className="main-wrapper">
        <Outlet />
      </main>
    </div>
  );
}