/**
 * Long-form case studies for /work/[slug].
 * Every fact here comes from Rohit's repositories (verified 2026-11-24).
 * Rules: first person, no invented metrics, no banned titles (see projects.ts),
 * team projects state the exact personal scope.
 */

export type DiagramNode = {
  id: string;
  /** Top-left corner in a 1000 × 600 viewBox. */
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  sub?: string;
  /** Highlight with the accent colour (the parts I built / the critical path). */
  accent?: boolean;
  /** Dashed outline: external service or something I didn't build. */
  external?: boolean;
};

export type DiagramEdge = {
  from: string;
  to: string;
  label?: string;
  accent?: boolean;
  /** Draw a curved path instead of a straight one. */
  curve?: number;
  /** Arrowheads on both ends. */
  both?: boolean;
};

export type Diagram = {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  /** Optional zone boxes drawn behind nodes. */
  zones?: { x: number; y: number; w: number; h: number; label: string }[];
  caption: string;
};

export type HardProblem = {
  title: string;
  problem: string;
  options: string[];
  choice: string;
  result: string;
};

export type CaseStudy = {
  slug: string;
  /** Short lede under the title. */
  lede: string;
  /** "Solo" or team description for the meta grid. */
  team: string;
  context: string[];
  scope: { intro: string; mine: string[]; note?: string };
  architecture: { intro: string; diagram: Diagram };
  problems: HardProblem[];
  ai: { intro: string; points: { title: string; body: string }[] };
  outcome: string[];
  differently: string[];
};

