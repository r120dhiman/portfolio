/**
 * Route smoke tests. No test framework dependency — node:test is built in.
 *
 * Boots the production server once, then asserts every route a visitor or crawler can
 * reach actually renders, that the PDFs download, and that the things which silently rot
 * (canonical tags, JSON-LD, sitemap entries) are still present.
 *
 *   npm run build && npm test
 */
import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";

const PORT = process.env.SMOKE_PORT ?? "3100";
const BASE = `http://127.0.0.1:${PORT}`;

let server;

const get = (path) => fetch(`${BASE}${path}`, { redirect: "manual" });

async function waitForServer(timeoutMs = 60_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(BASE, { signal: AbortSignal.timeout(2000) });
      if (res.ok) return;
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Server did not start on ${BASE} within ${timeoutMs}ms`);
}

before(async () => {
  server = spawn("npx", ["next", "start", "--port", PORT], {
    stdio: ["ignore", "ignore", "inherit"],
    env: process.env,
  });
  await waitForServer();
});

after(() => {
  server?.kill("SIGTERM");
});

const PAGES = [
  "/",
  "/work",
  "/work/wolfe",
  "/work/tripflow",
  "/work/ninetynine",
  "/work/spardha",
  "/blog",
  "/blog/on-device-replies",
  "/blog/kernel-study",
  "/resume",
];

describe("routes render", () => {
  for (const path of PAGES) {
    it(`${path} returns 200 with a single h1`, async () => {
      const res = await get(path);
      assert.equal(res.status, 200, `${path} should be 200`);
      const html = await res.text();
      const h1s = html.match(/<h1[\s>]/g) ?? [];
      assert.equal(h1s.length, 1, `${path} should have exactly one <h1>, found ${h1s.length}`);
    });
  }

  it("an unknown route returns a real 404, not a soft 200", async () => {
    const res = await get("/this-route-does-not-exist");
    assert.equal(res.status, 404);
  });
});

describe("crawlable metadata", () => {
  it("every page declares a canonical URL", async () => {
    for (const path of PAGES) {
      const html = await (await get(path)).text();
      assert.match(html, /rel="canonical"/, `${path} is missing a canonical link`);
    }
  });

  it("the home page ships Person and WebSite structured data", async () => {
    const html = await (await get("/")).text();
    const blocks = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map((m) =>
      JSON.parse(m[1])
    );
    const types = blocks.map((b) => b["@type"]);
    assert.ok(types.includes("Person"), `expected a Person block, got ${types.join(", ")}`);
    assert.ok(types.includes("WebSite"), `expected a WebSite block, got ${types.join(", ")}`);
  });

  it("a blog post ships valid BlogPosting structured data", async () => {
    const html = await (await get("/blog/on-device-replies")).text();
    const blocks = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map((m) =>
      JSON.parse(m[1])
    );
    assert.ok(
      blocks.some((b) => b["@type"] === "BlogPosting" && b.headline),
      "expected a BlogPosting block with a headline"
    );
  });

  it("sitemap and robots serve, and the sitemap lists every page", async () => {
    const robots = await get("/robots.txt");
    assert.equal(robots.status, 200);

    const xml = await (await get("/sitemap.xml")).text();
    for (const path of PAGES) {
      const suffix = path === "/" ? "" : path;
      assert.ok(xml.includes(`${suffix}</loc>`), `sitemap is missing ${path}`);
    }
  });
});

describe("downloads", () => {
  for (const variant of ["Rohit_Kumar_SDE", "Rohit_Kumar_Frontier", "Rohit_Kumar_FDE"]) {
    it(`${variant}.pdf downloads as a PDF`, async () => {
      const res = await get(`/cv/${variant}.pdf`);
      assert.equal(res.status, 200);
      assert.match(res.headers.get("content-type") ?? "", /pdf/);
    });
  }
});
