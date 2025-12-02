# SentryAI

<p align="center" display="inline-block">
  <img src="https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white"/>
  <img src="https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white"/>
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB"/>
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=Vite&logoColor=white"/>
  <img src="https://img.shields.io/badge/google%20gemini-8E75B2?style=for-the-badge&logo=google%20gemini&logoColor=white"/>
  <img src="https://img.shields.io/badge/OpenAI-4A4A55?style=for-the-badge&logo=openai"/>
</p>

SentryAI é uma aplicação voltada ao gerenciamento de modelos de IA, específicamente ao caráter jurídico brasileiro, cuja principal funcionalidade é a possibilidade de realizar um chat com uma IA especializada na lei brasileira.

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
> **Nota:** Nas últimas atualizações, nós, a equipe de desenvolvimento, decidimos por substituír o **Ollama** pela API da **OpenAI** e do **Gemini 2.5**, ficando a critério do usuário qual utilizar. A mudança se deve ao alto custo em hardware demandado por LLMs locais. Isso não significa que o projeto se perdeu, uma vêz que o caráter inicial sempre foi experimentação na área das Inteligências Artificiais.

- **ChatGPT** - Serviço de IA da OpenAI
- **Gemini** - Serviço de IA da Google
- **Google Auth** - API da Google para autenticação
- **Flask** - Framework web para Python.
- **React + Vite** - Frameworks para o Front-End.
- **SQLAlchemy** - ORM para interação com o banco de dados.
- **MySQL** - RDBMS escolhido por sua simplicidade e robustez
- **JWT** - Tokens e Autenticação

## Instalação

