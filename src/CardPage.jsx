import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { CLAUDE_ORANGE } from "./Layout";
import { TAG_COLORS, flattenStack, capitalize } from "./utils";
import { buildHourDist, rotateHeatmap, heatmapAxisLabels } from "./heatmap";

const mono = "'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace";
const sans = "'IBM Plex Sans', sans-serif";
const BASE_URL = import.meta.env.BASE_URL;

function safeHref(url) {
  const s = String(url).trim().toLowerCase();
  return s.startsWith('https://') || s.startsWith('http://') || s.startsWith('mailto:') ? url : '#';
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function computeSimilar(current, allDevs, maxCount = 4) {
  const myStack = new Set(flattenStack(current.stack).map((s) => s.toLowerCase()));
  if (myStack.size === 0) return [];

  const scored = allDevs
    .filter((d) => d.username !== current.username)
    .map((d) => {
      const theirStack = flattenStack(d.stack).map((s) => s.toLowerCase());
      const overlap = theirStack.filter((t) => myStack.has(t)).length;
      return { dev: d, score: overlap };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, maxCount).map((s) => s.dev);
}

const STATUS_STYLES = {
  shipped: { color: "#7ee787", bg: "rgba(126, 231, 135, 0.1)" },
  wip: { color: "#e3b341", bg: "rgba(227, 179, 65, 0.1)" },
  concept: { color: "#bc8cff", bg: "rgba(188, 140, 255, 0.1)" },
  archived: { color: "#484f58", bg: "rgba(72, 79, 88, 0.1)" },
};

function fmtNum(n) {
  if (n >= 10000) return Math.round(n / 1000) + 'K';
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(n);
}

function StatusTag({ status }) {
  if (!status) return null;
  const s = STATUS_STYLES[status] || { color: "#58a6ff", bg: "rgba(88, 166, 255, 0.1)" };
  return (
    <span style={{ fontSize: 11, fontFamily: mono, padding: "1px 6px", borderRadius: 4, fontWeight: 500, color: s.color, background: s.bg }}>
      [{status}]
    </span>
  );
}

function SimilarCard({ dev, index }) {
  const [hovered, setHovered] = useState(false);
  const shortArchetype = (dev.archetype || "").replace(/^The /, "");
  const tagColor = TAG_COLORS[index % TAG_COLORS.length];
  const stackList = flattenStack(dev.stack);

  return (
    <Link
      to={`/cards/${dev.username}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "block", textDecoration: "none", color: "inherit",
        background: hovered ? "#0d1117" : "#0a0e14",
        border: `1px solid ${hovered ? "#2d3748" : "#1a2332"}`,
        borderRadius: 8, padding: "16px 18px",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        boxShadow: hovered ? "0 8px 24px rgba(0,0,0,0.3)" : "0 2px 8px rgba(0,0,0,0.15)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontFamily: mono, fontSize: 14, fontWeight: 700, color: "#f0f6fc" }}>@{dev.username}</span>
        {shortArchetype && (
          <span style={{ fontSize: 8, fontFamily: mono, color: tagColor, background: tagColor + "14", border: `1px solid ${tagColor}28`, padding: "1px 6px", borderRadius: 3, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {shortArchetype}
          </span>
        )}
      </div>
      <div style={{ fontSize: 11, color: "#8b949e", fontFamily: sans, marginBottom: 8, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical" }}>
        {dev.title}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
        {stackList.slice(0, 3).map((s) => (
          <span key={s} style={{ fontSize: 9, fontFamily: mono, color: "#8b949e", background: "#161b22", padding: "1px 6px", borderRadius: 3, border: "1px solid #21262d" }}>{s}</span>
        ))}
      </div>
    </Link>
  );
}

function ShareButton({ children, onClick, href }) {
  const [hovered, setHovered] = useState(false);
  const style = {
    color: hovered ? "#c9d1d9" : "#484f58",
    fontSize: 12, fontFamily: mono,
    textDecoration: "none",
    padding: "4px 12px",
    border: `1px solid ${hovered ? "#30363d" : "#21262d"}`,
    borderRadius: 6,
    transition: "all 0.2s",
    cursor: "pointer",
    background: "none",
    display: "inline-block",
    whiteSpace: "nowrap",
  };

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" style={style} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
        {children}
      </a>
    );
  }
  return (
    <button style={style} onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      {children}
    </button>
  );
}

// --- Typewriter effect for insight reveals ---
function TypewriterText({ text, onComplete, speed = 18 }) {
  const [displayed, setDisplayed] = useState("");
  const cbRef = useRef(onComplete);
  cbRef.current = onComplete;

  useEffect(() => {
    let idx = 0;
    setDisplayed("");
    const interval = setInterval(() => {
      idx++;
      if (idx > text.length) {
        clearInterval(interval);
        cbRef.current?.();
        return;
      }
      setDisplayed(text.slice(0, idx));
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <>
      {displayed}
      {displayed.length < text.length && (
        <span style={{ color: CLAUDE_ORANGE, animation: "blink 0.8s step-end infinite", fontWeight: 700 }}>|</span>
      )}
    </>
  );
}

// =====================================================================
// Main CardPage component
// =====================================================================

export default function CardPage() {
  const { username } = useParams();
  const [developers, setDevelopers] = useState([]);
  const [copyLabel, setCopyLabel] = useState("copy link");
  const [dnaRevealed, setDnaRevealed] = useState(false);
  const [dnaTyping, setDnaTyping] = useState(false);
  const [dnaTyped, setDnaTyped] = useState(false);
  const [dnaHovered, setDnaHovered] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`${BASE_URL}cards-index.json`, { cache: "no-cache" })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setDevelopers)
      .catch(() => setError(true));
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [username]);

  const dev = developers.find((d) => d.username === username);

  if (error) {
    return (
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "80px 40px", textAlign: "center", animation: "fadeIn 0.4s ease" }}>
        <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.3 }}>&empty;</div>
        <div style={{ fontSize: 14, color: "#484f58", fontFamily: mono, marginBottom: 16 }}>Failed to load card data. Try refreshing.</div>
        <button onClick={() => window.location.reload()} style={{ fontSize: 12, fontFamily: mono, color: CLAUDE_ORANGE, background: "transparent", border: `1px solid ${CLAUDE_ORANGE}40`, padding: "6px 16px", borderRadius: 6, cursor: "pointer" }}>Refresh</button>
      </div>
    );
  }

  if (developers.length === 0) {
    return (
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "80px 40px", textAlign: "center", animation: "fadeIn 0.4s ease" }}>
        <div style={{ fontSize: 13, color: "#484f58", fontFamily: mono }}>Loading...</div>
      </div>
    );
  }

  if (!dev) {
    return (
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "80px 40px", textAlign: "center", animation: "fadeIn 0.4s ease" }}>
        <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.3 }}>&empty;</div>
        <div style={{ fontSize: 14, color: "#484f58", fontFamily: mono, marginBottom: 16 }}>Developer @{username} not found</div>
        <Link to="/" style={{ fontSize: 12, fontFamily: mono, color: CLAUDE_ORANGE, textDecoration: "none", border: `1px solid ${CLAUDE_ORANGE}40`, padding: "6px 16px", borderRadius: 6 }}>
          Back to gallery
        </Link>
      </div>
    );
  }

  const similar = computeSimilar(dev, developers);
  const titleLine = [dev.title, dev.location].filter(Boolean).join(" \u00b7 ");
  const cardURL = `${window.location.origin}${BASE_URL}cards/${encodeURIComponent(dev.username)}/`;
  const shareText = encodeURIComponent(`${dev.name}'s devcard`);
  const shareURL = encodeURIComponent(cardURL);
  const hasDna = !!dev.dna;
  const hasNextProject = !!dev.next_project;
  const hasSidebar = hasDna || hasNextProject || !!dev.claude;

  function handleDnaClick() {
    if (dnaTyping) return;
    if (dnaTyped) {
      setDnaRevealed((prev) => !prev);
    } else {
      setDnaTyping(true);
      setDnaRevealed(true);
    }
  }

  function handleDnaTypingComplete() {
    setDnaTyped(true);
    setDnaTyping(false);
  }

  function handleCopy() {
    navigator.clipboard.writeText(cardURL).then(() => {
      setCopyLabel("copied!");
      setTimeout(() => setCopyLabel("copy link"), 1500);
    });
  }

  return (
    <div className="card-page-root" style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 40px 80px", animation: "fadeSlideUp 0.5s ease" }}>
      {/* Back link */}
      <Link to="/" style={{ fontSize: 12, fontFamily: mono, color: "#484f58", textDecoration: "none", display: "inline-block", marginBottom: 24, transition: "color 0.2s" }}>
        &larr; gallery
      </Link>

      {/* Two-column layout: card left, insights right */}
      <div style={{ display: "flex", flexWrap: "nowrap", gap: 32, alignItems: "flex-start" }} className="card-layout">

        {/* LEFT — Terminal card (matches plugin exactly) */}
        <div style={{ flex: "1 1 0", minWidth: 0, maxWidth: hasSidebar ? 720 : 720 }}>
          <div style={{
            background: "#0d1117",
            border: "1px solid #30363d",
            borderRadius: 6,
            overflow: "hidden",
            boxShadow: "0 0 0 1px rgba(218, 119, 86, 0.05), 0 16px 70px rgba(0, 0, 0, 0.6), 0 0 120px rgba(218, 119, 86, 0.03)",
          }}>
            {/* Titlebar */}
            <div style={{ background: "#161b22", padding: "10px 16px", borderBottom: "1px solid #30363d", userSelect: "none", fontFamily: mono, fontSize: 13, letterSpacing: 0.3 }}>
              <span style={{ color: "#6e7681" }}>~</span>{" "}
              <span style={{ color: "#484f58" }}>devcard</span>{" "}
              <span style={{ color: "#8b949e" }}>@{dev.username}</span>
            </div>

            {/* Card body */}
            <div className="card-body-content" style={{ padding: "28px 32px 24px" }}>
              {/* Name */}
              <div style={{
                color: CLAUDE_ORANGE,
                fontFamily: mono,
                fontSize: 28,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 8,
                textShadow: "0 0 20px rgba(218, 119, 86, 0.3)",
                lineHeight: 1.2,
              }}>{dev.name}</div>

              {/* Title + Location */}
              {titleLine && <div style={{ fontFamily: mono, fontSize: 14, color: "#484f58", marginBottom: 8 }}>{titleLine}</div>}

              {/* Archetype */}
              {dev.archetype && (
                <div style={{ fontFamily: mono, fontSize: 13, marginBottom: 16 }}>
                  <span style={{ color: "#6e7681" }}>Claude's read:</span>{" "}
                  <span style={{ color: "#bc8cff", fontStyle: "italic", fontWeight: 500 }}>{dev.archetype}</span>
                </div>
              )}

              <hr style={{ border: "none", borderTop: "1px solid #21262d", margin: "0 0 20px 0" }} />

              {/* Bio */}
              {dev.bio && (
                <Section title="Bio">
                  <div style={{ fontFamily: mono, color: "#c9d1d9", fontSize: 13, lineHeight: 1.6 }}>{dev.bio}</div>
                </Section>
              )}

              {/* About */}
              {dev.about && dev.about !== dev.bio && (
                <Section title="About">
                  <div style={{ fontFamily: mono, color: "#c9d1d9", fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-line" }}>{dev.about}</div>
                </Section>
              )}

              {/* Stack */}
              {dev.stack && typeof dev.stack === "object" && Object.keys(dev.stack).length > 0 && (
                <Section title="Stack">
                  {Object.entries(dev.stack).map(([cat, techs]) => (
                    <div key={cat} style={{ display: "flex", gap: 8, marginBottom: 4, fontFamily: mono, fontSize: 13, lineHeight: 1.6 }}>
                      <span className="stack-label" style={{ color: "#484f58", minWidth: 120, flexShrink: 0 }}>{capitalize(cat)}</span>
                      <span style={{ color: "#c9d1d9", minWidth: 0 }}>{Array.isArray(techs) ? techs.join(" \u00b7 ") : String(techs)}</span>
                    </div>
                  ))}
                </Section>
              )}

              {/* Interests */}
              {Array.isArray(dev.interests) && dev.interests.length > 0 && (
                <Section title="Interests">
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {dev.interests.map((interest) => (
                      <span key={interest} style={{ fontFamily: mono, background: "rgba(188, 140, 255, 0.1)", color: "#d2a8ff", fontSize: 12, padding: "3px 10px", borderRadius: 6 }}>
                        {interest}
                      </span>
                    ))}
                  </div>
                </Section>
              )}

              {/* Projects */}
              {Array.isArray(dev.projects) && dev.projects.length > 0 && (
                <Section title="Projects">
                  {dev.projects.map((proj) => (
                    <div key={proj.name} style={{ marginBottom: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: mono, fontSize: 13 }}>
                        <span style={{ color: "#7ee787", fontSize: 14 }}>&#9656;</span>
                        <span style={{ color: "#f0f6fc", fontWeight: 600 }}>{proj.name}</span>
                        <StatusTag status={proj.status} />
                      </div>
                      {proj.description && (
                        <div style={{ fontFamily: mono, color: "#484f58", fontSize: 12, marginLeft: 22, marginTop: 2 }}>{proj.description}</div>
                      )}
                    </div>
                  ))}
                </Section>
              )}

              {/* Experience */}
              {Array.isArray(dev.experience) && dev.experience.length > 0 && (
                <Section title="Experience">
                  {dev.experience.map((exp, i) => (
                    <div key={i} style={{ marginBottom: 8, fontFamily: mono, fontSize: 13 }}>
                      <span style={{ color: "#c9d1d9" }}>{exp.role}</span>
                      <span style={{ color: "#484f58" }}> @ {exp.company}</span>
                      {exp.period && <span style={{ color: "#484f58" }}> ({exp.period})</span>}
                      {exp.highlight && (
                        <div style={{ color: "#484f58", fontSize: 12, marginLeft: 8, marginTop: 2 }}>{exp.highlight}</div>
                      )}
                    </div>
                  ))}
                </Section>
              )}

              {/* Private note */}
              {dev.private_note && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ color: "#6e7681", fontStyle: "italic", fontFamily: mono, fontSize: 12, borderLeft: "2px solid rgba(218, 119, 86, 0.25)", paddingLeft: 12 }}>
                    {dev.private_note}
                  </div>
                </div>
              )}

              {/* Links */}
              {dev.links && typeof dev.links === "object" && Object.keys(dev.links).length > 0 && (
                <Section title="Links">
                  {Object.entries(dev.links).map(([label, url]) => (
                    <div key={label} style={{ display: "flex", gap: 8, marginBottom: 4, fontFamily: mono, fontSize: 13, minWidth: 0 }}>
                      <span className="link-label" style={{ color: "#484f58", minWidth: 120, flexShrink: 0 }}>{capitalize(label)}</span>
                      <a href={safeHref(url)} target="_blank" rel="noopener noreferrer" className="link-url-text" style={{ color: CLAUDE_ORANGE, textDecoration: "none", transition: "color 0.2s", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 }}>
                        {url}
                      </a>
                    </div>
                  ))}
                </Section>
              )}

              <hr style={{ border: "none", borderTop: "1px solid #21262d", margin: "4px 0 0 0" }} />
            </div>
          </div>

        </div>

        {/* RIGHT — Sidebar: single container */}
        {hasSidebar && (
          <div style={{ flex: "0 1 380px", minWidth: 280, position: "sticky", top: 32 }} className="insights-panel">
            <style>{`@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }`}</style>
            <div style={{
              background: "#0a0e14", border: "1px solid #1a2332", borderRadius: 6,
              padding: "24px 20px", display: "flex", flexDirection: "column", gap: 0,
            }}>

              {/* Claude's Take — terminal-style DNA reveal */}
              {hasDna && (
                <div>
                  <div style={{ fontFamily: mono, fontSize: 11, color: "#484f58", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 16 }}>
                    Ask Claude about @{dev.username}
                  </div>

                  <div
                    onClick={handleDnaClick}
                    onMouseEnter={() => !dnaTyping && setDnaHovered(true)}
                    onMouseLeave={() => setDnaHovered(false)}
                    style={{
                      fontFamily: mono, fontSize: 12,
                      cursor: dnaTyping ? "default" : "pointer",
                      padding: "8px 12px",
                      borderLeft: `2px solid ${dnaRevealed ? "#7ee787" : dnaHovered ? "#7ee787" : "transparent"}`,
                      background: dnaHovered ? "rgba(126, 231, 135, 0.04)" : "transparent",
                      transition: "all 0.25s ease",
                      userSelect: "none",
                    }}
                  >
                    <span style={{ color: "#7ee787" }}>$</span>{" "}
                    <span style={{ color: "#8b949e" }}>claude</span>{" "}
                    <span style={{ color: dnaHovered ? "#f0f6fc" : "#c9d1d9", transition: "color 0.2s" }}>what's their story?</span>
                    {!dnaTyped && !dnaTyping && (
                      <span style={{ color: "#7ee787", animation: "blink 1s step-end infinite", marginLeft: 2 }}>_</span>
                    )}
                    {dnaTyped && !dnaRevealed && (
                      <span style={{ color: "#484f58", marginLeft: 6, fontSize: 11 }}>...</span>
                    )}
                  </div>

                  {(dnaTyping || dnaRevealed) && (
                    <div style={{
                      paddingLeft: 24, marginTop: 4, marginBottom: 8,
                      fontFamily: mono, fontSize: 12, color: "#c9d1d9", lineHeight: 1.7,
                    }}>
                      {dnaTyping ? (
                        <TypewriterText text={dev.dna} onComplete={handleDnaTypingComplete} speed={18} />
                      ) : (
                        dev.dna
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* What to Build Next */}
              {hasNextProject && (
                <div style={{ paddingTop: hasDna ? 16 : 0, borderTop: hasDna ? "1px solid #1a2332" : "none", marginTop: hasDna ? 16 : 0 }}>
                  <div style={{ fontFamily: mono, fontSize: 14, color: "#58a6ff", fontWeight: 600, marginBottom: 4 }}>
                    What to Build Next
                  </div>
                  <div style={{ fontFamily: mono, fontSize: 11, color: "#6e7681", fontStyle: "italic", marginBottom: 10 }}>
                    Based on your skills, Claude suggests:
                  </div>
                  <div style={{ fontFamily: mono, fontSize: 13, color: "#c9d1d9", lineHeight: 1.6 }}>
                    {dev.next_project}
                  </div>
                </div>
              )}

              {/* Claude Code Statistics */}
              {dev.claude && (() => {
                const cl = dev.claude;
                const sessions = Number(cl.sessions) || 0;
                const messages = Number(cl.messages || cl.total_messages) || 0;
                const sinceStr = cl.since || cl.active_since || '';
                const model = cl.model || cl.primary_model || '';
                const fmtSince = sinceStr ? new Date(sinceStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '';
                const statParts = [];
                if (sessions) statParts.push(`${fmtNum(sessions)} sessions`);
                if (messages) statParts.push(`${fmtNum(messages)} messages`);
                if (fmtSince) statParts.push(`since ${fmtSince}`);
                const statsLine = statParts.join(" \u00b7 ");
                const hasPrev = hasDna || hasNextProject;

                // Build 24-element hour distribution from either flat array or 7-day heatmap matrix
                const rawDist = buildHourDist(cl);
                let dist = null;
                let rotatedStartHour = 0;
                let axisLabels = ["0", "6", "12", "18", "23"];
                if (rawDist && rawDist.length === 24) {
                  const rotResult = rotateHeatmap(rawDist);
                  dist = rotResult.data;
                  rotatedStartHour = rotResult.startHour;
                  axisLabels = heatmapAxisLabels(rotatedStartHour);
                }
                const maxH = dist ? Math.max(...dist, 1) : 1;

                return (
                  <div style={{ paddingTop: hasPrev ? 16 : 0, borderTop: hasPrev ? "1px solid #1a2332" : "none", marginTop: hasPrev ? 16 : 0 }}>
                    <div style={{ fontFamily: mono, fontSize: 11, color: "#484f58", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 16 }}>
                      Claude Code Statistics
                    </div>

                    {cl.style && (
                      <div style={{ fontFamily: mono, fontSize: 15, color: "#bc8cff", fontWeight: 600, marginBottom: 4 }}>
                        {cl.style}
                      </div>
                    )}
                    {cl.style_description && (
                      <div style={{ fontFamily: mono, fontSize: 12, color: "#8b949e", fontStyle: "italic", marginBottom: 14, lineHeight: 1.5 }}>
                        {cl.style_description}
                      </div>
                    )}
                    {statsLine && (
                      <div style={{ fontFamily: mono, fontSize: 12, color: "#c9d1d9", marginBottom: 10 }}>
                        {statsLine}
                      </div>
                    )}
                    <div style={{ display: "flex", flexDirection: "column", gap: 3, marginBottom: dist ? 12 : 0 }}>
                      {model && (
                        <div style={{ display: "flex", gap: 8, fontFamily: mono, fontSize: 12 }}>
                          <span style={{ color: "#484f58", minWidth: 72 }}>Model</span>
                          <span style={{ color: "#c9d1d9" }}>{model}</span>
                        </div>
                      )}
                      {cl.rhythm && (
                        <div style={{ display: "flex", gap: 8, fontFamily: mono, fontSize: 12 }}>
                          <span style={{ color: "#484f58", minWidth: 72 }}>Rhythm</span>
                          <span style={{ color: "#c9d1d9" }}>
                            {cl.rhythm}
                            {Array.isArray(cl.peak_hours) && cl.peak_hours.length > 0 && (
                              <span style={{ color: "#484f58" }}> (peak: {cl.peak_hours.join(", ")}h)</span>
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                    {dist && (
                      <div>
                        <div style={{ display: "flex", gap: 2 }}>
                          {dist.map((val, i) => {
                            const hour = (i + rotatedStartHour) % 24;
                            const nextHour = (hour + 1) % 24;
                            const hourLabel = `${String(hour).padStart(2, "0")}:00\u2013${String(nextHour).padStart(2, "0")}:00`;
                            const pct = maxH > 0 ? Math.round((val / maxH) * 100) : 0;
                            return (
                              <div key={i} title={`${hourLabel}  \u00b7  ${val} ${val === 1 ? "message" : "messages"} (${pct}%)`} style={{
                                flex: 1, height: 14, borderRadius: 2,
                                background: CLAUDE_ORANGE,
                                opacity: val === 0 ? 0.06 : 0.15 + (val / maxH) * 0.85,
                                cursor: "default",
                              }} />
                            );
                          })}
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                          {axisLabels.map((h, i) => (
                            <span key={i} style={{ fontFamily: mono, fontSize: 10, color: "#484f58" }}>{h}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>

      {/* Footer + share — full width below both columns */}
      <div className="card-footer-watermark" style={{ textAlign: "center", padding: "20px 0", fontFamily: mono, fontSize: 11, letterSpacing: 1 }}>
        <span style={{ color: "#30363d", fontStyle: "italic" }}>devcard</span>
      </div>
      <div className="share-row" style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 8, flexWrap: "wrap" }}>
        <ShareButton onClick={handleCopy}>{copyLabel}</ShareButton>
        <ShareButton href={`https://x.com/intent/tweet?text=${shareText}&url=${shareURL}`}>share on X</ShareButton>
        <ShareButton href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareURL}`}>share on LinkedIn</ShareButton>
      </div>

      {/* Similar Developers — full width below */}
      {similar.length > 0 && (
        <div className="similar-section" style={{ marginTop: 48 }}>
          <div style={{ fontSize: 13, fontFamily: mono, color: "#484f58", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 16 }}>
            Similar developers
          </div>
          <div className="similar-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
            {similar.map((d, i) => (
              <SimilarCard key={d.username} dev={d} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// --- Reusable section wrapper ---
function Section({ title, children }) {
  return (
    <div className="card-section" style={{ marginBottom: 20 }}>
      <div style={{ fontFamily: mono, color: "#e3b341", fontSize: 13, fontWeight: 600, marginBottom: 8, letterSpacing: 0.3 }}>{title}</div>
      {children}
    </div>
  );
}
