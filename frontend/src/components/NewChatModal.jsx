import React, { useState } from "react";
import { motion } from "framer-motion"; // 1. Importar motion

// 2. Definir as variantes de animação fora do componente
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.3 }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.2, delay: 0.1 } // Atrasa um pouco a saída do fundo
  }
};

const modalVariants = {
  hidden: { 
    y: 50, 
    opacity: 0, 
    scale: 0.95 
  },
  visible: { 
    y: 0, 
    opacity: 1, 
    scale: 1,
    transition: { 
      type: "spring", 
      damping: 25, 
      stiffness: 300 
    }
  },
  exit: { 
    y: 50, 
    opacity: 0, 
    scale: 0.95,
    transition: { duration: 0.2 }
  }
};

export default function NewChatModal({ onClose, onCreate }) {
  const [name, setName] = useState("");

  function submit() {
    if (!name.trim()) return;
    onCreate(name.trim());
    onClose();
  }

  return (
    // 3. Transformar a div externa em motion.div e aplicar variantes do backdrop
    <motion.div 
      className="modal-backdrop"
      onClick={onClose} // Fecha ao clicar no fundo
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* 4. Transformar o card em motion.div e aplicar variantes do modal */}
      {/* Ele herda automaticamente os estados initial/animate/exit do pai */}
      <motion.div 
        className="modal-card"
        onClick={(e) => e.stopPropagation()} // Impede que cliques dentro do card fechem o modal
        variants={modalVariants}
      >
        <h2>Nova Conversa</h2>

        <input
          className="modal-input"
          placeholder="Nome da conversa..."
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && submit()}
          autoFocus // É bom focar automaticamente no input ao abrir
        />

        <div className="modal-actions">
          <button className="modal-cancel" onClick={onClose}>
            Cancelar
          </button>

          <button className="modal-create" onClick={submit}>
            Criar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}