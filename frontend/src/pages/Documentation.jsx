import React, { useState, useEffect } from "react";
import FooterContent from "../components/FooterComponent";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw"; // OBRIGATÓRIO: Permite renderizar as tags <img> e <div> do HTML
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiMenu, FiX, FiGithub, FiCopy, FiCheck } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import "../styles/documentation.css";

// Função para gerar IDs limpos (sem acentos, minúsculos, com hífens)
// Ex: "Visão Geral" -> "visao-geral"
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD') // Separa acentos das letras
    .replace(/[\u0300-\u036f]/g, '') // Remove os acentos
    .replace(/\s+/g, '-') // Espaços viram hífens
    .replace(/[^\w-]+/g, '') // Remove caracteres especiais restantes
    .replace(/--+/g, '-') // Remove hífens duplicados
    .replace(/^-+/, '') // Remove hífen do início
    .replace(/-+$/, ''); // Remove hífen do fim
};

import markdownContent from "../../../readme.md?raw";

// Seções atualizadas da sidebar com IDs "Slugificados" (sem acentos)
const docSections = [
  { id: "sentryai", label: "Topo" },
  { id: "visao-geral", label: "Visão Geral" },
  { id: "funcionalidades-principais", label: "Funcionalidades" },
  { id: "tecnologias-utilizadas", label: "Tecnologias" },
  { id: "instalacao", label: "Instalação" },
  { id: "rodando-o-projeto", label: "Rodando o Projeto" },
  { id: "estrutura-do-repositorio", label: "Repositório" },
  { id: "principais-endpoints", label: "Endpoints API" },
  { id: "modelo-do-banco-de-dados", label: "Banco de Dados" },
  { id: "comandos-da-cli", label: "CLI & Comandos" },
  { id: "licenca", label: "Licença" }
];

export default function Documentation() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  // Detectar seção ativa no scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = docSections.map(s => document.getElementById(s.id));
      const scrollPos = window.scrollY + 180; // Offset

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPos) {
          setActiveSection(docSections[i].id);
          break;
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      window.scrollTo({ top: el.offsetTop - 100, behavior: "smooth" });
      setActiveSection(id);
      setMobileMenuOpen(false);
    }
  };

  // Customização dos componentes Markdown
  const MarkdownComponents = {
    // Aplica a função slugify aos headers para garantir que os IDs correspondam ao menu
    h1: ({children}) => <h1 id={slugify(children)}>{children}</h1>,
    h2: ({children}) => <h2 id={slugify(children)}>{children}</h2>,
    
    // Tratamento de imagens (para os badges funcionarem via rehypeRaw e também markdown normal)
    img: ({src, alt}) => (
        <img 
            src={src} 
            alt={alt} 
            style={{ display: 'inline-block', margin: '4px', maxWidth: '100%', height: 'auto' }} 
        />
    ),

    // Botão de copiar para blocos de código
    code({node, inline, className, children, ...props}) {
        const match = /language-(\w+)/.exec(className || '')
        const codeText = String(children).replace(/\n$/, '');
        const [copied, setCopied] = useState(false);

        const handleCopy = () => {
            navigator.clipboard.writeText(codeText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }

        return !inline && match ? (
          <div className="code-block-wrapper">
            <div className="code-header">
                <span>{match[1]}</span>
                <button onClick={handleCopy} className="copy-btn">
                    {copied ? <FiCheck size={14} /> : <FiCopy size={14} />}
                    {copied ? "Copiado" : "Copiar"}
                </button>
            </div>
            <pre className={className} {...props}>
              <code>{children}</code>
            </pre>
          </div>
        ) : (
          <code className={className} {...props}>
            {children}
          </code>
        )
    }
  };

  return (
    <div className="docs-layout">
      {/* Header Fixo */}
      <motion.header 
        className="docs-navbar"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="docs-nav-left">
            <button className="docs-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <FiX /> : <FiMenu />}
            </button>
            <div className="docs-logo" onClick={() => navigate('/')}>
                SentryAI <span className="badge">DOCS</span>
            </div>
        </div>

        <div className="docs-nav-right">
            <motion.a 
                href="https://github.com/Bernardo270408/SentryAI" 
                target="_blank" 
                rel="noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-github"
            >
                <FiGithub /> GitHub
            </motion.a>
            <motion.button 
                onClick={() => navigate(-1)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn outline"
            >
                Voltar
            </motion.button>
        </div>
      </motion.header>

      <div className="docs-container">
        {/* Sidebar de Navegação */}
        <aside className={`docs-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
            <nav>
                <p className="sidebar-title">Conteúdo</p>
                <ul>
                    {docSections.map((section) => (
                        <motion.li 
                            key={section.id}
                            initial={{ x: -10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <button 
                                onClick={() => scrollTo(section.id)}
                                className={activeSection === section.id ? 'active' : ''}
                            >
                                {activeSection === section.id && (
                                    <motion.span layoutId="active-indicator" className="active-dot" />
                                )}
                                {section.label}
                            </button>
                        </motion.li>
                    ))}
                </ul>
            </nav>
        </aside>

        {/* Conteúdo Principal */}
        <motion.main 
            className="docs-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
        >
            <div className="markdown-viewer">
                {/* rehypeRaw é passado aqui para permitir HTML cru (como os badges) */}
                <ReactMarkdown 
                    components={MarkdownComponents}
                    rehypePlugins={[rehypeRaw]}
                >
                    {markdownContent}
                </ReactMarkdown>
            </div>
            
            <div style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid var(--docs-border)' }}>
               <FooterContent />
            </div>
        </motion.main>
      </div>
    </div>
  );
}