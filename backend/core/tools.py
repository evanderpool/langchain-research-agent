from typing import List

from langchain_community.tools.tavily_search import TavilySearchResults

_search_tool = None


def _get_search_tool() -> TavilySearchResults:
    global _search_tool
    if _search_tool is None:
        _search_tool = TavilySearchResults(max_results=4)
    return _search_tool


def web_search(query: str) -> List[dict]:
    tool = _get_search_tool()
    raw = tool.invoke(query)
    return [
        {"content": item.get("content", ""), "url": item.get("url", "")}
        for item in raw
    ]
