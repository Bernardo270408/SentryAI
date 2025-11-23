import React, { useState, useRef, useEffect } from "react";
import API from "../api"; // IMPORTA SUA API CENTRALIZADA

function ChatArea({ selectedChat, messages, onSendMessage, userName }) {
  const [input, setInput] = useState("");
  const [streamingMessage, setStreamingMessage] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  const streamRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Scroll automático
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingMessage]);


  // --------------------------------------
  // STREAMING USANDO API.streamChatMessage
  // --------------------------------------
  const sendStreamMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput("");

    // adiciona no chat imediatamente
    onSendMessage({
      role: "user",
      content: userMessage
    });

    setStreamingMessage("");
    setIsStreaming(true);

    // Inicia o streaming 👇
    const stream = API.streamChatMessage({
      message: userMessage,

      onChunk: (token) => {
        setStreamingMessage((prev) => prev + token);
      },

      onEnd: () => {
        onSendMessage({
          role: "assistant",
          content: streamingMessage
        });

        setIsStreaming(false);
        setStreamingMessage("");
        streamRef.current?.close();
      },

      onError: (err) => {
        console.error("Erro no streaming", err);
        setIsStreaming(false);
        setStreamingMessage("");
        streamRef.current?.close();
      }
    });

    streamRef.current = stream;
  };


  return (
    <div className="chat-area">
      
      {/* LISTA DE MENSAGENS -------------------------------- */}
      <div className="messages-container">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`message ${msg.role === "user" ? "user-msg" : "bot-msg"}`}
          >
            {msg.content}
          </div>
        ))}

        {/* STREAMING AO VIVO -------------------------------- */}
        {isStreaming && (
          <div className="message bot-msg">
            {streamingMessage}
            <span className="cursor">█</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>


      {/* SAUDAÇÃO ------------------------------------------ */}
      {messages.length === 0 && (
        <div className="greeting">
          <h2>Olá, {userName}</h2>
        </div>
      )}


      {/* INPUT --------------------------------------------- */}
      <div className="input-container">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Digite sua mensagem..."
          disabled={isStreaming}
        />
        <button onClick={sendStreamMessage} disabled={isStreaming}>
          Enviar
        </button>
      </div>

    </div>
  );
}

export default ChatArea;