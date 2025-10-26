from langgraph.graph import StateGraph, END
from datetime import datetime
import json
from urllib.parse import urlparse
import random

from utils.webScraper import get_company_data
from db.chromaClient import upsert_into_chroma, query_chroma
from utils.jsonConverter import call_llm_as_json

from dotenv import load_dotenv
load_dotenv()  # loads variables from .env into environment

class RiskState(dict):
    pass

def init_node(state: RiskState) -> RiskState:
    return state

def fetch_external_data_node(state: RiskState) -> RiskState:
    print(f"Fetching data for {state}")

    company = state["company_name"]

    findings = get_company_data(company)  # returns list[ {title,url,snippet} ]

    state["raw_findings"] = findings

    return state


def store_in_vector_db_node(state: dict) -> dict:
    company = state["company_name"]
    risk_docs = state["raw_findings"].get("risk", [])
    resilience_docs = state["raw_findings"].get("resilience", [])

    chroma_ids = []

    def store_category(docs, category):
        for item in docs:
            text_block = (
                f"Category: {category}\n"
                f"Company: {company}\n"
                f"Title: {item.get('title','')}\n"
                f"Snippet: {item.get('snippet','')}\n"
                f"URL: {item.get('url','')}\n"
            )
            doc_id = upsert_into_chroma(
                company=company,
                text=text_block,
                metadata={"url": item.get("url"), "category": category}
            )
            chroma_ids.append(doc_id)

    # Store both types
    store_category(risk_docs, "risk")
    store_category(resilience_docs, "resilience")

    state["chroma_ids"] = chroma_ids
    return state


def retrieve_relevant_context_node(state: dict) -> dict:
    """
    Retrieves an equal mix of risk and resilience evidence from Chroma for a company.
    Handles invalid inputs gracefully and prevents Ellipsis or empty strings.
    """

    company = state["company_name"].strip()
    print(f"🔍 Retrieving relevant context for {company}")

    # --- Construct safe query texts ---
    risk_query = f"{company} financial, regulatory, or security risks, lawsuits, or incidents"
    resilience_query = (
        f"{company} compliance certifications, partnerships, sustainability efforts, "
        f"security updates, awards, or recovery actions"
    )

    try:
        # Query risk context
        risk_chunks = query_chroma(
            query_text=risk_query,
            company=company,
            top_k=5,
            where={"category": "risk"}
        )
    except Exception as e:
        print(f"⚠️ Error retrieving risk chunks for {company}: {e}")
        risk_chunks = []

    try:
        # Query resilience context
        resilience_chunks = query_chroma(
            query_text=resilience_query,
            company=company,
            top_k=5,
            where={"category": "resilience"}
        )
    except Exception as e:
        print(f"⚠️ Error retrieving resilience chunks for {company}: {e}")
        resilience_chunks = []

    # --- Combine and shuffle ---
    combined = risk_chunks + resilience_chunks
    random.shuffle(combined)

    print(f"✅ Retrieved {len(risk_chunks)} risk chunks and {len(resilience_chunks)} resilience chunks for {company}")

    state["retrieved_context"] = combined
    return state


