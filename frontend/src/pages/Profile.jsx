import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  FiUser, FiMail, FiSave, FiBriefcase, FiShield, 
  FiActivity, FiFileText, FiMessageSquare, FiCpu, 
  FiStar
} from "react-icons/fi";
import { motion, AnimatePresence, color } from "framer-motion";
import api from "../services/api";
import FooterContent from "../components/FooterComponent";
import toast from "react-hot-toast";
import "../styles/profile.css";

// --- Variantes de Animação ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
};

const tabContentVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
};

// --- Funções Utilitárias ---
function groupByTime(grouping) {
  const now = new Date();
  const groups = { hoje: [], ontem: [], semana: [], mes: [], ano: [], antigo: [] };

  grouping.forEach(item => {
    const created = new Date(item.created_at);
    const diffMs = now - created;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const sameDay = now.toDateString() === created.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    if (sameDay) groups.hoje.push(item);
    else if (created.toDateString() === yesterday.toDateString()) groups.ontem.push(item);
    else if (diffDays < 7) groups.semana.push(item);
    else if (created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()) groups.mes.push(item);
    else if (created.getFullYear() === now.getFullYear()) groups.ano.push(item);
    else groups.antigo.push(item);
  });
  return groups;
}

// --- Sub-componentes das Abas ---
function Conta({ user, setUser, handleSave, saving }) {
  return (
    <motion.form onSubmit={handleSave} className="profile-form" variants={tabContentVariants} initial="hidden" animate="visible" exit="exit">
      <div className="form-group">
        <label>Nome Completo</label>
        <input type="text" value={user.name} onChange={e => setUser({ ...user, name: e.target.value })} className="profile-input" />
      </div>
      <div className="form-group">
        <label>E-mail</label>
        <input type="email" value={user.email} disabled className="profile-input disabled" />
      </div>
      <div className="form-group highlight-group">
        <label><FiBriefcase /> Contexto para a IA</label>
        <textarea rows="5" value={user.extra_data} onChange={e => setUser({ ...user, extra_data: e.target.value })} className="profile-textarea" />
      </div>
      <div className="form-actions">
        <motion.button type="submit" className="btn outline" disabled={saving} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          {saving ? "Salvando..." : <><FiSave /> Salvar Alterações</>}
        </motion.button>
      </div>
    </motion.form>
  );
}

