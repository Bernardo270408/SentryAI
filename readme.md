# SentryAI

## Descrição Geral
SentryAI é uma aplicação em Python (Flask + SQLAlchemy) para sistemas de chat com integração de IA. Ele gerencia usuários, chats, mensagens de usuários e mensagens de IA, com autenticação JWT e controle de permissões. Ideal para aplicações que precisam de histórico de conversas, respostas automáticas e gerenciamento seguro de dados.

## Estrutura do Projeto
```
Backend/
  app.py                # Inicialização da aplicação Flask
  config.py             # Configurações (DB, secret key)
  requirements.txt      # Dependências
  extensions.py         # Extensões Flask (SQLAlchemy)
  DAO/                  # Data Access Objects (CRUD)
    user_dao.py         # Usuários
    chat_dao.py         # Chats
    message_user_dao.py # Mensagens de usuário
    message_ai_dao.py   # Mensagens de IA
  models/               # Modelos ORM
    user.py             # Usuário
    chat.py             # Chat
    message_user.py     # Mensagem de usuário
    message_ai.py       # Mensagem de IA
  router/               # Rotas Flask (API REST)
    auth_router.py      # Autenticação (login)
    user_router.py      # Usuários
    chat_router.py      # Chats
    message_user_router.py # Mensagens de usuário
    message_ai_router.py   # Mensagens de IA
  middleware/
    jwt_util.py         # Autenticação JWT
  migrations/           # Migrações Alembic
  database/app.sqlite   # Banco SQLite
```

## Autenticação
- Todas as rotas protegidas exigem o header: `Authorization: Bearer <token>`
- O token é obtido via POST `/login` (ver exemplo abaixo)

## Endpoints Principais

### Autenticação
- `POST /login` — Autentica usuário, retorna token JWT
  - Body: `{ "email": "...", "password": "..." }`
  - Resposta: `{ "token": "...", "user": {...} }`

### Usuários
- `POST /users/` — Cria usuário
- `GET /users/` — Lista todos os usuários
- `GET /users/<id>` — Busca usuário por ID
- `PUT /users/<id>` — Atualiza usuário (autenticado)
- `DELETE /users/<id>` — Remove usuário (autenticado)

### Chats
- `POST /chats/` — Cria chat (autenticado)
- `GET /chats/` — Lista todos os chats (admin)
- `GET /chats/<id>` — Busca chat por ID (autenticado)
- `GET /chats/user/<user_id>` — Chats de um usuário
- `PUT /chats/<id>` — Atualiza chat
- `DELETE /chats/<id>` — Remove chat

### Mensagens de Usuário
- `POST /messages/` — Cria mensagem de usuário
- `GET /messages/` — Lista todas as mensagens (admin)
- `GET /messages/<id>` — Busca mensagem por ID
- `GET /messages/user/<user_id>` — Mensagens de um usuário
- `GET /messages/chat/<chat_id>` — Mensagens de um chat
- `PUT /messages/<id>` — Atualiza mensagem
- `DELETE /messages/<id>` — Remove mensagem

### Mensagens de IA
- `POST /ai-messages/` — Gera e armazena resposta da IA
- `GET /ai-messages/` — Lista todas as mensagens de IA (admin)
- `GET /ai-messages/<id>` — Busca mensagem de IA por ID
- `GET /ai-messages/chat/<chat_id>` — Mensagens de IA de um chat
- `GET /ai-messages/model/<model_name>` — Mensagens por modelo
- `GET /ai-messages/chat/<chat_id>/model/<model_name>` — Mensagens de IA por chat/modelo
- `PUT /ai-messages/<id>` — Atualiza mensagem de IA
- `DELETE /ai-messages/<id>` — Remove mensagem de IA

## Permissões
- Usuários só podem acessar/alterar seus próprios dados, exceto admins.
- Admins podem acessar todos os dados.
- Todas as rotas de escrita exigem autenticação.

## Integração com IA
- O backend integra-se ao Ollama para geração de respostas automáticas.
- O endpoint `/ai-messages/` recebe `user_id`, `chat_id` e `model` e retorna uma resposta gerada pela IA.

## Exemplo de Fluxo para o Frontend
1. **Login:**
   ```http
   POST /login
   { "email": "user@email.com", "password": "senha" }
   ```
   → Recebe token JWT
2. **Criar chat:**
   ```http
   POST /chats/
   Header: Authorization: Bearer <token>
   { "name": "Meu chat" }
   ```
3. **Enviar mensagem:**
   ```http
   POST /messages/
   Header: Authorization: Bearer <token>
   { "chat_id": 1, "content": "Olá!" }
   ```
4. **Gerar resposta IA:**
   ```http
   POST /ai-messages/
   Header: Authorization: Bearer <token>
   { "user_id": 1, "chat_id": 1, "model": "nome-do-modelo" }
   ```

## Observações
- O banco padrão é SQLite, mas pode ser adaptado para outros bancos.
- Todas as respostas são em JSON.
- O backend está pronto para ser consumido por qualquer frontend moderno (React, Vue, Angular, etc).
- Para dúvidas sobre campos, consulte os modelos em `/models/`.

## Dependências
- Flask, Flask-SQLAlchemy, Flask-Migrate, Flask-CORS, PyJWT, Ollama

## Inicialização
```bash
pip install -r requirements.txt
python app.py
```

# Recursos Futuros
Alguns dos recursos de futura integração ao sistema

- **Resposta Positiva** e **Resposta Negativa** referente a uma mensagem gerada pelo modelo
- Refino do modelo, e uso da **legislação** como parte do prompt
- Rotas de **análize dos dados** coletados

---
Esta documentação foi gerada com Inteligência Artificial, sendo sua unica função servir como apoio ao Front-End do projeto.
