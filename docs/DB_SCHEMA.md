# Modelo e Estrutura das Tabelas do Banco de Dados

Este documento detalha todas as tabelas do banco de dados atual, utilizando-se de MySQL, e seus relacionamentos.
Você pode voltar para o readme por [este link](../readme.md).

### User
| Coluna       | Tipo     | PK | FK | Not Null | Default      | Descrição                        |
|--------------|----------|----|----|----------|--------------|----------------------------------|
| id           | Integer  | X  |    | X        | auto_inc     | Identificador único do usuário   |
| name         | String   |    |    | X        |              | Nome do usuário                  |
| email        | String   |    |    | X        |              | Email do usuário                 |
| password     | String   |    |    | X        |              | Senha (hasheada)                 |
| extra_data   | Text     |    |    |          |              | Dados extras                     |
| is_admin     | Boolean  |    |    |          | False        | Usuário administrador            |

---

### Chat
| Coluna     | Tipo     | PK | FK | Not Null | Default                | Descrição                      |
|------------|----------|----|----|----------|------------------------|--------------------------------|
| id         | Integer  | X  |    | X        | auto_inc               | Identificador do chat          |
| name       | String   |    |    | X        |                        | Nome do chat                   |
| created_at | DateTime |    |    |          | db.func.now()          | Data de criação                |
| user_id    | Integer  |    | X  | X        |                        | Usuário dono do chat           |
| rating_id  | Integer  |    | X  |          | Null                   | ID da avaliação do chat        |

---

### MessageUser
| Coluna     | Tipo     | PK | FK | Not Null | Default                | Descrição                      |
|------------|----------|----|----|----------|------------------------|--------------------------------|
| id         | Integer  | X  |    | X        | auto_inc               | Identificador da mensagem      |
| content    | Text     |    |    | X        |                        | Conteúdo da mensagem           |
| created_at | DateTime |    |    |          | db.func.now()          | Data de criação                |
| user_id    | Integer  |    | X  | X        |                        | Usuário autor                  |
| chat_id    | Integer  |    | X  | X        |                        | Chat relacionado               |

---

### AIMessage
| Coluna           | Tipo     | PK | FK | Not Null | Default       | Descrição                             |
|------------------|----------|----|----|----------|--------------|----------------------------------------|
| id               | Integer  | X  |    | X        | auto_inc     | Identificador da mensagem de IA        |
| content          | Text     |    |    | X        |              | Conteúdo da resposta da IA             |
| created_at       | DateTime |    |    |          | db.func.now()| Data de criação                        |
| model_name       | String   |    |    | X        |              | Nome do modelo utilizado               |
| chat_id          | Integer  |    | X  | X        |              | Chat relacionado                       |
| user_message_id  | Integer  |    | X  |          |              | Mensagem de usuário origem (opcional)  |

---

### Rating
| Coluna     | Tipo     | PK | FK | Not Null | Default | Descrição                      |
|------------|----------|----|----|----------|---------|--------------------------------|
| id         | Integer  | X  |    | X        | auto_inc| Identificador da avaliação     |
| user_id    | Integer  |    | X  | X        |         | Usuário que avaliou            |
| score      | Integer  |    |    | X        |         | Nota da avaliação (1-5)        |
| feedback   | String   |    |    |          |         | Comentário adicional (opcional)|

---

### Relacionamentos

| Tabela Origem   | Coluna Origem     | Tabela Destino | Coluna Destino | Tipo de Relacionamento |
|-----------------|-------------------|----------------|----------------|----------------------- |
| chat            | user_id           | user           | id             | N:1                    |
| message_user    | user_id           | user           | id             | N:1                    |
| message_user    | chat_id           | chat           | id             | N:1                    |
| ai_message      | chat_id           | chat           | id             | N:1                    |
| ai_message      | user_message_id   | message_user   | id             | N:1 (opcional)         |
| rating          | chat_id           | chat           | id             | 1:1 (opcional)         |
