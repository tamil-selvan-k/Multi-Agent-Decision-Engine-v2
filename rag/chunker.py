from typing import List
from langchain_text_splitters import RecursiveCharacterTextSplitter
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def chunk_texts(
    texts: List[str],
    chunk_size: int = 700,
    chunk_overlap: int = 100
) -> List[str]:
    """
    Split a list of texts into chunks using RecursiveCharacterTextSplitter.

    Args:
        texts: List of text strings to be chunked.
        chunk_size: Maximum size of each chunk.
        chunk_overlap: Number of overlapping characters between chunks.

    Returns:
        List of text chunks.
    """
    if not texts:
        return []

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        length_function=len,
        is_separator_regex=False,
    )

    chunked_texts = []

    for text in texts:
        if text and text.strip():
            chunks = text_splitter.split_text(text)
            chunked_texts.extend(chunks)

    logger.info(
        f"Split {len(texts)} texts into {len(chunked_texts)} chunks"
    )

    return chunked_texts