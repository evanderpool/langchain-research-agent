import markdown
from fastapi import APIRouter, HTTPException
from fastapi.responses import Response

from backend.storage.db import get_report

router = APIRouter()

_PDF_CSS = """
body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, sans-serif;
    max-width: 800px; margin: 40px auto; padding: 0 24px;
    color: #1a1a1a; line-height: 1.7; font-size: 15px;
}
h1 { color: #0f172a; border-bottom: 3px solid #00d4aa; padding-bottom: 12px; font-size: 24px; }
h2 { color: #1e293b; margin-top: 2em; font-size: 18px; }
h3 { color: #334155; font-size: 15px; }
a { color: #00b894; text-decoration: none; }
code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 0.88em; font-family: monospace; }
pre { background: #f1f5f9; padding: 16px; border-radius: 8px; overflow-x: auto; }
blockquote { border-left: 4px solid #00d4aa; margin: 0; padding-left: 16px; color: #475569; }
strong { color: #0f172a; }
hr { border: none; border-top: 1px solid #e2e8f0; margin: 2em 0; }
ul, ol { padding-left: 1.5em; }
li { margin-bottom: 4px; }
"""


@router.get("/export/{report_id}")
async def export_report(report_id: str, format: str = "markdown"):
    report = await get_report(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    sources_md = "\n".join(f"- {s['url']}" for s in report.get("sources", []) if s.get("url"))
    md_content = report["synthesis"]
    if sources_md and "## Sources" not in md_content:
        md_content += f"\n\n## Sources\n\n{sources_md}"

    if format == "markdown":
        filename = report["question"][:40].replace(" ", "-").lower()
        return Response(
            content=md_content.encode("utf-8"),
            media_type="text/markdown",
            headers={"Content-Disposition": f'attachment; filename="{filename}.md"'},
        )

    if format == "pdf":
        try:
            import weasyprint

            html_body = markdown.markdown(md_content, extensions=["extra", "tables", "fenced_code"])
            full_html = f"<!DOCTYPE html><html><head><meta charset='utf-8'><style>{_PDF_CSS}</style></head><body>{html_body}</body></html>"
            pdf_bytes = weasyprint.HTML(string=full_html).write_pdf()
            filename = report["question"][:40].replace(" ", "-").lower()
            return Response(
                content=pdf_bytes,
                media_type="application/pdf",
                headers={"Content-Disposition": f'attachment; filename="{filename}.pdf"'},
            )
        except ImportError:
            raise HTTPException(
                status_code=501,
                detail="PDF export requires weasyprint: pip install weasyprint",
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"PDF generation failed: {e}")

    raise HTTPException(status_code=400, detail="format must be 'markdown' or 'pdf'")
