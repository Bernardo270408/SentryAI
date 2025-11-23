import React, { useState } from "react";

export default function NewChatModal({ onClose, onCreate }) {
  const [name, setName] = useState("");

  function submit() {
    if (!name.trim()) return;
    onCreate(name.trim());
    onClose();
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <h2>Nova Conversa</h2>

        <input
          className="modal-input"
          placeholder="Nome da conversa..."
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && submit()}
        />

        <div className="modal-actions">
          <button className="modal-cancel" onClick={onClose}>
            Cancelar
          </button>

          <button className="modal-create" onClick={submit}>
            Criar
          </button>
        </div>
      </div>
    </div>
  );
}