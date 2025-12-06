# SentryAI

<p align="center" display="inline-block">
  <img src="https://img.shields.io/badge/Python-3.11%2B-3776AB?style=for-the-badge&logo=python&logoColor=white"/>
  <img src="https://img.shields.io/badge/Flask-3.1.2-000000?style=for-the-badge&logo=flask&logoColor=white"/>
  <img src="https://img.shields.io/badge/SQLAlchemy-2.0.44-D71F00?style=for-the-badge&logo=sqlalchemy&logoColor=white"/>
  <img src="https://img.shields.io/badge/MySQL-8.0-005C84?style=for-the-badge&logo=mysql&logoColor=white"/>
  <img src="https://img.shields.io/badge/React-18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB"/>
  <img src="https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=Vite&logoColor=white"/>
  <img src="https://img.shields.io/badge/GenAI-Gemini-8E75B2?style=for-the-badge&logo=google%20cloud&logoColor=white"/>
</p>

**SentryAI** é uma plataforma full-stack para assistência jurídica democratizada. Fornece chat jurídico com contexto, análise automática de contratos (detecção e score de cláusulas de risco), dashboards analíticos e uma CLI para operações e testes.

---

## Índice

* [Visão geral](#visão-geral)
* [Funcionalidades principais](#funcionalidades-principais)
* [Status & Compatibilidade](#status--compatibilidade)
* [Quickstart (local)](#quickstart-local)
* [Dependências (Backend)](#dependências-backend)
* [Variáveis de ambiente](#variáveis-de-ambiente)
* [Estrutura do repositório](#estrutura-do-repositório)
* [Arquitetura & Fluxo](#arquitetura--fluxo)
* [Testes, CI/CD e Observabilidade](#testes-cicd-e-observabilidade)
* [Segurança & Privacidade](#segurança--privacidade)
* [Como contribuir](#como-contribuir)
* [Licença](#licença)

---

## Visão geral

SentryAI integra modelos generativos (Google GenAI / Gemini e OpenAI) com uma API REST em Flask e um front em React/Vite. Foco: legislação brasileira — CLT, Código do Consumidor e Constituição — com pipelines para ingestão de documentos (PDF/DOCX/RTF/TXT) e geração de relatórios de risco.

---

## Funcionalidades principais

* Chat jurídico com contexto por conversa (streaming suportado).
* Análise automática de contratos: extração de cláusulas, sumarização e score de risco (0–100).
* Upload multi-formato (PDF, DOCX, ODT, TXT, PPTX, XLSX) e extração robusta de texto.
* Dashboard com KPIs, gráficos de uso e histórico de análises.
* Autenticação híbrida: e-mail/senha + OTP por e-mail e OAuth Google.
* CLI (Command Line Interface) robusta para administração, testes e integrações.
* Estrutura modular backend (Router / Services / DAO / Models).

---

## Status & Compatibilidade

* Recomendado: **Python 3.11+**
* Frontend: **Node.js 18+ / npm 9+**
* Banco: **MySQL 8.x** (ou RDS compatível)
* Testes: Estrutura preparada para testes unitários.

---

## Quickstart (local)

### Preparação geral

1. Copie `.env.example` para `.env` nas pastas `Backend` e `frontend` e preencha as chaves (veja seção **Variáveis de ambiente**).
2. Certifique-se de ter um servidor MySQL acessível e as credenciais corretas no `.env`.

### Backend (local)

```bash
# clone o repositório e acesse o backend
git clone [https://github.com/Bernardo270408/SentryAI.git](https://github.com/Bernardo270408/SentryAI.git)
cd SentryAI/Backend

# criar e ativar ambiente virtual
python -m venv venv
source venv/bin/activate   # Linux / Mac
.\venv\Scripts\activate    # Windows PowerShell

# instalar dependências
pip install -r requirements.txt

# preparar .env (veja seção Variáveis de ambiente)
cp .env.example .env
# edite .env e adicione as chaves e DATABASE_URL corretamente

# criar o banco (exemplo via cliente mysql)
# CREATE DATABASE sentryai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# rodar migrações
flask db upgrade

# iniciar a API
python app.py
````

A API estará disponível por padrão em `http://localhost:5000`.

### Frontend (local)

```bash
cd ../frontend
npm install
cp .env.example .env
# edite .env para apontar VITE_GOOGLE_CLIENT_ID (e VITE_API_URL se necessário)
npm run dev
```

O frontend (Vite) normalmente roda em `http://localhost:5173`.

-----

## Dependências (Backend)

Principais bibliotecas utilizadas (baseado em `requirements.txt`):

```text
# Framework & DB
Flask
SQLAlchemy / Flask-SQLAlchemy
Flask-Migrate
Flask-Cors
PyMySQL

# Autenticação & Segurança
PyJWT
cryptography
google-auth
google-auth-oauthlib

# IA & Integrações
openai
google-generativeai
email-validator

# Processamento de Arquivos
python-docx
python-pptx
openpyxl
pypdf2
odfpy
pyyaml
beautifulsoup4
striprtf
```

-----

## Variáveis de ambiente (exemplo `.env` - backend)

```ini
# Segurança & App
SECRET_KEY="sua_chave_secreta_aqui"
ENV=development

# Banco de Dados
DATABASE_URL="mysql+pymysql://usuario:senha@host:3306/sentryai?charset=utf8mb4"

# IA
GEMINI_API_KEY="sua_api_key_aqui"
OPENAI_API_KEY="sua_key_openai" # Opcional se usar apenas Gemini

# OAuth Google
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Email (SMTP) - para OTP
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=api095427@gmail.com
SMTP_PASSWORD=sua_senha_de_app_aqui
```

-----

## Estrutura do repositório

```
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
```

-----

## Arquitetura & Fluxo (resumo)

1.  **Frontend (React/Vite)** → chama API REST (Flask) → endpoints autenticados (JWT / OAuth).
2.  **API Flask** → recebe documentos / mensagens → `services`:
      * **FileReader Service**: Extração de texto de PDF, DOCX, ODT, CSV, etc.
      * **AI Service**: Normalização e envio de prompt para Google Gemini ou OpenAI.
      * **Email Service**: Disparo de OTP para verificação de conta.
3.  **Persistência**: MySQL (dados relacionais: Users, Chats, Messages, Ratings, Contracts).
4.  **CLI**: Ferramenta de linha de comando para interação direta com a API, útil para administração e testes sem interface gráfica.

-----

## Testes, CI/CD e Observabilidade

  * **Testes**: Estrutura pronta para `pytest` no backend. A CLI serve como ferramenta de teste funcional manual.
  * **Lint / Formatting**: Código Python segue padrões PEP8 (formatado com `black` recomendado).
  * **Observabilidade**: Logs estruturados via módulo `logging` do Python.

-----

## Segurança & Privacidade (essenciais)

  * Nunca persista chaves (GEMINI/OPENAI) em repositório — use secrets do CI e variáveis de ambiente.
  * Senhas de usuários são hashadas (Werkzeug security).
  * Tokens JWT para proteção de rotas privadas.
  * Validação de e-mail via OTP para novos cadastros.

-----

## Como contribuir

1.  Fork → branch `feat/<descrição>`
2.  Siga o `CONTRIBUTING.md` (se disponível) ou padrão de PR.
3.  Mantenha a estrutura de pastas (DAO/Service/Router) no Backend.
4.  Atualize a documentação em `docs/` se alterar endpoints ou comandos da CLI.

-----

## Documentação Técnica

  * `docs/API_ENDPOINTS.md` — Lista completa de rotas, exemplos de request/response.
  * `docs/CLI_COMMANDS.md` — Manual de uso da interface de linha de comando.
  * `docs/DB_SCHEMA.md` — Estrutura das tabelas e relacionamentos do banco de dados.

-----

## Licença

Copyright (c) 2025
Bernardo "222" Duarte Marcelino and Yagor Vitor Silva dos Santos

Distribuído sob a **MIT License** — veja o arquivo `LICENSE` para detalhes.
