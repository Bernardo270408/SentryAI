import React, { useState, useEffect, useRef } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
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

  useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);

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

      {user && !isChatPage && <nav className="workspace-nav" aria-label="Navegação principal">
        {[['/app', 'Início'], ['/chat', 'Chat'], ['/contract-analysis', 'Contratos'], ['/dashboard', 'Painel'], ['/rights', 'Explorar']].map(([path, label]) =>
          <NavLink key={path} to={path} end>{label}</NavLink>)}
      </nav>}
      <main className="main-wrapper">
        <Outlet />
      </main>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} initialTab={initialTab} setUser={setUser} />
    </div>
  );
}
