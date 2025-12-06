import chromadb
import os
import google.generativeai as genai
from openai import OpenAI
from chromadb.utils import embedding_functions
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
        if cls._collection:
            return cls._collection

        try:
            # Inicializa cliente persistente
            cls._client = chromadb.PersistentClient(path=CHROMA_DATA_PATH)
            
            # Tenta usar função de embedding do Google ou OpenAI, senão usa default (all-MiniLM-L6-v2)
            # Para simplificar neste MVP, usamos o embedding default do Chroma 
            # (que baixa um modelo pequeno localmente) para evitar custos de API em cada indexação.
            # Em produção, idealmente usaria: embedding_functions.GoogleGenerativeAiEmbeddingFunction
            
            emb_fn = embedding_functions.DefaultEmbeddingFunction()
            
            cls._collection = cls._client.get_or_create_collection(
                name="legislacao_brasileira",
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
        if not collection: return

        # Chroma lida com tokenização e embedding automaticamente com a função default
        collection.upsert(
            ids=[doc_id],
            documents=[text],
            metadatas=[metadata]
        )

    @classmethod
    def search_context(cls, query: str, n_results=3) -> str:
        """Busca os trechos mais relevantes para a pergunta"""
        collection = cls.get_collection()
        if not collection: 
            return ""

        try:
            results = collection.query(
                query_texts=[query],
                n_results=n_results
            )
            
            # Formata o resultado para injetar no prompt
            context_str = ""
            if results['documents']:
                for i, doc in enumerate(results['documents'][0]):
                    meta = results['metadatas'][0][i]
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
        print(f"Erro ao indexar {filepath}: {e}")