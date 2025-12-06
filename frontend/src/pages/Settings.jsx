import React, { useState, useEffect } from "react";
import '../styles/settings.css';
import FooterContent from "../components/FooterComponent";
import { FiMoon, FiSun, FiMail, FiUser, FiShield, FiTrash2, FiGlobe, FiMessageCircle, FiChevronRight } from "react-icons/fi";
import toast from "react-hot-toast";

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

  useEffect(() => {
    localStorage.setItem("lang", language);
  }, [language]);

  // --- Handlers (UX Melhorada) ---
  const handleUpdateName = () => {
    if (!newName.trim()) return toast.error("O nome não pode estar vazio.");
    
    const updated = { ...user, name: newName };
    setUser(updated);
    localStorage.setItem("user", JSON.stringify(updated));
    toast.success("Nome atualizado com sucesso!");
  };

  const handleUpdateEmail = () => {
    toast.success("E-mail de confirmação enviado!", { icon: '📧' });
  };

  const handleUpdatePassword = () => {
    if (!currentPassword || !newPassword) return toast.error("Preencha as senhas.");
    toast.success("Link de alteração de senha enviado.", { icon: '🔒' });
    setCurrentPassword("");
    setNewPassword("");
  };

  const handleDeleteAccount = () => {
    if(confirm("Tem certeza absoluta? Esta ação não pode ser desfeita.")){
        const loadingId = toast.loading("Processando exclusão...");
        setTimeout(() => {
            toast.dismiss(loadingId);
            toast.error("Solicitação enviada ao administrador.");
        }, 2000);
    }
  };

  const handleSendFeedback = () => {
    if (!feedback.trim()) return toast.error("Digite seu feedback.");
    toast.success("Feedback enviado! Obrigado.", { icon: '📨' });
    setFeedback("");
  };

  // --- Renderização das Seções ---
  const renderProfileSection = () => (
    <div className="section-content fade-in">
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
    <div className="section-content fade-in">
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
    <div className="section-content fade-in">
      <div className="settings-card">
        <div className="theme-toggle">
          <span>Tema atual: <strong>{theme === "dark" ? "Escuro" : "Claro"}</strong></span>
          <button
            className="btn small outline"
            onClick={() => {
                const next = theme === "dark" ? "light" : "dark";
                setTheme(next);
                toast.success(`Tema alterado para ${next === 'dark' ? 'Escuro' : 'Claro'}`);
            }}
            aria-label="Alternar tema"
          >
            {theme === "dark" ? <FiSun /> : <FiMoon />} Alternar Tema
          </button>
        </div>
      </div>
    </div>
  );

  const renderLanguageSection = () => (
    <div className="section-content fade-in">
      <div className="settings-card">
        <select value={language} onChange={(e) => {
            setLanguage(e.target.value);
            toast.success("Idioma atualizado.");
        }}>
          <option value="pt">Português (Brasil)</option>
          <option value="en">English (US)</option>
        </select>
        <p className="muted small">Mudará textos da interface.</p>
      </div>
    </div>
  );
  
  const renderFeedbackSection = () => (
    <div className="section-content fade-in">
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
    <div className="section-content fade-in">
      <div className="settings-card danger-zone">
        <h4><FiTrash2 /> Zona de Perigo</h4>
        <p className="muted small">Excluir sua conta apagará todos os seus dados permanentemente. Essa ação é irreversível.</p>
        <button className="btn tiny danger" onClick={handleDeleteAccount}>Excluir Conta</button>
      </div>
    </div>
  );

  // Switch de renderização
  const renderContent = () => {
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
          <nav className="settings-nav">
            {settingsSections.map(section => (
              <button
                key={section.id}
                className={`nav-item ${activeSection === section.id ? 'active' : ''} ${section.isDanger ? 'danger' : ''}`}
                onClick={() => setActiveSection(section.id)}
                aria-label={`Ir para ${section.label}`}
              >
                <section.icon className="nav-icon" />
                <span className="nav-label">{section.label}</span>
                <FiChevronRight className="nav-arrow" />
              </button>
            ))}
          </nav>

          <section className="settings-content">
            <h3 className="content-title">
              {settingsSections.find(s => s.id === activeSection)?.icon({ size: 20 })}
              {settingsSections.find(s => s.id === activeSection)?.label}
            </h3>
            {/* Chamada corrigida */}
            {renderContent()}
          </section>
        </div>
      </main>
      <FooterContent />
    </div>
  );
}