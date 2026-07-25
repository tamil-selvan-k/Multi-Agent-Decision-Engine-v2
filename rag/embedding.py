from sentence_transformers import SentenceTransformer
from typing import List, Union
import numpy as np
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EmbeddingModel:
    """
    A wrapper around SentenceTransformer for generating embeddings.
    Uses singleton pattern to avoid reloading the model multiple times.
    """
    _instance = None

    def __new__(cls, model_name: str = "BAAI/bge-large-en-v1.5"):
        if cls._instance is None:
            cls._instance = super(EmbeddingModel, cls).__new__(cls)
            cls._instance._model = None
            cls._instance.model_name = model_name
        return cls._instance

    def load_model(self):
        """Load the SentenceTransformer model if not already loaded."""
        if self._model is None:
            logger.info(f"Loading embedding model: {self.model_name}")
            self._model = SentenceTransformer(self.model_name)
        return self._model

    def encode(
        self,
        sentences: Union[str, List[str]],
        batch_size: int = 32,
        show_progress_bar: bool = False,
        convert_to_numpy: bool = True,
    ) -> np.ndarray:
        """
        Encode sentences into embeddings.

        Args:
            sentences: A single sentence or a list of sentences.
            batch_size: Batch size for encoding.
            show_progress_bar: Whether to show a progress bar.
            convert_to_numpy: Whether to return a numpy array.

        Returns:
            Numpy array of embeddings.
        """
        model = self.load_model()
        return model.encode(
            sentences,
            batch_size=batch_size,
            show_progress_bar=show_progress_bar,
            convert_to_numpy=convert_to_numpy
        )