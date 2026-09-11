# SentryAI

Protótipo acadêmico de assistência jurídica informativa em português. Reúne chat, análise de contratos, histórico, painel de uso, moderação e uma interface de terminal.

## Como funciona

1. O usuário acessa a interface React e entra na conta.
2. A API Flask verifica o token e a permissão sobre os dados solicitados.
3. Perguntas e documentos são encaminhados ao serviço de IA. No chat, o sistema consulta primeiro uma seleção local de legislação, quando o RAG está habilitado e indexado.
4. OpenAI gera a resposta. No chat, o texto chega progressivamente ao navegador.
5. SQLAlchemy salva usuários, conversas, mensagens, avaliações e contratos no banco relacional. O ChromaDB mantém os vetores dos trechos de referência.

RAG significa recuperar trechos relevantes antes de gerar uma resposta. A equipe desenvolveu a aplicação e sua integração; não treinou um modelo de linguagem do zero.

## OpenAI em todos os recursos

| Recurso | Modelo padrão |
| --- | --- |
| Chat comum e streaming | gpt-5.6-terra |
| Análise de contratos e dúvidas sobre o contrato | gpt-5.6-terra |
| Análise administrativa de possíveis abusos | gpt-5.6-terra |
| Títulos de conversas, dica do painel e resumo de dúvidas | gpt-5.6-luna |
| Vetorização e busca da base local | text-embedding-3-small |

O servidor usa a Responses API, limita saídas, envia contexto recente, configura raciocínio baixo nas tarefas principais e reutiliza resultados do painel enquanto suas entradas forem iguais. O cache é local ao processo e se perde ao reiniciar. Tokens de entrada e saída são registrados no log sem o texto das consultas. Não existe um bloqueio financeiro global implementado no aplicativo.

A chave fica no `.env` da raiz em `OPENAI_API_KEY`. O nome antigo `OPENAI_TOKEN` continua aceito. O navegador nunca recebe essa chave. `OPENAI_MODEL`, `OPENAI_AUX_MODEL` e `AI_ALLOWED_MODELS` controlam quais modelos podem ser usados.

Preços consultados em 11/09/2026, por milhão de tokens: Terra US$ 2 de entrada e US$ 12 de saída; Luna US$ 0,20 e US$ 1,20. Uma chamada Terra com 4 mil tokens de entrada e 2 mil de saída custa aproximadamente US$ 0,032, sem outros consumos ou efeitos de cache. O tamanho do histórico, contratos e raciocínio muda o custo.

