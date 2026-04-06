from typing import Any, Dict, List

from embedding_service import EmbeddingService
from vector_store import FaissVectorStore


def retrieve_documents(
    query: str,
    metadata: List[Dict[str, Any]],
    index,
    embedding_service: EmbeddingService,
    top_k: int = 5,
) -> List[Dict[str, Any]]:
    query_embedding = embedding_service.embed_query(query)
    scores, indices = FaissVectorStore.search(index, query_embedding, top_k)

    results: List[Dict[str, Any]] = []

    for score, idx in zip(scores.tolist(), indices.tolist()):
        if idx < 0 or idx >= len(metadata):
            continue

        item = dict(metadata[idx])
        item["score"] = float(score)
        results.append(item)

    return results
