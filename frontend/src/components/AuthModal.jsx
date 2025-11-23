import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Scale,
  Crown,
  Eye,
  EyeOff,
  Shield,
} from "lucide-react";
import api from "../services/api";

export default function AuthModal({ open, onClose, initialTab = "login" }) {
  const [tab, setTab] = useState(initialTab); // 'login' | 'register'
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  // form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      setTab(initialTab);
      setEmail("");
      setPassword("");
      setName("");
      setConfirm("");
      setError(null);
      setMsg(null);
      setShowPass(false);
    }
  }, [open, initialTab]);

  if (!open) return null;

  async function handleLogin(e) {
    e?.preventDefault?.();
    setError(null);
    setLoading(true);
    try {
      const data = await api.request("/login", "POST", { email, password }, false);
      // expected { token, user }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setMsg("Autenticado com sucesso!");
      onClose?.();
      navigate("/app");
    } catch (err) {
      setError(err?.body?.error || "Erro ao autenticar. Verifique suas credenciais.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e) {
    e?.preventDefault?.();
    setError(null);

    if (!name.trim() || !email.trim() || !password) {
      setError("Preencha todos os campos.");
      return;
    }
    if (password !== confirm) {
      setError("Senhas não conferem.");
      return;
    }

    setLoading(true);
    try {
      // seu endpoint de criação de usuário usado no projeto: '/users/'
      await api.request("/users/", "POST", { name, email, password }, false);
      setMsg("Conta criada com sucesso. Você já pode entrar.");
      setTab("login");
      setPassword("");
      setConfirm("");
    } catch (err) {
      setError(err?.body?.error || "Erro ao criar conta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-modal-root" role="dialog" aria-modal="true" aria-label="Autenticação">
      <div className="auth-modal-backdrop" onClick={onClose} />

      <div className="auth-modal">
        <button className="auth-back" onClick={onClose} aria-label="Fechar">
          <ArrowLeft size={16} /> <span className="auth-back-text">Voltar</span>
        </button>

        <div className="auth-center">
          <div className="auth-icon-wrap">
            <div className="auth-icon">
              <Scale size={28} />
            </div>
          </div>

          <div className="auth-head">
            <h2 className="auth-title">Entre na sua conta</h2>
            <p className="auth-sub">Faça login para acessar a IA Jurídica e manter seu histórico seguro</p>
          </div>

          <div className="admin-alert">
            <Crown size={16} className="admin-icon" />
            <div>
              <strong>Acesso Administrativo</strong>
              <div className="admin-text">Administradores têm acesso ao dashboard de analytics.</div>
            </div>
          </div>

          <button
            className="auth-google"
            onClick={() => setMsg("Login via Google não configurado.")}
            type="button"
            aria-label="Continuar com Google"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="google-logo" />
            Continuar com Google
          </button>

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
                <h3 className="section-title">Entrar na conta</h3>
                <p className="section-sub">Use seu e-mail e senha para acessar sua conta</p>

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

                {error && <div className="auth-error">{error}</div>}
                {msg && <div className="auth-msg">{msg}</div>}

                <button className="auth-primary" type="submit" disabled={loading}>
                  {loading ? "Entrando..." : "Entrar"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister}>
                <h3 className="section-title">Criar conta</h3>
                <p className="section-sub">Crie sua conta para começar a usar a IA Jurídica</p>

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

                {/* LGPD box */}
                <div className="lgpd-box">
                  <Shield size={18} className="lgpd-icon" />
                  <div className="lgpd-text">
                    <p className="lgpd-title">Seus dados estão seguros</p>
                    <p className="lgpd-sub">Seguimos a LGPD para proteger suas informações pessoais.</p>
                  </div>
                </div>

                {error && <div className="auth-error">{error}</div>}
                {msg && <div className="auth-msg">{msg}</div>}

                <button className="auth-primary" type="submit" disabled={loading}>
                  {loading ? "Criando..." : "Criar conta"}
                </button>
              </form>
            )}
          </div>

          <p className="auth-footer">
            Ao continuar, você concorda com nossos <span className="underline">Termos de Uso</span> e{" "}
            <span className="underline">Política de Privacidade</span>.
          </p>
        </div>
      </div>
    </div>
  );
}