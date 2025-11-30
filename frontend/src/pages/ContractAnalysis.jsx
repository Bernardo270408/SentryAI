// src/pages/ContractAnalysis.jsx
import React, { useState, useRef } from "react";
import {
  FiZap,
  FiUploadCloud,
  FiPlay,
  FiArrowUp,
  FiPaperclip,
  FiSend,
  FiArrowUpCircle,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import FooterContent from "../components/FooterComponent";
import "../styles/contractAnalysis.css";
import api from "../services/api";

/* --------------------------------------------------
   HEURISTIC ANALYSIS – fallback quando API não existe
-------------------------------------------------- */
function heuristicAnalyze(text) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const keywords = [
    { k: ["multa"], tag: "Penalidade" },
    { k: ["rescis"], tag: "Rescisão" },
    { k: ["prazo", "vigência"], tag: "Prazos" },
    { k: ["indeniza"], tag: "Indenização" },
    { k: ["horas extras", "jornada"], tag: "Jornada" },
    { k: ["confidencial"], tag: "Confidencialidade" },
    { k: ["exclusiv"], tag: "Exclusividade" },
    { k: ["foro"], tag: "Foro" },
    { k: ["reajuste"], tag: "Reajuste" },
  ];

  const highlights = [];
  lines.forEach((ln, i) => {
    const low = ln.toLowerCase();
    keywords.forEach((kw) => {
      if (kw.k.some(w => low.includes(w))) {
        highlights.push({
          id: `${i}-${kw.tag}`,
          lineNumber: i + 1,
          snippet: ln.slice(0, 250) + (ln.length > 250 ? "…" : ""),
          tag: kw.tag,
          reason: `Contém termo relacionado a "${kw.tag}".`
        });
      }
    });
  });

  const riskScore = Math.min(
    100,
    Math.round((highlights.length / Math.max(1, lines.length)) * 240)
  );
  const riskLabel = riskScore > 40 ? (riskScore > 70 ? "Alto" : "Médio") : "Baixo";

  return {
    highlights,
    summary: lines.slice(0, 5).join(" ").slice(0, 700),
    risk: { score: riskScore, label: riskLabel },
  };
}

