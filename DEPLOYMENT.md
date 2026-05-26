# Deploy to Vercel — Step-by-Step Guide

This project deploys as **one Vercel app**:

- **Frontend** → static files (`frontend/dist`)
- **Backend API** → serverless function (`api/index.js` → Express)
- **Routes** → `/api/*` goes to the API; everything else serves the React app

---

## Prerequisites

1. [GitHub](https://github.com) account  
2. [Vercel](https://vercel.com) account (free tier works; see timeout note below)  
3. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster (free M0)  
4. [Groq API key](https://console.groq.com) (required)  
5. Optional: [Pinecone](https://app.pinecone.io) + [OpenAI](https://platform.openai.com) for semantic search  

---

## Step 1 — Push code to GitHub

```bash
cd automated_code_reviewer
git init
git add .
git commit -m "Prepare for Vercel deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/automated-code-reviewer.git
git push -u origin main
```

> **Security:** Never commit `backend/.env`. Only `.env.example` files belong in git.

---

## Step 2 — Create MongoDB Atlas

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).  
2. **Database Access** → add a database user (username + password).  
3. **Network Access** → add `0.0.0.0/0` (allow from anywhere) so Vercel serverless can connect.  
4. **Connect** → choose “Drivers” → copy connection string, e.g.:

   ```
   mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/code-reviewer?retryWrites=true&w=majority
   ```

   Replace `USER`, `PASSWORD`, and ensure the database name is `code-reviewer` (or update `MONGODB_URI`).

---

## Step 3 — Import project in Vercel

1. Go to [vercel.com/new](https://vercel.com/new).  
2. **Import** your GitHub repository.  
3. **Root Directory:** leave as `.` (repository root).  
4. Vercel should detect settings from `vercel.json`:
   - **Build Command:** `npm run build -w frontend`
   - **Output Directory:** `frontend/dist`
   - **Install Command:** `npm install`

5. Do **not** deploy yet — add environment variables first (Step 4).

---

## Step 4 — Environment variables (Vercel Dashboard)

In **Project → Settings → Environment Variables**, add these for **Production** (and Preview if you want):

| Variable | Required | Example / Notes |
|----------|----------|-----------------|
| `NODE_ENV` | Yes | `production` |
| `MONGODB_URI` | Yes | Atlas connection string from Step 2 |
| `JWT_SECRET` | Yes | Long random string (e.g. `openssl rand -base64 32`) |
| `GROQ_API_KEY` | Yes | `gsk_...` from Groq Console |
| `GROQ_MODEL` | No | `llama-3.3-70b-versatile` (default) |
| `LANGSMITH_TRACING` | No | Set `true` to enable LangSmith traces |
| `LANGSMITH_API_KEY` | If tracing | `lsv2_...` from LangSmith |
| `LANGSMITH_PROJECT` | No | `automated-code-reviewer` |
| `LANGSMITH_TRACE_CODE` | No | Keep `false` unless reviewed code may be sent to LangSmith |
| `CLIENT_URL` | Yes* | Your production URL, e.g. `https://your-app.vercel.app` |
| `PINECONE_API_KEY` | No | For semantic search |
| `PINECONE_INDEX_NAME` | No | `code-reviews` (1536 dimensions) |
| `OPENAI_API_KEY` | No | For embeddings (semantic search) |
| `GITHUB_TOKEN` | No | Higher GitHub API limits |

\* After the first deploy, set `CLIENT_URL` to your real Vercel URL (Settings → Domains). Redeploy once updated.

**Frontend build variable:**

| Variable | Value |
|----------|--------|
| `VITE_API_URL` | `/api` |

Using `/api` keeps API calls on the same domain (no CORS issues).

---

## Step 5 — Deploy

1. Click **Deploy**.  
2. Wait for build to finish (frontend build + API bundle).  
3. Open your deployment URL, e.g. `https://automated-code-reviewer.vercel.app`.

---

## Step 6 — Verify deployment

1. **Health check:**  
   `https://YOUR-APP.vercel.app/api/health`  
   Should return JSON: `{ "success": true, ... }`

2. **Register** a new account on the site.  
3. **Run a code review** in the Editor (JavaScript or Python).  

If health check fails with database error → fix `MONGODB_URI` and Atlas network access.

---

## Step 7 — Custom domain (optional)

1. Vercel → **Settings → Domains** → add your domain.  
2. Update `CLIENT_URL` to `https://yourdomain.com`.  
3. Redeploy.

---

## Important: Function duration

AI code reviews call Groq and can take **15–60 seconds**.

This project sets `maxDuration: 60` for `api/index.js` in `vercel.json`. Vercel's current Fluid Compute defaults allow longer function durations than older Hobby limits, so 60 seconds is usually enough for this app.

**If reviews still fail with timeout or feel slow:**

- Increase `functions.api/index.js.maxDuration` in `vercel.json` if your Vercel plan allows it, **or**
- Deploy only the **frontend** on Vercel and host the API on [Render](https://render.com) using `backend/render.yaml` (set `VITE_API_URL` to your Render API URL).

---

## Local vs production

| | Local | Vercel |
|---|--------|--------|
| Frontend | `npm run dev:frontend` → :5173 | Static + CDN |
| API | `npm run dev:backend` → :5001 | `/api` serverless |
| Env file | `backend/.env` | Vercel dashboard only |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Groq API key not configured | Add `GROQ_API_KEY` in Vercel env vars, redeploy |
| CORS error | Set `CLIENT_URL` to exact frontend URL (no trailing slash) |
| MongoDB connection failed | Atlas IP allowlist `0.0.0.0/0`, correct URI, URL-encode password |
| `language override unsupported` | Redeploy latest code (MongoDB index fix) |
| Review timeout | Vercel Pro or move API to Render |
| 404 on refresh | `vercel.json` rewrites should include SPA fallback (already configured) |

---

## Redeploy after changes

```bash
git add .
git commit -m "Your changes"
git push
```

Vercel auto-deploys on push to `main`.

---

## Optional: Deploy with Vercel CLI

```bash
npm i -g vercel
cd automated_code_reviewer
vercel login
vercel          # first deploy (follow prompts)
vercel --prod   # production deploy
```

Add env vars with:

```bash
vercel env add GROQ_API_KEY
vercel env add MONGODB_URI
# ... etc
```
