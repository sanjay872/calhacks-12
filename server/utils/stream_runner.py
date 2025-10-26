# backend/stream_runner.py
from typing import Dict, Any, Generator
from graphs.contractbot import (
    classify_question_node,
    router_node,
    regular_chatbot_node,
    init_risk_node,
    check_inputs_node,
    fetch_external_data_node,
    verify_sources_node,
    store_in_vector_db_node,
    retrieve_relevant_context_node,
    generate_final_analysis_node,
    ChatState,
)

def run_pipeline_stream(user_id: str, user_message: str) -> Generator[Dict[str, Any], None, None]:
    """
    Yields dict events like:
    { "type": "stage", "stage": "classify_question", "message": "...status..." }
    { "type": "final", "assistant_reply": "...", "risk_report": {...} }
    """

    # Initialize state
    state: ChatState = {
        "user_id": user_id,
        "messages": [{"role": "user", "content": user_message}]
    }

    try:
        # Step 1: Classify the question
        yield {
            "type": "stage_start",
            "stage": "classify_question",
            "message": "Classifying your request..."
        }
        
        state = classify_question_node(state)
        
        yield {
            "type": "stage_complete",
            "stage": "classify_question",
            "intent": state.get("intent"),
            "message": f"Intent detected: {state.get('intent', 'unknown')}"
        }

        # Step 2: Route based on intent
        intent = state.get("intent", "other")
        
        if intent != "risk":
            # Handle regular chatbot flow
            yield {
                "type": "stage_start",
                "stage": "regular_chatbot",
                "message": "Processing your query..."
            }
            
            state = regular_chatbot_node(state)
            
            yield {
                "type": "stage_complete",
                "stage": "regular_chatbot",
                "message": "Response generated"
            }
            
            yield {
                "type": "final",
                "mode": "chat",
                "assistant_reply": state.get("assistant_reply", "")
            }
            return

        # Risk analysis flow
        # Step 3: Initialize risk analysis (extract company + criticality)
        yield {
            "type": "stage_start",
            "stage": "init_risk",
            "message": "Extracting company details..."
        }
        
        state = init_risk_node(state)
        
        yield {
            "type": "stage_complete",
            "stage": "init_risk",
            "company_name": state.get("company_name"),
            "criticality": state.get("criticality"),
            "message": f"Analyzing {state.get('company_name', 'company')} with {state.get('criticality', 'unknown')} criticality"
        }

        # Check if we have valid inputs
        if state.get("stage") != "risk_analysis":
            yield {
                "type": "final",
                "mode": "clarification_needed",
                "assistant_reply": state.get("assistant_reply", "Please provide company name and criticality.")
            }
            return

        # Step 4: Fetch external data
        yield {
            "type": "stage_start",
            "stage": "fetch_external_data",
            "message": f"Searching for information about {state.get('company_name')}..."
        }
        
        state = fetch_external_data_node(state)
        
        raw_findings = state.get("raw_findings", [])
        raw_count = len(raw_findings) if isinstance(raw_findings, list) else 0
        
        yield {
            "type": "stage_complete",
            "stage": "fetch_external_data",
            "raw_count": raw_count,
            "message": f"Found {raw_count} sources"
        }

        # Step 5: Verify sources
        yield {
            "type": "stage_start",
            "stage": "verify_sources",
            "message": "Verifying source credibility..."
        }
        
        state = verify_sources_node(state)
        
        verified_count = len(state.get("verified_findings", []) or [])
        unverified_count = len(state.get("unverified_findings", []) or [])
        
        yield {
            "type": "stage_complete",
            "stage": "verify_sources",
            "verified_count": verified_count,
            "unverified_count": unverified_count,
            "message": f"✅ Verified {verified_count} high-trust sources, flagged {unverified_count} as lower credibility"
        }

        # Step 6: Store in vector database
        yield {
            "type": "stage_start",
            "stage": "store_in_vector_db",
            "message": "Storing verified sources in database..."
        }
        
        state = store_in_vector_db_node(state)
        
        stored_count = len(state.get("chroma_ids", []) or [])
        
        yield {
            "type": "stage_complete",
            "stage": "store_in_vector_db",
            "stored_count": stored_count,
            "message": f"💾 Stored {stored_count} documents in vector database"
        }

        # Step 7: Retrieve relevant context
        yield {
            "type": "stage_start",
            "stage": "retrieve_relevant_context",
            "message": "Analyzing relevant information..."
        }
        
        state = retrieve_relevant_context_node(state)
        
        context_count = len(state.get("retrieved_context", []) or [])
        
        yield {
            "type": "stage_complete",
            "stage": "retrieve_relevant_context",
            "context_count": context_count,
            "message": f"📊 Retrieved {context_count} relevant context chunks"
        }

        # Step 8: Generate final analysis
        yield {
            "type": "stage_start",
            "stage": "generate_final_analysis",
            "message": "Generating comprehensive risk analysis..."
        }
        
        state = generate_final_analysis_node(state)
        
        yield {
            "type": "stage_complete",
            "stage": "generate_final_analysis",
            "message": "Analysis complete"
        }

        # Final result
        yield {
            "type": "final",
            "mode": "risk_report",
            "assistant_reply": state.get("assistant_reply", ""),
            "risk_report": state.get("risk_report", {}),
            "company_name": state.get("company_name"),
            "criticality": state.get("criticality")
        }

    except Exception as e:
        import traceback
        yield {
            "type": "error",
            "message": str(e),
            "traceback": traceback.format_exc()
        }