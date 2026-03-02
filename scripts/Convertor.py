import pandas as pd
import numpy as np
import json
import os

# Configuration
MARKUP_PERCENTAGE = 10  # Default markup percentage

def convert_csv_to_json(input_file="data-2.csv", output_file="catalog.json", markup=MARKUP_PERCENTAGE):
    """
    Convert CSV file to JSON format with specified markup.
    
    Args:
        input_file: Path to input CSV file
        output_file: Path to output JSON file
        markup: Markup percentage to apply to prices
    """
    # Read CSV file with proper encoding and separator
    df = pd.read_csv(
        input_file,
        sep=";",
        encoding="utf-8",
        skipinitialspace=True
    )
    
    # Clean column names by stripping whitespace
    df.columns = df.columns.str.strip()
    
    # Print column names for debugging
    print("Available columns:", df.columns.tolist())
    
    # Select only required columns (SKU and Price from data-2.csv)
    df = df[["SKU", "Price"]]
    
    # Clean price data and apply markup
    df["Price"] = df["Price"].str.replace(",", ".").str.strip()
    df["Price"] = pd.to_numeric(df["Price"], errors="coerce")
    df["Price"] = df["Price"] * (1 + markup/100)
    
    # Rename columns to match expected output format
    df = df.rename(columns={"SKU": "Опис матеріалу", "Price": "Ціна"})
    
    # Filter out products with invalid prices (NaN, None, or non-finite values)
    df = df.dropna(subset=["Ціна"])  # Remove rows where price is NaN
    df = df[df["Ціна"].notna()]  # Additional check for any remaining NaN
    df = df[df["Ціна"].apply(lambda x: pd.notna(x) and np.isfinite(x))]  # Ensure finite values
    
    # Convert to JSON format
    products = df.to_dict(orient="records")
    
    # Clean up any remaining NaN/Inf values in the records (safety check)
    for product in products:
        price = product.get("Ціна")
        if price is not None and (pd.isna(price) or not np.isfinite(price)):
            # Remove products with invalid prices
            product["Ціна"] = None
    
    # Filter out any products with None or invalid prices (final safety check)
    products = [p for p in products if p.get("Ціна") is not None and np.isfinite(p.get("Ціна"))]
    
    # Write to JSON file
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump({"products": products}, f, ensure_ascii=False, indent=2)
    
    print(f"Converted {len(products)} products to {output_file} with {markup}% markup")

if __name__ == "__main__":
    # Allow custom markup from environment variable
    markup = float(os.getenv("PRODUCT_MARKUP", MARKUP_PERCENTAGE))
    convert_csv_to_json(markup=markup)