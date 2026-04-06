import argparse
import json
import os
import sys
from typing import Any, Dict, List

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

from embedding_service import EmbeddingService
from vector_store import FaissVectorStore


def load_documents(input_path: str) -> List[Dict[str, Any]]:
    with open(input_path, "r", encoding="utf-8") as file:
        data = json.load(file)

    if not isinstance(data, list):
        raise ValueError("Input document file must contain a JSON array.")

    return data


def main() -> None:
    parser = argparse.ArgumentParser(description="Build FAISS index from trip documents.")
    parser.add_argument("--input", required=True, help="Path to input trip_documents.json")
    parser.add_argument("--index", required=True, help="Output path for FAISS index file")
    parser.add_argument("--metadata", required=True, help="Output path for metadata JSON file")
    parser.add_argument(
        "--model",
        default="all-MiniLM-L6-v2",
        help="Embedding model name (default: all-MiniLM-L6-v2)",
    )

    args = parser.parse_args()

    documents = load_documents(args.input)
    if not documents:
        raise ValueError("No trip documents found in the input file.")

    texts = [str(document.get("content", "")) for document in documents]

    embedding_service = EmbeddingService(model_name=args.model)
    embeddings = embedding_service.embed_documents(texts)

    index = FaissVectorStore.create_index(embeddings)

    os.makedirs(os.path.dirname(args.index), exist_ok=True)
    os.makedirs(os.path.dirname(args.metadata), exist_ok=True)

    FaissVectorStore.save_index(index, args.index)

    with open(args.metadata, "w", encoding="utf-8") as file:
        json.dump(documents, file, indent=2, ensure_ascii=True)

    print(
        json.dumps(
            {
                "indexed_documents": len(documents),
                "index_path": args.index,
                "metadata_path": args.metadata,
            }
        )
    )


if __name__ == "__main__":
    main()
