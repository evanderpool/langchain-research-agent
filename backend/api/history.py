from fastapi import APIRouter, HTTPException

from backend.storage.db import delete_report, get_history, get_report

router = APIRouter()


@router.get("/history")
async def list_history(limit: int = 50):
    return await get_history(limit=limit)


@router.get("/history/{report_id}")
async def get_report_detail(report_id: str):
    report = await get_report(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report


@router.delete("/history/{report_id}")
async def delete_report_endpoint(report_id: str):
    deleted = await delete_report(report_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Report not found")
    return {"status": "deleted"}
