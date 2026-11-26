"use client";

/**
 * Last-resort boundary: replaces the root layout, so it ships its own <html>/<body> and
 * cannot rely on globals.css being applied. Inline styles only, deliberately.
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "grid",
          placeContent: "center",
          gap: "1.5rem",
          padding: "2rem",
          background: "#0b0b0a",
          color: "#ecebe6",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <p style={{ fontFamily: "ui-monospace, monospace", fontSize: "0.75rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "#8d8b84" }}>
          Fatal · {error.digest ?? "no digest"}
        </p>
        <h1 style={{ margin: 0, fontSize: "clamp(2.5rem, 10vw, 6rem)", letterSpacing: "-0.04em", lineHeight: 0.9 }}>
          Something broke badly.
        </h1>
        <p style={{ margin: 0, maxWidth: "40ch", lineHeight: 1.6, color: "#8d8b84" }}>
          The root layout failed, so this page is intentionally plain. Reloading usually fixes it.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            justifySelf: "start",
            border: 0,
            borderRadius: "999px",
            padding: "0.9rem 1.75rem",
            background: "#ff5a1f",
            color: "#0b0b0a",
            fontSize: "1rem",
            cursor: "pointer",
          }}
        >
          Reload
        </button>
      </body>
    </html>
  );
}
