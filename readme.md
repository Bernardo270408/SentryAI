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
  - [Inicializando a API](#inicializando-a-api)
  - [Inicializando a CLI](#inicializando-a-api)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Endpoints da API](#principais-endpoints)
- [Modelo do Banco de Dados](#modelo-do-banco-de-dados)
- [Comandos da CLI](#comandos-da-cli)


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
    rating_dao.py           # Avaliações
  models/                   # Modelos ORM
    user.py                 # Usuário
    chat.py                 # Chat
    message_user.py         # Mensagem de usuário
    message_ai.py           # Mensagem de IA
    rating.py               # Avaliações
  router/                   # Rotas Flask (API REST)
    auth_router.py          # Autenticação (login)
    user_router.py          # Usuários
    chat_router.py          # Chats
    message_user_router.py  # Mensagens de usuário
    message_ai_router.py    # Mensagens de IA
    rating_router.py        # Avaliações
  middleware/               #
    jwt_util.py             # Autenticação JWT
  migrations/               # Migrações Alembic
  database/app.sqlite       # Banco SQLite
CLI/                        #
  commands/                 # Comandos de gerenciamento
    __init__.py             #
    auth_commands.py        # Autenticação
    chat_commands.py        # Chats
    defaults_commands.py    # Defaults
    help_commands.py        # Ajuda
    message_ai_commands.py  # Mensagens geradas por IA
    message_commands.py     # Mensagens do Usuario
    rating_commands.py      # Avaliações de Chats
    sentry_commands.py      # Comandos extras da CLI
    user_commands.py        # Usuarios
  data/                     # Armazenamento
    defaults_token.txt      # Token JWT
    defaults.json           # Dafaults
  app.py                    # Aplicação CLI
  defaults.py               # Gerencia os defaults
  requirements.txt          # Dependências
  sentry.c                  # Código fonte do inicializador
  sentry.exe                # Inicializador pré-compilado Windows
  sentry                    # Inicializador pré-compilado Linux
  
```



## Principais Endpoints
Esta API tem dezenas de endpoints, estando todos listados a seguir.


Dicas:
- Todas as rotas protegidas exigem o header: `Authorization: Bearer <token>`
- O token é obtido via POST `/login` (ver exemplo abaixo)

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
- `GET /chats/<id>/rating`  — Avaliação de um chat
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

### Avaliações
- `POST /ratings/` — Cria uma avaliação para um chat
- `GET /ratings/` — Lista todas as avaliações (admin)
- `GET /ratings/<id>` — Busca avaliação por ID
- `GET /ratings/user/<user_id>` — Avaliações de um usuário
- `GET /ratings/chat/<chat_id>` — Avaliação de um chat
- `GET /ratings/score/<int:score>` — Avaliações com um score específico
- `GET /ratings/with_feedback` — Chats avaliados
- `PUT /ratings/<id>` — Atualiza a avaliação
- `DELETE /ratings/<id>` — Remove a avaliação

## Modelo do Banco de Dados
O Banco de Dados, atualmente é armazenado em um simples arquivo sql, mas, pode ser alterado para usar um servidor MySQL facilmente.

### Estrutura das Tabelas do Banco de Dados

#### User
| Coluna       | Tipo     | PK | FK | Not Null | Default      | Descrição                        |
|--------------|----------|----|----|----------|--------------|----------------------------------|
| id           | Integer  | X  |    | X        | auto_inc     | Identificador único do usuário   |
| name         | String   |    |    | X        |              | Nome do usuário                  |
| email        | String   |    |    | X        |              | Email do usuário                 |
| password     | String   |    |    | X        |              | Senha (hasheada)                 |
| extra_data   | Text     |    |    |          |              | Dados extras                     |
| is_admin     | Boolean  |    |    |          | False        | Usuário administrador            |

---

#### Chat
| Coluna     | Tipo     | PK | FK | Not Null | Default                | Descrição                      |
|------------|----------|----|----|----------|------------------------|--------------------------------|
| id         | Integer  | X  |    | X        | auto_inc               | Identificador do chat          |
| name       | String   |    |    | X        |                        | Nome do chat                   |
| created_at | DateTime |    |    |          | db.func.now()          | Data de criação                |
| user_id    | Integer  |    | X  | X        |                        | Usuário dono do chat           |
| rating_id  | Integer  |    | X  |          | Null                   | ID da avaliação do chat        |

---

#### MessageUser
| Coluna     | Tipo     | PK | FK | Not Null | Default                | Descrição                      |
|------------|----------|----|----|----------|------------------------|--------------------------------|
| id         | Integer  | X  |    | X        | auto_inc               | Identificador da mensagem      |
| content    | Text     |    |    | X        |                        | Conteúdo da mensagem           |
| created_at | DateTime |    |    |          | db.func.now()          | Data de criação                |
| user_id    | Integer  |    | X  | X        |                        | Usuário autor                  |
| chat_id    | Integer  |    | X  | X        |                        | Chat relacionado               |

---

#### AIMessage
| Coluna           | Tipo     | PK | FK | Not Null | Default       | Descrição                             |
|------------------|----------|----|----|----------|--------------|----------------------------------------|
| id               | Integer  | X  |    | X        | auto_inc     | Identificador da mensagem de IA        |
| content          | Text     |    |    | X        |              | Conteúdo da resposta da IA             |
| created_at       | DateTime |    |    |          | db.func.now()| Data de criação                        |
| model_name       | String   |    |    | X        |              | Nome do modelo utilizado               |
| chat_id          | Integer  |    | X  | X        |              | Chat relacionado                       |
| user_message_id  | Integer  |    | X  |          |              | Mensagem de usuário origem (opcional)  |

---

#### Rating
| Coluna     | Tipo     | PK | FK | Not Null | Default | Descrição                      |
|------------|----------|----|----|----------|---------|--------------------------------|
| id         | Integer  | X  |    | X        | auto_inc| Identificador da avaliação     |
| user_id    | Integer  |    | X  | X        |         | Usuário que avaliou            |
| score      | Integer  |    |    | X        |         | Nota da avaliação (1-5)        |
| feedback   | String   |    |    |          |         | Comentário adicional (opcional)|

---

#### Relacionamentos

| Tabela Origem   | Coluna Origem     | Tabela Destino | Coluna Destino | Tipo de Relacionamento |
|-----------------|-------------------|----------------|----------------|----------------------- |
| chat            | user_id           | user           | id             | N:1                    |
| message_user    | user_id           | user           | id             | N:1                    |
| message_user    | chat_id           | chat           | id             | N:1                    |
| ai_message      | chat_id           | chat           | id             | N:1                    |
| ai_message      | user_message_id   | message_user   | id             | N:1 (opcional)         |
| rating          | chat_id           | chat           | id             | 1:1 (opcional)         |

---

## Comandos Da CLI

### Estrutura Básica
A CLI foi pensada apenas como uma substituta para o ainda não presente front-end, mas reformulada recentemente para realmente ser utilizável e alternativa à interface visual. Esta é a estrutura geral de um comando

```bash
sentry [comando] -[subcomando] [argumentos]=[argumentos]
```

Segue um exemplo de autenticação:

```bash
sentry auth -login email='test@mail' password='1234'
```

retorna o token, o seta como padrão e pergunta se o ID do usuário em questão deverá ser utilizado como padrão para próximas iterações


Dicas:

* Para executar qualquer comando, é necessário que a CLI esteja rodando
* Argumentos omitidos usarão valores default.
* Parâmetros extras serão ignorados (não causam erro).
* Desenvolvedores podem enviar todos os defaults sem risco.

### Comandos e suas funções
Aqui estão listados todos os comandos da CLI, o que requerem e o que retornam. Caso seja necessária uma consulta rápida, recomenda-se a execução do comando `sentry help -all`.

### `auth`

Gerencia a autenticação de usuários.

| Subcomando  | Ação                                                                                                         | Campos Obrigatórios |
| ----------- | ------------------------------------------------------------------------------------------------------------ | ------------------- |
| `-login`    | Loga, gera um token JWT e seta como default. Pergunta se o `user_id` deve ser utilizado como default também. | `email`, `password` |
| `-logout`   | Remove o token atual dos valores default.                                                                    | Nenhum              |
| `-gettoken` | Imprime o token atual salvo nos defaults.                                                                    | Nenhum              |

---

### `chat`

Gerencia os chats utilizados para registrar conversas com o modelo de IA.

| Subcomando   | Ação                                | Campos Obrigatórios |
| ------------ | ----------------------------------- | ------------------- |
| `-create`    | Cria um novo chat.                  | `name`              |
| `-get`       | Retorna um chat específico.         | `chat_id`, `token`  |
| `-getbyuser` | Lista todos os chats de um usuário. | `user_id`, `token`  |
| `-getall`    | Lista todos os chats.               | `token`             |
| `-update`    | Atualiza um chat existente.         | `chat_id`, `token`  |
| `-delete`    | Remove um chat do sistema.          | `chat_id`, `token`  |
| `-open`      | Define um `chat_id` como default.   | `chat_id`           |
| `-quit`      | Remove o `chat_id` default atual.   | Nenhum              |

---

### `user`

Gerencia os usuários cadastrados no sistema.

| Subcomando | Ação                              | Campos Obrigatórios         |
| ---------- | --------------------------------- | --------------------------- |
| `-create`  | Cria um novo usuário.             | `name`, `email`, `password` |
| `-get`     | Busca um usuário por ID.          | `user_id`                   |
| `-getall`  | Lista todos os usuários.          | Nenhum                      |
| `-update`  | Atualiza um usuário existente.    | `user_id`, `token`          |
| `-delete`  | Remove um usuário.                | `user_id`, `token`          |
| `-open`    | Define um `user_id` como default. | `user_id`                   |
| `-quit`    | Remove o `user_id` default atual. | Nenhum                      |

---

### `message`

Gerencia mensagens enviadas por usuários.

| Subcomando   | Ação                                      | Campos Obrigatórios                      |
| ------------ | ----------------------------------------- | ---------------------------------------- |
| `-create`    | Cria uma mensagem de usuário.             | `user_id`, `chat_id`, `content`, `token` |
| `-get`       | Retorna uma mensagem específica.          | `user_message_id`, `token`               |
| `-getall`    | Retorna todas as mensagens do sistema.    | `token`                                  |
| `-getbyuser` | Retorna todas as mensagens de um usuário. | `user_id`, `token`                       |
| `-getbychat` | Retorna todas as mensagens de um chat.    | `chat_id`, `token`                       |
| `-update`    | Atualiza uma mensagem.                    | `user_message_id`, `token`               |
| `-delete`    | Remove uma mensagem.                      | `user_message_id`, `token`               |
| `-open`      | Define um `user_message_id` como default. | `user_message_id`                        |
| `-quit`      | Remove o `user_message_id` default atual. | Nenhum                                   |

---

### `message_ai`

Gerencia mensagens de IA geradas a partir de interações com o usuário.

| Subcomando           | Ação                                                   | Campos Obrigatórios                    |
| -------------------- | ------------------------------------------------------ | -------------------------------------- |
| `-create`            | Gera uma resposta da IA e a salva.                     | `user_id`, `chat_id`, `model`, `token` |
| `-get`               | Retorna uma mensagem da IA específica.                 | `ai_message_id`, `token`               |
| `-getall`            | Retorna todas as mensagens da IA.                      | `token`                                |
| `-getbychat`         | Lista mensagens da IA de um chat.                      | `chat_id`, `token`                     |
| `-getbymodel`        | Lista mensagens geradas por um modelo específico.      | `model_name`, `token`                  |
| `-getbychatandmodel` | Lista mensagens da IA de um chat e modelo específicos. | `chat_id`, `model_name`, `token`       |
| `-update`            | Atualiza uma mensagem da IA.                           | `ai_message_id`, `token`               |
| `-delete`            | Remove uma mensagem da IA.                             | `ai_message_id`, `token`               |
| `-rate`              | Avalia uma mensagem gerada pela IA                     | `ai_message_id`, `rating`, `token`     |
| `-getrating`         | Retorna a avaliação de uma mensagem da IA              | `ai_message_id`, `token`               |
| `-getrated`          | Lista mensagens avaliadas pela IA                      | `token`                                |
| `-feedback`          | Adiciona feedback textual a uma mensagem da IA         | `ai_message_id`, `feedback`, `token`   |
| `-getfeedback`       | Lista feedbacks de uma mensagem da IA                  | `ai_message_id`, `token`               |
| `-open`              | Define um `ai_message_id` como default.                | `ai_message_id`                        |
| `-quit`              | Remove o `ai_message_id` default atual.                | Nenhum                                 |

---

### `rating`

Gerencia as avaliações de chats.

| Subcomando   | Ação                                      | Campos Obrigatórios         |
| ------------ | ----------------------------------------- | --------------------------- |
| `-create`    | Cria uma nova avaliação.                  | `user_id`, `chat_id`, `score`, `token` |
| `-get`       | Retorna uma avaliação específica.         | `rating_id`, `token`        |
| `-getall`    | Retorna todas as avaliações do sistema.   | `token`                     |
| `-getbyuser` | Retorna todas as avaliações de um usuário.| `user_id`, `token`          |
| `-getbychat` | Retorna todas as avaliações de um chat.   | `chat_id`, `token`          |
| `-update`    | Atualiza uma avaliação existente.         | `rating_id`, `token`        |
| `-delete`    | Remove uma avaliação do sistema.          | `rating_id`, `token`        |
| `-open`      | Define um `rating_id` como padrão.        | `rating_id`                 |
| `-quit`      | Remove o `rating_id` padrão atual.        | Nenhum                      |

---

### `default`

Gerencia valores padrão utilizados nas operações da CLI.

| Subcomando  | Ação                                                                 | Campos Obrigatórios |
| ----------- | -------------------------------------------------------------------- | ------------------- |
| `-get`      | Retorna o valor default de uma chave.                                | `key`               |
| `-getall`   | Retorna todos os valores default atuais.                             | Nenhum              |
| `-set`      | Define o valor default para uma chave.                               | `key`, `value`      |
| `-setall`   | Define todos os valores com base em um objeto enviado (uso interno). | `value`             |
| `-unset`    | Remove o valor default de uma chave.                                 | `key`               |
| `-unsetall` | Remove todos os valores default.                                     | Nenhum              |

#### Chaves padrões reconhecidas:

* `user_id`: ID do usuário a ser usado nas operações
* `chat_id`: ID do chat padrão
* `user_message_id`: ID da mensagem de usuário padrão
* `ai_message_id`: ID da resposta da IA padrão
* `token`: Token JWT do usuário autenticado
* `model`: Nome do modelo padrão a ser utilizado nas respostas de IA
* `domain` : Domínio da URL onde está hospedada a API
* `port` : Porta utilizada pela API
* `auto-create-AI-message`: Se `true`, mensagens de usuário geram automaticamente respostas da IA

---

### `quit`

Finaliza a execução da CLI.

```bash
sentry quit
```
uhh.. o que você esperava que fizesse?

---

### `help`

Exibe ajuda contextual da CLI.

| Subcomando   | Ação                                         |
| ------------ | -------------------------------------------- |
| `-all`       | Mostra a ajuda completa de todos os comandos |
| `-[comando]` | Mostra ajuda para o comando específico       |



