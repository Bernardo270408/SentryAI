import React, { useEffect, useState } from "react";
import ChatList from "../components/ChatList";
import ChatArea from "../components/ChatArea";
import api from "../services/api";
import NewChatModal from "../components/NewChatModal";

export default function ChatApp() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  async function loadChats() {
    if (!user) return;
    try {
      const list = await api.getUserChats(user.id);
      setChats(list);

      if (list.length > 0 && !activeChatId) {
        setActiveChatId(list[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadChats();
  }, []);

  async function handleCreate(name) {
    const created = await api.createChat(name);
    setChats(prev => [...prev, created]);
    setActiveChatId(created.id);
  }

  async function handleDelete(id) {
    await api.deleteChat(id);
    setChats(prev => prev.filter(c => c.id !== id));

    if (activeChatId === id) setActiveChatId(null);
  }

  // PEGAR CHAT ATUAL
  const activeChat = chats.find(c => c.id === activeChatId) || null;

  // ADICIONA MENSAGEM DENTRO DO CHAT CERTO
  function handleSendMessage(newMsg) {
    if (!activeChatId) return;

    setChats(prev =>
      prev.map(c =>
        c.id === activeChatId
          ? { ...c, messages: [...(c.messages || []), newMsg] }
          : c
      )
    );
  }

  return (
    <>
      {modalOpen && (
        <NewChatModal
          onClose={() => setModalOpen(false)}
          onCreate={handleCreate}
        />
      )}

      <div className="chat-layout">
        <ChatList
          chats={chats}
          activeChatId={activeChatId}
          onSelect={setActiveChatId}
          onDelete={handleDelete}
          onNewChat={() => setModalOpen(true)}
        />

        <ChatArea
          selectedChat={activeChat}
          messages={activeChat?.messages ?? []}
          onSendMessage={handleSendMessage}
          userName={user?.name || ""}
        />
      </div>
    </>
  );
}
