import logging
import pandas as pd
from typing import List

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def convert_row_to_text(row: pd.Series) -> str:
    """
    Convert a single row of a DataFrame into a natural language string without hardcoding column names.

    Args:
        row: A pandas Series representing a row of data.

    Returns:
        A natural language string describing the row.
    """
    parts = []
    for col in row.index:
        value = row[col]
        # Skip NaN/None values
        if pd.isna(value):
            continue
        # Create a readable column name by replacing underscores and title casing
        readable_col = col.replace('_', ' ').title()
        # Format numeric values for readability
        if isinstance(value, (int, float)):
            if isinstance(value, float):
                # Format float with 2 decimal places and comma as thousand separator
                formatted_value = f"{value:,.2f}"
            else:
                # Format integer with comma as thousand separator
                formatted_value = f"{value:,}"
        else:
            formatted_value = str(value)
        parts.append(f"{readable_col} is {formatted_value}")

    if not parts:
        # If all values are NaN, return a placeholder
        return "Record contains no data"

    # Join parts with commas and add a prefix for readability
    return f"The record has the following attributes: {', '.join(parts)}"

def convert_dataframe_to_texts(df: pd.DataFrame) -> List[str]:
    """
    Convert all rows of a DataFrame into a list of natural language strings.

    Args:
        df: A pandas DataFrame.

    Returns:
        A list of strings, each representing a row in natural language.
    """
    if df.empty:
        logger.warning("DataFrame is empty")
        return []

    texts = []
    for _, row in df.iterrows():
        text = convert_row_to_text(row)
        texts.append(text)
        if len(texts) == 1:  # Log first conversion for debugging
            logger.debug(f"Example conversion: {text}")

    logger.info(f"Converted {len(texts)} rows to text")
    return texts