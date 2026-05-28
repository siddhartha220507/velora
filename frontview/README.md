# Velora

Velora is a full-stack deployment workspace for GitHub-connected projects. It combines account auth, project registration, encrypted environment variables, deployment tracking, rollback, and AI-assisted log analysis in one app.

## Why Velora is different

- GitHub login is supported, but GitHub is no longer the only way into the product.
- Local JWT login, Google login, and GitHub login can all access the dashboard.
- Repository import is treated as a separate GitHub capability, so users can sign in first and connect GitHub only when needed.
- AI log analysis is built with LangChain, which keeps provider switching and prompt orchestration clean.
- The backend serves the built frontend, which makes single-service Render deployment simpler.

## Tech stack

- Frontend: React, Vite, React Router, Axios, Framer Motion
- Backend: Node.js, Express, Passport, JWT, Socket.IO
- Database: MongoDB with Mongoose
- AI orchestration: LangChain
- AI providers currently wired: Gemini, Cohere, Mistral

## Project structure

```text
frontend/
  src/
    api/
    components/
    context/
    hooks/
    pages/

backend/
  src/
    config/
    controllers/
    middlewares/
    models/
    routes/
    services/
  dist/
```

## Local installation

### 1. Install dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2. Configure environment files

Backend local example:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=your-mongodb-uri
JWT_SECRET=your-jwt-secret
SESSION_SECRET=your-session-secret
ENCRYPTION_KEY=64-char-hex-key

FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
SESSION_COOKIE_SAME_SITE=lax
SESSION_COOKIE_SECURE=false

GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

GEMINI_API_KEY=
COHERE_API_KEY=
MISTRAL_API_KEY=
```

Frontend local example:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Run the app

```bash
cd backend
npm run dev

cd ../frontend
npm run dev
```

Backend runs on `http://localhost:5000` and frontend on `http://localhost:5173`.

## Production deployment on Render

Velora is set up to serve the frontend build from the backend service.

### Render service settings

- Root directory: `backend`
- Build command: `npm run build`
- Start command: `npm start`

### Production backend env

```env
NODE_ENV=production
PORT=5000
MONGO_URI=your-production-mongodb-uri
JWT_SECRET=your-jwt-secret
SESSION_SECRET=your-session-secret
ENCRYPTION_KEY=64-char-hex-key

FRONTEND_URL=https://veloraa-deploy.onrender.com
BACKEND_URL=https://veloraa-deploy.onrender.com
CORS_ALLOWED_ORIGINS=https://veloraa-deploy.onrender.com
SESSION_COOKIE_SAME_SITE=lax
SESSION_COOKIE_SECURE=true

GITHUB_CLIENT_ID=your-production-github-client-id
GITHUB_CLIENT_SECRET=your-production-github-client-secret
GITHUB_CALLBACK_URL=https://veloraa-deploy.onrender.com/api/auth/github/callback

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://veloraa-deploy.onrender.com/api/auth/google/callback

GEMINI_API_KEY=
COHERE_API_KEY=
MISTRAL_API_KEY=
```

### Frontend env note

If frontend and backend are served from the same Render service, Velora can fall back to same-origin `/api` and same-origin sockets automatically. `VITE_API_URL` and `VITE_SOCKET_URL` are mainly needed if you later split frontend into a separate service.

## OAuth callback URLs

Use these exact values in the OAuth providers.

### Local

```text
GitHub: http://localhost:5000/api/auth/github/callback
Google: http://localhost:5000/api/auth/google/callback
```

### Production

```text
GitHub: https://veloraa-deploy.onrender.com/api/auth/github/callback
Google: https://veloraa-deploy.onrender.com/api/auth/google/callback
```

## How authentication works

- Local auth uses Passport local strategy with JWT.
- Google auth creates or reuses a Velora user account.
- GitHub auth creates or reuses a Velora user account and also stores `githubAccessToken` for repository import.
- GitHub connection is now separate from basic login. A user can sign in through Google or local auth, open New Project, and then connect GitHub only when repository access is required.

## Project creation flow

1. Open `New Project`.
2. Choose a GitHub repository or paste a GitHub URL.
3. Confirm:
   `Project Name`
   `Repository Slug`
   `Production Branch`
   `Repository URL`
4. Adjust framework preset, install command, and start command if needed.
5. Add environment variables.
6. Deploy.

The backend now accepts an explicit `repoName` and can also derive it from the GitHub URL as a fallback.

## Environment variables

