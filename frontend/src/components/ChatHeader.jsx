import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FiUser, FiSettings, FiLogOut, FiLayout } from "react-icons/fi";
import { Scale } from "lucide-react"; // Mantendo consistência com o logo da Landing

// Variantes de Animação (Consistente com a NavigationBar)
const menuVariants = {
  hidden: { opacity: 0, scale: 0.95, y: -10 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 300, damping: 25 } 
  },
  exit: { opacity: 0, scale: 0.95, y: -10, transition: { duration: 0.2 } }
};

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
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setIsOpen(false);
    }
    if (isOpen) document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [isOpen]);

  const userName = user?.name || "Usuário";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <header style={headerStyle}>
      {/* Lado Esquerdo: Marca (Estilizada como a Landing) */}
      <div 
        style={brandStyle} 
        onClick={() => navigate("/app")} 
        role="button" 
        tabIndex={0}
      >
        <div style={logoIconStyle}>
          <Scale size={16} strokeWidth={2.5} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <strong style={{ fontSize: 16, letterSpacing: '-0.5px', color: '#fff' }}>SentryAI</strong>
          <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>App</span>
        </div>
      </div>

      {/* Lado Direito: Usuário */}
      <div style={{ position: 'relative' }} ref={wrapRef}>
        <button
          className={isOpen ? 'active' : ''}
          onClick={toggleMenu}
          style={userButtonStyle}
        >
          <div style={avatarStyle}>
            {userInitial}
          </div>
          <span style={{ fontSize: 14, fontWeight: 500 }}>{userName.split(' ')[0]}</span>
        </button>

        {/* Dropdown com Framer Motion */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              variants={menuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={dropdownPanelStyle}
            >
              <DropdownItem onClick={() => goTo("/app/profile")} icon={<FiUser />} label="Perfil" />
              <DropdownItem onClick={() => goTo("/app/dashboard")} icon={<FiLayout />} label="Dashboard" />
              <DropdownItem onClick={() => goTo("/app/settings")} icon={<FiSettings />} label="Configurações" />
              
              <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '6px 0' }} />
              
              <DropdownItem 
                onClick={onLogout} 
                icon={<FiLogOut />} 
                label="Sair" 
                isLogout 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

// Sub-componente para itens do menu para evitar repetição de código
function DropdownItem({ icon, label, onClick, isLogout = false }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ x: 4, backgroundColor: isLogout ? "rgba(239, 68, 68, 0.1)" : "rgba(255, 255, 255, 0.05)" }}
      style={{
        ...dropdownItemStyle,
        color: isLogout ? '#ef4444' : 'rgba(255,255,255,0.8)',
      }}
    >
      {icon} {label}
    </motion.button>
  );
}

// --- Estilos Objetivos ---

const headerStyle = {
  width: '70%',
  background: 'rgba(17, 16, 17, 0.6)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '30px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  alignSelf:"center",
  padding: '10px 24px',
  position:'sticky',
  top: "1%",
  zIndex: 100,
};

const brandStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  cursor: 'pointer',
};

const logoIconStyle = {
  width: 32,
  height: 32,
  borderRadius: '8px',
  background: 'linear-gradient(135deg, #4A90E2 0%, #222 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#fff',
};

const userButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '6px 12px 6px 6px',
  borderRadius: '30px',
  background: 'rgba(255, 255, 255, 0.03)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  color: '#fff',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
};

const avatarStyle = {
  width: 28,
  height: 28,
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #4A90E2 0%, #7B68EE 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 12,
  fontWeight: 'bold',
};

const dropdownPanelStyle = {
  position: 'absolute',
  top: 'calc(100% + 10px)',
  right: 0,
  width: '180px',
  background: 'rgba(23, 22, 23, 0.95)',
  backdropFilter: 'blur(10px)',
  borderRadius: '12px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  padding: '6px',
  boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
};

const dropdownItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  width: '100%',
  padding: '10px 12px',
  border: 'none',
  background: 'none',
  borderRadius: '8px',
  fontSize: '14px',
  cursor: 'pointer',
  textAlign: 'left',
  transition: 'all 0.2s ease',
};