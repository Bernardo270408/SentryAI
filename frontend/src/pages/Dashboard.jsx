import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    FileText, TrendingUp, AlertCircle, MessageSquare, 
    AlertTriangle, ArrowRight, ShieldAlert 
} from 'lucide-react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell, Legend 
} from 'recharts';
import FooterContent from '../components/FooterComponent.jsx';
import api from '../services/api';
import '../styles/dashboard.css';

const COLORS = ['#4A90E2', '#50E3C2', '#F5A623', '#D0021B', '#9B59B6'];

export default function Dashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        kpis: { active_cases: 0, docs_analyzed: 0, risks_avoided: 0 },
        chart_data: [],
        categories: [],
        history: [],
        risk_alerts: [],
        top_doubts: [], // Novo campo
        insight: { type: 'neutral', text: '...' }
    });

    useEffect(() => {
        api.getDashboardStats()
            .then(data => setStats(data))
            .catch(err => console.error("Erro dashboard:", err))
            .finally(() => setLoading(false));
    }, []);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-chart-tooltip">
                    <p className="label">{`${label}`}</p>
                    <p style={{ color: payload[0].color }}>{`Interações: ${payload[0].value}`}</p>
                </div>
            );
        }
        return null;
    };

    if (loading) {
        return (
            <div className="landing-root dashboard-root">
                <main className="container dashboard-main" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <p className="muted">Analisando dados...</p>
                </main>
            </div>
        );
    }

    return (
        <div className="landing-root dashboard-root">
            <main className="container dashboard-main">
                
                {/* 1. KPIs */}
                <section className="kpi-grid">
                    <div className="kpi-card">
                        <div className="kpi-icon neutral"><MessageSquare size={24} /></div>
                        <div className="kpi-info">
                            <span className="kpi-title">Conversas</span>
                            <span className="kpi-value">{stats.kpis.active_cases}</span>
                            <span className="kpi-change">Ativos</span>
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-icon positive"><FileText size={24} /></div>
                        <div className="kpi-info">
                            <span className="kpi-title">Mensagens</span>
                            <span className="kpi-value">{stats.kpis.docs_analyzed}</span>
                            <span className="kpi-change">Total enviado</span>
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-icon warning"><AlertCircle size={24} /></div>
                        <div className="kpi-info">
                            <span className="kpi-title">Pontos de Risco</span>
                            <span className="kpi-value">{stats.kpis.risks_avoided}</span>
                            <span className="kpi-change">Termos críticos</span>
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-icon success"><TrendingUp size={24} /></div>
                        <div className="kpi-info">
                            <span className="kpi-title">Dica Rápida</span>
                            <span className="kpi-change" style={{ fontSize: '12px', marginTop: '4px', lineHeight: '1.3' }}>
                                {stats.insight?.text}
                            </span>
                        </div>
                    </div>
                </section>

                <hr className="dash-divider" style={{ border: 0, borderTop: '1px solid rgba(255,255,255,0.06)', margin: '20px 0 40px' }}/>

                {/* 2. ALERTAS DE RISCO */}
                {stats.risk_alerts && stats.risk_alerts.length > 0 && (
                    <section style={{ marginBottom: 40 }}>
                        <div className="section-header">
                            <h4 style={{ color: '#ff6b6b', display: 'flex', alignItems: 'center', gap: 10 }}>
                                <ShieldAlert size={20} /> Alertas de Contrato & Risco
                            </h4>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
                            {stats.risk_alerts.map((alert) => (
                                <div key={alert.id} className="risk-alert-card" style={{
                                    background: 'rgba(231, 76, 60, 0.08)',
                                    border: '1px solid rgba(231, 76, 60, 0.25)',
                                    borderRadius: '12px', padding: '20px',
                                    display: 'flex', flexDirection: 'column', gap: '10px'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ 
                                            background: 'rgba(231, 76, 60, 0.2)', color: '#ff8a80', 
                                            fontSize: '11px', padding: '2px 8px', borderRadius: '4px',
                                            fontWeight: '600', textTransform: 'uppercase'
                                        }}>{alert.risk_type}</span>
                                        <span className="muted" style={{ fontSize: '12px' }}>{alert.date}</span>
                                    </div>
                                    <div>
                                        <strong style={{ color: '#e0e0e0', fontSize: '15px' }}>{alert.description}</strong>
                                        <p style={{ margin: '6px 0', fontSize: '13px', color: '#a0a0a0', fontStyle: 'italic' }}>"{alert.snippet}"</p>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                        <span style={{ fontSize: '12px', color: '#fff' }}>Em: <strong>{alert.chat}</strong></span>
                                        <button onClick={() => navigate('/app/chat')} style={{ background: 'transparent', border: 'none', color: '#ff8a80', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '12px', fontWeight: '500' }}>
                                            Ver <ArrowRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* 3. GRÁFICOS */}
                <section className="charts-grid">
                    <div className="chart-container main-chart">
                        <div className="chart-header"><h4>Volume de Consultas (7 dias)</h4></div>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <AreaChart data={stats.chart_data}>
                                    <defs>
                                        <linearGradient id="colorConsultas" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4A90E2" stopOpacity={0.8}/><stop offset="95%" stopColor="#4A90E2" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                    <XAxis dataKey="name" stroke="#a0a0a0" tick={{fontSize: 12}} />
                                    <YAxis stroke="#a0a0a0" tick={{fontSize: 12}} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="consultas" stroke="#4A90E2" strokeWidth={2} fill="url(#colorConsultas)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="chart-container pie-chart">
                        <div className="chart-header"><h4>Áreas de Interesse (Por Chat)</h4></div>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie data={stats.categories} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={4} dataKey="value">
                                        {stats.categories.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip />
                                    <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '12px', color: '#ccc' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </section>

                {/* 4. HISTÓRICO & INSIGHTS */}
                <section className="bottom-grid">
                    <div className="history-list">
                        <div className="section-header">
                            <h4>Atividade Recente</h4>
                            <button onClick={() => navigate('/app/chat')} className="btn tiny outline">Ver todos</button>
                        </div>
                        <ul>
                            {stats.history.length === 0 ? <li className="muted">Nenhuma atividade.</li> : 
                                stats.history.map((item) => (
                                    <li key={item.id} className="history-item" onClick={() => navigate('/app/chat')} style={{ cursor: 'pointer' }}>
                                        <div className="history-group-details">
                                            <div className="history-icon"><MessageSquare size={18} /></div>
                                            <div className="history-details">
                                                <span className="history-action">{item.action}</span>
                                                <span className="history-date">{item.date}</span>
                                            </div>
                                        </div>
                                        <span className="status-badge concluído">Ativo</span>
                                    </li>
                                ))
                            }
                        </ul>
                    </div>

                    <div className="insights-panel">
                        <h4>Sentry AI Insights</h4>
                        
                        {/* Dica do Dia */}
                        <div className={`insight-card ${stats.insight?.type === 'warning' ? 'warning' : ''}`} style={{marginBottom: 10}}>
                            <TrendingUp className="accent-icon" size={24} />
                            <div>
                                <strong>Dica Personalizada</strong>
                                <p className="muted">{stats.insight?.text}</p>
                            </div>
                        </div>

                        {/* NOVO: Maiores Dúvidas Identificadas (Dados REAIS das mensagens) */}
                        <div className="insight-card" style={{ flexDirection: 'column', gap: '10px', borderLeft: '4px solid #50E3C2' }}>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <FileText className="accent-icon" size={24} style={{ color: '#50E3C2' }} />
                                <strong>Seus Principais Focos</strong>
                            </div>
                            <ul style={{ paddingLeft: '20px', margin: 0, color: '#a0a0a0', fontSize: '13px' }}>
                                {stats.top_doubts && stats.top_doubts.length > 0 ? (
                                    stats.top_doubts.map((doubt, i) => (
                                        <li key={i} style={{ marginBottom: '4px' }}>{doubt}</li>
                                    ))
                                ) : (
                                    <li>Analisando histórico...</li>
                                )}
                            </ul>
                        </div>
                    </div>
                </section>
            </main>
            <FooterContent />
        </div>
    );
}