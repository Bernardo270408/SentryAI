import React, { useState, useRef, useEffect, useCallback } from "react";
import { FiUser, FiSettings, FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import "../styles/AppHeader.css";

export default function AppHeader({ user, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Refs
  const wrapRef = useRef(null);      
  const menuRef = useRef(null);      
  const firstBtnRef = useRef(null);  
  const lastBtnRef = useRef(null);   
  
  const navigate = useNavigate();

  // Handlers
  const toggleMenu = useCallback(() => setIsOpen(prev => !prev), []);
  const closeMenu = useCallback(() => setIsOpen(false), []);

  const goTo = (path) => {
    closeMenu();
    navigate(path);
  };

  const handleLogoutClick = () => {
    closeMenu();
    if (onLogout) onLogout();
  };

  // Click Outside
  useEffect(() => {
    function onDocClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", onDocClick);
    }
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [isOpen]);

  // Acessibilidade: ESC e Focus Management
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      firstBtnRef.current?.focus();
    }, 50);

    function onKey(e) {
      if (e.key === "Escape") {
        e.stopPropagation();
        closeMenu();
      }
      
      if (e.key === "Tab") {
        const focusable = menuRef.current?.querySelectorAll('button:not([disabled])');
        if (!focusable || focusable.length === 0) return;
        
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      }
    }

    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen, closeMenu]);

  return (
    <header className="app-header-pill">
      {/* Lado Esquerdo: Logo */}
      <div 
        className="header-left" 
        onClick={() => navigate("/app")}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && navigate("/app")}
      >
        <div className="header-logo" aria-hidden>
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" 
            viewBox="0 0 24 24" fill="none" stroke="currentColor" 
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"></path>
            <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"></path>
            <path d="M7 21h10"></path>
            <path d="M12 3v18"></path>
            <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"></path>
          </svg>
        </div>

        <div className="brand-app">
          <span className="brand-title">Sentry AI</span>
          <span className="brand-subtitle">Democratizando o acesso jurídico</span>
        </div>
      </div>

      {/* Lado Direito: User Wrapper */}
      <div className="header-user-wrap" ref={wrapRef}>
        <button
          className={`header-user ${isOpen ? 'active' : ''}`}
          aria-haspopup="true"
          aria-expanded={isOpen}
          aria-controls="user-dropdown-panel"
          onClick={toggleMenu}
        >
          <div className="user-avatar" aria-hidden>
            <FiUser size={18} />
          </div>
          <span className="username">{user?.name?.split(' ')[0] || "Usuário"}</span>
        </button>

        <div 
          id="user-dropdown-panel"
          className={`user-dropdown-panel ${isOpen ? 'open' : ''}`}
          ref={menuRef}
          role="dialog"
          aria-label="Menu do usuário"
        >
          <button
            ref={firstBtnRef}
            onClick={() => goTo("/app/profile")}
            className="dropdown-option"
            type="button"
          >
            <FiUser size={16} /> Perfil
          </button>

          <button
            onClick={() => goTo("/app/dashboard")}
            className="dropdown-option"
            type="button"
          >
            <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="18" width="18" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="9" y1="21" x2="9" y2="9"></line>
            </svg>
            Dashboard
          </button>

          <button
            onClick={() => goTo("/app/settings")}
            className="dropdown-option"
            type="button"
          >
            <FiSettings size={16} /> Configurações
          </button>

          <div className="divider" />

          <button
            ref={lastBtnRef}
            onClick={handleLogoutClick}
            className="dropdown-option logout"
            type="button"
          >
            <FiLogOut size={16} /> Sair
          </button>
        </div>
      </div>
    </header>
  );
}