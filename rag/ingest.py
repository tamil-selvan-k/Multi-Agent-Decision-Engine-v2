import logging
from typing import List, Dict, Any
from excel_loader import load_excel_files
from text_converter import convert_dataframe_to_texts
from chunker import chunk_texts
from embedding import EmbeddingModel
from vector_store import VectorStore
from config import EXCEL_DATA_DIR, CHUNK_SIZE, CHUNK_OVERLAP

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main():
    """
    Main ingestion pipeline:
    1. Load Excel files from EXCEL_DATA_DIR
    2. Convert each row to natural language text
    3. Split texts into chunks
    4. Generate embeddings for chunks
    5. Store chunks and embeddings in PostgreSQL vector store
    """
    logger.info("Starting RAG ingestion pipeline")

    # Step 1: Load Excel files
    logger.info(f"Loading Excel files from: {EXCEL_DATA_DIR}")
    excel_data = load_excel_files(EXCEL_DATA_DIR)
    if not excel_data:
        logger.error("No Excel files found. Exiting.")
        return

    # Step 2: Convert rows to text and collect metadata
    all_texts: List[str] = []
    all_metadata: List[Dict[str, Any]] = []  # metadata per original row (before chunking)

    for file_name, sheet_name, df in excel_data:
        logger.info(f"Processing {file_name} - Sheet: {sheet_name}")
        texts = convert_dataframe_to_texts(df)
        for i, text in enumerate(texts):
            if not text.strip():
                continue
            all_texts.append(text)
            all_metadata.append({
                "source_file": file_name,
                "sheet_name": sheet_name,
                "row_index": i
            })

    if not all_texts:
        logger.error("No text extracted from Excel files. Exiting.")
        return

    logger.info(f"Total rows converted to text: {len(all_texts)}")

    # Step 3: Chunk the texts while preserving metadata
    logger.info(f"Chunking texts with chunk_size={CHUNK_SIZE}, chunk_overlap={CHUNK_OVERLAP}")
    chunked_texts: List[str] = []
    chunk_metadata: List[Dict[str, Any]] = []
    for idx, text in enumerate(all_texts):
        chunks = chunk_texts([text], chunk_size=CHUNK_SIZE, chunk_overlap=CHUNK_OVERLAP)
        chunked_texts.extend(chunks)
        # Duplicate metadata for each chunk from the same original text
        chunk_metadata.extend([all_metadata[idx]] * len(chunks))

    logger.info(f"Total chunks generated: {len(chunked_texts)}")

    # Step 4: Generate embeddings
    logger.info("Generating embeddings for chunks")
    embedding_model = EmbeddingModel()
    embeddings = embedding_model.encode(chunked_texts, show_progress_bar=True)
    logger.info(f"Generated embeddings shape: {embeddings.shape}")

    # Step 5: Store in vector store
    logger.info("Storing chunks and embeddings in vector store")
    vector_store = VectorStore()
    vector_store.add_documents(
        texts=chunked_texts,
        embeddings=embeddings.tolist(),  # Convert numpy array to list of lists
        metadatas=chunk_metadata
    )

    logger.info(f"Ingestion complete. Total documents in store: {vector_store.get_document_count()}")

if __name__ == "__main__":
    main()