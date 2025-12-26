import React, { useEffect, useState } from 'react';
import { FiSearch, FiShield, FiUserX, FiCheckCircle, FiActivity, FiLock, FiInbox, FiX, FiCheck, FiRefreshCw } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion'; // Importação do Framer Motion
import api from '../services/api';
import '../styles/admin.css';
import toast from 'react-hot-toast';

// Variantes de animação
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05 // Efeito cascata para as linhas da tabela
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 25 } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
};

export default function AdminPanel() {
  const [tab, setTab] = useState("users"); // 'users' ou 'appeals'
  const [users, setUsers] = useState([]);
  const [appeals, setAppeals] = useState([]); // Lista de recursos
  
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionType, setActionType] = useState("");
  const [banReason, setBanReason] = useState("");

  useEffect(() => {
    if (tab === "users") fetchUsers();
    else fetchAppeals();
  }, [search, tab]);

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await api.request(`/admin/users?search=${search}`, "GET");
      setUsers(res || []);
    } catch (err) {
      toast.error("Erro ao carregar usuários.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchAppeals() {
    setLoading(true);
    try {
      const res = await api.getAppeals();
      console.log("Recursos recebidos do backend:", res);
      setAppeals(res || []);
    } catch (err) {
      console.error("Erro ao buscar recursos:", err);
      toast.error("Erro ao carregar recursos.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAnalyze(id) {
    const toastId = toast.loading("IA analisando...");
    try {
      const res = await api.request(`/admin/analyze/${id}`, "POST");
      toast.success(`Risco: ${res.score}/100`, { id: toastId });
      fetchUsers();
    } catch (err) {
      toast.error("Falha na análise.", { id: toastId });
    }
  }

  async function handleBan(id, duration = null) {
    if (!banReason.trim()) return toast.error("Motivo obrigatório.");
    try {
      await api.request(`/admin/ban/${id}`, "POST", { duration, reason: banReason });
      toast.success("Usuário banido.");
      closeModal();
      fetchUsers();
    } catch (err) {
      toast.error(err?.body?.error || "Erro ao banir.");
    }
  }

  async function handleUnban(id) {
    if(!confirm("Remover banimento?")) return;
    try {
      await api.request(`/admin/unban/${id}`, "POST");
      toast.success("Usuário desbanido.");
      fetchUsers();
    } catch (err) {
      toast.error("Erro ao desbanir.");
    }
  }

  async function handleResolveAppeal(userId, action) {
      if(!confirm(action === 'approve' ? "Aceitar recurso e desbanir?" : "Rejeitar recurso e manter banimento?")) return;
      
      const toastId = toast.loading("Processando...");
      try {
          await api.resolveAppeal(userId, action);
          toast.success(action === 'approve' ? "Recurso aceito." : "Recurso negado.", { id: toastId });
          fetchAppeals(); 
      } catch (err) {
          toast.error("Erro ao processar.", { id: toastId });
      }
  }

  function closeModal() {
      setSelectedUser(null);
      setBanReason("");
  }

  const RiskBadge = ({ score }) => {
    const displayScore = score ?? 0;
    let type = 'safe';
    if (displayScore > 75) type = 'danger';
    else if (displayScore > 30) type = 'warning';
    return <div className={`badge-risk ${type}`}>{displayScore}%</div>;
  };

  return (
    <div className="admin-root">
      <header className="admin-header">
        <div>
          <h1><FiShield /> Painel Administrativo</h1>
          <div style={{display:'flex', gap: 15, marginTop: 15}}>
              <motion.button 
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className={`btn tiny ${tab === 'users' ? 'primary' : 'outline'}`}
                onClick={() => setTab('users')}
              >
                  Gerenciar Usuários
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className={`btn tiny ${tab === 'appeals' ? 'primary' : 'outline'}`}
                onClick={() => setTab('appeals')}
              >
                  <FiInbox /> Recursos Pendentes
              </motion.button>
          </div>
        </div>
      </header>

      <div className="admin-table-container">
        
        <AnimatePresence mode="wait">
        {tab === "users" && (
            <motion.div
                key="users-tab"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
            >
                <div className="admin-toolbar">
                  <div className="search-box">
                    <FiSearch className="search-icon" />
                    <input className="admin-search" placeholder="Buscar usuário..." value={search} onChange={e => setSearch(e.target.value)} />
                  </div>
                  <div style={{marginLeft:'auto'}}><span className="muted small">{users.length} usuários</span></div>
                </div>

                {loading ? <div style={{padding:20}}>Carregando...</div> : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Usuário</th>
                        <th>Status</th>
                        <th>Risco</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <motion.tbody
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                      {users.map(u => (
                        <motion.tr key={u.id} variants={itemVariants}>
                          <td>
                            <div style={{fontWeight:'600', color: '#fff'}}>{u.name}</div>
                            <div className="muted small" style={{fontSize: '0.8rem'}}>{u.email}</div>
                            {u.is_admin && <span style={{fontSize:'0.7rem', background:'#27272a', padding:'2px 6px', borderRadius:4}}>ADMIN</span>}
                          </td>
                          <td>
                            {u.is_banned ? 
                                <span style={{color: '#ef4444'}}>Banido</span> : 
                                <span style={{color: '#34d399'}}>Ativo</span>
                            }
                          </td>
                          <td><RiskBadge score={u.risk_profile?.score} /></td>
                          <td>
                            <div className="actions-cell">
                              <button className="btn tiny outline" onClick={() => handleAnalyze(u.id)} title="Analisar IA"><FiActivity /></button>
                              {u.is_banned ? (
                                <button className="btn tiny primary" onClick={() => handleUnban(u.id)} title="Desbanir"><FiCheckCircle /> Desbanir</button>
                              ) : (
                                <button 
                                  className="btn tiny danger" 
                                  disabled={u.is_admin} 
                                  style={u.is_admin ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                                  onClick={() => { if(!u.is_admin) { setSelectedUser(u); setActionType('ban'); } }}
                                  title="Banir"
                                >
                                  {u.is_admin ? <FiLock /> : <FiUserX />} {u.is_admin ? "Protegido" : "Banir"}
                                </button>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </motion.tbody>
                  </table>
                )}
            </motion.div>
        )}

        {/* TAB RECURSOS */}
        {tab === "appeals" && (
            <motion.div
                key="appeals-tab"
                style={{padding: 0}}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
            >
                <div className="admin-toolbar" style={{borderBottom: '1px solid #27272a', justifyContent: 'flex-end'}}>
                    <button className="btn tiny outline" onClick={fetchAppeals} disabled={loading}>
                        <FiRefreshCw className={loading ? 'spin' : ''} /> Atualizar Lista
                    </button>
                </div>

                {loading ? <div style={{padding:20}}>Carregando...</div> : (
                    appeals.length === 0 ? 
                    <div style={{padding:40, textAlign:'center', color:'#71717a'}}>
                        <p>Nenhum recurso pendente de outros administradores.</p>
                        <small>Nota: Você não pode julgar recursos de usuários que você mesmo baniu.</small>
                    </div> :
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Usuário Banido</th>
                                <th>Motivo do Banimento</th>
                                <th>Defesa do Usuário</th>
                                <th>Decisão</th>
                            </tr>
                        </thead>
                        <motion.tbody
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {appeals.map(a => (
                                <motion.tr key={a.user_id} variants={itemVariants}>
                                    <td>
                                        <div style={{fontWeight:'600', color: '#fff'}}>{a.user_name}</div>
                                        <div className="muted small">{a.user_email}</div>
                                    </td>
                                    <td style={{maxWidth: 200, color: '#ef4444'}}>{a.ban_reason}</td>
                                    <td style={{maxWidth: 300}}>
                                        <div style={{background: 'rgba(255,255,255,0.05)', padding: 10, borderRadius: 6, fontSize: 13}}>
                                            <em>"{a.appeal?.message}"</em>
                                            <div style={{fontSize: 10, marginTop: 5, opacity: 0.6}}>{a.appeal?.date ? new Date(a.appeal.date).toLocaleString() : 'Data N/A'}</div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="actions-cell">
                                            <button className="btn tiny primary" onClick={() => handleResolveAppeal(a.user_id, 'approve')} title="Aceitar Recurso">
                                                <FiCheck /> Aceitar
                                            </button>
                                            <button className="btn tiny danger" onClick={() => handleResolveAppeal(a.user_id, 'reject')} title="Rejeitar Recurso">
                                                <FiX /> Rejeitar
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </motion.tbody>
                    </table>
                )}
            </motion.div>
        )}
        </AnimatePresence>

      </div>

      {/* MODAL DE BANIMENTO ANIMADO */}
      <AnimatePresence>
      {selectedUser && actionType === 'ban' && (
        <>
          <motion.div 
            className="modal-overlay" 
            onClick={closeModal} 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div 
            className="admin-modal"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <h3 style={{color:'#fff', marginBottom:10}}>Banir {selectedUser.name}</h3>
            <div style={{marginBottom: 15}}>
                <label style={{fontSize:'12px', color:'#a1a1aa', display:'block', marginBottom:5}}>Motivo (Obrigatório)</label>
                <textarea 
                    className="admin-search"
                    style={{width: '100%', minHeight: '80px', resize: 'vertical'}}
                    placeholder="Descreva o motivo..."
                    value={banReason}
                    onChange={e => setBanReason(e.target.value)}
                />
            </div>
            <div style={{display:'flex', flexDirection:'column', gap: 10}}>
              <button className="btn outline" onClick={() => handleBan(selectedUser.id, 24)}>24 Horas</button>
              <button className="btn outline" onClick={() => handleBan(selectedUser.id, 168)}>7 Dias</button>
              <button className="btn danger" onClick={() => handleBan(selectedUser.id, null)}>Banir Permanentemente</button>
              <button className="btn ghost" onClick={closeModal}>Cancelar</button>
            </div>
          </motion.div>
        </>
      )}
      </AnimatePresence>
    </div>
  );
}