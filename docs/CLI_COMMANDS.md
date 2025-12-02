# A Inteface de Linha de Comando (CLI) do SentryAI

## Descrição
A CLI  do SentryAi foi inicialmente pensada apenas como uma substituta para o ainda não presente front-end, mas completamente reformulada para ser utilizável, e atualmente é a principal alternativa ao frontend oficial, sendo recomendada para usuários avançados.

> **Nota:** Este documento foi elaborado principalmente como um manual da CLI, mas assume que o usuário já esteja familiarizado com interfaces de comando.

> Para voltar ao readme, acesse [este link](../readme.md).

## Índice
- [Descrição](#descrição)
- [Estrutura Básica](#estrutura-básica-do-comando)
- [Comandos e suas funções](#os-comandos-e-suas-funções)
    - [Autenticação](#auth)
    - [Chat](#chat)
    - [Usuário](#user)
    - [Mensagem de Usuário](#message_user)
    - [Mensagem de IA](#message_ai)
    - [Avaliação](#rating)
    - [Contrato](#contract)
    - [Defaults](#default)
    - [Dashboard](#dashboard)
    - [Fechar](#quit)
    - [Ajuda](#help)
    - [Rodar](#run)

## Estrutura Básica do Comando
Esta é a estrutura geral de um comando

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

## Os Comandos e suas funções
Aqui estão listados todos os comandos da CLI, o que requerem e o que retornam. Caso seja necessária uma consulta rápida, recomenda-se a execução do comando `sentry help -all` ou dedicado a um comando específico.

### `auth`

Gerencia a autenticação de usuários, validação de emails e status logado e deslogado.

Nomes alternativos: `authentication`


| Subcomando    | Ação                                                                                                          | Campos Obrigatórios |
| -----------   | ------------------------------------------------------------------------------------------------------------  | ------------------- |
| `-login`      | Loga, gera um token JWT e seta como default. Pergunta se o `user_id` deve ser utilizado como default também.  | `email`, `password` |
| `-googlelogin`| Loga com uma conta google. Se a conta não existir, é criada, e então segue o processo de login padrão         | `credential`        |
| `-verifyemail`| Verifica o email da conta, permitindo o uso dela.                                                             | `email`, `code`     |
| `-logout`     | Remove o token atual dos valores default.                                                                     | Nenhum              |
| `-gettoken`   | Imprime o token atual salvo nos defaults.                                                                     | Nenhum              |

---

### `chat`

Gerencia os chats utilizados para registrar conversas com o modelo de IA.

Nomes alternativos: `chats`


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

Nomes alternativos: `users`


| Subcomando | Ação                                             | Campos Obrigatórios         |
| ---------- | ------------------------------------------------ | --------------------------- |
| `-create`  | Cria um novo usuário. Email deve ser verificado. | `name`, `email`, `password` |
| `-get`     | Busca um usuário por ID.                         | `user_id`                   |
| `-getall`  | Lista todos os usuários.                         | Nenhum                      |
| `-update`  | Atualiza um usuário existente.                   | `user_id`, `token`          |
| `-delete`  | Remove um usuário.                               | `user_id`, `token`          |
| `-open`    | Define um `user_id` como default.                | `user_id`                   |
| `-quit`    | Remove o `user_id` default atual.                | Nenhum                      |

---

### `message_user`

Gerencia mensagens enviadas por usuários.

Nomes alternativos: `message`, `messages`, `message_user`, `messageuser`, `user_message`, `usermessage`, `user-message`, `message-user`


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

Nomes alternativos: `message_ai`, `messageai`, `ai_message`, `aimessage`, `ia-message`, `message-ai`

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

Nomes alternativos: `ratings`


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

### `contract`

Gerencia operações relacionadas a contratos. Note que o comando `analyze` é um alias para `create`, e que ambos realizam a mesma função de analisar um contrato. 

Nomes alternativos: `contracts`

| Subcomando | Ação                                 | Campos Obrigatórios                      |
| ---------- | ------------------------------------ | ---------------------------------------- |
| `-create`  | Analiza um contrato                  | `contract_text`, `user_id`, `token`      |
| `-analyze` | "                                    | "                                        |
| `-get`     | Retorna um contrato específico       | `contract_id`, `token`                   |
| `-getall`  | Retorna todos os contratos do sistema| `token`                                  |
| `-update`  | Atualiza um contrato existente       | `contract_id`, `token`                   |
| `-delete`  | Remove um contrato do sistema        | `contract_id`, `token`                   |
| `-open`    | Define um `contract_id` como padrão  | `contract_id`                            |
| `-quit`    | Remove o `contract_id` padrão atual  | Nenhum                                   |

---

### `default`

Gerencia valores padrão utilizados nas operações da CLI.

Nomes alternativos: `defaults`


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
* `rating_id`: ID da avaliação padrão
* `contract_id`: ID do contrato padrão
* `token`: Token JWT do usuário autenticado
* `model`: Nome do modelo padrão a ser utilizado nas respostas de IA
* `domain` : Domínio da URL onde está hospedada a API
* `port` : Porta utilizada pela API

---

### `dashboard`

Exibe as informações do dashboard no terminal em JSON

Nomes alternativos: `dash`, `overview`, `stats`
**Informações exibidas:**
- `kpis`:
    - `active_cases`: Quantidade de chats ativos
    - `docs_analyzed`: Número de documentos analisados
    - `risks_avoided`: Número de riscos evitados
    - `next_deadline`: Próximo prazo importante
- `chart_data`: Array contendo dados dos últimos 7 dias com número de consultas e análises
- `history`: Últimas ações realizadas
- `insight`: Dica ou insight baseado na última interação do usuário

### `quit`
Finaliza a execução da CLI.

uhh.. o que você esperava que fizesse?

Nomes alternativos: `exit`, `quit`, `q`


---

### `help`

Exibe ajuda contextual da CLI.

Nomes alternativos: `h`, `?`, `help`


| Subcomando   | Ação                                         |
| ------------ | -------------------------------------------- |
| `-all`       | Mostra a ajuda completa de todos os comandos |
| `-[comando]` | Mostra ajuda para o comando específico       |
´

### `run`
Inicializa a CLI.
Sem parâmetros ou funções extras.

