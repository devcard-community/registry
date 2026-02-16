import { CLAUDE_ORANGE } from "./Layout";

const mono = "'JetBrains Mono', 'Fira Code', monospace";
const sans = "'IBM Plex Sans', sans-serif";

const Step = ({ number, title, command, description }) => (
  <div className="about-step" style={{ display: "flex", gap: 20, marginBottom: 32 }}>
    <div
      style={{
        width: 36, height: 36, borderRadius: "50%",
        background: CLAUDE_ORANGE + "18", color: CLAUDE_ORANGE,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: mono, fontSize: 14, fontWeight: 700,
        flexShrink: 0,
      }}
    >
      {number}
    </div>
    <div>
      <div style={{ fontSize: 16, color: "#f0f6fc", fontFamily: sans, fontWeight: 500, marginBottom: 6 }}>{title}</div>
      {command && (
        <code style={{ display: "inline-block", fontSize: 13, fontFamily: mono, color: CLAUDE_ORANGE, background: "#0a0e14", padding: "6px 14px", borderRadius: 6, border: "1px solid #1a2332", marginBottom: 8 }}>
          {command}
        </code>
      )}
      <p style={{ fontSize: 14, color: "#8b949e", fontFamily: sans, lineHeight: 1.6 }}>{description}</p>
    </div>
  </div>
);

