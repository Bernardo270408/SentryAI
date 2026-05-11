import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { 
    FiArrowUp, FiPlus, FiTrash2, FiSearch, 
    FiMenu, FiPaperclip, FiUser, FiStopCircle, FiX, FiChevronRight 
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

import api from "../services/api";
import "../styles/chatpage.css";
import ChatHeader from "../components/ChatHeader";

// Helper para obter usuário de forma segura
function useLocalUser() {
    try {
        const raw = localStorage.getItem("user");
        return raw ? JSON.parse(raw) : { id: null, name: "Usuário" };
    } catch {
        return { id: null, name: "Usuário" };
    }
}

// Variantes de Animação otimizadas (sem 'layout' para evitar lag no streaming)
const msgVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

const sidebarMobileVariants = {
    closed: { x: "-100%", transition: { type: "tween", duration: 0.3 } },
    open: { x: 0, transition: { type: "tween", duration: 0.3 } }
};

// Ícone SVG do Gemini
const GeminiIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 22C12 22 13.5 17.5 19 12C13.5 6.5 12 2 12 2C12 2 10.5 6.5 5 12C10.5 17.5 12 22 12 22Z" fill="currentColor" />
    </svg>
);

// Componente de Skeleton para Loading
const MessagesSkeleton = () => (
    <motion.div className="messages-content fade-in" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <div className="msg-row user" style={{ opacity: 0.5 }}>
            <div className="msg-avatar skeleton"></div>
            <motion.div className="skeleton" style={{ height: 40, width: '40%', borderRadius: 12 }} animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }} />
        </div>
        <div className="msg-row assistant" style={{ opacity: 0.5 }}>
            <div className="msg-avatar skeleton"></div>
            <div style={{ width: '60%' }}>
                <motion.div className="skeleton skeleton-text" animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.1 }} />
                <motion.div className="skeleton skeleton-text short" animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }} />
            </div>
        </div>
    </motion.div>
);

