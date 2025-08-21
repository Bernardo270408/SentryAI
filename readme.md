# SentryAI

## Descrição
SentryAI é um backend desenvolvido em Python utilizando SQLAlchemy para gerenciamento de usuários, chats e mensagens. O projeto é estruturado para facilitar a integração com sistemas de IA e chatbots, permitindo o armazenamento e manipulação eficiente de dados relacionados a conversas entre usuários e inteligência artificial.

## Estrutura do Projeto

```
Backend/
	app.py                # Arquivo principal da aplicação
	config.py             # Configurações do banco de dados e da aplicação
	requirements.txt      # Dependências do projeto
	DAO/                  # Objetos de Acesso a Dados (Data Access Objects)
		user_dao.py         # DAO para usuários
		chat_dao.py         # DAO para chats
		message_user_dao.py # DAO para mensagens de usuário
	models/               # Modelos ORM (SQLAlchemy)
		user.py             # Modelo de usuário
		chat.py             # Modelo de chat
		message_user.py     # Modelo de mensagem de usuário
		message_ai.py       # (Opcional) Modelo de mensagem da IA
	router/
		test_router.py      # (Exemplo/Teste) Rotas de teste
```

## Principais Componentes

- **models/**: Contém os modelos de dados (ORM) para usuários, chats e mensagens.
- **DAO/**: Implementa as operações CRUD para cada modelo, facilitando a manipulação dos dados.
- **config.py**: Define a configuração do banco de dados e inicializa o SQLAlchemy.
- **app.py**: Ponto de entrada da aplicação (pode conter a inicialização do servidor e rotas principais).

## Como Executar

1. Instale as dependências:
	 ```bash
	 pip install -r requirements.txt
	 ```
2. Configure o banco de dados em `config.py` conforme necessário.
3. Execute a aplicação:
	 ```bash
	 python app.py
	 ```

## Funcionalidades

- Cadastro, autenticação e gerenciamento de usuários.
- Criação e gerenciamento de chats vinculados a usuários.
- Armazenamento e manipulação de mensagens enviadas por usuários (e IA, se implementado).

## Observações

- O projeto ainda está longe de estar pronto, restando muitos passos ainda tanto no back-end quanto no front-end
- Certifique-se de configurar corretamente o banco de dados antes de executar a aplicação.
