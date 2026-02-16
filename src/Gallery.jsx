import { useState, useRef, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { CLAUDE_ORANGE } from "./Layout";
import { TAG_COLORS, flattenStack } from "./utils";

const BASE_URL = import.meta.env.BASE_URL;
const CARDS_PER_PAGE = 24;
const MAX_TAGS = 3;
const MAX_STAGGER = 12;

const mono = "'JetBrains Mono', 'Fira Code', monospace";
const sans = "'IBM Plex Sans', sans-serif";

function relativeTime(dateStr) {
  if (!dateStr) return "";
  const now = new Date();
  const date = new Date(dateStr);
  const diffDays = Math.round((now - date) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "today";
  if (diffDays === 1) return "1d ago";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

const CardMini = ({ dev, index, tagColor }) => {
  const [hovered, setHovered] = useState(false);
  const shortArchetype = (dev.archetype || "").replace(/^The /, "");
  const stackList = flattenStack(dev.stack);
  const shown = stackList.slice(0, MAX_TAGS);
  const extra = stackList.length - MAX_TAGS;
  const projectCount = dev.repo_count ?? (Array.isArray(dev.projects) ? dev.projects.length : 0);
  const delay = Math.min(index, MAX_STAGGER) * 0.05;

  return (
    <Link
      to={`/cards/${dev.username}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative", overflow: "hidden", display: "block",
        background: hovered ? "#0d1117" : "#0a0e14",
        border: `1px solid ${hovered ? "#2d3748" : "#1a2332"}`,
        borderRadius: 6, padding: "20px 22px",
        cursor: "pointer", textDecoration: "none", color: "inherit",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hovered ? "0 12px 40px rgba(0,0,0,0.4)" : "0 2px 8px rgba(0,0,0,0.2)",
        animation: `fadeSlideUp 0.5s ease ${delay}s both`,
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, #4a5568, transparent)", opacity: hovered ? 0.6 : 0.2, transition: "opacity 0.3s" }} />

      <div style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4, gap: 8 }}>
          <span style={{ fontFamily: mono, fontSize: 16, fontWeight: 700, color: "#f0f6fc", letterSpacing: "-0.02em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            @{dev.username}
          </span>
          {shortArchetype && (
            <span style={{ fontSize: 9, fontFamily: mono, color: tagColor, background: tagColor + "14", border: `1px solid ${tagColor}28`, padding: "2px 7px", borderRadius: 3, textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap", flexShrink: 0 }}>
              {shortArchetype}
            </span>
          )}
        </div>
        <div style={{ fontSize: 12, color: "#8b949e", fontFamily: sans, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{dev.title}</div>
      </div>

      <div style={{ fontSize: 12, color: "#8b949e", fontFamily: sans, lineHeight: 1.5, marginBottom: 14, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
        {dev.bio}
      </div>

      <div style={{ display: "flex", flexWrap: "nowrap", gap: 4, marginBottom: 12, overflow: "hidden" }}>
        {shown.map((s) => (
          <span key={s} style={{ fontSize: 10, fontFamily: mono, color: "#8b949e", background: "#161b22", padding: "2px 8px", borderRadius: 3, border: "1px solid #21262d", whiteSpace: "nowrap", flexShrink: 0 }}>{s}</span>
        ))}
        {extra > 0 && (
          <span style={{ fontSize: 10, fontFamily: mono, color: "#484f58", padding: "2px 4px", whiteSpace: "nowrap", flexShrink: 0 }}>+{extra}</span>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 10, borderTop: "1px solid #1a2332" }}>
        <span style={{ fontSize: 10, color: "#484f58", fontFamily: sans }}>{dev.location}</span>
        <span style={{ fontSize: 10, color: "#484f58", fontFamily: mono }}>{projectCount} repo{projectCount !== 1 ? "s" : ""}</span>
      </div>

      <div style={{ position: "absolute", bottom: 48, right: 18, fontSize: 14, color: tagColor, opacity: hovered ? 0.8 : 0, transform: hovered ? "translateX(0)" : "translateX(-8px)", transition: "all 0.3s ease" }}>&rarr;</div>
    </Link>
  );
};

const CardRow = ({ dev, index, tagColor }) => {
  const [hovered, setHovered] = useState(false);
  const shortArchetype = (dev.archetype || "").replace(/^The /, "");
  const stackList = flattenStack(dev.stack);
  const shown = stackList.slice(0, 4);
  const extra = stackList.length - 4;
  const projectCount = dev.repo_count ?? (Array.isArray(dev.projects) ? dev.projects.length : 0);
  const delay = Math.min(index, MAX_STAGGER) * 0.03;

  return (
    <Link
      to={`/cards/${dev.username}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: 16,
        padding: "14px 20px",
        background: hovered ? "#0d1117" : "transparent",
        borderBottom: "1px solid #1a2332",
        textDecoration: "none", color: "inherit",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        animation: `fadeSlideUp 0.4s ease ${delay}s both`,
      }}
    >
      <div style={{ width: 140, flexShrink: 0 }}>
        <div style={{ fontFamily: mono, fontSize: 14, fontWeight: 700, color: "#f0f6fc", letterSpacing: "-0.02em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          @{dev.username}
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, color: "#8b949e", fontFamily: sans, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {dev.title}
        </div>
      </div>
      {shortArchetype && (
        <span style={{ fontSize: 9, fontFamily: mono, color: tagColor, background: tagColor + "14", border: `1px solid ${tagColor}28`, padding: "2px 7px", borderRadius: 3, textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap", flexShrink: 0 }}>
          {shortArchetype}
        </span>
      )}
      <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
        {shown.map((s) => (
          <span key={s} style={{ fontSize: 10, fontFamily: mono, color: "#8b949e", background: "#161b22", padding: "2px 8px", borderRadius: 3, border: "1px solid #21262d", whiteSpace: "nowrap" }}>{s}</span>
        ))}
        {extra > 0 && (
          <span style={{ fontSize: 10, fontFamily: mono, color: "#484f58", padding: "2px 4px", whiteSpace: "nowrap" }}>+{extra}</span>
        )}
      </div>
      <span style={{ fontSize: 10, color: "#484f58", fontFamily: mono, width: 60, textAlign: "right", flexShrink: 0 }}>{projectCount} repo{projectCount !== 1 ? "s" : ""}</span>
      <div style={{ fontSize: 13, color: tagColor, opacity: hovered ? 0.8 : 0, transform: hovered ? "translateX(0)" : "translateX(-6px)", transition: "all 0.2s", flexShrink: 0 }}>&rarr;</div>
    </Link>
  );
};

const FeedEntry = ({ dev, index }) => {
  const [hovered, setHovered] = useState(false);
  const timeAgo = relativeTime(dev.created_at);
  const delay = Math.min(index, 8) * 0.12;

  return (
    <Link
      to={`/cards/${dev.username}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "6px 0",
        textDecoration: "none", color: "inherit",
        animation: `feedSlideIn 0.4s ease ${delay}s both`,
      }}
    >
      <span style={{
        width: 4, height: 4, borderRadius: "50%",
        background: hovered ? CLAUDE_ORANGE : "#30363d",
        transition: "background 0.2s", flexShrink: 0,
      }} />
      <span style={{
        fontSize: 12, fontFamily: mono,
        color: hovered ? "#f0f6fc" : "#6e7681",
        fontWeight: 500, transition: "color 0.2s",
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        flex: 1, minWidth: 0,
      }}>
        @{dev.username}
      </span>
      <span style={{ fontSize: 10, fontFamily: mono, color: "#21262d", whiteSpace: "nowrap", flexShrink: 0 }}>
        {timeAgo}
      </span>
    </Link>
  );
};

const ActivityFeed = ({ developers }) => {
  const recent = useMemo(
    () => [...developers].sort((a, b) => (b.created_at || "").localeCompare(a.created_at || "")),
    [developers]
  );

  return (
    <div className="activity-feed" style={{
      flex: 1, minWidth: 200,
      paddingTop: 4,
      animation: "feedSlideIn 0.6s ease 0.4s both",
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 7,
        marginBottom: 14,
      }}>
        <span style={{
          width: 5, height: 5, borderRadius: "50%",
          background: "#7ee787",
          animation: "pulse 2s ease-in-out infinite",
          flexShrink: 0,
        }} />
        <span style={{
          fontSize: 9, fontFamily: mono, color: "#30363d",
          textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 600,
        }}>
          Recently joined
        </span>
      </div>
      <div className="feed-scroll" style={{ maxHeight: 200, overflowY: "auto" }}>
        {recent.map((dev, i) => (
          <FeedEntry key={dev.username} dev={dev} index={i} />
        ))}
      </div>
    </div>
  );
};

const SORT_OPTIONS = [
  { key: "alpha", label: "A-Z" },
  { key: "newest", label: "Newest" },
  { key: "repos", label: "Most repos" },
];

function sortDevelopers(devs, key) {
  const sorted = [...devs];
  switch (key) {
    case "newest":
      return sorted.sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
    case "repos":
      return sorted.sort((a, b) => (b.repo_count || 0) - (a.repo_count || 0));
    default:
      return sorted.sort((a, b) => (a.name || a.username).localeCompare(b.name || b.username));
  }
}

export default function Gallery() {
  const [developers, setDevelopers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedStacks, setSelectedStacks] = useState([]);
  const [selectedArchetypes, setSelectedArchetypes] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [stackFilter, setStackFilter] = useState("");
  const [sortBy, setSortBy] = useState("alpha");
  const [page, setPage] = useState(1);
  const [view, setView] = useState(() => {
    try { return localStorage.getItem("devcard-view") || "list"; } catch { return "list"; }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    fetch(`${BASE_URL}cards-index.json`, { cache: "no-cache" })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => { setDevelopers(data); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  const allStacks = useMemo(() => [...new Set(developers.flatMap((d) => flattenStack(d.stack)))].sort(), [developers]);
  const allArchetypes = useMemo(() => [...new Set(developers.map((d) => d.archetype).filter(Boolean))].sort(), [developers]);

  const filtered = useMemo(() => {
    const base = developers.filter((d) => {
      const stackList = flattenStack(d.stack);
      const q = search.toLowerCase();
      const matchSearch = !q || d.name.toLowerCase().includes(q) || d.username.toLowerCase().includes(q) || d.title.toLowerCase().includes(q) || stackList.some((s) => s.toLowerCase().includes(q)) || (d.interests || []).some((i) => i.toLowerCase().includes(q));
      const matchStack = selectedStacks.length === 0 || selectedStacks.some((s) => stackList.includes(s));
      const matchArchetype = selectedArchetypes.length === 0 || selectedArchetypes.includes(d.archetype);
      return matchSearch && matchStack && matchArchetype;
    });
    return sortDevelopers(base, sortBy);
  }, [developers, search, selectedStacks, selectedArchetypes, sortBy]);

  useEffect(() => { try { localStorage.setItem("devcard-view", view); } catch {} }, [view]);

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [search, selectedStacks, selectedArchetypes, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / CARDS_PER_PAGE));
  const paged = filtered.slice((page - 1) * CARDS_PER_PAGE, page * CARDS_PER_PAGE);

  const activeFilters = selectedStacks.length + selectedArchetypes.length;
  const visibleStacks = stackFilter ? allStacks.filter((s) => s.toLowerCase().includes(stackFilter.toLowerCase())) : allStacks;

  function clearAll() {
    setSearch("");
    setSelectedStacks([]);
    setSelectedArchetypes([]);
    setStackFilter("");
    inputRef.current?.focus();
  }

  if (error) {
    return (
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "120px 40px", textAlign: "center", animation: "fadeIn 0.4s ease" }}>
        <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.3 }}>&empty;</div>
        <div style={{ fontSize: 14, color: "#484f58", fontFamily: mono, marginBottom: 16 }}>Failed to load developers. Try refreshing.</div>
        <button onClick={() => window.location.reload()} style={{ fontSize: 12, fontFamily: mono, color: CLAUDE_ORANGE, background: "transparent", border: `1px solid ${CLAUDE_ORANGE}40`, padding: "6px 16px", borderRadius: 6, cursor: "pointer" }}>Refresh</button>
      </div>
    );
  }

  return (
    <>
      {/* Hero + Search */}
      <header style={{ position: "relative", padding: "48px 40px 40px", maxWidth: 1200, margin: "0 auto", animation: "fadeIn 0.6s ease" }}>
        <div style={{ display: "flex", gap: 60, marginBottom: 48, alignItems: "flex-start" }}>
          <div style={{ minWidth: 0, flexShrink: 1 }}>
            <h1 className="hero-heading" style={{ fontSize: 42, fontWeight: 300, color: "#f0f6fc", lineHeight: 1.15, letterSpacing: "-0.03em", marginBottom: 16, fontFamily: sans }}>
              Discover developers<br />
              <span style={{ color: CLAUDE_ORANGE, fontWeight: 600 }}>by what they build.</span>
            </h1>
            <p className="hero-subtitle" style={{ fontSize: 15, color: "#8b949e", lineHeight: 1.6, fontFamily: sans, fontWeight: 400 }}>
              Interactive developer cards for the Claude Code community.<br />
              Drawn from your GitHub. Shaped by conversation.
            </p>
          </div>
          {!loading && developers.length > 0 && <ActivityFeed developers={developers} />}
        </div>

        {/* Search + Sort + Filters */}
        <div>
          <div className="search-bar-row" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div role="search" style={{ flex: 1, display: "flex", alignItems: "center", background: "#0a0e14", border: "1px solid #1a2332", borderRadius: 6, padding: "0 16px" }}>
              <span style={{ color: "#484f58", fontSize: 14, marginRight: 10 }} aria-hidden="true">{"\u203A"}</span>
              <input
                ref={inputRef} value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, stack, or interest..."
                aria-label="Search developers"
                style={{ flex: 1, background: "transparent", border: "none", color: "#c9d1d9", fontSize: 13, fontFamily: mono, padding: "12px 0", outline: "none" }}
              />
              {search && (
                <span onClick={() => { setSearch(""); inputRef.current?.focus(); }} style={{ color: "#484f58", cursor: "pointer", fontSize: 12, fontFamily: mono, padding: "4px 8px", borderRadius: 4, background: "#161b22" }}>esc</span>
              )}
            </div>
            {/* Sort */}
            <div className="sort-group" style={{ display: "flex", alignItems: "center", background: "#0a0e14", border: "1px solid #1a2332", borderRadius: 6, overflow: "hidden" }}>
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setSortBy(opt.key)}
                  style={{
                    fontSize: 11, fontFamily: mono, padding: "11px 12px",
                    color: sortBy === opt.key ? CLAUDE_ORANGE : "#484f58",
                    background: sortBy === opt.key ? CLAUDE_ORANGE + "14" : "transparent",
                    border: "none", cursor: "pointer", transition: "all 0.15s",
                    borderRight: "1px solid #1a2332",
                  }}
                >{opt.label}</button>
              ))}
            </div>
            {/* View toggle */}
            <div className="view-group" style={{ display: "flex", alignItems: "center", background: "#0a0e14", border: "1px solid #1a2332", borderRadius: 6, overflow: "hidden" }}>
              <button
                onClick={() => setView("grid")}
                title="Grid view"
                style={{
                  fontSize: 14, padding: "9px 11px", lineHeight: 1, border: "none", cursor: "pointer", transition: "all 0.15s",
                  color: view === "grid" ? CLAUDE_ORANGE : "#484f58",
                  background: view === "grid" ? CLAUDE_ORANGE + "14" : "transparent",
                  borderRight: "1px solid #1a2332",
                }}
              >&#x2637;</button>
              <button
                onClick={() => setView("list")}
                title="List view"
                style={{
                  fontSize: 14, padding: "9px 11px", lineHeight: 1, border: "none", cursor: "pointer", transition: "all 0.15s",
                  color: view === "list" ? CLAUDE_ORANGE : "#484f58",
                  background: view === "list" ? CLAUDE_ORANGE + "14" : "transparent",
                }}
              >&#x2630;</button>
            </div>
            {/* Filters toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                background: showFilters ? "#161b22" : "#0a0e14",
                border: `1px solid ${showFilters ? CLAUDE_ORANGE + "40" : "#1a2332"}`,
                borderRadius: 6, padding: "11px 16px",
                color: showFilters ? CLAUDE_ORANGE : "#8b949e",
                fontSize: 12, fontFamily: mono,
                cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                transition: "all 0.2s",
              }}
            >
              &#x2699; Filters
              {activeFilters > 0 && (
                <span style={{ background: CLAUDE_ORANGE, color: "#fff", width: 16, height: 16, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700 }}>{activeFilters}</span>
              )}
            </button>
          </div>

          {showFilters && (
            <div style={{ background: "#0a0e14", border: "1px solid #1a2332", borderTop: "none", borderRadius: "0 0 8px 8px", padding: 16, animation: "fadeIn 0.2s ease" }}>
              {/* Stack filter with search */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                  <div style={{ fontSize: 9, color: "#484f58", fontFamily: mono, textTransform: "uppercase", letterSpacing: "0.12em" }}>Stack</div>
                  <input
                    value={stackFilter}
                    onChange={(e) => setStackFilter(e.target.value)}
                    placeholder="Filter technologies..."
                    style={{ fontSize: 11, fontFamily: mono, background: "#161b22", border: "1px solid #21262d", borderRadius: 4, padding: "3px 8px", color: "#c9d1d9", outline: "none", width: 180 }}
                  />
                  {selectedStacks.length > 0 && (
                    <button onClick={() => setSelectedStacks([])} style={{ fontSize: 10, fontFamily: mono, color: "#ff7b72", background: "transparent", border: "none", cursor: "pointer" }}>&#x2715; {selectedStacks.length} selected</button>
                  )}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, maxHeight: 120, overflowY: "auto" }}>
                  {visibleStacks.map((s) => (
                    <button key={s} onClick={() => setSelectedStacks((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s])} style={{ fontSize: 11, fontFamily: mono, color: selectedStacks.includes(s) ? "#fff" : "#8b949e", background: selectedStacks.includes(s) ? CLAUDE_ORANGE : "#161b22", padding: "3px 10px", borderRadius: 4, border: selectedStacks.includes(s) ? `1px solid ${CLAUDE_ORANGE}` : "1px solid #21262d", cursor: "pointer", transition: "all 0.15s" }}>{s}</button>
                  ))}
                  {visibleStacks.length === 0 && (
                    <span style={{ fontSize: 11, fontFamily: mono, color: "#484f58", padding: "3px 0" }}>No match</span>
                  )}
                </div>
              </div>
              {/* Archetype filter */}
              <div>
                <div style={{ fontSize: 9, color: "#484f58", fontFamily: mono, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>Archetype</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {allArchetypes.map((a) => (
                    <button key={a} onClick={() => setSelectedArchetypes((prev) => prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a])} style={{ fontSize: 11, fontFamily: mono, color: selectedArchetypes.includes(a) ? "#fff" : "#8b949e", background: selectedArchetypes.includes(a) ? CLAUDE_ORANGE : "#161b22", padding: "3px 10px", borderRadius: 4, border: selectedArchetypes.includes(a) ? `1px solid ${CLAUDE_ORANGE}` : "1px solid #21262d", cursor: "pointer", transition: "all 0.15s" }}>{a.replace("The ", "")}</button>
                  ))}
                </div>
              </div>
              {activeFilters > 0 && (
                <div style={{ marginTop: 12, borderTop: "1px solid #1a2332", paddingTop: 12 }}>
                  <button onClick={clearAll} style={{ fontSize: 11, fontFamily: mono, color: "#ff7b72", background: "transparent", border: "none", cursor: "pointer", padding: 0 }}>&#x2715; Clear all filters</button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Counter */}
      <div className="counter-row" style={{ maxWidth: 1200, margin: "0 auto", padding: "16px 40px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, color: "#484f58", fontFamily: mono }}>
          {loading ? "Loading..." : `${filtered.length} developer${filtered.length !== 1 ? "s" : ""}${(selectedStacks.length || selectedArchetypes.length || search) ? " found" : ""}`}
        </span>
        {totalPages > 1 && (
          <span style={{ fontSize: 11, color: "#484f58", fontFamily: mono }}>
            Page {page} of {totalPages}
          </span>
        )}
      </div>

      {/* Grid */}
      <main className="grid-container" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px 40px" }}>
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ background: "#0a0e14", border: "1px solid #1a2332", borderRadius: 6, padding: "20px 22px", height: 180, animation: `fadeIn 0.3s ease ${i * 0.1}s both` }}>
                <div style={{ height: 14, width: "40%", background: "#161b22", borderRadius: 4, marginBottom: 12 }} />
                <div style={{ height: 10, width: "60%", background: "#161b22", borderRadius: 4, marginBottom: 16 }} />
                <div style={{ height: 10, width: "90%", background: "#161b22", borderRadius: 4, marginBottom: 8 }} />
                <div style={{ height: 10, width: "70%", background: "#161b22", borderRadius: 4 }} />
              </div>
            ))}
          </div>
        ) : paged.length > 0 ? (
          view === "grid" ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
              {paged.map((dev, i) => {
                const oi = developers.indexOf(dev);
                return <CardMini key={dev.username} dev={dev} index={i} tagColor={TAG_COLORS[oi % TAG_COLORS.length]} />;
              })}
            </div>
          ) : (
            <div style={{ border: "1px solid #1a2332", borderRadius: 6, overflow: "hidden", background: "#0a0e14" }}>
              {paged.map((dev, i) => {
                const oi = developers.indexOf(dev);
                return <CardRow key={dev.username} dev={dev} index={i} tagColor={TAG_COLORS[oi % TAG_COLORS.length]} />;
              })}
            </div>
          )
        ) : (
          <div style={{ textAlign: "center", padding: "80px 0", animation: "fadeIn 0.3s ease" }}>
            <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.3 }}>&empty;</div>
            <div style={{ fontSize: 14, color: "#484f58", fontFamily: mono, marginBottom: 8 }}>No developers match your search</div>
            <button onClick={clearAll} style={{ fontSize: 12, fontFamily: mono, color: CLAUDE_ORANGE, background: "transparent", border: `1px solid ${CLAUDE_ORANGE}40`, padding: "6px 16px", borderRadius: 6, cursor: "pointer" }}>Clear filters</button>
          </div>
        )}
      </main>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="pagination-row" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px 80px", display: "flex", justifyContent: "center", gap: 4 }}>
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            style={{ fontSize: 12, fontFamily: mono, color: page === 1 ? "#30363d" : "#8b949e", background: "#0a0e14", border: "1px solid #1a2332", borderRadius: 6, padding: "8px 14px", cursor: page === 1 ? "default" : "pointer", transition: "all 0.15s" }}
          >&larr; Prev</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
            .reduce((acc, p, i, arr) => {
              if (i > 0 && p - arr[i - 1] > 1) acc.push("...");
              acc.push(p);
              return acc;
            }, [])
            .map((p, i) =>
              p === "..." ? (
                <span key={`gap-${i}`} style={{ fontSize: 12, fontFamily: mono, color: "#484f58", padding: "8px 6px" }}>&hellip;</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  style={{
                    fontSize: 12, fontFamily: mono, padding: "8px 12px", borderRadius: 6, cursor: "pointer", transition: "all 0.15s",
                    color: page === p ? "#fff" : "#8b949e",
                    background: page === p ? CLAUDE_ORANGE + "28" : "#0a0e14",
                    border: page === p ? `1px solid ${CLAUDE_ORANGE}40` : "1px solid #1a2332",
                  }}
                >{p}</button>
              )
          )}
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            style={{ fontSize: 12, fontFamily: mono, color: page === totalPages ? "#30363d" : "#8b949e", background: "#0a0e14", border: "1px solid #1a2332", borderRadius: 6, padding: "8px 14px", cursor: page === totalPages ? "default" : "pointer", transition: "all 0.15s" }}
          >Next &rarr;</button>
        </nav>
      )}

    </>
  );
}
