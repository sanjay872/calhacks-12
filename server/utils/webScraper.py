import requests
import os
import requests
import urllib.parse
from dotenv import load_dotenv
from utils.htmlParser import parse_google_html

# Load .env file into environment variables
load_dotenv()


def build_search_url(query):
    encoded_query = urllib.parse.quote(query)
    search_url = f"https://www.google.com/search?q={encoded_query}&brd_mobile=desktop"
    return search_url

def get_company_data(company_name: str):
    """
    Fetches raw Google search HTML for a given company using Bright Data SERP API zone.
    Optionally parses and returns structured search results.

    Args:
        company_name (str): Name of the company (e.g., 'Apple')
        save_html (bool): If True, saves the fetched HTML to a file for inspection.

    Returns:
        list[dict]: Parsed search results with title, url, snippet (if found)
    """

    api_key = os.getenv("BRIGHT_DATA_KEY") or "YOUR_API_KEY"  # Replace or set env var
    if not api_key or api_key == "YOUR_API_KEY":
        raise ValueError("❌ BRIGHT_DATA_KEY not set. Please set your Bright Data API key.")
    url = "https://api.brightdata.com/request"
    
    risk_query = f"Recent financial, security breaches, regulatory issues, or lawsuits involving {company_name}"
    resilience_query = (
        f"{company_name} compliance certification, partnerships, sustainability, "
        f"leadership awards, security updates, product reliability, and community impact"
    )

    risk_search_encoded_url = build_search_url(risk_query)
    resilience_search_encoded_url=build_search_url(resilience_query)
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    payload1 = {
        "zone": "serp_api1",
        "url": risk_search_encoded_url,
        "format": "raw"
    }

    payload2 = {
        "zone": "serp_api1",
        "url": resilience_search_encoded_url,
        "format": "raw"
    }

    try:
        risk_response = requests.post(url, headers=headers, json=payload1, timeout=25)
        resilience_response=requests.post(url, headers=headers, json=payload2, timeout=25)
        
        if not risk_response.ok and not resilience_response:
            return []

        risk_html = risk_response.text
        resilience_html = risk_response.text
        
        risk_results = parse_google_html(risk_html)
        resilience_results=parse_google_html(resilience_html)
        
        return {
            "risk":risk_results,
            "resilience":resilience_results
        }

    except requests.exceptions.RequestException as e:
        print("⚠️ Request failed:", e)
        return []