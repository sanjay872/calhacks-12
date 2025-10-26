# from langgraph.graph import StateGraph, END
# from datetime import datetime
# from typing import TypedDict, List, Any
# from utils.webScraper import get_company_data
# from db.chromaClient import upsert_into_chroma, query_chroma
# from utils.jsonConverter import call_llm_as_json
# import random
# import json
# from langgraph.checkpoint.memory import MemorySaver
# from langchain_openai import ChatOpenAI
# import os
# from langgraph.types import interrupt
# from langgraph.types import Command
# import json
# import re

# llm = ChatOpenAI(model="gpt-4o-mini", temperature=0, api_key=os.getenv("OPENAI_API_KEY"))

# # ─────────────────────────────────────────────
# # Define Chat State
# # ─────────────────────────────────────────────
# class ChatState(TypedDict, total=False):
#     user_id: str
#     company_name: str
#     criticality: str
#     raw_findings: Any
#     cleaned_docs: Any
#     chroma_ids: Any
#     retrieved_context: Any
#     risk_report: Any
#     messages: List[dict]
#     stage: str
#     temp_memory: dict
#     assistant_reply: str
#     intend:str
#     next_node:str

# def classify_question_node(state: ChatState) -> ChatState:
#     """Decides whether user is asking about contract, risk analysis, or something general."""
    
#     user_msg = state["messages"][-1]["content"].lower()

#     """Classify user intent."""
    
#     msg = f"""
#     Your job is to classify the user's request into one of: 
#     - "risk": if the user is asking about risk analysis.
#     - "other": for greetings, unrelated messages, or general help.

#     Here are examples:
#     1. "I want to analysis about Apple inc" → risk
#     2. "analysis tesla?" → risk
#     3. "what is contract" → other
#     4. "what can u do?" → other
#     5. "Hi, how are you?" → other

#     Now classify this message:
#     "{user_msg}"

#     Respond with only one word from [risk, other].
#     """
#     res=llm.invoke(msg)
#     label=res.content.strip().lower()
#     print(f"Classifier detected intent: {label}")
#     state['intend']=label
#     state['next_node']='router'
#     return state

# # --- State Definition ---
# # --- State Definition ---
# def init_risk_node(state):
#     user_input = state['messages'][-1]['content']

#     msg = f"""
#         Extract company name and criticality from this statement:
#         {user_input}

#         - Company name: any real company name.
#         - Criticality: one of [high, medium, low].

#         Example:
#         1. Company is Apple and criticality is high
#         2. Analyze for Tesla and criticality is low.

#         Output strictly in JSON:
#         {{
#             "companyName": "Tesla",
#             "criticality": "high"
#         }}
#     """

#     res = llm.invoke(msg)
#     result = res.content

#     # Extract JSON from LLM output
#     match = re.search(r'```json\s*(.*?)\s*```', result, re.DOTALL)
#     if match:
#         json_str = match.group(1)
#         data = json.loads(json_str)
#         state['companyName'] = data.get("companyName")
#         state['criticality'] = data.get("criticality")

#     # Check if we have both fields
#     if not state.get("companyName") or not state.get("criticality"):
#         return interrupt("Please provide 'companyName' and 'criticality' values.")

#     # Continue if everything is filled
#     return {"status": "ok"}


# def received_inputs_node(state):
#     print("✅ Received all inputs!")
#     print(f"Company: {state['companyName']} | Criticality: {state['criticality']}")
#     return {"message": "Inputs received successfully."}


# def router_node(state:ChatState) -> ChatState:
#     if(state['intend']=='risk'):
#         state['next_node']='init_risk'
#         return "init_risk"
#     else:
#         state['next_node']='regular_chatbot'
#         return "regular_chatbot"

# def regular_chatbot_node(state:ChatState) -> ChatState:
#     msg=f"""
#         Your are a Contract Risk analyser Chatbot, that need to answer question that are related to contract, risk analysis, about you and what this tool is about.
#         This tool is for helping a know to what risk they are taking to make contract with other company.
#         Give reply 2-3 sentences, keep it professional.

