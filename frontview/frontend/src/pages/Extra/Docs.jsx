import React, { useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { BookOpen, Bot, GitBranch, KeyRound, PlayCircle, Rocket, Shield, TerminalSquare } from "lucide-react";
import GlassButton from "../../components/ui/GlassButton";
import BrandLogo from "../../components/ui/BrandLogo";

const codeBlock = (text) => (
  <pre className="mt-4 overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#050505] p-4 text-[12px] text-[#d4d4d8]">
    <code>{text}</code>
  </pre>
);

const sections = {
  overview: {
    title: "Overview",
    icon: Rocket,
    intro: "Velora is a full-stack deployment workspace for GitHub-connected projects. It handles account auth, project registration, environment variables, deployment tracking, rollback, and AI-assisted log analysis from one dashboard.",
    blocks: [
      {
        heading: "What makes it different",
        points: [
          "Local login, Google login, and GitHub login all land in the same workspace model.",
          "GitHub connection is treated as a capability, not the only way to sign in, so JWT and Google users can still access the app and then connect GitHub only when they need repo import.",
          "Deployment logs can be analyzed through LangChain with provider fallback instead of being hard-wired to one model vendor.",
          "The backend serves the built frontend, which keeps Render deployment simpler for a single-service setup.",
        ],
      },
      {
        heading: "Current architecture",
        points: [
          "Frontend: React, Vite, Tailwind-style utility classes, Axios, Framer Motion, React Router.",
          "Backend: Express, Mongoose, Passport, JWT, Socket.IO, LangChain provider adapters.",
          "Database: MongoDB for users, projects, deployments, invites, and encrypted environment variables.",
          "AI: LangChain prompt orchestration with Gemini, Cohere, and Mistral providers.",
        ],
      },
    ],
  },
  quickstart: {
    title: "Quickstart",
    icon: PlayCircle,
    intro: "This is the fastest path to run the app locally and understand the production shape.",
    blocks: [
      {
        heading: "Install",
        points: [
          "Install backend dependencies in `backend`.",
          "Install frontend dependencies in `frontend`.",
          "Use the example env files as a base and set your own secrets before running either server.",
        ],
        code: `cd backend\nnpm install\n\ncd ../frontend\nnpm install`,
      },
      {
        heading: "Run locally",
        points: [
          "Start the backend on port `5000`.",
          "Start the frontend on port `5173`.",
          "The frontend runtime automatically points local browser traffic at `http://localhost:5000` when `VITE_API_URL` is missing.",
        ],
        code: `cd backend\nnpm run dev\n\ncd ../frontend\nnpm run dev`,
      },
      {
        heading: "Render build",
        points: [
          "Render should use the `backend` directory as the service root.",
          "The backend build script installs frontend dev dependencies, runs the Vite build, and syncs `frontend/dist` into `backend/dist`.",
          "The backend then serves the built frontend directly.",
        ],
        code: `cd backend\nnpm run build\nnpm start`,
      },
    ],
  },
  auth: {
    title: "Authentication",
    icon: Shield,
    intro: "Velora now separates account authentication from GitHub repository access, which fixes the confusing redirect loop you were seeing.",
    blocks: [
      {
        heading: "How auth works",
        points: [
          "Local login uses email and password through Passport LocalStrategy.",
          "Google login creates or reuses a user account but does not automatically grant GitHub repository access.",
          "GitHub login attaches `githubId` and `githubAccessToken` so repo import can call the GitHub API.",
          "JWT is stored in local storage and sent through Axios for protected API calls.",
        ],
      },
      {
        heading: "Connect GitHub after login",
        points: [
          "If a user signs in with Google or local auth and opens New Project, Velora now shows a connect prompt instead of redirecting back to `/login`.",
          "The app stores a temporary post-auth redirect in session storage, so after GitHub OAuth it can return to `/projects/new` or `/account`.",
          "Missing GitHub access now returns `403 GITHUB_CONNECTION_REQUIRED` instead of a generic `401` session failure.",
        ],
      },
      {
        heading: "Callback URLs",
        code: `Local GitHub:  http://localhost:5000/api/auth/github/callback\nLocal Google:  http://localhost:5000/api/auth/google/callback\n\nRender GitHub: https://veloraa-deploy.onrender.com/api/auth/github/callback\nRender Google: https://veloraa-deploy.onrender.com/api/auth/google/callback`,
      },
    ],
  },
  projects: {
    title: "Projects",
    icon: GitBranch,
    intro: "Project creation now sends the repo slug the backend expects and exposes the important fields in the UI.",
    blocks: [
      {
        heading: "Create project flow",
        points: [
          "Select a GitHub repository or paste a public GitHub URL.",
          "Velora normalizes the repository URL into `https://github.com/owner/repo.git`.",
          "The UI now keeps `repoName`, `repoUrl`, `branch`, `framework`, `installCommand`, and `startCommand` visible during configuration.",
          "The backend also derives `repoName` from the URL as a fallback, so project creation is more resilient.",
        ],
      },
      {
        heading: "Environment variables",
        points: [
          "Variables are created against the project after project creation succeeds.",
          "Values are encrypted before persistence and never returned raw to the frontend.",
          "Workspace and project environment screens now read their data from the database rather than hardcoded mock rows.",
        ],
      },
    ],
  },
  langchain: {
    title: "LangChain AI",
    icon: Bot,
    intro: "Velora uses LangChain as the orchestration layer for AI log analysis. That means prompts, model adapters, and provider fallback live behind one backend service instead of being scattered across the app.",
    blocks: [
      {
        heading: "Why LangChain here",
        points: [
          "It gives one prompt pipeline regardless of model provider.",
          "It keeps provider-specific setup in one place instead of branching across controllers.",
          "It makes fallback from one provider to another straightforward.",
          "It keeps the app open for future chains like summarization, deployment advice, or repo-aware remediation.",
        ],
      },
      {
        heading: "Current provider setup",
        points: [
          "Gemini through `@langchain/google-genai`.",
          "Cohere through `@langchain/cohere`.",
          "Mistral through `@langchain/mistralai`.",
          "Prompt templating through `@langchain/core/prompts`.",
        ],
        code: `// backend/src/services/logAnalysisService.js\nPromptTemplate -> selected LangChain chat model -> structured JSON or markdown output`,
      },
      {
        heading: "How to use it",
        points: [
          "Trigger a deployment and open its logs.",
          "Call the analyze endpoint for a one-shot diagnosis or the stream endpoint for SSE-based output.",
          "Choose a preferred provider, but Velora will try fallback providers when available keys exist.",
        ],
        code: `POST /api/deployments/:id/analyze-logs\nPOST /api/deployments/:id/analyze/stream`,
      },
      {
        heading: "Why this implementation is useful",
        points: [
          "Initial analysis returns structured JSON: root cause, step-by-step fix, and security flags.",
          "Follow-up analysis returns markdown for conversational troubleshooting.",
          "The service trims logs to the recent high-signal portion before prompting, which controls token usage.",
        ],
      },
    ],
  },
  env: {
    title: "Environment Setup",
    icon: KeyRound,
    intro: "Use different env files for local and production, but keep the meaning of each variable consistent.",
    blocks: [
      {
        heading: "Backend env keys",
        code: `NODE_ENV\nPORT\nMONGO_URI\nJWT_SECRET\nSESSION_SECRET\nENCRYPTION_KEY\nFRONTEND_URL\nBACKEND_URL\nCORS_ALLOWED_ORIGINS\nSESSION_COOKIE_SAME_SITE\nSESSION_COOKIE_SECURE\nGITHUB_CLIENT_ID\nGITHUB_CLIENT_SECRET\nGITHUB_CALLBACK_URL\nGOOGLE_CLIENT_ID\nGOOGLE_CLIENT_SECRET\nGOOGLE_CALLBACK_URL\nGEMINI_API_KEY\nCOHERE_API_KEY\nMISTRAL_API_KEY`,
      },
      {
        heading: "Frontend env keys",
        code: `VITE_API_URL\nVITE_SOCKET_URL`,
      },
      {
        heading: "Production note",
        points: [
          "If backend and frontend are served from the same Render service, the frontend runtime can fall back to same-origin `/api` and same-origin sockets.",
          "If you later split frontend into a separate service, set `VITE_API_URL` and `VITE_SOCKET_URL` explicitly.",
        ],
      },
    ],
  },
  cheatsheet: {
    title: "Cheat Sheet",
    icon: TerminalSquare,
    intro: "A quick reference for everyday work on this repo.",
    blocks: [
      {
        heading: "Useful commands",
        code: `# backend dev\ncd backend && npm run dev\n\n# frontend dev\ncd frontend && npm run dev\n\n# frontend production build\ncd frontend && npm run build\n\n# render-equivalent build\ncd backend && npm run build\n\n# sync built frontend into backend/dist\ncd backend && npm run sync:frontend-dist`,
      },
      {
        heading: "Common flows",
        points: [
          "Local or Google user wants to import repos: go to New Project, click Connect GitHub, finish OAuth, return to the same page.",
          "Create a project: choose repo, confirm repo slug and branch, add commands or env vars, deploy.",
          "Analyze logs: open deployment logs, run AI analysis, inspect root cause and recommended fix list.",
        ],
      },
      {
        heading: "High-signal files",
        code: `frontend/src/pages/main_dashboard/NewProject.jsx\nfrontend/src/api/api.js\nfrontend/src/pages/auth/Callback.jsx\nbackend/src/controllers/projectController.js\nbackend/src/services/logAnalysisService.js\nbackend/src/config/passportSetup.js`,
      },
    ],
  },
};

const groupedMenu = [
  { title: "Platform", ids: ["overview", "quickstart", "auth", "projects"] },
  { title: "AI and Ops", ids: ["langchain", "env", "cheatsheet"] },
];

export default function Docs() {
  const [currentSection, setCurrentSection] = useState("overview");
  const current = sections[currentSection];
  const CurrentIcon = current.icon;

  const sectionList = useMemo(
    () => groupedMenu.map((group) => ({
      ...group,
      items: group.ids.map((id) => ({ id, title: sections[id].title })),
    })),
    []
  );

  return (
    <div className="min-h-screen bg-[#070809] text-[#d4d4d8]">
      <nav className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#070809]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-4 py-4 md:px-6">
          <BrandLogo to="/" />
          <div className="hidden md:flex items-center gap-7 text-[13px] text-[#8a8f98]">
            <NavLink to="/" className="hover:text-white transition-colors">Home</NavLink>
            <span className="text-white">Documentation</span>
            <NavLink to="/login" className="hover:text-white transition-colors">Log In</NavLink>
          </div>
          <NavLink to="/dashboard">
            <GlassButton variant="primary" className="h-9 px-4 text-[13px]">Open Dashboard</GlassButton>
          </NavLink>
        </div>
      </nav>

      <section className="border-b border-white/[0.08] bg-[linear-gradient(180deg,rgba(163,230,53,0.09),rgba(7,8,9,0))]">
        <div className="mx-auto max-w-[1280px] px-4 py-12 md:px-6 md:py-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[12px] text-[#b8c0cc]">
            <BookOpen size={13} />
            Reference docs for the actual codebase
          </div>
          <h1 className="mt-5 max-w-3xl text-[30px] font-semibold leading-tight text-white md:text-[46px]">
            Velora documentation that matches the code, including the LangChain AI layer.
          </h1>
          <p className="mt-4 max-w-3xl text-[15px] leading-7 text-[#9aa3af]">
            This guide explains how to run the project, how auth and GitHub connection differ,
            how deployments move through the system, and how LangChain is used for log analysis.
          </p>
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-8 px-4 py-8 md:px-6 lg:flex-row">
        <aside className="w-full lg:sticky lg:top-[88px] lg:h-[calc(100vh-104px)] lg:w-[280px] lg:overflow-y-auto" style={{ scrollbarWidth: "none" }}>
          <div className="rounded-[24px] border border-white/[0.08] bg-[#0d0f10] p-4">
            {sectionList.map((group) => (
              <div key={group.title} className="mb-5 last:mb-0">
                <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5f6772]">
                  {group.title}
                </p>
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setCurrentSection(item.id)}
                      className={`w-full rounded-xl px-3 py-2.5 text-left text-[13px] transition-colors ${
                        currentSection === item.id
                          ? "bg-[#a3e635]/10 text-[#eaffc7] border border-[#a3e635]/20"
                          : "text-[#9aa3af] hover:bg-white/[0.03] hover:text-white"
                      }`}
                    >
                      {item.title}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="rounded-[28px] border border-white/[0.08] bg-[#0d0f10] p-6 md:p-8">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03] text-[#a3e635]">
                <CurrentIcon size={18} />
              </div>
              <div>
                <h2 className="text-[24px] font-semibold text-white">{current.title}</h2>
                <p className="text-[14px] text-[#98a2b3]">{current.intro}</p>
              </div>
            </div>

            <div className="space-y-8">
              {current.blocks.map((block) => (
                <section key={block.heading}>
                  <h3 className="text-[16px] font-semibold text-white">{block.heading}</h3>
                  {block.points && (
                    <div className="mt-3 space-y-2">
                      {block.points.map((point) => (
                        <p key={point} className="text-[14px] leading-7 text-[#c5ccd6]">
                          {point}
                        </p>
                      ))}
                    </div>
                  )}
                  {block.code && codeBlock(block.code)}
                </section>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-[24px] border border-white/[0.08] bg-[#0d0f10] p-5 text-[13px] text-[#98a2b3]">
            The docs page is now intentionally tied to the current repository behavior, so it should be updated whenever auth flow,
            deployment flow, or LangChain provider wiring changes.
          </div>
        </main>
      </div>
    </div>
  );
}
