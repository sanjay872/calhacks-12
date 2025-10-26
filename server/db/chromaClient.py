from dotenv import load_dotenv
from chromadb import Client
from chromadb.utils import embedding_functions
import os
import re

load_dotenv()
print("loaded!--------------")

openai_api_key = os.getenv("OPENAI_API_KEY")
if not openai_api_key:
    raise RuntimeError("⚠️ OPENAI_API_KEY is missing! Check .env or environment variables.")
embedding_func = embedding_functions.OpenAIEmbeddingFunction(
    api_key=openai_api_key,
    model_name="text-embedding-3-small"
)
chroma = Client()


def sanitize_collection_name(name: str) -> str:
    """
    Convert a company name into a valid ChromaDB collection name.
    Rules:
    - lowercase only
    - replace spaces and invalid chars with '_'
    - remove trailing underscores/dots
    """
    # Lowercase
    clean = name.lower()
    # Replace invalid chars (&, commas, spaces, etc.)
    clean = re.sub(r'[^a-z0-9._-]+', '_', clean)
    # Trim leading/trailing invalid chars
    clean = clean.strip('._-')
    return clean

def get_company_collection(company_name: str):
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY not found. Ensure .env is loaded before using chromaClient.")

    embedding_func = embedding_functions.OpenAIEmbeddingFunction(
        api_key=api_key,
        model_name="text-embedding-3-small"
    )

    # ✅ Sanitize the name safely
    safe_name = f"risk_docs_{sanitize_collection_name(company_name)}"

    collection = chroma.get_or_create_collection(
        name=safe_name,
        embedding_function=embedding_func
    )
    return collection

# storing collection within collection
def upsert_into_chroma(company, text, metadata):
    collection = get_company_collection(company)
    doc_id = f"{company}_{hash(text)}"
    collection.add(documents=[text], metadatas=[metadata], ids=[doc_id])
    return doc_id

def query_chroma(query_text, company, top_k=5, where=None):
    collection = get_company_collection(company)

    query_args = {
        "query_texts": [query_text],
        "n_results": top_k,
    }

    if where:
        query_args["where"] = where

    results = collection.query(**query_args)

    docs = [
        {
            "doc": d,
            "score": results["distances"][0][i],
            "metadata": results["metadatas"][0][i],
        }
        for i, d in enumerate(results["documents"][0])
    ]
    return docs
