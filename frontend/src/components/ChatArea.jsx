import React, { useState, useRef, useEffect } from "react";

function ChatArea({ selectedChat = null, messages = [], onSendMessage = () => {}, userName = "" }) {
  const [input, setInput] = useState("");
  const [streamingMessage, setStreamingMessage] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  const streamRef = useRef(null);
  const messagesEndRef = useRef(null);
  const threadRef = useRef(null);

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

    // Inicia o streaming (assumindo API.streamChatMessage disponível)
    const stream = API.streamChatMessage({
      message: userMessage,

      onChunk: (token) => {
        setStreamingMessage((prev) => prev + token);
      },

      onEnd: () => {
        // garante que enviamos a versão completa do streaming
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
    <div className="chat-container">
      {/* Se não houver chat selecionado */}
      {!selectedChat && (!messages || messages.length === 0) ? (
        <div className="chat-empty">Selecione uma conversa ou crie uma nova.</div>
      ) : (
        <>
          {/* THREAD DE MENSAGENS */}
          <div className="chat-thread" ref={threadRef}>
            {(messages || []).map((msg, i) => (
              <div
                key={i}
                className={`chat-msg ${msg.role === "user" ? "user" : "ai"}`}
              >
                {/* avatar */}
                <div className="chat-avatar" aria-hidden>
                  {/* ícones no CSS / componente separadamente — aqui apenas placeholder */}
                  {msg.role === "user" ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3"/><path d="M5.5 20c1.6-3 4.4-5 6.5-5s4.9 2 6.5 5"/></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="14" rx="2"/></svg>
                  )}
                </div>

                <div className="chat-bubble">
                  {msg.role !== "user" && <div className="model-tag">ChatGPT-5</div>}
                  <div className="text">{msg.content}</div>
                </div>
              </div>
            ))}

            {/* MENSAGEM STREAMING (ao vivo) */}
            {isStreaming && (
              <div className="chat-msg ai">
                <div className="chat-avatar" aria-hidden>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="14" rx="2"/></svg>
                </div>
                <div className="chat-bubble">
                  <div className="model-tag">ChatGPT-5</div>
                  <div className="text">
                    {streamingMessage}
                    <span className="cursor">█</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* SAUDAÇÃO — caso não haja mensagens */}
          {(!messages || messages.length === 0) && (
            <div className="chat-greeting">
              <h2>Olá, <span>{userName}</span></h2>
              <p>Como posso ajudar hoje?</p>
            </div>
          )}

          {/* INPUT */}
          <div className="chat-input-wrap">
            <input
              className="chat-textarea"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite sua mensagem..."
              disabled={isStreaming}
            />
            <button
              className="chat-send-btn"
              onClick={sendStreamMessage}
              disabled={isStreaming}
            >
              Enviar
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default ChatArea;
