import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FiUser, FiMail, FiSave, FiBriefcase, FiShield, 
  FiActivity, FiFileText, FiMessageSquare, FiCpu, 
  FiStar
} from "react-icons/fi";
import api from "../services/api";
import FooterContent from "../components/FooterComponent";
import "../styles/profile.css";

function Conta({ user, setUser, handleSave, saving }) {
  return (
    <form onSubmit={handleSave} className="profile-form">
      <div className="form-group">
        <label>Nome Completo</label>
        <input 
          type="text" 
          value={user.name} 
          onChange={e => setUser({ ...user, name: e.target.value })}
          className="profile-input"
        />
      </div>

      <div className="form-group">
        <label>E-mail</label>
        <input 
          type="email" 
          value={user.email} 
          disabled 
          className="profile-input disabled"
        />
      </div>

      <div className="form-group highlight-group">
        <label>
          <FiBriefcase /> Contexto para a IA
        </label>

        <textarea 
          rows="5"
          value={user.extra_data} 
          onChange={e => setUser({ ...user, extra_data: e.target.value })}
          className="profile-textarea"
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn outline" disabled={saving}>
          {saving ? "Salvando..." : <><FiSave /> Salvar Alterações</>}
        </button>
      </div>
    </form>
  );
}

function Chats() {
  return <h2>Lista de chats</h2>;
}

function Avaliações() {
  return <h2>Avaliações</h2>;
}

function Contratos() {
  return <h2>Contratos</h2>;
}

const sections = {
  conta: Conta,
  chats: Chats,
  contratos: Contratos,
  avaliacoes: Avaliações
};

export default function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [section, setSection] = useState("conta");
  const SectionComponent = sections[section];
  
  const [user, setUser] = useState({
    id: null,
    name: "",
    email: "",
    extra_data: "", // Contexto para a IA
    is_admin: false
  });

  // Estado das Estatísticas (KPIs)
  const [stats, setStats] = useState({
    chats: 0,
    messages: 0,
    risks: 0
  });

  // Carregar dados ao montar
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const localUser = JSON.parse(localStorage.getItem("user"));
      if (localUser && localUser.id) {
        // 1. Busca dados frescos da API
        const freshUser = await api.request(`/users/${localUser.id}`, "GET");
        
        // 2. Busca estatísticas do dashboard para popular os cards
        const dashData = await api.getDashboardStats();

        setUser({
          ...freshUser,
          extra_data: freshUser.extra_data || ""
        });

        setStats({
          chats: dashData.kpis?.active_cases || 0,
          messages: dashData.kpis?.docs_analyzed || 0,
          risks: dashData.kpis?.risks_avoided || 0
        });
      }
    } catch (err) {
      console.error("Erro ao carregar perfil:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await api.updateUser(user.id, {
        name: user.name,
        extra_data: user.extra_data
      });

      // Atualiza localStorage e estado
      const currentUser = JSON.parse(localStorage.getItem("user"));
      localStorage.setItem("user", JSON.stringify({ ...currentUser, ...updated }));
      
      setUser(prev => ({ ...prev, ...updated }));
      alert("Perfil atualizado com sucesso!");
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar alterações.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="profile-loading">Carregando perfil...</div>;

  return (
    <div className="landing-root profile-root">
      <main className="container profile-main">
        
        <header className="profile-header-card">
          <div className="profile-avatar-large">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="profile-header-info">
            <h1 className="profile-name">{user.name}</h1>
            <div className="profile-badges">
              <span className="profile-badge">
                {user.is_admin ? <><FiShield /> Administrador</> : <><FiUser /> Membro</>}
              </span>
              <span className="profile-email"><FiMail /> {user.email}</span>
            </div>
          </div>
        </header>

        <div className="profile-grid">
          
          <section className="profile-col-main">

            <div className="profile-card">

            <div className="card-header">
              <button 
                className={`btn ${section === 'conta' ? 'active' : ''}`}
                onClick={() => setSection("conta")}
              >
                <FiUser /> Conta
              </button>

              <button 
                className={`btn ${section === 'chats' ? 'active' : ''}`}
                onClick={() => setSection("chats")}
              >
                <FiMessageSquare /> Chats
              </button>

              <button 
                className={`btn ${section === 'contratos' ? 'active' : ''}`}
                onClick={() => setSection("contratos")}
              >
                <FiFileText /> Contratos
              </button>

              <button 
                className={`btn ${section === 'avaliacoes' ? 'active' : ''}`}
                onClick={() => setSection("avaliacoes")}
              >
                <FiStar /> Avaliações
              </button>
            </div>

            <div className="profile-section-content">
              <SectionComponent 
                user={user}
                setUser={setUser}
                handleSave={handleSave}
                saving={saving}
              />
            </div>
            </div>
          </section>


          <section className="profile-col-side">
            <div className="profile-card stats-card">
              <h3><FiActivity /> Sua Atividade</h3>
              <div className="stats-list">
                <div className="stat-item">
                  <div className="stat-icon blue"><FiMessageSquare /></div>
                  <div className="stat-data">
                    <strong>{stats.chats}</strong>
                    <span>Conversas</span>
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-icon green"><FiFileText /></div>
                  <div className="stat-data">
                    <strong>{stats.messages}</strong>
                    <span>Mensagens Analisadas</span>
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-icon orange"><FiShield /></div>
                  <div className="stat-data">
                    <strong>{stats.risks}</strong>
                    <span>Alertas de Risco</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="profile-card info-card">
              <h4><FiCpu /> Sentry AI</h4>
              <p className="muted small">
                Seus dados são processados de forma segura para gerar insights jurídicos.
                Para configurações de privacidade ou senha, acesse as configurações.
              </p>
              <button 
                className="btn tiny outline full-width" 
                onClick={() => navigate('/app/settings')}
              >
                Ir para Configurações
              </button>
            </div>
          </section>

        </div>
      </main>
      <FooterContent />
    </div>
  );
}