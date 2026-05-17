from typing import List
from pydantic import BaseModel, Field


class ResearchRequest(BaseModel):
    question: str
    depth: int = Field(default=3, ge=2, le=5)


class Source(BaseModel):
    url: str
    content: str


class HistoryItem(BaseModel):
    id: str
    question: str
    depth: int
    created_at: str
    preview: str


class Report(BaseModel):
    id: str
    question: str
    sub_questions: List[str]
    synthesis: str
    sources: List[Source]
    depth: int
    created_at: str