export default function About() {
  return (
    <div className="about-root" style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 40px 80px", animation: "fadeIn 0.6s ease" }}>
      {/* Hero */}
      <div className="about-hero" style={{ maxWidth: 640, marginBottom: 64 }}>
        <h1 className="hero-heading" style={{ fontSize: 42, fontWeight: 300, color: "#f0f6fc", lineHeight: 1.15, letterSpacing: "-0.03em", marginBottom: 16, fontFamily: sans }}>
          Developer identity,<br />
          <span style={{ color: CLAUDE_ORANGE, fontWeight: 600 }}>in your terminal.</span>
        </h1>
        <p style={{ fontSize: 15, color: "#8b949e", lineHeight: 1.7, fontFamily: sans }}>
          devcard is an open-source Claude Code plugin that turns your GitHub profile into
          an interactive developer card. Create it in seconds, share it everywhere.
        </p>
      </div>

      {/* How it works */}
      <div style={{ marginBottom: 64 }}>
        <h2 style={{ fontSize: 13, color: "#484f58", fontFamily: mono, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 32 }}>How it works</h2>

        <Step
          number="1"
          title="Install the plugin"
          command="/plugin marketplace add devcard-community/devcard"
          description={<>Then run <code style={{ fontFamily: mono, color: CLAUDE_ORANGE }}>/plugin install devcard</code>. Two commands, zero dependencies.</>}
        />
        <Step
          number="2"
          title="Generate your card"
          command="/devcard:init your-github-username"
          description="Claude analyzes your GitHub profile — repos, languages, pinned projects — and generates a devcard.yaml with your stack, bio, and an AI-written personality read."
        />
        <Step
          number="3"
          title="Add your Claude Code fingerprint"
          command="/devcard:stats"
          description="Extracts your Claude Code usage patterns — session depth, peak hours, model preference — and generates a collaboration style label with an activity heatmap."
        />
        <Step
          number="4"
          title="Publish to the gallery"
          command="/devcard:publish"
          description="Opens a PR to the registry. Once merged, your card gets a public URL with social preview images — ready to share on X, LinkedIn, or embed in your README."
        />
      </div>

      {/* What's in a card */}
      <div style={{ marginBottom: 64 }}>
        <h2 style={{ fontSize: 13, color: "#484f58", fontFamily: mono, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 24 }}>What&rsquo;s in a devcard</h2>
        <div className="about-cards-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gridAutoRows: "1fr", gap: 16 }}>
          {[
            { label: "Identity", desc: "Name, title, location, and links" },
            { label: "Stack", desc: "Technologies grouped by domain" },
            { label: "Projects", desc: "What you've shipped, with status tags" },
            { label: "Archetype", desc: "An AI-assigned developer personality" },
            { label: "DNA", desc: "A critic's review of your body of work" },
            { label: "Interests", desc: "What excites you beyond the day job" },
            { label: "Next Project", desc: "A tailored project idea from Claude" },
            { label: "Claude Code Stats", desc: "Session depth, peak hours, model preference, and an activity heatmap", highlight: true },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                background: item.highlight ? "rgba(218, 119, 86, 0.06)" : "#0a0e14",
                border: `1px solid ${item.highlight ? CLAUDE_ORANGE + "30" : "#1a2332"}`,
                borderRadius: 8, padding: "16px 20px",
              }}
            >
              <div style={{ fontSize: 14, color: item.highlight ? CLAUDE_ORANGE : "#f0f6fc", fontFamily: sans, fontWeight: 500, marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: 13, color: "#484f58", fontFamily: sans, lineHeight: 1.5 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Developer DNA + Claude Code Statistics — side by side */}
      <div style={{ marginBottom: 64 }}>
        <h2 style={{ fontSize: 13, color: "#484f58", fontFamily: mono, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 16 }}>What Claude Code sees</h2>
        <p style={{ fontSize: 16, color: "#f0f6fc", fontFamily: sans, fontWeight: 400, lineHeight: 1.6, marginBottom: 28, maxWidth: 720 }}>
          A critic&rsquo;s review of your work &mdash; and a fingerprint of how you collaborate with AI.
        </p>

        <div style={{ display: "flex", gap: 24, alignItems: "stretch" }} className="about-panels">
          {/* LEFT — Developer DNA terminal */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ background: "#0d1117", border: "1px solid #30363d", borderRadius: 6, overflow: "hidden", height: "100%", display: "flex", flexDirection: "column" }}>
              {/* Titlebar */}
              <div style={{ background: "#161b22", padding: "10px 14px", display: "flex", alignItems: "center", gap: 7, borderBottom: "1px solid #30363d" }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f56" }} />
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ffbd2e" }} />
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#27c93f" }} />
              </div>

              {/* Terminal content */}
              <div className="about-terminal-content" style={{ padding: "20px 24px", fontFamily: mono, fontSize: 13, lineHeight: 1.8, flex: 1 }}>
                <div>
                  <span style={{ color: "#7ee787" }}>$</span>{" "}
                  <span style={{ color: "#c9d1d9" }}>/devcard:init shayse-xr</span>
                </div>
                <div style={{ color: "#484f58", marginTop: 4 }}>
                  Analyzing GitHub profile...
                </div>
                <div style={{ color: "#484f58" }}>
                  Scanning 23 repos, 4 languages, 47 starred repos
                </div>

                <div style={{ marginTop: 16, borderLeft: `2px solid ${CLAUDE_ORANGE}`, paddingLeft: 14, background: "rgba(218, 119, 86, 0.03)", paddingTop: 8, paddingBottom: 8 }}>
                  <div style={{ color: "#484f58", fontSize: 11, marginBottom: 6 }}>
                    Developer DNA
                  </div>
                  <div style={{ color: "#c9d1d9", fontStyle: "italic", lineHeight: 1.7, fontSize: 13 }}>
                    Crosses between Swift, gsplat shaders, and web UIs like someone
                    who hasn&rsquo;t decided which layer matters most &mdash; or more likely,
                    decided they all do. The through-line is clear: every project is
                    another piece of a capture-to-experience pipeline that doesn&rsquo;t
                    exist yet.
                  </div>
                </div>

                <div style={{ color: "#7ee787", marginTop: 16, fontSize: 12 }}>
                  &#10003; devcard.yaml written
                </div>
              </div>
            </div>
            <p style={{ fontSize: 13, color: "#484f58", fontFamily: sans, marginTop: 12 }}>
              Every read is different. Yours will be too.
            </p>
          </div>

          {/* RIGHT — Claude Code Statistics */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="about-stats-panel" style={{ background: "#0a0e14", border: "1px solid #1a2332", borderRadius: 6, padding: "24px 28px", height: "100%", display: "flex", flexDirection: "column" }}>
              <div style={{ fontFamily: mono, fontSize: 11, color: "#484f58", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 16 }}>
                Claude Code Statistics
              </div>
              <div style={{ fontFamily: mono, fontSize: 17, color: "#bc8cff", fontWeight: 600, marginBottom: 4 }}>
                Marathon Architect
              </div>
              <div style={{ fontFamily: mono, fontSize: 13, color: "#8b949e", fontStyle: "italic", marginBottom: 16, lineHeight: 1.5 }}>
                Runs deep, sustained sessions averaging 400+ messages. Prefers to stay in one context and iterate rather than starting fresh.
              </div>
              <div style={{ fontFamily: mono, fontSize: 13, color: "#c9d1d9", marginBottom: 12 }}>
                104 sessions &middot; 43K messages &middot; since 2026-01-03
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 3, marginBottom: 16 }}>
                <div style={{ display: "flex", gap: 8, fontFamily: mono, fontSize: 13 }}>
                  <span style={{ color: "#484f58", minWidth: 80 }}>Model</span>
                  <span style={{ color: "#c9d1d9" }}>opus</span>
                </div>
                <div style={{ display: "flex", gap: 8, fontFamily: mono, fontSize: 13 }}>
                  <span style={{ color: "#484f58", minWidth: 80 }}>Rhythm</span>
                  <span style={{ color: "#c9d1d9" }}>Morning Builder <span style={{ color: "#484f58" }}>(peak: 9, 10, 11h)</span></span>
                </div>
              </div>
              <div style={{ marginTop: "auto" }}>
                <div style={{ display: "flex", gap: 2 }}>
                  {[1,0,0,0,0,0,0,0,1,13,24,8,6,11,5,8,0,0,1,7,2,7,9,1].map((val, i) => (
                    <div key={i} style={{
                      flex: 1, height: 14, borderRadius: 2,
                      background: CLAUDE_ORANGE,
                      opacity: val === 0 ? 0.06 : 0.15 + (val / 24) * 0.85,
                    }} />
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                  {["0", "6", "12", "18", "23"].map(h => (
                    <span key={h} style={{ fontFamily: mono, fontSize: 10, color: "#484f58" }}>{h}</span>
                  ))}
                </div>
              </div>
            </div>
            <p style={{ fontSize: 13, color: "#484f58", fontFamily: sans, marginTop: 12 }}>
              Run <code style={{ fontFamily: mono, color: CLAUDE_ORANGE }}>/devcard:stats</code> to generate yours.
            </p>
          </div>
        </div>
      </div>

      {/* Creator */}
      <div style={{ marginBottom: 64 }}>
        <span style={{ fontSize: 14, color: "#8b949e", fontFamily: sans }}>
          Created by{" "}
          <a
            href="https://github.com/shayse-xr"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#f0f6fc", textDecoration: "none", fontWeight: 500 }}
          >
            Shayse
          </a>
        </span>
      </div>

      {/* GitHub CTA */}
      <div
        className="about-cta"
        style={{
          background: "#0a0e14", border: "1px solid #1a2332",
          borderRadius: 6, padding: "32px 40px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 20,
        }}
      >
        <div>
          <div style={{ fontSize: 18, color: "#f0f6fc", fontFamily: sans, fontWeight: 400, marginBottom: 6 }}>
            Open source on GitHub
          </div>
          <div style={{ fontSize: 13, color: "#484f58", fontFamily: sans }}>
            Star the repo, report issues, or contribute.
          </div>
        </div>
        <a
          href="https://github.com/devcard-community/devcard"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: 13, color: "#fff", background: CLAUDE_ORANGE,
            padding: "10px 24px", borderRadius: 8, textDecoration: "none",
            fontFamily: mono, fontWeight: 500, letterSpacing: "0.02em",
          }}
        >
          View on GitHub &rarr;
        </a>
      </div>
    </div>
  );
}
