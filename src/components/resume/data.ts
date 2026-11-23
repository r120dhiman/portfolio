/**
 * Resume data: one set of facts, three orderings/emphases.
 * Built from src/content/site.ts + src/content/projects.ts. No invented metrics.
 */
import { site } from "@/content/site";
import { experience, featured, more } from "@/content/projects";

export type Variant = "sde" | "ai" | "fde";

export const variants: { id: Variant; label: string; short: string }[] = [
  { id: "sde", label: "SDE-1", short: "SDE" },
  { id: "ai", label: "AI Engineer", short: "AI" },
  { id: "fde", label: "Forward Deployed", short: "FDE" },
];

export const isVariant = (v: string | null | undefined): v is Variant => v === "sde" || v === "ai" || v === "fde";

type PerVariant<T> = Record<Variant, T>;

export type ResumeEntry = {
  id: string;
  org: string;
  title: string;
  period: string;
  link?: string;
  note?: string;
  bullets: PerVariant<string[]>;
};

const exp = (org: string) => experience.find((e) => e.org.startsWith(org))!;
const proj = (slug: string) => [...featured, ...more].find((p) => p.slug === slug)!;
const host = (url?: string) => url?.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

export const header = {
  name: site.name,
  headline: {
    sde: "Software Engineer — backend systems, reliability, full stack",
    ai: "AI Engineer — agents, realtime LLM pipelines, evals",
    fde: "Forward Deployed Engineer — shipping AI products to real users",
  } satisfies PerVariant<string>,
  contact: [
    { label: site.email, href: `mailto:${site.email}` },
    { label: site.domain, href: site.url },
    { label: "github.com/r120dhiman", href: site.links.github },
    { label: "linkedin.com/in/rohit-kumar2005", href: site.links.linkedin },
  ],
};

export const summary: PerVariant<string> = {
  sde: "Final-year IIT (BHU) engineer who builds backend services that survive failure: durable queues, checkpointed workflows, idempotent consumers, signed internal APIs, tests and CI. 1,100+ GitHub contributions in 2026.",
  ai: "Final-year IIT (BHU) engineer building production AI systems: realtime LLM sessions, LangGraph agents with human-in-the-loop, model failover, versioned prompts and eval harnesses with LLM judges. 1,100+ GitHub contributions in 2026.",
  fde: "Final-year IIT (BHU) engineer who takes AI products from a user's problem to production: 250+ users and 2,000+ trips on TripFlow, a live paid CAT-prep product, and a live sales copilot. Comfortable owning frontend, backend and deploys.",
};

const mmdE = exp("MMD");
const pamE = exp("Pamprazzi");
const spardhaE = exp("Spardha");
const spcE = exp("Social Projects Club");

export const experienceEntries: Record<string, ResumeEntry> = {
  mymomdad: {
    id: "mymomdad",
    org: "MMD Shopping Pvt. Ltd.",
    title: mmdE.title,
    period: mmdE.period,
    bullets: {
      sde: [...mmdE.points],
      ai: [...mmdE.points].reverse(),
      fde: [...mmdE.points],
    },
  },
  pamprazzi: {
    id: "pamprazzi",
    org: "Pamprazzi",
    title: pamE.title,
    period: pamE.period,
    link: pamE.link,
    bullets: { sde: [...pamE.points], ai: [...pamE.points], fde: [...pamE.points] },
  },
};

export const leadershipEntries: Record<string, ResumeEntry> = {
  spardha: {
    id: "spardha",
    org: "Spardha, IIT (BHU)",
    title: spardhaE.title,
    period: spardhaE.period,
    link: proj("spardha").live,
    note: "Tech Coordinator (2nd yr) → Tech Head (3rd yr) → Senior Tech Advisor (4th yr)",
    bullets: {
      sde: ["Led the tech team of IIT (BHU)'s national sports festival; #2 all-time contributor (109 of 548 commits) to its open-source React + Django + MySQL registration platform."],
      ai: ["Led the festival's tech team; #2 all-time contributor (109 of 548 commits) to its open-source React + Django registration platform."],
      fde: ["Led the tech team shipping the live registration and contingent-management platform to a fixed festival deadline every edition; 109 of 548 commits."],
    },
  },
  spc: {
    id: "spc",
    org: "Social Projects Club, IIT (BHU)",
    title: spcE.title,
    period: spcE.period,
    bullets: { sde: [...spcE.points], ai: [...spcE.points], fde: [...spcE.points] },
  },
};

