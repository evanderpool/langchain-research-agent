import json

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from backend.core.graph import build_graph
from backend.models.schemas import ResearchRequest
from backend.storage.db import save_report

router = APIRouter()


@router.post("/research")
async def run_research(request: ResearchRequest):
    async def event_stream():
        graph = build_graph()
        initial_state = {
            "question": request.question,
            "depth": request.depth,
            "sub_questions": [],
            "search_results": [],
            "synthesis": "",
        }

        sub_questions = []
        all_sources = []
        synthesis = ""
        researcher_results = {}

        try:
            async for chunk in graph.astream(initial_state, stream_mode="updates"):
                for node_name, update in chunk.items():

                    if node_name == "planner":
                        sub_questions = update.get("sub_questions", [])
                        yield f"data: {json.dumps({'type': 'planner_done', 'sub_questions': sub_questions})}\n\n"

                    elif node_name == "researcher":
                        results = update.get("search_results", [])
                        if results:
                            item = results[-1]
                            sq = item["sub_question"]
                            researcher_results[sq] = item["results"]
                            all_sources.extend(item["results"])
                            yield f"data: {json.dumps({'type': 'researcher_done', 'sub_question': sq, 'results': item['results']})}\n\n"

                    elif node_name == "synthesizer":
                        synthesis = update.get("synthesis", "")
                        yield f"data: {json.dumps({'type': 'synthesis_done', 'synthesis': synthesis})}\n\n"

            # Deduplicate sources by URL
            seen = set()
            unique_sources = []
            for s in all_sources:
                if s["url"] and s["url"] not in seen:
                    seen.add(s["url"])
                    unique_sources.append(s)

            report_id = await save_report(
                question=request.question,
                sub_questions=sub_questions,
                synthesis=synthesis,
                sources=unique_sources,
                depth=request.depth,
            )

            yield f"data: {json.dumps({'type': 'saved', 'report_id': report_id, 'sources': unique_sources})}\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
