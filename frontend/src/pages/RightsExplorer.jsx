import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiBookOpen,
  FiFileText,
  FiHeart,
  FiShoppingCart,
  FiChevronDown,
  FiShield,
} from "react-icons/fi";
import FooterContent from "../components/FooterComponent";
import "../styles/rights.css";

/* CATEGORIES */
const CATEGORIES = [
  {
    key: "trabalhistas",
    title: "Direitos Trabalhistas",
    icon: <FiBookOpen />,
    desc: "Salário, férias, jornada de trabalho e muito mais",
    items: ["Jornada de Trabalho", "Férias e 13º Salário", "FGTS e Seguro-Desemprego"],
  },
  {
    key: "constitucionais",
    title: "Direitos Constitucionais",
    icon: <FiShield />,
    desc: "Saúde, educação, segurança e liberdades básicas",
    items: ["Direito à Saúde", "Direito à Educação", "Liberdade de Expressão"],
  },
  {
    key: "mulher",
    title: "Direitos da Mulher",
    icon: <FiHeart />,
    desc: "Proteção, igualdade e direitos específicos",
    items: ["Licença-Maternidade", "Proteção contra Violência", "Igualdade no Trabalho"],
  },
  {
    key: "consumidor",
    title: "Direitos do Consumidor",
    icon: <FiShoppingCart />,
    desc: "Compras, garantias e proteção contra abusos",
    items: ["Direito de Arrependimento", "Garantia de Produtos", "Proteção contra Propaganda Enganosa"],
  },
];

/* MODELOS — cada item pode conter um template para copiar/baixar */
const DOCUMENTS = {
  trabalhistas: [
    {
      title: "Modelo: Requerimento de Horas Extras (simples)",
      desc: "Carta formal para solicitar pagamento de horas extras ao empregador.",
      filename: "requerimento_horas_extras.txt",
      template:
`[Seu Nome]
[Seu Endereço]
[Data]

Ao(À) [Nome do Responsável / RH]
[Empresa]

Assunto: Requerimento de Pagamento de Horas Extras

Prezados,

Eu, [Seu Nome], matrícula/CPF [___], venho por meio desta requerer o pagamento de horas extras referentes ao período de [data início] a [data fim], totalizando [nº horas] horas, que não foram devidamente contabilizadas/compensadas.

Detalhes:
- Função: [sua função]
- Período: [datas]
- Horas não pagas: [quantidade]
- Observações: [anexar holerites, ponto, etc.]

Solicito a regularização do pagamento com adicional legal e reflexos legais, ou o registro da compensação em acordo aprovado por mim.

Atenciosamente,
[Seu Nome]
[Contato]`,
      source: "Modelo interno"
    },
    {
      title: "Check-list: Documentos para Reclamação Trabalhista",
      desc: "Arquivo para organizar provas — ideal imprimir e anexar ao processo.",
      filename: "checklist_reclamacao_trabalhista.txt",
      template:
`Check-list - Reclamação Trabalhista
- Contrato de trabalho / carteira de trabalho
- Holerites (período)
- Controle de ponto / registros
- Comunicações (e-mails / mensagens) relacionados a jornada
- Avisos e recibos de pagamento
- Testemunhas (nomes e contatos)
- Comprovantes de despesas (se aplicável)`,
      source: "Guia prático"
    },
  ],
  constitucionais: [
    {
      title: "Resumo prático: Ação para garantir direito à saúde (modelo de petição - trecho)",
      desc: "Template curto com itens essenciais para abertura de ação por negativa de fornecimento de tratamento.",
      filename: "acao_saude_template.txt",
      template:
`[Autor]
[Endereço]
[Data]

Excelentíssimo(a) Senhor(a) Doutor(a) Juiz(a) de Direito,

[Exposição breve do caso: Negativa de cobertura/fornecimento de tratamento por plano/ente público]
Requer:
1) Concessão de tutela de urgência para acesso imediato ao tratamento [descrever];
2) Citação do réu;
3) Condenação ao custeio/fornecimento do tratamento.

Documentos anexos: relatório médico, orçamentos, prescrições.`,
      source: "Modelo prático"
    },
  ],
  mulher: [
    {
      title: "Modelo: Pedido de Medida Protetiva (sumário)",
      desc: "Estrutura para solicitar medidas emergenciais previstas na Lei Maria da Penha.",
      filename: "pedido_medida_protetiva.txt",
      template:
`[Nome da Vítima]
[Endereço]
[Data]

Excelentíssimo(a) Senhor(a) Juiz(a),

Vem a autora relatar que vem sofrendo violência doméstica por parte de [nome do agressor], descreve fatos: [resumo objetivo]. Diante do exposto, requer:
- Concessão de medidas protetivas de urgência (afastamento, proibição de contato, etc.)
- Antecipação de tutela, se cabível.

Documentos: Boletim de ocorrência, laudos, fotos, testemunhas.`,
      source: "Modelo prático"
    }
  ],
  consumidor: [
    {
      title: "Carta de Reclamação e Pedido de Reembolso (modelo)",
      desc: "Modelo para pedir reembolso ou estorno por produto/serviço defeituoso.",
      filename: "carta_reembolso.txt",
      template:
`[Seu Nome]
[Endereço]
[Data]

À [Empresa / Fornecedor]
Assunto: Solicitação de Reembolso / Estorno

Prezados,

Comprei o produto/serviço [descrição] em [data]. O produto apresentou [defeito/serviço não executado]. Solicito o reembolso do valor R$ [valor] ou a substituição do produto, sob pena de medidas administrativas/judiciais.

Atenciosamente,
[Seu Nome]`,
      source: "Modelo prático"
    },
  ],
};

