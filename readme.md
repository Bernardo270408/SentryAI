# SentryAI

SentryAI é uma aplicação em desenvolvimento voltada ao gerenciamento de modelos de IA, específicamente ao caráter jurídico brasileiro.
Atualmente estamos sem um front-end decente, mas isso será corrigido em breve

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
> **Nota:** Nas últimas atualizações, nós, a equipe de desenvolvimento, decidimos por substituír o **Ollama** pela API da **OpenAI**, devido ao alto custo em hardware demandado por LLMs locais. Isso não significa que o projeto se perdeu, uma vêz que o caráter inicial sempre foi experimentação.

- **OpenAI** - Serviço de IA (Substituíndo o Ollama)
- **Flask** - Framework web para Python.
- **SQLAlchemy** - ORM para interação com o banco de dados.
- **MySQL** - RDBMS escolhido por sua simplicidade e robustez
- **JWT** - Tokens e Autenticação

## Instalação

### Pré-Requisitos
Antes de rodar o projeto, certifique-se de ter o Python 3.x e o pip instalados.
- [Python3.x](#https://www.python.org/)
- [Pip](#https://pip.pypa.io/en/stable/)
- [MySQL](#https://www.mysql.com/)

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
```python
  SECRET_KEY="sua_chave_secreta_aqui"
  DATABASE_URL="mysql://{usuário}:{senha}@localhost:3306/sentryai"
  openai_token="seu-token"
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


**5.** Crie outro ambiente virtual para a CLI
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

**6.** Instale as dependencias da CLI
```bash
pip install -r requirements.txt
```
**Obs:** O inicializador é pre-compilado para Linux e Windows, mas caso seja necessário, o código fonte `sentry.c` está na mesma pasta, e pode ser compilado para o OS desejado.

É recomendado adicionar o executável da CLI ao PATH de seu sistema.

### Configurando a CLI
Configure os valores padrão `domain` e `port`, que servirão para dizer à CLI onde exatamente está hospedada a API.
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
  services/                 # Serviços do BackEnd
    ai_service.py           # Serviço de IA OpenAI
    data.json               # Dados sobre o comportamento da IA
  middleware/               #
    jwt_util.py             # Autenticação JWT
  migrations/               # Migrações
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
Ao rodar o backend, uma API ficará disponível em http://localhost:5000/ (ou em outra rota determinada, caso altere manualmente).

> Nota: A forma recomendada de acessar os endpoints atualmente é pela CLI, mas caso queira fazer as requisições de maneira alternativa, pode ler cada um dos endpoints disponiveis [neste link](docs/API_ENDPOINTS.md).

Dicas:
- Todas as rotas protegidas exigem o header: `Authorization: Bearer <token>`
- O token é obtido via POST `/login` (leia o documento)


## Modelo do Banco de Dados
O Banco de Dados é baseado em MySQL, podendo entretanto ser alterado com facilidade

> Nota: O modelo do banco de dados acabou tornando-se uma sessão extensa. Foi necessário movê-lo para uma sessão à parte, que pode ser lida [neste link](docs/DB_SCHEMA.md).


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

> Nota: Há um documento detalhando cada comando da CLI e detalhes importantes de seu uso. Para lê-lo, acesse [este link](docs/CLI_COMMANDS.md).

Dicas:

* Para executar qualquer comando, é necessário que a CLI esteja rodando
* Argumentos omitidos usarão valores default.
* Parâmetros extras serão ignorados (não causam erro).
* Desenvolvedores podem enviar todos os defaults sem risco.