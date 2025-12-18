import React from "react";
import FooterContent from "../components/FooterComponent";
import { useNavigate } from "react-router-dom";
import "../styles/staticPages.css";

export default function Privacy() {
  const navigate = useNavigate();
  return (
    <div className="static-page-root">
      <main className="static-content">
        <h1 className="static-title">Política de Privacidade</h1>
        <div className="text-block">
            <p>Respeitamos sua privacidade e estamos comprometidos em proteger seus dados pessoais.</p>
            <h3>1. Coleta de Dados</h3>
            <p>Coletamos apenas as informações necessárias para o funcionamento da conta (nome, e-mail) e o histórico de interações com a IA para melhoria do serviço.</p>
            <h3>2. Uso de Dados</h3>
            <p>Seus dados não são vendidos a terceiros. São utilizados exclusivamente para personalizar sua experiência jurídica.</p>
            <h3>3. Segurança</h3>
            <p>Utilizamos criptografia e protocolos modernos para proteger suas informações.</p>
        </div>
      </main>
      <FooterContent />
    </div>
  );
}