const wolfe: CaseStudy = {
  slug: "wolfe",
  lede: "Coaching a sales rep while the call is still happening, then turning that call into CRM updates nobody has to type.",
  team: "Team project — I owned the backend and the Chrome extension",
  context: [
    "Sales coaching usually happens a week late: a manager replays a recording and points out the moment the deal slipped. Wolfe moves that moment into the call itself. While a rep talks on Google Meet, a heads-up display surfaces coaching cards, answers questions from the team's own documents, and nudges them when they monologue or miss a closing cue.",
    "The call doesn't end when the meeting does. Someone still has to update the CRM, write the summary and remember the follow-ups. Wolfe hands that to an agent, and keeps a knowledge graph of every person, company and deal it has seen so the next call starts with context.",
  ],
  scope: {
    intro: "Wolfe is a team product. My part was the backend and the piece that sits inside the call:",
    mine: [
      "The entire 5-service Python backend — I'm the sole author of that repository (105 commits): live HUD agent, post-call agent, knowledge graph, research agent and the shared auth library.",
      "The Google Meet Chrome extension: audio capture, speaker separation, offline buffering and the in-call coaching UI.",
      "Ops for those services: Docker Compose, Caddy at the edge, bootstrap / release / rollback scripts and CI.",
    ],
    note: "Everything else in the product was built by my teammates.",
  },
  architecture: {
    intro: "Five services share one auth library and talk through Postgres, a Redis queue and a Redis Stream. The live path is latency-bound; everything after the call is durability-bound, so they are built very differently.",
    diagram: {
      zones: [
        { x: 20, y: 20, w: 470, h: 440, label: "Live · during the call" },
        { x: 510, y: 20, w: 470, h: 440, label: "Durable · after the call" },
      ],
      nodes: [
        { id: "ext", x: 40, y: 70, w: 170, h: 76, label: "Meet extension", sub: "AudioWorklet · captions", accent: true },
        { id: "hud", x: 300, y: 70, w: 170, h: 76, label: "HUD agent", sub: "FastAPI · Gemini Live", accent: true },
        { id: "llm", x: 250, y: 200, w: 220, h: 64, label: "Gemini → Groq → OpenAI", sub: "failover", external: true },
        { id: "caddy", x: 40, y: 330, w: 190, h: 64, label: "Caddy edge", sub: "internal APIs → 404" },
        { id: "pg", x: 540, y: 70, w: 190, h: 76, label: "Postgres", sub: "calls · checkpoints" },
        { id: "queue", x: 760, y: 70, w: 190, h: 76, label: "Redis queue", sub: "atomic claim" },
        { id: "post", x: 760, y: 200, w: 190, h: 86, label: "Post-call agent", sub: "LangGraph · HITL · SSE", accent: true },
        { id: "stream", x: 540, y: 200, w: 190, h: 86, label: "wolfe:events", sub: "Redis Stream · group" },
        { id: "kg", x: 540, y: 340, w: 190, h: 86, label: "Knowledge graph", sub: "Neo4j per workspace", accent: true },
        { id: "research", x: 760, y: 340, w: 190, h: 86, label: "Research agent", sub: "LangGraph · PDF dossiers", accent: true },
        { id: "auth", x: 40, y: 500, w: 910, h: 70, label: "Shared auth library", sub: "Ed25519 · JWKS · signed internal calls · used by every service" },
      ],
      edges: [
        { from: "ext", to: "hud", label: "WS ×2", accent: true, both: true },
        { from: "hud", to: "llm", accent: true },
        { from: "ext", to: "caddy" },
        { from: "hud", to: "pg" },
        { from: "pg", to: "queue" },
        { from: "queue", to: "post", accent: true },
        { from: "post", to: "stream" },
        { from: "stream", to: "kg", accent: true },
        { from: "research", to: "kg", curve: 0 },
      ],
      caption: "Orange = what I built and the critical paths. Dashed = external model providers.",
    },
  },
  problems: [
    {
      title: "A post-call run that survives a crash",
      problem:
        "Turning a call into evidence-backed CRM updates, actions and a summary is several LLM steps long. If a worker dies halfway, the naive outcomes are both bad: the run is lost, or it restarts from zero and repeats steps that already wrote data and already cost money.",
      options: [
        "Retry the whole job on failure — simple, but duplicates finished work.",
        "Hand it to a generic task queue with retries — same problem, just hidden.",
        "Make each step durable and make the queue aware of who owns a run.",
      ],
      choice:
        "I modelled the run as a LangGraph graph with a Postgres checkpoint after every step, using the run id as the thread id. Workers take jobs from a Redis queue with an atomic claim, so two workers can never run the same job. A running worker heartbeats; a sweeper re-queues any run whose heartbeat is older than 120 seconds.",
      result:
        "A crashed run is picked up by another worker and resumes from its last checkpoint — finished steps don't re-run. The same checkpointing gave me human-in-the-loop for free: when the agent meets an unknown speaker it pauses in a waiting_input state and resumes through an API call once someone answers.",
    },
    {
      title: "Exactly-once in effect, from an at-least-once stream",
      problem:
        "The knowledge graph is built from domain events. Redis Streams with consumer groups deliver at least once, so a worker that crashes after writing to Neo4j but before acknowledging will see the same event again — and duplicate people, companies and relationships in the graph.",
      options: [
        "Try to make delivery exactly-once — not something the transport offers.",
        "Deduplicate in a side table — another store to keep consistent.",
        "Make the write itself idempotent, inside the graph.",
      ],
      choice:
        "Every event is recorded in the graph as an Episode node, so a re-delivered event is recognised and skipped. Workers in the consumer group use XAUTOCLAIM to take over messages a crashed worker left pending; an event that keeps failing is retried and then parked instead of blocking the stream. Neo4j is treated as a derived store with a backfill path, so it can always be rebuilt from the source of truth.",
      result:
        "Duplicates are a non-event rather than a cleanup job. Entity resolution — exact email match first, then fuzzier matching — has its own precision/recall eval, so changes to the matcher are measured instead of eyeballed.",
    },
    {
      title: "Knowing who said what, inside a browser tab",
      problem:
        "Coaching only works if the system knows which words were the rep's. Google Meet gives an extension no clean per-speaker audio, and the coaching target is under two seconds end to end.",
      options: [
        "Send mixed audio to a diarisation service — adds latency and cost to every second of the call.",
        "Trust Meet's captions alone — real names, but timing and coverage aren't reliable enough.",
        "Combine every signal the browser already has.",
      ],
      choice:
        "The microphone channel is always \"You\". For everyone else, a MutationObserver reads Meet's caption DOM to get real names, while an AudioWorklet computes MFCC voiceprints and clusters speakers locally. Cards travel on a high-priority WebSocket and low-priority signals on a separate one, so a burst of telemetry never delays advice. Transcript segments go to an IndexedDB buffer first and are flushed to Postgres every 30 seconds, so a flaky connection doesn't lose the call.",
      result:
        "Speaker separation runs on the rep's machine with no extra service in the loop, which is what makes the sub-2-second target realistic. The same signals drive the talk-to-listen bar, a monologue alert after 60 seconds and closing-cue prompts.",
    },
  ],
  ai: {
    intro: "The interesting AI work was less about prompts and more about everything around them.",
    points: [
      { title: "One live session per call", body: "The HUD keeps a persistent Gemini Live session for the whole call and turns the running transcript into coaching cards, instead of re-sending context on every utterance." },
      { title: "Failover chain", body: "If Gemini fails, requests fall through to Groq and then OpenAI. A provider outage degrades quality, not availability." },
      { title: "Ask Wolfe", body: "Mid-call Q&A over the workspace's uploaded documents, with sources attached to every answer so the rep can trust what they're about to say." },
      { title: "Versioned prompts + evals", body: "Prompts are versioned (v1/v2) and chosen by environment. An eval harness replays scripted calls, runs hard checks, scores with an LLM judge and produces v1-vs-v2 reports, so a prompt change ships with evidence." },
      { title: "Research agent", body: "A LangGraph agent that pulls from Tavily, Apify, Playwright and YouTube transcripts across Groq, OpenAI and Gemini, and produces a PDF dossier before a call. Its UI is live at wolferesearch.vercel.app." },
    ],
  },
  outcome: [
    "Five services running under Docker Compose behind Caddy, with bootstrap, release and rollback scripts and CI. Internal service APIs are signed with a shared secret and return 404 at the edge; access tokens are Ed25519, 15 minutes, verified through JWKS. Reps see their own calls, managers see the workspace, and everyone else gets a 404 — so call IDs can't be probed.",
    "The research agent is public at wolferesearch.vercel.app. The rest of the system runs inside the product.",
  ],
  differently: [
    "Start the eval harness on day one. It arrived after the first prompt version, and every decision before it was made on vibes.",
    "Define event schemas as a shared, versioned contract before the second consumer exists, not after.",
    "Add distributed tracing across the five services early. Following a single call through HUD, queue, agent and graph by log grep is slower than it should be.",
  ],
};

