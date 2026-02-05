from __future__ import annotations

import tempfile
import uuid
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, File, HTTPException, UploadFile

from pipeline.extract import run_pipeline

MAX_PAGES = 100

app = FastAPI(title="AgentScience Extraction API", version="0.1.0")


def _pdf_page_count(pdf_bytes: bytes) -> int:
    try:
        import fitz  # type: ignore

        with fitz.open(stream=pdf_bytes, filetype="pdf") as doc:
            return doc.page_count
    except ImportError as exc:
        raise HTTPException(
            status_code=500,
            detail="PDF page counting requires pymupdf to be installed.",
        ) from exc


@app.post("/extract")
async def extract(pdf: UploadFile = File(...), tex: Optional[UploadFile] = File(default=None)):
    if pdf.content_type not in ("application/pdf", "application/x-pdf"):
        raise HTTPException(status_code=400, detail="`pdf` must be a PDF file.")

    pdf_bytes = await pdf.read()
    if not pdf_bytes:
        raise HTTPException(status_code=400, detail="`pdf` is empty.")

    if _pdf_page_count(pdf_bytes) > MAX_PAGES:
        raise HTTPException(
            status_code=400,
            detail=f"PDF exceeds max page count of {MAX_PAGES}.",
        )

    tex_bytes = await tex.read() if tex else None

    with tempfile.TemporaryDirectory() as temp_dir:
        temp_path = Path(temp_dir)
        pdf_path = temp_path / f"{uuid.uuid4()}.pdf"
        pdf_path.write_bytes(pdf_bytes)

        tex_path: Optional[Path] = None
        if tex_bytes:
            tex_path = temp_path / f"{uuid.uuid4()}.tex"
            tex_path.write_bytes(tex_bytes)

        result = run_pipeline(pdf_path=pdf_path, tex_path=tex_path, top_key_ideas=5, top_breakthroughs=3)
        return result.to_dict()
