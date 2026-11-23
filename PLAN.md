# Portfolio Plan — Rohit Kumar

- **Site:** rohitkumar.info
- **Contact:** contact@rohitkumar.info
- **GitHub:** r120dhiman

**Rule:** no "founder" or "co-founder" wording anywhere: site, resumes, case studies, meta tags.

**Goal:** full-time offers for **SDE-1**, **Frontier / AI Engineer** and **Forward Deployed Engineer (FDE)** roles.

Based on a full GitHub scan on 2026-11-24: 68 own repos, ~20 repos contributed to, 1,148 contributions in the last year (1,086 of them private).

---

## 1. What each role's reviewer is looking for

The site has to pass a **30-second skim** by a recruiter and a **5-minute deep read** by an engineer. The three roles want different proof:

| Role | They check for | Your strongest evidence |
|---|---|---|
| **SDE-1** | Solid fundamentals, clean production code, systems that don't fall over, tests, ownership | Wolfe backend (crash recovery, exactly-once ingestion, auth), Spardha at scale, Ninetynine (tests, CSP, validation), Whispr CI/CD |
| **Frontier / AI Engineer** | Has built real LLM systems beyond a wrapper: agents, evals, latency, failover, cost | Wolfe (LangGraph, Gemini Live, prompt versioning + LLM-judge evals, entity-resolution precision/recall), TripFlow (LLM failover, memory gate, cost cuts), Ninetynine (AI mock generation) |
| **FDE** | Ships for real customers fast, owns the problem end to end, talks to users, deploys anywhere | TripFlow (live, paid), client work (Pardeep Auto Works, billing app, expiry alerts), MMD vendor tools, Wolfe integrations (Microsoft 365, Google Meet), production deploys with Docker/Caddy |

**One positioning line that covers all three:**

> **I build AI products end to end and put them in front of real users** — agent backends, realtime LLM pipelines, and the product around them. Final year @ IIT (BHU) Varanasi, graduating 2027.

**The degree goes in the Education line only:** "B.Tech, Chemical Engineering, IIT (BHU), 2027". Don't apologise for it or explain the switch. The work shows you're a software engineer.

TripFlow, Wolfe and the others are presented as **products you engineered**, with your role written as an engineering title.

---

## 2. Site structure

```
/                   home (skim layer)
/work/wolfe         case study  — AI + systems depth
/work/tripflow      case study  — shipped product, users, payments
/work/ninetynine    case study  — solo, end to end, tested
/work/spardha       case study  — production scale, team codebase
/resume             HTML + 3 PDF variants
```

### Home page, top to bottom

1. **Hero:** "Rohit Kumar", positioning line, status line "Final year @ IIT (BHU) · open to full-time SDE, AI Engineer & FDE roles starting 2027", buttons for Resume · GitHub · LinkedIn · contact@rohitkumar.info.
2. **Proof strip** (verified numbers only):
   - **250+ users, 2,000+ trips planned** on TripFlow
   - 1,100+ contributions in 2026
   - Sole backend author of a 5-service AI platform
   - #2 all-time contributor to Spardha
   - 3 products live
3. **Featured work:** 4 cards. Each card shows a one-line outcome, the stack, and **role tags** (`AI` `Systems` `Shipped` `Customer`) so each reviewer finds what they care about.
4. **Experience:** a proper timeline with dates, written like a resume:
   - Wolfe AI: backend engineer
   - TripFlow: full-stack & AI engineer
   - MyMomDad (MMD): contributor
   - Spardha (IIT BHU): web team
   - Freelance
5. **"Built for clients"** (FDE section). 3–4 rows, each with business, problem, what you shipped, and a screenshot:
   - Pardeep Auto Works: inventory + storefront
   - Dhiman General Store: billing app
   - Expiry-alert tool
   - Restaurant data scraper
6. **More projects grid:** Whispr, ConnectIIT, UPCON'25, Checkmarks, Outreachr, Sentinel AI, Wall Calendar.
7. **Skills, grouped by what you shipped with** (no logo wall):
   - **AI:** LangGraph, LangChain, Gemini Live, OpenAI, Groq, evals
   - **Backend:** FastAPI, Express, Go/Fiber, Django
   - **Data:** Postgres, Neo4j, Redis Streams, MongoDB
   - **Frontend:** Next.js, React, React Native
   - **Infra:** Docker, Caddy, GitHub Actions
8. **Contact.**

---

## 3. Case studies: same project, written for all three readers

Template for every case study (about 600–900 words, plus 1 diagram and 1 short video/GIF):

1. **Context:** who it's for, what problem. *(FDE)*
2. **My role & scope:** be exact, e.g. "sole author of X, contributed Y". *(all roles; honesty here builds trust)*
3. **Architecture:** diagram + 1 paragraph. *(SDE)*
4. **3 hard problems:** problem → options → what I chose → result. *(the core of the page)*
5. **AI specifics:** models, failover, evals, latency, cost. *(Frontier)*
6. **Outcome:** users, latency, uptime, what shipped. *(all roles)*
7. **What I'd do differently.** *(shows judgment; SDE-1 reviewers love it)*

### Wolfe AI (lead case study, the Frontier + SDE magnet)

