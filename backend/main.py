import logging
import os
from contextlib import asynccontextmanager
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.api.export import router as export_router
from backend.api.history import router as history_router
from backend.api.research import router as research_router
from backend.storage.db import init_db

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    for key in ("ANTHROPIC_API_KEY", "TAVILY_API_KEY"):
        if not os.getenv(key):
            logger.error("Missing required environment variable: %s", key)
            raise RuntimeError(f"Missing required environment variable: {key}")
        logger.info("Environment check OK: %s is set", key)
    await init_db()
    logger.info("Database initialized — app ready")
    yield


app = FastAPI(title="Research Intelligence Agent", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(research_router, prefix="/api")
app.include_router(history_router, prefix="/api")
app.include_router(export_router, prefix="/api")

# Serve built React app in production
_frontend_dist = Path(__file__).parent.parent / "frontend" / "dist"
if _frontend_dist.exists():
    app.mount("/", StaticFiles(directory=str(_frontend_dist), html=True), name="static")
