import React, { useState, useRef, useEffect } from "react";
import { FiZap, FiPlay, FiArrowUp, FiPaperclip, FiArrowUpCircle, FiClock, FiFileText } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion"; // Importação Framer Motion
import FooterContent from "../components/FooterComponent";
import "../styles/contractAnalysis.css";
import api from "../services/api"; 

// Variantes de Animação
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const msgVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: { opacity: 1, scale: 1, y: 0 }
};

// --- Subcomponente RiskMeter ---
function RiskMeter({ score }) {
  let level = "safe";
  if (score > 30) level = "warning";
  if (score > 60) level = "danger";

  const segments = Array.from({ length: 20 }, (_, i) => {
    const isActive = i < (score / 5); 
    return (
        <motion.div 
            key={i} 
            className={`risk-segment ${isActive ? "active" : ""}`} 
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: i * 0.02 }}
        />
    );
  });

  return (
    <div className="risk-meter-container">
      <div className="risk-header">
        <span>Nível de Risco</span>
        <motion.span
            key={score}
            initial={{ scale: 1.2, color: '#fff' }}
            animate={{ scale: 1, color: 'var(--text-muted)' }}
        >
            {score}/100
        </motion.span>
      </div>
      <div className={`risk-bar ${level}`}>
        {segments}
      </div>
    </div>
  );
}

