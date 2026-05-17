from langgraph.constants import Send
from langgraph.graph import END, START, StateGraph

from .agents import planner_node, researcher_node, synthesizer_node
from .state import ResearchState, SubQuestionState


def _route_to_researchers(state: ResearchState):
    return [
        Send("researcher", {
            "sub_question": q,
            "main_question": state["question"],
        })
        for q in state["sub_questions"]
    ]


def build_graph():
    builder = StateGraph(ResearchState)

    builder.add_node("planner", planner_node)
    builder.add_node("researcher", researcher_node)
    builder.add_node("synthesizer", synthesizer_node)

    builder.add_edge(START, "planner")
    builder.add_conditional_edges("planner", _route_to_researchers, ["researcher"])
    builder.add_edge("researcher", "synthesizer")
    builder.add_edge("synthesizer", END)

    return builder.compile()
