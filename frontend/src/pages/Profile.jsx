import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FiUser, FiMail, FiSave, FiBriefcase, FiShield, 
  FiActivity, FiFileText, FiMessageSquare, FiCpu, 
  FiStar
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion"; // Importação do Framer Motion
import api from "../services/api";
import FooterContent from "../components/FooterComponent";
import toast from "react-hot-toast";
import "../styles/profile.css";

// Variantes de animação
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.1 } 
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 100, damping: 15 } 
  }
};

const tabContentVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
};

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
    <motion.form 
      onSubmit={handleSave} 
      className="profile-form"
      variants={tabContentVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
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
        <motion.button 
            type="submit" 
            className="btn outline" 
            disabled={saving}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
          {saving ? "Salvando..." : <><FiSave /> Salvar Alterações</>}
        </motion.button>
      </div>
    </motion.form>
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

  if (!chats.length) return <motion.p variants={tabContentVariants} initial="hidden" animate="visible">Nenhum chat encontrado.</motion.p>;

  const grouped = groupByTime(chats);

  function renderGroup(title, list) {
    if (!list.length) return null;

    return (
      <div key={title}>
        <h4 className="chat-group-title">{title}</h4>
        <div className="stats-list">
          {list.map(chat => (
            <motion.a 
                key={chat.id} 
                className="stat-item" 
                href="#"
                whileHover={{ x: 5, backgroundColor: "rgba(255,255,255,0.03)" }}
            >
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
            </motion.a>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div 
        className="chat-groups"
        variants={tabContentVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
    >
      {renderGroup("Hoje: ", grouped.hoje)}
      {renderGroup("Ontem: ", grouped.ontem)}
      {renderGroup("Esta semana: ", grouped.semana)}
      {renderGroup("Este mês: ", grouped.mes)}
      {renderGroup("Este ano: ", grouped.ano)}
      {renderGroup("Há muito tempo: ", grouped.antigo)}
    </motion.div>
  );
}

function Avaliações() {
  return (
    <motion.div
        variants={tabContentVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
    >
      <h2>Avaliações</h2>
      <p>Sinto muito, mas ainda não é possível realizar avaliações, então esta sessão não faria sentido :p</p>
      <p> Quando o recurso for adicionado ao frontend, liberaremos esta página!</p>
    </motion.div>
  );
}

function Contratos({ contracts }) {
  const navigate = useNavigate();
  
  if (!contracts.length) return <motion.p variants={tabContentVariants} initial="hidden" animate="visible">Nenhum contrato analisado encontrado.</motion.p>;

  const grouped = groupByTime(contracts);

  function renderGroup(title, list) {
    if (!list.length) return null;

    return (
      <div key={title}>
        <h4 className="chat-group-title">{title}</h4>
        <div className="stats-list">
          {list.map(contract => (
            <motion.div 
              key={contract.id} 
              className="stat-item clickable"
              onClick={() => navigate(`/app/contract/${contract.id}`)} 
              whileHover={{ x: 5, backgroundColor: "rgba(255,255,255,0.03)" }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="stat-icon green">
                <FiFileText />
              </div>
              <div className="stat-data">
                <strong>{contract.name || "Análise de Contrato"}</strong>
                <span>
                  Criado em: {new Date(contract.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div 
        className="chat-groups"
        variants={tabContentVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
    >
      {renderGroup("Hoje: ", grouped.hoje)}
      {renderGroup("Ontem: ", grouped.ontem)}
      {renderGroup("Esta semana: ", grouped.semana)}
      {renderGroup("Este mês: ", grouped.mes)}
      {renderGroup("Este ano: ", grouped.ano)}
      {renderGroup("Há muito tempo: ", grouped.antigo)}
    </motion.div>
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
  const [chats, setChats] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [user, setUser] = useState({
    id: null,
    name: "",
    email: "",
    extra_data: "",
    is_admin: false,
    status: "Undefined",
    risk_profile: { score: 0 }
  });
  const [stats, setStats] = useState({
    chats: 0,
    messages: 0,
    risks: 0
  });

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
        const freshUser = await api.request(`/users/${localUser.id}`, "GET");
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

  return (
    <div className="landing-root profile-root">
      <motion.main 
        className="container profile-main"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        
        <motion.header 
            className="profile-header-card"
            variants={itemVariants}
        >
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
              <span className={`profile-status status-${user.status.toLowerCase() || 'active'}`}>
                {user.status}
              </span>
              <span>•</span>
              <span className={`profile-score score-${user.risk_profile?.score > 70 ? 'high' : user.risk_profile?.score > 40 ? 'medium' : 'low'}`}>
                {user.risk_profile?.score}%
              </span>
            </div>
          </div>
        </motion.header>

        <div className="profile-grid">
          
          <section className="profile-col-main">

            <motion.div className="profile-card" variants={itemVariants}>

            <div className="card-header">
              {['conta', 'chats', 'contratos', 'avaliacoes'].map((tab) => (
                  <button 
                    key={tab}
                    className={`btn ${section === tab ? 'active' : ''}`}
                    onClick={() => setSection(tab)}
                  >
                    {tab === 'conta' && <FiUser />}
                    {tab === 'chats' && <FiMessageSquare />}
                    {tab === 'contratos' && <FiFileText />}
                    {tab === 'avaliacoes' && <FiStar />}
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
              ))}
            </div>

            <div className="profile-section-content">
              <AnimatePresence mode="wait">
                  <SectionComponent 
                    key={section} // A chave muda, forçando a remontagem e animação
                    user={user}
                    setUser={setUser}
                    handleSave={handleSave}
                    saving={saving}
                    chats={chats}
                    contracts={contracts}
                  />
              </AnimatePresence>
            </div>
            </motion.div>
          </section>


          <section className="profile-col-side">
            <motion.div className="profile-card stats-card" variants={itemVariants}>
              <h3><FiActivity /> Sua Atividade</h3>

              <div className="stats-list">

                <motion.div className="stat-item" whileHover={{ x: 3 }}>
                  <div className="stat-icon blue"><FiMessageSquare /></div>
                  <div className="stat-data">
                    <strong>{stats.chats}</strong>
                    <span>Conversas</span>
                  </div>
                </motion.div>

                <motion.div className="stat-item" whileHover={{ x: 3 }}>
                  <div className="stat-icon green"><FiFileText /></div>
                  <div className="stat-data">
                    <strong>{stats.messages}</strong>
                    <span>Mensagens Analisadas</span>
                  </div>
                </motion.div>

                <motion.div className="stat-item" whileHover={{ x: 3 }}>
                  <div className="stat-icon orange"><FiShield /></div>
                  <div className="stat-data">
                    <strong>{stats.risks}</strong>
                    <span>Alertas de Risco</span>
                  </div>
                </motion.div>
                
              </div>
            </motion.div>

            <motion.div className="profile-card info-card" variants={itemVariants}>
              <h4><FiCpu /> Sentry AI</h4>
              <p className="muted small">
                Seus dados são processados de forma segura para gerar insights jurídicos.
                Para configurações de privacidade ou senha, acesse as configurações.
              </p>
              <motion.button 
                className="btn tiny outline full-width" 
                onClick={() => navigate('/app/settings')}
                whileTap={{ scale: 0.95 }}
              >
                Ir para Configurações
              </motion.button>
            </motion.div>
          </section>

        </div>
      </motion.main>
      <FooterContent />
    </div>
  );
}