// --- Componente Principal ---
export default function ContractAnalysis() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [textPreview, setTextPreview] = useState("");
  const [status, setStatus] = useState("idle"); 
  const [analysis, setAnalysis] = useState(null);
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]);
  
  const fileRef = useRef(null);
  const pollingRef = useRef(null); 
  const [isDragging, setIsDragging] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  // Carregar histórico ao montar
  useEffect(() => {
    loadHistory();
    return () => {
      if (pollingRef.current) clearTimeout(pollingRef.current);
    };
  }, []);

  async function loadHistory() {
    if (!user?.id) return;
    try {
      const res = await api.getUserContracts(user.id);
      const sorted = (res || []).sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
      setHistory(sorted);
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) processFile(f);
  }

  function processFile(f) {
    setFile(f);
    setAnalysis(null);
    setStatus("idle"); 
    if (f.type.startsWith("text/") || /\.(txt|md|csv|json)$/i.test(f.name)) {
      const reader = new FileReader();
      reader.onload = e => setTextPreview(String(e.target.result));
      reader.readAsText(f);
    } else {
      setTextPreview(`Arquivo: ${f.name} carregado.\n(Prévia visual indisponível para binários, mas será enviada para análise).`);
    }
    toast.success("Arquivo carregado!");
  }

  // --- NOVA LÓGICA DE POLLING ---
  const pollAnalysisStatus = async (contractId) => {
    try {
        const updatedContract = await api.getContract(contractId);
        const currentLabel = updatedContract.json?.risk?.label;

        if (currentLabel === "Processando") {
            pollingRef.current = setTimeout(() => pollAnalysisStatus(contractId), 2000);
        } else {
            setAnalysis(updatedContract.json);
            setStatus("done");
            toast.success("Análise finalizada!");
            loadHistory(); 
        }
    } catch (error) {
        console.error("Erro no polling:", error);
        toast.error("Erro ao verificar status. Tente recarregar o histórico.");
        setStatus("done");
    }
  };

  async function handleAnalyze() {
    if (!file && !textPreview.trim()) return toast.error("Envie um arquivo ou cole texto.");
    if (!user?.id) return toast.error("Faça login para analisar.");

    if (pollingRef.current) clearTimeout(pollingRef.current);

    setStatus("processing");
    const toastId = toast.loading("Iniciando análise com IA...");

    try {
      const form = new FormData();
      form.append("user_id", user.id);
      
      if (file) form.append("file", file);
      else form.append("text", textPreview);

      const res = await api.analyzeContract(form);
      const contractData = res.contract;

      if (!contractData || !contractData.id) {
          throw new Error("Resposta inválida do servidor");
      }

      setAnalysis(contractData.json);
      pollAnalysisStatus(contractData.id);

      toast.dismiss(toastId);

    } catch (err) {
      console.error(err);
      toast.error("Erro na requisição: " + (err.body?.error || err.message), { id: toastId });
      setStatus("idle");
    }
  }

  function loadFromHistory(contract) {
      if (contract.json?.risk?.label === "Processando") {
          setStatus("processing");
          setAnalysis(contract.json);
          setTextPreview(contract.text_content || "Conteúdo sendo processado..."); 
          pollAnalysisStatus(contract.id);
          return;
      }

      if (contract.json) {
          setAnalysis(contract.json);
          setTextPreview(contract.text_content || contract.content_to_analyze || "Visualização carregada do histórico.");
          setMessages([]); 
          setStatus("done");
          toast.success("Contrato carregado.");
      }
  }

  async function sendChat(msg) {
    if (!msg.trim()) return;
    setMessages(prev => [...prev, { id: Date.now(), role: "user", text: msg }]);
    
    try {
      if (api?.chatContract && analysis) {
        const res = await api.chatContract({ 
            message: msg, 
            context: analysis.summary, 
            user_id: user.id 
        });
        setMessages(prev => [...prev, { id: Date.now()+1, role: "assistant", text: res.reply }]);
      } else {
        setMessages(prev => [...prev, { id: Date.now()+1, role: "assistant", text: "IA indisponível no momento." }]);
      }
    } catch {
      setMessages(prev => [...prev, { id: Date.now()+1, role: "assistant", text: "Erro ao conectar com a IA." }]);
      toast.error("Falha na comunicação com a IA.");
    }
  }

  const getRiskClass = () => {
    if (!analysis) return "";
    if (status === "processing") return "";
    
    const s = analysis.risk?.score || 0;
    if (s > 60) return "risk-bg-danger";
    if (s > 30) return "risk-bg-warning";
    return "risk-bg-safe";
  };

  return (
    <div className="contract-page-root">
      
      <motion.div 
        className="ca-wrapper"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.header className="ca-header" variants={itemVariants}>
          <div className="ca-header-left">
            <FiZap size={22} />
            <span>Análise de Contrato</span>
          </div>
        </motion.header>

        <main className="ca-main">
          {/* COLUNA ESQUERDA */}
          <section className="ca-col">
            <motion.div className="ca-card" variants={itemVariants}>
              <h3>1. Novo Documento</h3>
              <motion.div
                className={`ca-upload ${isDragging ? "dragover" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                whileHover={{ scale: 1.01, borderColor: "var(--accent)" }}
                whileTap={{ scale: 0.99 }}
              >
                <div>
                  <FiArrowUpCircle size={32} style={{ marginBottom: 8, opacity: 0.7 }} />
                  <p>{file ? file.name : "Arraste ou clique"}</p>
                </div>
                <input type="file" ref={fileRef} onChange={(e) => processFile(e.target.files[0])} hidden />
              </motion.div>

              <motion.button
                className="ca-btn primary full ca-send-btn"
                onClick={handleAnalyze}
                disabled={status === "processing"}
                style={status === "processing" ? {opacity: 0.7, cursor: 'not-allowed'} : {}}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FiPlay /> {status === "processing" ? "Analisando..." : "Analisar e Salvar"}
              </motion.button>
            </motion.div>

            {/* LISTA DE HISTÓRICO */}
            <AnimatePresence>
            {history.length > 0 && (
                <motion.div 
                    className="ca-card" 
                    variants={itemVariants}
                    layout // Anima se o tamanho mudar
                >
                    <h3><FiClock style={{marginRight: 8}}/> Histórico Recente</h3>
                    <div className="ca-highlight-list" style={{maxHeight: '200px', overflowY: 'auto'}}>
                        {history.map(contract => (
                            <motion.div 
                                key={contract.id} 
                                className="ca-highlight-item" 
                                style={{cursor: 'pointer', padding: '10px'}}
                                onClick={() => loadFromHistory(contract)}
                                whileHover={{ x: 5, backgroundColor: "rgba(255,255,255,0.03)" }}
                            >
                                <div style={{display:'flex', alignItems:'center', gap: 8}}>
                                    <FiFileText size={14} color="var(--accent)"/>
                                    <span className="snippet" style={{margin:0, fontSize: '13px'}}>
                                        {new Date(contract.created_at).toLocaleDateString()} - 
                                        <strong> {contract.json?.risk?.label || "..."}</strong>
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}
            </AnimatePresence>

            <motion.div className="ca-card" variants={itemVariants}>
              <h3>Pré-visualização</h3>
              <textarea
                className="ca-textarea"
                value={textPreview}
                onChange={e => setTextPreview(e.target.value)}
                placeholder="Cole o texto do contrato aqui..."
              />
            </motion.div>
          </section>

          {/* COLUNA DIREITA */}
          <section className="ca-col">
            <motion.div 
                className={`ca-card ${getRiskClass()}`}
                variants={itemVariants}
                animate={status === "done" ? { scale: [1, 1.02, 1] } : {}}
                transition={{ duration: 0.4 }}
            >
              <h3>Resultado da Análise</h3>

              {status === "idle" && !analysis && <p className="muted small">Aguardando documento ou selecione do histórico...</p>}
              
              {/* Exibe Skeleton Loading ENQUANTO status === processing */}
              <AnimatePresence>
              {status === "processing" && (
                  <motion.div 
                    className="fade-in"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                      <p className="small muted">A IA está lendo o contrato (isso leva ~10s)...</p>
                      <div className="skeleton skeleton-text" style={{width: '50%', marginBottom: 20}}></div>
                      <div className="skeleton skeleton-text"></div>
                      <div className="skeleton skeleton-text"></div>
                      <div className="skeleton skeleton-text short"></div>
                  </motion.div>
              )}
              </AnimatePresence>

              {/* Exibe Resultado APENAS SE status === done E analysis existe */}
              <AnimatePresence>
              {status === "done" && analysis && (
                <motion.div 
                    className="fade-in"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                  <RiskMeter score={analysis.risk?.score || 0} />
                  
                  {analysis.risk?.label === "Erro" ? (
                      <div style={{color: 'red', marginTop: 10}}>
                          <p>Falha ao processar: {analysis.error || analysis.summary}</p>
                      </div>
                  ) : (
                      <>
                        <p className="small" style={{ lineHeight: 1.6, marginTop: 10 }}>{analysis.summary}</p>
                        <h4 style={{ marginTop: 20, marginBottom: 10 }}>Pontos de Atenção</h4>
                        {(!analysis.highlights || analysis.highlights.length === 0) && <p className="small muted">Nenhum risco crítico encontrado.</p>}
                        <ul className="ca-highlight-list">
                            {analysis.highlights?.map((h, i) => (
                            <motion.li 
                                key={i} 
                                className="ca-highlight-item"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className="tag">{h.tag}</div>
                                <div className="snippet">"{h.snippet}"</div>
                                <div className="line muted small">{h.explanation}</div>
                            </motion.li>
                            ))}
                        </ul>
                      </>
                  )}
                </motion.div>
              )}
              </AnimatePresence>
            </motion.div>

            <motion.div className="ca-card" variants={itemVariants}>
              <h3>Dúvidas sobre o contrato</h3>
              <div className="ca-chat-box">
                {messages.length === 0 && <p className="muted small" style={{textAlign:'center', marginTop: 20}}>Faça perguntas sobre o contrato analisado.</p>}
                <AnimatePresence>
                {messages.map(m => (
                  <motion.div 
                    key={m.id} 
                    className={`ca-msg ${m.role}`}
                    variants={msgVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <ReactMarkdown>{m.text}</ReactMarkdown>
                  </motion.div>
                ))}
                </AnimatePresence>
              </div>
              {/* Desabilita chat se não tiver análise pronta */}
              <ChatInput onSend={sendChat} disabled={status !== "done" || !analysis} />
            </motion.div>
          </section>
        </main>
      </motion.div>

      <FooterContent />
    </div>
  );
}

function ChatInput({ onSend, disabled }) {
  const [val, setVal] = useState("");
  return (
    <form className="ca-chat-input" onSubmit={(e) => { e.preventDefault(); onSend(val); setVal(""); }}>
      <FiPaperclip className="ca-chat-clip" />
      <input 
        className="ca-chat-field" 
        value={val} 
        onChange={e => setVal(e.target.value)} 
        placeholder={disabled ? "Aguarde a análise..." : "Pergunte sobre multas, prazos..."} 
        disabled={disabled}
      />
      <motion.button 
        type="submit" 
        className="ca-chat-send active" 
        disabled={!val.trim() || disabled}
        whileTap={{ scale: 0.9 }}
      >
        <FiArrowUp />
      </motion.button>
    </form>
  );
}