/* CASOS REAIS — adaptados para resumir: o que aconteceu, veredito, valor e relevância */
const CASES = {
  trabalhistas: [
    {
      title: "Ação por horas extras — trabalhador com ponto não registrado",
      url: "https://exemplo.trt/caso-horas-extras.pdf",
      summary:
        "Empregado alegou realização de horas além da jornada contratual sem registro no sistema de ponto.",
      verdict: "TJ reconheceu o direito às horas extras com adicional e reflexos.",
      amount: "Indenização equivalente a R$ 12.500 (valor demonstrativo, depende do período).",
      relevance:
        "Mostra que, mesmo sem ponto formal, provas indiretas (mensagens, testemunhas) podem convencer o juiz.",
    },
    {
      title: "Reconhecimento de vínculo por terceirização irregular",
      url: "https://exemplo.trt/caso-vinculo.pdf",
      summary:
        "Trabalhador contratado por empresa terceirizada pleiteou reconhecimento de vínculo com tomador.",
      verdict: "Tribunal reconheceu vínculo e condenou tomador ao pagamento de verbas trabalhistas.",
      amount: "Valores devidos recalculados — reflexos em FGTS, férias, 13º.",
      relevance:
        "Importante quando o trabalhador exerce atividades centrais da empresa e não há autonomia.",
    },
  ],
  constitucionais: [
    {
      title: "Negativa de cobertura de tratamento — Estado/Plano",
      url: "https://portal.stf.jus.br/caso-exemplo.pdf",
      summary:
        "Paciente teve tratamento de alta complexidade negado pelo plano/ente público e recorreu à justiça.",
      verdict: "Judiciário determinou fornecimento imediato do tratamento por tutela de urgência.",
      amount: "Custos de tratamento assumidos pelo réu (variável).",
      relevance:
        "Relevante para usuários que precisam de medidas rápidas para tratamento de saúde; mostra eficácia da tutela de urgência.",
    },
  ],
  mulher: [
    {
      title: "Medida protetiva e afastamento do agressor",
      url: "https://portal.stf.jus.br/caso-mp.pdf",
      summary:
        "Vítima relatou violência doméstica; foi solicitado afastamento imediato do agressor.",
      verdict: "Medidas protetivas concedidas, com obrigatoriedade de afastamento e restrição de contato.",
      amount: "Não envolve indenização financeira direta; proteção imediata foi o objetivo.",
      relevance:
        "Demonstra como agir rapidamente e as medidas que a lei prevê para proteção da vítima.",
    },
  ],
  consumidor: [
    {
      title: "Restituição por cobrança indevida — banco",
      url: "https://stj.jus.br/caso-consumidor.pdf",
      summary:
        "Consumidor cobrado indevidamente teve sucesso na reclamação contra instituição financeira.",
      verdict: "Restituição dos valores cobrados, com correção e honorários.",
      amount: "Restituição de R$ 2.400 + correção (exemplo).",
      relevance:
        "Mostra que práticas abusivas de cobrança podem gerar devolução e correção monetária.",
    },
  ],
};

