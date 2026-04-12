import json
import uuid
from typing import Optional
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse, Response
from pydantic import BaseModel
from services.scraper import scrape_website
from services.claude_service import generate_report_stream
from services.pdf_service import generate_pdf

router = APIRouter()

# In-memory store for completed reports (single-instance Railway deployment)
_reports: dict[str, dict] = {}


class GenerateRequest(BaseModel):
    industry: str
    what_selling: Optional[str] = ""
    geography: str = "Global"
    company_url: Optional[str] = None


async def event_stream(request: GenerateRequest):
    report_id = str(uuid.uuid4())
    company_data = None

    # Step 1: Scrape company website if provided
    if request.company_url and request.company_url.strip():
        yield f"data: {json.dumps({'step': 'scraping', 'message': 'Analysing your company website…'})}

"
        try:
            company_data = await scrape_website(request.company_url.strip())
            if company_data.get("error"):
                yield f"data: {json.dumps({'step': 'scraping_warn', 'message': f'Could not scrape website: {company_data[\"error\"]}' })}

"
                company_data = None
            else:
                yield f"data: {json.dumps({'step': 'scraping_done', 'message': 'Website analysed ✓'})}

"
        except Exception as e:
            yield f"data: {json.dumps({'step': 'scraping_warn', 'message': f'Scraping failed: {str(e)}'})}

"
            company_data = None

    # Step 2: Stream Claude generation
    yield f"data: {json.dumps({'step': 'generating', 'message': 'Generating your intelligence report…'})}

"

    full_json = ""
    try:
        async for chunk in generate_report_stream(
            industry=request.industry,
            what_selling=request.what_selling or "",
            geography=request.geography,
            company_data=company_data,
        ):
            full_json += chunk

        # Parse and store
        report = json.loads(full_json)
        _reports[report_id] = {
            "report": report,
            "industry": request.industry,
            "what_selling": request.what_selling or "",
            "geography": request.geography,
        }

        yield f"data: {json.dumps({'step': 'complete', 'report_id': report_id, 'data': report})}

"

    except json.JSONDecodeError as e:
        yield f"data: {json.dumps({'step': 'error', 'message': 'Failed to parse report. Please try again.'})}

"
    except Exception as e:
        yield f"data: {json.dumps({'step': 'error', 'message': str(e)})}

"


@router.post("/generate")
async def generate(request: GenerateRequest):
    return StreamingResponse(
        event_stream(request),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


@router.get("/report/{report_id}/pdf")
async def download_pdf(report_id: str):
    stored = _reports.get(report_id)
    if not stored:
        raise HTTPException(status_code=404, detail="Report not found or expired")

    pdf_bytes = generate_pdf(
        report=stored["report"],
        industry=stored["industry"],
        geography=stored["geography"],
        what_selling=stored["what_selling"],
    )

    filename = f"outreach-report-{stored['industry'][:30].replace(' ', '-').lower()}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
