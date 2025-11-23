// src/components/ChatList.jsx
import React from "react";
import { FiPlus, FiTrash2, FiMessageSquare } from "react-icons/fi";

export default function ChatList({
  chats,
  activeChatId,
  onSelect,
  onDelete,
  onNewChat
}) {
  return (
    <aside className="chatlist-container">
      <div className="chatlist-header">
        <h3>Conversas</h3>
        <button className="chatlist-new" onClick={onNewChat}>
          <FiPlus size={18} />
        </button>
      </div>

      <div className="chatlist-items">
        {chats.length === 0 && (
          <div className="chatlist-empty">
            <FiMessageSquare size={26} />
            <p>Nenhuma conversa ainda</p>
          </div>
        )}

        {chats.map((chat) => (
          <div
            key={chat.id}
            className={`chatlist-item ${chat.id === activeChatId ? "active" : ""}`}
            onClick={() => onSelect(chat.id)}
          >
            <span>{chat.name || "Nova conversa"}</span>

            <button
              className="item-delete"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(chat.id);
              }}
            >
              <FiTrash2 size={15} />
            </button>
          </div>
        ))}
      </div>
    </aside>
  );
}
