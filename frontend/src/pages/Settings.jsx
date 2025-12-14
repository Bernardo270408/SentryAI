import React, { useState, useEffect } from "react";
import '../styles/settings.css';
import FooterContent from "../components/FooterComponent";
import { FiMoon, FiSun, FiMail, FiUser, FiShield, FiTrash2, FiGlobe, FiMessageCircle, FiChevronRight, FiCamera } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const settingsSections = [
  { id: 'profile', label: 'Perfil', icon: FiUser, desc: 'Gerencie seus dados pessoais' },
  { id: 'security', label: 'Segurança', icon: FiShield, desc: 'Proteja sua conta e senha' },
  { id: 'appearance', label: 'Aparência', icon: FiMoon, desc: 'Personalize o tema' },
  { id: 'language', label: 'Idioma', icon: FiGlobe, desc: 'Preferências de região' },
  { id: 'feedback', label: 'Feedback', icon: FiMessageCircle, desc: 'Nos ajude a melhorar' },
  { id: 'danger', label: 'Zona de Perigo', icon: FiTrash2, desc: 'Ações irreversíveis', isDanger: true },
];

const containerVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
};

export default function Settings() {
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  const [theme, setTheme] = useState(localStorage.getItem("theme") || systemTheme);
  const [language, setLanguage] = useState(localStorage.getItem("lang") || "pt");
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || { name: "", email: "" });
  
  const [activeSection, setActiveSection] = useState('profile');
  const [newName, setNewName] = useState(user.name);
  const [newEmail, setNewEmail] = useState(user.email);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => { localStorage.setItem("lang", language); }, [language]);

  const handleUpdateName = () => {
    if (!newName.trim()) return toast.error("Nome inválido");
    const updated = { ...user, name: newName };
    setUser(updated);
    localStorage.setItem("user", JSON.stringify(updated));
    toast.success("Perfil atualizado!");
  };

  // --- Renderização das Seções ---
  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div className="form-grid">
            <div className="avatar-section">
              <div className="avatar-circle">
                {user.name ? user.name.charAt(0).toUpperCase() : <FiUser />}
                <button className="avatar-edit"><FiCamera /></button>
              </div>
              <div className="avatar-info">
                <h3>{user.name || "Usuário"}</h3>
                <p>Personalize sua foto e detalhes.</p>
              </div>
            </div>
            
            <div className="input-group">
              <label>Nome de Exibição</label>
              <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Seu nome" />
            </div>
            
            <div className="input-group">
              <label>Endereço de E-mail</label>
              <input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="exemplo@email.com" />
              <button className="link-btn" onClick={() => toast.success("Email de verificação enviado")}>
                Validar novo e-mail
              </button>
            </div>

            <div className="form-actions">
                <button className="btn-primary" onClick={handleUpdateName}>Salvar Alterações</button>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="form-grid">
            <div className="input-group">
              <label>Senha Atual</label>
              <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <div className="input-group">
              <label>Nova Senha</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <div className="form-actions">
                <button className="btn-primary" onClick={() => toast.success("Senha atualizada!")}>Atualizar Senha</button>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="appearance-grid">
            <button 
                className={`theme-card ${theme === 'light' ? 'active' : ''}`}
                onClick={() => setTheme('light')}
            >
                <div className="theme-preview light"></div>
                <span>Claro</span>
                {theme === 'light' && <div className="check-circle" />}
            </button>
            <button 
                className={`theme-card ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => setTheme('dark')}
            >
                <div className="theme-preview dark"></div>
                <span>Escuro</span>
                {theme === 'dark' && <div className="check-circle" />}
            </button>
          </div>
        );

      case 'danger':
        return (
          <div className="danger-box">
            <div className="danger-header">
                <FiTrash2 size={24} />
                <h3>Excluir Conta</h3>
            </div>
            <p>Uma vez que você excluir sua conta, não há como voltar atrás. Por favor, tenha certeza.</p>
            <button className="btn-danger" onClick={() => toast.error("Ação crítica iniciada")}>
                Sim, quero excluir minha conta
            </button>
          </div>
        );

      default:
        return <div className="placeholder-section">Em desenvolvimento...</div>;
    }
  };

  return (
    <div className="settings-page">
      <main className="settings-container">
        <header className="page-header">
            <motion.h1 initial={{opacity:0, y:-10}} animate={{opacity:1, y:0}}>Configurações</motion.h1>
            <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.1}}>
                Gerencie suas preferências e dados da conta.
            </motion.p>
        </header>

        <div className="settings-layout">
          {/* MENU LATERAL */}
          <nav className="settings-sidebar">
            {settingsSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`nav-btn ${activeSection === section.id ? 'active' : ''} ${section.isDanger ? 'danger-link' : ''}`}
              >
                {activeSection === section.id && (
                    <motion.div layoutId="active-pill" className="active-pill" transition={{type: "spring", stiffness: 300, damping: 30}} />
                )}
                <section.icon className="nav-icon" />
                <div className="nav-text">
                    <span className="nav-label">{section.label}</span>
                    <span className="nav-desc">{section.desc}</span>
                </div>
              </button>
            ))}
          </nav>

          {/* CONTEÚDO */}
          <div className="settings-content-area">
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeSection}
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="content-wrapper"
                >
                    <div className="content-header">
                        <h2>{settingsSections.find(s => s.id === activeSection)?.label}</h2>
                    </div>
                    {renderContent()}
                </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
      <FooterContent />
    </div>
  );
}