### Pré-Requisitos
Antes de rodar o projeto, certifique-se de ter o Python 3.x e o pip instalados.
- [Python3.x](#https://www.python.org/)
- [Pip](#https://pip.pypa.io/en/stable/)
- [MySQL](#https://www.mysql.com/)
- [NPM](#https://www.npmjs.com/)


### Passo a Passo

**0.** Clone este repositório:
```bash
git clone https://github.com/Bernardo270408/SentryAI
cd SentryAI
```

**1.** Crie um ambiente virtual
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

**2.** Instale as dependencias do Backend
```bash
pip install -r requirements.txt
```

**3.** Configure as variáveis de Ambiente
Renomeie o arquivo `.env.example` para `.env` e configure as variáveis de ambiente:
```env
#app
SECRET_KEY="sua_chave_secreta_aqui"
DATABASE_URL="mysql+pymysql://root:senha@localhost:3306/sentryai"

#ai service
OPENAI_TOKEN="seu-token"
GEMINI_API_KEY="sua_api_key_aqui"

#smtp
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email@gmail.com
SMTP_PASSWORD=sua_senha_de_app_gmail
```
**4.** Configure o Banco de Dados

Primeiro crie **com o MySQL** uma base de dados de nome `sentryai`:
```sql
  CREATE DATABASE sentryai;
```

Após isso, na pasta do backend execute
```bash
  flask db upgrade
```

**5.** Instale as dependencias do Frontend
```bash
  cd ../frontend
  npm install
```

### Configurando a CLI (Para Usuários Avançados apenas)
O SentryAI conta com uma CLI (Command Line Interface) para facilitar o uso da API, e permitir que usuários avancados possam interagir com o sistema sem a necessidade de uma interface gráfica.

#### Instalando a CLI

**1.** Crie outro ambiente virtual para a CLI 
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

**2.** Instale as dependencias da CLI 
```bash
pip install -r requirements.txt
```

>**Nota:** O inicializador da CLI é pre-compilado para Linux e Windows, mas caso seja necessário, o código fonte `sentry.c` está na mesma pasta, e pode ser compilado para o OS desejado.

> É recomendado adicionar o executável da CLI ao PATH de seu sistema.


#### Configurando os Defaults da CLI (Opcional)
A CLI utiliza alguns valores default para facilitar o uso. Estes valores são armazenados em arquivos na pasta `CLI/data/`.

Configure os valores padrão `domain` e `port`, que servirão para dizer à CLI onde exatamente está hospedada a API.
Estes são os valores padrão:
```bash
sentry run
sentry defaults -set key="domain" value="127.0.0.1"
sentry defaults -set key="port" value="5000"
sentry quit
```
> **Nota:** Este passo é apenas necessário caso a API esteja rodando em um domínio ou porta diferente do padrão (localhost:5000).

## Rodando o Projeto

### Inicializando a API (Back-End)
Para iniciar a API, caso esteja em um ambiente de testes, rode dentro da pasta do backend
```bash
flask run --debug
```
Em outros casos, recomenda-se o uso de `gunicorn`

### Inicializando o Client (Front-End)
Para iniciar o Client, caso esteja em um ambiente de testes, rode dentro da pasta do frontend
```bash
npm run dev
```
Em outros casos, recomenda-se usar `npm run buid`

### Inicializando a CLI (Command Line Interface)

Para iniciar a CLI, simplesmente digite no terminal:
```bash
sentry run
```

Caso não tenha sido incluida ao path, o comando deverá ser feito na pasta da CLI, sendo então:
```bash
./sentry run
```

> **Nota:** o uso de `./` apenas é necessário para o comando `run`, não sendo utilizado nos demais comandos da CLI.


## Estrutura do Projeto
```
Backend/                    # Backend Flask
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
    contract_router.py      # Análise de Contratos
    dashboard_router.py     # Estatísticas e Insights
    user_router.py          # Usuários
    chat_router.py          # Chats
    message_user_router.py  # Mensagens de usuário
    message_ai_router.py    # Mensagens de IA
    rating_router.py        # Avaliações
  services/                 # Serviços do BackEnd
    ai_service.py           # Serviço de IA OpenAI/Gemini
    data.json               # Dados sobre o comportamento da IA
  middleware/               #
    jwt_util.py             # Autenticação JWT
  migrations/               # Migrações
CLI/                        # Command Line Interface
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
frontend/                   # Front-end (React + Vite)
  index.html                # Entrada do aplicativo (HTML)
  package.json              # Dependências e scripts do frontend
  README.md                 # Documentação do frontend
  vite.config.js            # Configuração do Vite
  src/                      # Código fonte React
    App.jsx                 # Componente raiz
    main.jsx                # Ponto de entrada do React
    components/             # Componentes reutilizáveis
      AppHeader.jsx         # Cabeçalho do app
      AuthModal.jsx         # Modal de autenticação
      ChatHeader.jsx        # Cabeçalho do chat
      ChatPreview.jsx       # Visualização do chat
      FooterComponent.jsx   # Rodapé do app
      NewChatModal.jsx      # Modal para novo chat
    pages/                  # Páginas do app
      Aplication.jsx        # Página principal
      ChatPage.jsx          # Página de chat
      ContractAnalysis.jsx  # Análise de contratos
      Dashboard.jsx         # Painel de controle
      Home.jsx              # Página inicial
      RightsExplorer.jsx    # Explorador de direitos
      Settings.jsx          # Configurações
    services/               # Serviços do frontend
      api.js                # Comunicação com a API
    styles/                 # Arquivos CSS
      AppHeader.css         # Estilos do cabeçalho do app
      Application.css       # Estilos da aplicação
      chatpage.css          # Estilos da página de chat
      contractAnalysis.css  # Estilos da análise de contratos
      dashboard.css         # Estilos do painel de controle
      footer.css            # Estilos do rodapé
      global.css            # Estilos globais
      rights.css            # Estilos do explorador de direitos 
      settings.css          # Estilos da página de configurações
docs/                       # Documentação
  API_ENDPOINTS.md          # Endpoints da API
  CLI_COMMANDS.md           # Comandos da CLI
  DB_SCHEMA.md              # Modelo do Banco de Dados
.env.example                # Exemplo de variáveis de ambiente
.env                        # Variáveis de ambiente (não sobe por nada)
.gitignore                  # Arquivos ignorados pelo git
readme.md                   # Você está aqui =D
  
```

## Principais Endpoints
Ao rodar o backend, uma API ficará disponível em http://localhost:5000/ (ou em outra rota determinada, caso altere manualmente).

> **Nota:** A forma recomendada de acesso à API é utilizando o *frontend* ou a *CLI*. Caso queira fazer as requisições de maneira alternativa, pode ler cada um dos endpoints disponiveis [neste link](docs/API_ENDPOINTS.md).

Dicas:
- Todas as rotas protegidas exigem o header: `Authorization: Bearer <token>`
- O token é obtido via POST `/login` (leia o documento)


## Modelo do Banco de Dados
O Banco de Dados do SentryAI é baseado em MySQL, e gerenciado pelo SQLAlchemy com Pyhton. 

Existem 6 Tabelas Principais na Base de dados, sendo elas `users`,`chats`,`user_messages`,`ai_messages`,`ratings` e `contracts`. Um modelo extenso foi elaborado para garantir a compreensão do funcionamento desse modelo relacional.

> Nota: O modelo do banco de dados acabou tornando-se uma sessão extensa. Foi necessário movê-lo para uma sessão à parte, que pode ser lida [neste link](docs/DB_SCHEMA.md).


---

## Comandos Da CLI
A CLI foi pensada no início como uma simples substituta ao frontend, que ainda não existia. Porém, foi reformulada para realmente ser utilizável e alternativa à interface visual. 

### Estrutura do Comando

```bash
sentry [comando] -[subcomando] [chave]=[valor] [chave]=[valor] ...
```

exemplo de autenticação:

```bash
sentry auth -login email='test@mail' password='1234'
```

retorna o token, o seta como padrão e pergunta se o ID do usuário em questão deverá ser utilizado como padrão para próximas iterações

> Nota: Há um documento detalhando cada comando da CLI e detalhes importantes de seu uso. Para lê-lo, acesse [este link](docs/CLI_COMMANDS.md).

Dicas:

* Para executar qualquer comando, é necessário que a CLI esteja rodando
* Argumentos omitidos usarão valores default.
* Parâmetros extras serão ignorados (não causam erro).
* Desenvolvedores podem enviar todos os defaults sem risco.

---

## Licença

Copyright (c) 2025 Bernardo "222" Duarte Marcelino

Copyright (c) 2025 Yagor Vitor Silva dos Santos

Este projeto é distribuído sob a licença MIT [1].

---
