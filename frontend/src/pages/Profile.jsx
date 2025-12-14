import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FiUser, FiMail, FiSave, FiBriefcase, FiShield, 
  FiActivity, FiFileText, FiMessageSquare, FiCpu, 
  FiStar
} from "react-icons/fi";
import api from "../services/api";
import FooterContent from "../components/FooterComponent";
import toast from "react-hot-toast";
import "../styles/profile.css";


function groupByTime(grouping) {
  const now = new Date();

  const groups = {
    hoje: [],
    ontem: [],
    semana: [],
    mes: [],
    ano: [],
    antigo: []
  };

  grouping.forEach(grouping => {
    const created = new Date(grouping.created_at);

    const diffMs = now - created;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    const sameDay =
      now.toDateString() === created.toDateString();

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    if (sameDay) {
      groups.hoje.push(grouping);
    } 
    else if (created.toDateString() === yesterday.toDateString()) {
      groups.ontem.push(grouping);
    } 
    else if (diffDays < 7) {
      groups.semana.push(grouping);
    } 
    else if (
      created.getMonth() === now.getMonth() &&
      created.getFullYear() === now.getFullYear()
    ) {
      groups.mes.push(grouping);
    } 
    else if (created.getFullYear() === now.getFullYear()) {
      groups.ano.push(grouping);
    } 
    else {
      groups.antigo.push(grouping);
    }
  });

  return groups;
}

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

function Chats({ chats }) {
  const [previews, setPreviews] = React.useState({});

  React.useEffect(() => {
    async function loadPreviews() {
      const result = {};

      for (const chat of chats) {
        try {
          const messages = await api.request(
            `/messages/chat/${chat.id}`,
            "GET"
          );

          result[chat.id] =
            messages.length > 0
              ? messages.at(-1).content.slice(0, 100) + "..."
              : "Sem mensagens";
        } catch {
          result[chat.id] = "Erro ao carregar mensagens";
        }
      }

      setPreviews(result);
    }

    if (chats.length > 0) loadPreviews();
  }, [chats]);

  if (!chats.length) return <p>Nenhum chat encontrado.</p>;

  const grouped = groupByTime(chats);

  function renderGroup(title, list) {
    if (!list.length) return null;

    return (
      <>
        <h4 className="chat-group-title">{title}</h4>
        <a className="stats-list" href="">
          {list.map(chat => (
            <div key={chat.id} className="stat-item">
              <div className="stat-icon blue">
                <FiMessageSquare />
              </div>
              <div className="stat-data">
                <strong>{chat.name || "Chat sem nome"}</strong>
                <span>{previews[chat.id] || "Carregando..."}</span>
                <span>
                  {new Date(chat.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          ))}
        </a>
      </>
    );
  }

  return (
    <div className="chat-groups">
      {renderGroup("Hoje: ", grouped.hoje)}
      {renderGroup("Ontem: ", grouped.ontem)}
      {renderGroup("Esta semana: ", grouped.semana)}
      {renderGroup("Este mês: ", grouped.mes)}
      {renderGroup("Este ano: ", grouped.ano)}
      {renderGroup("Há muito tempo: ", grouped.antigo)}
    </div>
  );
}

function Avaliações() {
  return (
    <div>
      <h2>Avaliações</h2>
      <p>Sinto muito, mas ainda não é possível realizar avaliações, então esta sessão não faria sentido :p</p>
      <p> Quando o recurso for adicionado ao frontend, liberaremos esta página!</p>
    </div>
  );
}

function Contratos({ contracts }) {
  const navigate = useNavigate();
  
  if (!contracts.length) return <p>Nenhum contrato analisado encontrado.</p>;

  const grouped = groupByTime(contracts);

  function renderGroup(title, list) {
    if (!list.length) return null;

    return (
      <>
        <h4 className="chat-group-title">{title}</h4>
        <div className="stats-list">
          {list.map(contract => (
            <div 
              key={contract.id} 
              className="stat-item clickable"
              // Assumindo que você tem uma rota para visualizar um contrato específico
              onClick={() => navigate(`/app/contract/${contract.id}`)} 
            >
              <div className="stat-icon green">
                <FiFileText />
              </div>
              <div className="stat-data">
                {/* O nome do contrato pode vir do backend, mas o pedido foi por um strong fixo */}
                <strong>{contract.name || "Análise de Contrato"}</strong>
                {/* A data é o span principal */}
                <span>
                  Criado em: {new Date(contract.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  return (
    <div className="chat-groups">
      {renderGroup("Hoje: ", grouped.hoje)}
      {renderGroup("Ontem: ", grouped.ontem)}
      {renderGroup("Esta semana: ", grouped.semana)}
      {renderGroup("Este mês: ", grouped.mes)}
      {renderGroup("Este ano: ", grouped.ano)}
      {renderGroup("Há muito tempo: ", grouped.antigo)}
    </div>
  );
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

  const [chats, setChats] = useState([]);
  const [contracts, setContracts] = useState([]);

  // Estado das Estatísticas (KPIs)
  const [stats, setStats] = useState({
    chats: 0,
    messages: 0,
    risks: 0
  });

  // Carregar dados ao montar
  useEffect(() => {
    loadAccountData();
    loadChatData();
    loadContractData();
  }, []);

  async function loadAccountData() {
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

  async function loadChatData()
  {
    setLoading(true);
    const token = localStorage.getItem("token");
    const localUser = JSON.parse(localStorage.getItem("user"));

    try 
    {
      const freshChats = await api.request(`/chats/user/${localUser.id}`, "GET", null, token);
      setChats(freshChats);
    }
    catch (err)
    {
      console.error("Erro ao carregar chats:", err);
    }
    finally
    {
      setLoading(false);
    }
  }

  async function loadContractData()
  {
    setLoading(true);
    const token = localStorage.getItem("token");
    const localUser = JSON.parse(localStorage.getItem("user"));

    try 
    {
      const freshContracts = await api.request(`/contract/user/${localUser.id}`, "GET", null, token);
      setContracts(freshContracts);
    }
    catch (err)
    {
      console.error("Erro ao carregar contratos:", err);
    }
    finally
    {
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

      const currentUser = JSON.parse(localStorage.getItem("user"));
      localStorage.setItem(
        "user",
        JSON.stringify({ ...currentUser, ...updated })
      );

      setUser(prev => ({ ...prev, ...updated }));

      toast.success("Perfil atualizado com sucesso!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar alterações.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="profile-loading">Carregando perfil...</div>;

  console.log("Contratos carregados:", contracts);

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
                chats={chats}
                contracts={contracts}
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