const tripflow: CaseStudy = {
  slug: "tripflow",
  lede: "Describe a trip in one sentence — typed or spoken — and get trains, stays and a day-by-day plan back.",
  team: "Team project — I owned the frontend and large parts of the AI backend",
  context: [
    "Planning a trip in India means a dozen tabs: train availability, flights, buses, hotels, weather, what's worth seeing. TripFlow collapses that into one conversation. You say where and roughly when, by text or by voice, and an agent comes back with transport options, stays, destination notes, a day-by-day itinerary and a packing list based on the forecast.",
    "It's live at tripflow.live. 250+ users have planned 2,000+ trips on it — product numbers, served by the system described here.",
  ],
  scope: {
    intro: "TripFlow is a team product. My scope:",
    mine: [
      "Frontend (57 commits): Next.js 16, React 19, Tailwind 4, Supabase with Google OAuth, the voice planner, the multi-step agent loader, itinerary and booking views, the ₹49 Razorpay unlock, PostHog funnels and Sentry.",
      "AI backend (76 commits) on FastAPI + LangChain: trains and budget (phase 1), OpenAI-primary with Grok fallback, the memory gate, and cuts to Google/SerpAPI spend.",
    ],
    note: "The rest of the backend and product decisions were shared with the team.",
  },
  architecture: {
    intro: "A Next.js client talks to a FastAPI agent backend over HTTP for text and over WebSockets for voice. The backend turns free text into a structured trip intent, then fans out to transport, stay and destination tools.",
    diagram: {
      zones: [
        { x: 20, y: 20, w: 300, h: 560, label: "Web · Next.js" },
        { x: 340, y: 20, w: 640, h: 560, label: "Agent · FastAPI + LangChain" },
      ],
      nodes: [
        { id: "ui", x: 50, y: 70, w: 240, h: 76, label: "Chat + voice planner", sub: "WS audio · gapless TTS", accent: true },
        { id: "loader", x: 50, y: 190, w: 240, h: 76, label: "Agent loader", sub: "4-step live progress", accent: true },
        { id: "pay", x: 50, y: 310, w: 240, h: 64, label: "₹49 unlock", sub: "Razorpay", accent: true },
        { id: "obs", x: 50, y: 420, w: 240, h: 64, label: "Supabase · PostHog · Sentry", sub: "anon session → signup" },
        { id: "intent", x: 380, y: 70, w: 260, h: 76, label: "Intent extraction", sub: "free text → structured trip", accent: true },
        { id: "mem", x: 680, y: 70, w: 260, h: 76, label: "Memory gate", sub: "use stored memory?", accent: true },
        { id: "llm", x: 680, y: 190, w: 260, h: 64, label: "OpenAI → Grok", sub: "fallback", accent: true },
        { id: "trans", x: 380, y: 190, w: 260, h: 76, label: "Transport", sub: "trains · flights · buses", accent: true },
        { id: "stay", x: 380, y: 310, w: 260, h: 64, label: "Stays + destination intel" },
        { id: "search", x: 680, y: 310, w: 260, h: 64, label: "Google / SerpAPI · Playwright", sub: "spend cut", external: true },
        { id: "store", x: 380, y: 420, w: 560, h: 64, label: "Redis · Supabase", sub: "sessions, trips, users" },
      ],
      edges: [
        { from: "ui", to: "intent", accent: true },
        { from: "intent", to: "mem", accent: true },
        { from: "mem", to: "llm" },
        { from: "intent", to: "trans", accent: true },
        { from: "trans", to: "stay" },
        { from: "stay", to: "search" },
        { from: "trans", to: "loader", label: "progress", accent: true },
        { from: "stay", to: "store" },
        { from: "pay", to: "obs" },
      ],
      caption: "Orange = my work on the critical path. Dashed = paid external search.",
    },
  },
  problems: [
    {
      title: "Voice that feels like a conversation",
      problem:
        "Voice planning dies if the user waits in silence for a full response to be synthesised, and it sounds broken if audio arrives in chunks that play with gaps or overlaps.",
      options: [
        "Wait for the complete TTS file and play it — simplest, but long dead air.",
        "Play each chunk as it arrives — fast, but audible gaps between chunks.",
        "Stream audio over a WebSocket and schedule chunks through a playback queue.",
      ],
      choice:
        "Audio streams over WebSockets, and incoming TTS chunks go into a gapless playback queue: each chunk is scheduled to start exactly when the previous one ends, instead of being played the moment it lands.",
      result:
        "Speech starts as soon as the first chunk arrives and plays continuously after that. While the agent works, the multi-step loader (Understanding → Transport → Stay → Destination intel) shows real progress instead of a spinner.",
    },
    {
      title: "Staying up when the model provider isn't",
      problem:
        "Every trip depends on an LLM call. A provider outage or rate limit means a user who just described their trip gets nothing back — the worst possible moment to fail.",
      options: [
        "Retry the same provider with backoff — fine for blips, useless for outages.",
        "Switch providers manually when something breaks — too slow.",
        "Put a second provider behind the same interface.",
      ],
      choice: "OpenAI stays primary; on failure the same call falls back to Grok through LangChain, so the rest of the pipeline doesn't know or care which model answered.",
      result: "A provider incident becomes a quality dip on some answers instead of an outage for every user.",
    },
    {
      title: "When should the agent remember you?",
      problem:
        "Stored user memory — preferences, past trips — makes plans better when it's relevant and worse when it isn't. Injecting it into every prompt adds cost and drags old context into new trips.",
      options: [
        "Always include memory — expensive and often wrong.",
        "Never include it — every trip starts cold.",
        "Decide per request.",
      ],
      choice: "I added a memory gate: a step that decides, per request, whether stored user memory is relevant before it ever reaches the planning prompt.",
      result: "Memory shows up when it helps and stays out when it doesn't, and prompts stay smaller on the common path.",
    },
  ],
  ai: {
    intro: "The agent is a pipeline of narrow steps rather than one giant prompt.",
    points: [
      { title: "Structured intent first", body: "Free text like \"Goa next long weekend, 4 of us, under 20k\" becomes a structured trip intent before any tool runs, so every later step works on fields, not prose." },
      { title: "Trains and budget", body: "I built phase 1 of trains and budget handling — the part of Indian travel that most generic trip planners skip." },
      { title: "Cost as a feature", body: "Paid search (Google, SerpAPI) costs money on every call. I reduced how often the pipeline calls it, so each plan costs less to produce." },
      { title: "Fallback model", body: "OpenAI primary, Grok fallback, behind one interface." },
    ],
  },
  outcome: [
    "Live at tripflow.live with 250+ users and 2,000+ trips planned. The funnel is instrumented end to end with PostHog, and errors go to Sentry.",
    "Anonymous sessions are persisted before signup, so a user who plans first and signs in later keeps their trip. Exact bookings unlock with a ₹49 one-time payment via Razorpay — a real payment flow in front of real users.",
  ],
  differently: [
    "Build an eval set of real (anonymised) trip requests early, so changes to intent extraction are measured, not spot-checked.",
    "Track cost per trip as a first-class metric from the start instead of discovering it on the invoice.",
    "Split the voice transport into its own service sooner; it has very different scaling needs from the planner.",
  ],
};

