import requests
from dotenv import load_dotenv
import os
import requests
import urllib.parse

from utils.htmlParser import parse_google_html
load_dotenv()


def build_search_url(company_name):
    query = f"Recent financial, security breaches or lawsuits data involving {company_name}"
    encoded_query = urllib.parse.quote(query)
    search_url = f"https://www.google.com/search?q={encoded_query}&brd_mobile=desktop"
    return search_url

def get_company_data(company_name: str, criticality:str):
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
    search_url = build_search_url(company_name)

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    payload = {
        "zone": "serp_api1",
        "url": search_url,
        "format": "raw"
    }

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=25)
        print(f"🔍 Status Code: {response.status_code}")

        if not response.ok:
            print("❌ Bright Data returned an error:", response.text)
            return []

        html = response.text
        results = parse_google_html(html)
        return results

    except requests.exceptions.RequestException as e:
        print("⚠️ Request failed:", e)
        return []