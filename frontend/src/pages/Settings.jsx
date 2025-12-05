import React, { useState, useEffect } from "react";
import '../styles/settings.css';
import FooterContent from "../components/FooterComponent";
import { FiMoon, FiSun, FiMail, FiUser, FiShield, FiTrash2, FiGlobe, FiMessageCircle, FiChevronRight } from "react-icons/fi";

// Definição das seções de navegação
const settingsSections = [
  { id: 'profile', label: 'Perfil', icon: FiUser },
  { id: 'security', label: 'Segurança', icon: FiShield },
  { id: 'appearance', label: 'Aparência e Tema', icon: FiMoon },
  { id: 'language', label: 'Idioma', icon: FiGlobe },
  { id: 'feedback', label: 'Feedback', icon: FiMessageCircle },
  { id: 'danger', label: 'Zona de Perigo', icon: FiTrash2, isDanger: true },
];

export default function Settings() {
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  const systemLang = navigator.language.includes("pt") ? "pt" : "en";

  const [theme, setTheme] = useState(localStorage.getItem("theme") || systemTheme);
  const [language, setLanguage] = useState(localStorage.getItem("lang") || systemLang);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || { name: "", email: "" });
  
  // NOVO ESTADO: Controla a seção visível (default: 'profile')
  const [activeSection, setActiveSection] = useState('profile');

  // Para alterações
  const [newName, setNewName] = useState(user.name);
  const [newEmail, setNewEmail] = useState(user.email);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("lang", language);
  }, [language]);

  // --- Handlers (Simples) ---
  const handleUpdateName = () => {
    const updated = { ...user, name: newName };
    setUser(updated);
    localStorage.setItem("user", JSON.stringify(updated));
    alert("Nome atualizado com sucesso!");
  };

  const handleUpdateEmail = () => {
    alert("Enviamos um e-mail de confirmação para alterar seu endereço.");
  };

  const handleUpdatePassword = () => {
    alert("Um e-mail de verificação foi enviado para confirmar a alteração da senha.");
  };

  const handleDeleteAccount = () => {
    alert("Um e-mail foi enviado para confirmar a exclusão permanente da conta.");
  };

  const handleSendFeedback = () => {
    alert("Seu feedback foi enviado para sentryai2025@gmail.com.\nObrigado!");
    setFeedback("");
  };

  // --- Funções de Renderização das Seções ---

  const renderProfileSection = () => (
    <div className="section-content">
      <div className="settings-card">
        <label>Nome completo</label>
        <input value={newName} onChange={(e) => setNewName(e.target.value)} />
        <button className="btn small primary" onClick={handleUpdateName}>Salvar Nome</button>
      </div>

      <div className="settings-card">
        <label>E-mail</label>
        <input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
        <button className="btn small outline" onClick={handleUpdateEmail}>
          <FiMail /> Alterar E-mail (via confirmação)
        </button>
      </div>
    </div>
  );

  const renderSecuritySection = () => (
    <div className="section-content">
      <div className="settings-card">
        <label>Senha atual</label>
        <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />

        <label>Nova senha</label>
        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />

        <button className="btn small outline" onClick={handleUpdatePassword}>Alterar Senha</button>
      </div>
    </div>
  );
  
  const renderAppearanceSection = () => (
    <div className="section-content">
      <div className="settings-card">
        <div className="theme-toggle">
          <span>Tema atual: **{theme === "dark" ? "Escuro" : "Claro"}**</span>
          <button
            className="btn small outline"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <FiSun /> : <FiMoon />} Alternar Tema
          </button>
        </div>
      </div>
    </div>
  );

  const renderLanguageSection = () => (
    <div className="section-content">
      <div className="settings-card">
        <select value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="pt">Português (Brasil)</option>
          <option value="en">English (US)</option>
        </select>
        <p className="muted small">Mudará textos da interface.</p>
      </div>
    </div>
  );
  
  const renderFeedbackSection = () => (
    <div className="section-content">
      <div className="settings-card">
        <textarea
          rows="4"
          placeholder="Nos conte sua sugestão, problema ou elogio..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        />
        <button className="btn small primary" onClick={handleSendFeedback}>Enviar Feedback</button>
      </div>
    </div>
  );

  const renderDangerZone = () => (
    <div className="section-content">
      <div className="settings-card danger-zone">
        <h4><FiTrash2 /> Zona de Perigo</h4>
        <p className="muted small">Excluir sua conta apagará todos os seus dados permanentemente. Essa ação é irreversível.</p>
        <button className="btn tiny danger" onClick={handleDeleteAccount}>Excluir Conta</button>
      </div>
    </div>
  );

  // Mapeamento para renderizar a seção correta
  const renderSection = () => {
    switch (activeSection) {
      case 'profile': return renderProfileSection();
      case 'security': return renderSecuritySection();
      case 'appearance': return renderAppearanceSection();
      case 'language': return renderLanguageSection();
      case 'feedback': return renderFeedbackSection();
      case 'danger': return renderDangerZone();
      default: return renderProfileSection();
    }
  };

  return (
    <div className="settings-root">

      <main className="settings-main container">
        <div className="settings-header">
            <h2 className="settings-title">Configurações</h2>
            <p className="muted">Gerencie informações pessoais, privacidade, idioma e preferências de tema.</p>
        </div>

        <div className="settings-layout">
          {/* Coluna 1: Navegação (Menu Lateral) */}
          <nav className="settings-nav">
            {settingsSections.map(section => (
              <button
                key={section.id}
                className={`nav-item ${activeSection === section.id ? 'active' : ''} ${section.isDanger ? 'danger' : ''}`}
                onClick={() => setActiveSection(section.id)}
              >
                <section.icon className="nav-icon" />
                <span className="nav-label">{section.label}</span>
                <FiChevronRight className="nav-arrow" />
              </button>
            ))}
          </nav>

          {/* Coluna 2: Conteúdo da Seção Ativa */}
          <section className="settings-content">
            {/* Título dinâmico para telas pequenas ou como referência */}
            <h3 className="content-title">
              {settingsSections.find(s => s.id === activeSection)?.icon({ size: 20 })}
              {settingsSections.find(s => s.id === activeSection)?.label}
            </h3>
            {renderSection()}
          </section>
        </div>
      </main>

      <FooterContent />
    </div>
  );
}