- Environment variables are stored on the project document.
- Values are encrypted before persistence.
- The frontend never receives raw secret values back from the backend.
- The environments pages now read from the actual database-backed project data.

## Deployment flow

- Creating a deployment inserts a deployment record first.
- The deployment service runs asynchronously.
- Socket.IO rooms stream deployment logs live to the frontend.
- Rollback creates a new deployment record with `rolling_back` status.
- Deployment status and history are stored in MongoDB.

## LangChain in Velora

Velora uses LangChain as the orchestration layer for AI-assisted log analysis.

### Why LangChain is used here

- One prompt pipeline across multiple providers
- Cleaner provider switching
- Easier fallback when one provider fails
- Easier future extension for richer chains and structured outputs

### Current LangChain usage

Inside `backend/src/services/logAnalysisService.js`:

- `PromptTemplate` from `@langchain/core/prompts`
- `ChatGoogleGenerativeAI` from `@langchain/google-genai`
- `ChatCohere` from `@langchain/cohere`
- `ChatMistralAI` from `@langchain/mistralai`

### How it behaves

- Initial deployment analysis returns structured JSON:
  - `rootCause`
  - `stepByStepFix`
  - `securityFlags`
- Follow-up questions return markdown-friendly text
- The service trims logs to recent high-signal sections before prompting
- Provider fallback is attempted automatically

### Why this is useful

- The UI can show consistent output even when providers change
- Root-cause analysis is easier to render and store
- Troubleshooting stays backend-controlled instead of leaking prompt logic into the client

## LangChain cheat sheet

### Core flow

```text
deployment logs
-> prompt template
-> selected LangChain chat model
-> parsed JSON or markdown
-> API response to frontend
```

### Files to know

```text
backend/src/services/logAnalysisService.js
backend/src/controllers/deploymentController.js
backend/src/controllers/projectController.js
frontend/src/pages/main_dashboard/NewProject.jsx
frontend/src/pages/auth/Callback.jsx
frontend/src/api/api.js
```

### Useful API endpoints

```text
POST /api/auth/login
POST /api/auth/register
GET  /api/auth/me
PUT  /api/auth/me
PUT  /api/auth/password

GET  /api/projects
POST /api/projects
GET  /api/projects/repos
GET  /api/projects/:id
PUT  /api/projects/:id
DELETE /api/projects/:id

GET  /api/projects/:id/env
POST /api/projects/:id/env
DELETE /api/projects/:id/env/:key

GET  /api/deployments?projectId=...
POST /api/deployments
GET  /api/deployments/:id
POST /api/deployments/:id/stop
POST /api/deployments/:id/analyze-logs
POST /api/deployments/:id/analyze/stream
POST /api/projects/:id/rollback/:version

GET  /api/workspace/overview
GET  /api/workspace/metrics
GET  /api/workspace/environments
GET  /api/workspace/notifications
GET  /api/workspace/members
POST /api/workspace/members/invite
GET  /api/workspace/search
```

## Common commands

```bash
# Backend dev
cd backend && npm run dev

# Frontend dev
cd frontend && npm run dev

# Frontend production build
cd frontend && npm run build

# Render-equivalent build
cd backend && npm run build

# Sync frontend build into backend/dist
cd backend && npm run sync:frontend-dist
```

## What is unique about this implementation

- GitHub connection is capability-based, not mandatory for every login.
- The frontend can run locally against the backend without extra proxy setup.
- The backend build process packages the frontend automatically for Render.
- Workspace-level dashboard data is aggregated from real project and deployment records.
- LangChain is already positioned as a reusable orchestration layer instead of a one-off AI helper.

## Troubleshooting

### I can log in but repo import says connect GitHub

That is expected for local or Google accounts until GitHub is linked. Connect GitHub from `New Project` or `Account`.

### Render says `vite: not found`

The backend build script must install frontend dev dependencies:

```bash
npm install --prefix ../frontend --include=dev
```

That is already part of `backend/package.json`.

### Project creation says `Please provide name, repoUrl, and repoName`

The frontend now sends `repoName`, and the backend can derive it from the GitHub URL if needed. If this still appears, confirm the repository URL is a valid GitHub HTTPS URL.

### AI analysis is failing

Check that at least one provider key is present:

- `GEMINI_API_KEY`
- `COHERE_API_KEY`
- `MISTRAL_API_KEY`

## Final note

This documentation is written to match the current codebase, not a future architecture deck. When auth flow, LangChain setup, deployment services, or env conventions change, this file should be updated alongside the code.
