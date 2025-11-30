import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { 
    FiArrowUp, FiPlus, FiTrash2, FiSearch, 
    FiMenu, FiPaperclip, FiUser, FiStopCircle 
} from "react-icons/fi";
import api from "../services/api";
import "../styles/chatpage.css";
import ChatHeader from "../components/ChatHeader";

// Helper para obter usuário
function useLocalUser() {
    try {
        const raw = localStorage.getItem("user");
        return raw ? JSON.parse(raw) : { id: null, name: "Usuário" };
    } catch {
        return { id: null, name: "Usuário" };
    }
}

// Ícone SVG do Gemini
const GeminiIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 22C12 22 13.5 17.5 19 12C13.5 6.5 12 2 12 2C12 2 10.5 6.5 5 12C10.5 17.5 12 22 12 22Z" fill="currentColor" />
    </svg>
);

// --- MODAL CREATE CHAT ---
function CreateChatModal({ isOpen, onClose, onCreate }) {
    const [chatName, setChatName] = useState("");
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
    }, [isOpen]);

    if (!isOpen) return null;

    const submit = (e) => {
        e.preventDefault();
        if (chatName.trim()) {
            onCreate(chatName.trim());
            setChatName("");
            onClose();
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h3>Nova Conversa</h3>
                <p>Escolha um nome para identificar seu caso.</p>
                <form onSubmit={submit}>
                    <input 
                        ref={inputRef}
                        className="modal-input" 
                        placeholder="Ex: Dúvida sobre Férias" 
                        value={chatName}
                        onChange={e => setChatName(e.target.value)}
                    />
                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="btn-primary" disabled={!chatName.trim()}>Criar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// --- MAIN COMPONENT ---
export default function ChatPage() {
    const navigate = useNavigate();
    const user = useLocalUser();
    
    // Estados de Dados
    const [chats, setChats] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    
    // Estados de UI
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [text, setText] = useState("");
    const [sending, setSending] = useState(false);
    const [attachedFile, setAttachedFile] = useState(null);

    // Refs
    const listRef = useRef(null);
    const textareaRef = useRef(null);
    const assistantMessageRef = useRef(null); // Para streaming

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
    };

    // 1. Carregar Chats
    useEffect(() => {
        const userId = user.id || localStorage.getItem("user_id");
        if (userId) {
            api.getUserChats(userId).then(res => {
                setChats(res || []);
                if (res?.length > 0 && !activeChat) setActiveChat(res[0]);
            }).catch(err => console.error(err));
        }
    }, []);

    // 2. Carregar Mensagens ao trocar Chat (CORRIGIDO)
    useEffect(() => {
        if (!activeChat) {
            setMessages([]);
            return;
        }
        setLoadingMessages(true);

        // Busca mensagens de Usuário E da IA
        Promise.all([
            api.getUserMessages(activeChat.id),
            api.getAIMessages(activeChat.id)
        ])
        .then(([userMsgs, aiMsgs]) => {
            // Formata User Messages
            const formattedUserMsgs = (userMsgs || []).map(m => ({ 
                ...m, 
                role: 'user', 
                timestamp: new Date(m.created_at) 
            }));
            
            // Formata AI Messages
            const formattedAiMsgs = (aiMsgs || []).map(m => ({ 
                ...m, 
                role: 'assistant', 
                timestamp: new Date(m.created_at) 
            }));

            // Junta e Ordena
            const allMessages = [...formattedUserMsgs, ...formattedAiMsgs];
            allMessages.sort((a, b) => a.timestamp - b.timestamp);

            setMessages(allMessages);
            setTimeout(scrollToBottom, 50);
        })
        .catch(err => {
            console.error("Erro ao carregar mensagens:", err);
        })
        .finally(() => setLoadingMessages(false));

    }, [activeChat]);

    const scrollToBottom = () => {
        if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    };

    // 3. Auto-Resize do Input
    const handleInput = (e) => {
        setText(e.target.value);
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'; // Reseta para calcular
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // 4. Enviar Mensagem (Com Streaming)
    const handleSend = async () => {
        if (!text.trim() || !activeChat || sending) return;

        const contentToSend = text.trim();
        const fileToSend = attachedFile;
        
        // Limpa input
        setText("");
        setAttachedFile(null);
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
        setSending(true);

        const finalContent = fileToSend ? `${contentToSend} (Arquivo: ${fileToSend})` : contentToSend;

        // Optimistic User Message
        const userMsg = {
            id: `u-${Date.now()}`,
            role: 'user',
            content: finalContent,
            created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, userMsg]);
        setTimeout(scrollToBottom, 50);

        // Optimistic AI Message (Loading)
        const aiTempId = `a-${Date.now()}`;
        const aiMsg = {
            id: aiTempId,
            role: 'assistant',
            content: '',
            streaming: true
        };
        setMessages(prev => [...prev, aiMsg]);
        assistantMessageRef.current = aiTempId;

        try {
            await api.streamChatMessage({
                chatId: activeChat.id,
                content: finalContent,
                onChunk: (token) => {
                    setMessages(prev => {
                        const list = [...prev];
                        const idx = list.findIndex(m => m.id === assistantMessageRef.current);
                        if (idx !== -1) {
                            list[idx] = { ...list[idx], content: list[idx].content + token };
                        }
                        return list;
                    });
                    scrollToBottom(); // Auto scroll suave
                },
                onEnd: async () => {
                    // Finaliza estado de streaming
                    setMessages(prev => prev.map(m => 
                        m.id === assistantMessageRef.current ? { ...m, streaming: false } : m
                    ));
                    setSending(false);
                    assistantMessageRef.current = null;
                },
                onError: (err) => {
                    console.error(err);
                    setSending(false);
                }
            });
        } catch (error) {
            setSending(false);
        }
    };

    function stopStreaming() {
        setSending(false);
    }

    // Render Item do Chat (Markdown)
    const renderMessage = (msg) => {
        const isUser = msg.role === 'user';
        return (
            <div key={msg.id} className={`msg-row ${isUser ? 'user' : 'assistant'}`}>
                <div className="msg-avatar">
                    {isUser ? <FiUser size={18} /> : <GeminiIcon />}
                </div>
                <div className="msg-bubble">
                    {msg.streaming && !msg.content ? (
                        <div className="typing-indicator"><span></span><span></span><span></span></div>
                    ) : (
                        <div className="markdown-body">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Filtros e Ações
    const filteredChats = chats.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

    const handleCreate = async (name) => {
        try {
            const newChat = await api.createChat(name);
            setChats([newChat, ...chats]);
            setActiveChat(newChat);
        } catch (e) { alert("Erro ao criar chat"); }
    };

    const handleDelete = async (id) => {
        if (!confirm("Excluir conversa?")) return;
        await api.deleteChat(id);
        setChats(chats.filter(c => c.id !== id));
        if (activeChat?.id === id) setActiveChat(null);
    };

    return (
        <div className="chat-root">
            <CreateChatModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onCreate={handleCreate} />

            {/* SIDEBAR */}
            <aside className={`fixed-sidebar ${!isSidebarOpen ? 'collapsed' : ''}`}>
                {/* Header Sidebar */}
                <div className="sidebar-header">
                    {isSidebarOpen && <span style={{fontWeight:'600'}}>Sentry AI</span>}
                    <button className="btn-toggle-sidebar" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                        <FiMenu size={20} />
                    </button>
                </div>

                {/* Botão Novo Chat */}
                <button className="btn-new" onClick={() => setIsModalOpen(true)} title="Novo Chat">
                    <FiPlus /> {isSidebarOpen && <span>Nova Conversa</span>}
                </button>

                {isSidebarOpen && (
                    <div className="sidebar-search">
                        <FiSearch size={14} color="gray" />
                        <input 
                            placeholder="Buscar..." 
                            value={search} 
                            onChange={e => setSearch(e.target.value)}
                            style={{background:'transparent', border:'none', color:'white', width:'100%', outline:'none', marginLeft:8}}
                        />
                    </div>
                )}

                {/* Lista de Chats */}
                <div className="sidebar-list">
                    {filteredChats.map(chat => (
                        <div 
                            key={chat.id} 
                            className={`chat-item ${activeChat?.id === chat.id ? 'active' : ''}`}
                            onClick={() => setActiveChat(chat)}
                        >
                            <span className="ci-title">{chat.name}</span>
                            <button className="ci-del" onClick={(e) => { e.stopPropagation(); handleDelete(chat.id); }}>
                                <FiTrash2 size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            </aside>

            {/* AREA PRINCIPAL */}
            <main className="chat-main">
                <ChatHeader user={user} onLogout={handleLogout} />
                {/* Header da Área de Chat */}
                <header className="chat-header-centered">
                    <div className="ch-info">
                        <h2>{activeChat ? activeChat.name : "Bem-vindo"}</h2>
                        {activeChat && <span className="ch-status">Gemini 2.5 Flash • Online</span>}
                    </div>
                </header>

                {/* Lista de Mensagens */}
                <div className="messages-container" ref={listRef}>
                    <div className="messages-content">
                        {!activeChat && (
                            <div className="empty-state">
                                <div className="empty-logo-wrap"><GeminiIcon /></div>
                                <h2>Como posso ajudar hoje?</h2>
                                <p>Sou especializado em legislação brasileira. Pergunte sobre CLT, contratos ou direitos do consumidor.</p>
                                <button className="btn-create-chat-center" onClick={() => setIsModalOpen(true)}>
                                    <FiPlus /> Iniciar Chat
                                </button>
                            </div>
                        )}
                        {activeChat && loadingMessages && <div className="loading-spinner" style={{textAlign:'center', color:'#666'}}>Carregando...</div>}
                        {messages.map(renderMessage)}
                    </div>
                </div>

                {/* Input Area */}
                <div className="input-area-wrapper">
                    <div className="input-container">
                        {attachedFile && (
                            <div className="attach-badge">
                                <FiPaperclip /> {attachedFile}
                                <button onClick={() => setAttachedFile(null)}>x</button>
                            </div>
                        )}
                        
                        <div className="input-row">
                            <button className="btn-action attach" onClick={() => document.getElementById('file-up').click()}>
                                <FiPaperclip size={20} />
                            </button>
                            <input 
                                id="file-up" type="file" hidden 
                                onChange={(e) => e.target.files[0] && setAttachedFile(e.target.files[0].name)} 
                            />

                            <textarea 
                                ref={textareaRef} 
                                className="chat-textarea" 
                                placeholder="Digite sua dúvida jurídica..." 
                                value={text} 
                                onChange={handleInput} 
                                onKeyDown={handleKeyDown} 
                                rows={1} 
                                disabled={!activeChat || sending} 
                            />

                            <button 
                                className={`btn-action ${sending ? 'stop' : 'send'}`}
                                onClick={sending ? stopStreaming : handleSend}
                                disabled={!text.trim() && !sending}
                            >
                                {sending ? <FiStopCircle size={18} /> : <FiArrowUp size={20} />}
                            </button>
                        </div>
                    </div>
                    <p className="disclaimer-text">A IA pode cometer erros. Consulte um advogado.</p>
                </div>
            </main>
        </div>
    );
}