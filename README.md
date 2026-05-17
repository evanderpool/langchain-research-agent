---
title: Research Intelligence Agent
emoji: 🔬
colorFrom: blue
colorTo: teal
sdk: docker
pinned: false
---

# Research Intelligence Agent

A production-grade multi-agent AI research assistant built with **LangGraph**, **FastAPI**, and **React**. Ask a question and watch parallel AI agents plan, research, and synthesize a structured report in real time.

**Part of the [Artificial Management](https://github.com/evanderpool/artificial-management) AI Operating System.**

---

## Architecture

```
User Query
    │
    ▼
┌─────────┐     ┌─────────────┐     ┌─────────────┐
│ Planner │────▶│ Researcher 1│────▶│             │
│ (Claude)│     ├─────────────┤     │ Synthesizer │
│         │────▶│ Researcher 2│────▶│  (Claude)   │
│         │     ├─────────────┤     │             │
│         │────▶│ Researcher N│────▶│             │
└─────────┘     └─────────────┘     └─────────────┘
     │               │ Tavily              │
     │             Web Search         Markdown
     └─────────── LangGraph SSE ──────────┘
                    Stream
```

**Stack:** LangGraph · LangChain · Claude Haiku · Tavily Search · FastAPI · SQLite · React · Vite · Tailwind CSS

---

## Key Concepts Demonstrated

| Concept | Implementation |
|---|---|
| **LangGraph StateGraph** | Typed state with `operator.add` reducers for parallel accumulation |
| **Parallel agent execution** | `Send` API fans out to N researcher nodes simultaneously |
| **Conditional edges** | `add_conditional_edges` routes planner → N researchers |
| **Structured output** | `.with_structured_output(Pydantic)` for reliable sub-question extraction |
| **SSE Streaming** | FastAPI `StreamingResponse` + React `fetch` + `ReadableStream` |
| **Async persistence** | `aiosqlite` for non-blocking report storage |
| **Tool use** | `TavilySearchResults` as a LangChain community tool |

---

## Features

- **Parallel research agents** — LangGraph fans out sub-questions to N researchers simultaneously
- **Real-time streaming** — SSE streams agent status updates to the UI as they happen
- **Configurable depth** — choose 2 (fast ~15s), 3 (balanced ~25s), or 5 (thorough ~45s) researchers
- **Research history** — every report auto-saved to SQLite; browse and reload past sessions
- **Export** — download any report as Markdown or PDF
- **Source citation panel** — all sources displayed with clickable links, deduplicated

---

## Local Setup

### Prerequisites

- Python 3.11+
- Node.js 20+
- Anthropic API key — [console.anthropic.com](https://console.anthropic.com)
- Tavily API key — [app.tavily.com](https://app.tavily.com) (free tier: 1,000 searches/month)

### 1. Clone and configure

```bash
git clone https://github.com/evanderpool/langchain-research-agent.git
cd langchain-research-agent
cp .env.example .env
# Edit .env — add ANTHROPIC_API_KEY and TAVILY_API_KEY
```

### 2. Install backend

```bash
pip install -r backend/requirements.txt
```

### 3. Install frontend

```bash
cd frontend && npm install
```

### 4. Run (two terminals)

**Terminal 1 — Backend:**
```bash
uvicorn backend.main:app --reload
# API at http://localhost:8000
```

**Terminal 2 — Frontend:**
```bash
cd frontend && npm run dev
# UI at http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) and ask anything.

---

## Environment Variables

| Variable | Description |
|---|---|
| `ANTHROPIC_API_KEY` | Claude API key |
| `TAVILY_API_KEY` | Tavily search API key |

---

## API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/research` | POST | Start a research session (SSE stream) |
| `/api/history` | GET | List past reports |
| `/api/history/{id}` | GET | Get a specific report |
| `/api/history/{id}` | DELETE | Delete a report |
| `/api/export/{id}?format=markdown` | GET | Download as Markdown |
| `/api/export/{id}?format=pdf` | GET | Download as PDF |

---

## Deploy to HuggingFace Spaces

1. Create a new Space → **Docker** SDK
2. Push this repo to the Space
3. Add `ANTHROPIC_API_KEY` and `TAVILY_API_KEY` as **Space Secrets**
4. The `Dockerfile` handles the full multi-stage build automatically

---

## Project Structure

```
langchain-research-agent/
├── backend/
│   ├── main.py          # FastAPI app, CORS, static file serving
│   ├── api/
│   │   ├── research.py  # POST /research — SSE streaming endpoint
│   │   ├── history.py   # GET/DELETE /history — report CRUD
│   │   └── export.py    # GET /export — Markdown + PDF download
│   ├── core/
│   │   ├── state.py     # TypedDict graph state with reducers
│   │   ├── tools.py     # Tavily search tool wrapper
│   │   ├── agents.py    # Planner, researcher, synthesizer nodes
│   │   └── graph.py     # LangGraph StateGraph + Send routing
│   ├── models/
│   │   └── schemas.py   # Pydantic request/response models
│   └── storage/
│       └── db.py        # Async SQLite via aiosqlite
├── frontend/
│   └── src/
│       ├── App.jsx               # Main layout + state
│       ├── components/
│       │   ├── ResearchInput.jsx # Query input + depth selector
│       │   ├── AgentPipeline.jsx # Live step visualization
│       │   ├── ReportViewer.jsx  # Markdown report renderer
│       │   ├── SourcePanel.jsx   # Clickable source citations
│       │   ├── HistorySidebar.jsx# Past sessions browser
│       │   └── ExportButtons.jsx # PDF + Markdown download
│       └── hooks/
│           └── useSSE.js         # Fetch + ReadableStream SSE hook
├── Dockerfile            # HuggingFace Spaces multi-stage build
└── .env.example
```

---

## Related

- [Artificial Management AI OS](https://github.com/evanderpool/artificial-management) — 10-agent enterprise AI operating system this project is part of

---

*Built by [Erick Vanderpool](https://github.com/evanderpool) · Artificial Management*
