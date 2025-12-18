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

const markdownContent = `
# SentryAI

<div align="center">
  <img src="https://img.shields.io/badge/Python-3.11%2B-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python"/>
  <img src="https://img.shields.io/badge/Flask-3.1.2-000000?style=for-the-badge&logo=flask&logoColor=white" alt="Flask"/>
  <img src="https://img.shields.io/badge/SQLAlchemy-2.0.44-D71F00?style=for-the-badge&logo=sqlalchemy&logoColor=white" alt="SQLAlchemy"/>
  <img src="https://img.shields.io/badge/MySQL-8.0-005C84?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL"/>
  <img src="https://img.shields.io/badge/React-18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React"/>
  <img src="https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=Vite&logoColor=white" alt="Vite"/>
  <img src="https://img.shields.io/badge/GenAI-Gemini-8E75B2?style=for-the-badge&logo=google%20cloud&logoColor=white" alt="Gemini"/>
</div>

**SentryAI** é uma plataforma para assistência jurídica democratizada, voltada ao gerenciamento de modelos de IA, específicamente ao caráter jurídico brasileiro. Sua principal funcionalidade é a possibilidade de realizar um chat com uma IA especializada na lei brasileira.

---

## Índice

- [Visão geral](#visao-geral)
- [Funcionalidades principais](#funcionalidades-principais)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Instalação](#instalacao)
  - [Pré Requisitos](#pre-requisitos)
  - [Passo a passo](#passo-a-passo)
  - [Configurando a CLI](#configurando-a-cli)
- [Rodando o Projeto](#rodando-o-projeto)
  - [Inicializando a API](#inicializando-a-api)
  - [Inicializando a CLI](#inicializando-a-api)
- [Estrutura do repositório](#estrutura-do-repositorio)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Endpoints da API](#principais-endpoints)
- [Modelo do Banco de Dados](#modelo-do-banco-de-dados)
- [Comandos da CLI](#comandos-da-cli)
- [Licença](#licenca)

---

## Visão geral

O **SentryAI**, como dito antes, é uma aplicação que visa coletar dados para uma pesquisa, cujo objetivo é identificar falhas comuns no entendimento da lei e fornecer auxílio rápido para pessoas com questionamentos a respeito da legislação.

---

## Funcionalidades principais

- **Chat** com uma IA especializada na lei brasileira.
- **Análise automática de contratos**: extração de cláusulas, sumarização e score de risco.
- **Dashboard** com KPIs, gráficos de uso e histórico de análises.
- **Autenticação híbrida**: e-mail/senha + OTP por e-mail e OAuth Google.
- **CLI** (Command Line Interface) voltada para usuários avançados.

---

## Tecnologias Utilizadas
> **Nota:** Nas últimas atualizações, nós, a equipe de desenvolvimento, decidimos por substituír o **Ollama** pela API da **OpenAI** e do **Gemini 2.5**, ficando a critério do usuário qual utilizar. A mudança se deve ao alto custo em hardware demandado por LLMs locais. Isso não significa que o projeto se perdeu, uma vêz que o caráter inicial sempre foi experimentação na área das Inteligências Artificiais.

- **ChatGPT** - Serviço de IA da OpenAI
- **Gemini** - Serviço de IA da Google
- **Google Auth** - API da Google para autenticação
- **Flask** - Framework web para Python.
- **React + Vite** - Frameworks para o Front-End.
- **SQLAlchemy** - ORM para interação com o banco de dados.
- **MySQL** - RDBMS escolhido por sua simplicidade e robustez
- **JWT** - Tokens e Autenticação

---

## Instalação

### Pré-Requisitos
Antes de rodar o projeto, certifique-se de ter o Python 3.x e o pip instalados.
- [Python3.x](https://www.python.org/)
- [Pip](https://pip.pypa.io/en/stable/)
- [MySQL](https://www.mysql.com/)
- [NPM](https://www.npmjs.com/)


### Passo a Passo

**0.** Clone este repositório:
\`\`\`bash
git clone https://github.com/Bernardo270408/SentryAI
cd SentryAI
\`\`\`

**1.** Crie um ambiente virtual
\`\`\`bash
cd Backend
python3 -m venv venv
\`\`\`
- Linux/MacOS
  \`\`\`bash
  source venv/bin/activate
  \`\`\`

- Windows
  \`\`\`bash
  ./venv\\Scripts\\activate
  \`\`\`

**2.** Instale as dependencias do Backend
\`\`\`bash
pip install -r requirements.txt
\`\`\`

**3.** Configure as variáveis de Ambiente
Renomeie o arquivo \`.env.example\` para \`.env\` na pasta raiz e configure as variáveis de ambiente:
\`\`\`env
#app
SECRET_KEY="sua_chave_secreta_aqui"
DATABASE_URL="mysql+pymysql://root:senha@localhost:3306/sentryai"

#ai service
OPENAI_TOKEN="seu-token"
GEMINI_API_KEY="sua_api_key_aqui"

#smtp
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email@gmail.com
SMTP_PASSWORD=sua_senha_de_app_gmail
\`\`\`

Há também um ambiente específico para o frontend em \`frontend/.env.example\`, que também deve ser devidamente configurado:
\`\`\`env
#app
VITE_API_URL="http:/localhost:5000"
VITE_GOOGLE_CLIENT_ID="seu_google_client_id_aqui"
\`\`\`

> **Nota**: Você pode obter todas as chaves de API necessárias para o projeto nos seguintes links de forma gratuita:<br>&nbsp;&nbsp;&nbsp; **•** [GEMINI_API_KEY](https://aistudio.google.com/apps) <br>&nbsp;&nbsp;&nbsp; **•** [VITE_GOOGLE_CLIENT_ID](https://console.cloud.google.com/auth/clients) <br>&nbsp;&nbsp;&nbsp; **•** [OPENAI_TOKEN](https://platform.openai.com/docs/overview)


**4.** Configure o Banco de Dados

Primeiro crie **com o MySQL** uma base de dados de nome \`sentryai\`:
\`\`\`sql
CREATE DATABASE sentryai;
\`\`\`

Após isso, na pasta do backend execute
\`\`\`bash
flask db upgrade
\`\`\`

**5.** Instale as dependencias do Frontend
\`\`\`bash
cd ../frontend
npm install
\`\`\`

### Configurando a CLI (Para Usuários Avançados apenas)
O SentryAI conta com uma CLI (Command Line Interface) para facilitar o uso da API, e permitir que usuários avancados possam interagir com o sistema sem a necessidade de uma interface gráfica.

#### Instalando a CLI

**1.** Crie outro ambiente virtual para a CLI 
\`\`\`bash
cd ../CLI
python3 -m venv venv
\`\`\`
- Linux/MacOS
  \`\`\`bash
  source venv/bin/activate
  \`\`\`

- Windows
  \`\`\`bash
  ./venv\\Scripts\\activate
  \`\`\`

**2.** Instale as dependencias da CLI 
\`\`\`bash
pip install -r requirements.txt
\`\`\`

>**Nota:** O inicializador da CLI é pre-compilado para Linux e Windows, mas caso seja necessário, o código fonte \`sentry.c\` está na mesma pasta, e pode ser compilado para o OS desejado.

> É recomendado adicionar o executável da CLI ao PATH de seu sistema.


#### Configurando os Defaults da CLI (Opcional)
A CLI utiliza alguns valores default para facilitar o uso. Estes valores são armazenados em arquivos na pasta \`CLI/data/\`.

Configure os valores padrão \`domain\` e \`port\`, que servirão para dizer à CLI onde exatamente está hospedada a API.
Estes são os valores padrão:
\`\`\`bash
sentry run
sentry defaults -set key="domain" value="127.0.0.1"
sentry defaults -set key="port" value="5000"
sentry quit
\`\`\`
> **Nota:** Este passo é apenas necessário caso a API esteja rodando em um domínio ou porta diferente do padrão (localhost:5000).

## Rodando o Projeto

### Inicializando a API (Back-End)
Para iniciar a API, caso esteja em um ambiente de testes, rode dentro da pasta do backend
\`\`\`bash
flask run --debug
\`\`\`
Em outros casos, recomenda-se o uso de \`gunicorn\`

### Inicializando o Client (Front-End)
Para iniciar o Client, caso esteja em um ambiente de testes, rode dentro da pasta do frontend
\`\`\`bash
npm run dev
\`\`\`
Em outros casos, recomenda-se usar \`npm run buid\`

### Inicializando a CLI (Command Line Interface)

Para iniciar a CLI, simplesmente digite no terminal:
\`\`\`bash
sentry run
\`\`\`

Caso não tenha sido incluida ao path, o comando deverá ser feito na pasta da CLI, sendo então:
\`\`\`bash
./sentry run
\`\`\`

> **Nota:** o uso de \`./\` apenas é necessário para o comando \`run\`, não sendo utilizado nos demais comandos da CLI.


## Estrutura do repositório

\`\`\`
SentryAI/
├── Backend/
│   ├── app.py               # Entry point da API
│   ├── config.py            # Configurações gerais
│   ├── requirements.txt
│   ├── .env.example
│   ├── extensions.py        # Inicialização do DB
│   ├── DAO/                 # Data Access Objects (Camada de dados)
│   ├── models/              # Modelos SQLAlchemy
│   ├── router/              # Rotas/Blueprints da API
│   ├── services/            # Lógica de negócio e integrações (IA, Email, Arquivos)
│   ├── middleware/          # JWT e Decorators
│   └── migrations/          # Scripts do Alembic
│
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── components/      # Componentes React reutilizáveis
│       ├── pages/           # Páginas da aplicação
│       ├── services/        # Integração com API (Axios/Fetch)
│       └── styles/          # Arquivos CSS
│
├── CLI/
│   ├── app.py               # Entry point Python da CLI
│   ├── sentry.c             # Wrapper em C para execução
│   ├── commands/            # Módulos de comando (chat, user, auth, etc.)
│   └── defaults.py          # Gerenciamento de configurações locais
│
├── docs/                    # Documentação técnica (API, DB, CLI)
└── LICENSE
\`\`\`

---

## Principais Endpoints
Ao rodar o backend, uma API ficará disponível em http://localhost:5000/ dentro do ambiente de testes. Caso esteja hospedado, a rota será diferente.
> **Nota:** A forma recomendada de acesso à API é utilizando o *frontend* ou a *CLI*. Caso queira fazer as requisições de maneira alternativa, ou seja um dos desenvolvedores, recomendamos a leitura dos endpoints disponiveis [neste documento](docs/API_ENDPOINTS.md).

Dicas:
- Todas as rotas protegidas exigem o header: \`Authorization: Bearer <token>\`
- O token é obtido via POST \`/login\` (leia o documento)


## Modelo do Banco de Dados
O Banco de Dados do SentryAI é baseado em MySQL, e gerenciado pelo SQLAlchemy com Pyhton. 

Existem 6 Tabelas Principais na Base de dados, sendo elas \`users\`,\`chats\`,\`user_messages\`,\`ai_messages\`,\`ratings\` e \`contracts\`. Um modelo extenso foi elaborado para garantir a compreensão do funcionamento desse modelo relacional.

> **Nota**: O modelo do banco de dados acabou tornando-se uma sessão extensa. Foi necessário movê-lo para uma sessão à parte, que pode ser lida [neste documento](docs/DB_SCHEMA.md).


---

## Comandos Da CLI
A CLI foi pensada no início como uma simples substituta ao frontend, que ainda não existia. Porém, foi reformulada para realmente ser utilizável e alternativa à interface visual, sendo atualmente uma forma oficial e recomendada para usuários avançados de se comunicar com o backend.

### Estrutura do Comando

\`\`\`bash
sentry [comando] -[subcomando] [chave]=[valor] [chave]=[valor] ...
\`\`\`

exemplo de autenticação:

\`\`\`bash
sentry auth -login email='test@mail' password='1234'
\`\`\`

retorna o token, o seta como padrão e pergunta se o ID do usuário em questão deverá ser utilizado como padrão para próximas iterações

> **Nota**: Há um documento detalhando **cada comando da CLI** e detalhes importantes de seu uso. Para lê-lo, acesse [este documento](docs/CLI_COMMANDS.md).

Dicas:

- Para executar qualquer comando, é necessário que a CLI esteja rodando
- Argumentos omitidos usarão valores default.
- Parâmetros extras serão ignorados (não causam erro).
- Desenvolvedores podem enviar todos os defaults sem risco.

---

## Licença
Copyright (c) 2025 Bernardo "222" Duarte Marcelino

Copyright (c) 2025 Yagor Vitor Silva dos Santos

Distribuído sob a MIT License — veja o arquivo \`LICENSE\` para detalhes.
`;

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