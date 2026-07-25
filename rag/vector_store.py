from typing import List, Dict, Any, Optional
import json
import logging
from datetime import datetime

from sqlalchemy import (
    create_engine,
    Column,
    Integer,
    Text,
    DateTime,
    text,
)
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy import select

from pgvector.sqlalchemy import Vector

from config import DATABASE_URL, TABLE_NAME

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

Base = declarative_base()

class DocumentEmbedding(Base):
    """
    SQLAlchemy model for storing document embeddings with pgvector.
    """
    __tablename__ = TABLE_NAME

    id = Column(Integer, primary_key=True, autoincrement=True)
    content = Column(Text, nullable=False)
    embedding = Column(Vector(1024), nullable=False)  # BAAI/bge-large-en-v1.5 outputs 1024-dim vectors
    metadata_ = Column(Text, nullable=False)  # Store metadata as JSON string
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

class VectorStore:
    """
    Wrapper for PostgreSQL vector store using pgvector.
    """
    def __init__(self, connection_string: Optional[str] = None):
        """
        Initialize the vector store.

        Args:
            connection_string: Database URL. If None, uses DATABASE_URL from config.
        """
        self.connection_string = connection_string or DATABASE_URL
        self.engine = create_engine(self.connection_string)
        self.Session = sessionmaker(bind=self.engine)
        self.create_table_if_not_exists()
        # Ensure the vector extension is installed
        with self.engine.connect() as conn:
            conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
            conn.commit()

    def create_table_if_not_exists(self):
        """
        Create the table if it does not exist.
        """
        try:
            Base.metadata.create_all(self.engine)
            logger.info(f"Ensured table '{TABLE_NAME}' exists")
        except Exception as e:
            logger.error(f"Failed to create table: {e}")
            raise

    def add_documents(
        self,
        texts: List[str],
        embeddings: List[List[float]],
        metadatas: List[Dict[str, Any]]
    ) -> None:
        """
        Add documents and their embeddings to the vector store.

        Args:
            texts: List of text chunks.
            embeddings: List of embedding vectors (list of floats).
            metadatas: List of metadata dictionaries.
        """
        if len(texts) != len(embeddings) or len(texts) != len(metadatas):
            raise ValueError("Lengths of texts, embeddings, and metadatas must match")

        session = self.Session()
        try:
            for text, embedding, metadata in zip(texts, embeddings, metadatas):
                # Convert metadata dict to JSON string for storage
                metadata_json = json.dumps(metadata)
                doc = DocumentEmbedding(
                    content=text,
                    embedding=embedding,  # SQLAlchemy + pgvector will handle list of floats
                    metadata_=metadata_json
                )
                session.add(doc)
            session.commit()
            logger.info(f"Added {len(texts)} documents to the vector store")
        except Exception as e:
            session.rollback()
            logger.error(f"Failed to add documents: {e}")
            raise
        finally:
            session.close()

    def search(
        self,
        query_embedding: List[float],
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Perform vector similarity search.

        Args:
            query_embedding: The query vector as a list of floats.
            top_k: Number of results to return.

        Returns:
            List of dictionaries with keys: id, content, metadata, similarity.
        """
        session = self.Session()
        try:
            # Use the L2 distance (or inner product) - pgvector supports both.
            # We'll use Euclidean distance (L2) for similarity search.
            # Note: For cosine similarity, you can use 1 - (dot product) but we'll use L2 for simplicity.
            # Actually, we want cosine similarity; we can use the vector cosine_ops if we create the index accordingly.
            # For simplicity, we'll use the built-in vector cosine distance.
            # The vector type supports custom operators; we'll use the `<=>` operator for cosine distance.
            # However, SQLAlchemy + pgvector provides the `.cosine_distance` method.

            # We'll order by cosine_distance ascending (smaller distance = more similar)
            from sqlalchemy import select
            from sqlalchemy.sql import func

            stmt = select(
                DocumentEmbedding.id,
                DocumentEmbedding.content,
                DocumentEmbedding.metadata_,
                (1 - DocumentEmbedding.embedding.cosine_distance(query_embedding)).label('similarity')
            ).order_by(
                DocumentEmbedding.embedding.cosine_distance(query_embedding)
            ).limit(top_k)

            results = session.execute(stmt).fetchall()

            # Convert to list of dicts
            output = []
            for row in results:
                doc_id, content, metadata_json, similarity = row
                metadata = json.loads(metadata_json) if metadata_json else {}
                output.append({
                    "id": doc_id,
                    "content": content,
                    "metadata": metadata,
                    "similarity": float(similarity)
                })
            return output
        except Exception as e:
            logger.error(f"Search failed: {e}")
            raise
        finally:
            session.close()

    def get_document_count(self) -> int:
        """
        Get the total number of documents in the store.

        Returns:
            Integer count.
        """
        session = self.Session()
        try:
            return session.query(DocumentEmbedding).count()
        except Exception as e:
            logger.error(f"Failed to get document count: {e}")
            return 0
        finally:
            session.close()