#         Answer this question {state['messages'][-1]["content"].lower()}
#     """
#     res=llm.invoke(msg)
#     result=res.content.strip().lower()
#     state['assistant_reply']=result
#     state['next_node']='end'
#     print(state)
#     return state

# # ─────────────────────────────────────────────
# # Risk Analysis Nodes
# # ─────────────────────────────────────────────

# def fetch_external_data_node(state: ChatState) -> ChatState:
#     print(state)
#     if state.get("stage") != "risk_analysis" or "company_name" not in state:
#         state["assistant_reply"] = (
#             "⚠️ You need to provide company details first before storing analysis.\n"
#             'Please send something like: {"companyName": "Tesla", "criticality": "High"}'
#         )
#         state["stage"] = "awaiting_contract_input"
#         return state
#     company = state["company_name"]
#     print(f"🔍 Fetching data for {company}")
#     findings = get_company_data(company)
#     state["raw_findings"] = findings
#     return state


# def store_in_vector_db_node(state: ChatState) -> ChatState:
#     if state.get("stage") != "risk_analysis" or "company_name" not in state:
#         state["assistant_reply"] = (
#             "⚠️ You need to provide company details first before storing analysis.\n"
#             'Please send something like: {"companyName": "Tesla", "criticality": "High"}'
#         )
#         state["stage"] = "awaiting_contract_input"
#         return state
#     company = state["company_name"]
#     findings = state["raw_findings"]

#     cleaned_docs = []
#     chroma_ids = []

#     for item in findings:
#         text_block = (
#             f"Company: {company}\nTitle: {item.get('title','')}\n"
#             f"Snippet: {item.get('snippet','')}\nURL: {item.get('url','')}\n"
#         )
#         doc_id = upsert_into_chroma(
#             company=company,
#             text=text_block,
#             metadata={"url": item.get("url")}
#         )
#         cleaned_docs.append({"text": text_block, "source_url": item.get("url")})
#         chroma_ids.append(doc_id)

#     state["cleaned_docs"] = cleaned_docs
#     state["chroma_ids"] = chroma_ids
#     return state


# def retrieve_relevant_context_node(state: ChatState) -> ChatState:

#     company = state["company_name"]
#     risk_query = f"{company} financial, regulatory, or security risks, lawsuits, or incidents"
#     resilience_query = (
#         f"{company} compliance certifications, partnerships, sustainability efforts, "
#         f"security updates, awards, or recovery actions"
#     )

#     try:
#         risk_chunks = query_chroma(query_text=risk_query, company=company, top_k=5, where={"category": "risk"})
#     except Exception as e:
#         print(f"⚠️ Risk retrieval failed: {e}")
#         risk_chunks = []

#     try:
#         resilience_chunks = query_chroma(query_text=resilience_query, company=company, top_k=5, where={"category": "resilience"})
#     except Exception as e:
#         print(f"⚠️ Resilience retrieval failed: {e}")
#         resilience_chunks = []

#     combined = risk_chunks + resilience_chunks
#     random.shuffle(combined)

#     state["retrieved_context"] = combined
#     return state


# def llm_score_risk_node(state: ChatState) -> ChatState:
#     company = state["company_name"]
#     criticality = state["criticality"]
#     context_chunks = state.get("retrieved_context", [])

#     if not context_chunks:
#         state["assistant_reply"] = f"⚠️ No information found about {company}. Try again later."
#         return state

#     evidence_text = ""
#     for idx, chunk in enumerate(context_chunks):
#         evidence_text += f"[Source {idx+1}] {chunk['doc']}\nURL: {chunk['metadata'].get('url')}\n\n"

#     prompt = f"""
#     You are a senior vendor risk analyst helping our company decide whether to
#     enter into a business contract with "{company}".

#     Criticality of this relationship: {criticality}

#     Evaluate the company based on the evidence below, focusing on how their
#     financial stability, security posture, legal history, and reputation
#     affect our business risk as a contracting partner.

#     Your output must include:
#     - financial_risk (1-5)
#     - security_risk (1-5)
#     - reputation_risk (1-5)
#     - resilience_strength (1-5)
#     - overall_recommendation: "safe_to_contract", "contract_with_protections", or "do_not_contract"
#     - rationale_with_citations: short bullet points referencing sources.

