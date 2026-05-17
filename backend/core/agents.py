import logging
from typing import List

from langchain_anthropic import ChatAnthropic
from langchain_core.messages import HumanMessage, SystemMessage
from pydantic import BaseModel

from .state import ResearchState, SubQuestionState

logger = logging.getLogger(__name__)
_llm = ChatAnthropic(model="claude-haiku-4-5-20251001", max_tokens=2048)


class SubQuestions(BaseModel):
    questions: List[str]


def planner_node(state: ResearchState) -> dict:
    depth = state.get("depth", 3)
    logger.info("Planner: calling LLM (depth=%d, question=%r)", depth, state["question"][:80])
    structured_llm = _llm.with_structured_output(SubQuestions)
    result = structured_llm.invoke([
        SystemMessage(content=(
            f"You are a research planner. Break the user's question into exactly {depth} focused "
            f"sub-questions that together fully answer the original question. "
            f"Each sub-question must be self-contained and independently answerable. "
            f"Return exactly {depth} sub-questions — no more, no fewer."
        )),
        HumanMessage(content=f"Research question: {state['question']}"),
    ])
    return {"sub_questions": result.questions[:depth]}


def researcher_node(state: SubQuestionState) -> dict:
    from .tools import web_search

    logger.info("Researcher: searching %r", state["sub_question"][:80])
    results = web_search(state["sub_question"])
    return {
        "search_results": [{
            "sub_question": state["sub_question"],
            "main_question": state["main_question"],
            "results": results,
        }]
    }


def synthesizer_node(state: ResearchState) -> dict:
    logger.info("Synthesizer: calling LLM with %d search result sets", len(state["search_results"]))
    findings = []
    sources = []
    for item in state["search_results"]:
        findings.append(f"**Sub-question:** {item['sub_question']}")
        for r in item["results"]:
            findings.append(f"- {r['content']}")
            if r.get("url"):
                sources.append(r["url"])

    findings_text = "\n".join(findings)
    sources_text = "\n".join(f"- {s}" for s in dict.fromkeys(sources))

    response = _llm.invoke([
        SystemMessage(content=(
            "You are a research synthesizer. Combine the findings below into a clear, "
            "structured report with: an Executive Summary, Key Findings (organized by topic), "
            "and a Conclusion. Use markdown formatting. Be concise but complete."
        )),
        HumanMessage(content=(
            f"Original question: {state['question']}\n\n"
            f"Research findings:\n{findings_text}\n\n"
            f"Sources:\n{sources_text}"
        )),
    ])

    report = response.content
    if sources_text:
        report += f"\n\n---\n\n## Sources\n\n{sources_text}"

    return {"synthesis": report}
