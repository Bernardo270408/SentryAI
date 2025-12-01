# Endpoints da API
Ao rodar o backend, uma API ficará disponível em http://localhost:5000/ (ou em outra rota determinada, caso altere manualmente).

> Para voltar para o readme, acesse [este link](../readme.md).

Dicas:
- Todas as rotas protegidas exigem o header: `Authorization: Bearer <token>`.
- O token é obtido via POST `/login` (leia o documento).
- Todas as respostas negativas seguirão com um código HTTP e uma descrição do problema na key `error`. Em caso de `HTTP 500`, por favor abra uma issue para nos informar.

## Índice
- [Análise de Contratos](#análise-de-contratos)
- [Dashboard](#dashboard)
- [Autenticação](#autenticação)
- [Usuários](#usuários)
- [Chats](#chats)
- [Mensagens de Usuário](#mensagens-de-usuário)
- [Mensagens de IA](#mensagens-de-ia)
- [Avaliações](#avaliações)


## Autenticação
- `POST /login` — Autentica usuário, retorna token JWT
  - Corpo da Requisição:
    ```js
    {
    "email": "example@email.com",   // Obrigatorio
    "password": "password"          // Obrigatório
    }
    ```
  - Resposta Esperada:
    ```js
    {
    "token" : "token-jwt",
    "user" : {
        "id": 1, 
        "name": "username1", 
        "email": "email1@example.com",
        "extra_data": "Informações extras"
    }
    }
    ```
    

## Usuários
Rotas relacionadas ao CRUD do usuário.
- `POST /users/` — Cria usuário
    - Corpo da Requisição
    ```js
    {
        "name":"username",              // Obrigatório
        "email":"email",                // Obrigatório
        "password":"password",          // Obrigatório
        "extra_data":"Meu nome é [...]" // Opcional
    }
    ```
    - Resposta Esperada
    ```js
    {
        "user" : {
            "id": 1, 
            "name": "username1", 
            "email": "email1@example.com",
            "extra_data": "Informações extras"
        }
    }
    ```
- `GET /users/` — Lista todos os usuários
    - Resposta Padrão
    ```js
    [
        {
            "id": 1, 
            "name": "username1", 
            "email": "email1@example.com",
            "extra_data": "Informações extras"
        },
        {
            "id": 2, 
            "name": "username2", 
            "email": "email2@example.com",
            "extra_data": "Outro dado extra"
        }
    ]
    ```

- `GET /users/<id>` — Busca usuário por ID
    - Resposta Padrão
    ```js
    {
        "id": 1, 
        "name": "username1", 
        "email": "email1@example.com",
        "extra_data": "Informações extras"
    }
    ```


- `PUT /users/<id>` — Atualiza usuário (autenticado)
    - Corpo da Requisição
    ```js
    {
        "name":"username",
        "email":"email",
        "password":"password",
        "extra_data":"Meu nome é [...]"
    }
    ```
    - Resposta Esperada
    ```js
    {
        "id": 1, 
        "name": "username1", 
        "email": "email1@example.com",
        "extra_data": "Informações extras"
    }
    ```
- `DELETE /users/<id>` — Remove usuário (autenticado)
    - Resposta esperada
    ```js
    {
        "message": "Usuário deletado com sucesso."
    }
    ```

## Chats
- `POST /chats/` — Cria chat (autenticado)
    - Corpo da Requisição
    ```js
    {
        "user_id": 1,                   // Obrigatório
        "name": "Nome do Chat"          // Obrigatório
    }
    ```
    - Resposta Esperada
    ```js
    {
        "id": 1,
        "user_id": 1,
        "name": "Nome do Chat",
        "rating_id": null,
        "created_at": "2024-01-01T00:00:00"
    }
    ```
- `GET /chats/` — Lista todos os chats (admin only)
    - Resposta Padrão
    ```js
    [
        {
            "id": 1,
            "user_id": 1,
            "name": "Nome do Chat",
            "rating_id": 1,
            "created_at": "2024-01-01T00:00:00"
        },
        {
            "id": 2,
            "user_id": 2,
            "name": "Outro Chat",
            "rating_id": 1,
            "created_at": "2024-01-02T00:00:00"
        }
    ]
    ```
- `GET /chats/<id>` — Busca chat por ID (autenticado)
    - Resposta Padrão
    ```js
    {
        "id": 1,
        "user_id": 1,
        "name": "Nome do Chat",
        "rating_id": 1,
        "created_at": "2024-01-01T00:00:00"
    }
    ```
- `GET /chats/user/<user_id>` — Chats de um usuário
    - Resposta Padrão
    ```js
    [
        {
            "id": 1,
            "user_id": 1,
            "name": "Nome do Chat",
            "rating_id": 1,
            "created_at": "2024-01-01T00:00:00"
        },
        {
            "id": 3,
            "user_id": 1,
            "name": "Outro Chat do Mesmo Usuário",
            "rating_id": 1,
            "created_at": "2024-01-03T00:00:00"
            "updated_at": "2024-01-02T00:00:00"

        }
    ]
    ```
- `GET /chats/<id>/rating`  — Avaliação de um chat
    - Resposta Padrão
    ```js
    {
        "id": 1,
        "user_id": 1,
        "score": 5,
        "feedback": "Ótimo chat!"
    }
    ```
- `PUT /chats/<id>` — Atualiza chat
    - Corpo da Requisição
    ```js
    {
        "name": "Nome do Chat"
    }
    ```
    - Resposta Esperada
    ```js
    {
        "id": 1,
        "user_id": 1,
        "name": "Nome do Chat",
        "rating_id": null,
        "created_at": "2024-01-01T00:00:00"
    }
    ```},{find:
- `DELETE /chats/<id>` — Remove chat (autenticado)
    - Resposta Esperada
    ```js
    {
        "message": "Chat deletado com sucesso."
    }
    ```

## Mensagens de Usuário
- `POST /messages/` — Cria mensagem de usuário
    - Corpo da Requisição:
    ```js
    {
        "user_id": 1,           // Obrigatório
        "chat_id": 1,           // Obrigatório
        "content": "Texto da mensagem" // Obrigatório
    }
    ```
    - Resposta Esperada:
    ```js
    {
        "id": 1,
        "user_id": 1,
        "chat_id": 1,
        "content": "Texto da mensagem",
        "created_at": "2024-01-01T00:00:00"
    }
    ```

- `GET /messages/` — Lista todas as mensagens (admin)

    - Resposta Padrão:
    ```js
    [
        {
            "id": 1,
            "user_id": 1,
            "chat_id": 1,
            "content": "Texto da mensagem",
            "created_at": "2024-01-01T00:00:00"
        },
        {
            "id": 2,
            "user_id": 2,
            "chat_id": 2,
            "content": "Outra mensagem",
            "created_at": "2024-01-02T00:00:00"
        }
    ]
    ```

- `GET /messages/<id>` — Busca mensagem por ID
    - Resposta Padrão:
    ```js
    {
        "id": 1,
        "user_id": 1,
        "chat_id": 1,
        "content": "Texto da mensagem",
        "created_at": "2024-01-01T00:00:00"
    }
    ```

- `GET /messages/user/<user_id>` — Mensagens de um usuário
    - Resposta Padrão:
    ```js
    [
        {
            "id": 1,
            "user_id": 1,
            "chat_id": 1,
            "content": "Texto da mensagem",
            "created_at": "2024-01-01T00:00:00"
        },
        {
            "id": 3,
            "user_id": 1,
            "chat_id": 2,
            "content": "Outra mensagem do mesmo usuário",
            "created_at": "2024-01-03T00:00:00"
        }
    ]
    ```

- `GET /messages/chat/<chat_id>` — Mensagens de um chat
    - Resposta Padrão:
    ```js
    [
        {
            "id": 1,
            "user_id": 1,
            "chat_id": 1,
            "content": "Texto da mensagem",
            "created_at": "2024-01-01T00:00:00"
        },
        {
            "id": 4,
            "user_id": 2,
            "chat_id": 1,
            "content": "Outra mensagem no mesmo chat",
            "created_at": "2024-01-04T00:00:00"
        }
    ]
    ```

- `PUT /messages/<id>` — Atualiza mensagem
    - Corpo da Requisição:
    ```js
    {
        "content": "Texto atualizado da mensagem" // Obrigatório
    }
    ```
    - Resposta Esperada:
    ```js
    {
        "id": 1,
        "user_id": 1,
        "chat_id": 1,
        "content": "Texto atualizado da mensagem",
        "created_at": "2024-01-01T00:00:00",
        "updated_at": "2024-01-02T00:00:00"
    }
    ```

- `DELETE /messages/<id>` — Remove mensagem
    - Resposta Esperada:
    ```js
    {
        "message": "Message deleted"
    }
    ```

## Mensagens de IA
- `POST /ai-messages/` — Gera e armazena resposta da IA
    - Corpo da Requisição:
    ```js
    {
        "user_id": 1,           // Obrigatório
        "chat_id": 1,           // Obrigatório
        "model": "gpt-3.5-turbo" // Obrigatório
    }
    ```
    - Resposta Esperada:
    ```js
    {
        "id": 1,
        "chat_id": 1,
        "content": "Resposta gerada pela IA",
        "created_at": "2024-01-01T00:00:00",
        "model": "gpt-3.5-turbo"
    }
    ```

- `GET /ai-messages/` — Lista todas as mensagens de IA (admin)
    - Resposta Esperada:
    ```js
    [
        {
            "id": 1,
            "chat_id": 1,
            "content": "Resposta gerada pela IA",
            "created_at": "2024-01-01T00:00:00",
            "model": "gpt-3.5-turbo"
        },
        {
            "id": 2,
            "chat_id": 2,
            "content": "Outra resposta gerada pela IA",
            "created_at": "2024-01-02T00:00:00",
            "model": "gpt-4"
        }
    ]
    ```
- `GET /ai-messages/<id>` — Busca mensagem de IA por ID
    - Resposta Padrão:
    ```js
    {
        "id": 1,
        "chat_id": 1,
        "content": "Resposta gerada pela IA",
        "created_at": "2024-01-01T00:00:00",
        "model": "gpt-3.5-turbo"
    }
    ```

- `GET /ai-messages/chat/<chat_id>` — Mensagens de IA de um chat
    - Resposta Padrão:
    ```js
    [
        {
            "id": 1,
            "chat_id": 1,
            "content": "Primeira resposta gerada pela IA",
            "created_at": "2024-01-01T00:00:00",
            "model": "gpt-3.5-turbo"
        },
        {
            "id": 2,
            "chat_id": 1,
            "content": "Segunda resposta gerada pela IA",
            "created_at": "2024-01-02T00:00:00",
            "model": "gpt-4"
        }
    ]
    ```

- `GET /ai-messages/model/<model_name>` — Mensagens por modelo
    - Resposta Padrão:
    ```js
    [
        {
            "id": 1,
            "chat_id": 1,
            "content": "Resposta gerada pela IA",
            "created_at": "2024-01-01T00:00:00",
            "model": "gpt-3.5-turbo"
        },
        {
            "id": 3,
            "chat_id": 2,
            "content": "Outra resposta gerada pela IA",
            "created_at": "2024-01-03T00:00:00",
            "model": "gpt-3.5-turbo"
        }
    ]
    ```

- `GET /ai-messages/chat/<chat_id>/model/<model_name>` — Mensagens de IA por chat/modelo
    - Resposta Padrão:
    ```js
    [
        {
            "id": 1,
            "chat_id": 1,
            "content": "Resposta gerada pela IA",
            "created_at": "2024-01-01T00:00:00",
            "model": "gpt-3.5-turbo"
        }
    ]
    ```

- `PUT /ai-messages/<id>` — Atualiza mensagem de IA
    - Corpo da Requisição:
    ```js
    {
        "content": "Texto atualizado da resposta da IA" // Obrigatório
    }
    ```
    - Resposta Esperada:
    ```js
    {
        "id": 1,
        "chat_id": 1,
        "content": "Texto atualizado da resposta da IA",
        "created_at": "2024-01-01T00:00:00",
        "updated_at": "2024-01-02T00:00:00",
        "model": "gpt-3.5-turbo"
    }
    ```

- `DELETE /ai-messages/<id>` — Remove mensagem de IA
    - Resposta Esperada:
    ```js
    {
        "message": "AI Message deleted"
    }
    ```

## Análise de Contratos
Rotas para análise de documentos e interação com a IA sobre o contexto.

- `POST /contract/analyze` — Envia um texto ou arquivo para análise estruturada pela IA. (autenticado)
    - Corpo da Requisição (multipart/form-data ou application/json):
    ```js
    // Exemplo com texto
    {
        "user_id": 1,                                   // Obrigatório
        "text": "Conteúdo do contrato para análise..."  // Opcional se arquivo for enviado
    }
    ```
    Caso envie um arquivo, os formatos suportados são:
    `.txt`, `.md`, `.csv`, `.pdf`, `.rtf`, `.doc`, `.docx`, `.odt`, `.pptx`, `.xlsx`, `.html`, `.xml`, `.json`, `.yaml` e `.yml`

    - Resposta Esperada (JSON estruturado pela IA):
    ```js
    {
        "id":1,
        "user_id":1,
        "json": {
            "summary": "Resumo de 2 parágrafos.",
            "risk": { "score": 0, "label": "Baixo" },
            "highlights": [ { "tag": "Tipo", "snippet": "Trecho", "lineNumber": 1 } ]
        },
        "created_at": "2024-01-01T00:00:00",
        "updated_at": "2024-01-02T00:00:00"
    }
    ```

- `GET /contract/` — Lista todas as análises de contratos. (autenticado)
    - Resposta Esperada:
    ```js
    [
        {
            "id":1,
            "user_id":1,
            "json": {
                "summary": "Resumo de 2 parágrafos.",
                "risk": { "score": 0, "label": "Baixo" },
                "highlights": [ { "tag": "Tipo", "snippet": "Trecho", "lineNumber": 1 } ]
            },
            "created_at": "2024-01-01T00:00:00",
            "updated_at": "2024-01-02T00:00:00"
        },
        {
            "id":2,
            "user_id":2,
            "json": {
                "summary": "Resumo de 3 parágrafos.",
                "risk": { "score": 2, "label": "Médio" },
                "highlights": [ { "tag": "Tipo", "snippet": "Trecho", "lineNumber": 5 } ]
            },
            "created_at": "2024-01-03T00:00:00",
            "updated_at": "2024-01-04T00:00:00"
        }
    ]
    ```

- `GET /contract/<contract_id>` — Busca análise de contrato por ID. (autenticado)
    - Resposta Esperada:
    ```js
    {
        "id":1,
        "user_id":1,
        "text": "Conteúdo do contrato para análise...",
        "json": {
            "summary": "Resumo de 2 parágrafos.",
            "risk": { "score": 0, "label": "Baixo" },
            "highlights": [ { "tag": "Tipo", "snippet": "Trecho", "lineNumber": 1 } ]
        },
        "created_at": "2024-01-01T00:00:00",
        "updated_at": "2024-01-02T00:00:00"
    }
    ```

- `GET /contract/user/<user_id>` — Análises de um usuário. (autenticado)
    - Resposta Esperada:
    ```js
    [
        {
            "id":1,
            "user_id":1,
            "text": "Conteúdo do contrato para análise...",
            "json": {
                "summary": "Resumo de 2 parágrafos.",
                "risk": { "score": 0, "label": "Baixo" },
                "highlights": [ { "tag": "Tipo", "snippet": "Trecho", "lineNumber": 1 } ]
            },
            "created_at": "2024-01-01T00:00:00",
            "updated_at": "2024-01-02T00:00:00"
        },
        {
            "id":2,
            "user_id":1,
            "text": "Conteúdo do contrato para análise...",
            "json": {
                "summary": "Resumo de 3 parágrafos.",
                "risk": { "score": 2, "label": "Médio" },
                "highlights": [ { "tag": "Tipo", "snippet": "Trecho", "lineNumber": 5 } ]
            },
            "created_at": "2024-01-03T00:00:00",
            "updated_at": "2024-01-04T00:00:00"
        }
    ]
    ```

- `PUT /contract/<contract_id>` — Atualiza análise de contrato. (autenticado)
    Perigosa. acessível apenas para administradores.
    - Corpo da Requisição:
    ```js
    {
        "json": {
            "summary": "Resumo atualizado.",
            "text": "Conteúdo do contrato atualizado...",
            "risk": { "score": 1, "label": "Baixo" },
            "highlights": [ { "tag": "Tipo", "snippet": "Trecho atualizado", "lineNumber": 2 } ]
        }
    }
    ```
    - Resposta Esperada:
    ```js
    {
        "id":1,
        "user_id":1,
        "json": {
            "summary": "Resumo atualizado.",
            "risk": { "score": 1, "label": "Baixo" },
            "highlights": [ { "tag": "Tipo", "snippet": "Trecho atualizado", "lineNumber": 2 } ]
        },
        "text": "Conteúdo do contrato atualizado...",
        "created_at": "2024-01-01T00:00:00",
        "updated_at": "2024-01-05T00:00:00"
    }
    ```


- `POST /contract/chat` — Permite conversar com a IA sobre o contexto da análise de contrato. (autenticado)
    - Corpo da Requisição:
    ```js
    {
        "message": "Qual o risco da cláusula 5?",
        "context": "Resumo da análise anterior (opcional, mas recomendado)"
    }
    ```
    - Resposta Esperada:
    ```js
    {
        "reply": "A cláusula 5 apresenta um risco de..."
    }
    ```

## Dashboard
Rotas para obter estatísticas e insights do usuário.

- `GET /dashboard/stats` — Retorna estatísticas chave, dados para gráficos e insights da IA. (autenticado)
    - Resposta Esperada:
    ```js
    {
        "kpis": {
            "active_cases": 5,
            "docs_analyzed": 12,
            "risks_avoided": 3,
            "next_deadline": "N/A"
        },
        "chart_data": [
            {"name": "25/11", "consultas": 2, "analises": 0},
            // ... dados dos últimos 7 dias
        ],
        "history": [
            {"id": 10, "action": "Revisão de Contrato", "date": "29/11 14:30", "status": "Ativo"}
        ],
        "insight": {
            "type": "success",
            "text": "Com base em sua última interação, lembre-se de verificar a validade das assinaturas digitais."
        }
    }
    ```

## Avaliações
- `POST /ratings/` — Cria uma avaliação para um chat
    - Corpo da Requisição:
    ```js
    {
        "user_id": 1,           // Obrigatório
        "chat_id": 1,           // Obrigatório
        "score": 5,             // Obrigatório
        "feedback": "Ótimo chat!" // Opcional
    }
    ```
    - Resposta Esperada:
    ```js
    {
        "id": 1,
        "user_id": 1,
        "chat_id": 1,
        "score": 5,
        "feedback": "Ótimo chat!",
        "created_at": "2024-01-01T00:00:00"
    }
    ```

- `GET /ratings/` — Lista todas as avaliações (admin)
    - Resposta Padrão:
    ```js
    [
        {
            "id": 1,
            "user_id": 1,
            "chat_id": 1,
            "score": 5,
            "feedback": "Ótimo chat!",
            "created_at": "2024-01-01T00:00:00"
        },
        {
            "id": 2,
            "user_id": 2,
            "chat_id": 2,
            "score": 4,
            "feedback": "Bom, mas pode melhorar.",
            "created_at": "2024-01-02T00:00:00"
        }
    ]
    ```

- `GET /ratings/<id>` — Busca avaliação por ID
    - Resposta Padrão:
    ```js
    {
        "id": 1,
        "user_id": 1,
        "chat_id": 1,
        "score": 5,
        "feedback": "Ótimo chat!",
        "created_at": "2024-01-01T00:00:00"
    }
    ```

- `GET /ratings/user/<user_id>` — Avaliações de um usuário
    - Resposta Padrão:
    ```js
    [
        {
            "id": 1,
            "user_id": 1,
            "chat_id": 1,
            "score": 5,
            "feedback": "Ótimo chat!",
            "created_at": "2024-01-01T00:00:00"
        },
        {
            "id": 3,
            "user_id": 1,
            "chat_id": 3,
            "score": 3,
            "feedback": "Regular.",
            "created_at": "2024-01-03T00:00:00"
        }
    ]
    ```

- `GET /ratings/chat/<chat_id>` — Avaliação de um chat
    - Resposta Padrão:
    ```js
    {
        "id": 1,
        "user_id": 1,
        "chat_id": 1,
        "score": 5,
        "feedback": "Ótimo chat!",
        "created_at": "2024-01-01T00:00:00"
    }
    ```

- `GET /ratings/score/<int:score>` — Avaliações com um score específico
    - Resposta Padrão:
    ```js
    [
        {
            "id": 2,
            "user_id": 2,
            "chat_id": 2,
            "score": 4,
            "feedback": "Bom, mas pode melhorar.",
            "created_at": "2024-01-02T00:00:00"
        }
    ]
    ```

- `GET /ratings/with_feedback` — Chats avaliados
    - Resposta Padrão:
    ```js
    [
        {
            "id": 1,
            "user_id": 1,
            "chat_id": 1,
            "score": 5,
            "feedback": "Ótimo chat!",
            "created_at": "2024-01-01T00:00:00"
        },
        {
            "id": 2,
            "user_id": 2,
            "chat_id": 2,
            "score": 4,
            "feedback": "Bom, mas pode melhorar.",
            "created_at": "2024-01-02T00:00:00"
        }
    ]
    ```

- `PUT /ratings/<id>` — Atualiza a avaliação
    - Corpo da Requisição:
    ```js
    {
        "score": 4,             // Opcional
        "feedback": "Atualizado." // Opcional
    }
    ```
    - Resposta Esperada:
    ```js
    {
        "id": 1,
        "user_id": 1,
        "chat_id": 1,
        "score": 4,
        "feedback": "Atualizado.",
        "created_at": "2024-01-01T00:00:00",
        "updated_at": "2024-01-02T00:00:00"
    }
    ```

- `DELETE /ratings/<id>` — Remove a avaliação
    - Resposta Esperada:
    ```js
    {
        "message": "Rating deletado com sucesso."
    }
    ```