#     Decision logic:
#     - safe_to_contract → average risk ≤ 2.5 AND resilience ≥ 4
#     - contract_with_protections → average risk 2.6-3.8 OR resilience between 3-4
#     - do_not_contract → average risk ≥ 3.9 OR resilience ≤ 2

#     Evidence:
#     {evidence_text}
#     """

#     llm_output = call_llm_as_json(prompt)
#     state["risk_report"] = {
#         "company": company,
#         "generated_at": datetime.utcnow().isoformat(),
#         "assessment": llm_output
#     }
#     state["assistant_reply"] = (
#         f"📊 Risk assessment for {company} completed.\n"
#         f"Recommendation: {llm_output.get('overall_recommendation','N/A')}\n"
#         f"Details: {llm_output}"
#     )
#     return state

# def verify_sources_node(state: ChatState) -> ChatState:
#     """Filter out low-credibility or duplicate web sources before embedding."""

#     # Guard clause — skip if we’re not in risk_analysis
#     if state.get("stage") != "risk_analysis":
#         state["assistant_reply"] = (
#             "⚠️ Cannot verify sources yet — please provide valid company details first."
#         )
#         state["stage"] = "awaiting_contract_input"
#         return state

#     raw_findings = state.get("raw_findings", [])
#     if not raw_findings:
#         state["assistant_reply"] = "⚠️ No findings to verify yet."
#         return state

#     verified = []
#     unverified = []
#     seen_urls = set()

#     # Define trusted domain patterns
#     trusted_domains = [
#         ".gov", ".edu", ".org", ".sec.gov", "reuters.com", "bloomberg.com",
#         "bbc.com", "nytimes.com", "forbes.com", "investopedia.com"
#     ]

#     def trust_score(url: str) -> float:
#         domain = urlparse(url).netloc.lower()
#         if any(t in domain for t in trusted_domains):
#             return 0.9
#         if "medium" in domain or "blogspot" in domain or "reddit" in domain:
#             return 0.5
#         return 0.4

#     # Process all findings (some may be grouped by category)
#     def process_items(items):
#         for item in items:
#             url = item.get("url", "")
#             if not url or url in seen_urls:
#                 continue
#             seen_urls.add(url)

#             score = item.get("trust_score") or trust_score(url)
#             item["trust_score"] = score

#             if score >= 0.7:
#                 verified.append(item)
#             else:
#                 unverified.append(item)

#     if isinstance(raw_findings, list):
#         process_items(raw_findings)
#     elif isinstance(raw_findings, dict):
#         for category_items in raw_findings.values():
#             process_items(category_items)

#     state["verified_findings"] = verified
#     state["unverified_findings"] = unverified

#     state["assistant_reply"] = (
#         f"✅ Verified {len(verified)} reliable sources, "
#         f"flagged {len(unverified)} as lower-trust."
#     )
#     return state


# # ─────────────────────────────────────────────
# # GENERATE FINAL ANALYSIS NODE
# # ─────────────────────────────────────────────
# def generate_final_analysis_node(state: ChatState) -> ChatState:
#     """LLM reasoning step — summarizes verified evidence into a contract decision."""

#     if state.get("stage") != "risk_analysis":
#         state["assistant_reply"] = (
#             "⚠️ Please provide company details in JSON before running risk analysis."
#         )
#         state["stage"] = "awaiting_contract_input"
#         return state

#     company = state.get("company_name")
#     criticality = state.get("criticality")
#     verified = state.get("verified_findings", [])

#     if not verified:
#         state["assistant_reply"] = "⚠️ No verified sources to analyze."
#         return state

#     # Combine evidence text
#     evidence_text = ""
#     for i, src in enumerate(verified, 1):
#         evidence_text += (
#             f"[Source {i}] {src.get('title','')}\n"
#             f"URL: {src.get('url','')}\n"
#             f"Snippet: {src.get('snippet','')}\n\n"
#         )

#     # Prompt for the LLM
#     prompt = f"""
#     You are a vendor risk analyst evaluating whether to sign a **business contract**
#     with the company "{company}".

#     Contract criticality: {criticality}

