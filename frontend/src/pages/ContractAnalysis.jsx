import React, { useState, useRef, useEffect } from "react";
import { FiZap, FiPlay, FiArrowUp, FiPaperclip, FiArrowUpCircle, FiClock, FiFileText } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import toast from "react-hot-toast";
import FooterContent from "../components/FooterComponent";
import "../styles/contractAnalysis.css";
import api from "../services/api"; // Certifique-se que o caminho está correto

// --- Subcomponente RiskMeter (Mantido igual) ---
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

// --- Componente Principal ---
export default function ContractAnalysis() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [textPreview, setTextPreview] = useState("");
  const [status, setStatus] = useState("idle"); // idle, processing, done
  const [analysis, setAnalysis] = useState(null);
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]);
  
  const fileRef = useRef(null);
  const pollingRef = useRef(null); // Ref para guardar o ID do timer
  const [isDragging, setIsDragging] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  // Carregar histórico ao montar
  useEffect(() => {
    loadHistory();
    // Cleanup: Se o usuário sair da página, para o polling
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
    setStatus("idle"); // Reseta status ao trocar arquivo
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
        
        // Verifica o label definido no Python (initial_json vs updated_json)
        const currentLabel = updatedContract.json?.risk?.label;

        if (currentLabel === "Processando") {
            // Se ainda está processando, chama a si mesmo daqui a 2 segundos
            pollingRef.current = setTimeout(() => pollAnalysisStatus(contractId), 2000);
        } else {
            // Análise finalizada (ou erro capturado no backend)
            setAnalysis(updatedContract.json);
            setStatus("done");
            toast.success("Análise finalizada!");
            loadHistory(); // Atualiza a lista lateral para mostrar o status novo
        }
    } catch (error) {
        console.error("Erro no polling:", error);
        // Não paramos o loading imediatamente em caso de erro de rede transiente,
        // mas se for 404 ou algo grave, deveríamos parar.
        // Por segurança, vamos tentar mais uma vez ou parar se falhar muito (simplificado aqui):
        toast.error("Erro ao verificar status. Tente recarregar o histórico.");
        setStatus("done");
    }
  };

  async function handleAnalyze() {
    if (!file && !textPreview.trim()) return toast.error("Envie um arquivo ou cole texto.");
    if (!user?.id) return toast.error("Faça login para analisar.");

    // Limpa polling anterior se existir
    if (pollingRef.current) clearTimeout(pollingRef.current);

    setStatus("processing");
    const toastId = toast.loading("Iniciando análise com IA...");

    try {
      const form = new FormData();
      form.append("user_id", user.id);
      
      if (file) form.append("file", file);
      else form.append("text", textPreview);

      // 1. Envia para o backend (recebe 202 Accepted)
      const res = await api.analyzeContract(form);
      
      // O endpoint retorna { message, contract, status }
      const contractData = res.contract;

      if (!contractData || !contractData.id) {
          throw new Error("Resposta inválida do servidor");
      }

      // Define estado inicial (que mostra "A IA está analisando..." na UI se o skeleton não cobrir)
      setAnalysis(contractData.json);

      // 2. Inicia o monitoramento (Polling)
      pollAnalysisStatus(contractData.id);

      toast.dismiss(toastId);
      // Nota: Não damos setStatus("done") aqui. O polling fará isso.

    } catch (err) {
      console.error(err);
      toast.error("Erro na requisição: " + (err.body?.error || err.message), { id: toastId });
      setStatus("idle");
    }
  }

  function loadFromHistory(contract) {
      // Se clicar no histórico em um item que ainda está "Processando", retomamos o polling
      if (contract.json?.risk?.label === "Processando") {
          setStatus("processing");
          setAnalysis(contract.json);
          setTextPreview(contract.text_content || "Conteúdo sendo processado..."); 
          pollAnalysisStatus(contract.id);
          return;
      }

      // Carregamento normal
      if (contract.json) {
          setAnalysis(contract.json);
          // O backend Python salva o texto original? Se sim, mostre. Se não, mostre aviso.
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
            context: analysis.summary, // Passa o resumo como contexto
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
    // Se estiver processando, pode retornar neutro
    if (status === "processing") return "";
    
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
                <FiPlay /> {status === "processing" ? "Analisando..." : "Analisar e Salvar"}
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
                            >
                                <div style={{display:'flex', alignItems:'center', gap: 8}}>
                                    <FiFileText size={14} color="var(--accent)"/>
                                    <span className="snippet" style={{margin:0, fontSize: '13px'}}>
                                        {new Date(contract.created_at).toLocaleDateString()} - 
                                        {/* Mostra label ou '...' se estiver processando */}
                                        <strong> {contract.json?.risk?.label || "..."}</strong>
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
              
              {/* Exibe Skeleton Loading ENQUANTO status === processing */}
              {status === "processing" && (
                  <div className="fade-in">
                      <p className="small muted">A IA está lendo o contrato (isso leva ~10s)...</p>
                      <div className="skeleton skeleton-text" style={{width: '50%', marginBottom: 20}}></div>
                      <div className="skeleton skeleton-text"></div>
                      <div className="skeleton skeleton-text"></div>
                      <div className="skeleton skeleton-text short"></div>
                  </div>
              )}

              {/* Exibe Resultado APENAS SE status === done E analysis existe */}
              {status === "done" && analysis && (
                <div className="fade-in">
                  <RiskMeter score={analysis.risk?.score || 0} />
                  
                  {/* Verifica se deu erro no backend (baseado no seu código Python de exceção) */}
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
                            <li key={i} className="ca-highlight-item">
                                <div className="tag">{h.tag}</div>
                                <div className="snippet">"{h.snippet}"</div>
                                <div className="line muted small">{h.explanation}</div>
                            </li>
                            ))}
                        </ul>
                      </>
                  )}
                </div>
              )}
            </div>

            <div className="ca-card">
              <h3>Dúvidas sobre o contrato</h3>
              <div className="ca-chat-box">
                {messages.length === 0 && <p className="muted small" style={{textAlign:'center', marginTop: 20}}>Faça perguntas sobre o contrato analisado.</p>}
                {messages.map(m => (
                  <div key={m.id} className={`ca-msg ${m.role}`}>
                    <ReactMarkdown>{m.text}</ReactMarkdown>
                  </div>
                ))}
              </div>
              {/* Desabilita chat se não tiver análise pronta */}
              <ChatInput onSend={sendChat} disabled={status !== "done" || !analysis} />
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
        placeholder={disabled ? "Aguarde a análise..." : "Pergunte sobre multas, prazos..."} 
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