const ninetynine: CaseStudy = {
  slug: "ninetynine",
  lede: "Every CAT paper since 2017, in an interface that feels like exam day — and a mock generator that aims at your weak spots.",
  team: "Solo",
  context: [
    "CAT aspirants practise on scattered PDFs and screenshots that look nothing like the real exam, and the analysis afterwards is usually just a score. Ninetynine puts every CAT paper from 2017 to 2025 — 24 papers, 1,830 questions — into a CAT-style exam interface with timing, sections and a proper post-exam analysis.",
    "When you run out of past papers, it generates unlimited new mocks from the topics you keep getting wrong.",
  ],
  scope: {
    intro: "A solo build, end to end:",
    mine: [
      "Data pipeline: scraper, parser, figure downloads and a re-runnable migration into Neon Postgres.",
      "FastAPI backend that also serves the built SPA, with the attempts API, limits and security headers.",
      "React + Vite exam UI with Tailwind, Framer Motion and KaTeX, plus a GSAP landing page.",
      "The AI analysis layer and tests (pytest + node:test).",
    ],
    note: "Live at ninetynine.usewolfe.com, with one-time payment for lifetime access.",
  },
  architecture: {
    intro: "An offline pipeline produces clean data once; a single FastAPI process serves both the API and the built single-page app.",
    diagram: {
      zones: [
        { x: 20, y: 20, w: 960, h: 170, label: "Offline · data pipeline" },
        { x: 20, y: 210, w: 960, h: 370, label: "Online · app" },
      ],
      nodes: [
        { id: "scrape", x: 50, y: 70, w: 200, h: 86, label: "Scraper", sub: "72 pages · throttled", accent: true },
        { id: "parse", x: 290, y: 70, w: 200, h: 86, label: "Parser", sub: "HTML → JSON + figures", accent: true },
        { id: "migrate", x: 530, y: 70, w: 200, h: 86, label: "Migration", sub: "idempotent upserts", accent: true },
        { id: "db", x: 770, y: 70, w: 180, h: 86, label: "Neon Postgres", sub: "papers · attempts" },
        { id: "spa", x: 50, y: 270, w: 240, h: 86, label: "Exam UI", sub: "React · KaTeX · DOMPurify", accent: true },
        { id: "api", x: 370, y: 270, w: 260, h: 86, label: "FastAPI", sub: "serves SPA + attempts API", accent: true },
        { id: "ai", x: 690, y: 270, w: 260, h: 86, label: "AI judgments", sub: "topics · mistakes · skips", accent: true },
        { id: "guard", x: 370, y: 420, w: 260, h: 86, label: "Guards", sub: "1 MB limit · CSP · JSON errors" },
        { id: "mocks", x: 690, y: 420, w: 260, h: 86, label: "Mock generator", sub: "from weak topics" },
        { id: "tests", x: 50, y: 420, w: 240, h: 86, label: "Tests", sub: "pytest · node:test", external: true },
      ],
      edges: [
        { from: "scrape", to: "parse", accent: true },
        { from: "parse", to: "migrate", accent: true },
        { from: "migrate", to: "db", accent: true },
        { from: "spa", to: "api", label: "events", accent: true, both: true },
        { from: "api", to: "ai", accent: true },
        { from: "api", to: "guard" },
        { from: "ai", to: "mocks" },
        { from: "db", to: "ai", curve: 0 },
      ],
      caption: "Orange = the path a question takes from a scraped page to your analysis.",
    },
  },
  problems: [
    {
      title: "A data pipeline I could run again without fear",
      problem:
        "The source is 72 section pages of HTML with inline maths and figures. A one-off scrape would be wrong somewhere, and fixing it by hand would mean the database and the source drift apart forever.",
      options: [
        "Scrape once and patch the database by hand.",
        "Scrape on every deploy — hostile to the source, slow, and fragile.",
        "Split it into stages that are each cached and re-runnable.",
      ],
      choice:
        "A throttled scraper caches every page locally. A parser turns the cache into JSON and downloads figures. A migration script upserts the JSON into Neon Postgres, so running it twice changes nothing.",
      result: "When I find a parsing bug I fix the parser and re-run the last two stages. No manual edits, no drift, and the source site only gets hit once.",
    },
    {
      title: "Scores the client can't forge",
      problem:
        "Analysis is only meaningful if the attempt data is honest. If the client posts its own score, timings and paper metadata, anything is possible — and a long session can send a lot of events.",
      options: [
        "Trust the client and validate loosely.",
        "Move the whole exam to the server — heavy, and bad offline behaviour.",
        "Let the client send raw events and have the server own every derived field.",
      ],
      choice:
        "The attempts API owns paper, kind, timings and the summary; the client only reports what happened. Events are capped at the last 6,000 per attempt, request bodies at 1 MB (anything larger gets a 413), and validation errors come back as structured JSON.",
      result: "Scores and analysis are computed from data the server controls. Security headers, including a Content-Security-Policy, are set on every response.",
    },
    {
      title: "Rendering scraped HTML and maths safely",
      problem:
        "Questions are HTML from a third-party site, full of maths. Rendering it raw is an XSS hole; stripping it breaks the questions.",
      options: [
        "Convert everything to plain text — loses formatting and figures.",
        "Render raw HTML — fast, unsafe.",
        "Sanitise, then render maths properly.",
      ],
      choice: "Question HTML is sanitised with DOMPurify before it touches the DOM, and maths is rendered with KaTeX. Routes are lazy-loaded so the exam screen doesn't pay for the landing page's GSAP.",
      result: "Questions look like the real paper, and a malicious string in the source can't run in a user's browser.",
    },
  ],
  ai: {
    intro: "The AI does three narrow judgments, each of which a student would otherwise make badly about themselves.",
    points: [
      { title: "Topic tags", body: "Every question is tagged by topic, which is what makes \"weak topics\" computable at all." },
      { title: "Mistake causes", body: "For each wrong answer, the model judges why — so the analysis can separate a concept gap from a careless slip." },
      { title: "Skip verdicts", body: "For skipped questions, it judges whether skipping was the right call. On CAT, good skipping is a skill." },
      { title: "Unlimited mocks", body: "New mocks are generated from your weak topics, with similar-question clusters stored alongside the originals." },
    ],
  },
  outcome: [
    "Live at ninetynine.usewolfe.com as a paid product (one-time payment, lifetime access), with 38 organic users so far, 8 of them paying. 24 papers and 1,830 questions are migrated, the exam and analysis flows work end to end, and the backend and frontend both have tests (pytest and node:test).",
    "The schema already covers what a real product needs next: attempts, practice sessions, bookmarks, similar-question clusters and analytics events.",
  ],
  differently: [
    "Put a small labelled set of questions in front of the AI judgments before trusting them at scale, and track agreement over time.",
    "Ship a rough version to real students sooner; polish without users is a guess.",
  ],
};

