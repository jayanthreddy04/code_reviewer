# AI-Powered Automated Code Reviewer

A full-stack application that provides AI-generated code reviews using **Groq**, semantic search with **Pinecone**, GitHub repository scanning, and a modern React + Tailwind UI with Monaco Editor.

![Stack](https://img.shields.io/badge/React-Vite-61DAFB)
![Stack](https://img.shields.io/badge/Node-Express-339933)
![AI](https://img.shields.io/badge/Groq-LLM-F55036)

## Features

- **Code Review Editor** — Paste snippets with Monaco Editor (JS, TS, Python, Java, C++, Go)
- **File Upload Review** — Upload source files up to 5MB
- **GitHub Repository Analyzer** — Scan public repos or specific files
- **AI Analysis** — Bugs, security, performance, refactoring, complexity, best practices
- **Inline Comments** — Line-by-line suggestions with severity (low/medium/high)
- **Quality Score** — Visual score chart (0–100)
- **Export Reports** — Download as PDF or TXT
- **Review History** — Dashboard with pagination
- **Semantic Search** — Natural language search via Pinecone embeddings
- **JWT Authentication** — Register/login with protected routes
- **Dark/Light Mode** — Theme toggle with persistence

## Project Structure

```
automated_code_reviewer/
├── backend/                 # Express.js API
│   ├── src/
│   │   ├── config/          # Environment & database
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # Auth, validation, errors
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API routes
│   │   ├── services/        # Groq, Pinecone, GitHub, AST
│   │   ├── utils/           # Helpers
│   │   └── validators/      # express-validator rules
│   └── package.json
├── frontend/                # React + Vite + Tailwind
│   ├── src/
│   │   ├── components/      # UI, editor, review panels
│   │   ├── context/         # Auth & theme
│   │   ├── pages/           # Home, Editor, Upload, etc.
│   │   └── lib/             # API client
│   └── package.json
└── README.md
```

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- [Groq API Key](https://console.groq.com) (required)
- [OpenAI API Key](https://platform.openai.com) (for embeddings / semantic search)
- [Pinecone](https://app.pinecone.io) account (optional, for semantic search)
- [GitHub Token](https://github.com/settings/tokens) (optional, for higher rate limits)

## Quick Start

### 1. Clone and install

```bash
cd automated_code_reviewer
npm run install:all
```

### 2. Configure environment

**Backend** — copy and edit:

```bash
cp backend/.env.example backend/.env
```

**Frontend**:

```bash
cp frontend/.env.example frontend/.env
```

### 3. Start MongoDB

```bash
# macOS with Homebrew
brew services start mongodb-community

# Or use MongoDB Atlas connection string in MONGODB_URI
```

### 4. Set up Pinecone (optional)

1. Create an index named `code-reviews` with **1536 dimensions** (text-embedding-3-small)
2. Use **cosine** similarity metric
3. Add `PINECONE_API_KEY` and `OPENAI_API_KEY` to `backend/.env`

### 5. Run the application

> **macOS note:** Port `5000` is often used by AirPlay Receiver. This project defaults to **`5001`** to avoid `EADDRINUSE` errors.

```bash
# Terminal 1 — Backend
npm run dev:backend

# Terminal 2 — Frontend
npm run dev:frontend
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5001/api/health

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register user | No |
| POST | `/api/auth/login` | Login | No |
| GET | `/api/auth/me` | Current user | Yes |
| POST | `/api/review/code` | Review code snippet | Yes |
| POST | `/api/review/file` | Review uploaded file | Yes |
| POST | `/api/review/github` | Review GitHub repo | Yes |
| GET | `/api/review/history` | List review history | Yes |
| GET | `/api/review/:id` | Get single review | Yes |
| GET | `/api/review/:id/export` | Export PDF/TXT | Yes |
| POST | `/api/review/search` | Semantic search | Yes |

## API Testing Examples

### Register

```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

### Login

```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

Save the `token` from the response.

### Review Code

```bash
curl -X POST http://localhost:5001/api/review/code \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "code": "function add(a, b) { var x = a + b; console.log(x); return x; }",
    "language": "javascript",
    "title": "Test Review"
  }'
```

### Review GitHub Repo

```bash
curl -X POST http://localhost:5001/api/review/github \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"repoUrl": "facebook/react", "maxFiles": 2}'
```

### Semantic Search

```bash
curl -X POST http://localhost:5001/api/review/search \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"query": "security vulnerabilities in authentication", "limit": 5}'
```

### Export Review

```bash
curl -X GET "http://localhost:5001/api/review/REVIEW_ID/export?format=pdf" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output review.pdf
```

## Groq Integration

The backend uses the official `groq-sdk` package with JSON response format for structured reviews.

1. Sign up at https://console.groq.com
2. Create an API key
3. Set in `backend/.env`:

```env
GROQ_API_KEY=gsk_your_key_here
GROQ_MODEL=llama-3.3-70b-versatile
```

## LangSmith Tracing

The backend traces Groq review calls with the LangSmith SDK. Prompt and response content is redacted by default; enable `LANGSMITH_TRACE_CODE=true` only if you are comfortable sending reviewed source code to LangSmith.

1. Create a LangSmith API key at https://smith.langchain.com
2. Set in `backend/.env`:

```env
LANGSMITH_TRACING=true
LANGSMITH_API_KEY=lsv2_your_key_here
LANGSMITH_PROJECT=automated-code-reviewer
LANGSMITH_TRACE_CODE=false
```

## Deployment

**Full guide:** see [DEPLOYMENT.md](./DEPLOYMENT.md)

### Recommended: Full stack on Vercel (single project)

1. Push repo to GitHub  
2. Import in [Vercel](https://vercel.com) (root directory: `.`)  
3. Add environment variables from `backend/.env.example` + `VITE_API_URL=/api`  
4. Deploy — frontend at `/`, API at `/api/*`

### Alternative: Frontend on Vercel + API on Render

If AI reviews timeout on Vercel Hobby (10s limit), deploy the API separately:

1. **Vercel** — root `frontend/`, set `VITE_API_URL=https://your-api.onrender.com/api`  
2. **Render** — use `backend/render.yaml`, set `CLIENT_URL` to your Vercel URL  

### MongoDB Atlas

Use a free M0 cluster and set:

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/code-reviewer
```

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | Yes | Groq LLM API key |
| `LANGSMITH_TRACING` | Optional | Enable LangSmith traces (`true`/`false`) |
| `LANGSMITH_API_KEY` | If tracing | LangSmith API key |
| `LANGSMITH_PROJECT` | Optional | LangSmith project name |
| `LANGSMITH_TRACE_CODE` | Optional | Include full prompt/code in traces (`false` by default) |
| `MONGODB_URI` | Yes* | MongoDB connection (*required in production) |
| `JWT_SECRET` | Yes | Secret for JWT signing |
| `CLIENT_URL` | Yes | Frontend URL for CORS |
| `OPENAI_API_KEY` | For search | Embeddings for Pinecone |
| `PINECONE_API_KEY` | For search | Vector database |
| `GITHUB_TOKEN` | Optional | GitHub API rate limits |

## Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS, Monaco Editor, Recharts, React Router, Axios, React Hot Toast

**Backend:** Express.js, MongoDB/Mongoose, Groq SDK, Pinecone, LangChain packages, Babel Parser, Acorn, JWT, Multer, Helmet, Rate Limiting

## License

MIT
