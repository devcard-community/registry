// generate-html.mjs — Static HTML generator for published devcards
// Produces a self-contained HTML page from parsed YAML data.
// No chat, no server — just the card, share buttons, and a CTA.

import { createHash } from 'node:crypto';
import { SITE_URL, PLUGIN_REPO_URL, GITHUB_ORG_URL } from '../config.mjs';

const BASE_URL = SITE_URL;


function esc(s) {
  return ('' + (s ?? '')).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, '/');
}

function safeHref(url) {
  const s = String(url).trim().toLowerCase();
  return s.startsWith('https://') || s.startsWith('http://') || s.startsWith('mailto:') ? url : '#';
}

/**
 * Generate a complete static HTML page for a published devcard.
 *
 * @param {object} data     Parsed devcard YAML object
 * @param {string} username GitHub username (used for URLs and OG tags)
 * @returns {string}        Complete HTML document
 */
export function generateCardHTML(data, username) {
  const name = data.name || 'Dev';
  const title = data.title || '';
  const location = data.location || '';
  const titleLine = [esc(title), esc(location)].filter(Boolean).join(' &middot; ');

  const cardURL = `${BASE_URL}/cards/${encodeURIComponent(username)}/`;
  const ogImageURL = `${BASE_URL}/cards/${encodeURIComponent(username)}/og.png`;
  const ogTitle = [name, title].filter(Boolean).join(' -- ');
  const ogDescription = data.bio || data.dna || `${name}'s developer card`;

  // --- Build sections ---
  let sections = '';

  if (data.bio) {
    sections += `
      <div class="section">
        <div class="section-header">Bio</div>
        <div class="section-body">${esc(data.bio)}</div>
      </div>`;
  }

  if (data.about && data.about !== data.bio) {
    sections += `
      <div class="section">
        <div class="section-header">About</div>
        <div class="section-body">${esc(data.about).replace(/\n/g, '<br>')}</div>
      </div>`;
  }

  if (data.stack && typeof data.stack === 'object') {
    let stackRows = '';
    for (const [cat, techs] of Object.entries(data.stack)) {
      const techStr = Array.isArray(techs) ? techs.map(t => esc(t)).join(' &middot; ') : esc(String(techs));
      stackRows += `
        <div class="stack-row">
          <span class="stack-label">${esc(capitalize(cat))}</span>
          <span class="stack-techs">${techStr}</span>
        </div>`;
    }
    sections += `
      <div class="section">
        <div class="section-header">Stack</div>
        ${stackRows}
      </div>`;
  }

  // Interests (pill tags)
  if (data.interests && Array.isArray(data.interests) && data.interests.length > 0) {
    let tags = '';
    for (const interest of data.interests) {
      tags += `<span class="interest-tag">${esc(interest)}</span>`;
    }
    sections += `
      <div class="section">
        <div class="section-header">Interests</div>
        <div class="interest-tags">${tags}</div>
      </div>`;
  }

  const VALID_STATUSES = new Set(['shipped', 'wip', 'concept', 'archived']);
  if (data.projects && Array.isArray(data.projects) && data.projects.length > 0) {
    let projRows = '';
    for (const proj of data.projects) {
      const status = proj.status || '';
      const statusClass = VALID_STATUSES.has(status) ? status : 'default';
      const tagHTML = status ? `<span class="tag tag-${statusClass}">[${esc(status)}]</span>` : '';
      const desc = proj.description ? `<div class="proj-desc">${esc(proj.description)}</div>` : '';
      projRows += `
        <div class="project">
          <div class="proj-header">
            <span class="bullet">&#9656;</span>
            <span class="proj-name">${esc(proj.name)}</span>
            ${tagHTML}
          </div>
          ${desc}
        </div>`;
    }
    sections += `
      <div class="section">
        <div class="section-header">Projects</div>
        ${projRows}
      </div>`;
  }

  if (data.experience && Array.isArray(data.experience) && data.experience.length > 0) {
    let expRows = '';
    for (const exp of data.experience) {
      const period = exp.period ? ` <span class="exp-period">(${esc(exp.period)})</span>` : '';
      const highlight = exp.highlight ? `<div class="exp-highlight">${esc(exp.highlight)}</div>` : '';
      expRows += `
        <div class="experience">
          <span class="exp-role">${esc(exp.role)}</span>
          <span class="exp-at"> @ ${esc(exp.company)}</span>${period}
          ${highlight}
        </div>`;
    }
    sections += `
      <div class="section">
        <div class="section-header">Experience</div>
        ${expRows}
      </div>`;
  }

  if (data.links && typeof data.links === 'object') {
    let linkRows = '';
    for (const [label, url] of Object.entries(data.links)) {
      linkRows += `
        <div class="link-row">
          <span class="link-label">${esc(capitalize(label))}</span>
          <a class="link-url" href="${esc(safeHref(url))}" target="_blank" rel="noopener noreferrer">${esc(url)}</a>
        </div>`;
    }
    sections += `
      <div class="section">
        <div class="section-header">Links</div>
        ${linkRows}
      </div>`;
  }

  // Claude's Take (DNA only — archetype is now in the header)
  if (data.dna) {
    sections += `
      <div class="section">
        <div class="section-header">Claude's Take</div>
        <div class="dna-section">
          <div class="dna-text">${esc(data.dna)}</div>
        </div>
      </div>`;
  }

  // What to Build Next — standalone, Claude's suggestion
  if (data.next_project) {
    sections += `
      <div class="section">
        <div class="next-project-standalone">
          <div class="next-project-header">What to Build Next</div>
          <div class="next-project-attribution">Based on your skills, Claude suggests:</div>
          <div class="next-project-text">${esc(data.next_project)}</div>
        </div>
      </div>`;
  }

  // --- Share intent URLs ---
  const shareText = encodeURIComponent(`${name}'s devcard`);
  const shareURL = encodeURIComponent(cardURL);
  const xIntentURL = `https://x.com/intent/tweet?text=${shareText}&url=${shareURL}`;
  const linkedInShareURL = `https://www.linkedin.com/sharing/share-offsite/?url=${shareURL}`;

  // --- Inline scripts (extracted for CSP hash computation) ---
  const redirectScript = `window.location.replace('${BASE_URL}/#/cards/${encodeURIComponent(username)}');`;
  const clipboardScript = `document.querySelectorAll('[data-copy-url]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var url = btn.getAttribute('data-copy-url');
        navigator.clipboard.writeText(url).then(function() {
          btn.textContent = 'copied!';
          setTimeout(function() { btn.textContent = 'copy link'; }, 1500);
        });
      });
    });`;

  // Compute SHA-256 hashes for CSP
  const sha256 = (s) => createHash('sha256').update(s, 'utf8').digest('base64');
  const redirectHash = sha256(redirectScript);
  const clipboardHash = sha256(clipboardScript);
  const cspContent = `default-src 'none'; script-src 'sha256-${redirectHash}' 'sha256-${clipboardHash}'; style-src 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' https: data:; font-src https://fonts.gstatic.com; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-src 'none'`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>devcard — ${esc(name)}</title>
  <meta http-equiv="Content-Security-Policy" content="${cspContent}">

  <!-- Open Graph -->
  <meta property="og:title" content="${esc(ogTitle)}">
  <meta property="og:description" content="${esc(ogDescription)}">
  <meta property="og:image" content="${esc(ogImageURL)}">
  <meta property="og:url" content="${esc(cardURL)}">
  <meta property="og:type" content="profile">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(ogTitle)}">
  <meta name="twitter:description" content="${esc(ogDescription)}">
  <meta name="twitter:image" content="${esc(ogImageURL)}">

  <!-- Redirect human visitors to the React app; social crawlers ignore JS and see OG tags above -->
  <script>${redirectScript}</script>

  <style>
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      background: #0d1117;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      min-height: 100vh;
      font-family: 'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace;
      padding: 0;
      margin: 0;
    }

    /* In a regular browser tab, show with card styling */
    @media (min-width: 800px) {
      body {
        background: #0a0a0a;
        align-items: center;
        padding: 40px 20px;
      }
      .terminal {
        border: 1px solid #30363d;
        border-radius: 12px;
        box-shadow:
          0 0 0 1px rgba(218, 119, 86, 0.05),
          0 16px 70px rgba(0, 0, 0, 0.6),
          0 0 120px rgba(218, 119, 86, 0.03);
      }
    }

    .terminal {
      background: #0d1117;
      width: 100%;
      max-width: 720px;
      overflow: hidden;
    }

    .titlebar {
      background: #161b22;
      padding: 10px 16px;
      border-bottom: 1px solid #30363d;
      user-select: none;
      font-size: 13px;
      color: #484f58;
      letter-spacing: 0.3px;
    }

    .prompt-tilde { color: #6e7681; }
    .prompt-cmd { color: #484f58; }
    .prompt-user { color: #8b949e; }

    .card {
      padding: 28px 32px 24px;
    }

    .dev-name {
      color: #DA7756;
      font-size: 28px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 8px;
      text-shadow: 0 0 20px rgba(218, 119, 86, 0.3);
      line-height: 1.2;
    }

    .title-line {
      color: #484f58;
      font-size: 14px;
      margin-bottom: 8px;
    }

    .archetype-line {
      font-size: 13px;
      margin-bottom: 16px;
    }

    .archetype-prefix {
      color: #6e7681;
    }

    .archetype-value {
      color: #bc8cff;
      font-style: italic;
      font-weight: 500;
    }


    .next-project-standalone {
      border: 1px solid rgba(88, 166, 255, 0.2);
      border-radius: 8px;
      padding: 16px 18px;
      background: rgba(88, 166, 255, 0.04);
    }

    .next-project-header {
      color: #58a6ff;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .next-project-attribution {
      color: #6e7681;
      font-size: 11px;
      font-style: italic;
      margin-bottom: 10px;
    }

    .next-project-text {
      color: #c9d1d9;
      font-size: 13px;
      line-height: 1.6;
    }

    .dna-section {
      border-left: 2px solid #DA7756;
      padding-left: 14px;
      margin-bottom: 20px;
      background: rgba(218, 119, 86, 0.03);
      padding-top: 8px;
      padding-bottom: 8px;
    }

    .dna-header {
      color: #484f58;
      font-size: 12px;
      margin-bottom: 6px;
    }

    .dna-text {
      color: #c9d1d9;
      font-style: italic;
      font-size: 13px;
      line-height: 1.6;
    }

    .interest-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .interest-tag {
      background: rgba(188, 140, 255, 0.1);
      color: #d2a8ff;
      font-size: 12px;
      padding: 3px 10px;
      border-radius: 12px;
    }


    .divider {
      border: none;
      border-top: 1px solid #21262d;
      margin: 0 0 20px 0;
    }

    .section { margin-bottom: 20px; }

    .section-header {
      color: #e3b341;
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 8px;
      letter-spacing: 0.3px;
    }

    .section-body {
      color: #c9d1d9;
      font-size: 13px;
      line-height: 1.6;
    }

    .insight { margin-bottom: 12px; }
    .insight-label {
      display: block;
      font-size: 11px;
      color: #bc8cff;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 4px;
    }
    .insight-text {
      color: #c9d1d9;
      font-size: 13px;
      line-height: 1.6;
    }

    .stack-row {
      display: flex;
      gap: 8px;
      margin-bottom: 4px;
      font-size: 13px;
      line-height: 1.6;
    }

    .stack-label {
      color: #484f58;
      min-width: 120px;
      flex-shrink: 0;
    }

    .stack-techs { color: #c9d1d9; }

    .project { margin-bottom: 8px; }

    .proj-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
    }

    .bullet { color: #7ee787; font-size: 14px; }

    .proj-name { color: #f0f6fc; font-weight: 600; }

    .tag {
      font-size: 11px;
      padding: 1px 6px;
      border-radius: 4px;
      font-weight: 500;
    }

    .tag-shipped { color: #7ee787; background: rgba(126, 231, 135, 0.1); }
    .tag-wip { color: #e3b341; background: rgba(227, 179, 65, 0.1); }
    .tag-concept { color: #bc8cff; background: rgba(188, 140, 255, 0.1); }
    .tag-archived { color: #484f58; background: rgba(72, 79, 88, 0.1); }
    .tag-default { color: #58a6ff; background: rgba(88, 166, 255, 0.1); }

    .proj-desc {
      color: #484f58;
      font-size: 12px;
      margin-left: 22px;
      margin-top: 2px;
    }

    .experience { margin-bottom: 8px; font-size: 13px; }
    .exp-role { color: #c9d1d9; }
    .exp-at { color: #484f58; }
    .exp-period { color: #484f58; }
    .exp-highlight {
      color: #484f58;
      font-size: 12px;
      margin-left: 8px;
      margin-top: 2px;
    }

    .link-row {
      display: flex;
      gap: 8px;
      margin-bottom: 4px;
      font-size: 13px;
    }

    .link-label {
      color: #484f58;
      min-width: 120px;
      flex-shrink: 0;
    }

    .link-url {
      color: #DA7756;
      text-decoration: none;
      transition: color 0.2s;
    }

    .link-url:hover {
      color: #e89a7e;
      text-decoration: underline;
    }

    .footer {
      text-align: center;
      padding: 20px;
      color: #30363d;
      font-size: 11px;
      letter-spacing: 1px;
    }

    .footer a {
      color: #30363d;
      text-decoration: none;
      transition: color 0.2s;
    }

    .footer a:hover { color: #484f58; }

    @media (max-width: 600px) {
      .dev-name { font-size: 22px; }
      .card { padding: 20px 16px; }
      .stack-label, .link-label { min-width: 80px; }
    }

    /* --- Share row --- */
    .share-row {
      display: flex;
      gap: 12px;
      margin-top: 16px;
      margin-bottom: 8px;
    }
    .share-btn {
      color: #484f58;
      font-size: 12px;
      text-decoration: none;
      padding: 4px 12px;
      border: 1px solid #21262d;
      border-radius: 6px;
      transition: all 0.2s;
      cursor: pointer;
      background: none;
      font-family: inherit;
    }
    .share-btn:hover {
      color: #c9d1d9;
      border-color: #30363d;
    }

    /* --- CTA --- */
    .cta {
      text-align: center;
      padding: 32px 20px;
      margin-top: 12px;
    }
    .cta-text {
      color: #484f58;
      font-size: 14px;
      margin-bottom: 12px;
    }
    .cta-commands code {
      display: inline-block;
      background: rgba(218, 119, 86, 0.08);
      color: #DA7756;
      padding: 6px 16px;
      border-radius: 6px;
      font-size: 13px;
      margin-bottom: 12px;
    }
    .cta-link {
      display: inline-block;
      color: #DA7756;
      font-size: 13px;
      text-decoration: none;
      border: 1px solid rgba(218, 119, 86, 0.3);
      padding: 6px 20px;
      border-radius: 6px;
      transition: all 0.2s;
    }
    .cta-link:hover {
      background: rgba(218, 119, 86, 0.1);
      border-color: #DA7756;
    }
  </style>
</head>
<body>
  <div style="width: 100%; max-width: 720px;">
    <div class="terminal">
      <div class="titlebar">
        <span class="prompt-tilde">~</span> <span class="prompt-cmd">devcard</span> <span class="prompt-user">@${esc(username)}</span>
      </div>
      <div class="card">
        <div class="dev-name">${esc(name)}</div>
        <div class="title-line">${titleLine}</div>
        ${data.archetype ? `<div class="archetype-line"><span class="archetype-prefix">Claude's read:</span> <span class="archetype-value">${esc(data.archetype)}</span></div>` : ''}
        <hr class="divider">
        ${sections}
      </div>
    </div>
    <div class="share-row" style="max-width: 720px; justify-content: center;">
      <button class="share-btn" data-copy-url="${esc(cardURL)}">copy link</button>
      <a class="share-btn" href="${xIntentURL}" target="_blank" rel="noopener noreferrer">share on X</a>
      <a class="share-btn" href="${linkedInShareURL}" target="_blank" rel="noopener noreferrer">share on LinkedIn</a>
    </div>
    <div class="cta">
      <p class="cta-text">Create your own devcard in 60 seconds</p>
      <div class="cta-commands">
        <code>/devcard:init your-github-username</code>
      </div>
      <a class="cta-link" href="${PLUGIN_REPO_URL}">Get started</a>
    </div>
    <div class="footer">
      <a href="${GITHUB_ORG_URL}">devcard</a>
    </div>
  </div>
  <script>${clipboardScript}</script>
</body>
</html>`;
}
