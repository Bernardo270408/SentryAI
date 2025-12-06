# Script para rodar manualmente e popular o banco vetorial
import os
from services.rag_service import ingest_text_file

def main():
    print("--- INICIANDO INGESTÃO DE LEIS PARA RAG ---")
    
    laws_dir = os.path.join(os.path.dirname(__file__), "data/laws_txt")
    
    if not os.path.exists(laws_dir):
        os.makedirs(laws_dir)
        print(f"Pasta criada: {laws_dir}")
        print("Por favor, adicione arquivos .txt com as leis nesta pasta e rode o script novamente.")
        return

    files = [f for f in os.listdir(laws_dir) if f.endswith('.txt')]
    
    if not files:
        print("Nenhum arquivo .txt encontrado em data/laws_txt")
        return

    for filename in files:
        filepath = os.path.join(laws_dir, filename)
        print(f"Processando {filename}...")
        ingest_text_file(filepath, source_name=filename)

    print("--- INGESTÃO CONCLUÍDA ---")

if __name__ == "__main__":
    main()