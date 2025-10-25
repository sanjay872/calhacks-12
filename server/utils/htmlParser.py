from bs4 import BeautifulSoup

def parse_google_html(html):
    """
    Extracts Google search titles, URLs, and snippets from Bright Data HTML.
    """
    soup = BeautifulSoup(html, "html.parser")
    results = []

    # Try multiple patterns since Google layout changes often
    for g in soup.select("div.tF2Cxc, div.g"):
        title_tag = g.find("h3")
        link_tag = g.find("a", href=True)
        snippet_tag = g.find("div", class_="VwiC3b")

        if title_tag and link_tag:
            results.append({
                "title": title_tag.get_text(strip=True),
                "url": link_tag["href"],
                "snippet": snippet_tag.get_text(strip=True) if snippet_tag else ""
            })

    # Fallback layout
    if not results:
        for a in soup.find_all("a", href=True):
            text = a.get_text(strip=True)
            if text and "http" in a["href"]:
                results.append({"title": text, "url": a["href"], "snippet": ""})

    return results