/**
 * Single source of truth for every project shown on the site.
 * Facts here were verified against GitHub on 2026-11-24. Do not invent metrics.
 * Rule: never use the words "founder" or "co-founder".
 */

export type RoleTag = "AI" | "Systems" | "Shipped" | "Customer";

export type Project = {
  slug: string;
  name: string;
  /** One-line outcome shown on cards. */
  oneLiner: string;
  /** Exact personal scope. */
  role: string;
  team: boolean;
  period: string;
  tags: RoleTag[];
  stack: string[];
  live?: string;
  /** Hex accent used for generated covers / hover reveals. */
  accent: string;
  /** Path under /public, e.g. /shots/tripflow.webp. Optional until screenshots exist. */
  image?: string;
  featured?: boolean;
  metric?: string;
};

export const featured: Project[] = [
  {
    slug: "wolfe",
    name: "Wolfe AI",
    oneLiner: "Realtime AI sales copilot: live coaching on calls, durable post-call agents, and a knowledge graph of every deal.",
    role: "Built the 5-service Python backend and the Google Meet Chrome extension",
    team: true,
    period: "Jul 2026 – Present",
    tags: ["AI", "Systems"],
    stack: ["Python", "FastAPI", "LangGraph", "Gemini Live", "Neo4j", "Redis Streams", "Postgres", "Docker", "Caddy", "Chrome MV3"],
    live: "https://wolferesearch.vercel.app",
    accent: "#FF5A1F",
    image: "/shots/wolfe.webp",
    featured: true,
    metric: "5 services · sub-2s live coaching",
  },
  {
    slug: "tripflow",
    name: "TripFlow",
    oneLiner: "AI travel agent that plans complete trips from one conversation, by text or voice.",
    role: "Frontend (Next.js) and AI backend (FastAPI + LangChain): LLM failover, memory, cost cuts",
    team: true,
    period: "Jan – Oct 2026",
    tags: ["AI", "Shipped", "Customer"],
    stack: ["Next.js 16", "React 19", "FastAPI", "LangChain", "OpenAI", "Grok", "Supabase", "Redis", "Razorpay", "PostHog"],
    live: "https://tripflow.live",
    accent: "#3DDC97",
    image: "/shots/tripflow.webp",
    featured: true,
    metric: "250+ users · 2,000+ trips",
  },
  {
    slug: "ninetynine",
    name: "Ninetynine",
    oneLiner: "Every CAT paper since 2017 in a real exam interface, plus unlimited AI mocks built from your weak topics.",
    role: "Built end to end: scraper, parser, FastAPI backend, React exam UI, AI analysis",
    team: false,
    period: "Oct – Nov 2026",
    tags: ["AI", "Systems", "Shipped"],
    stack: ["React", "Vite", "KaTeX", "FastAPI", "Neon Postgres", "pytest", "Docker"],
    live: "https://ninetynine.usewolfe.com",
    image: "/shots/ninetynine.webp",
    accent: "#7C5CFF",
    featured: true,
    metric: "38 users · 8 paying",
  },
  {
    slug: "spardha",
    name: "Spardha",
    oneLiner: "Registration and contingent-management platform for IIT (BHU)'s national sports festival.",
    role: "Tech Coordinator → Tech Head → Senior Tech Advisor; #2 all-time contributor (109 of 548 commits)",
    team: true,
    period: "2024 – 2026",
    tags: ["Systems", "Shipped"],
    stack: ["React", "Django", "MySQL", "GSAP"],
    live: "https://www.spardha.org.in",
    accent: "#FFC53D",
    image: "/shots/spardha.webp",
    featured: true,
    metric: "Multi-edition · open source",
  },
];

export const more: Project[] = [
  {
    slug: "whispr",
    name: "Whispr",
    oneLiner: "Conversation-first social platform. I took it to production.",
    role: "Production deploy + CI/CD (Docker, Caddy, GitHub Actions), test-gated PRs, admin stats dashboard",
    team: true,
    period: "2025 – 2026",
    tags: ["Systems", "Shipped"],
    stack: ["Next.js", "Express", "Socket.IO", "Prisma", "Redis", "Docker"],
    live: "https://whispr.in",
    accent: "#FF7AB6",
    image: "/shots/whispr.webp",
  },
  {
    slug: "connectiit",
    name: "ConnectIIT",
    oneLiner: "Network for IIT students: Go microservices, a mobile app and a web app.",
    role: "Go services (Fiber, GORM, Kafka), Expo React Native app, React web app",
    team: true,
    period: "2025 – 2026",
    tags: ["Systems"],
    stack: ["Go", "Fiber", "Kafka", "Postgres", "React Native", "Expo"],
    accent: "#4DA3FF",
  },
  {
    slug: "upcon",
    name: "UPCON'25",
    oneLiner: "Conference website, built and maintained through the event.",
    role: "Lead developer (114 of 150 commits)",
    team: true,
    period: "Mar – Dec 2025",
    tags: ["Shipped"],
    stack: ["React", "GSAP", "Framer Motion", "Tailwind"],
    live: "https://upcon-25.vercel.app",
    accent: "#00C2D1",
    image: "/shots/upcon.webp",
  },
  {
    slug: "checkmarks",
    name: "Checkmarks",
    oneLiner: "JEE Main score calculator with answer keys for every shift.",
    role: "Built end to end",
    team: false,
    period: "Apr 2025",
    tags: ["Shipped"],
    stack: ["React", "Express", "MongoDB", "Google OAuth"],
    live: "https://checkmarks.vercel.app",
    accent: "#B6F542",
    image: "/shots/checkmarks.webp",
  },
  {
    slug: "outreachr",
    name: "Outreachr",
    oneLiner: "B2B buyer intelligence: 1,000+ startups actively bidding for growth, with contacts and pitch templates.",
    role: "Backend and data fixes",
    team: true,
    period: "Aug 2026",
    tags: ["Customer"],
    stack: ["React", "Express", "Postgres", "Razorpay"],
    live: "https://outreachr-xi.vercel.app",
    accent: "#FF9F43",
  },
  {
    slug: "sentinel",
    name: "Sentinel AI",
    oneLiner: "Industrial safety: reasons across plant data to flag compound risks before alarms trigger.",
    role: "Contributor",
    team: true,
    period: "2026",
    tags: ["AI"],
    stack: ["LangGraph", "Neo4j", "Next.js", "Python"],
    accent: "#E24B4B",
  },
  {
    slug: "calendar",
    name: "Wall Calendar",
    oneLiner: "A paper-like interactive calendar with range selection and notes.",
    role: "Built end to end",
    team: false,
    period: "Apr 2026",
    tags: ["Shipped"],
    stack: ["Next.js", "TypeScript", "Framer Motion"],
    live: "https://assignment-gamma-mocha.vercel.app",
    accent: "#D9C7A7",
    image: "/shots/calendar.webp",
  },
];