export const projectEntries: Record<string, ResumeEntry> = {
  wolfe: {
    id: "wolfe",
    org: "Wolfe AI",
    title: "Team · realtime AI sales copilot",
    period: proj("wolfe").period,
    link: proj("wolfe").live,
    note: "Sole author of the 5-service backend + Chrome extension",
    bullets: {
      sde: [
        "Built 5 Python services (FastAPI) as sole author of the backend repo (105 commits): live coaching, post-call agent, knowledge graph, research agent, shared auth.",
        "Crash-safe workflows: Postgres checkpoint per step, Redis queue with atomic claim, heartbeat + sweeper re-queues dead runs after 120s and resumes from the last checkpoint.",
        "Idempotent Redis Streams consumer into Neo4j (consumer groups, XAUTOCLAIM, retry-then-park, Episode nodes skip re-delivery); backfill treats the graph as a derived store.",
        "Ed25519 tokens via JWKS, signed internal APIs hidden (404) at the Caddy edge, 404-not-403 access so IDs can't be probed; Docker Compose, release/rollback scripts, CI.",
      ],
      ai: [
        "Live HUD agent: persistent Gemini Live session per call turns the transcript into coaching cards; failover Gemini → Groq → OpenAI; sub-2s coaching target.",
        "Eval harness: scripted calls, hard checks, LLM judge and v1-vs-v2 reports for env-selected versioned prompts; precision/recall eval for entity resolution.",
        "LangGraph post-call agent producing evidence-backed CRM updates, with per-step Postgres checkpoints and a human-in-the-loop waiting_input pause for unknown speakers.",
        "Research agent (LangGraph + Tavily, Apify, Playwright, YouTube transcripts) generating PDF dossiers; \"Ask Wolfe\" mid-call Q&A with sources over uploaded docs.",
      ],
      fde: [
        "Built the 5-service backend (sole author, 105 commits) and the Google Meet extension that coaches sales reps live during calls.",
        "In-call UX from the rep's side: talk-to-listen bar, monologue alert after 60s, closing-cue prompts, mid-call Q&A with sources over the team's own documents.",
        "Speaker separation inside the browser: mic = \"You\", Meet captions for names, MFCC voiceprints in an AudioWorklet; IndexedDB buffer so flaky Wi-Fi never loses a call.",
        "Own the deploy: Docker Compose, Caddy, bootstrap/release/rollback scripts, CI; research agent live at wolferesearch.vercel.app.",
      ],
    },
  },
  tripflow: {
    id: "tripflow",
    org: "TripFlow",
    title: "Team · AI travel agent",
    period: proj("tripflow").period,
    link: proj("tripflow").live,
    note: "Frontend (57 commits) + AI backend (76 commits)",
    bullets: {
      sde: [
        "Next.js 16 / React 19 frontend and FastAPI + LangChain backend for an AI trip planner serving 250+ users and 2,000+ trips.",
        "Voice planner streaming audio over WebSockets with a gapless TTS playback queue; anonymous sessions persisted before signup.",
        "Provider failover (OpenAI → Grok), Redis + Supabase, Sentry and PostHog in production.",
      ],
      ai: [
        "LLM pipeline extracting structured trip intent from free text, with OpenAI primary and Grok fallback; trains and budget (phase 1).",
        "Memory gate that decides per request whether stored user memory belongs in the prompt; reduced paid Google/SerpAPI search calls.",
        "Voice planning: WebSocket audio streaming, gapless TTS playback, multi-step agent progress UI.",
      ],
      fde: [
        "Shipped an AI trip planner to 250+ users and 2,000+ trips: chat or voice in, trains/flights/buses, stays and a day-by-day plan out.",
        "Built the ₹49 Razorpay unlock, Google OAuth and pre-signup anonymous sessions; instrumented funnels with PostHog and errors with Sentry.",
        "Kept it up and affordable: OpenAI → Grok failover and fewer paid search calls per trip.",
      ],
    },
  },
  ninetynine: {
    id: "ninetynine",
    org: "Ninetynine",
    title: "Solo · CAT exam platform",
    period: proj("ninetynine").period,
    link: proj("ninetynine").live,
    note: "Live · 38 users, 8 paying",
    bullets: {
      sde: ["Re-runnable scraper → parser → upsert pipeline (24 papers, 1,830 questions) into Neon Postgres; server-owned scoring, 1 MB body limit, CSP; pytest + node:test."],
      ai: ["AI topic tags, mistake causes and skip verdicts over 1,830 CAT questions; unlimited mocks generated from each user's weak topics."],
      fde: ["Every CAT paper 2017–2025 in a real exam UI with post-exam analysis and AI mocks from weak topics; built end to end, solo."],
    },
  },
  whispr: {
    id: "whispr",
    org: "Whispr",
    title: "Team · production & CI/CD",
    period: proj("whispr").period,
    link: proj("whispr").live,
    bullets: {
      sde: ["Took the platform to production: Docker, Caddy, GitHub Actions, test-gated PRs, admin stats dashboard."],
      ai: ["Production deploy and CI/CD (Docker, Caddy, GitHub Actions) with test-gated PRs."],
      fde: ["Took a team product to production at whispr.in: Docker, Caddy, GitHub Actions and test-gated PRs."],
    },
  },
  connectiit: {
    id: "connectiit",
    org: "ConnectIIT",
    title: "Team · Go services",
    period: proj("connectiit").period,
    bullets: {
      sde: ["Go microservices (Fiber, GORM, Kafka, Postgres), Expo React Native app and React web app."],
      ai: ["Go microservices with Kafka; Expo React Native and React clients."],
      fde: ["Go services, mobile and web apps for a student network."],
    },
  },
};