Hard problems to write up:
- **Realtime coaching under 2 seconds:** two WebSocket channels by priority, a persistent Gemini Live session per call, and model failover Gemini → Groq → OpenAI.
- **Agent runs that survive crashes:** LangGraph with Postgres checkpoints, atomic claim from the Redis queue, a heartbeat sweeper that re-queues dead runs, and a human-in-the-loop pause for unknown speakers.
- **Exactly-once knowledge-graph ingestion:** Redis Streams consumer groups, `XAUTOCLAIM`, Episode nodes for dedupe, and entity resolution measured with precision/recall.
- **Evals:** versioned prompts, scripted calls, LLM judge, v1 vs v2 reports. *This is the single most "frontier" thing you have; give it its own section.*
- **Speaker separation in the browser:** MFCC voiceprints in an AudioWorklet, plus an IndexedDB offline buffer.

> **Team project.**
> - Badge it "Team project", and credit the team in one line (linking teammates' GitHub if they're OK with it).
> - State your scope exactly: "I built the 5-service backend and the Chrome extension."
> - Architecture can be published. Still leave out prompts, keys and customer data.

### TripFlow (FDE + product case study)

**Team project.** Live at tripflow.live. **250+ users, 2,000+ trips planned.**

Your scope: frontend (57 commits) and AI backend (76 commits): trains & budget phase, LLM failover, memory gate, cost cuts. The numbers are the product's; make it clear the system you built served them.

- Paid unlocks via Razorpay
- Voice planning over WebSockets
- OpenAI primary + Grok fallback, plus a memory gate
- SerpAPI cost cuts

Frame it as: *"built and shipped the AI planner and web app used for 2,000+ trips"*, then cover funnel/PostHog, payments, and cost per trip.

### Ninetynine (SDE showcase: solo, end to end)

Scraper → parser → Neon → FastAPI → React exam UI → AI mock generation, with pytest + node:test, CSP, a body limit and server-owned validation. **Deploy it before launch**; a live link matters. Check that using scraped 2IIM content is OK first.

### Spardha (SDE: working in a large shared codebase)

109 of 548 commits on a live national fest platform (Django + React + MySQL). Focus on what you owned, the traffic during registration, and working with a team.

---

## 4. Resume: one site, 3 PDF variants

Same facts, different order and wording:

| Variant | Lead with | Bullet emphasis |
|---|---|---|
| **SDE-1** | Wolfe backend, Spardha, Ninetynine | Reliability, tests, scale, clean architecture |
| **Frontier / AI** | Wolfe, TripFlow AI backend, Ninetynine | Agents, evals, latency, model failover, cost |
| **FDE** | TripFlow, client work, Wolfe integrations | Shipped to users, customer problems, deploys, speed |

- Each bullet follows **action + what + measurable result**.
- One page.
- Link the matching case study from each project line.
- The `/resume` page gets a 3-way download.

**LeetCode / Codeforces: not on the portfolio.**
- Your shipped work is a stronger signal than a problem count. Nobody rejects a portfolio for lacking one.
- But SDE-1 online assessments and interview rounds will still test DSA. Practise for those separately.
- Add a profile link to the resume only if it's notable (e.g. Knight or Expert rating).

---

## 5. Build plan

| Phase | Work | Est. |
|---|---|---|
| **1. Collect** | Screenshots, 30–60s screen recordings (TripFlow voice, Wolfe HUD, Ninetynine exam) | 1 day |
| **2. Skeleton** | Next.js App Router + TS + Tailwind, `content/projects.ts` as single source of truth, home sections, dark mode, mobile | 2 days |
| **3. Case studies** | 4 MDX pages + SVG architecture diagrams + videos | 3 days |
| **4. Resumes** | 3 PDF variants + `/resume` page | 1 day |
| **5. Launch** | Point rohitkumar.info at Vercel, set up contact@ mail forwarding / DNS records, OG images, sitemap, Lighthouse 95+, link from GitHub / LinkedIn, redirect old site (`rohitkumarportfolio-seven.vercel.app`) | 1 day |
| **6. Later** | GitHub cleanup (security / `.env` fixes, archive old repos, READMEs, pins, profile README), deploy Ninetynine publicly, 1–2 technical posts from Wolfe (strong for Frontier roles) | ongoing |

**Stack:**
- Next.js, MDX, Framer Motion (light use), inline SVG diagrams
- Vercel + custom domain
- Vercel Analytics or PostHog

The site itself should be fast and boring-good. No three.js hero.

---

## 6. Project triage (reference)

- **Feature:** Wolfe, TripFlow, Ninetynine, Spardha.
- **Grid:** Whispr (your CI/CD + prod deploy), ConnectIIT (Go microservices + Expo app), UPCON'25, Checkmarks, Outreachr, Sentinel AI (Chem Eng ↔ AI bridge), Wall Calendar.
- **Client section:** Pardeep Auto Works, Dhiman General Store biller, expiry alerts, Google Maps scraper.
- **Experience:** MMD (vendor dashboard, gift cards, AI recommendation service).
- **Hide:** 2024 clones/tutorials, forks (no merged PRs — don't claim as open source), empty repos.

---

## 7. Open questions

None. Everything is decided:
- Final year at IIT (BHU), Chemical Engineering, graduating 2027; targeting tech roles
- Wolfe & TripFlow shown as team projects, architecture OK to publish
- LinkedIn: linkedin.com/in/rohit-kumar2005
- Name: Rohit Kumar
- Domain: rohitkumar.info
- Email: contact@rohitkumar.info
- No founder wording
- TripFlow: 250+ users, 2,000+ trips
- No LeetCode on the site
