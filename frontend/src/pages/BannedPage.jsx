import React from "react";
import { useNavigate } from "react-router-dom";
import { FiClock, FiLock } from "react-icons/fi";
import { motion } from "framer-motion"; // Importação adicionada
import "../styles/global.css"; 

export default function BannedPage() {
  const navigate = useNavigate();
  
  // Recupera detalhes salvos pelo api.js
  const banInfoRaw = localStorage.getItem("ban_info");
  const banInfo = banInfoRaw ? JSON.parse(banInfoRaw) : null;

  if (!banInfo) {
    // Se não tiver info, volta pra home
    return (
        <div style={{height: '100vh', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap: 20}}>
            <h2>Nenhuma restrição encontrada.</h2>
            <button className="btn primary" onClick={() => navigate('/')}>Ir para Início</button>
        </div>
    );
  }

  const isPermanent = !banInfo.expires_at;
  const expiryDate = isPermanent ? null : new Date(banInfo.expires_at).toLocaleString();

  return (
    <div style={{
        height: '100vh', 
        width: '100vw',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        background: '#09090b',
        color: '#f4f4f5'
    }}>
      <motion.div 
        style={{
          maxWidth: '500px', 
          width: '90%',
          background: '#18181b', 
          padding: '40px', 
          borderRadius: '16px', 
          border: '1px solid rgba(239, 68, 68, 0.3)',
          textAlign: 'center',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
        }}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      >
        <motion.div 
            style={{
                width: '64px', height: '64px', 
                background: 'rgba(239, 68, 68, 0.1)', 
                borderRadius: '50%', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px auto',
                color: '#ef4444'
            }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
        >
            <FiLock size={32} />
        </motion.div>

        <h1 style={{fontSize: '24px', marginBottom: '10px', color: '#fff'}}>Conta Suspensa</h1>
        <p className="muted" style={{marginBottom: '30px'}}>
            O acesso à sua conta foi restrito por um administrador.
        </p>

        <div style={{background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '8px', marginBottom: '20px', textAlign: 'left'}}>
            <div style={{marginBottom: '15px'}}>
                <label style={{fontSize: '12px', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '1px'}}>Motivo</label>
                <div style={{marginTop: '5px', fontSize: '15px', color: '#fff'}}>{banInfo.reason}</div>
            </div>
            
            <div>
                <label style={{fontSize: '12px', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '1px'}}>Expira em</label>
                <div style={{marginTop: '5px', fontSize: '15px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <FiClock /> {isPermanent ? "Nunca (Banimento Permanente)" : expiryDate}
                </div>
            </div>
        </div>

        <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
            <motion.button 
                className="btn primary" 
                onClick={() => navigate('/appeal')}
                style={{width: '100%', justifyContent: 'center'}}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                Entrar com Recurso (Appeal)
            </motion.button>
            <motion.button 
                className="btn ghost" 
                onClick={() => { localStorage.clear(); navigate('/'); }}
                style={{width: '100%', justifyContent: 'center'}}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                Voltar para Início
            </motion.button>
        </div>
      </motion.div>
    </div>
  );
}