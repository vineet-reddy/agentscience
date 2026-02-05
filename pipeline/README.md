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

## Output
- `extraction.json`: structured claims and evidence
- `report.md`: human-readable report
