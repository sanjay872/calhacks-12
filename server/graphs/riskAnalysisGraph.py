from langgraph.graph import StateGraph, END
from datetime import datetime
from chromadb import Client
from chromadb.config import Settings
from chromadb.utils import embedding_functions
import json
from openai import OpenAI
from urllib.parse import urlparse

from utils.webScraper import get_company_data
from db.chromaClient import upsert_into_chroma, query_chroma
from utils.jsonConverter import call_llm_as_json

class RiskState(dict):
    pass

def init_node(state: RiskState) -> RiskState:
    return state


def fetch_external_data_node(state: RiskState) -> RiskState:
    print(f"Fetching data for {state}")

    company = state["company_name"]
    criticality = state["criticality"]
    

    findings = get_company_data(company,criticality)  # returns list[ {title,url,snippet} ]

    state["raw_findings"] = findings

    return state


def store_in_vector_db_node(state: RiskState) -> RiskState:
    company = state["company_name"]
    findings = state["raw_findings"]

    cleaned_docs = []
    chroma_ids = []

    for item in findings:
        # build a clean text block we can embed
        text_block = (
            f"Company: {company}\n"
            f"Title: {item.get('title','')}\n"
            f"Snippet: {item.get('snippet','')}\n"
            f"URL: {item.get('url','')}\n"
        )
        cleaned_docs.append({
            "text": text_block,
            "source_url": item.get("url"),
        })

        # store in Chroma
        doc_id = upsert_into_chroma(
            company=company,
            text=text_block,
            metadata={"url": item.get("url")}
        )
        chroma_ids.append(doc_id)

    state["clean_docs"] = cleaned_docs
    state["chroma_ids"] = chroma_ids
    return state


def retrieve_relevant_context_node(state: RiskState) -> RiskState:
    company = state["company_name"]

    retrieved = query_chroma(
        query_text=f"risk assessment for {company}",
        company=company,
        top_k=8,
    )
    # `retrieved` should look like list of {doc, score, metadata}

    state["retrieved_context"] = retrieved
    return state


def llm_score_risk_node(state: RiskState) -> RiskState:
    company = state["company_name"]
    criticality = state.get("criticality", "MEDIUM")
    context_chunks = state["retrieved_context"]

    # Combine context into a single prompt block
    evidence_text = ""
    for idx, chunk in enumerate(context_chunks):
        evidence_text += (
            f"[Source {idx+1}] {chunk['doc']}\n"
            f"URL: {chunk['metadata'].get('url')}\n\n"
        )
    
    high_trust = len(state["verified_findings"])
    low_trust = len(state["unverified_findings"])
    confidence_score = round(high_trust / max(1, (high_trust + low_trust)), 2)

    prompt = f"""
        You are a vendor risk analyst.
        You are evaluating the company "{company}" for onboarding.

        Criticality of this vendor to us: {criticality}
        
        Using ONLY the evidence below, assess:
        1. financial_risk (1-5)
        2. security_risk (1-5)
        3. reputation_risk (1-5)
        4. overall_recommendation ("proceed", "proceed_with_protections", "reject")
        5. rationale (bullet points referencing the sources)

        The following risk data for {company} comes from multiple online sources.
        Confidence level of data: {confidence_score * 100}%.

        If confidence is below 60%, you must return:
        "overall_recommendation": "insufficient_data"
        and explain why.
        
        Return valid JSON with these keys:
        financial_risk, security_risk, reputation_risk,
        overall_recommendation, rationale_with_citations.

        Evidence:
        {evidence_text}
    """

    llm_output = call_llm_as_json(prompt)  # must enforce JSON schema
    state["risk_report"] = {
        "company": company,
        "generated_at": datetime.utcnow().isoformat(),
        "assessment": llm_output
    }
    return state

TRUSTED_DOMAINS = [
    "reuters.com", "bloomberg.com", "bbc.com", "nytimes.com",
    "forbes.com", "techcrunch.com", "investor.gov", "sec.gov"
]

def verify_sources_node(state):
    verified = []
    unverified = []

    for item in state["raw_findings"]:
        domain = urlparse(item["url"]).netloc.lower()
        if any(t in domain for t in TRUSTED_DOMAINS):
            item["trust_score"] = 0.9  # Highly trusted
            verified.append(item)
        else:
            item["trust_score"] = 0.4  # Low confidence
            unverified.append(item)

    state["verified_findings"] = verified
    state["unverified_findings"] = unverified
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
