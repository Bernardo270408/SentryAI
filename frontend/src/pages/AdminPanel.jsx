import React, { useEffect, useState } from 'react';
import { FiSearch, FiShield, FiUserX, FiCheckCircle, FiActivity, FiLock } from 'react-icons/fi';
import api from '../services/api';
import '../styles/admin.css';
import toast from 'react-hot-toast';

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionType, setActionType] = useState("");

  useEffect(() => {
    fetchUsers();
  }, [search]);

  async function fetchUsers() {
    try {
      const res = await api.request(`/admin/users?search=${search}`, "GET");
      setUsers(res);
    } catch (err) {
      toast.error("Erro ao carregar usuários.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAnalyze(id) {
    const toastId = toast.loading("IA analisando comportamento...");
    try {
      const res = await api.request(`/admin/analyze/${id}`, "POST");
      toast.success(`Risco: ${res.score}/100`, { id: toastId });
      fetchUsers();
    } catch (err) {
      toast.error("Falha na análise.", { id: toastId });
    }
  }

  async function handleBan(id, duration = null) {
    try {
      await api.request(`/admin/ban/${id}`, "POST", { duration, reason: "Admin" });
      toast.success("Usuário banido.");
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      toast.error("Erro ao banir.");
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

  // Badge de Risco - Logica segura para evitar erros visuais com null
  const RiskBadge = ({ score, summary }) => {
    const displayScore = score !== null && score !== undefined ? score : 0;
    
    let type = 'safe';
    let label = 'SEGURO';
    
    if (displayScore > 75) { type = 'danger'; label = 'CRÍTICO'; }
    else if (displayScore > 30) { type = 'warning'; label = 'ATENÇÃO'; }

    return (
      <div title={summary || "Sem análise recente"} className={`badge-risk ${type}`}>
        {displayScore}% {label}
      </div>
    );
  };

  return (
    <div className="admin-root">
      {/* HEADER */}
      <header className="admin-header">
        <div>
          <h1><FiShield /> Painel de Segurança & Administração</h1>
          <p>Monitoramento de usuários e conformidade com IA.</p>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="admin-table-container">
        <div className="admin-toolbar">
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input 
              className="admin-search" 
              placeholder="Buscar usuário..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          
          <div style={{marginLeft:'auto'}}>
            <span className="muted small">{users.length} usuários</span>
          </div>
        </div>

        {loading ? <div style={{padding:20}}>Carregando...</div> : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Usuário</th>
                <th>Status</th>
                <th>Risco IA</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{fontWeight:'600', color: '#fff'}}>{u.name}</div>
                    <div className="muted small" style={{fontSize: '0.8rem', color:'#71717a'}}>{u.email}</div>
                    {/* Tag de Admin */}
                    {u.is_admin && <span style={{fontSize:'0.7rem', background:'#27272a', padding:'2px 6px', borderRadius:4, marginTop:4, display:'inline-block'}}>ADMIN</span>}
                  </td>
                  <td>
                    {u.is_banned ? (
                      <span style={{color: '#ef4444'}}><span className="status-dot banned-dot"/>Banido</span>
                    ) : (
                      <span style={{color: '#34d399'}}><span className="status-dot active-dot"/>Ativo</span>
                    )}
                  </td>
                  <td>
                    <RiskBadge score={u.risk_profile?.score} summary={u.risk_profile?.summary} />
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button 
                        className="btn tiny outline" 
                        onClick={() => handleAnalyze(u.id)}
                        title="Reanalisar IA"
                      >
                        <FiActivity />
                      </button>
                      
                      {u.is_banned ? (
                        <button className="btn tiny primary" onClick={() => handleUnban(u.id)}>
                          <FiCheckCircle /> Desbanir
                        </button>
                      ) : (
                        // BOTÃO DE BANIR COM PROTEÇÃO PARA ADMIN
                        <button 
                          className="btn tiny danger" 
                          disabled={u.is_admin} 
                          title={u.is_admin ? "Não é possível banir administradores" : "Banir usuário"}
                          style={u.is_admin ? { cursor: 'not-allowed', opacity: 0.5 } : {}}
                          onClick={() => { 
                            if(!u.is_admin) {
                                setSelectedUser(u); 
                                setActionType('ban'); 
                            }
                          }}
                        >
                          {u.is_admin ? <FiLock /> : <FiUserX />} 
                          {u.is_admin ? " Protegido" : " Banir"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL DE AÇÃO (Isolado no final para funcionar com o CSS fixed) */}
      {selectedUser && actionType === 'ban' && (
        <>
          <div className="modal-overlay" onClick={() => setSelectedUser(null)} />
          <div className="admin-modal">
            <h3 style={{color:'#fff', marginBottom:10}}>Banir {selectedUser.name}</h3>
            <p className="muted" style={{marginBottom:20}}>Selecione a duração do bloqueio:</p>
            <div style={{display:'flex', flexDirection:'column', gap: 10}}>
              <button className="btn outline" onClick={() => handleBan(selectedUser.id, 24)}>24 Horas</button>
              <button className="btn outline" onClick={() => handleBan(selectedUser.id, 168)}>7 Dias</button>
              <button className="btn danger" onClick={() => handleBan(selectedUser.id, null)}>Permanente</button>
              <button className="btn ghost" onClick={() => setSelectedUser(null)}>Cancelar</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}