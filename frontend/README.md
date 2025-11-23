# Juridica — Frontend (React + Vite)

Projeto frontend gerado pelo assistente. Tema escuro, visual sério/moderno para plataforma jurídica social.

## Como usar

1. Copie `.env.example` para `.env` e ajuste `VITE_API_URL` para seu backend, por exemplo `http://localhost:5000`.
2. Instale dependências:
   ```bash
   npm install
   ```
3. Rode em desenvolvimento:
   ```bash
   npm run dev
   ```
4. Build:
   ```bash
   npm run build
   ```

## Endpoints esperados (conforme backend fornecido)
- POST /login -> { token, user }
- POST /users
- GET /chats/user/:user_id
- POST /chats (body { name })
- GET /messages/chat/:chat_id
- POST /messages (body { user_id, chat_id, content })
- GET /ai-messages/chat/:chat_id
- POST /ai-messages (body { user_id, chat_id, model })
