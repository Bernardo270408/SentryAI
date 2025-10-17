# SentryAI

SentryAI é uma aplicação em desenvolvimento voltada ao gerenciamento de modelos de IA, específicamente ao caráter jurídico brasileiro.
Atualmente estamos sem um front-end decente, então caso queira contribuir, agradeceriamos imensamente.

## Índice

- [Introdução](#introdução)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Instalação](#instalação)
  - [Pré Requisitos](#pré-requisitos)
  - [Passo a passo](#passo-a-passo)
  - [Configurando a CLI](#configurando-a-cli)
- [Rodando o Projeto](#rodando-o-projeto)
  - [Inicializando a API](#inicializando-api)
  - [Inicializando a CLI](#inicializando-a-cli)
- [Estrutura](#estrutura)
- [Endpoints da API](#endpoints)
- [Comandos da CLI](#comandos)


## Introdução
O SentryAI, como dito antes, é uma aplicação em desenvolvimento, que visa coletar dados para uma pesquisa cujo objetivo é identificar falhas comuns no entendimento da lei, e fornecer auxílio para pessoas com tais dúvidas

## Tecnologias Utilizadas
- **Ollama** - Serviço de IA
- **Flask** - Framework web para Python.
- **Flask-Migrate** - Para migrações de banco de dados.
- **SQLAlchemy** - ORM para interação com o banco de dados.
- **JWT** - Tokens e Autenticação

## Instalação

### Pré-Requisitos
Antes de rodar o projeto, certifique-se de ter o Python 3.x e o pip instalados.
- [python3.x](#https://www.python.org/)
- [pip](#https://pip.pypa.io/en/stable/)

### Passo a Passo

1. Clone este repositório:
```bash
git clone https://github.com/Bernardo270408/SentryAI
cd nome-do-repositorio
```

2. Crie um ambiente virtual
```bash
cd Backend
python3 -m venv venv
```
- Linux/MacOS
  ```bash
  source venv/bin/activate
  ```

- Windows
  ```bash
  ./venv\Scripts\activate
  ```

3. Instale as dependencias do Backend
```bash
pip install -r requirements.txt
```

4. Crie outro ambiente virtual para a CLI
```bash
cd ../CLI
python3 -m venv venv
```
- Linux/MacOS
  ```bash
  source venv/bin/activate
  ```

- Windows
  ```bash
  ./venv\Scripts\activate
  ```

5. Instale as dependencias da CLI
```bash
pip install -r requirements.txt
```
**Obs:** O inicializador é pre-compilado para Linux e Windows, mas caso seja necessário, o código fonte `sentry.c` está na mesma pasta, e pode ser compilado para o OS desejado.

É recomendado adicionar o executável da CLI ao PATH de seu sistema.

### Configurando a CLI
configure os valores padrão `domain` e `port`, que servirão para dizer à CLI onde exatamente está hospedada a API.
Estes são os valores padrão:
```bash
sentry run
sentry defaults -set key="domain" value="127.0.0.1"
sentry defaults -set key="port" value="5000"
sentry quit
```




## Rodando o Projeto

### Inicializando a API
Para iniciar a API, caso esteja em um ambiente de testes, rode
```bash
cd Backend
flask run --debug
```
Em outros casos, recomenda-se o uso de **gunicorn**


### Inicializando a CLI

Para iniciar a CLI, simplesmente digite
```bash
sentry run
```

Caso não tenha sido incluida ao path, o comando será
```bash
./sentry run
```

###


## Estrutura do Projeto
```
Backend/                    #
  app.py                    # Inicialização da aplicação Flask
  config.py                 # Configurações (DB, secret key)
  requirements.txt          # Dependências
  extensions.py             # Extensões Flask (SQLAlchemy)
  DAO/                      # Data Access Objects (CRUD)
    user_dao.py             # Usuários
    chat_dao.py             # Chats
    message_user_dao.py     # Mensagens de usuário
    message_ai_dao.py       # Mensagens de IA
  models/                   # Modelos ORM
    user.py                 # Usuário
    chat.py                 # Chat
    message_user.py         # Mensagem de usuário
    message_ai.py           # Mensagem de IA
  router/                   # Rotas Flask (API REST)
    auth_router.py          # Autenticação (login)
    user_router.py          # Usuários
    chat_router.py          # Chats
    message_user_router.py  # Mensagens de usuário
    message_ai_router.py    # Mensagens de IA
  middleware/               #
    jwt_util.py             # Autenticação JWT
  ```markdown
  # SentryAI

  SentryAI é uma aplicação em desenvolvimento voltada ao gerenciamento de modelos de IA, com foco em históricos de conversas e integração com modelos locais (ex: Ollama).

  > Nota sobre o último commit: o projeto recebeu um sistema de Ratings completo (modelo, DAO, rotas e CLI). Também foi removido o armazenamento direto de rating/feedback dentro de `AIMessage` (agora há a tabela `ratings`). A documentação abaixo foi atualizada para refletir essas mudanças.

  ## Índice

  - [Introdução](#introdução)
  - [Tecnologias Utilizadas](#tecnologias-utilizadas)
  - [Instalação](#instalação)
    - [Pré Requisitos](#pré-requisitos)
    - [Passo a passo](#passo-a-passo)
    - [Configurando a CLI](#configurando-a-cli)
  - [Rodando o Projeto](#rodando-o-projeto)
    - [Inicializando a API](#inicializando-api)
    - [Inicializando a CLI](#inicializando-a-cli)
  - [Estrutura do Projeto](#estrutura-do-projeto)
  - [Principais Endpoints](#principais-endpoints)
  - [Modelo do Banco de Dados](#modelo-do-banco-de-dados)
  - [Comandos da CLI](#comandos-da-cli)


  ## Introdução
  SentryAI é uma API backend em Flask com SQLAlchemy para gerenciar usuários, chats, mensagens de usuário e respostas geradas por IA, além de um sistema de ratings que permite os usuários avaliarem chats ou mensagens.

  ## Tecnologias Utilizadas
  - Ollama (ou outro provedor local/externo) para geração de respostas de IA
  - Flask
  - Flask-Migrate
  - Flask-CORS
  - SQLAlchemy
  - PyJWT (JWT para autenticação)

  ## Instalação

  ### Pré-Requisitos
  - Python 3.8+
  - pip

  ### Passo a Passo
  1. Clone o repositório e abra a pasta Backend:

  ```bash
  git clone https://github.com/Bernardo270408/SentryAI
  cd SentryAI/Backend
  ```

  2. Crie e ative um virtualenv (Windows - PowerShell):

  ```powershell
  python -m venv venv
  .\venv\Scripts\Activate.ps1
  ```

  3. Instale dependências:

  ```powershell
  pip install -r requirements.txt
  ```

  4. Se for usar a CLI, crie/ative outro virtualenv dentro da pasta `CLI` e instale dependências nela também (opcional).

  ### Configurando a CLI
  Defina `domain` e `port` usando os defaults da CLI (ou passe explicitamente nos comandos). Exemplos:

  ```bash
  sentry defaults -set key="domain" value="127.0.0.1"
  sentry defaults -set key="port" value="5000"
  ```


  ## Rodando o Projeto

  ### Inicializando a API
  Na pasta `Backend`:

  ```powershell
  flask run --debug
  ```

  ou com Python diretamente:

  ```powershell
  python app.py
  ```

  ### Inicializando a CLI
  Na pasta `CLI` (ou rodando o executável `sentry` se estiver disponível):

  ```powershell
  sentry run
  ```


  ## Estrutura do Projeto
  ```
  Backend/
    app.py
    config.py
    requirements.txt
    extensions.py
    DAO/
      user_dao.py
      chat_dao.py
      message_user_dao.py
      message_ai_dao.py
      rating_dao.py        # CRUD para Ratings (novo)
    models/
      user.py
      chat.py
      message_user.py
      message_ai.py
      rating.py            # Modelo Rating (novo)
    router/
      auth_router.py
      user_router.py
      chat_router.py
      message_user_router.py
      message_ai_router.py
      rating_router.py     # Rotas para Ratings (novo)
    middleware/
      jwt_util.py
  CLI/
    commands/
      ... (comandos incluindo rating_commands)
  ```


  ## Principais Endpoints
  Observações gerais:
  - Todas as rotas protegidas exigem o header: `Authorization: Bearer <token>`
  - O token é obtido via `POST /login`

  ### Autenticação
  - `POST /login` — Autentica usuário, retorna token JWT
    - Body: `{ "email": "...", "password": "..." }`
    - Resposta: `{ "token": "...", "user": {...} }`

  ### Usuários
  - `POST /users/` — Cria usuário
  - `GET /users/` — Lista todos os usuários
  - `GET /users/<id>` — Busca usuário por ID
  - `GET /users/email/<email>` — Busca usuário por email
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

  > Nota: endpoints de rating/feedback que existiam dentro de `message_ai_router.py` foram removidos do escopo de `AIMessage` — agora existe uma tabela/rotas específicas para `ratings`.

  ### Ratings (novo)
  O projeto agora possui uma entidade `Rating` para registrar avaliações vinculadas a users/chats.

  - `POST /ratings/` — Cria um rating
    - Body: `{ "user_id": <id>, "chat_id": <id>, "score": <int>, "feedback": "texto" }`
    - `score` é esperado como inteiro (ex.: 1-5)

  - `GET /ratings/` — Lista todos os ratings (admin)
  - `GET /ratings/<id>` — Busca rating por ID (dono ou admin)
  - `GET /ratings/user/<user_id>` — Ratings de um usuário (dono ou admin)
  - `GET /ratings/chat/<chat_id>` — Ratings de um chat (admin ou policy)
  - `GET /ratings/score/<score>` — (disponível via DAO) listar por score — pode estar exposto via rota dependendo das necessidades
  - `GET /ratings/feedback` — (disponível via DAO) listar ratings com feedback — pode ser exposto via rota
  - `PUT /ratings/<id>` — Atualiza rating (dono ou admin)
  - `DELETE /ratings/<id>` — Remove rating (dono ou admin)


  ## Modelo do Banco de Dados (atualizado)

  Foi adicionada a tabela `ratings`:

  #### Rating
  | Coluna   | Tipo    | PK | FK               | Not Null | Descrição               |
  |----------|---------|----|------------------|----------|-------------------------|
  | id       | Integer | X  |                  | X        | Identificador do rating |
  | user_id  | Integer |    | users.id (FK)    | X        | Usuário que avaliou     |
  | chat_id  | Integer |    | chats.id (FK)    | X        | Chat avaliado           |
  | score    | Integer |    |                  | X        | Nota (ex: 1-5)          |
  | feedback | String  |    |                  |          | Texto opcional          |

  Relacionamentos: `Rating.user` -> `User`, `Rating.chat` -> `Chat`.


  ## Comandos da CLI (atualizado)

  Os comandos da CLI para `rating` foram adicionados. Formato:

  ```bash
  sentry rating -<subcomando> [args]=[value]
  ```

  Subcomandos disponíveis (arquivo: `CLI/commands/rating_commands.py`):

  | Subcomando   | Ação                                    | Campos obrigatórios              |
  |--------------|-----------------------------------------|----------------------------------|
  | `-create`    | Cria um rating                          | `user_id`, `chat_id`, `score`    |
  | `-get`       | Busca rating por id                     | `rating_id`, `token`             |
  | `-getall`    | Lista todos os ratings (admin)          | `token`                          |
  | `-getbyuser` | Lista ratings de um usuário            | `user_id`, `token`               |
  | `-getbychat` | Lista ratings de um chat               | `chat_id`, `token`               |
  | `-update`    | Atualiza um rating                      | `rating_id`, `token`             |
  | `-delete`    | Remove um rating                        | `rating_id`, `token`             |

  Exemplo rápido (PowerShell):

  ```powershell
  # criar
  sentry rating -create user_id=1 chat_id=2 score=5 feedback='Muito útil'

  # listar por usuário
  sentry rating -getbyuser user_id=1 token='SEU_TOKEN'

  # deletar
  sentry rating -delete rating_id=3 token='SEU_TOKEN'
  ```


  ## Observações e migrações
  - Se você já tem um banco de dados existente, será preciso gerar a migração para a nova tabela `ratings` e aplicá-la:

  ```bash
  cd Backend
  flask db migrate -m "add ratings table"
  flask db upgrade
  ```

  - Como o campo `rating` e `feedback` foram removidos de `AIMessage`, verifique suas migrações e dados históricos caso precise migrar avaliações antigas para a nova tabela.


  ## Testes rápidos
  - Inicie a API e use a CLI ou curl/Invoke-WebRequest para testar os endpoints.

  Exemplo curl (Linux/macOS):

  ```bash
  curl -X POST http://localhost:5000/ratings/ \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer SEU_TOKEN" \
    -d '{"user_id":1,"chat_id":2,"score":5,"feedback":"ótimo"}'
  ```

  No PowerShell, prefira `Invoke-RestMethod` / `Invoke-WebRequest` e envie o `-Body` como bytes UTF-8 se houver caracteres acentuados.


  ---

  Se quiser, eu posso também gerar exemplos de payloads para todos os endpoints novos ou criar uma rota extra para listar ratings por score/feedback se desejar expô-las via API.        
* `auto-create-AI-message`: Se `true`, mensagens de usuário geram automaticamente respostas da IA



---
