import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiSend } from "react-icons/fi";
import { motion } from "framer-motion"; // Importação adicionada
import toast from "react-hot-toast";
import api from "../services/api";
import "../styles/global.css";

// Variantes de Animação
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.5, ease: "easeOut", staggerChildren: 0.1 } 
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

export default function AppealPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
        await api.sendAppeal(email, message);
        toast.success("Recurso enviado! Um moderador diferente analisará seu caso.");
        setTimeout(() => navigate('/'), 2500);
    } catch (err) {
        toast.error(err.body?.error || "Erro ao enviar recurso.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="landing-root" style={{minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '60px'}}>
      
      <motion.div 
        className="container" 
        style={{width: '100%', maxWidth: '600px'}}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.button 
            className="btn ghost" 
            onClick={() => navigate(-1)} 
            style={{marginBottom: '20px'}}
            variants={itemVariants}
            whileHover={{ x: -5 }} // Animação de "voltar"
            whileTap={{ scale: 0.95 }}
        >
            <FiArrowLeft /> Voltar
        </motion.button>

        <motion.div 
            className="card" 
            style={{padding: '30px', border: '1px solid rgba(255,255,255,0.1)'}}
            variants={itemVariants}
        >
            <h2 style={{marginTop: 0}}>Recorrer Suspensão</h2>
            <p className="muted">
                Se você acredita que houve um erro, envie sua defesa. 
                <br/><small style={{color:'#a1a1aa'}}>Nota: Seu recurso será avaliado por um administrador diferente daquele que aplicou o banimento.</small>
            </p>

            <form onSubmit={handleSubmit} style={{marginTop: '20px', display:'flex', flexDirection:'column', gap: '15px'}}>
                <div>
                    <label style={{display:'block', marginBottom: '8px', color: '#e4e4e7'}}>Seu E-mail de Cadastro</label>
                    <motion.input 
                        type="email" 
                        required
                        placeholder="seu@email.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        style={{
                            width: '100%', padding: '12px', background: '#09090b', 
                            border: '1px solid #27272a', borderRadius: '8px', color: '#fff', outline: 'none'
                        }}
                        whileFocus={{ scale: 1.01, borderColor: "#4A90E2", boxShadow: "0 0 0 2px rgba(74, 144, 226, 0.2)" }}
                        transition={{ duration: 0.2 }}
                    />
                </div>

                <div>
                    <label style={{display:'block', marginBottom: '8px', color: '#e4e4e7'}}>Argumento do Recurso</label>
                    <motion.textarea 
                        required
                        rows="6"
                        placeholder="Explique por que o banimento deve ser revisto..."
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        style={{
                            width: '100%', padding: '12px', background: '#09090b', 
                            border: '1px solid #27272a', borderRadius: '8px', color: '#fff', outline: 'none', resize: 'vertical'
                        }}
                        whileFocus={{ scale: 1.01, borderColor: "#4A90E2", boxShadow: "0 0 0 2px rgba(74, 144, 226, 0.2)" }}
                        transition={{ duration: 0.2 }}
                    />
                </div>

                <motion.button 
                    type="submit" 
                    className="btn primary" 
                    disabled={loading}
                    style={{justifyContent: 'center', marginTop: '10px'}}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    {loading ? "Enviando..." : <><FiSend /> Enviar Recurso</>}
                </motion.button>
            </form>
        </motion.div>
      </motion.div>
    </div>
  );
}