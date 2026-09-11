try:
    import chromadb
    from chromadb.utils import embedding_functions
except ImportError:
    chromadb = None
import os
from pathlib import Path
from dotenv import load_dotenv
load_dotenv(Path(__file__).resolve().parents[2] / ".env")
import logging

logger = logging.getLogger(__name__)

# Configuração do Banco Vetorial (Persistente em disco)
CHROMA_DATA_PATH = os.path.join(os.path.dirname(__file__), "../data/chroma_db")

class RAGService:
    _client = None
    _collection = None

    @classmethod
    def get_collection(cls):
        """Singleton para conexão com ChromaDB"""
        if chromadb is None or os.getenv("RAG_ENABLED", "true").lower() != "true":
            return None
        if cls._collection is not None:
            return cls._collection

        try:
            # Inicializa cliente persistente
            cls._client = chromadb.PersistentClient(path=CHROMA_DATA_PATH)

            # OpenAI é o padrão; a opção local preserva compatibilidade com a coleção antiga.
            embedding_model = os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small")
            if os.getenv("RAG_EMBEDDINGS_PROVIDER", "openai") == "openai":
                key = os.getenv("OPENAI_API_KEY") or os.getenv("OPENAI_TOKEN")
                if not key:
                    raise ValueError("Configure OPENAI_API_KEY para os embeddings.")
                emb_fn = embedding_functions.OpenAIEmbeddingFunction(api_key=key, model_name=embedding_model)
                collection_name = "legislacao_" + embedding_model.replace("-", "_")
            else:
                emb_fn = embedding_functions.DefaultEmbeddingFunction()
                collection_name = "legislacao_brasileira"

            cls._collection = cls._client.get_or_create_collection(
                name=collection_name,
                embedding_function=emb_fn
            )
            return cls._collection
        except Exception as e:
            logger.error(f"Falha ao iniciar ChromaDB: {e}")
            return None

    @classmethod
    def add_document(cls, doc_id: str, text: str, metadata: dict):
        """Adiciona um trecho de lei/documento ao banco"""
        collection = cls.get_collection()
        if collection is None:
            raise RuntimeError("RAG indisponível: instale requirements-rag.txt e habilite RAG_ENABLED.")

        # Chroma vetoriza os trechos com o provedor configurado.
        collection.upsert(
            ids=[doc_id],
            documents=[text],
            metadatas=[metadata]
        )

    @classmethod
    def search_context(cls, query: str, n_results=3) -> str:
        """Busca os trechos mais relevantes para a pergunta"""
        collection = cls.get_collection()
        if collection is None:
            return ""

        try:
            count = collection.count()
            if count == 0:
                return ""
            results = collection.query(
                query_texts=[query],
                n_results=min(n_results, count)
            )

            # Formata o resultado para injetar no prompt
            context_str = ""
            if results['documents']:
                for i, doc in enumerate(results['documents'][0]):
                    meta = results['metadatas'][0][i] or {}
                    source = meta.get('source', 'Legislação')
                    context_str += f"\n--- FONTE: {source} ---\n{doc}\n"

            return context_str
        except Exception as e:
            logger.error(f"Erro na busca RAG: {e}")
            return ""

# Script utilitário para popular o banco (pode ser chamado via CLI futuramente)
def ingest_text_file(filepath, source_name):
    """Lê um arquivo de texto (ex: CLT.txt) e indexa em chunks"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            text = f.read()

        # Split simples por parágrafos ou tamanho fixo
        chunks = text.split('\n\n')
        for idx, chunk in enumerate(chunks):
            if len(chunk.strip()) > 50: # Ignora linhas muito curtas
                RAGService.add_document(
                    doc_id=f"{source_name}_{idx}",
                    text=chunk,
                    metadata={"source": source_name}
                )
        print(f"Indexado: {source_name} ({len(chunks)} chunks)")
    except Exception as e:
        raise RuntimeError(f"Erro ao indexar {filepath}") from e
