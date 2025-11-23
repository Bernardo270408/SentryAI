import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function ChatsList() {
  const [chats, setChats] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "null");

  async function load() {
    if (!user) return;

    setLoading(true);
    try {
      const list = await api.request(`/chats/user/${user.id}`, "GET");
      setChats(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createChat(e) {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const created = await api.request("/chats/", "POST", { name });

      setChats((prev) => [created, ...prev]);
      setName("");
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>Conversas</h2>

        <form onSubmit={createChat} className="inline-form">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome do chat"
          />
          <button className="small">Criar</button>
        </form>
      </div>

      {loading ? (
        <div>Carregando...</div>
      ) : (
        <ul className="chat-list">
          {chats.map((c) => (
            <li key={c.id} className="chat-item">
              <Link to={`/chat/${c.id}`}>
                <div className="chat-name">{c.name}</div>
                <div className="chat-meta muted">
                  {new Date(c.created_at).toLocaleString()}
                </div>
              </Link>
            </li>
          ))}

          {chats.length === 0 && (
            <div className="muted">Nenhum chat ainda.</div>
          )}
        </ul>
      )}
    </div>
  );
}