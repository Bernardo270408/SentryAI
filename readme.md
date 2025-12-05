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
* [Dependências recomendadas (pinos)](#dependências-recomendadas-pinos)
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

* Chat jurídico com contexto por conversa (streaming quando disponível).
* Análise automática de contratos: extração de cláusulas, sumarização e score de risco (0–100).
* Upload multi-formato (PDF, DOCX, ODT, TXT) e extração robusta de texto.
* Dashboard com KPIs, gráficos de uso e histórico de análises.
* Autenticação híbrida: e-mail/senha + OTP por e-mail e OAuth Google.
* CLI para administração, testes e integrações.
* Estrutura modular backend (Blueprints / Services / DAO / Migrations).

---

## Status & Compatibilidade

* Recomendado: **Python 3.11+**
* Frontend: **Node.js 18+ / npm 9+**
* Banco: **MySQL 8.x** (ou RDS compatível)
* Testes automatizados com `pytest` (backend) e `vitest` / `jest` (frontend)

---

## Quickstart (local)

### Preparação geral

1. Copie `.env.example` para `.env` nas pastas `Backend` e `frontend` e preencha as chaves (veja seção **Variáveis de ambiente**).
2. Certifique-se de ter um servidor MySQL acessível e as credenciais corretas no `.env`.

### Backend (local)

```bash
# clone o repositório e acesse o backend
git clone https://github.com/Bernardo270408/SentryAI.git
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
```

A API estará disponível por padrão em `http://localhost:5000`.

### Frontend (local)

```bash
cd ../frontend
npm install
cp .env.example .env
# edite .env para apontar VITE_API_URL e VITE_GOOGLE_CLIENT_ID
npm run dev
```

O frontend (Vite) normalmente roda em `http://localhost:5173`.

---

## Dependências recomendadas (pinos)

> Versões sugeridas (testadas/compatíveis em 2025). Use pins para reprodutibilidade.

```text
Flask==3.1.2
SQLAlchemy==2.0.44
Flask-SQLAlchemy==3.1.1
Flask-Cors==6.0.1
Flask-Migrate==4.1.0
PyJWT==2.10.1
openai==2.9.0
python-dotenv==1.2.1
PyMySQL==1.1.2
requests==2.32.0
email-validator==2.3.0
google-genai==<usar SDK oficial google-genai>
cryptography==46.0.3
google-auth==<versão_compatível>
google-auth-oauthlib==1.2.3

# Ferramentas para leitura/edição de documentos
python-docx==1.2.0
python-pptx==0.6.21
openpyxl==3.1.2
pypdf2==3.0.0
odfpy==1.4.1
```

---

## Variáveis de ambiente (exemplo `.env` - backend)

```ini
# Segurança & App
SECRET_KEY="substitua_por_string_segura"
ENV=development

# Banco de Dados
DATABASE_URL="mysql+pymysql://usuario:senha@host:3306/sentryai?charset=utf8mb4"

# IA
GEMINI_API_KEY="seu_key_google_genai"
OPENAI_API_KEY="sua_key_openai"

# OAuth Google
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Email (SMTP) - para OTP
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email@gmail.com
SMTP_PASSWORD=sua_senha_app

# Outros (opcionais)
REDIS_URL=redis://host:6379/0   # opcional, para filas/cache
```

---

## Estrutura do repositório

```
SentryAI/
├── Backend/
│   ├── app.py
│   ├── requirements.txt
│   ├── .env.example
│   ├── src/
│   │   ├── api/         # Blueprints / controllers
│   │   ├── models/      # SQLAlchemy models
│   │   ├── services/    # business logic, IA integracoes
│   │   ├── dao/         # acesso a dados
│   │   ├── migrations/  # Alembic (Flask-Migrate)
│   │   └── cli/         # comandos administrativos
│
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── pages/
│       └── components/
│
├── CLI/
├── docs/
│   ├── architecture.md
│   ├── api.md
│   └── runbooks/
└── .github/              # ações/workflows (CI)
```

---

## Arquitetura & Fluxo (resumo)

1. **Frontend (React/Vite)** → chama API REST (Flask) → endpoints autenticados (JWT / OAuth).
2. **API Flask** → recebe documentos / mensagens → `services`:

   * pré-processamento (OCR, extração de texto)
   * normalização e chunking
   * chamada a provedor GenAI (Google / OpenAI)
   * pós-processamento (scores, highlights)
3. **Persistência**: MySQL (dados relacionais) + Redis (cache/filas) — Redis é opcional, dependendo do volume.
4. **Observabilidade**: logs estruturados, métricas (Prometheus) e traces (OpenTelemetry) — instrumente rotas críticas.

---

## Testes, CI/CD e Observabilidade

* **Testes unitários / integração**: `pytest` para backend; `vitest`/`jest` para frontend.
* **Lint / Formatting**: `black` + `ruff` (Python); `prettier` + `eslint` (JS/TS).
* **CI**: GitHub Actions (workflows para `test`, `lint`, `build` e `deploy`). Exemplos de workflows:

  * `ci/test-backend.yml` — cria venv, instala pins, roda `pytest`.
  * `ci/test-frontend.yml` — `npm ci`, `npm run build`, `npm test`.
* **Observabilidade**: envie logs para um sink (Cloud Logging / ELK). Adicione traces com OpenTelemetry nas rotas de IA (para medir latência de chamadas a provedores).

---

## Segurança & Privacidade (essenciais)

* Nunca persista chaves (GEMINI/OPENAI) em repositório — use secrets do CI e variáveis de ambiente.
* Habilite rotação de chaves e limites de acesso.
* Proteja endpoints sensíveis com rate-limiting + WAF.
* Criptografe dados sensíveis em repouso (ex.: PII) usando `cryptography` e chaves hospedadas em KMS.
* Documente política de retenção e procedimentos para anonimização/exclusão sob solicitação.

---

## Como contribuir

1. Fork → branch `feat/<descrição>` (ex.: `feat/contract-parser-pdf`)
2. Siga o `CONTRIBUTING.md` (preencha templates de PR e issue).
3. Tests obrigatórios: cada PR deve incluir testes unitários ou de integração relevantes.
4. Code review: 2 revisores obrigatórios; um aprovador de segurança quando houver mudanças em auth/IA/data.
5. Use `semantic-commit` (conventional commits) e mantenha o changelog atualizado via GH Actions.

---

## Padrões de código & Boas práticas

* Backend: PEP8, `black` (formatação), tipagem gradual (Python typing).
* Frontend: componentes React com hooks; CSS Modules ou Tailwind; atenção a11y.
* Documentação: atualize `docs/` e `api.md` sempre que um endpoint mudar.

---

## Documentação Técnica

* `docs/api.md` — endpoints, exemplos de request/response, schemas.
* `docs/architecture.md` — diagrama detalhado e decisões arquiteturais.
* `docs/runbooks/` — playbooks para incidentes (ex.: latência IA, quota API estourada).

---

## Licença

Copyright (c) 2025
Bernardo "222" Duarte Marcelino and Yagor Vitor Silva dos Santos

Distribuído sob a **MIT License** — veja o arquivo `LICENSE` para detalhes.
