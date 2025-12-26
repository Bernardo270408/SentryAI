import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from '@react-oauth/google';
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Scale,
  Crown,
  Eye,
  EyeOff,
  Shield,
  Info,
  X
} from "lucide-react";
import api from "../services/api";
import toast from "react-hot-toast";

// Variantes de animação
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

const modalVariants = {
  hidden: { scale: 0.95, opacity: 0, y: 20 },
  visible: { 
    scale: 1, 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", damping: 25, stiffness: 300 } 
  },
  exit: { scale: 0.95, opacity: 0, y: 20, transition: { duration: 0.2 } }
};

const contentVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: 20, transition: { duration: 0.2 } }
};

// Modal Interno de Privacidade (LGPD)
function PrivacyInfoModal({ open, onClose }) {
    if (!open) return null;

    return (
        <div className="privacy-modal-overlay" onClick={onClose} style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.6)', zIndex: 10001,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: '16px'
        }}>
            <motion.div 
                className="privacy-modal-content"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                style={{
                    background: 'var(--bg-card)', padding: '24px', borderRadius: '12px',
                    width: '90%', maxWidth: '320px', border: '1px solid var(--border)',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                }}
            >
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px'}}>
                    <h4 style={{margin:0, display:'flex', alignItems:'center', gap:'8px'}}>
                        <Shield size={18} color="#50E3C2"/> Privacidade & Dados
                    </h4>
                    <button onClick={onClose} style={{background:'transparent', border:'none', color:'var(--text-muted)', cursor:'pointer'}}>
                        <X size={18}/>
                    </button>
                </div>
                <p style={{fontSize:'0.9rem', color:'var(--text-muted)', lineHeight:'1.5', marginBottom:'16px'}}>
                    Para melhorar continuamente a precisão da nossa IA jurídica, coletamos dados anônimos sobre como você interage com a plataforma (ex: cliques, tempo de leitura).
                </p>
                <p style={{fontSize:'0.9rem', color:'var(--text-muted)', lineHeight:'1.5', marginBottom:'20px'}}>
                    Seus dados pessoais e o conteúdo das suas consultas permanecem <strong>privados e criptografados</strong>, em conformidade com a LGPD.
                </p>
                <button 
                    className="btn primary small full" 
                    onClick={onClose}
                    style={{width:'100%'}}
                >
                    Entendi
                </button>
            </motion.div>
        </div>
    );
}

