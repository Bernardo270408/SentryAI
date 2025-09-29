# SentryAI

SentryAI é uma aplicação voltada ao gerenciamento de modelos de IA, específicamente ao caráter jurídico brasileiro

## Índice

- [Instalação](#instalação)


---

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
CLI/
  
```

## Instalação

### Uso Local

Para fazer uso local da aplicação, primeiro instale as dependencias do BackEnd:

```bash
cd Backend
pip install -r requirements.txt
```


Recomenda-se a criação de um ambiente virtual

Após feita a instalação das dependencias, rode a API, que é baseada em Flask

```bash
flask run
```

Após isso, o procedimento é o mesmo do uso local.

### Uso Remoto

Caso a API já esteja rodando na URL desejada, instale primeiro as dependencias da interface de terminal (CLI)

```bash
cd CLI
pip install -r requirements.txt
```

Apos isso, inicialize no terminal a CLI

```bash
sentry run
```
ou, caso não haja intenção de adicionar o executável ao PATH

```bash
./sentry run
```

**Obs:** O inicializador é pre-compilado para Linux e Windows, mas caso seja necessário, o código fonte `sentry.c` está na mesma pasta, e pode ser compilado para o OS desejado.

É recomendado adicionar o executável da CLI ao PATH de seu sistema.


## Uso da CLI

### Estrutura básica

Para realizar o uso na interface de terminal, primeiro inicialize a CLI:

```bash
sentry run
```

A estrutura básica da CLI é:

```bash
sentry [comando] -[subcomando] [argumentos]
```

Exemplo de autenticação:

```bash
sentry auth -login email='test@mail' password='1234'
```

Dicas:

* Você pode usar parâmetros como `user_id=x` ou `token=abc`.
* Parâmetros omitidos usarão valores default, se definidos.
* Parâmetros extras serão ignorados (não causam erro).
* Os valores default são enviados exatamente como foram definidos.
* Desenvolvedores podem enviar todos os defaults sem risco.

---

## Comandos Disponíveis

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
| `-open`              | Define um `ai_message_id` como default.                | `ai_message_id`                        |
| `-quit`              | Remove o `ai_message_id` default atual.                | Nenhum                                 |

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
* `auto-create-AI-message`: Se `true`, mensagens de usuário geram automaticamente respostas da IA

---

### `quit`

Finaliza a execução da CLI.

```bash
sentry quit
```

---

### `help`

Exibe ajuda contextual da CLI.

| Subcomando   | Ação                                         |
| ------------ | -------------------------------------------- |
| `-[comando]` | Mostra ajuda para o comando específico       |
| `-all`       | Mostra a ajuda completa de todos os comandos |


