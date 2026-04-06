from typing import Tuple

import faiss
import numpy as np


class FaissVectorStore:
    @staticmethod
    def create_index(embeddings: np.ndarray) -> faiss.IndexFlatIP:
        if embeddings.size == 0:
            raise ValueError("Embeddings are empty. Cannot create FAISS index.")

        dimension = embeddings.shape[1]
        index = faiss.IndexFlatIP(dimension)
        index.add(embeddings)
        return index

    @staticmethod
    def save_index(index: faiss.IndexFlatIP, index_path: str) -> None:
        faiss.write_index(index, index_path)

    @staticmethod
    def load_index(index_path: str):
        return faiss.read_index(index_path)

    @staticmethod
    def search(index, query_embedding: np.ndarray, top_k: int = 5) -> Tuple[np.ndarray, np.ndarray]:
        scores, indices = index.search(query_embedding, top_k)
        return scores[0], indices[0]
