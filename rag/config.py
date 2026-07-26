import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Database configuration
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://neondb_owner:npg_uH2lBJ4aUMCm@ep-muddy-mode-aim0bumy-pooler.c-4.us-east-1.aws.neon.tech/multi-agent?sslmode=require&channel_binding=require"
)

# Embedding model configuration
EMBEDDING_MODEL_NAME = os.getenv("EMBEDDING_MODEL_NAME", "BAAI/bge-large-en-v1.5")

# Text splitting configuration
CHUNK_SIZE = int(os.getenv("CHUNK_SIZE", 700))
CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", 100))

# Excel data directory
EXCEL_DATA_DIR = os.getenv("EXCEL_DATA_DIR", r"D:\documents1\enterprise_database.zip\enterprise_database")

# Table name for vector store
TABLE_NAME = os.getenv("TABLE_NAME", "embeddings")