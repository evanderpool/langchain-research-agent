import operator
from typing import Annotated, List, TypedDict


class ResearchState(TypedDict):
    question: str
    sub_questions: List[str]
    search_results: Annotated[List[dict], operator.add]
    synthesis: str


class SubQuestionState(TypedDict):
    sub_question: str
    main_question: str
