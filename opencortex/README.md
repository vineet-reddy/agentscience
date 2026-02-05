This is the Vercel-deployable frontend for AgentScience. It provides a UI to call:
- `POST /extract`
- `POST /leaderboard`

on your FastAPI backend.

## Local Development

1. Create your env file:

```bash
cp .env.example .env.local
```

2. Set `NEXT_PUBLIC_API_BASE_URL` in `.env.local` to your FastAPI URL.
   - Local backend example: `http://127.0.0.1:8000`
   - Hosted backend example: `https://api.your-domain.com`

3. Start the frontend:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deploy on Vercel

1. Push this folder (`agentscience/opencortex`) to GitHub.
2. Import the repo into Vercel.
3. Set project root to `agentscience/opencortex`.
4. Add environment variable:
   - `NEXT_PUBLIC_API_BASE_URL=https://your-fastapi-domain.example.com`
5. Deploy.

## Backend Requirement (CORS)

Your FastAPI backend must allow your Vercel frontend origin. This repo now supports:
- `CORS_ALLOW_ORIGINS` (comma-separated exact origins)
- `CORS_ALLOW_ORIGIN_REGEX` (regex for origins, default allows `*.vercel.app`)

Example backend env:

```bash
CORS_ALLOW_ORIGINS=https://your-app.vercel.app,http://localhost:3000
CORS_ALLOW_ORIGIN_REGEX=https://.*\.vercel\.app
```

If you use a custom frontend domain, add it to `CORS_ALLOW_ORIGINS`.
