import React, { useState, useRef } from "react";
import { FiZap, FiPlay, FiArrowUp, FiPaperclip, FiArrowUpCircle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import FooterContent from "../components/FooterComponent";
import "../styles/contractAnalysis.css";
import api from "../services/api";

/* COMPONENTE VISUAL DA BARRA DE RISCO */
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

/* FUNÇÃO DE ANÁLISE HEURÍSTICA (FALLBACK) */
function heuristicAnalyze(text) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const keywords = [
    { k: ["multa", "penalidade"], tag: "Penalidade" },
    { k: ["rescis", "distrato"], tag: "Rescisão" },
    { k: ["prazo", "vigência"], tag: "Prazos" },
    { k: ["indeniza", "danos"], tag: "Indenização" },
    { k: ["exclusiv", "não concorrência"], tag: "Exclusividade" },
  ];

  const highlights = [];
  let riskPoints = 0;

  lines.forEach((ln, i) => {
    const low = ln.toLowerCase();
    keywords.forEach((kw) => {
      if (kw.k.some(w => low.includes(w))) {
        riskPoints += 15;
        highlights.push({
          id: `${i}-${kw.tag}`,
          lineNumber: i + 1,
          snippet: ln.slice(0, 150) + "...",
          tag: kw.tag
        });
      }
    });
  });

  const riskScore = Math.min(100, riskPoints);
  let riskLabel = "Baixo";
  if (riskScore > 30) riskLabel = "Médio";
  if (riskScore > 60) riskLabel = "Alto";

  return {
    highlights,
    summary: lines.slice(0, 5).join(" ").slice(0, 400) + "...",
    risk: { score: riskScore, label: riskLabel },
  };
}

/* MAIN COMPONENT */
export default function ContractAnalysis() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [textPreview, setTextPreview] = useState("");
  const [status, setStatus] = useState("idle");
  const [analysis, setAnalysis] = useState(null);
  const [messages, setMessages] = useState([]);
  const fileRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

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
  }

  async function handleAnalyze() {
    if (!file && !textPreview.trim()) return alert("Envie um arquivo ou cole texto.");
    setStatus("processing");

    try {
      if (api?.analyzeContract) {
        const form = new FormData();
        if (file) form.append("file", file);
        else form.append("text", textPreview);

        const res = await api.analyzeContract(form);
        setAnalysis(res);
      } else {
        setTimeout(() => setAnalysis(heuristicAnalyze(textPreview)), 1500);
      }
    } catch (err) {
      console.error(err);
      alert("Erro na análise. Usando modo offline.");
      setAnalysis(heuristicAnalyze(textPreview));
    } finally {
      setStatus("done");
    }
  }

  async function sendChat(msg) {
    if (!msg.trim()) return;
    setMessages(prev => [...prev, { id: Date.now(), role: "user", text: msg }]);
    
    try {
      if (api?.chatContract && analysis) {
        const res = await api.chatContract({ message: msg, context: analysis.summary });
        setMessages(prev => [...prev, { id: Date.now()+1, role: "assistant", text: res.reply }]);
      } else {
        setMessages(prev => [...prev, { id: Date.now()+1, role: "assistant", text: "IA indisponível no momento." }]);
      }
    } catch {
      setMessages(prev => [...prev, { id: Date.now()+1, role: "assistant", text: "Erro ao conectar com a IA." }]);
    }
  }

  const getRiskClass = () => {
    if (!analysis) return "";
    const s = analysis.risk.score;
    if (s > 60) return "risk-bg-danger";
    if (s > 30) return "risk-bg-warning";
    return "risk-bg-safe";
  };

  return (
    // ESTRUTURA ALTERADA: contract-page-root envolve tudo
    <div className="contract-page-root">
      
      {/* Wrapper limita apenas o conteúdo principal */}
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
              <h3>1. Documento</h3>
              <div
                className={`ca-upload ${isDragging ? "dragover" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
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
              >
                <FiPlay /> {status === "processing" ? "Analisando IA..." : "Analisar Risco"}
              </button>
            </div>

            <div className="ca-card">
              <h3>Pré-visualização</h3>
              <textarea
                className="ca-textarea"
                value={textPreview}
                onChange={e => setTextPreview(e.target.value)}
                placeholder="Cole o texto do contrato aqui..."
              />
            </div>
          </section>

          {/* COLUNA DIREITA */}
          <section className="ca-col">
            <div className={`ca-card ${getRiskClass()}`}>
              <h3>Resultado da Análise</h3>

              {status === "idle" && <p className="muted small">Aguardando documento...</p>}
              {status === "processing" && <p className="muted small">A IA está lendo o contrato...</p>}

              {status === "done" && analysis && (
                <div className="fade-in">
                  <RiskMeter score={analysis.risk.score} />
                  <p className="small" style={{ lineHeight: 1.6 }}>{analysis.summary}</p>
                  <h4 style={{ marginTop: 20, marginBottom: 10 }}>Pontos de Atenção</h4>
                  <ul className="ca-highlight-list">
                    {analysis.highlights.map((h, i) => (
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

      {/* Footer fora do wrapper limitado */}
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
        placeholder={disabled ? "Analise o contrato primeiro" : "Pergunte sobre multas, prazos..."} 
        disabled={disabled}
      />
      <button type="submit" className="ca-chat-send active" disabled={!val.trim() || disabled}>
        <FiArrowUp />
      </button>
    </form>
  );
}