def llm_score_risk_node(state: dict) -> dict:
    company = state["company_name"]
    criticality = state.get("criticality", "Medium")
    context_chunks = state.get("retrieved_context", [])

    if not context_chunks:
        state["risk_report"] = {"error": "No context found for scoring"}
        return state

    evidence_text = ""
    for idx, chunk in enumerate(context_chunks):
        evidence_text += (
            f"[Source {idx+1}] {chunk['doc']}\n"
            f"URL: {chunk['metadata'].get('url')}\n\n"
        )

    prompt = f"""
        You are a senior vendor risk analyst helping our company decide whether to
        enter into a **business contract** with "{company}".

        Criticality of this relationship: {criticality}

        Evaluate the company based on the evidence below, focusing on how their
        financial stability, security posture, legal history, and reputation
        affect **our business risk** as a contracting partner.

        Your output must include:

        1. financial_risk (1-5)
        2. security_risk (1-5)
        3. reputation_risk (1-5)
        4. resilience_strength (1-5)  — how effectively the company mitigates or recovers from issues
        5. overall_recommendation: choose one of
        - "safe_to_contract"
        - "contract_with_protections"
        - "do_not_contract"
        6. rationale_with_citations: bullet points explaining your reasoning,
        referencing the sources provided.

        Decision logic:
        - "safe_to_contract" → average risk ≤ 2.5 AND resilience ≥ 4
        - "contract_with_protections" → average risk 2.6-3.8 OR resilience between 3-4
        - "do_not_contract" → average risk ≥ 3.9 OR resilience ≤ 2

        Use a business-centric lens: focus on what this means for forming a
        contract — e.g., payment reliability, regulatory exposure, data safety,
        and brand reputation impacts.

        Evidence:
        {evidence_text}
    """

    try:
        llm_output = call_llm_as_json(prompt)
        state["risk_report"] = {
            "company": company,
            "generated_at": datetime.utcnow().isoformat(),
            "assessment": llm_output,
        }
    except Exception as e:
        state["risk_report"] = {
            "error": f"Failed to generate LLM assessment: {str(e)}"
        }

    return state

TRUSTED_DOMAINS = [
    "reuters.com", "bloomberg.com", "bbc.com", "nytimes.com",
    "forbes.com", "techcrunch.com", "investor.gov", "sec.gov"
]

def verify_sources_node(state):
    raw_data = state.get("raw_findings", [])
    verified, unverified = [], []

    def process_items(items):
        for item in items:
            if isinstance(item, str):
                url = item
            elif isinstance(item, dict):
                url = item.get("url") or ""
            else:
                continue

            domain = urlparse(url).netloc.lower()
            trust_score = 0.9 if any(t in domain for t in TRUSTED_DOMAINS) else 0.4

            entry = item if isinstance(item, dict) else {"url": url}
            entry["trust_score"] = trust_score

            if trust_score >= 0.7:
                verified.append(entry)
            else:
                unverified.append(entry)

    # Handle both structures
    if isinstance(raw_data, dict):
        # Case: {"risk": [...], "resilience": [...]}
        for category in ["risk", "resilience"]:
            process_items(raw_data.get(category, []))
    elif isinstance(raw_data, list):
        # Case: single list of findings
        process_items(raw_data)
    else:
        print("⚠️ raw_findings has unexpected type:", type(raw_data))

    state["verified_findings"] = verified
    state["unverified_findings"] = unverified
    print(f"✅ Verified {len(verified)} | Unverified {len(unverified)}")
    return state

def riskAnalysisGraph(companyname, criticality):
    graph = StateGraph(dict)
    
    graph.add_node("init", init_node)
    graph.add_node("fetch_external_data", fetch_external_data_node)
    graph.add_node("store_in_vector_db", store_in_vector_db_node)
    graph.add_node("retrieve_relevant_context", retrieve_relevant_context_node)
    graph.add_node("llm_score_risk", llm_score_risk_node)
    graph.add_node("verify_sources", verify_sources_node)

    graph.add_edge("init", "fetch_external_data")
    graph.add_edge("fetch_external_data", "verify_sources")
    graph.add_edge("verify_sources", "store_in_vector_db")
    graph.add_edge("store_in_vector_db", "retrieve_relevant_context")
    graph.add_edge("retrieve_relevant_context", "llm_score_risk")
    graph.add_edge("llm_score_risk", END)

    graph.set_entry_point("init")

    app = graph.compile()

    # --- Initialize runtime state ---
    initial_state = RiskState({
        "company_name": companyname,
        "criticality": criticality
    })

    print("🚀 Starting graph with initial state:", initial_state)

    # --- Run it ---
    final_state = app.invoke(initial_state)

    print("✅ Graph completed. Final state:")
    print(json.dumps(final_state, indent=2))

    return final_state
