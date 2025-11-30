import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    FileText, TrendingUp, AlertCircle, MessageSquare, Clock
} from 'lucide-react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell, Legend 
} from 'recharts';
import FooterContent from '../components/FooterComponent.jsx';
import api from '../services/api';
import '../styles/dashboard.css';

// Cores para gráficos
const COLORS = ['#4A90E2', '#50E3C2', '#F5A623', '#D0021B'];

// Dados estáticos de categoria (Placeholder até termos classificação real de IA nos chats)
const MOCK_CATEGORY_DATA = [
    { name: 'Trabalhista', value: 45 },
    { name: 'Consumidor', value: 30 },
    { name: 'Civil', value: 15 },
    { name: 'Contratos', value: 10 },
];

export default function Dashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        kpis: { active_cases: 0, docs_analyzed: 0, risks_avoided: 0, next_deadline: 'None' },
        chart_data: [],
        history: [],
        insight: { type: 'neutral', text: 'Carregando insights...' }
    });

    useEffect(() => {
        async function fetchStats() {
            try {
                const data = await api.getDashboardStats();
                setStats(data);
            } catch (error) {
                console.error("Falha ao carregar dashboard:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-chart-tooltip">
                    <p className="label">{`${label}`}</p>
                    {payload.map((entry, index) => (
                        <p key={index} style={{ color: entry.color }}>
                            {`${entry.name}: ${entry.value}`}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    if (loading) {
        return (
            <div className="landing-root dashboard-root">
                <main className="container dashboard-main" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <p className="muted">Carregando seus dados...</p>
                </main>
            </div>
        );
    }

    return (
        <>
            <div className="landing-root dashboard-root">
                <main className="container dashboard-main">
                    
                    {/* KPIs REAIS */}
                    <section className="kpi-grid">
                        <div className="kpi-card">
                            <div className="kpi-icon neutral"><MessageSquare size={24} /></div>
                            <div className="kpi-info">
                                <span className="kpi-title">Conversas Ativas</span>
                                <span className="kpi-value">{stats.kpis.active_cases}</span>
                                <span className="kpi-change">Chats iniciados</span>
                            </div>
                        </div>

                        <div className="kpi-card">
                            <div className="kpi-icon positive"><FileText size={24} /></div>
                            <div className="kpi-info">
                                <span className="kpi-title">Interações</span>
                                <span className="kpi-value">{stats.kpis.docs_analyzed}</span>
                                <span className="kpi-change">Mensagens trocadas</span>
                            </div>
                        </div>

                        <div className="kpi-card">
                            <div className="kpi-icon warning"><AlertCircle size={24} /></div>
                            <div className="kpi-info">
                                <span className="kpi-title">Riscos Detectados</span>
                                <span className="kpi-value">{stats.kpis.risks_avoided}</span>
                                <span className="kpi-change">Termos de atenção</span>
                            </div>
                        </div>

                        <div className="kpi-card">
                            <div className="kpi-icon success"><TrendingUp size={24} /></div>
                            <div className="kpi-info">
                                <span className="kpi-title">Insight do Dia</span>
                                <span className="kpi-change" style={{ fontSize: '13px', marginTop: '4px' }}>
                                    {stats.insight?.text || "Tudo certo por hoje!"}
                                </span>
                            </div>
                        </div>
                    </section>

                    <hr style={{ border: 'none', borderTop: '1px solid rgba(255, 255, 255, 0.05)', margin: '10px 0 30px 0' }}/>

                    {/* Charts */}
                    <section className="charts-grid">

                        {/* Activity Chart */}
                        <div className="chart-container main-chart">
                            <div className="chart-header">
                                <h4>Atividade Recente 📊</h4>
                            </div>

                            <div style={{ width: '100%', flex: 1, minHeight: 300 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={stats.chart_data}>
                                        <defs>
                                            <linearGradient id="colorConsultas" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#4A90E2" stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor="#4A90E2" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                        <XAxis dataKey="name" stroke="#a0a0a0" tick={{fontSize: 12}} />
                                        <YAxis stroke="#a0a0a0" tick={{fontSize: 12}} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area type="monotone" dataKey="consultas" stroke="#4A90E2" fill="url(#colorConsultas)" name="Consultas" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Pie Chart (Categorias - Mockado por enquanto pois requer classificação complexa) */}
                        <div className="chart-container pie-chart">
                            <div className="chart-header">
                                <h4>Áreas de Interesse 🎯</h4>
                            </div>
                            <div style={{ width: '100%', flex: 1, minHeight: 300 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={MOCK_CATEGORY_DATA}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={3}
                                            dataKey="value"
                                            nameKey="name"
                                            labelLine={false}
                                        >
                                            {MOCK_CATEGORY_DATA.map((entry, index) => (
                                                <Cell key={index} fill={COLORS[index]} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend layout="vertical" verticalAlign="middle" align="right" />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </section>

                    {/* Histórico & Insights */}
                    <section className="bottom-grid">
                        <div className="history-list">
                            <div className="section-header">
                                <h4>Histórico de Conversas 📖</h4>
                                <button onClick={() => navigate('/app/chat')} className="btn tiny outline">Ver todos</button>
                            </div>

                            <ul>
                                {stats.history.length === 0 ? (
                                    <li className="muted">Nenhuma conversa recente.</li>
                                ) : (
                                    stats.history.map((item) => (
                                        <li key={item.id} className="history-item" onClick={() => navigate('/app/chat')} style={{ cursor: 'pointer' }}>
                                            <div className="history-group-details">
                                                <div className="history-icon">
                                                    <MessageSquare size={18} />
                                                </div>
                                                <div className="history-details">
                                                    <span className="history-action">{item.action}</span>
                                                    <span className="history-date">{item.date}</span>
                                                </div>
                                            </div>
                                            <span className="status-badge concluído">Ativo</span>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </div>

                        <div className="insights-panel">
                            <h4>Sentry AI Insights 🧠</h4>

                            {/* Card Dinâmico Gerado pelo Backend */}
                            <div className={`insight-card ${stats.insight?.type === 'warning' ? 'warning' : ''}`}>
                                <TrendingUp className="accent-icon" size={24} />
                                <div>
                                    <strong>Dica Personalizada</strong>
                                    <p className="muted">{stats.insight?.text}</p>
                                </div>
                            </div>

                            {/* Card Estático de Exemplo */}
                            <div className="insight-card warning">
                                <Clock className="warning-icon" size={24} />
                                <div>
                                    <strong>Lembrete Geral</strong>
                                    <p className="muted">Direitos trabalhistas prescrevem em 2 anos após o fim do contrato. Fique atento.</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
                <FooterContent />
            </div>
        </>
    );
}