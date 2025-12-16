import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, Crown, User, Settings, LogOut, LayoutDashboard, Home } from 'lucide-react'; // Ícone de Dashboard atualizado para LayoutDashboard
import { useNavigate } from "react-router-dom"; 
// import { FiUser, FiSettings, FiLogOut } from "react-icons/fi"; // Ícones FIs não são mais necessários

// Removendo a importação do CSS, já que estamos usando estilos inline
// import "../styles/AppHeader.css"; 

// Variantes de Animação (Mantidas)
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

const logoutItemVariants = {
    hover: { x: 5, backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#ef4444" },
    tap: { scale: 0.98 }
}

// Estilos temporários (Inline-Fix) para o dropdown
// Nota: Em uma aplicação real, estes deveriam estar em um arquivo CSS.
const dropdownPanelInlineStyle = {
    position: 'absolute',
    top: 'calc(100% + 12px)',
    right: 0,
    width: 200,
    borderRadius: 12,
    padding: 8,
    background: 'rgba(17, 16, 17, 0.9)', 
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 101, 
};

// Estilos temporários (Inline-Fix) para o item do dropdown
const dropdownItemInlineStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 12px',
    borderRadius: 8,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    background: 'none',
    border: 'none',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'background 0.2s, color 0.2s, transform 0.1s',
    width: '100%', // Adicionado para preencher a largura
};

// Estilos temporários (Inline-Fix) para o item de logout
const dropdownLogoutItemInlineStyle = {
    ...dropdownItemInlineStyle,
    color: 'rgba(239, 68, 68, 0.9)', 
};


