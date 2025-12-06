import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from '@react-oauth/google';
import {
  ArrowLeft,
  Scale,
  Crown,
  Eye,
  EyeOff,
  Shield,
  CheckCircle
} from "lucide-react";
import api from "../services/api";
import toast from "react-hot-toast";

export default function AuthModal({ open, onClose, initialTab = "login" }) {
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
    }
  }, [open, initialTab]);

  if (!open) return null;

  async function handleLogin(e) {
    e?.preventDefault?.();
    setLoading(true);
    const toastId = toast.loading("Autenticando...");
    
    try {
      const data = await api.request("/login", "POST", { email, password }, false);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      toast.success("Login realizado!", { id: toastId });
      onClose?.();
      navigate("/app");
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
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        
        toast.success("Conta verificada!", { id: toastId });
        setTimeout(() => {
            onClose();
            navigate("/app");
        }, 500);
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
        
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        toast.success("Login realizado!", { id: toastId });
        onClose();
        navigate("/app");
    } catch (err) {
        toast.error("Falha no login com Google.", { id: toastId });
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="auth-modal-root" role="dialog" aria-modal="true" aria-label="Autenticação">
      <div className="auth-modal-backdrop" onClick={onClose} />

      <div className="auth-modal">
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
            <h2 className="auth-title">
                {step === 'verify' ? 'Verificação de Segurança' : 'Entre na sua conta'}
            </h2>
            <p className="auth-sub">
                {step === 'verify' 
                 ? `Digite o código de 6 dígitos enviado para ${email}`
                 : 'Faça login para acessar a IA Jurídica e manter seu histórico seguro'}
            </p>
          </div>

          {step === 'verify' ? (
            <div className="auth-form">
                <div style={{display:'flex', flexDirection:'column', gap: 10, marginTop: 10}}>
                    <label className="auth-label" style={{textAlign:'center'}}>Código de Verificação</label>
                    <input 
                        className="auth-input" 
                        value={otp} 
                        onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} 
                        placeholder="000000" 
                        maxLength={6}
                        style={{textAlign:'center', letterSpacing: '0.2em', fontSize: 24, fontWeight: 'bold'}}
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
            </div>
          ) : (
            <>
              <div className="admin-alert">
                <Crown size={16} className="admin-icon" />
                <div>
                  <strong>Acesso Administrativo</strong>
                  <div className="admin-text">Administradores têm acesso ao dashboard de analytics.</div>
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
                {tab === "login" ? (
                  <form onSubmit={handleLogin}>
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
                  </form>
                ) : (
                  <form onSubmit={handleRegister}>
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

                    <div className="lgpd-box">
                      <Shield size={18} className="lgpd-icon" />
                      <div className="lgpd-text">
                        <p className="lgpd-title">Seus dados estão seguros</p>
                        <p className="lgpd-sub">Seguimos a LGPD para proteger suas informações pessoais.</p>
                      </div>
                    </div>

                    <button className="auth-primary" type="submit" disabled={loading}>
                      {loading ? "Criando..." : "Criar conta"}
                    </button>
                  </form>
                )}
              </div>
            </>
          )}

          <p className="auth-footer">
            Ao continuar, você concorda com nossos <span className="underline">Termos de Uso</span> e{" "}
            <span className="underline">Política de Privacidade</span>.
          </p>
        </div>
      </div>
    </div>
  );
}