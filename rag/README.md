# RAG Pipeline for Excel Data

This project implements a Retrieval-Augmented Generation (RAG) pipeline for Excel data. It reads Excel files, converts each row into natural language text, chunks the text, generates embeddings using the BAAI/bge-large-en-v1.5 model, and stores the embeddings in a PostgreSQL database with the pgvector extension.

## Project Structure

```
rag/
├── excel_loader.py       # Loads Excel files and reads each sheet
├── text_converter.py     # Converts DataFrame rows to natural language text
├── chunker.py            # Splits text into chunks using RecursiveCharacterTextSplitter
├── embedding.py          # Wrapper for SentenceTransformer embeddings
├── vector_store.py       # Interface to PostgreSQL pgvector store
├── ingest.py             # Main script to run the ingestion pipeline
├── retrieve.py           # Script to query the vector store
├── config.py             # Configuration (loaded from .env)
├── .env                  # Environment variables (not committed)
├── requirements.txt      # Python dependencies
└── README.md             # This file
```

## Setup

1.  Clone the repository.
2.  Create a virtual environment and activate it:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```
3.  Install the dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Copy `.env.example` to `.env` and fill in the required values:
    ```bash
    cp .env.example .env
    ```
    Edit `.env` to set:
    - `DATABASE_URL`: Your PostgreSQL connection string (should include `sslmode=require` and `channel_binding=require` for Neon.tech)
    - `EMBEDDING_MODEL_NAME`: The SentenceTransformer model to use (default: `BAAI/bge-large-en-v1.5`)
    - `CHUNK_SIZE`: Chunk size for text splitting (default: 700)
    - `CHUNK_OVERLAP`: Chunk overlap for text splitting (default: 100)
    - `EXCEL_DATA_DIR`: Path to the directory containing Excel files (default: `D:\documents1\enterprise_database.zip\enterprise_database`)

## Usage

### Ingestion

Run the ingestion pipeline to process Excel files and populate the vector store:

```bash
python ingest.py
```

This will:
1. Load all Excel files from the directory specified in `EXCEL_DATA_DIR`.
2. Convert each row to a natural language description.
3. Split the text into chunks.
4. Generate embeddings for each chunk.
5. Store the chunks, embeddings, and metadata in the PostgreSQL table.

### Retrieval

To query the vector store, use the `retrieve.py` script. Example:

```bash
python retrieve.py --query "What is the total sales?" --top-k 5
```

You can also import the functions in your own code:

```python
from retrieve import retrieve_similar_chunks

results = retrieve_similar_chunks("Your question here", top_k=5)
for res in results:
    print(f"Score: {res['similarity']:.4f}")
    print(f"Text: {res['content']}")
    print(f"Metadata: {res['metadata']}")
    print("---")
```

## Notes

- The embedding model used (BAAI/bge-large-en-v1.5) produces 1024-dimensional vectors.
- The `vector_store.py` script creates the table if it does not exist.
- Ensure that the PostgreSQL database has the `pgvector` extension installed. On Neon.tech, you can enable it in the console or by running `CREATE EXTENSION IF NOT EXISTS vector;` in your database.

## License

This project is licensed under the MIT License.