#     Analyze both **risk** and **resilience** based on the verified sources.

#     Assess:
#     - financial_risk (1-5)
#     - security_risk (1-5)
#     - reputation_risk (1-5)
#     - resilience_strength (1-5)
#     - overall_recommendation ("proceed", "proceed_with_protections", or "reject")
#     - rationale_with_citations (list of concise bullet points)

#     Decision logic:
#     - proceed if avg risk ≤ 2.5 and resilience ≥ 4
#     - proceed_with_protections if avg risk between 2.6-3.8 or resilience between 3-4
#     - reject if avg risk ≥ 3.9 or resilience ≤ 2

#     Evidence:
#     {evidence_text}
#     """

#     # Call your structured JSON LLM helper
#     result = call_llm_as_json(prompt)

#     # Store into state
#     state["risk_report"] = {
#         "company": company,
#         "criticality": criticality,
#         "generated_at": datetime.utcnow().isoformat(),
#         "assessment": result,
#     }

#     # Generate a readable assistant reply
#     assess = result or {}
#     rec = assess.get("overall_recommendation", "N/A")
#     state["assistant_reply"] = (
#         f"📊 **Risk Report for {company}**\n"
#         f"• Financial: {assess.get('financial_risk','?')}\n"
#         f"• Security: {assess.get('security_risk','?')}\n"
#         f"• Reputation: {assess.get('reputation_risk','?')}\n"
#         f"• Resilience: {assess.get('resilience_strength','?')}\n"
#         f"**→ Recommendation:** {rec.upper()}\n\n"
#         f"📝 Rationale:\n- " + "\n- ".join(assess.get("rationale_with_citations", []))
#     )

#     return state

# # ─────────────────────────────────────────────
# # Build the Graph
# # ─────────────────────────────────────────────
# def build_chat_risk_graph():

#     graph = StateGraph(ChatState)

#     # ─────── Nodes ───────
#     graph.add_node("classify_question", classify_question_node)
#     graph.add_node("regular_chatbot",regular_chatbot_node)
#     graph.add_node("fetch_external_data", fetch_external_data_node)
#     graph.add_node("store_in_vector_db", store_in_vector_db_node)
#     graph.add_node("init_risk", init_risk_node)
#     graph.add_node("verify_sources",verify_sources_node)
#     graph.add_node("received_inputs", received_inputs_node)
#     graph.add_node("retrieve_relevant_context",retrieve_relevant_context_node)
#     graph.add_node("generate_final_analysis",generate_final_analysis_node);
    
#     graph.set_entry_point("init_risk")

#     # Loop condition until both inputs are provided
#     graph.add_conditional_edges(
#         "init_risk",
#         lambda state: "received_inputs" if state.get("companyName") and state.get("criticality") else "init_risk"
#     )

#     # Next transitions after inputs
#     graph.add_edge("received_inputs", "fetch_external_data")
#     graph.add_edge("fetch_external_data", "generate_final_analysis")
#     graph.add_edge('regular_chatbot',END)
#     graph.add_edge("fetch_external_data", "verify_sources")
#     graph.add_edge("verify_sources", "store_in_vector_db")
#     graph.add_edge("store_in_vector_db", "retrieve_relevant_context")
#     graph.add_edge("retrieve_relevant_context", "generate_final_analysis")
#     graph.add_edge("generate_final_analysis", END)

#     # ─────── Memory-enabled Graph ───────
#     checkpointer = MemorySaver()
#     app = graph.compile(checkpointer=checkpointer)
#     return app

# def handle_user_message(user_id: str, user_message: str):
#     app = build_chat_risk_graph()

#     state_input = {
#         "user_id": user_id,
#         "messages": [{"role": "user", "content": user_message}]
#     }

#     # Use user_id as thread_id to isolate memory
#     result = app.invoke(state_input, config={"thread_id": user_id})
#     return result

from langgraph.graph import StateGraph, END
from datetime import datetime
from typing import TypedDict, List, Any, Literal
from urllib.parse import urlparse
import random
import json
import re
import os

from langgraph.checkpoint.memory import MemorySaver
from langchain_openai import ChatOpenAI

