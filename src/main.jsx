import { StrictMode, Component } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Routes, Route, Link } from "react-router-dom";
import Layout, { CLAUDE_ORANGE } from "./Layout";
import Gallery from "./Gallery";
import About from "./About";
import CardPage from "./CardPage";

class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "120px 40px", textAlign: "center", fontFamily: "'JetBrains Mono', monospace" }}>
          <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.3 }}>!</div>
          <div style={{ fontSize: 14, color: "#484f58", marginBottom: 20 }}>Something went wrong.</div>
          <button onClick={() => { this.setState({ error: null }); window.location.hash = "/"; }} style={{ fontSize: 12, color: CLAUDE_ORANGE, background: "transparent", border: `1px solid ${CLAUDE_ORANGE}40`, padding: "6px 16px", borderRadius: 6, cursor: "pointer", fontFamily: "inherit" }}>
            Back to gallery
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function NotFound() {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "120px 40px", textAlign: "center", animation: "fadeIn 0.4s ease" }}>
      <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.2 }}>404</div>
      <div style={{ fontSize: 14, color: "#484f58", fontFamily: "'JetBrains Mono', monospace", marginBottom: 20 }}>Page not found</div>
      <Link to="/" style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: CLAUDE_ORANGE, textDecoration: "none", border: `1px solid ${CLAUDE_ORANGE}40`, padding: "6px 16px", borderRadius: 6 }}>
        Back to gallery
      </Link>
    </div>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Gallery />} />
            <Route path="/about" element={<About />} />
            <Route path="/cards/:username" element={<CardPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </HashRouter>
    </ErrorBoundary>
  </StrictMode>
);
