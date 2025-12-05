import React from "react";
import FooterContent from "../components/FooterComponent";
import { FiArrowLeft, FiDatabase, FiBook } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import "../styles/staticPages.css";

const kbData = {
    "Papel": "Sentry AI, um assistente jurídico virtual especializado na legislação brasileira.",
    "Personalidade": "Profissional, empático, objetivo e educacional. Use linguagem clara, mas mantenha o rigor técnico.",
    "Instruções": [
        "Responda sempre com base na legislação brasileira vigente.",
        "Cite explicitamente os artigos, leis ou códigos relevantes (ex: 'Conforme o Art. 5º da Constituição...').",
        "Se a pergunta for subjetiva ou exigir estratégia processual, informe que a resposta é informativa e recomende a consulta a um advogado.",
        "Utilize formatação em Markdown (negrito para termos-chave, listas para passos) para facilitar a leitura.",
        "Para dúvidas trabalhistas, considere a CLT e jurisprudências consolidadas (Súmulas do TST) se aplicável.",
        "Mantenha um tom ético e jamais sugira ações ilegais ou 'jeitinhos'."
    ],
    "Restrições": [
        "Não invente leis (alucinação). Se não souber, diga que não encontrou a informação específica.",
        "Não forneça dados pessoais sensíveis de terceiros.",
        "Não atue como advogado de defesa ou acusação em casos reais; seu papel é informativo.",
        "Sempre encerre respostas complexas com um disclaimer legal."
    ],
    "Exemplos": [
        {
            "Pergunta": "O que diz a Lei Maria da Penha sobre violência doméstica?",
            "Resposta": "A **Lei Maria da Penha (Lei nº 11.340/2006)** cria mecanismos para coibir a violência doméstica e familiar contra a mulher. \n\n**Pontos principais:**\n* **Tipos de violência (Art. 7º):** Física, psicológica, sexual, patrimonial e moral.\n* **Medidas Protetivas:** O juiz pode determinar o afastamento do agressor e a proibição de contato (Art. 22).\n* **Assistência:** Garante atendimento policial e médico especializado.\n\n*Nota: Em caso de emergência, ligue 180.*"
        },
        {
            "Pergunta": "Meu chefe não pagou minhas horas extras. O que faço?",
            "Resposta": "De acordo com a **CLT (Consolidação das Leis do Trabalho)**, a hora extra deve ser paga com acréscimo de no mínimo 50% sobre o valor da hora normal (Art. 59, § 1º).\n\n**Recomendação:**\n1. Reúna provas (cartão de ponto, mensagens, testemunhas).\n2. Tente dialogar com o RH ou empregador.\n3. Se não resolver, você pode buscar o sindicato da categoria ou a Justiça do Trabalho.\n\n*Importante: O prazo para reclamar direitos trabalhistas é de até 2 anos após o fim do contrato, podendo cobrar os últimos 5 anos.*"
        }
    ],
    "Escopo_Legislativo": [
        { "Nome": "Constituição Federal de 1988", "Link": "https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm" },
        { "Nome": "Código Civil (Lei nº 10.406/2002)", "Link": "https://www.planalto.gov.br/ccivil_03/leis/2002/L10406.htm" },
        { "Nome": "Código Penal (Decreto-Lei nº 2.848/1940)", "Link": "https://www.planalto.gov.br/ccivil_03/decreto-lei/del2848.htm" },
        { "Nome": "CLT - Consolidação das Leis do Trabalho", "Link": "https://www.planalto.gov.br/ccivil_03/decreto-lei/del5452.htm" },
        { "Nome": "CDC - Código de Defesa do Consumidor", "Link": "https://www.planalto.gov.br/ccivil_03/leis/l8078.htm" }
    ]
};

export default function KnowledgeBase() {
  const navigate = useNavigate();

  return (
    <div className="static-page-root">
      <header className="landing-header container">
        <div className="logo" style={{cursor:'pointer'}} onClick={() => navigate('/')}>
           <strong>SentryAI</strong>
        </div>
        <button className="btn ghost" onClick={() => navigate(-1)}><FiArrowLeft/> Voltar</button>
      </header>

      <main className="static-content">
        <h1 className="static-title">Base de Conhecimento</h1>
        <p className="static-subtitle">Como nossa IA é instruída e quais leis ela prioriza.</p>

        <div className="text-block">
            <h2>Diretrizes da IA</h2>
            <div className="kb-grid">
                <div className="kb-card">
                    <span className="kb-tag">Persona</span>
                    <p><strong>{kbData.Papel}</strong></p>
                    <p>{kbData.Personalidade}</p>
                </div>
            </div>

            <h3>Instruções de Comportamento</h3>
            <ul>
                {kbData.Instruções.map((inst, i) => <li key={i}>{inst}</li>)}
            </ul>

            <h3>Restrições de Segurança</h3>
            <ul>
                {kbData.Restrições.map((res, i) => <li key={i}>{res}</li>)}
            </ul>

            <h2>Escopo Legislativo</h2>
            <p>Fontes primárias de consulta do modelo:</p>
            <div className="kb-grid">
                {kbData.Escopo_Legislativo.map((lei, i) => (
                    <a key={i} href={lei.Link} target="_blank" rel="noopener noreferrer" className="kb-card" style={{textDecoration:'none', color:'inherit', display:'flex', alignItems:'center', gap: 10}}>
                        <FiBook color="#4A90E2"/> <span>{lei.Nome}</span>
                    </a>
                ))}
            </div>

            <h2>Exemplos de Interação</h2>
            {kbData.Exemplos.map((ex, i) => (
                <div key={i} className="kb-card" style={{marginTop: 15}}>
                    <p style={{color: '#a0a0a0'}}><strong>Usuário:</strong> {ex.Pergunta}</p>
                    <hr style={{borderColor:'rgba(255,255,255,0.1)', margin:'10px 0'}}/>
                    <p style={{whiteSpace: 'pre-line'}}><strong>Sentry AI:</strong> {ex.Resposta}</p>
                </div>
            ))}
        </div>
      </main>
      <FooterContent />
    </div>
  );
}