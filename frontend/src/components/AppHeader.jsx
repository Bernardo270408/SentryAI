import React, { useState, useRef, useEffect, useCallback } from "react";
import { FiUser, FiSettings, FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion"; // Importação adicionada
import "../styles/AppHeader.css";

// Variantes de Animação
const headerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const menuVariants = {
  hidden: { opacity: 0, scale: 0.95, y: -10, pointerEvents: "none" },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0, 
    pointerEvents: "auto",
    transition: { type: "spring", stiffness: 300, damping: 25 } 
  },
  exit: { opacity: 0, scale: 0.95, y: -10, transition: { duration: 0.2 } }
};

const itemVariants = {
  hover: { x: 5, backgroundColor: "rgba(255, 255, 255, 0.05)", color: "#fff" },
  tap: { scale: 0.98 }
};

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
    <motion.header 
        className="app-header-pill"
        variants={headerVariants}
        initial="hidden"
        animate="visible"
    >
      {/* Lado Esquerdo: Logo */}
      <motion.div 
        className="header-left" 
        onClick={() => navigate("/app")}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && navigate("/app")}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
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
      </motion.div>

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

        <AnimatePresence>
        {isOpen && (
            <motion.div 
              id="user-dropdown-panel"
              className="user-dropdown-panel open" // Mantém a classe base para estilos estáticos
              ref={menuRef}
              role="dialog"
              aria-label="Menu do usuário"
              variants={menuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <motion.button
                ref={firstBtnRef}
                onClick={() => goTo("/app/profile")}
                className="dropdown-option"
                type="button"
                variants={itemVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <FiUser size={16} /> Perfil
              </motion.button>

              <motion.button
                onClick={() => goTo("/app/dashboard")}
                className="dropdown-option"
                type="button"
                variants={itemVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="18" width="18" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="3" y1="9" x2="21" y2="9"></line>
                    <line x1="9" y1="21" x2="9" y2="9"></line>
                </svg>
                Dashboard
              </motion.button>

              <motion.button
                onClick={() => goTo("/app/settings")}
                className="dropdown-option"
                type="button"
                variants={itemVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <FiSettings size={16} /> Configurações
              </motion.button>

              <div className="divider" />

              <motion.button
                ref={lastBtnRef}
                onClick={handleLogoutClick}
                className="dropdown-option logout"
                type="button"
                variants={itemVariants}
                whileHover={{ x: 5, backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}
                whileTap="tap"
              >
                <FiLogOut size={16} /> Sair
              </motion.button>
            </motion.div>
        )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}