# Import your custom utilities
from utils.webScraper import get_company_data
from db.chromaClient import upsert_into_chroma, query_chroma
from utils.jsonConverter import call_llm_as_json

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0, api_key=os.getenv("OPENAI_API_KEY"))

# ─────────────────────────────────────────────
# Define Chat State
# ─────────────────────────────────────────────
class ChatState(TypedDict, total=False):
    user_id: str
    company_name: str
    criticality: str
    raw_findings: Any
    cleaned_docs: Any
    chroma_ids: Any
    retrieved_context: Any
    risk_report: Any
    messages: List[dict]
    stage: str
    temp_memory: dict
    assistant_reply: str
    intent: str
    verified_findings: Any
    unverified_findings: Any

# ─────────────────────────────────────────────
# Classification and Routing
# ─────────────────────────────────────────────
def classify_question_node(state: ChatState) -> ChatState:
    """Decides whether user is asking about risk analysis or something general."""
    
    user_msg = state["messages"][-1]["content"]

    msg = f"""
    Your job is to classify the user's request into one of: 
    - "risk": if the user is asking about risk analysis of a company.
    - "other": for greetings, unrelated messages, or general help.

    Here are examples:
    1. "I want to analyze Apple inc" → risk
    2. "analysis tesla?" → risk
    3. "what is contract" → other
    4. "what can u do?" → other
    5. "Hi, how are you?" → other

    Now classify this message:
    "{user_msg}"

    Respond with only one word from [risk, other].
    """
    
    res = llm.invoke(msg)
    label = res.content.strip().lower()
    print(f"Classifier detected intent: {label}")
    
    state['intent'] = label
    state['stage'] = 'classified'
    
    return state


def router_node(state: ChatState) -> Literal["init_risk", "regular_chatbot"]:
    """Routes based on intent."""
    if state.get('intent') == 'risk':
        return "init_risk"
    else:
        return "regular_chatbot"


def regular_chatbot_node(state: ChatState) -> ChatState:
    """Handles general conversation."""
    user_message = state['messages'][-1]["content"]
    
    msg = f"""
    You are a Contract Risk Analyzer Chatbot that answers questions related to contracts, 
    risk analysis, and your capabilities.
    
    This tool helps companies understand risks when contracting with other companies.
    Give a reply in 2-3 sentences, keep it professional.

    Answer this question: {user_message}
    """
    
    res = llm.invoke(msg)
    result = res.content.strip()
    
    state['assistant_reply'] = result
    state['stage'] = 'completed'
    
    return state


# ─────────────────────────────────────────────
# Risk Analysis Initialization
# ─────────────────────────────────────────────
def init_risk_node(state: ChatState) -> ChatState:
    """Extract company name and criticality from user input."""
    user_input = state['messages'][-1]['content']

    msg = f"""
    Extract company name and criticality from this statement:
    {user_input}

    - Company name: any real company name.
    - Criticality: one of [high, medium, low].

    Example inputs:
    1. "Analyze Apple with high criticality"
    2. "Risk assessment for Tesla, criticality is low"

    Output strictly in JSON format:
    {{
        "companyName": "Tesla",
        "criticality": "high"
    }}
    
    If you cannot extract both values, use null for missing fields.
    """

    res = llm.invoke(msg)
    result = res.content

    # Extract JSON from LLM output
    try:
        match = re.search(r'```json\s*(.*?)\s*```', result, re.DOTALL)
        if match:
            json_str = match.group(1)
        else:
            json_str = result
            
        data = json.loads(json_str)
        company = data.get("companyName")
        criticality = data.get("criticality")
        
        if company and criticality:
            state['company_name'] = company
            state['criticality'] = criticality.lower()
            state['stage'] = 'risk_analysis'
            state['assistant_reply'] = f"✅ Analyzing {company} with {criticality} criticality..."
        else:
            state['assistant_reply'] = (
                "⚠️ Could not extract company name or criticality. "
                "Please provide both, e.g., 'Analyze Tesla with high criticality'"
            )
            state['stage'] = 'awaiting_input'
            
    except Exception as e:
        print(f"Error parsing LLM output: {e}")
        state['assistant_reply'] = (
            "⚠️ Could not parse your request. "
            "Please specify company name and criticality (high/medium/low)."
        )
        state['stage'] = 'awaiting_input'
    
    return state


