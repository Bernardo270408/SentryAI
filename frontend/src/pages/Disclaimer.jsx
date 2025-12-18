import React from "react";
import FooterContent from "../components/FooterComponent";
import { useNavigate } from "react-router-dom";
import "../styles/staticPages.css";

export default function Disclaimer() {
  const navigate = useNavigate();
  return (
    <div className="static-page-root">
      <main className="static-content">
        <h1 className="static-title">Aviso Legal (Disclaimer)</h1>
        <div className="text-block">
            <h3>Natureza Informativa</h3>
            <p>O SentryAI é uma plataforma de inteligência artificial treinada em legislação brasileira. Embora nos esforcemos pela precisão, <strong>a IA pode cometer erros ou apresentar informações desatualizadas.</strong></p>
            <h3>Não Substitui Advogado</h3>
            <p>As informações aqui contidas não constituem aconselhamento jurídico formal. Para casos concretos, prazos processuais e estratégias de defesa, consulte sempre um advogado inscrito na OAB ou a Defensoria Pública.</p>
            <h3>Limitação de Responsabilidade</h3>
            <p>Os desenvolvedores do SentryAI não se responsabilizam por quaisquer danos diretos ou indiretos decorrentes do uso das informações fornecidas por este sistema.</p>
        </div>
      </main>
      <FooterContent />
    </div>
  );
}