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

export default function ChatPage() {
    const navigate = useNavigate();
    const user = useLocalUser();
    
    // Estados de Dados
    const [chats, setChats] = useState([]);
    const [activeChat, setActiveChat] = useState(null); // NULL = Tela "Novo Chat"
    const [messages, setMessages] = useState([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    
    // Estados de UI
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [search, setSearch] = useState("");
    const [text, setText] = useState("");
    const [sending, setSending] = useState(false);
    const [attachedFile, setAttachedFile] = useState(null);

    // Refs
    const listRef = useRef(null);
    const textareaRef = useRef(null);
    const assistantMessageRef = useRef(null); 
    
    // REF PARA CORRIGIR O BUG: que estava impedindo que o useEffect limpasse as mensagens ao criar um novo chat
    const ignoreFetchRef = useRef(false);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
    };

    // 1. Carregar Chats
    const loadChats = async () => {
        const userId = user.id || localStorage.getItem("user_id");
        if (userId) {
            try {
                const res = await api.getUserChats(userId);
                // Ordena chats do mais recente para o mais antigo
                const sorted = (res || []).sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
                setChats(sorted);
                return sorted;
            } catch (err) { console.error(err); }
        }
        return [];
    };

    // Carrega chats ao montar e seleciona o primeiro se existir
    useEffect(() => {
        loadChats().then(sortedChats => {
            if (sortedChats.length > 0 && !activeChat) {
                setActiveChat(sortedChats[0]);
            }
        });
    }, []);

    // 2. Carregar Mensagens ao trocar Chat
    useEffect(() => {
        // Se acabamos de criar o chat manualmente, NÃO buscamos do servidor ainda
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
        .catch(err => console.error("Erro msgs:", err))
        .finally(() => setLoadingMessages(false));

    }, [activeChat?.id]);

    const scrollToBottom = () => {
        if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
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

    // 4. Enviar Mensagem (Com Criação Automática e Streaming)
    const handleSend = async () => {
        if (!text.trim() || sending) return;

        const contentToSend = text.trim();
        const fileToSend = attachedFile;
        
        // Limpa input
        setText("");
        setAttachedFile(null);
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
        setSending(true);

        const finalContent = fileToSend ? `${contentToSend} (Arquivo: ${fileToSend})` : contentToSend;

        let targetChatId = activeChat?.id;

        // --- LÓGICA DE CRIAÇÃO PREGUIÇOSA ---
        if (!activeChat) {
            try {
                // Cria chat com nome provisório.
                const newChat = await api.createChat("Nova Conversa");
                
                // IMPORTANTÍSSIMO: Marca para ignorar o próximo fetch do useEffect
                ignoreFetchRef.current = true;

                setChats(prev => [newChat, ...prev]);
                setActiveChat(newChat); 
                targetChatId = newChat.id;
            } catch (e) {
                alert("Erro ao iniciar conversa.");
                setSending(false);
                return;
            }
        }

        // Adiciona mensagem otimista do usuário
        const userMsg = { id: `u-${Date.now()}`, role: 'user', content: finalContent, created_at: new Date().toISOString() };
        setMessages(prev => [...prev, userMsg]);
        setTimeout(scrollToBottom, 50);

        // Adiciona mensagem otimista da IA (Loading)
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
                    
                    // Recarrega a lista de chats para pegar o novo título gerado pela IA
                    const updatedChats = await loadChats();
                    
                    // Atualiza o objeto activeChat para refletir o novo nome sem disparar fetch (pois o ID é o mesmo)
                    const currentUpdated = updatedChats.find(c => c.id === targetChatId);
                    if (currentUpdated) setActiveChat(currentUpdated);
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

    const stopStreaming = () => setSending(false);

    // Botão "Novo Chat" apenas limpa a seleção para estado inicial
    const handleNewChatClick = () => {
        setActiveChat(null);
        setMessages([]);
        if (window.innerWidth < 768) setIsSidebarOpen(false);
    };

    const handleDelete = async (id) => {
        if (!confirm("Excluir conversa?")) return;
        await api.deleteChat(id);
        setChats(chats.filter(c => c.id !== id));
        if (activeChat?.id === id) {
            setActiveChat(null);
            setMessages([]);
        }
    };

    // Render Mensagem
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
            {/* SIDEBAR */}
            <aside className={`fixed-sidebar ${!isSidebarOpen ? 'collapsed' : ''}`}>
                <div className="sidebar-header">
                    {isSidebarOpen && <span style={{fontWeight:'600'}}>Sentry AI</span>}
                    <button className="btn-toggle-sidebar" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                        <FiMenu size={20} />
                    </button>
                </div>

                <button className="btn-new" onClick={handleNewChatClick} title="Novo Chat">
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

                <div className="sidebar-list">
                    {filteredChats.map(chat => (
                        <div 
                            key={chat.id} 
                            className={`chat-item ${activeChat?.id === chat.id ? 'active' : ''}`}
                            onClick={() => { setActiveChat(chat); if(window.innerWidth < 768) setIsSidebarOpen(false); }}
                        >
                            <span className="ci-title">{chat.name}</span>
                            <button className="ci-del" onClick={(e) => { e.stopPropagation(); handleDelete(chat.id); }}>
                                <FiTrash2 size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            </aside>

            {/* MAIN AREA */}
            <main className="chat-main">
                <ChatHeader user={user} onLogout={handleLogout} />
                <header className="chat-header-centered">
                    <div className="ch-info">
                        <h2>{activeChat ? activeChat.name : "Nova Conversa"}</h2>
                        {activeChat && <span className="ch-status">Gemini 2.5 Flash • Online</span>}
                    </div>
                </header>

                <div className="messages-container" ref={listRef}>
                    <div className="messages-content">
                        {/* Empty State: Sem chat ativo OU chat vazio */}
                        {(!activeChat || (activeChat && messages.length === 0 && !loadingMessages)) && (
                            <div className="empty-state">
                                <div className="empty-logo-wrap"><GeminiIcon /></div>
                                <h2>Como posso ajudar hoje?</h2>
                                <p>Sou especializado em legislação brasileira. Pergunte sobre CLT, contratos ou direitos.</p>
                            </div>
                        )}
                        
                        {activeChat && loadingMessages && messages.length === 0 && (
                            <div className="loading-spinner" style={{textAlign:'center', color:'#666', marginTop: 20}}>Carregando histórico...</div>
                        )}
                        
                        {messages.map(renderMessage)}
                    </div>
                </div>

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
                                disabled={sending} 
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