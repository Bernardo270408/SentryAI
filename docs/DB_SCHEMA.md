# Modelo e Estrutura das Tabelas do Banco de Dados

Este documento detalha todas as tabelas do banco de dados atual, utilizando-se de MySQL, e seus relacionamentos.
Você pode voltar para o readme por [este link](../readme.md).


## Descrição
O Banco de Dados do SentryAI é baseado em MySQL, e gerenciado pelo SQLAlchemy com Pyhton. 

Existem 6 Tabelas Principais na Base de dados, sendo elas `users`,`chats`,`user_messages`,`ai_messages`,`ratings` e `contracts`. Um modelo extenso foi elaborado para garantir a compreensão do funcionamento desse modelo relacional.

## Índice
- [Descrição](#descrição)
- [Usuário](#usuário)
- [Chats](#chats)
- [Mensagens de Usuário](#mensagens-de-usuário)
- [Mensagens de IA](#mensagens-de-ia)
- [Avaliações](#avaliações)
- [Contratos Analizados](#contratos-analizados)
- [Relacionamentos](#relacionamentos)


## Usuário
Tablename `users`. Armazena usuários da plataforma.
| Coluna       | Tipo     | PK | FK | Not Null | Default      | Descrição                        |
|--------------|----------|----|----|----------|--------------|----------------------------------|
| id           | Integer  | X  |    | X        | auto_inc     | Identificador único do usuário   |
| name         | String   |    |    | X        |              | Nome do usuário                  |
| email        | String   |    |    | X        |              | Email do usuário                 |
| password     | String   |    |    |          |              | Senha (hasheada, pode ser nula para login social) |
| extra_data   | Text     |    |    |          |              | Dados extras                     |
| is_admin     | Boolean  |    |    |          | False        | Usuário administrador            |
| google_id    | String   |    |    |          | Null         | ID do usuário no Google          |
| is_verified  | Boolean  |    |    |          | False        | Status de verificação de email   |
| verification_code | String   |    |    |          | Null         | Código de verificação de email   |
| verification_code_expires_at | DateTime |    |    |          | Null         | Expiração do código de verificação |

---

## Chats
Tablename `chats`. Armazena os chats dos usuários.
| Coluna     | Tipo     | PK | FK | Not Null | Default                | Descrição                      |
|------------|----------|----|----|----------|------------------------|--------------------------------|
| id         | Integer  | X  |    | X        | auto_inc               | Identificador do chat          |
| name       | String   |    |    | X        |                        | Nome do chat                   |
| created_at | DateTime |    |    |          | db.func.now()          | Data de criação                |
| user_id    | Integer  |    | X  | X        |                        | Usuário dono do chat           |
| rating_id  | Integer  |    | X  |          | Null                   | ID da avaliação do chat        |

---

## Mensagens de Usuário
Tablename `user_messages`. Armazena mensagens enviadas por usuários

| Coluna     | Tipo     | PK | FK | Not Null | Default                | Descrição                      |
|------------|----------|----|----|----------|------------------------|--------------------------------|
| id         | Integer  | X  |    | X        | auto_inc               | Identificador da mensagem      |
| content    | Text     |    |    | X        |                        | Conteúdo da mensagem           |
| created_at | DateTime |    |    |          | db.func.now()          | Data de criação                |
| updated_at | DateTime |    |    |          | db.func.now()          | Data da última atualização     |
| user_id    | Integer  |    | X  | X        |                        | Usuário autor                  |
| chat_id    | Integer  |    | X  | X        |                        | Chat relacionado               |

---

## Mensagens de IA
Tablename `ai_messages`. Armazena mensagens enviadas pela IA.

| Coluna           | Tipo     | PK | FK | Not Null | Default       | Descrição                             |
|------------------|----------|----|----|----------|--------------|----------------------------------------|
| id               | Integer  | X  |    | X        | auto_inc     | Identificador da mensagem de IA        |
| content          | Text     |    |    | X        |              | Conteúdo da resposta da IA             |
| created_at       | DateTime |    |    |          | db.func.now()| Data de criação                        |
| updated_at       | DateTime |    |    |          | db.func.now()| Data da última atualização             |
| model_name       | String   |    |    | X        |              | Nome do modelo utilizado               |
| chat_id          | Integer  |    | X  | X        |              | Chat relacionado                       |
| user_message_id  | Integer  |    | X  |          |              | Mensagem de usuário origem (opcional)  |

---

## Avaliações
Tablename `ratings`. Armazena avaliações e feedbacks dados pelo usuário aos seus chats.
| Coluna     | Tipo     | PK | FK | Not Null | Default  | Descrição                      |
|------------|----------|----|----|----------|--------- |--------------------------------|
| id         | Integer  | X  |    | X        | auto_inc | Identificador da avaliação     |
| user_id    | Integer  |    | X  | X        |          | Usuário que avaliou            |
| chat_id    | Integer  |    | X  | X        |          | Chat avaliado                  |
| score      | Integer  |    |    | X        |          | Nota da avaliação (1-5)        |
| feedback   | String   |    |    |          |          | Comentário adicional (opcional)|

---

## Contratos Analizados
Tablename `contracts`. Armazena análizes de contratos (enviados pelo usuário) feitas pela IA em JSON.
| Coluna     | Tipo     | PK | FK | Not Null | Default       | Descrição                       |
|------------|----------|----|----|----------|----------------|--------------------------------|
| id         | Integer  | X  |    | X        | auto_inc       | Identificador do contrato      |
| user_id    | Integer  |    | X  | X        |                | Usuário dono do contrato       |
| text       | Text     |    |    | X        |                | Texto do contrato enviado      |
| json       | JSON     |    |    | X        |                | Análize feita pela IA          |
| created_at | DateTime |    |    | X        | db.func.now()  | Data de criação                |
| updated_at | DateTime |    |    |          | db.func.now()  | Data da última atualização     |

---

## Relacionamentos

Como cada uma das tabelas se relacionam entre si.

| Tabela Origem   | Coluna Origem     | Tabela Destino | Coluna Destino | Tipo de Relacionamento |
|-----------------|-------------------|----------------|----------------|----------------------- |
| chat            | user_id           | user           | id             | N:1                    |
| message_user    | user_id           | user           | id             | N:1                    |
| message_user    | chat_id           | chat           | id             | N:1                    |
| ai_message      | chat_id           | chat           | id             | N:1                    |
| ai_message      | user_message_id   | message_user   | id             | N:1                    |
| rating          | chat_id           | chat           | id             | 1:1                    |
| contract        | user_id           | user           | id             | N:1                    |