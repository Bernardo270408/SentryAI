import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiSend } from "react-icons/fi";
import toast from "react-hot-toast";
import "../styles/global.css";

export default function AppealPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulação de envio para API (Futuramente criar endpoint /users/appeal)
    setTimeout(() => {
        setLoading(false);
        toast.success("Recurso enviado! Analisaremos em até 48h.");
        setTimeout(() => navigate('/'), 2000);
    }, 1500);
  };

  return (
    <div className="landing-root" style={{minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '60px'}}>
      <div className="container" style={{width: '100%', maxWidth: '600px'}}>
        <button className="btn ghost" onClick={() => navigate(-1)} style={{marginBottom: '20px'}}>
            <FiArrowLeft /> Voltar
        </button>

        <div className="card" style={{padding: '30px', border: '1px solid rgba(255,255,255,0.1)'}}>
            <h2 style={{marginTop: 0}}>Recorrer Suspensão</h2>
            <p className="muted">Se você acredita que houve um erro, envie uma mensagem para nossa equipe de suporte.</p>

            <form onSubmit={handleSubmit} style={{marginTop: '20px', display:'flex', flexDirection:'column', gap: '15px'}}>
                <div>
                    <label style={{display:'block', marginBottom: '8px', color: '#e4e4e7'}}>Seu E-mail de Cadastro</label>
                    <input 
                        type="email" 
                        required
                        placeholder="seu@email.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        style={{
                            width: '100%', padding: '12px', background: '#09090b', 
                            border: '1px solid #27272a', borderRadius: '8px', color: '#fff', outline: 'none'
                        }}
                    />
                </div>

                <div>
                    <label style={{display:'block', marginBottom: '8px', color: '#e4e4e7'}}>Argumento do Recurso</label>
                    <textarea 
                        required
                        rows="6"
                        placeholder="Explique por que o banimento deve ser revisto..."
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        style={{
                            width: '100%', padding: '12px', background: '#09090b', 
                            border: '1px solid #27272a', borderRadius: '8px', color: '#fff', outline: 'none', resize: 'vertical'
                        }}
                    />
                </div>

                <button 
                    type="submit" 
                    className="btn primary" 
                    disabled={loading}
                    style={{justifyContent: 'center', marginTop: '10px'}}
                >
                    {loading ? "Enviando..." : <><FiSend /> Enviar Recurso</>}
                </button>
            </form>
        </div>
      </div>
    </div>
  );
}