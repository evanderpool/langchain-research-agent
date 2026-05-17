# Multi-Agent Research Assistant

A **LangGraph + LangChain** multi-agent system that researches any topic in parallel and synthesizes findings into a structured report — built as a portfolio project for [Artificial Management](https://github.com/evanderpool/artificial-management).

## Architecture

```
User Question
      │
      ▼
┌─────────────┐
│   Planner   │  Claude breaks the question into 3–4 sub-questions
└──────┬──────┘
       │  (LangGraph Send — parallel fan-out)
  ┌────┴────┐
  ▼         ▼         ▼         ▼
┌────┐   ┌────┐   ┌────┐   ┌────┐
│ R1 │   │ R2 │   │ R3 │   │ R4 │   Researchers (parallel Tavily web search)
└────┘   └────┘   └────┘   └────┘
  └────┬────┘
       ▼
┌─────────────┐
│ Synthesizer │  Claude combines all findings into a structured report
└─────────────┘
```

## Key Concepts Demonstrated

| Concept | Implementation |
|---|---|
| **LangGraph StateGraph** | Typed state with `operator.add` reducers for parallel accumulation |
| **Parallel agent execution** | `Send` API fans out to N researcher nodes simultaneously |
| **Conditional edges** | `add_conditional_edges` routes planner → N researchers |
| **Structured output** | `.with_structured_output(Pydantic)` for reliable sub-question extraction |
| **LCEL** | LangChain Expression Language for chain composition |
| **Tool use** | `TavilySearchResults` as a LangChain community tool |
| **Streaming** | `graph.stream()` with `stream_mode="updates"` for live UI updates |

## Tech Stack

- **LangGraph** — stateful multi-agent orchestration (graph, state, Send, streaming)
- **LangChain** — chain composition, tool wrappers, model integrations
- **LangChain-Anthropic** — `ChatAnthropic` with structured output
- **Tavily** — real-time web search optimized for AI agents
- **Streamlit** — interactive web UI with live agent status
- **Python 3.12**

## Quick Start

```bash
# 1. Clone and set up environment
git clone https://github.com/evanderpool/langchain-research-agent
cd langchain-research-agent
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure API keys
cp .env.example .env
# Edit .env with your ANTHROPIC_API_KEY and TAVILY_API_KEY

# 4a. Run the Streamlit UI
streamlit run app.py

# 4b. Or use the CLI
python main.py "What are the key trends in AI agent frameworks in 2025?"
```

## API Keys

| Key | Where to get it | Cost |
|---|---|---|
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) | Pay-per-use |
| `TAVILY_API_KEY` | [tavily.com](https://tavily.com) | Free tier: 1,000 searches/month |

## Project Structure

```
langchain-research-agent/
├── src/
│   ├── state.py       # TypedDict graph state with operator.add reducers
│   ├── tools.py       # Tavily web search tool wrapper
│   ├── agents.py      # Planner, researcher, synthesizer node functions
│   └── graph.py       # LangGraph StateGraph — nodes, edges, Send routing
├── app.py             # Streamlit UI with live agent status streaming
├── main.py            # CLI entry point
├── requirements.txt
└── .env.example
```

## Related Projects

- [Artificial Management AI OS](https://github.com/evanderpool/artificial-management) — 10-agent enterprise AI operating system
- [RAG Knowledge Base Builder](https://huggingface.co/spaces/evanderpool/rag-knowledge-base) — Document ingestion + semantic search + LLM-grounded answers

---

Built by [Erick Vanderpool](https://github.com/evanderpool) — [Artificial Management](https://github.com/evanderpool/artificial-management)
