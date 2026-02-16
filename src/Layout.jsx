import { Link, useLocation } from "react-router-dom";

const CLAUDE_ORANGE = "#D97757";

const ClaudeSpark = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill={CLAUDE_ORANGE} opacity="0.9" />
  </svg>
);

export { ClaudeSpark, CLAUDE_ORANGE };

export default function Layout({ children }) {
  const location = useLocation();
  const isAbout = location.pathname === "/about";

  return (
    <div style={{ background: "#060910", minHeight: "100vh", fontFamily: "'IBM Plex Sans', 'Helvetica Neue', sans-serif" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes feedSlideIn { from { opacity: 0; transform: translateX(12px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        input::placeholder { color: #484f58; }
        input:focus { outline: none; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1a2332; border-radius: 3px; }
        a { color: inherit; }
        @media (max-width: 960px) {
          .card-layout > :first-child { max-width: 100% !important; flex: 1 1 0 !important; min-width: 0 !important; }
          .insights-panel { flex: 0 0 280px !important; }
        }
        @media (max-width: 700px) {
          .card-layout { flex-wrap: wrap !important; }
          .insights-panel { flex: 1 1 100% !important; position: relative !important; }
        }
        @media (max-width: 768px) {
          .about-panels { flex-direction: column !important; }
        }
        .feed-scroll { scrollbar-width: none; -ms-overflow-style: none; }
        .feed-scroll::-webkit-scrollbar { display: none; }
        @media (max-width: 900px) {
          .activity-feed { display: none !important; }
        }
        @media (max-width: 640px) {
          /* Global padding */
          nav, header, main, footer, .responsive-pad { padding-left: 16px !important; padding-right: 16px !important; }
          nav { padding-top: 24px !important; flex-wrap: wrap !important; gap: 12px !important; }
          .nav-for-claude { display: none !important; }

          /* Gallery hero */
          .hero-heading { font-size: 34px !important; }
          .hero-subtitle { font-size: 14px !important; }
          .hero-section { margin-bottom: 32px !important; }
          .search-bar-row { flex-wrap: wrap !important; gap: 8px !important; }
          .search-bar-row > [role="search"] { flex: 1 1 100% !important; }
          .sort-group, .view-group { display: none !important; }
          .counter-row, .pagination-row { padding-left: 16px !important; padding-right: 16px !important; }
          .grid-container { padding-left: 16px !important; padding-right: 16px !important; padding-bottom: 24px !important; }

          /* Card page */
          .card-page-root { padding: 24px 16px 48px !important; }
          .card-body-content { padding: 20px 16px 16px !important; }
          .dev-name { font-size: 22px !important; }
          .stack-label, .link-label { min-width: 80px !important; }
          .link-url-text { overflow: hidden !important; text-overflow: ellipsis !important; white-space: nowrap !important; max-width: 100% !important; display: block !important; }
          .card-layout { gap: 24px !important; }
          .insights-panel { padding: 0 !important; }
          .insights-panel > div { border-radius: 6px !important; }
          .card-section { margin-bottom: 16px !important; }
          .share-row { gap: 8px !important; }
          .share-row a, .share-row button { white-space: nowrap !important; font-size: 11px !important; padding: 6px 14px !important; }
          .similar-section { margin-top: 32px !important; }
          .similar-grid { grid-template-columns: 1fr !important; }
          .card-footer-watermark { padding: 12px 0 !important; }

          /* About page */
          .about-root { padding: 32px 16px 48px !important; }
          .about-hero { margin-bottom: 48px !important; }
          .about-step { gap: 14px !important; margin-bottom: 24px !important; }
          .about-step code { font-size: 11px !important; word-break: break-all !important; }
          .about-terminal-content { padding: 16px !important; }
          .about-stats-panel { padding: 20px 16px !important; }
          .about-cta { padding: 24px 20px !important; flex-direction: column !important; align-items: flex-start !important; }
          .about-cards-grid { grid-template-columns: 1fr 1fr !important; }

          /* Footer */
          .footer-cta-code { font-size: 10px !important; }
        }
        @media (max-width: 480px) {
          .hero-heading { font-size: 28px !important; }
          .dev-name { font-size: 20px !important; }
          .stack-label, .link-label { min-width: 64px !important; font-size: 12px !important; }
          .card-body-content { padding: 16px 12px 12px !important; }
          .about-cards-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Dot grid */}
      <div
        style={{
          position: "fixed", inset: 0, pointerEvents: "none",
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.016) 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Navbar */}
      <nav
        style={{
          position: "relative", padding: "48px 40px 0",
          maxWidth: 1200, margin: "0 auto", animation: "fadeIn 0.6s ease",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <ClaudeSpark size={26} />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 20, color: "#f0f6fc", fontWeight: 500, letterSpacing: "-0.02em" }}>devcard</span>
          </Link>
          <span style={{ fontSize: 10, color: "#484f58", fontFamily: "'JetBrains Mono', monospace", background: "#161b22", padding: "2px 8px", borderRadius: 6, border: "1px solid #21262d" }}>gallery</span>
          <span className="nav-for-claude" style={{ fontSize: 9, color: "#484f58", fontFamily: "'IBM Plex Sans', sans-serif", marginLeft: 4 }}>for Claude Code</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <Link
            to="/about"
            style={{
              fontSize: 13, textDecoration: "none",
              fontFamily: "'IBM Plex Sans', sans-serif",
              color: isAbout ? "#f0f6fc" : "#8b949e",
              transition: "color 0.2s",
            }}
          >
            About
          </Link>
          <a
            href="https://github.com/devcard-community/devcard"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: 12, color: "#fff", background: CLAUDE_ORANGE,
              padding: "7px 16px", borderRadius: 6, textDecoration: "none",
              fontFamily: "'JetBrains Mono', monospace", fontWeight: 500,
              letterSpacing: "0.02em",
            }}
          >
            Create yours &rarr;
          </a>
        </div>
      </nav>

      {children}

      {/* Footer */}
      <footer style={{ borderTop: "1px solid #1a2332", padding: "48px 40px", maxWidth: 1200, margin: "0 auto" }} className="responsive-pad">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 40, flexWrap: "wrap", gap: 20 }}>
          <div>
            <div style={{ fontSize: 18, color: "#f0f6fc", fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 400, marginBottom: 6 }}>Your work speaks for itself.</div>
            <div style={{ fontSize: 13, color: "#484f58", fontFamily: "'IBM Plex Sans', sans-serif" }}>Create your devcard in 60 seconds from your GitHub profile.</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <code className="footer-cta-code" style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: "#8b949e", background: "#0a0e14", padding: "8px 14px", borderRadius: 6, border: "1px solid #1a2332" }}>/devcard:init your-username</code>
            <a href="https://github.com/devcard-community/devcard" target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "#fff", background: CLAUDE_ORANGE, padding: "9px 20px", borderRadius: 6, textDecoration: "none", fontFamily: "'JetBrains Mono', monospace", fontWeight: 500 }}>Get started</a>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 20, borderTop: "1px solid #1a2332", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ClaudeSpark size={14} />
            <span style={{ fontSize: 11, color: "#484f58", fontFamily: "'IBM Plex Sans', sans-serif" }}>
              devcard is a <span style={{ color: CLAUDE_ORANGE }}>Claude Code</span> plugin &middot; open source
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <a href="https://github.com/devcard-community/devcard" target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "#484f58", textDecoration: "none", fontFamily: "'IBM Plex Sans', sans-serif" }}>GitHub</a>
            <a href="https://github.com/devcard-community/devcard#readme" target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "#484f58", textDecoration: "none", fontFamily: "'IBM Plex Sans', sans-serif" }}>Plugin Docs</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