def check_inputs_node(state: ChatState) -> Literal["fetch_external_data", "regular_chatbot"]:
    """Check if we have valid inputs to proceed with risk analysis."""
    if state.get('stage') == 'risk_analysis' and state.get('company_name') and state.get('criticality'):
        return "fetch_external_data"
    else:
        return "regular_chatbot"


# ─────────────────────────────────────────────
# Risk Analysis Pipeline
# ─────────────────────────────────────────────
def fetch_external_data_node(state: ChatState) -> ChatState:
    """Fetch external data about the company."""
    company = state["company_name"]
    print(f"🔍 Fetching data for {company}")
    
    try:
        findings = get_company_data(company)
        state["raw_findings"] = findings
        print(f"✅ Found {len(findings) if isinstance(findings, list) else 'multiple'} items")
    except Exception as e:
        print(f"❌ Error fetching data: {e}")
        state["raw_findings"] = []
        state["assistant_reply"] = f"⚠️ Could not fetch data for {company}. Error: {str(e)}"
    
    return state


def verify_sources_node(state: ChatState) -> ChatState:
    """Filter out low-credibility or duplicate web sources."""
    raw_findings = state.get("raw_findings", [])
    
    if not raw_findings:
        state["assistant_reply"] = "⚠️ No findings to verify."
        state["verified_findings"] = []
        state["unverified_findings"] = []
        return state

    verified = []
    unverified = []
    seen_urls = set()

    # Define trusted domain patterns
    trusted_domains = [
        ".gov", ".edu", ".org", ".sec.gov", "reuters.com", "bloomberg.com",
        "bbc.com", "nytimes.com", "forbes.com", "investopedia.com", "wsj.com"
    ]

    def trust_score(url: str) -> float:
        try:
            domain = urlparse(url).netloc.lower()
            if any(t in domain for t in trusted_domains):
                return 0.9
            if "medium" in domain or "blogspot" in domain or "reddit" in domain:
                return 0.5
            return 0.6
        except:
            return 0.3

    # Process findings
    def process_items(items):
        for item in items:
            url = item.get("url", "")
            if not url or url in seen_urls:
                continue
            seen_urls.add(url)

            score = item.get("trust_score") or trust_score(url)
            item["trust_score"] = score

            if score >= 0.6:
                verified.append(item)
            else:
                unverified.append(item)

    if isinstance(raw_findings, list):
        process_items(raw_findings)
    elif isinstance(raw_findings, dict):
        for category_items in raw_findings.values():
            if isinstance(category_items, list):
                process_items(category_items)

    state["verified_findings"] = verified
    state["unverified_findings"] = unverified

    print(f"✅ Verified {len(verified)} sources, flagged {len(unverified)} as lower-trust")
    
    return state


def store_in_vector_db_node(state: ChatState) -> ChatState:
    """Store verified findings in ChromaDB."""
    company = state["company_name"]
    findings = state.get("verified_findings", [])

    if not findings:
        print("⚠️ No verified findings to store")
        state["cleaned_docs"] = []
        state["chroma_ids"] = []
        return state

    cleaned_docs = []
    chroma_ids = []

    for item in findings:
        text_block = (
            f"Company: {company}\n"
            f"Title: {item.get('title', '')}\n"
            f"Snippet: {item.get('snippet', '')}\n"
            f"URL: {item.get('url', '')}\n"
            f"Trust Score: {item.get('trust_score', 0)}"
        )
        
        try:
            doc_id = upsert_into_chroma(
                company=company,
                text=text_block,
                metadata={
                    "url": item.get("url", ""),
                    "trust_score": item.get("trust_score", 0)
                }
            )
            cleaned_docs.append({"text": text_block, "source_url": item.get("url")})
            chroma_ids.append(doc_id)
        except Exception as e:
            print(f"⚠️ Error storing document: {e}")

    state["cleaned_docs"] = cleaned_docs
    state["chroma_ids"] = chroma_ids
    
    print(f"✅ Stored {len(chroma_ids)} documents in vector DB")
    
    return state


