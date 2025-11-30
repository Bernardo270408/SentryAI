import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
    FiArrowUp, 
    FiPlus, 
    FiTrash2, 
    FiSearch, 
    FiZap, 
    FiFileText, 
    FiLayers, 
    FiAlertTriangle,
    FiMenu, 
    FiPaperclip 
} from "react-icons/fi";
import api from "../services/api";
import "../styles/chatpage.css";

// Função utilitária para buscar o usuário
function useLocalUser() {
    try {
        const raw = localStorage.getItem("user");
        if (!raw) return { id: localStorage.getItem("user_id"), name: "Usuário" };
        return JSON.parse(raw);
    } catch {
        return { id: localStorage.getItem("user_id"), name: "Usuário" };
    }
}

// SVG DO POWERED BY (Ícone do Gemini/AI)
const GptIcon = () => (
    <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="icon-lg">
        <path d="M11.2475 18.25C10.6975 18.25 10.175 18.1455 9.67999 17.9365C9.18499 17.7275 8.74499 17.436 8.35999 17.062C7.94199 17.205 7.50749 17.2765 7.05649 17.2765C6.31949 17.2765 5.63749 17.095 5.01049 16.732C4.38349 16.369 3.87749 15.874 3.49249 15.247C3.11849 14.62 2.93149 13.9215 2.93149 13.1515C2.93149 12.8325 2.97549 12.486 3.06349 12.112C2.62349 11.705 2.28249 11.2375 2.04049 10.7095C1.79849 10.1705 1.67749 9.6095 1.67749 9.0265C1.67749 8.4325 1.80399 7.8605 2.05699 7.3105C2.30999 6.7605 2.66199 6.2875 3.11299 5.8915C3.57499 5.4845 4.10849 5.204 4.71349 5.05C4.83449 4.423 5.08749 3.862 5.47249 3.367C5.86849 2.861 6.35249 2.465 6.92449 2.179C7.49649 1.893 8.10699 1.75 8.75599 1.75C9.30599 1.75 9.82849 1.8545 10.3235 2.0635C10.8185 2.2725 11.2585 2.564 11.6435 2.938C12.0615 2.795 12.496 2.7235 12.947 2.7235C13.684 2.7235 14.366 2.905 14.993 3.268C15.62 3.631 16.1205 4.126 16.4945 4.753C16.8795 5.38 17.072 6.0785 17.072 6.8485C17.072 7.1675 17.028 7.514 16.94 7.888C17.38 8.295 17.721 8.768 17.963 9.307C18.205 9.835 18.326 10.3905 18.326 10.9735C18.326 11.5675 18.1995 12.1395 17.9465 12.6895C17.6935 13.2395 17.336 13.718 16.874 14.125C16.423 14.521 15.895 14.796 15.29 14.95C15.169 15.577 14.9105 16.138 14.5145 16.633C14.1295 17.139 13.651 17.535 13.079 17.821C12.507 18.107 11.8965 18.25 11.2475 18.25ZM7.17199 16.1875C7.72199 16.1875 8.20049 16.072 8.60749 15.841L11.7095 14.059C11.8195 13.982 11.8745 13.8775 11.8745 13.7455V12.3265L7.88149 14.62C7.63949 14.763 7.39749 14.763 7.15549 14.62L4.03699 12.8215C4.03699 12.8545 4.03149 12.893 4.02049 12.937C4.02049 12.981 4.02049 13.047 4.02049 13.135C4.02049 13.696 4.15249 14.213 4.41649 14.686C4.69149 15.148 5.07099 15.511 5.55499 15.775C6.03899 16.05 6.57799 16.1875 7.17199 16.1875ZM7.33699 13.498C7.40299 13.531 7.46349 13.5475 7.51849 13.5475C7.57349 13.5475 7.62849 13.531 7.68349 13.498L8.92099 12.7885L4.94449 10.4785C4.70249 10.3355 4.58149 10.121 4.58149 9.835V6.2545C4.03149 6.4965 3.59149 6.8705 3.26149 7.3765C2.93149 7.8715 2.76649 8.4215 2.76649 9.0265C2.76649 9.5655 2.90399 10.0825 3.17899 10.5775C3.45399 11.0725 3.81149 11.4465 4.25149 11.6995L7.33699 13.498ZM11.2475 17.161C11.8305 17.161 12.3585 17.029 12.8315 16.765C13.3045 16.501 13.6785 16.138 13.9535 15.676C14.2285 15.214 14.366 14.697 14.366 14.125V10.561C14.366 10.429 14.311 10.33 14.201 10.264L12.947 9.538V14.1415C12.947 14.4275 12.826 14.642 12.584 14.785L9.46549 16.5835C10.0045 16.9685 10.5985 17.161 11.2475 17.161ZM11.8745 11.122V8.878L10.01 7.822L8.12899 8.878V11.122L10.01 12.178L11.8745 11.122ZM7.05649 5.8585C7.05649 5.5725 7.17749 5.358 7.41949 5.215L10.538 3.4165C9.99899 3.0315 9.40499 2.839 8.75599 2.839C8.17299 2.839 7.64499 2.971 7.17199 3.235C6.69899 3.499 6.32499 3.862 6.04999 4.324C5.78599 4.786 5.65399 5.303 5.65399 5.875V9.4225C5.65399 9.5545 5.70899 9.659 5.81899 9.736L7.05649 10.462V5.8585ZM15.4385 13.7455C15.9885 13.5035 16.423 13.1295 16.742 12.6235C17.072 12.1175 17.237 11.5675 17.237 10.9735C17.237 10.4345 17.0995 9.9175 16.8245 9.4225C16.5495 8.9275 16.192 8.5535 15.752 8.3005L12.6665 6.5185C12.6005 6.4745 12.54 6.458 12.485 6.469C12.43 6.469 12.375 6.4855 12.32 6.5185L11.0825 7.2115L15.0755 9.538C15.1965 9.604 15.2845 9.692 15.3395 9.802C15.4055 9.901 15.4385 10.022 15.4385 10.165V13.7455ZM12.122 5.3635C12.364 5.2095 12.606 5.2095 12.848 5.3635L15.983 7.195C15.983 7.118 15.983 7.019 15.983 6.898C15.983 6.37 15.851 5.8695 15.587 5.3965C15.334 4.9125 14.9655 4.5275 14.4815 4.2415C14.0085 3.9555 13.4585 3.8125 12.8315 3.8125C12.2815 3.8125 11.803 3.928 11.396 4.159L8.29399 5.941C8.18399 6.018 8.12899 6.1225 8.12899 6.2545V7.6735L12.122 5.3635Z"></path>
    </svg>
);