/* --------------------------------------------------
                  COMPONENTE PRINCIPAL
-------------------------------------------------- */
export default function ContractAnalysis() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [textPreview, setTextPreview] = useState("");
  const [status, setStatus] = useState("idle");
  const [analysis, setAnalysis] = useState(null);
  const [messages, setMessages] = useState([]);
  const fileRef = useRef(null);

  /* -------- Drag & Drop state -------- */
  const [isDragging, setIsDragging] = useState(false);

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);

    const f = e.dataTransfer.files?.[0];
    if (f) processFile(f);
  }

  function handleDrag(e) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    setIsDragging(false);
  }

  async function processFile(f) {
    setFile(f);
    setAnalysis(null);

    if (f.type.startsWith("text/") || /\.(txt|md|csv)$/i.test(f.name)) {
      const reader = new FileReader();
      reader.onload = e => setTextPreview(String(e.target.result));
      reader.readAsText(f);
    } else {
      setTextPreview(`Arquivo: ${f.name}\nPrévia indisponível.`);
    }
  }

  async function handleFile(ev) {
    const f = ev.target.files?.[0];
    if (f) processFile(f);
  }

  /* -------- EXECUTAR ANÁLISE -------- */
  async function handleAnalyze() {
    if (!file && !textPreview.trim()) {
      return alert("Envie um arquivo ou cole algum texto.");
    }

    setStatus("processing");

    // Se existir API real
    if (api?.analyzeContract) {
      try {
        const form = new FormData();
        if (file) form.append("file", file);
        if (!file) form.append("text", textPreview);

        const res = await api.analyzeContract(form);
        setAnalysis(res);
        setStatus("done");
        return;
      } catch {}
    }

    // fallback
    const heur = heuristicAnalyze(textPreview || "");
    setAnalysis(heur);
    setStatus("done");
  }

  /* -------- CHAT -------- */
  async function sendChat(msg) {
    if (!msg.trim()) return;

    setMessages(m => [...m, { id: Date.now(), role: "user", text: msg }]);

    if (api?.chatContract) {
      try {
        const res = await api.chatContract({
          message: msg,
          context: analysis?.summary || ""
        });

        setMessages(prev => [
          ...prev,
          {
            id: Date.now() + 1,
            role: "assistant",
            text: res?.reply || "Sem resposta."
          }
        ]);
        return;
      } catch {}
    }

    // fallback
    setMessages(prev => [
      ...prev,
      {
        id: Date.now() + 2,
        role: "assistant",
        text: "Análise local realizada. Consulte o nível de risco."
      }
    ]);
  }

  /* -------- GERAR JSON -------- */
  function downloadReport() {
    if (!analysis) return;

    const blob = new Blob([JSON.stringify(analysis, null, 2)], {
      type: "application/json",
    });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "contract-analysis.json";
    a.click();
  }

  /* --------------------------------------------------
                    RENDERIZAÇÃO
  -------------------------------------------------- */
  return (
    <div className="ca-wrapper">
      
      {/* HEADER */}
      <header className="ca-header">
        <div className="ca-header-left">
          <FiZap size={22} />
          <span>Análise de Contrato</span>
        </div>

      </header>

      <main className="ca-main">
        {/* ----------------- COLUNA ESQUERDA ----------------- */}
        <section className="ca-col">

          {/* BLOCO UPLOAD */}
          <div className="ca-card">
            <h3>1. Enviar documento</h3>

            <div
              className={`ca-dropzone ${isDragging ? "dragging" : ""}`}
              onDragOver={handleDrag}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
            >
              <FiArrowUpCircle size={38} className="ca-upload-icon" />
              <p>{file ? file.name : "Arraste aqui ou clique para enviar"}</p>

              <input
                type="file"
                ref={fileRef}
                onChange={handleFile}
                hidden
              />
            </div>

            <button
              className="ca-btn primary full ca-send-btn"
              onClick={handleAnalyze}
              disabled={status === "processing"}
            >
              <FiPlay />
              {status === "processing" ? "Analisando..." : "Analisar documento"}
            </button>
          </div>

          {/* PREVIEW */}
          <div className="ca-card">
            <h3>Pré-visualização</h3>
            <textarea
              className="ca-textarea"
              value={textPreview}
              onChange={e => setTextPreview(e.target.value)}
              placeholder="Cole aqui o texto do contrato..."
            />
          </div>
        </section>

        {/* ----------------- COLUNA DIREITA ----------------- */}
        <section className="ca-col">

          {/* RESULTADOS */}
          <div className="ca-card">
            <h3>Resultado</h3>

            {status === "idle" && <p className="muted small">Nenhuma análise realizada.</p>}
            {status === "processing" && <p className="muted small">Processando…</p>}

            {status === "done" && analysis && (
              <>
                <p className="small muted">{analysis.summary}</p>

                <div className="ca-risk">
                  <span>Nível de risco:</span>
                  <div className={`ca-risk-tag ${analysis.risk.label.toLowerCase()}`}>
                    {analysis.risk.label} • {analysis.risk.score}
                  </div>
                </div>

                <h4>Destaques</h4>
                <ul className="ca-highlight-list">
                  {analysis.highlights.map(h => (
                    <li key={h.id} className="ca-highlight-item">
                      <div className="tag">{h.tag}</div>
                      <div className="snippet">{h.snippet}</div>
                      <div className="line muted small">Linha {h.lineNumber}</div>
                    </li>
                  ))}
                </ul>

                <button className="ca-btn outline" onClick={downloadReport}>
                  Baixar relatório JSON
                </button>
              </>
            )}
          </div>

          {/* CHAT */}
          <div className="ca-card">
            <h3>Chat sobre o documento</h3>

            <div className="ca-chat-box">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`ca-msg ${msg.role === "user" ? "user" : "assistant"}`}
                >
                  {msg.text}
                </div>
              ))}
            </div>

            <ChatInput disabled={!analysis} onSend={sendChat} />
          </div>

        </section>
      </main>

      <FooterContent />
    </div>
  );
}

/* --------------------------------------------------
                INPUT DO CHAT
-------------------------------------------------- */
function ChatInput({ onSend, disabled }) {
  const [msg, setMsg] = useState("");

  return (
    <form
      className="ca-chat-input"
      onSubmit={(e) => {
        e.preventDefault();
        if (!msg.trim()) return;
        onSend(msg);
        setMsg("");
      }}
    >

      {/* Ícone de anexar arquivo – só visual */}
      <FiPaperclip className="ca-chat-clip" />

      <input
        className="ca-chat-field"
        disabled={disabled}
        placeholder={disabled ? "Realize a análise primeiro" : "Digite sua dúvida..."}
        value={msg}
        onChange={e => setMsg(e.target.value)}
      />

      {/* Ícone de setinha para cima */}
      <button
        className={`ca-chat-send ${msg.trim() && !disabled ? "active" : ""}`}
        type="submit"
        disabled={!msg.trim() || disabled}
      >
        <FiArrowUp size={18} />
      </button>
    </form>
  );
}
