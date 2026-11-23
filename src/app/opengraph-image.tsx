import { ImageResponse } from "next/og";
import { site } from "@/content/site";

export const alt = "Rohit Kumar — Software Engineer, AI products end to end";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
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
          backgroundImage: "radial-gradient(80% 110% at 100% 100%, #ff5a1f44 0%, #0b0b0a 62%)",
          color: "#ecebe6",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, letterSpacing: 3, textTransform: "uppercase", color: "#8d8b84" }}>
          <span>Portfolio · 2026</span>
          <span>{site.domain}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 190, lineHeight: 0.86, letterSpacing: -10, fontWeight: 600 }}>
            Rohit Kumar<span style={{ color: "#ff5a1f" }}>.</span>
          </div>
          <div style={{ marginTop: 32, fontSize: 34, lineHeight: 1.3, color: "#c9c7c0", maxWidth: 980 }}>
            Software engineer building AI products end to end: agent backends, realtime LLM pipelines, and the product around them.
          </div>
        </div>
        <div style={{ display: "flex", gap: 28, fontSize: 22, color: "#8d8b84", textTransform: "uppercase", letterSpacing: 2 }}>
          <span style={{ color: "#ff5a1f" }}>SDE</span>
          <span>AI Engineer</span>
          <span>Forward Deployed</span>
          <span>IIT (BHU) &apos;27</span>
        </div>
      </div>
    ),
    size
  );
}
