import httpx
from bs4 import BeautifulSoup, Tag
from typing import Optional


async def scrape_website(url: str) -> dict:
    """Scrape a company website and extract key information."""
    if not url.startswith(("http://", "https://")):
        url = "https://" + url

    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/120.0.0.0 Safari/537.36"
        ),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-GB,en;q=0.9",
    }

    try:
        async with httpx.AsyncClient(
            timeout=20, follow_redirects=True, headers=headers
        ) as client:
            response = await client.get(url)
            response.raise_for_status()
            html = response.text
    except Exception as e:
        return {"url": url, "error": str(e), "scraped": False}

    soup = BeautifulSoup(html, "html.parser")

    # Remove noise
    for tag in soup(["script", "style", "nav", "footer", "head"]):
        tag.decompose()

    def text(el: Optional[Tag]) -> str:
        return el.get_text(strip=True) if el else ""

    title = text(soup.find("title"))
    meta_desc = ""
    meta = soup.find("meta", attrs={"name": "description"})
    if meta and isinstance(meta, Tag):
        meta_desc = meta.get("content", "")  # type: ignore

    og_title = ""
    og = soup.find("meta", attrs={"property": "og:title"})
    if og and isinstance(og, Tag):
        og_title = og.get("content", "")  # type: ignore

    h1s = [h.get_text(strip=True) for h in soup.find_all("h1")][:3]
    h2s = [h.get_text(strip=True) for h in soup.find_all("h2")][:6]

    paragraphs = [
        p.get_text(strip=True)
        for p in soup.find_all("p")
        if len(p.get_text(strip=True)) > 60
    ][:12]

    body_text = soup.get_text(separator=" ", strip=True)
    words = body_text.split()
    excerpt = " ".join(words[:400])

    return {
        "url": url,
        "scraped": True,
        "title": title or og_title,
        "meta_description": meta_desc,
        "h1": h1s,
        "h2": h2s,
        "key_paragraphs": paragraphs,
        "excerpt": excerpt,
    }
