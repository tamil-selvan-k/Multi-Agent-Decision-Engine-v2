import os
import logging
from typing import List, Tuple
import pandas as pd

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

SUPPORTED_EXTENSIONS = {'.xlsx', '.xls', '.csv'}

def load_excel_files(directory: str) -> List[Tuple[str, str, pd.DataFrame]]:
    """
    Load all supported spreadsheet/CSV files from a directory (recursively) and read every sheet/file.

    Args:
        directory: Path to the directory containing files.

    Returns:
        A list of tuples, each containing:
            (file_name, sheet_name_or_file, DataFrame)
        For CSV files, sheet_name_or_file is the filename (without extension) to keep consistency.

    Raises:
        ValueError: If the directory does not exist.
    """
    if not os.path.isdir(directory):
        raise ValueError(f"Directory does not exist: {directory}")

    # Walk directory recursively
    files_to_process = []
    for root, dirs, files in os.walk(directory):
        for file in files:
            ext = os.path.splitext(file)[1].lower()
            if ext in SUPPORTED_EXTENSIONS:
                files_to_process.append(os.path.join(root, file))

    if not files_to_process:
        logger.warning(f"No supported files found in {directory}")
        return []

    # Print summary before loading
    print(f"\n=== File Loading Summary ===")
    print(f"Directory: {directory}")
    print(f"Found {len(files_to_process)} supported file(s):")
    total_rows = 0
    for file_path in files_to_process:
        file_name = os.path.basename(file_path)
        ext = os.path.splitext(file_name)[1].lower()
        try:
            if ext in ('.xlsx', '.xls'):
                # Read Excel to get sheet names and row counts
                excel_data = pd.read_excel(file_path, sheet_name=None)  # dict of sheet_name: DataFrame
                sheet_count = len(excel_data)
                rows_in_file = sum(df.shape[0] for df in excel_data.values())
                total_rows += rows_in_file
                print(f"  - {file_name} (.xlsx) | Sheets: {sheet_count} | Rows: {rows_in_file}")
            else:  # .csv
                df = pd.read_csv(file_path)
                rows_in_file = df.shape[0]
                total_rows += rows_in_file
                print(f"  - {file_name} (.csv) | Sheets: 1 (CSV) | Rows: {rows_in_file}")
        except Exception as e:
            print(f"  - {file_name} ({ext}) | ERROR reading file: {e}")
    print(f"Total rows across all files: {total_rows}")
    print("=" * 30 + "\n")

    # Actually load the data into the expected tuple list
    excel_files: List[Tuple[str, str, pd.DataFrame]] = []
    for file_path in files_to_process:
        file_name = os.path.basename(file_path)
        ext = os.path.splitext(file_name)[1].lower()
        try:
            if ext in ('.xlsx', '.xls'):
                excel_data = pd.read_excel(file_path, sheet_name=None)
                for sheet_name, df in excel_data.items():
                    if df.empty:
                        logger.warning(f"Sheet '{sheet_name}' in {file_name} is empty. Skipping.")
                        continue
                    excel_files.append((file_name, sheet_name, df))
                    logger.info(f"Loaded sheet '{sheet_name}' from {file_name} with {df.shape[0]} rows and {df.shape[1]} columns")
            else:  # .csv
                df = pd.read_csv(file_path)
                if df.empty:
                    logger.warning(f"CSV file {file_name} is empty. Skipping.")
                    continue
                # For CSV, treat the file name as the "sheet" identifier to keep tuple structure
                excel_files.append((file_name, file_name, df))
                logger.info(f"Loaded CSV file {file_name} with {df.shape[0]} rows and {df.shape[1]} columns")
        except Exception as e:
            logger.error(f"Failed to read {file_path}: {e}")
            continue

    if not excel_files:
        logger.warning(f"No data loaded from {directory}")

    return excel_files