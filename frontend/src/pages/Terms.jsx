import React from "react";
import FooterContent from "../components/FooterComponent";
import { useNavigate } from "react-router-dom";
import "../styles/staticPages.css";

export default function Terms() {
  const navigate = useNavigate();
  return (
    <div className="static-page-root">
      <header className="landing-header container">
        <div className="logo" onClick={() => navigate('/')} style={{cursor:'pointer'}}><strong>SentryAI</strong></div>
        <button className="btn ghost" onClick={() => navigate(-1)}>Voltar</button>
      </header>
      <main className="static-content">
        <h1 className="static-title">Termos de Uso</h1>
        <div className="text-block">
            <p>Última atualização: 2025</p>
            <p>Bem-vindo ao SentryAI. Ao acessar nosso site, você concorda com estes termos.</p>
            <h3>1. Uso do Serviço</h3>
            <p>O SentryAI é uma ferramenta informativa. As orientações fornecidas pela IA não substituem aconselhamento jurídico profissional.</p>
            <h3>2. Responsabilidades</h3>
            <p>Não nos responsabilizamos por decisões tomadas com base exclusivamente nas informações fornecidas pela ferramenta.</p>
            <h3>3. Conta do Usuário</h3>
            <p>Você é responsável por manter a confidencialidade de suas credenciais de acesso.</p>
        </div>
      </main>
      <FooterContent />
    </div>
  );
}