Fontes: [Terra](https://developers.openai.com/api/docs/models/gpt-5.6-terra), [Luna](https://developers.openai.com/api/docs/models/gpt-5.6-luna).

## Demonstração no Windows

O pacote revisado inclui a interface compilada em `frontend/dist`.

1. Execute `Preparar-SentryAI.cmd` uma vez. Ele instala as dependências em `.venv` e cria exclusivamente o banco SQLite de demonstração.
2. Preencha `OPENAI_API_KEY` no `.env` da raiz. A chave da sessão `SECRET_KEY` é gerada automaticamente. Nunca envie esse arquivo ao GitHub.
3. Execute `Iniciar-SentryAI.cmd` e abra `http://127.0.0.1:5000`.
4. Conta local de demonstração: `demo@sentryai.local`; senha `SentryDemo2026!`. Use-a somente na demonstração local com dados fictícios.

A preparação reconhece Python instalado ou o runtime local do Codex, quando disponível. Se você obteve somente o código pelo Git, compile antes a interface com `npm install` e `npm run build` dentro de `frontend`.

Para habilitar a base de leis, com `RAG_ENABLED=true`, execute:

```powershell
.\.venv\Scripts\python.exe Backend\ingest_laws.py
```

A indexação envia os trechos locais para a API de embeddings. Ao mudar o modelo de embeddings, o projeto usa uma coleção separada; execute a indexação novamente. `RAG_ENABLED=false` permite usar o chat sem a busca. Nesse caso, não apresente a resposta como fundamentada na base local.

## Desenvolvimento

Backend: Python 3.11+, Flask, SQLAlchemy, JWT, OpenAI e leitores de arquivos. Instale `Backend/requirements.txt`. Para RAG, instale também `Backend/requirements-rag.txt`; para testes, `Backend/requirements-dev.txt`.

Frontend: React 18 e Vite 5. Dentro de `frontend`, copie `.env.example` para `.env`, instale as dependências e execute `npm run dev`. A API permanece na porta 5000. Não adicione chaves secretas às variáveis `VITE_*`.

MySQL continua suportado: configure `DATABASE_URL`, crie o banco e rode `flask --app app db upgrade` dentro de `Backend`. Não use `prepare_demo.py` no MySQL. A revisão não migrou nem modificou um banco MySQL existente.

O cadastro normal usa código por e-mail. Sem SMTP, apenas `ENV=development` permite consultar o código no console local. Em produção, a ausência de SMTP retorna erro. Google Login depende do mesmo identificador de cliente no backend (`GOOGLE_CLIENT_ID`) e frontend (`VITE_GOOGLE_CLIENT_ID`).

Gemini fica como integração opcional de compatibilidade: instale `requirements-gemini.txt`, configure sua chave e `AI_PROVIDER=gemini`. O caminho OpenAI não exige o SDK Gemini. A revisão validou chamadas reais OpenAI; não validou Gemini ou Google Login com credenciais reais.

## Contratos e arquivos

São aceitos texto colado e formatos como TXT, PDF com texto, DOCX, RTF, ODT, PPTX, XLSX, CSV, JSON, XML e YAML. O upload é limitado a 16 MB; a análise aceita até 30 mil caracteres. PDFs de imagem precisam de OCR externo; arquivos `.doc` precisam ser convertidos. A leitura de DOCX inclui tabelas.

A API retorna `202` ao iniciar a análise. O navegador consulta o resultado; falha aparece como erro sem pontuação. O chat sobre contrato usa o texto completo salvo, respeitando a autorização do usuário.

## Limites do protótipo

- A base local contém apenas 24 trechos selecionados, sem atualização automática ou validação de vigência. As respostas podem conter erros.
- O score contratual é uma estimativa do modelo, não uma probabilidade validada nem um parecer profissional.
- O painel conta mensagens e identifica palavras de atenção; não mede prejuízos evitados ou sucesso jurídico.
- O explorador de documentos contém exemplos simulados e filtro por palavras. Os downloads são modelos fixos de demonstração. A integração externa Jusbrasil não foi validada.
- Nome e senha são salvos pelo servidor em Configurações. Troca de e-mail, foto, feedback, idioma e exclusão pela tela de Configurações ainda não têm fluxo completo.
- Perguntas e documentos são enviados ao provedor de IA configurado. As senhas usam hash; o código não implementa criptografia do conteúdo do banco.
- Antes de uso público, ainda é necessário tratar limites de requisições/OTP, recuperação de conta, fila persistente de tarefas, revogação de sessões, retenção de dados e revisão da base jurídica.

## Testes

```powershell
.\.venv\Scripts\python.exe -m pip install -r Backend\requirements-dev.txt
.\.venv\Scripts\python.exe -m pytest Backend\tests -q
```

Os testes locais usam banco SQLite isolado e respostas simuladas. As chamadas reais de apresentação foram testadas separadamente com entrada fictícia.

## Estrutura

- `Backend/router`: endpoints e permissões.
- `Backend/models` e `Backend/DAO`: dados e persistência.
- `Backend/services/llm_provider.py`: conexão central com os provedores.
- `Backend/services/ai_service.py`: regras de cada recurso de IA.
- `Backend/services/rag_service.py`: indexação e busca dos trechos.
- `frontend/src`: páginas e componentes.
- `CLI`: interface de terminal; execute `python app.py` nessa pasta.
- `docs`: documentação e exemplo fictício de contrato.

Licença MIT. Autores originais: Bernardo Duarte Marcelino e Yagor Vitor Silva dos Santos. Veja `LICENSE`.