/** Freelance work for real businesses — the FDE section. */
export const clients = [
  {
    name: "Pardeep Auto Works",
    problem: "Parts inventory lived on paper; customers had to call for prices.",
    shipped: "Inventory admin + public storefront with live prices.",
    stack: ["Express", "MongoDB", "Cloudinary"],
  },
  {
    name: "Dhiman General Store",
    problem: "Hand-written bills and missed payment follow-ups.",
    shipped: "Billing app with printable invoices and automated email reminders.",
    stack: ["React", "Express", "MongoDB", "node-cron"],
    live: "https://servicemen-chi.vercel.app",
  },
  {
    name: "Expiry Alerts",
    problem: "Stock expiring unnoticed on shelves.",
    shipped: "Barcode scanning in the browser, Gemini-assisted product lookup, scheduled email alerts.",
    stack: ["React", "ZXing", "Gemini", "Express"],
  },
  {
    name: "Restaurant data pipeline",
    problem: "A client needed structured restaurant data at city scale.",
    shipped: "Playwright scraper with OCR + LLM cleanup into Postgres.",
    stack: ["Python", "Playwright", "Groq", "Neon"],
  },
] as const;

export type ExperienceItem = {
  org: string;
  kind: "Internship" | "Leadership";
  title: string;
  period: string;
  link?: string;
  points: string[];
};

/** Internships and positions of responsibility. Wolfe / TripFlow live in Featured work. */
export const experience: ExperienceItem[] = [
  {
    org: "MMD Shopping",
    kind: "Internship",
    title: "Software Development Intern",
    period: "Apr – Jul 2026",
    points: [
      "Developed and enhanced the AI-powered product recommendation engine using RAG and LLM calls.",
      "Led the AI team to independently design, build and deliver AI features.",
      "Architected the end-to-end user flow and backend logic for the coupon system; maintained production services.",
    ],
  },
  {
    org: "Pamprazzi",
    kind: "Internship",
    title: "Backend Development Intern",
    period: "Mar – May 2025",
    link: "https://pamprazzi.com",
    points: [
      "Built the admin dashboard for Pamprazzi's core platform (Node.js).",
      "Updated the payment and GST tax services, and maintained the production codebase.",
    ],
  },
  {
    org: "Spardha, IIT (BHU)",
    kind: "Leadership",
    title: "Senior Tech Advisor",
    period: "2024 – Present",
    link: "https://www.spardha.org.in",
    points: [
      "Tech Coordinator in 2nd year → Tech Head in 3rd year → Senior Tech Advisor in 4th year, for IIT (BHU)'s national sports festival.",
      "As Tech Head of Spardha'25, led a 15+ member team running the fest platform and registrations.",
      "Worked across nearly the entire legacy codebase of the organisation's open-source platform; #2 all-time contributor (109 of 548 commits).",
    ],
  },
  {
    org: "Social Projects Club, IIT (BHU)",
    kind: "Leadership",
    title: "Tech Head",
    period: "2025 – 2026",
    points: ["Guided junior students through product ideation and supported them through their project builds."],
  },
];

export const skills = [
  { group: "AI", items: ["LangGraph", "LangChain", "Gemini Live", "OpenAI", "Groq", "Evals & LLM judges", "Prompt versioning"] },
  { group: "Backend", items: ["Python", "FastAPI", "Node.js", "Express", "Go", "Django"] },
  { group: "Data", items: ["Postgres", "Neo4j", "Redis Streams", "MongoDB", "Supabase"] },
  { group: "Frontend", items: ["TypeScript", "React", "Next.js", "Tailwind", "React Native"] },
  { group: "Infra", items: ["Docker", "Caddy", "GitHub Actions", "Vercel", "Render"] },
] as const;

export const allProjects = [...featured, ...more];
export const getProject = (slug: string) => allProjects.find((p) => p.slug === slug);
