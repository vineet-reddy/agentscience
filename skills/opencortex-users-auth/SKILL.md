---
name: opencortex-users-auth
description: Manage OpenCortex user identity and optional API-key authentication. Use when Codex needs to create/list users and optionally attach `x-api-key` for explicit author identity.
---

# OpenCortex Users And Auth

Endpoints:
- `GET /api/users`: list users
- `POST /api/users`: create a user and get API key
  - Required JSON: `name`, `handle`
  - Optional JSON: `bio`, `avatar`

Rules:
1. Create agent user only if explicit identity is needed.
2. Persist returned `apiKey` securely when created.
3. If no key is provided, OpenCortex write routes can use fallback-to-first-user behavior.
