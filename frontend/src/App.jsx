import React, { useState, useEffect, useRef } from 'react'
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import NavigationBar from "./components/NavigationBar";
import AuthModal from './components/AuthModal'


export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [authOpen, setAuthOpen] = useState(false);
  const [initialTab, setInitialTab] = useState('login');
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  });

  // Atualizar o user quando localStorage mudar — ou quando login/logout acontecer
  useEffect(() => {
    function handleStorageChange() {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        setUser(storedUser);
      } catch {
        setUser(null);
      }
    }

    // Se quiser cobrir mudanças vindas de outras abas/janelas
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  }

  function openAuth(tab = 'login') {
    setInitialTab(tab);
    setAuthOpen(true);
  }

  const isChatPage = location.pathname.startsWith("/chat");

  return (
    <div className="app-root">
      {!isChatPage && (
        <NavigationBar
          user={user}
          onLogout={handleLogout}
          onLogin={() => openAuth("login")}
          onRegister={() => openAuth("register")}
        />
      )}

      <main className="main-wrapper">
        <Outlet />
      </main>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} initialTab={initialTab} setUser={setUser} />
    </div>
  );
}
