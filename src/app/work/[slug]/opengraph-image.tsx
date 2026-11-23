import { ImageResponse } from "next/og";
import { featured } from "@/content/projects";
import { getCaseStudy } from "@/content/case-studies";
import { site } from "@/content/site";

export const alt = "Case study by Rohit Kumar";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return featured.filter((p) => getCaseStudy(p.slug)).map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = featured.find((p) => p.slug === slug);
  const name = project?.name ?? "Case study";
  const line = project?.oneLiner ?? site.tagline;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#0b0b0a",
          backgroundImage: `radial-gradient(90% 120% at 100% 0%, ${project?.accent ?? "#ff5a1f"}55 0%, #0b0b0a 60%)`,
          color: "#ecebe6",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, letterSpacing: 3, textTransform: "uppercase", color: "#8d8b84" }}>
          <span>{`Case study${project?.team ? " · Team project" : project ? " · Solo" : ""}`}</span>
          <span>{site.domain}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 150, lineHeight: 0.9, letterSpacing: -7, fontWeight: 600 }}>{name}</div>
          <div style={{ marginTop: 28, fontSize: 32, lineHeight: 1.3, color: "#c9c7c0", maxWidth: 940 }}>{line}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 24 }}>
          <div style={{ width: 14, height: 14, borderRadius: 7, background: "#ff5a1f" }} />
          <span>{site.name}</span>
          <span style={{ color: "#8d8b84" }}>{`— ${project?.period ?? ""}`}</span>
        </div>
      </div>
    ),
    size
  );
}
