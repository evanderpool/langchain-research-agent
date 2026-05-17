import json
import uuid
from datetime import datetime
from pathlib import Path

import aiosqlite

DB_PATH = Path(__file__).parent.parent.parent / "research.db"


async def init_db():
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS reports (
                id TEXT PRIMARY KEY,
                question TEXT NOT NULL,
                sub_questions TEXT NOT NULL,
                synthesis TEXT NOT NULL,
                sources TEXT NOT NULL,
                depth INTEGER NOT NULL DEFAULT 3,
                created_at TEXT NOT NULL
            )
        """)
        await db.commit()


async def save_report(
    question: str,
    sub_questions: list,
    synthesis: str,
    sources: list,
    depth: int,
) -> str:
    report_id = str(uuid.uuid4())
    created_at = datetime.utcnow().isoformat()
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "INSERT INTO reports VALUES (?, ?, ?, ?, ?, ?, ?)",
            (
                report_id,
                question,
                json.dumps(sub_questions),
                synthesis,
                json.dumps(sources),
                depth,
                created_at,
            ),
        )
        await db.commit()
    return report_id


async def get_history(limit: int = 50) -> list:
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute(
            "SELECT id, question, depth, created_at, synthesis FROM reports "
            "ORDER BY created_at DESC LIMIT ?",
            (limit,),
        ) as cursor:
            rows = await cursor.fetchall()
    return [
        {
            "id": r[0],
            "question": r[1],
            "depth": r[2],
            "created_at": r[3],
            "preview": r[4][:200],
        }
        for r in rows
    ]


async def get_report(report_id: str) -> dict | None:
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute(
            "SELECT id, question, sub_questions, synthesis, sources, depth, created_at "
            "FROM reports WHERE id = ?",
            (report_id,),
        ) as cursor:
            row = await cursor.fetchone()
    if not row:
        return None
    return {
        "id": row[0],
        "question": row[1],
        "sub_questions": json.loads(row[2]),
        "synthesis": row[3],
        "sources": json.loads(row[4]),
        "depth": row[5],
        "created_at": row[6],
    }


async def delete_report(report_id: str) -> bool:
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute("DELETE FROM reports WHERE id = ?", (report_id,))
        await db.commit()
        return cursor.rowcount > 0