// ------------------------------------------------------------------
// COMPONENTE: MODAL DE CRIAÇÃO DE CHAT
// ------------------------------------------------------------------
function CreateChatModal({ isOpen, onClose, onCreate }) {
    const [chatName, setChatName] = useState("");

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (chatName.trim()) {
            onCreate(chatName.trim());
            setChatName("");
            onClose(); 
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>Iniciar Novo Chat</h3>
                <p className="muted">Dê um título para sua nova conversa para manter tudo organizado.</p>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Ex: Dúvida sobre Férias Vencidas"
                        value={chatName}
                        onChange={(e) => setChatName(e.target.value)}
                        className="modal-input"
                        required
                        autoFocus
                    />
                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="btn-secondary">
                            Cancelar
                        </button>
                        <button type="submit" className="btn-primary" disabled={!chatName.trim()}>
                            <FiPlus size={16} style={{ marginRight: '6px' }}/> Criar Conversa
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ------------------------------------------------------------------
// COMPONENTE: EMPTY STATE
// ------------------------------------------------------------------
function EmptyChatState({ onOpenModal }) {
    const features = [
        { icon: <FiZap size={24} />, title: "Dúvidas Rápida sobre Direitos", description: "Pergunte sobre férias, 13º, horas extras e FGTS. A resposta é simples e direta." },
        { icon: <FiFileText size={24} />, title: "Entenda Documentos (Contratos)", description: "Cole um trecho de contrato ou aviso e a IA explica o que realmente significa em linguagem fácil." },
        { icon: <FiLayers size={24} />, title: "Cálculos e Valores", description: "Ajuda a estimar valores de rescisão, seguro-desemprego ou multas, baseando-se em suas informações." },
        { icon: <FiSearch size={24} />, title: "O que a Lei diz sobre...", description: "Busque a lei de forma rápida sobre licença-maternidade, faltas justificadas ou regras de demissão." },
    ];

    return (
        <div className="empty-state">
            <h1 className="logo-placeholder">SENTRY AI</h1> 
            <h2 className="title">Seu Assistente de Direitos do Trabalho</h2>
            <p className="subtitle muted">
                Pergunte o que você precisa saber sobre o seu trabalho. Respostas claras, rápidas e confiáveis.
            </p>

            <button className="btn-create-chat-center" onClick={onOpenModal}>
                <FiPlus /> Iniciar Novo Chat
            </button>

            <div className="feature-grid">
                {features.map((f, index) => (
                    <div key={index} className="feature-card">
                        <div className="icon-wrap">{f.icon}</div>
                        <h3>{f.title}</h3>
                        <p className="muted">{f.description}</p>
                    </div>
                ))}
            </div>
            <div className="disclaimer-large">
                <FiAlertTriangle size={18} /> Lembrete: A IA ajuda, mas para casos oficiais ou disputas, procure sempre um advogado ou sindicato.
            </div>
        </div>
    );
}

// ------------------------------------------------------------------
// PÁGINA PRINCIPAL
// ------------------------------------------------------------------
export default function ChatPage() {
    const navigate = useNavigate();
    const user = useLocalUser();

    const [chats, setChats] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    
    // ESTADOS UI
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false); 
    const [text, setText] = useState("");
    const [sending, setSending] = useState(false);
    const [attachedFile, setAttachedFile] = useState(null); 
    const [search, setSearch] = useState("");

    // REFS
    const assistantMessageRef = useRef(null);
    const listRef = useRef(null);
    const inputRef = useRef(null);

    // Carregar Chats
    useEffect(() => {
        let mounted = true;
        async function load() {
            try {
                const userId = user?.id || localStorage.getItem("user_id");
                if (!userId) return;
                const res = await api.getUserChats(userId);
                if (!mounted) return;
                setChats(res || []);
                if ((res || []).length > 0 && !activeChat) setActiveChat(res[0]);
            } catch (err) {
                console.error("Erro ao carregar chats", err);
            }
        }
        load();
        return () => (mounted = false);
    }, [user?.id]);

    // Carregar Mensagens
    useEffect(() => {
        if (!activeChat) {
            setMessages([]);
            return;
        }
        let mounted = true;
        async function loadMessages() {
            setLoadingMessages(true);
            try {
                const msgs = await api.getMessages(activeChat.id);
                if (!mounted) return;
                setMessages(msgs || []);
                setTimeout(scrollToBottom, 40);
            } catch (err) {
                console.error("Erro ao buscar mensagens", err);
            } finally {
                if (mounted) setLoadingMessages(false);
            }
        }
        loadMessages();
        return () => (mounted = false);
    }, [activeChat]);

    const scrollToBottom = useCallback(() => {
        const el = listRef.current;
        if (!el) return;
        el.scrollTop = el.scrollHeight + 200;
    }, []);

    // Criar Chat
    async function handleCreateChat(name) {
        try {
            const chat = await api.createChat(name);
            setChats((c) => [chat, ...c]);
            setActiveChat(chat);
            setTimeout(() => inputRef.current?.focus(), 100);
        } catch (err) {
            console.error("Erro ao criar chat", err);
            alert("Não foi possível iniciar a conversa");
        }
    }
    
    function handleOpenCreateChatModal() {
        setIsModalOpen(true);
    }

    function handleSelectChat(chat) {
        setActiveChat(chat);
    }

    function stopStreaming() {
        // Implementação futura com AbortController se necessário
        // Como o fetch é uma Promise única no api.js, o cancelamento exige sinal externo
        // Por hora, apenas visualmente paramos de atualizar
        setSending(false);
    }
    
    function handleAttach(e) {
        if (e.target.files.length > 0) {
            setAttachedFile(e.target.files[0].name);
        }
    }

    // --- LÓGICA DE ENVIO (UPDATED) ---
    async function handleSend(e) {
        e?.preventDefault?.();
        const content = text.trim();
        if (!content || !activeChat || sending) return;

        setText("");
        const attached = attachedFile;
        setAttachedFile(null);
        setSending(true);

        const contentWithAttachment = attached ? `${content} (Anexo: ${attached})` : content;

        // Optimistic UI - Mensagem do Usuário
        const userMsg = {
            id: `u-${Date.now()}`,
            role: "user",
            content: contentWithAttachment,
            created_at: new Date().toISOString(),
            pending: true,
        };

        setMessages((m) => [...m, userMsg]);
        setTimeout(scrollToBottom, 40);

        // Optimistic UI - Mensagem da IA (Vazia/Carregando)
        const assistantMsg = {
            id: `a-temp-${Date.now()}`,
            role: "assistant",
            content: "",
            streaming: true,
            created_at: new Date().toISOString(),
        };

        setMessages((m) => [...m, assistantMsg]);
        assistantMessageRef.current = assistantMsg.id;

        try {
            // CHAMADA AO STREAMING (CORRIGIDA)
            await api.streamChatMessage({
                chatId: activeChat.id,
                content: contentWithAttachment,
                onChunk: (token) => {
                    setMessages((prev) => {
                        const copy = [...prev];
                        const idx = copy.findIndex((x) => x.id === assistantMessageRef.current);
                        if (idx === -1) return prev;
                        
                        // Concatena o token recebido
                        const currentContent = copy[idx].content || "";
                        copy[idx] = { ...copy[idx], content: currentContent + token };
                        return copy;
                    });
                    scrollToBottom();
                },
                onEnd: async () => {
                    setMessages((prev) =>
                        prev.map((m) => (m.id === assistantMessageRef.current ? { ...m, streaming: false } : m))
                    );
                    assistantMessageRef.current = null;
                    
                    // Sincroniza histórico real com backend para garantir IDs corretos
                    try {
                        const msgs = await api.getMessages(activeChat.id);
                        if (msgs && msgs.length > 0) {
                            setMessages(msgs);
                        }
                    } catch {}
                    
                    setSending(false);
                    setTimeout(scrollToBottom, 40);
                },
                onError: (err) => {
                    console.error("Erro no stream:", err);
                    setMessages((prev) =>
                        prev.map((m) => (m.id === assistantMessageRef.current ? { 
                            ...m, 
                            streaming: false,
                            content: m.content + "\n[Erro na conexão ou resposta interrompida.]" 
                        } : m))
                    );
                    setSending(false);
                    assistantMessageRef.current = null;
                },
            });
        } catch (err) {
            console.error("Erro crítico ao enviar mensagem", err);
            setSending(false);
        }
    }

    function handleKeyDown(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") handleSend(e);
    }

    async function handleDeleteChat(chatId) {
        if (!confirm("Quer apagar esta conversa para sempre?")) return; 
        try {
            await api.deleteChat(chatId);
            setChats((c) => c.filter((x) => x.id !== chatId));
            if (activeChat?.id === chatId) setActiveChat(null);
        } catch {}
    }

    function renderMessage(msg) {
        const isUser = msg.role === "user";
        return (
            <div key={msg.id} className={`msg-bubble ${isUser ? "user" : "assistant"} ${msg.streaming ? "streaming" : ""}`}>
                <div
                    className="msg-content"
                    dangerouslySetInnerHTML={{ __html: escapeHtml(msg.content || "") }}
                />
                <div className="msg-meta muted">
                    {isUser ? "Você" : "Sentry AI"} {msg.streaming ? "• gerando..." : ""}
                </div>
            </div>
        );
    }

    function escapeHtml(text = "") {
        return String(text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\n/g, "<br/>");
    }

    const filtered = chats.filter((c) =>
        (c.name || "").toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="chat-root">

            {/* MODAL */}
            <CreateChatModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onCreate={handleCreateChat}
            />

            {/* SIDEBAR */}
            <aside className={`fixed-sidebar glass ${!isSidebarOpen ? "collapsed" : ""}`}>
                <button className="btn-new" onClick={handleOpenCreateChatModal}>
                    <FiPlus /> Novo Chat
                </button>

                {isSidebarOpen && (
                    <div className="sidebar-search">
                        <FiSearch className="icon" />
                        <input placeholder="Buscar conversas..." value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                )}
                
                <div className="sidebar-header">
                    <button className="btn-toggle-sidebar" onClick={() => setIsSidebarOpen(s => !s)}>
                        <FiMenu size={20} />
                    </button>
                    {isSidebarOpen && <div className="sidebar-brand">SENTRY AI</div>}
                </div>

                {isSidebarOpen && (
                    <div className="sidebar-list">
                        {filtered.map((c) => (
                            <div
                                key={c.id}
                                className={`chat-item ${activeChat?.id === c.id ? "active" : ""}`}
                                onClick={() => handleSelectChat(c)}
                            >
                                <div className="ci-avatar">{(c.name || "C")[0]}</div>
                                <div className="ci-info">
                                    <div className="ci-title">{c.name}</div>
                                </div>
                                <button
                                    className="ci-del"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteChat(c.id);
                                    }}
                                >
                                    <FiTrash2 />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {!isSidebarOpen && (
                    <div className="sidebar-collapsed-footer">
                        <GptIcon />
                        <div className="vertical-text">
                            Alimentado por Gemini 3.0
                        </div>
                    </div>
                )}

                {isSidebarOpen && (
                    <div className="sidebar-footer">
                        Logado como <strong>{user?.name?.split(" ")[0]}</strong>
                    </div>
                )}
            </aside>

            {/* MAIN */}
            <main className={`chat-main ${!isSidebarOpen ? "expanded" : ""}`}>
                {(activeChat || chats.length > 0) && (
                    <header className="chat-header glass-header">
                        <button 
                            className="btn-toggle-main" 
                            onClick={() => setIsSidebarOpen(s => !s)}
                            style={{ marginRight: '15px', padding: '8px', background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer' }}
                        >
                            <FiMenu size={20} />
                        </button>
                        <div>
                            <div className="ch-title">{activeChat ? activeChat.name : "Selecione uma Conversa"}</div>
                            <div className="ch-sub muted">
                                {activeChat ? `Converse com a IA sobre o seu direito` : "Utilize a barra lateral para gerenciar suas conversas."}
                            </div>
                        </div>

                        {activeChat && sending && (
                            <button className="btn-stop" onClick={stopStreaming}>Parar Resposta</button>
                        )}
                    </header>
                )}

                <div
                    ref={listRef}
                    className={`messages-list ${messages.length === 0 && !activeChat ? "center-content" : ""}`}
                >
                    {loadingMessages && <div className="muted loading-indicator">Carregando mensagens...</div>}
                    
                    {!activeChat && messages.length === 0 && !loadingMessages && (
                        <EmptyChatState onOpenModal={handleOpenCreateChatModal} />
                    )}

                    {activeChat && messages.map(renderMessage)}
                </div>

                <div className="floating-input-wrap">
                    {attachedFile && (
                        <div className="attached-file-preview">
                            <FiPaperclip size={14} /> <span>{attachedFile}</span>
                            <button onClick={() => setAttachedFile(null)} className="clear-attach-btn">
                                &times;
                            </button>
                        </div>
                    )}
                    <form className="floating-pill glass-pill" onSubmit={handleSend} onKeyDown={handleKeyDown}>
                        
                        <label htmlFor="file-attach" className="pill-attach" title="Anexar arquivo">
                            <FiPaperclip size={20} />
                            <input 
                                type="file" 
                                id="file-attach" 
                                style={{ display: 'none' }} 
                                onChange={handleAttach} 
                                disabled={!activeChat || sending}
                            />
                        </label>

                        <textarea
                            ref={inputRef}
                            className="pill-input"
                            placeholder={activeChat ? "Pergunte sobre seus direitos (Ctrl+Enter para enviar)" : "Selecione uma conversa para digitar"}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            disabled={!activeChat || sending}
                            rows={1}
                        />

                        <button
                            className={`pill-send ${text.trim() && activeChat && !sending ? "enabled" : "disabled"}`}
                            disabled={!text.trim() || !activeChat || sending}
                        >
                            <FiArrowUp size={20} />
                        </button>
                    </form>
                    <div className="disclaimer muted">
                        Sentry AI. Apenas para consultas. Para ações legais ou oficiais, consulte um profissional.
                    </div>
                </div>
            </main>
        </div>
    );
}