export default function ChatPage() {
    const navigate = useNavigate();
    const user = useLocalUser();
    
    // Estados
    const [chats, setChats] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    
    const [search, setSearch] = useState("");
    const [text, setText] = useState("");
    const [sending, setSending] = useState(false);
    const [attachedFile, setAttachedFile] = useState(null);

    // Refs
    const listRef = useRef(null);
    const textareaRef = useRef(null);
    const assistantMessageRef = useRef(null); 
    const ignoreFetchRef = useRef(false);

    const handleLogout = useCallback(() => {
        localStorage.clear();
        navigate("/");
    }, [navigate]);

    // Monitora redimensionamento
    useEffect(() => {
        let timeoutId;
        const handleResize = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                const mobile = window.innerWidth <= 768;
                setIsMobile(mobile);
                setIsSidebarOpen(!mobile);
            }, 100);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Scroll automático suavizado
    const scrollToBottom = useCallback(() => {
        if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    }, []);

    // Acompanha as mensagens para sempre rolar para baixo
    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    // Carregar Chats
    const loadChats = useCallback(async () => {
        const userId = user.id || localStorage.getItem("user_id");
        if (!userId) return [];
        try {
            const res = await api.getUserChats(userId);
            const sorted = (res || []).sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
            setChats(sorted);
            return sorted;
        } catch (err) { 
            console.error(err); 
            return [];
        }
    }, [user.id]);

    useEffect(() => {
        loadChats().then(sortedChats => {
            if (sortedChats.length > 0 && !activeChat) setActiveChat(sortedChats[0]);
        });
    }, [loadChats, activeChat]);

    // Carregar Mensagens ao trocar Chat
    useEffect(() => {
        if (ignoreFetchRef.current) {
            ignoreFetchRef.current = false;
            return;
        }
        if (!activeChat) {
            setMessages([]);
            return;
        }

        setLoadingMessages(true);
        Promise.all([
            api.getUserMessages(activeChat.id),
            api.getAIMessages(activeChat.id)
        ])
        .then(([userMsgs, aiMsgs]) => {
            const formatted = [
                ...(userMsgs || []).map(m => ({ ...m, role: 'user', timestamp: new Date(m.created_at) })),
                ...(aiMsgs || []).map(m => ({ ...m, role: 'assistant', timestamp: new Date(m.created_at) }))
            ].sort((a, b) => a.timestamp - b.timestamp);

            setMessages(formatted);
        })
        .catch(() => toast.error("Erro ao carregar histórico."))
        .finally(() => setLoadingMessages(false));

    }, [activeChat?.id]);

    // Auto-Resize do Input
    const handleInput = (e) => {
        setText(e.target.value);
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'; 
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Enviar Mensagem
    const handleSend = async () => {
        if ((!text.trim() && !attachedFile) || sending) return;

        const contentToSend = text.trim();
        const fileToSend = attachedFile;
        const finalContent = fileToSend ? `${contentToSend} (Arquivo: ${fileToSend})` : contentToSend;

        setText("");
        setAttachedFile(null);
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
        setSending(true);

        let targetChatId = activeChat?.id;

        // Se não tiver chat, cria um novo
        if (!activeChat) {
            try {
                const newChat = await api.createChat("Nova Conversa");
                ignoreFetchRef.current = true;
                setChats(prev => [newChat, ...prev]);
                setActiveChat(newChat); 
                targetChatId = newChat.id;
            } catch (e) {
                toast.error("Erro ao criar conversa.");
                setSending(false);
                return;
            }
        }

        // Adiciona mensagem do usuário otimisticamente
        setMessages(prev => [...prev, { id: `u-${Date.now()}`, role: 'user', content: finalContent }]);

        // Prepara mensagem da IA (vazia e com streaming)
        const aiTempId = `a-${Date.now()}`;
        setMessages(prev => [...prev, { id: aiTempId, role: 'assistant', content: '', streaming: true }]);
        assistantMessageRef.current = aiTempId;

        try {
            await api.streamChatMessage({
                chatId: targetChatId,
                content: finalContent,
                onChunk: (token) => {
                    setMessages(prev => prev.map(m => 
                        m.id === assistantMessageRef.current ? { ...m, content: m.content + token } : m
                    ));
                },
                onEnd: async () => {
                    setMessages(prev => prev.map(m => 
                        m.id === assistantMessageRef.current ? { ...m, streaming: false } : m
                    ));
                    setSending(false);
                    assistantMessageRef.current = null;
                    
                    // Atualiza o nome do chat caso a IA tenha renomeado no backend
                    const updatedChats = await loadChats();
                    const currentUpdated = updatedChats.find(c => c.id === targetChatId);
                    if (currentUpdated && currentUpdated.name !== activeChat?.name) {
                        setActiveChat(currentUpdated);
                    }
                },
                onError: () => {
                    toast.error("Conexão instável com a IA.");
                    setSending(false);
                }
            });
        } catch {
            setSending(false);
        }
    };

    const handleNewChatClick = () => {
        setActiveChat(null);
        setMessages([]);
        if (isMobile) setIsSidebarOpen(false);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Excluir esta conversa?")) return;
        try {
            await api.deleteChat(id);
            setChats(prev => prev.filter(c => c.id !== id));
            if (activeChat?.id === id) {
                setActiveChat(null);
                setMessages([]);
            }
            toast.success("Conversa excluída.");
        } catch {
            toast.error("Erro ao excluir.");
        }
    };

    const filteredChats = chats.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="chat-root">
            {/* OVERLAY MOBILE */}
            <AnimatePresence>
                {isMobile && isSidebarOpen && (
                    <motion.div 
                        className="sidebar-overlay visible"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* SIDEBAR */}
            <motion.aside 
                className={`fixed-sidebar ${!isSidebarOpen && !isMobile ? 'collapsed' : ''}`}
                variants={isMobile ? sidebarMobileVariants : {}}
                initial={isMobile ? "closed" : false}
                animate={isMobile ? (isSidebarOpen ? "open" : "closed") : false}
            >
                <div className="sidebar-header">
                    {(isSidebarOpen || isMobile) && <span className="brand-title">Histórico</span>}
                    
                    <button 
                        className="btn-toggle-sidebar" 
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    >
                        {isMobile ? <FiX size={20} /> : <FiMenu size={20} />}
                    </button>
                </div>

                <button className="btn-new" onClick={handleNewChatClick} title="Novo Chat">
                    <FiPlus /> {(isSidebarOpen || isMobile) && <span>Nova Conversa</span>}
                </button>

                {(isSidebarOpen || isMobile) && (
                    <div className="sidebar-search">
                        <FiSearch size={14} />
                        <input 
                            placeholder="Buscar..." 
                            value={search} 
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                )}

                <div className="sidebar-list">
                    <AnimatePresence>
                        {filteredChats.map(chat => (
                            <motion.div 
                                key={chat.id} 
                                className={`chat-item ${activeChat?.id === chat.id ? 'active' : ''}`}
                                onClick={() => { setActiveChat(chat); if(isMobile) setIsSidebarOpen(false); }}
                                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, height: 0 }}
                            >
                                <span className="ci-title">{chat.name}</span>
                                <button className="ci-del" onClick={(e) => { e.stopPropagation(); handleDelete(chat.id); }}>
                                    <FiTrash2 size={14} />
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </motion.aside>

            {/* TOGGLE MOBILE FLUTUANTE */}
            <AnimatePresence>
                {isMobile && !isSidebarOpen && (
                    <motion.button 
                        className="mobile-sidebar-toggle"
                        onClick={() => setIsSidebarOpen(true)}
                        initial={{ x: -50 }} animate={{ x: 0 }} exit={{ x: -50 }}
                    >
                        <FiChevronRight size={20} />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* MAIN AREA */}
            <main className="chat-main">
                <ChatHeader user={user} onLogout={handleLogout} />
                


                <div className="messages-container" ref={listRef}>
                    <div className="messages-content">
                        <AnimatePresence mode="wait">
                            {loadingMessages && messages.length === 0 ? (
                                <MessagesSkeleton key="skeleton" />
                            ) : (
                                <>
                                    {(!activeChat || (activeChat && messages.length === 0)) && (
                                        <motion.div 
                                            key="empty-state" className="empty-state"
                                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                        >
                                            <div className="empty-logo-wrap"><GeminiIcon /></div>
                                            <h2>Como posso ajudar hoje?</h2>
                                            <p>Sou o SentryAI, seu assistente jurídico especializado.</p>
                                        </motion.div>
                                    )}

                                    {messages.map((msg) => {
                                        const isUser = msg.role === 'user';
                                        return (
                                            <motion.div 
                                                key={msg.id} 
                                                className={`msg-row ${isUser ? 'user' : 'assistant'}`}
                                                variants={msgVariants}
                                                initial="hidden" animate="visible"
                                                // REMOVIDO: layout="position" -> Isso causava o lag massivo no streaming.
                                            >
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
                                            </motion.div>
                                        );
                                    })}
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* ÁREA DE INPUT */}
                <div className="input-area-wrapper">
                    <div className="input-container">
                        <AnimatePresence>
                            {attachedFile && (
                                <motion.div className="attach-badge" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8 }}>
                                    <FiPaperclip size={12} /> <span className="text-truncate">{attachedFile}</span>
                                    <button onClick={() => setAttachedFile(null)}><FiX size={14}/></button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        
                        <div className="input-row">
                            <button className="btn-action attach" onClick={() => document.getElementById('file-up').click()}>
                                <FiPaperclip size={20} />
                            </button>
                            <input id="file-up" type="file" hidden onChange={(e) => e.target.files[0] && setAttachedFile(e.target.files[0].name)} />

                            <textarea 
                                ref={textareaRef} 
                                className="chat-textarea" 
                                placeholder="Envie uma mensagem para o SentryAI..." 
                                value={text} 
                                onChange={handleInput} 
                                onKeyDown={handleKeyDown} 
                                rows={1} 
                                disabled={sending} 
                            />

                            <button 
                                className={`btn-action ${sending ? 'stop' : 'send'}`}
                                onClick={sending ? () => setSending(false) : handleSend}
                                disabled={(!text.trim() && !attachedFile) && !sending}
                            >
                                {sending ? <FiStopCircle size={20} /> : <FiArrowUp size={20} />}
                            </button>
                        </div>
                    </div>
                    <p className="disclaimer-text">A IA pode cometer erros. Consulte as informações criticamente.</p>
                </div>
            </main>
        </div>
    );
}