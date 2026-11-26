/**
 * Work in progress — projects being built right now, and the skills being built with them.
 *
 * Rules (same as projects.ts):
 *  - No invented metrics. If a number isn't verified, it doesn't go here.
 *  - Never use the words "founder" or "co-founder".
 *  - These are honest build logs, not launch announcements. Say what works and what doesn't.
 *
 * TODO(rohit): the two posts below are deliberately metric-free because nothing is measured yet.
 * Once you have real numbers — model + quant level, tokens/sec on your device, RAM headroom,
 * dataset size after cleaning, reply-accept rate — add them to `facts` on each post. That is the
 * single thing that will make these pages land with an AI-infra reviewer.
 */

import type { Diagram } from "@/content/case-studies";

export type LabStage = "Building" | "Ideation";

export type PostBlock =
  | { kind: "p"; text: string }
  | { kind: "h"; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "code"; lang: string; text: string }
  /** Renders the post's `diagram` inline, reusing the case-study diagram component. */
  | { kind: "diagram" };

export type LabProject = {
  slug: string;
  name: string;
  /** One line, shown on the card. */
  oneLiner: string;
  stage: LabStage;
  /** Human-readable progress, e.g. "Inference working, fine-tune next". */
  status: string;
  started: string;
  stack: string[];
  accent: string;
  /** What a collaborator would actually do. Shown next to the mail CTA. */
  collab: string[];
  post: {
    title: string;
    /** ISO date — drives the blog index order and <time>. */
    date: string;
    /** Verified facts only. Empty is fine and honest. */
    facts: { label: string; value: string }[];
    /**
     * Hand-placed system diagram, drawn in on scroll. Optional on purpose — some work is
     * too early, or too commercially sensitive, to publish an architecture for.
     */
    diagram?: Diagram;
    blocks: PostBlock[];
  };
};