export default function NavigationBar({
  user = null, 
  onLogin,
  onRegister,
  onLogout, 
  sticky = true,
}) {
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
      // Pequeno atraso para garantir que o menu esteja montado
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

        // Lógica de loop de foco (Trap Focus)
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


  // Conteúdo do Lado Direito (Ações ou Menu do Usuário)
  const RightContent = user ? (
    /* Menu do Usuário Logado */
    // wrapRef DEVE estar no contêiner pai do botão e do menu
    <div 
        className="header-user-wrap" 
        ref={wrapRef}
        style={{ position: 'relative' }} // ESSENCIAL: Permite posicionar o menu com 'absolute'
    >
        <button
          className={`header-user ${isOpen ? 'active' : ''}`}
          aria-haspopup="true"
          aria-expanded={isOpen}
          aria-controls="user-dropdown-panel"
          onClick={toggleMenu}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '50px',
            padding: '4px 12px 4px 4px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
            color: '#fff',
            transition: 'background 0.3s ease',
            outline: 'none',
            // Estilo para o hover/focus
            ':hover': { background: 'rgba(255, 255, 255, 0.1)' } 
          }}
        >
            <div 
                className="user-avatar" 
                aria-hidden 
                style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #4A90E2 0%, #111011ff 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <User size={16} strokeWidth={2.5} />
            </div>
            <span className="username" style={{ fontSize: 14 }}>{user?.name?.split(' ')[0] || "Usuário"}</span>
        </button>

        <AnimatePresence>
        {isOpen && (

            <motion.div 
              id="user-dropdown-panel"
              className="user-dropdown-panel-inline-fix" // Classe temporária
              ref={menuRef}
              role="dialog"
              aria-label="Menu do usuário"
              variants={menuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={dropdownPanelInlineStyle} // Aplica o estilo de posicionamento
            >

              <motion.button
                ref={firstBtnRef}
                onClick={() => goTo("/app")}
                className="dropdown-option"
                type="button"
                variants={itemVariants}
                whileHover="hover"
                whileTap="tap"
                style={dropdownItemInlineStyle}
              >
                <Home size={16} /> Home
              </motion.button>
              <motion.button
                ref={firstBtnRef}
                onClick={() => goTo("/app/profile")}
                className="dropdown-option"
                type="button"
                variants={itemVariants}
                whileHover="hover"
                whileTap="tap"
                style={dropdownItemInlineStyle}
              >
                <User size={16} /> Perfil
              </motion.button>

              <motion.button
                onClick={() => goTo("/app/dashboard")}
                className="dropdown-option"
                type="button"
                variants={itemVariants}
                whileHover="hover"
                whileTap="tap"
                style={dropdownItemInlineStyle}
              >
                <LayoutDashboard size={16} />
                Dashboard
              </motion.button>

              {user?.is_admin && (
                <motion.button
                  onClick={() => goTo("/admin")}
                  className="dropdown-option"
                  type="button"
                  variants={itemVariants}
                  whileHover="hover"
                  whileTap="tap"
                  style={dropdownItemInlineStyle}
                >
                  <Crown size={16} /> Admin Page
                </motion.button>
              )}

              <motion.button
                onClick={() => goTo("/app/settings")}
                className="dropdown-option"
                type="button"
                variants={itemVariants}
                whileHover="hover"
                whileTap="tap"
                style={dropdownItemInlineStyle}
              >
                <Settings size={16} /> Configurações
              </motion.button>

              <div className="divider" style={{ height: 1, margin: '8px 0', background: 'rgba(255, 255, 255, 0.1)' }} />

              <motion.button
                ref={lastBtnRef}
                onClick={handleLogoutClick}
                className="dropdown-option logout"
                type="button"
                variants={logoutItemVariants}
                whileHover="hover"
                whileTap="tap"
                style={dropdownLogoutItemInlineStyle}
              >
                <LogOut size={16} /> Sair
              </motion.button>
            </motion.div>
        )}
        </AnimatePresence>
    </div>
  ) : (
    /* Botões de Login/Registro (Usuário Deslogado) */
    <motion.nav
      className="top-nav"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      style={{ display: 'flex', alignItems: 'center', gap: 12 }}
    >
      <motion.button
        className="btn ghost"
        onClick={onLogin}
        style={{ 
            fontSize: 14, 
            padding: '8px 16px', 
            background: 'none', 
            border: 'none', 
            color: '#fff',
            cursor: 'pointer',
            transition: 'opacity 0.2s'
        }}
        whileHover={{ opacity: 0.7 }}
        whileTap={{ scale: 0.95 }}
      >
        Entrar
      </motion.button>

      <motion.button
        className="btn primary small"
        onClick={onRegister}
        style={{
          display: 'flex',
          gap: 6,
          alignItems: 'center',
          borderRadius: '24px',
          padding: '8px 20px',
          fontSize: 14,
          background: 'linear-gradient(90deg, #4A90E2 0%, #7B68EE 100%)',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(74, 144, 226, 0.3)',
        }}
        whileHover={{ scale: 1.05, boxShadow: '0 6px 16px rgba(74, 144, 226, 0.4)' }}
        whileTap={{ scale: 0.95 }}
      >
        Registrar
      </motion.button>
    </motion.nav>
  );

  return (
    <header
      className="landing-header"
      style={{
        position: sticky ? 'sticky' : 'relative',
        top: sticky ? 24 : 'auto',
        zIndex: 100,
        margin: '0 auto 40px auto',
        width: '90%',
        maxWidth: '900px',
        height: '64px',
        background: 'rgba(17, 16, 17, 0.75)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRadius: '50px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 20px',
      }}
    >
      {/* LOGO (Sem Alterações) */}
      <motion.div
        className="logo"
        onClick={() => goTo("/")}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        style={{ display: 'flex', alignItems: 'center', gap: 12 }}
      >
        <div
          className="brand-logo"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #4A90E2 0%, #111011ff 100%)',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(74, 144, 226, 0.3)',
          }}
        >
          <Scale size={18} strokeWidth={2.5} />
        </div>

        <div
          className="brand"
          style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}
        >
          <strong style={{ fontSize: 18, letterSpacing: '-0.5px' }}>
            SentryAI
          </strong>
          <span
            style={{
              fontSize: 9,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: 'rgba(255,255,255,0.5)',
              marginTop: 2,
            }}
          >
            Beta
          </span>
        </div>
      </motion.div>

      {/* CONTEÚDO DINÂMICO (AÇÕES ou MENU) */}
      {RightContent}
    </header>
  );
}