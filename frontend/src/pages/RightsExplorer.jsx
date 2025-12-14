import React, { useState, useEffect } from 'react';
import { 
  Search, FileText, Download, ExternalLink, 
  BookOpen, Scale, Shield, Filter, X, Briefcase, Heart, Gavel
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'; // Importação do Framer Motion
import api from '../services/api';
import FooterContent from '../components/FooterComponent';
import '../styles/rightsExplorer.css'; 

// Variantes de Animação
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05, // Acelera a cascata para muitos itens
      delayChildren: 0.1
    }
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

const modalVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { type: "spring", duration: 0.5 } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
};

export default function RightsExplorer() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('todos');
  
  // Estado para o Modal
  const [selectedDoc, setSelectedDoc] = useState(null);

  useEffect(() => {
    handleSearch('');
  }, []);

  async function handleSearch(searchTerm) {
    setLoading(true);
    try {
      const response = await api.searchDocuments(searchTerm);
      if (response.success) {
        setResults(response.data);
      }
    } catch (error) {
      console.error("Erro na busca:", error);
    } finally {
      setTimeout(() => setLoading(false), 600);
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch(query);
  };

  // --- FUNÇÃO GERADORA DE CONTEÚDO SIMULADO ---
  const generateMockContent = (doc) => {
    const today = new Date().toLocaleDateString('pt-BR');
    const type = doc.type ? doc.type.toLowerCase() : '';
    const tags = doc.tags ? doc.tags.map(t => t.toLowerCase()) : [];
    
    // Header Padrão
    let content = `DOCUMENTO: ${doc.title.toUpperCase()}\n`;
    content += `TIPO: ${doc.type}\n`;
    content += `DATA: ${today}\n`;
    content += `FONTE: ${doc.source || 'SentryAI Knowledge Base'}\n`;
    content += `ID: ${doc.id}\n`;
    content += `==========================================================\n\n`;

    // Lógica de conteúdo (Simplificada para brevidade, mantendo a original)
    if (tags.includes('penal') || tags.includes('criminal') || type.includes('criminal')) {
      content += `EXCELENTÍSSIMO SENHOR DOUTOR DESEMBARGADOR...\n\n(Conteúdo Criminal Simulado...)\n`;
    } else if (tags.includes('família') || tags.includes('sucessões')) {
      content += `EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO...\n\n(Conteúdo Família Simulado...)\n`;
    } else if (tags.includes('trabalhista') || type.includes('trabalho')) {
      content += `EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DA ___ VARA DO TRABALHO...\n\n(Conteúdo Trabalhista Simulado...)\n`;
    } else if (tags.includes('contratos') || tags.includes('empresarial') || type.includes('contrato')) {
      content += `INSTRUMENTO PARTICULAR DE ${doc.title.toUpperCase()}...\n\n(Conteúdo Contratual Simulado...)\n`;
    } else {
      content += `EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO...\n\n(Conteúdo Cível Simulado...)\n`;
    }
    
    content += `\n----------------------------------------------------------\n`;
    content += `Este é um modelo gerado por IA para fins de estudo e referência.\n`;
    
    return content;
  };

  // --- AÇÃO: DOWNLOAD ---
  const handleDownload = (doc) => {
    const textContent = generateMockContent(doc);
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${doc.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // --- AÇÃO: VISUALIZAR ---
  const handleVisualize = (doc) => {
    const content = generateMockContent(doc);
    setSelectedDoc({ ...doc, fullContent: content });
  };

  // Filtro
  const filteredResults = activeTab === 'todos' 
    ? results 
    : results.filter(r => {
        const term = activeTab.toLowerCase();
        return (
          r.type?.toLowerCase().includes(term) || 
          r.tags?.some(t => t.toLowerCase().includes(term)) ||
          r.title?.toLowerCase().includes(term)
        );
      });

  return (
    <div className="rights-root">
      
      {/* HERO SECTION */}
      <motion.div 
        className="rights-hero"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container" style={{ width: '100%', maxWidth: 900 }}>
          <motion.div 
            className="rights-badge"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#50E3C2' }}></span>
            Banco Local (Mock)
          </motion.div>
          <motion.h1 
            className="rights-title"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Banco de Inteligência Jurídica
          </motion.h1>
          <motion.p 
            className="rights-subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Acesse modelos de petições, contratos e jurisprudência. 
            Pesquisa semântica potencializada por IA.
          </motion.p>

          <form onSubmit={handleSubmit} className="rights-search-form">
            <div className="rights-search-box">
              <div className="rights-search-icon"><Search size={22} /></div>
              <input 
                type="text" 
                className="rights-input"
                placeholder="Ex: Habeas Corpus, Divórcio, Trabalhista..." 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <motion.button 
                type="submit" 
                className="btn primary rights-btn-search"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Pesquisar
              </motion.button>
            </div>
          </form>

          <motion.div 
            className="rights-tags"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <span style={{ fontSize: 13, color: 'var(--muted)', alignSelf: 'center' }}>Sugestões:</span>
            {['Calúnia', 'Trabalhista', 'Divórcio', 'Contrato Social', 'Danos Morais'].map(term => (
              <motion.button 
                key={term} 
                className="rights-tag-btn" 
                onClick={() => { setQuery(term); handleSearch(term); }}
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
                whileTap={{ scale: 0.95 }}
              >
                {term}
              </motion.button>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* MAIN CONTENT */}
      <div className="rights-container">
        <div className="rights-toolbar">
          <div className="rights-tabs">
            {[
              { id: 'todos', label: 'Todos' },
              { id: 'trabalhista', label: 'Trabalhista' },
              { id: 'cível', label: 'Cível/Consumidor' },
              { id: 'penal', label: 'Criminal' },
              { id: 'contratos', label: 'Contratos' },
              { id: 'família', label: 'Família' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`rights-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                style={{ position: 'relative' }} // Necessário para o layoutId funcionar bem
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.span 
                    className="rights-tab-line" 
                    layoutId="activeTab" // A mágica da linha deslizando
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
          <div className="rights-sort"><Filter size={14} /> Ordenar por: Relevância</div>
        </div>

        {/* ÁREA DE RESULTADOS */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              className="rights-loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="typing-dots" style={{ marginBottom: 16 }}>
                <motion.span animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} style={{background: '#4A90E2'}}></motion.span>
                <motion.span animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.1 }} style={{background: '#4A90E2'}}></motion.span>
                <motion.span animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} style={{background: '#4A90E2'}}></motion.span>
              </div>
              <p className="muted">Consultando bases jurídicas...</p>
            </motion.div>
          ) : (
            <motion.div 
              key="grid"
              className="rights-grid"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredResults.length > 0 ? (
                filteredResults.map((doc) => (
                  <motion.div 
                    key={doc.id} 
                    className="doc-card" 
                    onClick={() => handleVisualize(doc)}
                    variants={itemVariants}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    layout // Anima a reordenação quando filtra
                  >
                    <div className="doc-icon-box">
                      {doc.tags?.some(t => t.includes('Penal')) ? <Gavel size={24} /> :
                       doc.tags?.some(t => t.includes('Trabalhista')) ? <Briefcase size={24} /> :
                       doc.tags?.some(t => t.includes('Família')) ? <Heart size={24} /> :
                       doc.type.includes('Contrato') ? <Shield size={24} /> : 
                       <FileText size={24} />}
                    </div>
                    <div>
                      <div className="doc-header">
                        <span className="doc-badge" style={{
                          color: doc.tags?.some(t => t.includes('Penal')) ? '#FF6B6B' : 
                                 doc.tags?.some(t => t.includes('Contrato')) ? '#50E3C2' : 
                                 doc.tags?.some(t => t.includes('Família')) ? '#FF9FF3' : '#4A90E2',
                          background: doc.tags?.some(t => t.includes('Penal')) ? 'rgba(255, 107, 107, 0.1)' : 
                                      doc.tags?.some(t => t.includes('Contrato')) ? 'rgba(80, 227, 194, 0.1)' : 
                                      doc.tags?.some(t => t.includes('Família')) ? 'rgba(255, 159, 243, 0.1)' : 'rgba(74, 144, 226, 0.1)',
                        }}>{doc.type}</span>
                        <span className="doc-meta">• {doc.date}</span>
                      </div>
                      <h3 className="doc-title">{doc.title}</h3>
                      <p className="doc-preview">{doc.preview}</p>
                      <div className="doc-tags">
                        {doc.tags?.slice(0, 3).map(tag => (
                          <span key={tag} className="doc-tag">#{tag}</span>
                        ))}
                      </div>
                    </div>
                    <div className="doc-actions" onClick={(e) => e.stopPropagation()}>
                      <motion.button className="btn outline small" style={{ width: '100%', justifyContent: 'center' }} onClick={() => handleDownload(doc)} whileTap={{ scale: 0.95 }}>
                        <Download size={14} style={{ marginRight: 6 }} /> Baixar
                      </motion.button>
                      <motion.button className="btn ghost small" style={{ width: '100%', justifyContent: 'center', color: 'var(--muted)' }} onClick={() => handleVisualize(doc)} whileTap={{ scale: 0.95 }}>
                        <ExternalLink size={14} style={{ marginRight: 6 }} /> Visualizar
                      </motion.button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div 
                  className="rights-empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="empty-icon"><BookOpen size={24} /></div>
                  <h3 style={{ color: '#fff', marginBottom: 8 }}>Nenhum documento encontrado</h3>
                  <p className="muted" style={{ maxWidth: 400, margin: '0 auto' }}>
                    Não encontramos resultados para "{query}". Tente usar termos mais genéricos.
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* MODAL DE VISUALIZAÇÃO */}
      <AnimatePresence>
        {selectedDoc && (
          <motion.div 
            className="doc-modal-overlay" 
            onClick={() => setSelectedDoc(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="doc-modal" 
              onClick={(e) => e.stopPropagation()}
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="doc-modal-header">
                <h3 className="doc-modal-title">{selectedDoc.title}</h3>
                <button className="doc-modal-close" onClick={() => setSelectedDoc(null)}>
                  <X size={20} />
                </button>
              </div>
              
              <div className="doc-modal-content">
                <div className="doc-text-body">
                  {selectedDoc.fullContent.split('\n').map((line, i) => (
                    <p key={i}>{line || <br/>}</p>
                  ))}
                </div>
              </div>

              <div className="doc-modal-footer">
                <button className="btn ghost" onClick={() => setSelectedDoc(null)}>Fechar</button>
                <button className="btn primary" onClick={() => handleDownload(selectedDoc)}>
                   <Download size={16} style={{marginRight: 8}}/> Baixar Arquivo
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <FooterContent />
    </div>
  );
}