export const labProjects: LabProject[] = [
  {
    slug: "on-device-replies",
    name: "On-device reply model",
    oneLiner:
      "A quantized language model fine-tuned on my own WhatsApp history, running fully offline on my Android phone to draft replies when I'm away.",
    stage: "Building",
    status: "Inference running on-device · fine-tune in progress",
    started: "Nov 2026",
    stack: ["llama.cpp", "GGUF", "C / gcc", "Termux", "LoRA", "Android"],
    accent: "#3DDC97",
    collab: [
      "Dataset cleaning: turning a raw chat export into supervised pairs without leaking private threads",
      "Quantization tradeoffs — which levels keep voice intact at phone-sized memory",
      "A safer autosend policy: when the model should answer and when it must stay quiet",
    ],
    post: {
      title: "Running a fine-tuned reply model entirely on my phone",
      date: "2026-11-26",
      facts: [],
      diagram: {
        caption:
          "Adaptation happens once on a laptop. Everything inside the phone zone runs with no network at all \u2014 accent marks the path I built, dashed is outside the system.",
        zones: [
          { x: 40, y: 60, w: 280, h: 480, label: "Laptop \u2014 one time" },
          { x: 420, y: 60, w: 540, h: 480, label: "Phone \u2014 offline, every reply" },
        ],
        nodes: [
          { id: "export", x: 70, y: 110, w: 220, h: 64, label: "Chat export", sub: "raw, interleaved" },
          { id: "clean", x: 70, y: 215, w: 220, h: 64, label: "Clean + pair", sub: "strip PII, build turns" },
          { id: "lora", x: 70, y: 320, w: 220, h: 64, label: "LoRA fine-tune", sub: "adapter on a small base", accent: true },
          { id: "quant", x: 70, y: 425, w: 220, h: 64, label: "Quantize", sub: "GGUF, phone-sized", accent: true },
          { id: "weights", x: 460, y: 110, w: 200, h: 64, label: "GGUF weights", sub: "on device storage" },
          { id: "msg", x: 730, y: 110, w: 190, h: 64, label: "Incoming message", external: true },
          { id: "llama", x: 460, y: 235, w: 200, h: 72, label: "llama.cpp", sub: "gcc build, Termux", accent: true },
          { id: "local", x: 460, y: 370, w: 200, h: 64, label: "Local endpoint", sub: "loopback only" },
          { id: "draft", x: 730, y: 370, w: 190, h: 64, label: "Draft reply", sub: "I approve it", accent: true },
        ],
        edges: [
          { from: "export", to: "clean" },
          { from: "clean", to: "lora" },
          { from: "lora", to: "quant", accent: true },
          { from: "quant", to: "weights", accent: true, label: "copy once", curve: 60 },
          { from: "weights", to: "llama", label: "mmap" },
          { from: "msg", to: "llama", label: "prompt", curve: -70 },
          { from: "llama", to: "local", label: "serves" },
          { from: "local", to: "draft", accent: true },
        ],
      },
      blocks: [
        {
          kind: "p",
          text: "I reply to the same twenty messages every week. The interesting version of that problem isn't a cloud assistant with a chat API key — it's whether a model small enough to live on my own phone, trained on my own messages, can sound enough like me to be useful while I'm in a lab or asleep.",
        },
        {
          kind: "p",
          text: "So the constraint I set first: nothing leaves the device. No inference API, no chat history uploaded anywhere, no network dependency at all. That single rule decides the whole architecture.",
        },
        { kind: "h", text: "How it runs" },
        {
          kind: "p",
          text: "The runtime is llama.cpp, compiled from source with the Android toolchain inside Termux, so what actually executes on the phone is a native binary — no Python, no JVM layer, no interpreter in the hot path. The model ships as a quantized GGUF file sitting in the phone's own storage and is memory-mapped at load, which is what makes a model of this size viable on consumer RAM at all.",
        },
        {
          kind: "list",
          items: [
            "Build: llama.cpp compiled on-device in Termux against the NDK toolchain",
            "Weights: a small instruct base, quantized to GGUF so it fits in phone memory",
            "Adaptation: LoRA on my own exported chat history, merged into the served weights",
            "Interface: a local HTTP endpoint on loopback — nothing listens on the network",
          ],
        },
        { kind: "diagram" },
        { kind: "h", text: "The data is the hard part, not the model" },
        {
          kind: "p",
          text: "A WhatsApp export is not a dataset. It is interleaved threads, media placeholders, group chatter, people's phone numbers, and a decade of context the model has no way to see. Turning that into supervised pairs means deciding what counts as a prompt (the last turn? the last five?), stripping everything personally identifying about the other side of the conversation, and throwing away the enormous share of messages that are a thumbs-up or a voice note.",
        },
        {
          kind: "p",
          text: "I also had to accept that I'm the only labeller. There's no eval set handed to me — so I'm building one by holding out real conversations and checking whether the model's draft is something I would have actually sent, not whether it scores well on a benchmark that has nothing to do with my voice.",
        },
        { kind: "h", text: "Where it stands" },
        {
          kind: "p",
          text: "The runtime half works: the compiled binary loads the quantized model and generates on-device with no network. The fine-tune is the part still in progress, and the honest answer on quality is that I don't have numbers yet — which is exactly why this is a build log and not a launch post.",
        },
        { kind: "h", text: "What I'm not going to do" },
        {
          kind: "p",
          text: "It will not send anything by itself. A model that is confidently wrong in my voice to someone who trusts it is a worse outcome than a missed message, so the ceiling for this version is a draft I approve. Autosend, if it ever happens, needs a confidence signal I don't have yet.",
        },
        { kind: "h", text: "What's next" },
        {
          kind: "list",
          items: [
            "Finish the LoRA run and measure tokens/sec and peak RSS on the actual phone, not an emulator",
            "Build the held-out conversation eval and report accept rate honestly, including when it's bad",
            "Compare quantization levels for where my voice starts to flatten out",
            "Decide whether the adapter can stay separate rather than merged, so it can be retrained cheaply",
          ],
        },
      ],
    },
  },
  {
    slug: "kernel-study",
    name: "Kernel-level tooling",
    oneLiner:
      "Writing small kernel-level software in C — not to ship a product, but to stop treating the operating system as a black box underneath everything I build.",
    stage: "Ideation",
    status: "Ideation · reading and scoping the first module",
    started: "Nov 2026",
    stack: ["C", "Linux", "Systems programming"],
    accent: "#7C5CFF",
    collab: [
      "Pointers to the right reading order — I'd rather follow a path someone has already walked",
      "Code review on a first loadable module from anyone who has written one",
      "A realistic scope check: what is a sane first project and what is a six-month trap",
    ],
    post: {
      title: "Why I'm going a layer down: kernel-level C as deliberate study",
      date: "2026-11-26",
      facts: [],
      diagram: {
        caption:
          "The layer I ship on, the boundary everything crosses, and what sits underneath it. Dashed is the module I haven\u2019t written yet \u2014 that\u2019s the honest state of this one.",
        zones: [
          { x: 40, y: 50, w: 920, h: 190, label: "User space \u2014 where I work today" },
          { x: 40, y: 360, w: 920, h: 200, label: "Kernel \u2014 what I want to stop guessing about" },
        ],
        nodes: [
          { id: "svc", x: 80, y: 96, w: 240, h: 70, label: "My services", sub: "FastAPI, Node, Go" },
          { id: "libc", x: 370, y: 96, w: 240, h: 70, label: "Runtime / libc", sub: "the layer I lean on" },
          { id: "ctr", x: 660, y: 96, w: 240, h: 70, label: "Container", sub: "exits, reasons unclear" },
          { id: "sys", x: 80, y: 270, w: 820, h: 56, label: "The syscall boundary", sub: "every file, socket and page fault crosses here", accent: true },
          { id: "sched", x: 80, y: 404, w: 200, h: 72, label: "Scheduler", sub: "who runs next" },
          { id: "mm", x: 310, y: 404, w: 200, h: 72, label: "Memory manager", sub: "pages, OOM killer" },
          { id: "vfs", x: 540, y: 404, w: 200, h: 72, label: "VFS / block", sub: "where I/O cost lives" },
          { id: "mod", x: 770, y: 404, w: 130, h: 72, label: "My module", sub: "not written", accent: true, external: true },
        ],
        edges: [
          { from: "svc", to: "libc" },
          { from: "libc", to: "sys", accent: true, label: "calls" },
          { from: "ctr", to: "sys" },
          { from: "sys", to: "sched", accent: true },
          { from: "sys", to: "mm", accent: true },
          { from: "sys", to: "vfs" },
          { from: "mm", to: "mod", label: "expose state" },
        ],
      },
      blocks: [
        {
          kind: "p",
          text: "Everything I've shipped lives on top of an abstraction I can't see into. I've debugged a container that died for reasons I could only guess at, tuned a service by changing numbers I didn't fully understand, and watched a process get killed with no mental model of who decided that. The fix for that isn't another framework.",
        },
        {
          kind: "p",
          text: "So this is study with an artifact at the end, not a product. The goal is to be the person on a team who can say what the operating system is actually doing when something goes wrong at 2am, instead of restarting it.",
        },
        { kind: "h", text: "Why C, specifically" },
        {
          kind: "p",
          text: "Because at this layer there is nowhere to hide. No garbage collector deciding when memory goes away, no runtime catching a bad access, no exception to bubble up. Writing C against kernel interfaces forces an explicitness about memory, lifetimes and failure that I think makes me better at the higher-level work too — and it's the language the thing I'm trying to understand is written in.",
        },
        { kind: "h", text: "What I'm actually reading toward" },
        {
          kind: "list",
          items: [
            "How a process is really scheduled, and what the kernel knows that top doesn't show",
            "The syscall boundary — what crossing it costs and why that cost shapes every I/O design decision",
            "Memory: virtual to physical, page faults, and why the OOM killer picks what it picks",
            "Loadable modules as the smallest honest unit of kernel code I can write, build and break safely in a VM",
          ],
        },
        { kind: "diagram" },
        { kind: "h", text: "This is the ideation phase, and that's the honest label" },
        {
          kind: "p",
          text: "There is no code to show yet. I'm scoping a first module small enough to finish — the kind of thing that exposes one real piece of kernel state and teaches me the build, load and debug loop without turning into a project I abandon. I'd rather say that plainly than put a diagram here for something I haven't written.",
        },
        {
          kind: "p",
          text: "It also connects to the other thing on this page. Getting a model to run as a native binary on a phone is already a systems problem — memory mapping, quantization because RAM is finite, a compiled toolchain instead of an interpreter. The deeper I go on the OS, the less of that feels like magic.",
        },
        { kind: "h", text: "What's next" },
        {
          kind: "list",
          items: [
            "Set up a VM I'm comfortable crashing repeatedly",
            "Get a trivial module to build, load and unload cleanly — the loop before the content",
            "Pick one piece of kernel state worth exposing and write that honestly",
            "Write up what I got wrong, which is the part these posts are actually for",
          ],
        },
      ],
    },
  },
  {
    slug: "outreach-quality",
    name: "Outreach worth replying to",
    oneLiner:
      "Cold B2B outreach is mostly noise. An ideation-stage look at whether generated messages can be worth the recipient's time, rather than just cheaper to send.",
    stage: "Ideation",
    status: "Ideation · defining the quality bar before the build",
    started: "Nov 2026",
    /*
     * Intentionally vague. The working document for this covers architecture, model routing,
     * the data pipeline and the commercial model; none of that is public while it is early,
     * and this page is the problem statement only. Do not add a diagram or a stack list here.
     */
    stack: ["Applied LLMs", "Evaluation", "Product"],
    accent: "#4DA3FF",
    collab: [
      "Anyone who has sat on the receiving end of B2B outreach and can say what made them reply",
      "How you measure 'good' here without optimising straight into spam",
      "Where the honest line sits between helping someone write and writing for them",
    ],
    post: {
      title: "Can outreach that's generated still deserve a reply?",
      date: "2026-11-25",
      facts: [],
      blocks: [
        {
          kind: "p",
          text: "Almost all cold outreach is bad. Not because a machine wrote it \u2014 plenty of it isn't \u2014 but because it was written for the sender. It exists to hit a send quota, and the person on the other end can tell within half a sentence.",
        },
        {
          kind: "p",
          text: "The obvious thing to do with a language model here is make the bad version cheaper: generate more of it, faster, to more people. That works as a business for roughly as long as it takes inboxes to adapt, and it makes the problem worse for everyone \u2014 including the next person who actually has something worth saying.",
        },
        {
          kind: "p",
          text: "So the question I keep circling is narrower than \u201ccan AI write sales emails\u201d, which is already answered and mostly answered badly. It's whether a generated message can clear the bar of being worth the recipient's attention.",
        },
        { kind: "h", text: "Passing for human is the wrong target" },
        {
          kind: "p",
          text: "Most tools in this space optimise for a message that reads like a person wrote it. That sounds like the right goal and isn't. A message can be perfectly human-sounding and still be worthless \u2014 most of the ones I delete are. Fluency was never the bottleneck.",
        },
        {
          kind: "p",
          text: "What makes me reply to a stranger is that they understood something specific about my situation and said something I couldn't have predicted from the subject line. That's a much harder target than fluency, and it fails in a visible way: a message that tries to sound personal while clearly knowing nothing about you is worse than an honest generic one. The uncanny version costs you more trust than the boring version.",
        },
        {
          kind: "p",
          text: "Which means the interesting constraint isn't how well the thing writes. It's how well it knows when it has nothing to say.",
        },
        { kind: "h", text: "The measurement trap" },
        {
          kind: "p",
          text: "This is the part that makes it a real engineering problem rather than a prompt. Say you build it and want to know if it's any good. The natural metric is reply rate. Optimise for reply rate and you will get replies \u2014 by being more misleading. Vague urgency, implied prior contact, a subject line that reads like a reply to something. All of it lifts the number. All of it is the behaviour I'd be building the tool to avoid.",
        },
        {
          kind: "p",
          text: "The same trap sits under every downstream metric. Meetings booked rewards pressure. Open rate rewards bait. Any single number you optimise hard enough turns into the thing people already hate about their inbox, and the system gets there faster than you'll notice, because it's optimising and you're reviewing samples.",
        },
        {
          kind: "p",
          text: "So the measurement has to carry a cost for the failure mode, not just a reward for the win. Something closer to: of the people who replied, how many were glad they did? That's harder to collect and much harder to game, and I think any honest version of this has to answer it before it writes a single message at volume.",
        },
        { kind: "h", text: "What I think is true so far" },
        {
          kind: "list",
          items: [
            "Volume is the problem, not the solution \u2014 a tool that makes it trivial to contact ten thousand people is solving for the wrong party",
            "Refusing is a feature: if there's nothing specific to say to someone, the correct output is no message at all",
            "The quality bar has to be set by the recipient, not the sender, or the metric drifts within weeks",
            "Anything built on people's data needs the consent question settled first, not retrofitted once it works",
          ],
        },
        { kind: "h", text: "Why this one and not something easier" },
        {
          kind: "p",
          text: "I've built enough things that talk to real users to know the difference between a demo that impresses and a system that holds up once it's running unattended. This sits squarely in that gap. The demo is easy \u2014 anyone can show a model writing a convincing email. The system is hard, because the thing that makes it valuable and the thing that makes it harmful are the same capability pointed in different directions.",
        },
        {
          kind: "p",
          text: "That's also why it's filed under ideation rather than in progress. I don't want to build the volume version by accident, which is what happens when you start with the generation and figure out the guardrails later. Starting from the constraint is slower and I think it's the only way this ends up being something I'd want to have made.",
        },
        { kind: "h", text: "What's next" },
        {
          kind: "list",
          items: [
            "Collect real examples of outreach that earned a reply, and work out what they actually share",
            "Define a quality signal that gets worse, not better, when the message overreaches",
            "Write down what the tool refuses to do before deciding what it does",
            "Settle provenance and consent for anything it learns from \u2014 that answer gates the rest",
          ],
        },
      ],
    },
  },
];

/** Skills being built deliberately, alongside the work above. Not claimed as strengths. */
export const developingSkills = [
  {
    skill: "Cybersecurity",
    why: "I've shipped auth, payments and production deploys. I want to be the one who finds the hole, not the one who left it.",
    now: "Fundamentals and hands-on practice",
  },
  {
    skill: "C for systems work",
    why: "The language the layer underneath my stack is written in. No runtime to hide behind.",
    now: "Writing small programs toward kernel-level code",
  },
  {
    skill: "Machine learning foundations",
    why: "I build with models every day. I want the maths under them, not just the API surface.",
    now: "Working up from fundamentals, not tutorials",
  },
  {
    skill: "Fine-tuning",
    why: "Prompting has a ceiling. Adapting weights to a specific voice or task is the next tool.",
    now: "LoRA on my own data — see the on-device build log",
  },
] as const;

export const getLabProject = (slug: string) => labProjects.find((p) => p.slug === slug);

/** Blog posts, newest first. Today every post belongs to a lab project; the shape allows standalone posts later. */
export const posts = [...labProjects].sort((a, b) => b.post.date.localeCompare(a.post.date));
