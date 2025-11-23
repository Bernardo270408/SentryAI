// src/components/ChatMessage.jsx
import React from "react";
import { FaRegUserCircle } from "react-icons/fa";
import { GiArtificialIntelligence } from "react-icons/gi";

export default function ChatMessage({ role, content }) {
  const isUser = role === "user";

  return (
    <div className={`chat-msg ${isUser ? "user" : "ai"}`}>
      {!isUser && (
        <div className="chat-avatar">
          <GiArtificialIntelligence size={20} />
        </div>
      )}

      <div className="chat-bubble">
        {!isUser && (
          <div className="model-tag">ChatGPT-5</div>
        )}
        <div className="text">{content}</div>
      </div>

      {isUser && (
        <div className="chat-avatar">
          <FaRegUserCircle size={20} />
        </div>
      )}
    </div>
  );
}