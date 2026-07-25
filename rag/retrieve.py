import argparse
import logging
from typing import List, Dict, Any

from embedding import EmbeddingModel
from vector_store import VectorStore

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def retrieve_similar_chunks(query: str, top_k: int = 5) -> List[Dict[str, Any]]:
    """
    Retrieve the top_k most similar chunks for a given query.

    Args:
        query: The user query string.
        top_k: Number of results to return.

    Returns:
        A list of dictionaries, each containing:
            - id: The database ID.
            - content: The text chunk.
            - metadata: The metadata dictionary.
            - similarity: The cosine similarity score.
    """
    # Generate embedding for the query
    embedding_model = EmbeddingModel()
    query_embedding = embedding_model.encode([query])[0]  # Shape (embedding_dim,)

    # Search the vector store
    vector_store = VectorStore()
    results = vector_store.search(query_embedding.tolist(), top_k=top_k)

    return results

def main():
    parser = argparse.ArgumentParser(description="Query the RAG vector store.")
    parser.add_argument(
        "--query",
        type=str,
        required=True,
        help="The query string to search for."
    )
    parser.add_argument(
        "--top-k",
        type=int,
        default=5,
        help="Number of top results to return (default: 5)."
    )
    args = parser.parse_args()

    logger.info(f"Running query: {args.query}")
    results = retrieve_similar_chunks(args.query, top_k=args.top_k)

    print(f"\nTop {len(results)} results for query: '{args.query}'\n")
    for i, res in enumerate(results, start=1):
        print(f"Result {i}:")
        print(f"  ID: {res['id']}")
        print(f"  Similarity: {res['similarity']:.4f}")
        print(f"  Content: {res['content'][:200]}...")  # Truncate for readability
        print(f"  Metadata: {res['metadata']}")
        print()

if __name__ == "__main__":
    main()