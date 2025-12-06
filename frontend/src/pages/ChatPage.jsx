import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { 
    FiArrowUp, FiPlus, FiTrash2, FiSearch, 
    FiMenu, FiPaperclip, FiUser, FiStopCircle 
} from "react-icons/fi";
import api from "../services/api";
import "../styles/chatpage.css";
import ChatHeader from "../components/ChatHeader";
import toast from "react-hot-toast";

function useLocalUser() {
    try {
        const raw = localStorage.getItem("user");
        return raw ? JSON.parse(raw) : { id: null, name: "Usuário" };
    } catch {
        return { id: null, name: "Usuário" };
    }
}

const GeminiIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 22C12 22 13.5 17.5 19 12C13.5 6.5 12 2 12 2C12 2 10.5 6.5 5 12C10.5 17.5 12 22 12 22Z" fill="currentColor" />
    </svg>
);

// Componente de Skeleton para Mensagens
const MessagesSkeleton = () => (
    <div className="messages-content fade-in">
        <div className="msg-row user" style={{ opacity: 0.5 }}>
            <div className="msg-avatar skeleton"></div>
            <div className="skeleton" style={{ height: 40, width: '40%', borderRadius: 12 }}></div>
        </div>
        <div className="msg-row assistant" style={{ opacity: 0.5 }}>
            <div className="msg-avatar skeleton"></div>
            <div style={{ width: '60%' }}>
                <div className="skeleton skeleton-text"></div>
                <div className="skeleton skeleton-text"></div>
                <div className="skeleton skeleton-text short"></div>
            </div>
        </div>
        <div className="msg-row assistant" style={{ opacity: 0.5 }}>
            <div className="msg-avatar skeleton"></div>
            <div style={{ width: '70%' }}>
                <div className="skeleton skeleton-text"></div>
                <div className="skeleton skeleton-text short"></div>
            </div>
        </div>
    </div>
);

export default function ChatPage() {
    const navigate = useNavigate();
    const user = useLocalUser();
    
    const [chats, setChats] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [search, setSearch] = useState("");
    const [text, setText] = useState("");
    const [sending, setSending] = useState(false);
    const [attachedFile, setAttachedFile] = useState(null);

    const listRef = useRef(null);
    const textareaRef = useRef(null);
    const assistantMessageRef = useRef(null); 
    const ignoreFetchRef = useRef(false);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
    };

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
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    };

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

    const handleSend = async () => {
        if (!text.trim() && !attachedFile) return; // Corrigido lógica para aceitar arquivo sem texto
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

    const handleNewChatClick = () => {
        setActiveChat(null);
        setMessages([]);
        if (window.innerWidth < 768) setIsSidebarOpen(false);
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

    const filteredChats = chats.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="chat-root">
            <aside className={`fixed-sidebar ${!isSidebarOpen ? 'collapsed' : ''}`}>
                <div className="sidebar-header">
                    {isSidebarOpen && <span style={{fontWeight:'600'}}>Sentry AI</span>}
                    <button 
                        className="btn-toggle-sidebar" 
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        aria-label="Alternar barra lateral"
                    >
                        <FiMenu size={20} />
                    </button>
                </div>

                <button 
                    className="btn-new" 
                    onClick={handleNewChatClick} 
                    title="Novo Chat"
                    aria-label="Nova conversa"
                >
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
                            aria-label="Buscar conversas"
                        />
                    </div>
                )}

                <div className="sidebar-list">
                    {filteredChats.map(chat => (
                        <div 
                            key={chat.id} 
                            className={`chat-item ${activeChat?.id === chat.id ? 'active' : ''}`}
                            onClick={() => { setActiveChat(chat); if(window.innerWidth < 768) setIsSidebarOpen(false); }}
                            role="button"
                            tabIndex={0}
                            aria-selected={activeChat?.id === chat.id}
                        >
                            <span className="ci-title">{chat.name}</span>
                            <button 
                                className="ci-del" 
                                onClick={(e) => { e.stopPropagation(); handleDelete(chat.id); }}
                                aria-label="Excluir conversa"
                            >
                                <FiTrash2 size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            </aside>

            <main className="chat-main">
                <ChatHeader user={user} onLogout={handleLogout} />
                <header className="chat-header-centered">
                    <div className="ch-info">
                        <h2>{activeChat ? activeChat.name : "Nova Conversa"}</h2>
                        {activeChat && <span className="ch-status">Gemini 2.5 Pro • Online</span>}
                    </div>
                </header>

                <div className="messages-container" ref={listRef}>
                    <div className="messages-content">
                        {loadingMessages && messages.length === 0 ? (
                            <MessagesSkeleton />
                        ) : (
                            <>
                                {(!activeChat || (activeChat && messages.length === 0)) && (
                                    <div className="empty-state fade-in">
                                        <div className="empty-logo-wrap"><GeminiIcon /></div>
                                        <h2>Como posso ajudar hoje?</h2>
                                        <p>Sou especializado em legislação brasileira. Pergunte sobre CLT, contratos ou direitos.</p>
                                    </div>
                                )}
                                {messages.map(renderMessage)}
                            </>
                        )}
                    </div>
                </div>

                <div className="input-area-wrapper">
                    <div className="input-container">
                        {attachedFile && (
                            <div className="attach-badge">
                                <FiPaperclip /> {attachedFile}
                                <button onClick={() => setAttachedFile(null)} aria-label="Remover anexo">x</button>
                            </div>
                        )}
                        
                        <div className="input-row">
                            <button 
                                className="btn-action attach" 
                                onClick={() => document.getElementById('file-up').click()}
                                aria-label="Anexar arquivo"
                            >
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
                                disabled={sending} 
                                aria-label="Mensagem"
                            />

                            <button 
                                className={`btn-action ${sending ? 'stop' : 'send'}`}
                                onClick={sending ? stopStreaming : handleSend}
                                disabled={(!text.trim() && !attachedFile) && !sending}
                                aria-label={sending ? "Parar resposta" : "Enviar mensagem"}
                                style={sending ? { opacity: 1 } : (!text.trim() && !attachedFile ? { opacity: 0.5, cursor: 'not-allowed' } : {})}
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