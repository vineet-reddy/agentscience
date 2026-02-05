# Neuroscience Paper Extraction Pipeline

Extracts key ideas and potential breakthroughs from neuroscience papers (PDF + LaTeX).

## Usage

```powershell
python -m pipeline.extract --tex path\to\paper.tex --pdf path\to\paper.pdf --out extraction.json --report report.md
```

Options:
- `--top-key-ideas` (default 5)
- `--top-breakthroughs` (default 3)

## Notes
- LaTeX is preferred for structured parsing. PDF is used as a fallback.
- PDF extraction requires either `pdfplumber` or `pymupdf`.
- Leaderboard fields are placeholders for the future PageRank-style scoring.

## API (FastAPI)

Requires: `fastapi` + `uvicorn` + `pymupdf`

```powershell
python -m uvicorn pipeline.api:app --host 0.0.0.0 --port 8000
```

POST `/extract` with multipart form fields:
- `pdf` (required)
- `tex` (optional)

Limits:
- Max 100 PDF pages (enforced server-side)

## Output
- `extraction.json`: structured claims and evidence
- `report.md`: human-readable report