/* Helpers: copiar / baixar */
function copyToClipboard(text) {
  if (!navigator.clipboard) {
    alert("Navegador não suporta cópia automática. Selecione e copie manualmente.");
    return;
  }
  navigator.clipboard
    .writeText(text)
    .then(() => {
      // feedback simples
      alert("Modelo copiado para a área de transferência.");
    })
    .catch(() => {
      alert("Falha ao copiar. Tente selecionar e copiar manualmente.");
    });
}

function downloadTextFile(filename, content) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/* Accordion component (interno) */
function Accordion({ label, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`accordion ${open ? "open" : ""}`}>
      <button aria-expanded={open} className="accordion-toggle" onClick={() => setOpen((v) => !v)}>
        <span>{label}</span>
        <FiChevronDown className="chev" />
      </button>
      <div className="accordion-panel" hidden={!open}>
        {children}
      </div>
    </div>
  );
}

/* Main component */
export default function RightsExplorer() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("guia");
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].key);
  const currentCat = CATEGORIES.find((c) => c.key === activeCategory);

  return (
    <div className="rights-root">
      <br />

      <header className="rights-header container">
        <h1>Explorar Direitos</h1>
        <p className="lead">
          Descubra seus direitos de forma simples e acessível. Guias práticos, modelos de documentos e casos
          reais para te ajudar.
        </p>

        <nav className="rights-tabs" role="tablist" aria-label="Seletor de conteúdo">
          <button className={`tab ${tab === "guia" ? "active" : ""}`} onClick={() => setTab("guia")}>
            Guia de Direitos
          </button>
          <button className={`tab ${tab === "modelos" ? "active" : ""}`} onClick={() => setTab("modelos")}>
            Modelos de Documentos
          </button>
          <button className={`tab ${tab === "casos" ? "active" : ""}`} onClick={() => setTab("casos")}>
            Casos Reais
          </button>
        </nav>
      </header>

      <main className="rights-main container">
        {/* tiles */}
        <section className="category-tiles" aria-label="Categorias">
          {CATEGORIES.map((cat) => (
            <article
              key={cat.key}
              className={`cat-tile ${cat.key} ${activeCategory === cat.key ? "selected" : ""}`}
              onClick={() => setActiveCategory(cat.key)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setActiveCategory(cat.key)}
              aria-pressed={activeCategory === cat.key}
            >
              <div className="cat-icon" aria-hidden>
                {cat.icon}
              </div>
              <h4>{cat.title}</h4>
              <p className="muted">{cat.desc}</p>
            </article>
          ))}
        </section>

        {/* painel principal */}
        <section className="panels-grid" aria-live="polite">
          {/* guia / explicação */}
          <div className={`panel panel-left ${activeCategory}`}>
            <div className="panel-title">
              <strong>{currentCat.title}</strong>
              <p className="muted">Seus direitos fundamentais explicados</p>
            </div>

            {currentCat.items.map((it, idx) => (
              <Accordion key={it} label={it} defaultOpen={idx === 0}>
                <p className="muted small">
                  Descrição breve sobre <strong>{it}</strong>. Aqui você encontra o que diz a lei, passos práticos e
                  referências para agir.
                </p>
                <ul>
                  <li>Resumo do direito</li>
                  <li>Artigos / Leis relacionadas</li>
                  <li>Passos práticos</li>
                </ul>
              </Accordion>
            ))}

            <div className="panel-actions">
              <button className={`btn outline accent-btn ${activeCategory}`}>Ver Todos os {currentCat.title}</button>
            </div>
          </div>

          {/* recursos / modelos / casos - muda conforme a aba */}
          <div className={`panel panel-right ${activeCategory}`}>
            <div className="panel-title">
              <strong>
                {tab === "guia" ? "Recursos & Modelos" : tab === "modelos" ? "Modelos para download" : "Casos Reais"}
              </strong>
              <p className="muted">
                {tab === "guia"
                  ? "Modelos, documentos e guias rápidos relacionados."
                  : tab === "modelos"
                  ? "Estruturas prontas para copiar ou baixar."
                  : "Resumo curto de casos reais e por que são relevantes."}
              </p>
            </div>

            {/* MODELOS: MOSTRAR TEMPLATE + COPIAR/BAIXAR */}
            {tab === "modelos" && (
              <div className="resource-list">
                {(DOCUMENTS[activeCategory] || []).map((doc) => (
                  <div className="resource-item" key={doc.filename}>
                    <div className="res-left">
                      <FiFileText size={18} />
                    </div>

                    <div className="res-body" style={{ minWidth: 0 }}>
                      <div className="res-title">{doc.title}</div>
                      <div className="muted small" style={{ marginBottom: 8 }}>
                        {doc.desc}
                      </div>

                      <pre className="model-template" aria-label={`Template ${doc.title}`}>
                        {doc.template}
                      </pre>

                      <div className="res-actions" style={{ marginTop: 8 }}>
                        <button
                          className={`btn tiny accent-btn ${activeCategory}`}
                          type="button"
                          onClick={() => copyToClipboard(doc.template)}
                        >
                          Copiar
                        </button>

                        <button
                          className={`btn tiny accent-btn ${activeCategory}`}
                          type="button"
                          onClick={() => downloadTextFile(doc.filename, doc.template)}
                        >
                          Baixar (.txt)
                        </button>

                        {/* abrir referência se existir source/URL */}
                        {doc.url && (
                          <a
                            className={`btn tiny accent-btn ${activeCategory}`}
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Abrir referência
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                <div style={{ marginTop: 8 }} className="muted small">
                  Dica: copie o conteúdo para editar no Word/Google Docs antes de usar em um processo.
                </div>
              </div>
            )}

            {/* CASOS: mostrar resumo curto + link */}
            {tab === "casos" && (
              <div className="resource-list">
                {(CASES[activeCategory] || []).map((c) => (
                  <div className="resource-item" key={c.title}>
                    <div className="res-left">
                      <FiFileText size={18} />
                    </div>

                    <div className="res-body">
                      <div className="res-title">{c.title}</div>
                      <div className="muted small" style={{ marginBottom: 8 }}>
                        {c.summary}
                      </div>

                      <div className="case-summary muted small">
                        <strong>Veredito:</strong> {c.verdict} <br />
                        <strong>Valor / Indenização:</strong> {c.amount} <br />
                        <strong>Por que importa:</strong> {c.relevance}
                      </div>

                      <div className="res-actions" style={{ marginTop: 8 }}>
                        <a
                          className={`btn tiny accent-btn ${activeCategory}`}
                          href={c.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Ler decisão
                        </a>

                        <button
                          className={`btn tiny accent-btn ${activeCategory}`}
                          onClick={() =>
                            alert(
                              "Resumo copiado. Use este exemplo para entender como estruturar seu pedido ao advogado ou ao sindicato."
                            )
                          }
                        >
                          Usar como referência
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* GUIA: listagem reduzida com opção Abrir */}
            {tab === "guia" && (
              <div className="resource-list">
                {(DOCUMENTS[activeCategory] || []).slice(0, 3).map((doc) => (
                  <div className="resource-item" key={doc.filename || doc.title}>
                    <div className="res-left">
                      <FiFileText size={18} />
                    </div>
                    <div className="res-body">
                      <div className="res-title">{doc.title}</div>
                      <div className="muted small">{doc.desc}</div>
                    </div>
                    <div className="res-actions">
                      <a className={`btn tiny accent-btn ${activeCategory}`} href={doc.url || "#"} target="_blank" rel="noopener noreferrer">
                        Abrir
                      </a>
                      <button
                        className={`btn tiny accent-btn ${activeCategory}`}
                        onClick={() => {
                          if (doc.template) copyToClipboard(doc.template);
                          else alert("Sem template para copiar — abra a referência.");
                        }}
                      >
                        Copiar modelo
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="panel-actions" style={{ marginTop: 16 }}>
              {tab === "modelos" ? (
                <button
                  className={`btn primary accent-btn ${activeCategory}`}
                  onClick={() => {
                    const first = DOCUMENTS[activeCategory]?.[0];
                    if (first) downloadTextFile(first.filename, first.template);
                    else alert("Sem modelos disponíveis nesta categoria.");
                  }}
                >
                  Baixar principal
                </button>
              ) : tab === "casos" ? (
                <a className={`btn primary accent-btn ${activeCategory}`} href={CASES[activeCategory]?.[0]?.url || "#"} target="_blank" rel="noopener noreferrer">
                  Ver Caso Representativo
                </a>
              ) : (
                <button className={`btn primary accent-btn ${activeCategory}`}>Acessar Biblioteca</button>
              )}
            </div>
          </div>
        </section>
      </main>

      <FooterContent />
    </div>
  );
}
