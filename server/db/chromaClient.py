from chromadb import Client
from chromadb.utils import embedding_functions
import os

openai_api_key = os.getenv("OPENAI_API_KEY")
embedding_func = embedding_functions.OpenAIEmbeddingFunction(
    api_key=openai_api_key,
    model_name="text-embedding-3-small"
)
chroma = Client()

def get_company_collection(company_name: str):
    collection_name = f"risk_docs_{company_name.lower().replace(' ', '_')}"
    collection = chroma.get_or_create_collection(
        name=collection_name,
        embedding_function=embedding_func
    )
    return collection

# storing collection within collection
def upsert_into_chroma(company, text, metadata):
    collection = get_company_collection(company)
    doc_id = f"{company}_{hash(text)}"
    collection.add(documents=[text], metadatas=[metadata], ids=[doc_id])
    return doc_id

def query_chroma(query_text, company, top_k=5):
    collection = get_company_collection(company)
    results = collection.query(query_texts=[query_text], n_results=top_k)
    docs = [
        {"doc": d, "score": results["distances"][0][i], "metadata": results["metadatas"][0][i]}
        for i, d in enumerate(results["documents"][0])
    ]
    return docs