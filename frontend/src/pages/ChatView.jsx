import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

export default function ChatView() {
  const { id } = useParams();

  const [userMessages, setUserMessages] = useState([]);
  const [aiMessages, setAiMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState("gpt-4o-mini");

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const elRef = useRef();

  async function loadMessages() {
    try {
      const um = await api.request(`/messages/chat/${id}`);
      const am = await api.request(`/ai-messages/chat/${id}`);

      setUserMessages(um || []);
      setAiMessages(am || []);

      setTimeout(() => elRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadMessages();
  }, [id]);

  async function sendUser(e) {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      const created = await api.request(
        "/messages",
        "POST",
        {
          user_id: user.id,
          chat_id: Number(id),
          content: text
        }
      );

      setUserMessages((prev) => [...prev, created]);
      setText("");
    } catch (err) {
      console.error(err);
    }
  }

  async function askAI() {
    setLoading(true);
    try {
      const created = await api.request(
        "/ai-messages",
        "POST",
        {
          user_id: user.id,
          chat_id: Number(id),
          model
        }
      );

      setAiMessages((prev) => [...prev, created]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const merged = [
    ...userMessages.map((m) => ({ ...m, type: "user" })),
    ...aiMessages.map((m) => ({ ...m, type: "ai" }))
  ].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  return (
    <div className="page chat-page">
      <div className="page-header">
        <h2>Chat #{id}</h2>
        <div className="muted">Usuário: {user?.name}</div>
      </div>

      <div className="chat-window">
        <div className="messages">
          {merged.map((m) => (
            <div key={m.id} className={`bubble ${m.type}`}>
              <div className="bubble-content">
                <div className="bubble-text">{m.content}</div>
                <div className="bubble-meta muted">
                  {new Date(m.created_at).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
          <div ref={elRef} />
        </div>

        <div className="composer">
          <form onSubmit={sendUser} className="composer-form">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Escreva sua mensagem..."
            />
            <button type="submit" className="small">
              Enviar
            </button>
          </form>

          <div className="ai-controls">
            <select value={model} onChange={(e) => setModel(e.target.value)}>
              <option value="gpt-4o-mini">gpt-4o-mini</option>
              <option value="gpt-4o">gpt-4o</option>
            </select>

            <button
              onClick={askAI}
              className="primary"
              disabled={loading}
            >
              {loading ? "Gerando..." : "Pedir à IA"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}