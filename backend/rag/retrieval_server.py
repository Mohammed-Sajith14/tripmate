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
    parser = argparse.ArgumentParser(
        description="Run persistent FAISS retrieval server for TripMate RAG."
    )
    parser.add_argument("--index", required=True, help="Path to FAISS index")
    parser.add_argument("--metadata", required=True, help="Path to metadata JSON")
    parser.add_argument(
        "--model",
        default="all-MiniLM-L6-v2",
        help="Embedding model name (default: all-MiniLM-L6-v2)",
    )
    parser.add_argument("--top-k", type=int, default=5, help="Default top-k results")

    args = parser.parse_args()

    if args.top_k < 1:
        raise ValueError("top-k must be greater than 0")

    metadata = load_metadata(args.metadata)
    index = FaissVectorStore.load_index(args.index)
    embedding_service = EmbeddingService(model_name=args.model)

    print(json.dumps({"type": "ready"}, ensure_ascii=True), flush=True)

    for line in sys.stdin:
        raw = line.strip()
        if not raw:
            continue

        try:
            payload = json.loads(raw)
            request_id = payload.get("id")
            query = str(payload.get("query", "")).strip()
            top_k = int(payload.get("top_k", args.top_k))

            if not query:
                response = {"id": request_id, "results": []}
            else:
                if top_k < 1:
                    top_k = 1

                results = retrieve_documents(
                    query=query,
                    metadata=metadata,
                    index=index,
                    embedding_service=embedding_service,
                    top_k=top_k,
                )
                response = {"id": request_id, "results": results}
        except Exception as error:
            response = {
                "id": payload.get("id") if isinstance(payload, dict) else None,
                "error": str(error),
            }

        print(json.dumps(response, ensure_ascii=True), flush=True)


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(str(error), file=sys.stderr)
        sys.exit(1)