export const order: PerVariant<{ experience: string[]; projects: string[]; leadership: string[] }> = {
  sde: { experience: ["mymomdad", "pamprazzi"], projects: ["wolfe", "tripflow", "ninetynine", "whispr"], leadership: ["spardha", "spc"] },
  ai: { experience: ["mymomdad", "pamprazzi"], projects: ["wolfe", "tripflow", "ninetynine"], leadership: ["spardha", "spc"] },
  fde: { experience: ["mymomdad", "pamprazzi"], projects: ["tripflow", "ninetynine", "wolfe"], leadership: ["spardha", "spc"] },
};

export const skills: PerVariant<{ group: string; items: string }[]> = {
  sde: [
    { group: "Languages", items: "Python, TypeScript, JavaScript, Go, SQL" },
    { group: "Backend", items: "FastAPI, Node.js, Express, Django, Fiber; Redis Streams, queues, WebSockets, SSE" },
    { group: "Data", items: "Postgres, Neo4j, Redis, MongoDB, MySQL, Supabase, Kafka" },
    { group: "Infra", items: "Docker, Caddy, GitHub Actions, Vercel, Render; pytest, node:test" },
    { group: "Frontend", items: "React, Next.js, Tailwind, React Native" },
  ],
  ai: [
    { group: "AI", items: "LangGraph, LangChain, Gemini Live, OpenAI, Groq, Grok; evals & LLM judges, prompt versioning, HITL" },
    { group: "Tools", items: "Tavily, Apify, Playwright, AudioWorklet / MFCC, Neo4j entity resolution" },
    { group: "Backend", items: "Python, FastAPI, Redis Streams, Postgres, WebSockets, SSE" },
    { group: "Product", items: "TypeScript, React, Next.js, Chrome MV3, Docker, Caddy" },
  ],
  fde: [
    { group: "Ship", items: "Next.js, React, FastAPI, Node.js, Python, TypeScript, Chrome MV3" },
    { group: "AI", items: "LangGraph, LangChain, OpenAI, Gemini, Groq, evals" },
    { group: "Run", items: "Docker, Caddy, GitHub Actions, Vercel, Sentry, PostHog, Razorpay, Supabase" },
    { group: "Data", items: "Postgres, Redis, Neo4j, MongoDB" },
  ],
};

export const education = {
  school: "IIT (BHU) Varanasi",
  degree: site.education.degree,
  years: site.education.years,
  cpi: site.education.cpi,
  schooling: site.schooling,
};

export { host };