function Chats({ chats }) {
  const [previews, setPreviews] = useState({});

  useEffect(() => {
    async function loadPreviews() {
      const result = {};
      for (const chat of chats) {
        try {
          const messages = await api.request(`/messages/chat/${chat.id}`, "GET");
          result[chat.id] = messages.length > 0 ? messages.at(-1).content.slice(0, 100) + "..." : "Sem mensagens";
        } catch { result[chat.id] = "Erro ao carregar mensagens"; }
      }
      setPreviews(result);
    }
    if (chats.length > 0) loadPreviews();
  }, [chats]);

  if (!chats.length) return <motion.p variants={tabContentVariants}>Nenhum chat encontrado.</motion.p>;
  const grouped = groupByTime(chats);

  const renderGroup = (title, list) => {
    if (!list.length) return null;
    return (
      <div key={title}>
        <h4 className="chat-group-title">{title}</h4>
        <div className="stats-list">
          {list.map(chat => (
            <motion.a key={chat.id} className="stat-item" href={`/chat/${chat.id}`} whileHover={{ x: 5, backgroundColor: "rgba(255,255,255,0.03)" }}>
              <div className="stat-icon blue"><FiMessageSquare /></div>
              <div className="stat-data">
                <strong>{chat.name || "Chat sem nome"}</strong>
                <span>{previews[chat.id] || "Carregando..."}</span>
                <span>{new Date(chat.created_at).toLocaleDateString('pt-BR')}</span>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    );
  };

  return (
    <motion.div className="chat-groups" variants={tabContentVariants} initial="hidden" animate="visible" exit="exit">
      {Object.entries(grouped).map(([key, list]) => renderGroup(key.charAt(0).toUpperCase() + key.slice(1), list))}
    </motion.div>
  );
}

function Contratos({ contracts }) {
  const navigate = useNavigate();
  if (!contracts.length) return <motion.p variants={tabContentVariants}>Nenhum contrato encontrado.</motion.p>;
  const grouped = groupByTime(contracts);

  const renderGroup = (title, list) => {
    if (!list.length) return null;
    return (
      <div key={title}>
        <h4 className="chat-group-title">{title}</h4>
        <div className="stats-list">
          {list.map(contract => (
            <motion.div key={contract.id} className="stat-item clickable" onClick={() => navigate(`/app/contract/${contract.id}`)} whileHover={{ x: 5, backgroundColor: "rgba(255,255,255,0.03)" }} whileTap={{ scale: 0.98 }}>
              <div className="stat-icon green"><FiFileText /></div>
              <div className="stat-data">
                <strong>{contract.name || "Análise de Contrato"}</strong>
                <span>Criado em: {new Date(contract.created_at).toLocaleDateString('pt-BR')}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <motion.div className="chat-groups" variants={tabContentVariants} initial="hidden" animate="visible" exit="exit">
      {Object.entries(grouped).map(([key, list]) => renderGroup(key.charAt(0).toUpperCase() + key.slice(1), list))}
    </motion.div>
  );
}

function Avaliacoes() {
  return (
    <motion.div variants={tabContentVariants} initial="hidden" animate="visible" exit="exit">
      <h2>Avaliações</h2>
      <p>Sessão ainda em desenvolvimento. Em breve você poderá ver o histórico de feedbacks aqui!</p>
    </motion.div>
  );
}

const sections = { conta: Conta, chats: Chats, contratos: Contratos, avaliacoes: Avaliacoes };

// --- Componente Principal ---
export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [forbidden, setForbidden] = useState(false);
  const [section, setSection] = useState("conta");
  const SectionComponent = sections[section];

  const [chats, setChats] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [user, setUser] = useState({
    id: null, name: "", email: "", extra_data: "", is_admin: false, status: "Active", risk_profile: { score: 0 }
  });
  const [stats, setStats] = useState({ chats: 0, messages: 0, risks: 0 });

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  async function fetchData() {
    setLoading(true);
    const token = localStorage.getItem("token");
    const localUser = JSON.parse(localStorage.getItem("user") || "{}");

    // Validação de Permissão (Frontend)
    if (String(localUser.id) !== String(id) && !localUser.is_admin) {
      setForbidden(true);
      setLoading(false);
      return;
    }

    try {
      const [freshUser, dashData, freshChats, freshContracts] = await Promise.all([
        api.request(`/users/${id}`, "GET", null, token),
        api.getDashboardStats(id),
        api.request(`/chats/user/${id}`, "GET", null, token),
        api.request(`/contract/user/${id}`, "GET", null, token)
      ]);

      setUser({ ...freshUser, extra_data: freshUser.extra_data || "" });
      setStats({
        chats: dashData.kpis?.active_cases || 0,
        messages: dashData.kpis?.docs_analyzed || 0,
        risks: dashData.kpis?.risks_avoided || 0
      });
      setChats(freshChats);
      setContracts(freshContracts);
      setForbidden(false);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      if (err.status === 403) setForbidden(true);
      else toast.error("Falha ao carregar perfil.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await api.updateUser(user.id, { name: user.name, extra_data: user.extra_data });
      
      // Atualiza localstorage apenas se estiver editando o próprio perfil
      const localUser = JSON.parse(localStorage.getItem("user") || "{}");
      if (String(localUser.id) === String(user.id)) {
        localStorage.setItem("user", JSON.stringify({ ...localUser, ...updated }));
      }

      setUser(prev => ({ ...prev, ...updated }));
      toast.success("Perfil atualizado com sucesso!");
    } catch (err) {
      toast.error("Erro ao salvar alterações.");
    } finally {
      setSaving(false);
    }
  }

  if (forbidden) {
    return (
      <div 
      className="profile-loading forbidden-container"
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
      >
        <div style={{flexDirection: 'row', alignItems: 'center', display: 'flex'}}>
        <FiShield size={32} /> &nbsp;
        <h2>403 - Acesso Negado</h2>
        </div>
        <p>Você não tem permissão acessar esta página.</p>
        <div>&nbsp;</div>
        <button onClick={() => navigate('/app')} className="btn primary">Voltar ao Dashboard</button>
      </div>
    );
  }

  if (loading) return <div className="profile-loading">Carregando perfil...</div>; 

  return (
    <div className="landing-root profile-root">
      <motion.main className="container profile-main" initial="hidden" animate="visible" variants={containerVariants}>
        
        <motion.header className="profile-header-card" variants={itemVariants}>
          <div className="profile-avatar-large">{user.name?.charAt(0).toUpperCase()}</div>
          <div className="profile-header-info">
            <h1 className="profile-name">{user.name}</h1>
            <div className="profile-badges">
              <span className="profile-badge">
                {user.is_admin ? <><FiShield /> Administrador</> : <><FiUser /> Membro</>}
              </span>
              <span className="profile-email"><FiMail /> {user.email}</span>
              <span className={`profile-status status-${user.status?.toLowerCase() || 'active'}`}>{user.status}</span>
              <span>•</span>
              <span className={`profile-score score-${user.risk_profile?.score > 70 ? 'high' : user.risk_profile?.score > 40 ? 'medium' : 'low'}`}>
                Risco: {user.risk_profile?.score}%
              </span>
            </div>
          </div>
        </motion.header>

        <div className="profile-grid">
          <section className="profile-col-main">
            <motion.div className="profile-card" variants={itemVariants}>
              <div className="card-header">
                {['conta', 'chats', 'contratos', 'avaliacoes'].map((tab) => (
                  <button key={tab} className={`btn ${section === tab ? 'active' : ''}`} onClick={() => setSection(tab)}>
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
                  <SectionComponent key={section} user={user} setUser={setUser} handleSave={handleSave} saving={saving} chats={chats} contracts={contracts} />
                </AnimatePresence>
              </div>
            </motion.div>
          </section>

          <section className="profile-col-side">
            <motion.div className="profile-card stats-card" variants={itemVariants}>
              <h3><FiActivity /> Atividade do Usuário</h3>
              <div className="stats-list">
                <div className="stat-item"><div className="stat-icon blue"><FiMessageSquare /></div><div className="stat-data"><strong>{stats.chats}</strong><span>Conversas</span></div></div>
                <div className="stat-item"><div className="stat-icon green"><FiFileText /></div><div className="stat-data"><strong>{stats.messages}</strong><span>Mensagens</span></div></div>
                <div className="stat-item"><div className="stat-icon orange"><FiShield /></div><div className="stat-data"><strong>{stats.risks}</strong><span>Riscos Detectados</span></div></div>
              </div>
            </motion.div>

            <motion.div className="profile-card info-card" variants={itemVariants}>
              <h4><FiCpu /> Sentry AI Insight</h4>
              <p className="muted small">Dados processados sob protocolos de segurança criptografada.</p>
              <motion.button className="btn tiny outline full-width" onClick={() => navigate('/app/settings')} whileTap={{ scale: 0.95 }}>
                Configurações do Sistema
              </motion.button>
            </motion.div>
          </section>
        </div>
      </motion.main>
      <FooterContent />
    </div>
  );
}