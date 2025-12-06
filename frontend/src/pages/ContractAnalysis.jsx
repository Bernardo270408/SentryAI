import React, { useState, useRef, useEffect } from "react";
import { FiZap, FiPlay, FiArrowUp, FiPaperclip, FiArrowUpCircle, FiClock, FiFileText } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import toast from "react-hot-toast";
import FooterContent from "../components/FooterComponent";
import "../styles/contractAnalysis.css";
import api from "../services/api";

function RiskMeter({ score }) {
  let level = "safe";
  if (score > 30) level = "warning";
  if (score > 60) level = "danger";

  const segments = Array.from({ length: 20 }, (_, i) => {
    const isActive = i < (score / 5); 
    return <div key={i} className={`risk-segment ${isActive ? "active" : ""}`} />;
  });

  return (
    <div className="risk-meter-container">
      <div className="risk-header">
        <span>Nível de Risco</span>
        <span>{score}/100</span>
      </div>
      <div className={`risk-bar ${level}`}>
        {segments}
      </div>
    </div>
  );
}

export default function ContractAnalysis() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [textPreview, setTextPreview] = useState("");
  const [status, setStatus] = useState("idle");
  const [analysis, setAnalysis] = useState(null);
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]);
  
  const fileRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    loadHistory();
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
    if (f.type.startsWith("text/") || /\.(txt|md|csv|json)$/i.test(f.name)) {
      const reader = new FileReader();
      reader.onload = e => setTextPreview(String(e.target.result));
      reader.readAsText(f);
    } else {
      setTextPreview(`Arquivo: ${f.name} carregado.\n(Prévia visual indisponível para binários, mas será enviada para análise).`);
    }
    toast.success("Arquivo carregado!");
  }

  async function handleAnalyze() {
    if (!file && !textPreview.trim()) return toast.error("Envie um arquivo ou cole texto.");
    if (!user?.id) return toast.error("Faça login para analisar.");

    setStatus("processing");
    const toastId = toast.loading("Enviando para análise...");

    try {
      const form = new FormData();
      form.append("user_id", user.id);
      
      if (file) form.append("file", file);
      else form.append("text", textPreview);

      const res = await api.analyzeContract(form);
      
      if (res && res.json) {
          setAnalysis(res.json);
      } else {
          setAnalysis(res); 
      }
      
      loadHistory();
      toast.success("Análise concluída!", { id: toastId });

    } catch (err) {
      console.error(err);
      toast.error("Erro na análise: " + (err.body?.error || err.message), { id: toastId });
    } finally {
      setStatus("done");
    }
  }

  function loadFromHistory(contract) {
      if (contract.json) {
          setAnalysis(contract.json);
          setTextPreview(contract.text || "Conteúdo do arquivo não disponível para visualização textual.");
          setMessages([]); 
          setStatus("done");
          toast.success("Contrato carregado do histórico.");
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
    const s = analysis.risk?.score || 0;
    if (s > 60) return "risk-bg-danger";
    if (s > 30) return "risk-bg-warning";
    return "risk-bg-safe";
  };

  return (
    <div className="contract-page-root">
      
      <div className="ca-wrapper">
        <header className="ca-header">
          <div className="ca-header-left">
            <FiZap size={22} />
            <span>Análise de Contrato</span>
          </div>
        </header>

        <main className="ca-main">
          {/* COLUNA ESQUERDA */}
          <section className="ca-col">
            <div className="ca-card">
              <h3>1. Novo Documento</h3>
              <div
                className={`ca-upload ${isDragging ? "dragover" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key==='Enter' && fileRef.current?.click()}
                aria-label="Upload de arquivo"
              >
                <div>
                  <FiArrowUpCircle size={32} style={{ marginBottom: 8, opacity: 0.7 }} />
                  <p>{file ? file.name : "Arraste ou clique"}</p>
                </div>
                <input type="file" ref={fileRef} onChange={(e) => processFile(e.target.files[0])} hidden />
              </div>

              <button
                className="ca-btn primary full ca-send-btn"
                onClick={handleAnalyze}
                disabled={status === "processing"}
                style={status === "processing" ? {opacity: 0.7, cursor: 'not-allowed'} : {}}
              >
                <FiPlay /> {status === "processing" ? "Analisando IA..." : "Analisar e Salvar"}
              </button>
            </div>

            {/* LISTA DE HISTÓRICO */}
            {history.length > 0 && (
                <div className="ca-card">
                    <h3><FiClock style={{marginRight: 8}}/> Histórico Recente</h3>
                    <div className="ca-highlight-list" style={{maxHeight: '200px', overflowY: 'auto'}}>
                        {history.map(contract => (
                            <div 
                                key={contract.id} 
                                className="ca-highlight-item" 
                                style={{cursor: 'pointer', padding: '10px'}}
                                onClick={() => loadFromHistory(contract)}
                                role="button"
                                tabIndex={0}
                                aria-label={`Carregar contrato de ${new Date(contract.created_at).toLocaleDateString()}`}
                            >
                                <div style={{display:'flex', alignItems:'center', gap: 8}}>
                                    <FiFileText size={14} color="var(--accent)"/>
                                    <span className="snippet" style={{margin:0, fontSize: '13px'}}>
                                        {new Date(contract.created_at).toLocaleDateString()} - 
                                        {contract.json?.risk?.label || "Análise"}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="ca-card">
              <h3>Pré-visualização</h3>
              <textarea
                className="ca-textarea"
                value={textPreview}
                onChange={e => setTextPreview(e.target.value)}
                placeholder="Cole o texto do contrato aqui..."
                aria-label="Editor de texto do contrato"
              />
            </div>
          </section>

          {/* COLUNA DIREITA */}
          <section className="ca-col">
            <div className={`ca-card ${getRiskClass()}`}>
              <h3>Resultado da Análise</h3>

              {status === "idle" && !analysis && <p className="muted small">Aguardando documento ou selecione do histórico...</p>}
              {status === "processing" && (
                  <div className="fade-in">
                      <div className="skeleton skeleton-text" style={{width: '50%', marginBottom: 20}}></div>
                      <div className="skeleton skeleton-text"></div>
                      <div className="skeleton skeleton-text"></div>
                      <div className="skeleton skeleton-text short"></div>
                  </div>
              )}

              {(status === "done" || analysis) && analysis && (
                <div className="fade-in">
                  <RiskMeter score={analysis.risk?.score || 0} />
                  <p className="small" style={{ lineHeight: 1.6 }}>{analysis.summary}</p>
                  <h4 style={{ marginTop: 20, marginBottom: 10 }}>Pontos de Atenção</h4>
                  <ul className="ca-highlight-list">
                    {analysis.highlights?.map((h, i) => (
                      <li key={i} className="ca-highlight-item">
                        <div className="tag">{h.tag}</div>
                        <div className="snippet">"{h.snippet}"</div>
                        <div className="line muted small">Ref: Linha {h.lineNumber || "?"}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="ca-card">
              <h3>Dúvidas sobre o contrato</h3>
              <div className="ca-chat-box">
                {messages.map(m => (
                  <div key={m.id} className={`ca-msg ${m.role}`}>
                    <ReactMarkdown>{m.text}</ReactMarkdown>
                  </div>
                ))}
              </div>
              <ChatInput onSend={sendChat} disabled={!analysis} />
            </div>
          </section>
        </main>
      </div>

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
        placeholder={disabled ? "Analise um contrato primeiro" : "Pergunte sobre multas, prazos..."} 
        disabled={disabled}
        aria-label="Input de chat do contrato"
      />
      <button 
        type="submit" 
        className="ca-chat-send active" 
        disabled={!val.trim() || disabled}
        aria-label="Enviar mensagem"
      >
        <FiArrowUp />
      </button>
    </form>
  );
}