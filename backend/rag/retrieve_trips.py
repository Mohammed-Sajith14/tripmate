import argparse
import json
import os
import sys
from typing import Any, Dict, List

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

from embedding_service import EmbeddingService
from retrieval import retrieve_documents
from vector_store import FaissVectorStore


def load_metadata(path: str) -> List[Dict[str, Any]]:
    with open(path, "r", encoding="utf-8") as file:
        data = json.load(file)

    if not isinstance(data, list):
        raise ValueError("Metadata file must contain a JSON array.")

    return data


def main() -> None:
    parser = argparse.ArgumentParser(description="Retrieve relevant trips from FAISS index.")
    parser.add_argument("--query", required=True, help="User query")
    parser.add_argument("--index", required=True, help="Path to FAISS index")
    parser.add_argument("--metadata", required=True, help="Path to metadata JSON")
    parser.add_argument("--top-k", type=int, default=5, help="Number of results to retrieve")
    parser.add_argument(
        "--model",
        default="all-MiniLM-L6-v2",
        help="Embedding model name (default: all-MiniLM-L6-v2)",
    )

    args = parser.parse_args()

    if args.top_k < 1:
        raise ValueError("top-k must be greater than 0")

    metadata = load_metadata(args.metadata)
    index = FaissVectorStore.load_index(args.index)
    embedding_service = EmbeddingService(model_name=args.model)

    results = retrieve_documents(
        query=args.query,
        metadata=metadata,
        index=index,
        embedding_service=embedding_service,
        top_k=args.top_k,
    )

    print(json.dumps({"results": results}, ensure_ascii=True))


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(str(error), file=sys.stderr)
        sys.exit(1)