const spardha: CaseStudy = {
  slug: "spardha",
  lede: "The registration and contingent-management platform behind IIT (BHU)'s national sports festival — and a codebase that outlives every team that works on it.",
  team: "Team project — Tech Coordinator → Tech Head → Senior Tech Advisor",
  context: [
    "Spardha is IIT (BHU)'s annual national sports festival. Colleges from across the country send contingents — groups of athletes across many events — and every one of them has to be registered, managed and kept track of. The platform at spardha.org.in does that, and it's open source under the MIT licence.",
    "It's also a student codebase. The team changes every year, the festival happens every year, and the platform has to carry over from one edition to the next. I can't share participation numbers, so this one is about the work, not the scale.",
  ],
  scope: {
    intro: "I've led Spardha's tech side through three editions:",
    mine: [
      "Tech Coordinator in 2nd year, Tech Head in 3rd year (leading a 15+ member team), Senior Tech Advisor in 4th year.",
      "It's the organisation's legacy repository, and over time I've worked across nearly all of it — frontend and backend.",
      "#2 all-time contributor: 109 of 548 commits.",
    ],
    note: "Spardha is built by a rotating student team; the platform is the sum of many people's work.",
  },
  architecture: {
    intro: "A classic, sturdy split: a React frontend, a Django backend with MySQL, and the same platform reused edition after edition.",
    diagram: {
      zones: [{ x: 20, y: 20, w: 960, h: 560, label: "spardha.org.in" }],
      nodes: [
        { id: "public", x: 60, y: 80, w: 250, h: 86, label: "Public site", sub: "React · GSAP", accent: true },
        { id: "reg", x: 60, y: 250, w: 250, h: 86, label: "Registration", sub: "colleges · contingents", accent: true },
        { id: "admin", x: 60, y: 420, w: 250, h: 86, label: "Organiser views", sub: "manage contingents" },
        { id: "api", x: 390, y: 250, w: 240, h: 86, label: "Django backend", sub: "Python · REST API", accent: true },
        { id: "db", x: 710, y: 250, w: 230, h: 86, label: "MySQL", sub: "registrations · contingents" },
        { id: "oss", x: 710, y: 80, w: 230, h: 86, label: "Open source", sub: "MIT · 548 commits", external: true },
      ],
      edges: [
        { from: "public", to: "api", accent: true },
        { from: "reg", to: "api", accent: true },
        { from: "admin", to: "api" },
        { from: "api", to: "db", accent: true },
      ],
      caption: "Orange = the participant path: from the public site through registration to the backend.",
    },
  },
  problems: [
    {
      title: "Groups, not individuals",
      problem:
        "Most registration systems assume one person signs up for one thing. A sports festival registers contingents: one college, many athletes, many events — and the people managing that contingent need to see and change it as a whole.",
      options: [
        "Treat every athlete as an independent signup and reconcile later.",
        "Model the contingent as the unit everything hangs off.",
      ],
      choice: "The platform is built around contingent management, so a college's registration is one thing that can be reviewed and managed as a whole, rather than a pile of unrelated forms.",
      result: "Organisers and colleges work with the same structure the festival actually has.",
    },
    {
      title: "A platform that survives every edition",
      problem:
        "The festival runs every year with new events, new dates and a new team. Rebuilding the site each year would throw away everything the last team learned.",
      options: ["Fork a fresh site per edition.", "Keep one platform and evolve it edition to edition."],
      choice: "Spardha is a multi-edition platform: one codebase carried forward, with each edition built on the last.",
      result: "Each year's team starts from working software instead of a blank repo.",
    },
    {
      title: "Contributing to a codebase you didn't start",
      problem:
        "With 548 commits from a rotating team, most of the code anyone touches was written by someone who has already graduated. The risk is that every change quietly breaks something nobody remembers.",
      options: ["Rewrite the parts you don't like.", "Learn the existing patterns and work with them."],
      choice: "I worked within the existing React + Django structure, kept changes consistent with what was there, and kept contributing across editions rather than in one burst.",
      result: "109 commits over multiple years, making me the #2 all-time contributor.",
    },
  ],
  ai: {
    intro: "There's no AI in Spardha, and that's the point of including it.",
    points: [
      { title: "Fundamentals", body: "React, Django and MySQL, shipped to a real event with a real deadline that doesn't move." },
      { title: "Long-lived code", body: "Most of my other work is new. This is the project where I learned to read, respect and extend someone else's code." },
    ],
  },
  outcome: [
    "Live at spardha.org.in, used for the festival's registrations across editions, and open source under the MIT licence.",
    "My contribution: led the tech team as Tech Head, then advised the next team as Senior Tech Advisor, and wrote 109 of the project's 548 commits, second only to one other contributor all-time.",
  ],
  differently: [
    "Write down the platform's conventions as they're discovered, so the next team spends less time rediscovering them.",
    "Add automated tests around registration flows, which are exactly the parts nobody wants to break the week before the festival.",
  ],
};

export const caseStudies: CaseStudy[] = [wolfe, tripflow, ninetynine, spardha];
export const getCaseStudy = (slug: string) => caseStudies.find((c) => c.slug === slug);

export const caseSections = [
  { id: "context", label: "Context" },
  { id: "scope", label: "My role & scope" },
  { id: "architecture", label: "Architecture" },
  { id: "problems", label: "Hard problems" },
  { id: "ai", label: "AI specifics" },
  { id: "outcome", label: "Outcome" },
  { id: "differently", label: "Differently" },
] as const;