def retrieve_relevant_context_node(state: ChatState) -> ChatState:
    """Retrieve relevant context from vector DB."""
    company = state["company_name"]
    
    risk_query = f"{company} financial regulatory security risks lawsuits incidents"
    resilience_query = f"{company} compliance certifications partnerships sustainability security awards"

    risk_chunks = []
    resilience_chunks = []

    try:
        risk_chunks = query_chroma(
            query_text=risk_query, 
            company=company, 
            top_k=5
        )
    except Exception as e:
        print(f"⚠️ Risk retrieval failed: {e}")

    try:
        resilience_chunks = query_chroma(
            query_text=resilience_query, 
            company=company, 
            top_k=5
        )
    except Exception as e:
        print(f"⚠️ Resilience retrieval failed: {e}")

    combined = risk_chunks + resilience_chunks
    random.shuffle(combined)

    state["retrieved_context"] = combined
    print(f"✅ Retrieved {len(combined)} context chunks")
    
    return state


def generate_final_analysis_node(state: ChatState) -> ChatState:
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



# ─────────────────────────────────────────────
# Build the Graph
# ─────────────────────────────────────────────
def build_chat_risk_graph():
    """Build the complete LangGraph workflow."""
    graph = StateGraph(ChatState)

    # Add all nodes
    graph.add_node("classify_question", classify_question_node)
    graph.add_node("router", router_node)
    graph.add_node("regular_chatbot", regular_chatbot_node)
    graph.add_node("init_risk", init_risk_node)
    graph.add_node("check_inputs", check_inputs_node)
    graph.add_node("fetch_external_data", fetch_external_data_node)
    graph.add_node("verify_sources", verify_sources_node)
    graph.add_node("store_in_vector_db", store_in_vector_db_node)
    graph.add_node("retrieve_relevant_context", retrieve_relevant_context_node)
    graph.add_node("generate_final_analysis", generate_final_analysis_node)

    # Set entry point
    graph.set_entry_point("classify_question")

    # Define edges
    graph.add_conditional_edges(
        "classify_question",
        router_node,
        {
            "init_risk": "init_risk",
            "regular_chatbot": "regular_chatbot"
        }
    )

    graph.add_conditional_edges(
        "init_risk",
        check_inputs_node,
        {
            "fetch_external_data": "fetch_external_data",
            "regular_chatbot": "regular_chatbot"
        }
    )

    graph.add_edge("fetch_external_data", "verify_sources")
    graph.add_edge("verify_sources", "store_in_vector_db")
    graph.add_edge("store_in_vector_db", "retrieve_relevant_context")
    graph.add_edge("retrieve_relevant_context", "generate_final_analysis")
    graph.add_edge("generate_final_analysis", END)
    graph.add_edge("regular_chatbot", END)

    # Compile with memory
    checkpointer = MemorySaver()
    app = graph.compile(checkpointer=checkpointer)
    
    return app


def handle_user_message(user_id: str, user_message: str):
    """Handle a user message and return the result."""
    app = build_chat_risk_graph()

    state_input = {
        "user_id": user_id,
        "messages": [{"role": "user", "content": user_message}]
    }

    # Use user_id as thread_id for memory isolation
    result = app.invoke(state_input, config={"configurable": {"thread_id": user_id}})
    
    return result


# def handle_user_message(user_id: str, user_message: str):
#     app = build_chat_risk_graph()

#     state_input = {
#         "user_id": user_id,
#         "messages": [{"role": "user", "content": user_message}]
#     }

#     config = RunnableConfig(configurable={"thread_id": user_id})
#     result = app.invoke(state_input, config=config)

#     return result

# Add this to the end of your contractbot.py file
# to make all node functions importable

# Export all node functions for streaming
__all__ = [
    'ChatState',
    'classify_question_node',
    'router_node',
    'regular_chatbot_node',
    'init_risk_node',
    'check_inputs_node',
    'fetch_external_data_node',
    'verify_sources_node',
    'store_in_vector_db_node',
    'retrieve_relevant_context_node',
    'generate_final_analysis_node',
    'build_chat_risk_graph',
    'handle_user_message'
]