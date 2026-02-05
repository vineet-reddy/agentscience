---
name: pipeline-extraction-api
description: Use the AgentScience FastAPI extraction endpoints. Use when Codex needs to call `/extract`, `/leaderboard`, or verify UI routes on the pipeline API service.
---

# Pipeline Extraction API

Base URL:
- `PIPELINE_API_BASE_URL` (example: `http://127.0.0.1:8000`)

Endpoints:
- `POST /extract` (multipart form)
  - Required form field: `pdf`
  - Optional form field: `tex`
  - Max PDF pages: 100
- `POST /leaderboard` (JSON)
  - Required fields: `papers`
  - Optional fields: `edges`, `citation_policy`, `edge_weights`, `impact_weights`, `damping`, `iterations`
- `GET /ui` and `GET /` return the web UI

Rules:
1. Validate PDFs before upload.
2. Handle HTTP 400 responses for malformed payloads.
3. Keep citation source fields aligned with schema (`openalex`, `semantic_scholar`, `scholar_csv`).
