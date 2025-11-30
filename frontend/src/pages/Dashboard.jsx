import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    User, FileText, TrendingUp, AlertCircle 
} from 'lucide-react';

import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell, Legend 
} from 'recharts';

import FooterContent from '../components/FooterComponent.jsx';

// CSS externo
import '../styles/dashboard.css';

// --- DADOS MOCKADOS ---
const kpiData = [
    { title: "Casos Ativos", value: "12", change: "+2 essa semana", icon: <TrendingUp size={24} />, type: "neutral" },
    { title: "Docs Analisados", value: "348", change: "+15% vs mês anterior", icon: <FileText size={24} />, type: "positive" },
    { title: "Risco Evitado", value: "Alta", change: "3 cláusulas abusivas", icon: <AlertCircle size={24} />, type: "success" },
    { title: "Próximo Prazo", value: "2 Dias", change: "Aditivo Contratual", icon: <AlertCircle size={24} />, type: "warning" },
];

const activityData = [
    { name: 'Seg', consultas: 4, analises: 2 },
    { name: 'Ter', consultas: 3, analises: 5 },
    { name: 'Qua', consultas: 7, analises: 3 },
    { name: 'Qui', consultas: 5, analises: 8 },
    { name: 'Sex', consultas: 6, analises: 4 },
    { name: 'Sáb', consultas: 2, analises: 1 },
    { name: 'Dom', consultas: 1, analises: 0 },
];

const categoryData = [
    { name: 'Trabalhista', value: 45 },
    { name: 'Consumidor', value: 30 },
    { name: 'Civil', value: 15 },
    { name: 'Contratos', value: 10 },
];

const historyData = [
    { id: 1, action: "Análise de Contrato PJ", date: "Hoje, 10:23", status: "Concluído" },
    { id: 2, action: "Consulta sobre Férias", date: "Ontem, 14:40", status: "Concluído" },
    { id: 3, action: "Revisão de Termos de Uso", date: "27/10/2025", status: "Pendente" },
    { id: 4, action: "Cálculo de Rescisão", date: "25/10/2025", status: "Arquivado" },
];

const COLORS = ['#4A90E2', '#50E3C2', '#F5A623', '#D0021B'];

export default function Dashboard() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user')) || { name: 'Usuário', initial: 'U' };

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

    return (
        <>
            <div className="landing-root dashboard-root">

                {/* ❌ HEADER REMOVIDO — agora o header vem do App.jsx */}

                <main className="container dashboard-main">
                    
                    {/* KPIs */}
                    <section className="kpi-grid">
                        {kpiData.map((kpi, idx) => (
                            <div key={idx} className="kpi-card">
                                <div className={`kpi-icon ${kpi.type}`}>{kpi.icon}</div>
                                <div className="kpi-info">
                                    <span className="kpi-title">{kpi.title}</span>
                                    <span className="kpi-value">{kpi.value}</span>
                                    <span className="kpi-change">{kpi.change}</span>
                                </div>
                            </div>
                        ))}
                    </section>

                    <hr style={{ border: 'none', borderTop: '1px solid rgba(255, 255, 255, 0.05)', margin: '10px 0 30px 0' }}/>

                    {/* Charts */}
                    <section className="charts-grid">

                        {/* AreaChart */}
                        <div className="chart-container main-chart">
                            <div className="chart-header">
                                <h4>Atividade Semanal 📊</h4>
                                <button className="btn tiny outline">Exportar</button>
                            </div>

                            <div style={{ width: '100%', flex: 1, minHeight: 300 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={activityData}>
                                        <defs>
                                            <linearGradient id="colorConsultas" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#4A90E2" stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor="#4A90E2" stopOpacity={0}/>
                                            </linearGradient>
                                            <linearGradient id="colorAnalises" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#50E3C2" stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor="#50E3C2" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>

                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                        <XAxis dataKey="name" stroke="#a0a0a0" tick={{fontSize: 12}} />
                                        <YAxis stroke="#a0a0a0" tick={{fontSize: 12}} />
                                        <Tooltip content={<CustomTooltip />} />

                                        <Area type="monotone" dataKey="consultas" stroke="#4A90E2" fill="url(#colorConsultas)" name="Consultas" />
                                        <Area type="monotone" dataKey="analises" stroke="#50E3C2" fill="url(#colorAnalises)" name="Análises" />

                                        <Legend verticalAlign="bottom" height={30} wrapperStyle={{ paddingTop: '10px' }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Pie Chart */}
                        <div className="chart-container pie-chart">
                            <div className="chart-header">
                                <h4>Áreas de Interesse 🎯</h4>
                            </div>

                            <div style={{ width: '100%', flex: 1, minHeight: 300 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={categoryData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={3}
                                            dataKey="value"
                                            nameKey="name"
                                            labelLine={false}
                                        >
                                            {categoryData.map((entry, index) => (
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
                                <h4>Histórico Recente 📖</h4>
                                <a href="#" className="link-muted">Ver tudo</a>
                            </div>

                            <ul>
                                {historyData.map((item) => (
                                    <li key={item.id} className="history-item">
                                        <div className="history-group-details">
                                            <div className="history-icon">
                                                <FileText size={18} />
                                            </div>
                                            <div className="history-details">
                                                <span className="history-action">{item.action}</span>
                                                <span className="history-date">{item.date}</span>
                                            </div>
                                        </div>

                                        <span className={`status-badge ${item.status.toLowerCase()}`}>
                                            {item.status}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="insights-panel">
                            <h4>Insights da IA 🧠</h4>

                            <div className="insight-card">
                                <TrendingUp className="accent-icon" size={24} />
                                <div>
                                    <strong>Tendência de Proteção</strong>
                                    <p className="muted">Seu nível de proteção jurídica aumentou 20% após as últimas consultas.</p>
                                </div>
                            </div>

                            <div className="insight-card warning">
                                <AlertCircle className="warning-icon" size={24} />
                                <div>
                                    <strong>Atenção Necessária</strong>
                                    <p className="muted">O documento "Contrato 2024" possui ambiguidades na cláusula de rescisão.</p>
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
