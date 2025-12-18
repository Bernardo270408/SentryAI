import React from "react";
import FooterContent from "../components/FooterComponent";
import { FiArrowLeft, FiDatabase, FiBook, FiCheckCircle, FiAlertTriangle, FiMessageSquare } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "../styles/knowledgeBase.css";

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

// Variantes de Animação
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
        opacity: 1, 
        transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
        opacity: 1, 
        y: 0, 
        transition: { type: "spring", stiffness: 100, damping: 15 } 
    }
};

export default function KnowledgeBase() {
  const navigate = useNavigate();

  return (
    <div>
      <motion.main 

        className="kb-content container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div>
            <div className="kb-header-inner">
            <div className="kb-logo">
               <FiDatabase className="logo-icon" /> 
               <span>SentryAI</span>
               <span className="badge">KNOWLEDGE</span>
            </div>
            
            <motion.button 
                className="btn " 
                onClick={() => navigate(-1)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                Voltar
            </motion.button>
        </div>
        </motion.div>
        <motion.div className="kb-hero" variants={itemVariants}>
            <h1>Base de Conhecimento</h1>
            <p>Entenda como nossa IA é instruída, suas diretrizes éticas e as fontes legislativas priorizadas.</p>
        </motion.div>

        {/* CARTÃO DE PERSONA */}
        <motion.div className="kb-section" variants={itemVariants}>
            <div className="persona-card">
                <div className="persona-header">
                    <span className="tag-persona">PERSONA</span>
                    <h3>{kbData.Papel}</h3>
                </div>
                <p className="persona-desc">{kbData.Personalidade}</p>
            </div>
        </motion.div>

        {/* GRID DE INSTRUÇÕES E RESTRIÇÕES */}
        <div className="kb-grid-2col">
            <motion.div className="kb-card info-card" variants={itemVariants}>
                <div className="card-header">
                    <FiCheckCircle className="icon-success" />
                    <h3>Diretrizes & Comportamento</h3>
                </div>
                <ul className="kb-list success">
                    {kbData.Instruções.map((inst, i) => (
                        <li key={i}>{inst}</li>
                    ))}
                </ul>
            </motion.div>

            <motion.div className="kb-card info-card" variants={itemVariants}>
                <div className="card-header">
                    <FiAlertTriangle className="icon-warning" />
                    <h3>Restrições de Segurança</h3>
                </div>
                <ul className="kb-list warning">
                    {kbData.Restrições.map((res, i) => (
                        <li key={i}>{res}</li>
                    ))}
                </ul>
            </motion.div>
        </div>

        {/* ESCOPO LEGISLATIVO */}
        <motion.div className="kb-section" variants={itemVariants}>
            <h2 className="section-title"><FiBook /> Fontes Oficiais</h2>
            <p className="section-desc">A IA prioriza consultas diretas às seguintes bases governamentais:</p>
            
            <div className="sources-grid">
                {kbData.Escopo_Legislativo.map((lei, i) => (
                    <motion.a 
                        key={i} 
                        href={lei.Link} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="source-card"
                        whileHover={{ y: -5, borderColor: 'var(--kb-accent)' }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <div className="source-icon"><FiBook /></div>
                        <span>{lei.Nome}</span>
                    </motion.a>
                ))}
            </div>
        </motion.div>

        {/* EXEMPLOS DE CHAT */}
        <motion.div className="kb-section" variants={itemVariants}>
            <h2 className="section-title"><FiMessageSquare /> Simulação de Respostas</h2>
            <div className="chat-examples">
                {kbData.Exemplos.map((ex, i) => (
                    <div key={i} className="chat-example-card">
                        <div className="chat-bubble user">
                            <strong>Usuário:</strong> {ex.Pergunta}
                        </div>
                        <div className="chat-bubble ai">
                            <div className="ai-label">Sentry AI</div>
                            <p style={{whiteSpace: 'pre-line'}}>{ex.Resposta}</p>
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>

      </motion.main>
      <FooterContent />
    </div>
  );
}