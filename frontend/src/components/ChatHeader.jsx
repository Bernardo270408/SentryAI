import React, { useState, useRef, useEffect, useCallback } from "react";
import { FiUser, FiSettings, FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
// O CSS deste componente estará em chatpage.css para não conflitar

export default function ChatHeader({ user, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapRef = useRef(null);
  const navigate = useNavigate();

  const toggleMenu = useCallback(() => setIsOpen(prev => !prev), []);
  const closeMenu = useCallback(() => setIsOpen(false), []);

  const goTo = (path) => {
    closeMenu();
    navigate(path);
  };

    


  // Fecha ao clicar fora
  useEffect(() => {
    function onDocClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [isOpen]);

  return (
    <header className="chat-header-pill">
      {/* Lado Esquerdo: Marca */}
      <div className="header-left" onClick={() => navigate("/app")} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && navigate("/app")}>
        <div className="brand-app">
          <span className="brand-title">Sentry AI</span>
        </div>
      </div>

      {/* Lado Direito: Usuário */}
      
      <div className="header-user-wrap" ref={wrapRef}>
        <button
          className={`header-user ${isOpen ? 'active' : ''}`}
          onClick={toggleMenu}
        >
          <div className="user-avatar">
            <FiUser size={16} />
          </div>
          <span className="username">{user?.name?.split(' ')[0] || "Usuário"}</span>
        </button>

        {/* Dropdown */}
        <div className={`user-dropdown-panel ${isOpen ? 'open' : ''}`}>
          <button onClick={() => goTo("/profile")} className="dropdown-option">
            <FiUser size={14} /> Perfil
          </button>
          <button onClick={() => goTo("/app/settings")} className="dropdown-option">
            <FiSettings size={14} /> Configurações
          </button>
          <div className="divider" />
          <button onClick={onLogout} className="dropdown-option logout">
            <FiLogOut size={14} /> Sair
          </button>
        </div>
      </div>
    </header>
  );
}