export default function AuthModal({ open, onClose, initialTab = "login", setUser }) {
  const [tab, setTab] = useState(initialTab); 
  const [step, setStep] = useState("form");   
  
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  // form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirm, setConfirm] = useState("");
  const [otp, setOtp] = useState("");
  
  // Novo estado para o checkbox de consentimento
  const [consent, setConsent] = useState(false);
  const [showPrivacyInfo, setShowPrivacyInfo] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      setTab(initialTab);
      setStep("form");
      setEmail("");
      setPassword("");
      setName("");
      setConfirm("");
      setOtp("");
      setShowPass(false);
      setConsent(false);
      setShowPrivacyInfo(false);
    }
  }, [open, initialTab]);

  const handleAuthSuccess = (data, toastId) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
    toast.success(`Bem-vindo, ${data.user.name.split(' ')[0]}!`, { id: toastId });
    onClose?.();

    if (data.user.is_admin) {
        navigate("/admin");
    } else {
        navigate("/app");
    }
  };

  async function handleLogin(e) {
    e?.preventDefault?.();
    setLoading(true);
    const toastId = toast.loading("Autenticando...");
    
    try {
      const data = await api.request("/login", "POST", { email, password }, false);
      handleAuthSuccess(data, toastId);
    } catch (err) {
      if (err?.body?.need_verification) {
        toast.error("E-mail não verificado.", { id: toastId });
        setStep("verify");
      } else {
        toast.error(err?.body?.error || "Erro de autenticação.", { id: toastId });
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e) {
    e?.preventDefault?.();

    if (!name.trim() || !email.trim() || !password) {
      return toast.error("Preencha todos os campos.");
    }
    if (password !== confirm) {
      return toast.error("Senhas não conferem.");
    }
    if (!consent) {
        return toast.error("É necessário aceitar os termos de uso de dados.");
    }

    setLoading(true);
    const toastId = toast.loading("Criando conta...");
    
    try {
      await api.request("/users/", "POST", { name, email, password }, false);
      toast.success("Conta criada! Verifique seu e-mail.", { id: toastId });
      setStep("verify");
    } catch (err) {
      toast.error(err?.body?.error || "Erro ao criar conta.", { id: toastId });
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e) {
    e?.preventDefault?.();
    setLoading(true);
    const toastId = toast.loading("Verificando...");
    
    try {
        const data = await api.request("/verify-email", "POST", { email, code: otp }, false);
        handleAuthSuccess(data, toastId);
    } catch(err) {
        toast.error(err?.body?.error || "Código inválido.", { id: toastId });
    } finally {
        setLoading(false);
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    const toastId = toast.loading("Entrando com Google...");
    try {
        const data = await api.request("/google-login", "POST", { 
            credential: credentialResponse.credential 
        }, false);
        
        handleAuthSuccess(data, toastId);
    } catch (err) {
        toast.error("Falha no login com Google.", { id: toastId });
    } finally {
        setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="auth-modal-root" role="dialog" aria-modal="true" aria-label="Autenticação" style={{ zIndex: 9999 }}>
          <motion.div 
            className="auth-modal-backdrop" 
            onClick={onClose}
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          />

          <motion.div 
            className="auth-modal"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ position: 'relative', overflow: 'hidden' }} // Para conter o modal interno
          >
            {/* RENDERIZAÇÃO DO MODAL DE PRIVACIDADE SE ATIVO */}
            <AnimatePresence>
                {showPrivacyInfo && <PrivacyInfoModal open={showPrivacyInfo} onClose={() => setShowPrivacyInfo(false)} />}
            </AnimatePresence>

            <button className="auth-back" onClick={onClose} aria-label="Voltar para home">
              <ArrowLeft size={16} /> <span className="auth-back-text">Voltar</span>
            </button>

            <div className="auth-center">
              <div className="auth-icon-wrap">
                <div className="auth-icon">
                  <Scale size={28} />
                </div>
              </div>

              <div className="auth-head">
                <motion.h2 
                  key={step === 'verify' ? 'title-verify' : 'title-auth'}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="auth-title"
                >
                    {step === 'verify' ? 'Verificação de Segurança' : 'Entre na sua conta'}
                </motion.h2>
                <motion.p 
                  key={step === 'verify' ? 'sub-verify' : 'sub-auth'}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="auth-sub"
                >
                    {step === 'verify' 
                      ? `Digite o código de 6 dígitos enviado para ${email}`
                      : 'Faça login para acessar a IA Jurídica e manter seu histórico seguro'}
                </motion.p>
              </div>

              <AnimatePresence mode="wait">
                {step === 'verify' ? (
                  <motion.div 
                    className="auth-form"
                    key="verify-step"
                    variants={contentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                      <div style={{display:'flex', flexDirection:'column', gap: 10, marginTop: 10}}>
                          <label className="auth-label" style={{textAlign:'center'}}>Código de Verificação</label>
                          <input 
                              className="auth-input otp-input" 
                              value={otp} 
                              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} 
                              placeholder="000000" 
                              maxLength={6}
                              autoFocus
                          />
                      </div>

                      <button className="auth-primary" onClick={handleVerify} disabled={loading || otp.length < 6}>
                          {loading ? "Verificando..." : "Confirmar Código"}
                      </button>
                      
                      <div style={{marginTop: 15, textAlign:'center'}}>
                          <button className="btn tiny ghost" onClick={() => setStep("form")}>
                              Voltar / Corrigir E-mail
                          </button>
                      </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="form-step"
                    variants={contentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <div className="admin-alert">
                      <Crown size={18} className="admin-icon" />
                      <div>
                        <strong>Área Restrita</strong>
                        <div className="admin-text">O acesso administrativo redireciona automaticamente para o Painel de Controle.</div>
                      </div>
                    </div>

                    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', margin: '15px 0' }}>
                       <GoogleLogin
                           onSuccess={handleGoogleSuccess}
                           onError={() => toast.error("Erro no Google Login")}
                           theme="filled_black"
                           text={tab === 'login' ? "signin_with" : "signup_with"}
                           shape="pill"
                           width="300"
                       />
                    </div>

                    <div className="auth-or">
                      <div className="line" />
                      <div className="or-text">OU</div>
                      <div className="line" />
                    </div>

                    <div className="auth-tabs">
                      <button
                        className={`auth-tab ${tab === "login" ? "active" : ""}`}
                        onClick={() => setTab("login")}
                      >
                        Entrar
                      </button>
                      <button
                        className={`auth-tab ${tab === "register" ? "active" : ""}`}
                        onClick={() => setTab("register")}
                      >
                        Criar conta
                      </button>
                    </div>

                    <div className="auth-form">
                      <AnimatePresence mode="wait">
                        {tab === "login" ? (
                          <motion.form 
                            key="login-form"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.2 }}
                            onSubmit={handleLogin}
                          >
                            <label className="auth-label">E-mail</label>
                            <input
                              className="auth-input"
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="seu@exemplo.com"
                              required
                            />

                            <label className="auth-label">Senha</label>
                            <div className="auth-input-group">
                              <input
                                className="auth-input"
                                type={showPass ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                              />
                              <button
                                type="button"
                                className="auth-eye"
                                onClick={() => setShowPass((s) => !s)}
                                aria-label={showPass ? "Ocultar senha" : "Mostrar senha"}
                              >
                                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                            </div>

                            <button className="auth-primary" type="submit" disabled={loading}>
                              {loading ? "Entrando..." : "Entrar"}
                            </button>
                          </motion.form>
                        ) : (
                          <motion.form 
                            key="register-form"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                            onSubmit={handleRegister}
                          >
                            <label className="auth-label">Nome completo</label>
                            <input
                              className="auth-input"
                              type="text"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              placeholder="Seu nome completo"
                              required
                            />

                            <label className="auth-label">E-mail</label>
                            <input
                              className="auth-input"
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="seu@exemplo.com"
                              required
                            />

                            <label className="auth-label">Senha</label>
                            <input
                              className="auth-input"
                              type="password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="Senha"
                              required
                            />

                            <label className="auth-label">Confirmar senha</label>
                            <input
                              className="auth-input"
                              type="password"
                              value={confirm}
                              onChange={(e) => setConfirm(e.target.value)}
                              placeholder="Confirmar senha"
                              required
                            />

                            {/* SEÇÃO LGPD ATUALIZADA */}
                            <div className="lgpd-box" style={{flexDirection: 'column', alignItems: 'flex-start', gap: '8px'}}>
                              <div style={{display:'flex', gap: '10px', alignItems:'center'}}>
                                <Shield size={18} className="lgpd-icon" />
                                <div className="lgpd-text">
                                  <p className="lgpd-title">Seus dados estão seguros</p>
                                  <p className="lgpd-sub">Seguimos a LGPD. <button type="button" onClick={() => setShowPrivacyInfo(true)} style={{background:'none', border:'none', color:'var(--primary)', textDecoration:'underline', cursor:'pointer', padding:0, fontSize:'inherit'}}>Saiba mais</button></p>
                                </div>
                              </div>
                              
                              <div style={{display:'flex', alignItems:'center', gap:'8px', marginTop:'4px'}}>
                                <input 
                                    type="checkbox" 
                                    id="consent-check" 
                                    checked={consent}
                                    onChange={(e) => setConsent(e.target.checked)}
                                    style={{width:'16px', height:'16px', cursor:'pointer'}}
                                />
                                <label htmlFor="consent-check" style={{fontSize:'0.8rem', color:'var(--text-muted)', cursor:'pointer'}}>
                                    Concordo com a coleta de dados de uso para melhoria da experiência.
                                </label>
                              </div>
                            </div>

                            <button className="auth-primary" type="submit" disabled={loading || !consent}>
                              {loading ? "Criando..." : "Criar conta"}
                            </button>
                          </motion.form>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <p className="auth-footer">
                Ao continuar, você concorda com nossos <span className="underline">Termos de Uso</span> e{" "}
                <span className="underline">Política de Privacidade</span>.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}