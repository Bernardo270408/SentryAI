import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { 
    FiArrowUp, FiPlus, FiTrash2, FiSearch, 
    FiMenu, FiPaperclip, FiUser, FiStopCircle, FiX, FiChevronRight 
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion"; // Importação do Framer Motion
import api from "../services/api";
import "../styles/chatpage.css";
import ChatHeader from "../components/ChatHeader";
import toast from "react-hot-toast";

// Helper para obter usuário
function useLocalUser() {
    try {
        const raw = localStorage.getItem("user");
        return raw ? JSON.parse(raw) : { id: null, name: "Usuário" };
    } catch {
        return { id: null, name: "Usuário" };
    }
}

// Variantes de Animação
const msgVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3 } }
};

const sidebarVariants = {
    closed: { x: "-100%", opacity: 0 },
    open: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 30 } }
};

// Ícone SVG do Gemini
const GeminiIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 22C12 22 13.5 17.5 19 12C13.5 6.5 12 2 12 2C12 2 10.5 6.5 5 12C10.5 17.5 12 22 12 22Z" fill="currentColor" />
    </svg>
);

// Componente de Skeleton para Mensagens (Animado)
const MessagesSkeleton = () => (
    <motion.div 
        className="messages-content fade-in"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
    >
        <div className="msg-row user" style={{ opacity: 0.5 }}>
            <div className="msg-avatar skeleton"></div>
            <motion.div 
                className="skeleton" 
                style={{ height: 40, width: '40%', borderRadius: 12 }}
                animate={{ opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
            />
        </div>
        <div className="msg-row assistant" style={{ opacity: 0.5 }}>
            <div className="msg-avatar skeleton"></div>
            <div style={{ width: '60%' }}>
                <motion.div className="skeleton skeleton-text" animate={{ opacity: [0.5, 0.8, 0.5] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.1 }}></motion.div>
                <motion.div className="skeleton skeleton-text" animate={{ opacity: [0.5, 0.8, 0.5] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}></motion.div>
                <motion.div className="skeleton skeleton-text short" animate={{ opacity: [0.5, 0.8, 0.5] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}></motion.div>
            </div>
        </div>
    </motion.div>
);

export default function ChatPage() {
    const navigate = useNavigate();
    const user = useLocalUser();
    
    // Estados de Dados
    const [chats, setChats] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    
    // Estados de UI e Responsividade
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

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
    };

    // Monitora redimensionamento da tela
    useEffect(() => {
        function handleResize() {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
            if (!mobile) setIsSidebarOpen(true);
            else setIsSidebarOpen(false);
        }
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // 1. Carregar Chats
    const loadChats = async () => {
        const userId = user.id || localStorage.getItem("user_id");
        if (userId) {
            try {
                const res = await api.getUserChats(userId);
                const sorted = (res || []).sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
                setChats(sorted);
                return sorted;
            } catch (err) { console.error(err); }
        }
        return [];
    };

    useEffect(() => {
        loadChats().then(sortedChats => {
            if (sortedChats.length > 0 && !activeChat) {
                setActiveChat(sortedChats[0]);
            }
        });
    }, []);

    // 2. Carregar Mensagens ao trocar Chat
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
            const formattedUserMsgs = (userMsgs || []).map(m => ({ 
                ...m, role: 'user', timestamp: new Date(m.created_at) 
            }));
            const formattedAiMsgs = (aiMsgs || []).map(m => ({ 
                ...m, role: 'assistant', timestamp: new Date(m.created_at) 
            }));
            const allMessages = [...formattedUserMsgs, ...formattedAiMsgs];
            allMessages.sort((a, b) => a.timestamp - b.timestamp);

            setMessages(allMessages);
            setTimeout(scrollToBottom, 50);
        })
        .catch(err => toast.error("Erro ao carregar mensagens"))
        .finally(() => setLoadingMessages(false));

    }, [activeChat?.id]);

    const scrollToBottom = () => {
        if (listRef.current) {
            listRef.current.scrollTo({
                top: listRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    };

    // 3. Auto-Resize do Input
    const handleInput = (e) => {
        setText(e.target.value);
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'; 
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // 4. Enviar Mensagem
    const handleSend = async () => {
        if (!text.trim() && !attachedFile) return;
        if (sending) return;

        const contentToSend = text.trim();
        const fileToSend = attachedFile;
        
        setText("");
        setAttachedFile(null);
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
        setSending(true);

        const finalContent = fileToSend ? `${contentToSend} (Arquivo: ${fileToSend})` : contentToSend;

        let targetChatId = activeChat?.id;

        if (!activeChat) {
            try {
                const newChat = await api.createChat("Nova Conversa");
                ignoreFetchRef.current = true;
                setChats(prev => [newChat, ...prev]);
                setActiveChat(newChat); 
                targetChatId = newChat.id;
            } catch (e) {
                toast.error("Erro ao iniciar conversa.");
                setSending(false);
                return;
            }
        }

        const userMsg = { id: `u-${Date.now()}`, role: 'user', content: finalContent, created_at: new Date().toISOString() };
        setMessages(prev => [...prev, userMsg]);
        setTimeout(scrollToBottom, 50);

        const aiTempId = `a-${Date.now()}`;
        const aiMsg = { id: aiTempId, role: 'assistant', content: '', streaming: true };
        setMessages(prev => [...prev, aiMsg]);
        assistantMessageRef.current = aiTempId;

        try {
            await api.streamChatMessage({
                chatId: targetChatId,
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
                    scrollToBottom();
                },
                onEnd: async () => {
                    setMessages(prev => prev.map(m => 
                        m.id === assistantMessageRef.current ? { ...m, streaming: false } : m
                    ));
                    setSending(false);
                    assistantMessageRef.current = null;
                    
                    const updatedChats = await loadChats();
                    const currentUpdated = updatedChats.find(c => c.id === targetChatId);
                    if (currentUpdated) setActiveChat(currentUpdated);
                },
                onError: (err) => {
                    console.error(err);
                    toast.error("Erro na comunicação com a IA");
                    setSending(false);
                }
            });
        } catch (error) {
            setSending(false);
        }
    };

    const stopStreaming = () => setSending(false);

    // Handlers de Interface
    const handleNewChatClick = () => {
        setActiveChat(null);
        setMessages([]);
        if (isMobile) setIsSidebarOpen(false);
    };

    const handleChatSelect = (chat) => {
        setActiveChat(chat);
        if (isMobile) setIsSidebarOpen(false);
    };

    const handleDelete = async (id) => {
        if (!confirm("Excluir conversa permanentemente?")) return;
        try {
            await api.deleteChat(id);
            setChats(chats.filter(c => c.id !== id));
            if (activeChat?.id === id) {
                setActiveChat(null);
                setMessages([]);
            }
            toast.success("Conversa excluída.");
        } catch (e) {
            toast.error("Erro ao excluir.");
        }
    };

    const renderMessage = (msg) => {
        const isUser = msg.role === 'user';
        return (
            <motion.div 
                key={msg.id} 
                className={`msg-row ${isUser ? 'user' : 'assistant'}`}
                variants={msgVariants}
                initial="hidden"
                animate="visible"
                layout="position" // Suaviza o reposicionamento quando novas msgs chegam
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
    };

    const filteredChats = chats.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="chat-root">
            {/* OVERLAY PARA MOBILE */}
            <AnimatePresence>
                {isMobile && isSidebarOpen && (
                    <motion.div 
                        className="sidebar-overlay visible"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* SIDEBAR */}
            {/* Usamos motion.aside para animar a entrada no mobile */}
            <motion.aside 
                className={`fixed-sidebar ${!isSidebarOpen && !isMobile ? 'collapsed' : ''}`}
                // No mobile controlamos via transform X, no desktop deixamos CSS class controlar width
                style={isMobile ? { left: 0 } : {}} 
                variants={isMobile ? sidebarVariants : {}}
                initial={isMobile ? "closed" : false}
                animate={isMobile ? (isSidebarOpen ? "open" : "closed") : false}
            >
                <div className="sidebar-header">
                    {(isSidebarOpen || isMobile) && <span style={{fontWeight:'600'}}>Sentry AI</span>}
                    
                    {isMobile && (
                        <motion.button 
                            className="btn-toggle-sidebar" 
                            onClick={() => setIsSidebarOpen(false)}
                            whileTap={{ scale: 0.9 }}
                            style={{ position: 'static', background: 'transparent', marginLeft: 'auto', padding: 4 }}
                        >
                            <FiX size={20} />
                        </motion.button>
                    )}

                    {!isMobile && (
                        <motion.button 
                            className="btn-toggle-sidebar" 
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            whileTap={{ scale: 0.9 }}
                        >
                            <FiMenu size={20} />
                        </motion.button>
                    )}
                </div>

                <motion.button 
                    className="btn-new" 
                    onClick={handleNewChatClick} 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    title="Novo Chat"
                >
                    <FiPlus /> {(isSidebarOpen || isMobile) && <span>Nova Conversa</span>}
                </motion.button>

                {(isSidebarOpen || isMobile) && (
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

                <div className="sidebar-list">
                    <AnimatePresence initial={false}>
                        {filteredChats.map(chat => (
                            <motion.div 
                                key={chat.id} 
                                className={`chat-item ${activeChat?.id === chat.id ? 'active' : ''}`}
                                onClick={() => handleChatSelect(chat)}
                                layout // Anima a lista quando item é removido
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20, height: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <span className="ci-title">{chat.name}</span>
                                <button 
                                    className="ci-del" 
                                    onClick={(e) => { e.stopPropagation(); handleDelete(chat.id); }}
                                >
                                    <FiTrash2 size={14} />
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </motion.aside>

            {/* BOTÃO FLUTUANTE LATERAL (MOBILE) */}
            <AnimatePresence>
                {isMobile && !isSidebarOpen && (
                    <motion.button 
                        className="mobile-sidebar-toggle"
                        onClick={() => setIsSidebarOpen(true)}
                        initial={{ x: -50 }}
                        animate={{ x: 0 }}
                        exit={{ x: -50 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <FiChevronRight size={20} />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* MAIN AREA */}
            <main className="chat-main">
                <ChatHeader user={user} onLogout={handleLogout} />
                <header className="chat-header-centered">
                    <div className="ch-info">
                        <h2>{activeChat ? activeChat.name : "Nova Conversa"}</h2>
                        {activeChat && <span className="ch-status">Gemini 3 Pro • Online</span>}
                    </div>
                </header>

                <div className="messages-container" ref={listRef}>
                    <div className="messages-content">
                        <AnimatePresence mode="wait">
                            {loadingMessages && messages.length === 0 ? (
                                <MessagesSkeleton key="skeleton" />
                            ) : (
                                <>
                                    {(!activeChat || (activeChat && messages.length === 0)) && (
                                        <motion.div 
                                            key="empty-state"
                                            className="empty-state"
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 0.5 }}
                                        >
                                            <div className="empty-logo-wrap"><GeminiIcon /></div>
                                            <h2>Como posso ajudar hoje?</h2>
                                            <p>Sou especializado em legislação brasileira. Pergunte sobre CLT, contratos ou direitos.</p>
                                        </motion.div>
                                    )}
                                    {messages.map(renderMessage)}
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="input-area-wrapper">
                    <div className="input-container">
                        <AnimatePresence>
                            {attachedFile && (
                                <motion.div 
                                    className="attach-badge"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                >
                                    <FiPaperclip /> {attachedFile}
                                    <button onClick={() => setAttachedFile(null)}>x</button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        
                        <div className="input-row">
                            <motion.button 
                                className="btn-action attach" 
                                onClick={() => document.getElementById('file-up').click()}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <FiPaperclip size={20} />
                            </motion.button>
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
                                disabled={sending} 
                            />

                            <motion.button 
                                className={`btn-action ${sending ? 'stop' : 'send'}`}
                                onClick={sending ? stopStreaming : handleSend}
                                disabled={(!text.trim() && !attachedFile) && !sending}
                                style={sending ? { opacity: 1 } : (!text.trim() && !attachedFile ? { opacity: 0.5, cursor: 'not-allowed' } : {})}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                {sending ? <FiStopCircle size={18} /> : <FiArrowUp size={20} />}
                            </motion.button>
                        </div>
                    </div>
                    <p className="disclaimer-text">A IA pode cometer erros. Consulte um advogado.</p>
                </div>
            </main>
        </div>
    );
}