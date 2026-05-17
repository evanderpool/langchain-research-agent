import os

import streamlit as st
from dotenv import load_dotenv

load_dotenv()

st.set_page_config(
    page_title="Multi-Agent Research Assistant",
    page_icon="🔬",
    layout="wide",
)

st.title("Multi-Agent Research Assistant")
st.caption("Powered by LangGraph + LangChain + Claude + Tavily")

with st.sidebar:
    st.header("How it works")
    st.markdown("""
    1. **Planner** breaks your question into 3–4 focused sub-questions
    2. **Researchers** run parallel web searches (one per sub-question)
    3. **Synthesizer** combines all findings into a structured report

    Built with:
    - [LangGraph](https://langchain-ai.github.io/langgraph/) — stateful multi-agent orchestration
    - [LangChain](https://python.langchain.com/) — chain composition & tool use
    - [Anthropic Claude](https://anthropic.com) — LLM backbone
    - [Tavily](https://tavily.com) — real-time web search
    """)

    st.divider()
    anthropic_key = st.text_input("Anthropic API Key", type="password",
                                   value=os.getenv("ANTHROPIC_API_KEY", ""))
    tavily_key = st.text_input("Tavily API Key", type="password",
                                value=os.getenv("TAVILY_API_KEY", ""))

question = st.text_input(
    "Research question",
    placeholder="e.g. What are the key trends in AI agent frameworks in 2025?",
)

run = st.button("Research", type="primary", disabled=not question)

if run and question:
    if not anthropic_key or not tavily_key:
        st.error("Both API keys are required. Add them in the sidebar.")
        st.stop()

    os.environ["ANTHROPIC_API_KEY"] = anthropic_key
    os.environ["TAVILY_API_KEY"] = tavily_key

    from src.graph import graph

    col1, col2 = st.columns([1, 2])

    with col1:
        st.subheader("Agent Activity")
        planner_status = st.status("Planner — breaking down question...", expanded=True)
        researcher_placeholder = st.empty()
        synth_status = st.empty()

    with col2:
        st.subheader("Research Report")
        report_placeholder = st.empty()

    try:
        sub_questions_shown = False
        for event in graph.stream(
            {"question": question, "search_results": []},
            stream_mode="updates",
        ):
            node_name = list(event.keys())[0]
            node_output = event[node_name]

            if node_name == "planner":
                planner_status.update(label="Planner — complete", state="complete")
                subs = node_output.get("sub_questions", [])
                with researcher_placeholder.container():
                    st.markdown("**Sub-questions:**")
                    for i, q in enumerate(subs, 1):
                        st.markdown(f"{i}. {q}")
                    researcher_statuses = [
                        st.status(f"Researcher {i} — searching...", expanded=False)
                        for i in range(1, len(subs) + 1)
                    ]
                sub_questions_shown = True

            elif node_name == "researcher":
                if sub_questions_shown and "researcher_statuses" in dir():
                    for rs in researcher_statuses:
                        rs.update(label=rs.label.replace("searching...", "complete"), state="complete")

            elif node_name == "synthesizer":
                synth_status.status("Synthesizer — complete", state="complete")
                report = node_output.get("synthesis", "")
                report_placeholder.markdown(report)

        st.success("Research complete.")

    except Exception as e:
        st.error(f"Error: {e}")
        raise
