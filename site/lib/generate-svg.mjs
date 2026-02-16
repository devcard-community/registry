// SVG renderer for devcard data objects.
// Extracted from devcard/scripts/export-card.mjs.
// Expects a pre-parsed data object (use parse-yaml.mjs to parse raw YAML first).

function esc(str) {
  return ('' + (str ?? ''))
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function wordWrap(text, maxChars) {
  const result = [];
  for (const para of text.split('\n')) {
    if (para.trim() === '') { result.push(''); continue; }
    const words = para.split(/\s+/);
    let line = '';
    for (const word of words) {
      if (line.length + word.length + 1 > maxChars) {
        result.push(line);
        line = word;
      } else {
        line = line ? line + ' ' + word : word;
      }
    }
    if (line) result.push(line);
  }
  return result;
}

function generateSVG(data) {
  const W = 600;
  const PAD = 32;
  const contentW = W - PAD * 2;
  let y = 0;
  const elements = [];

  const colors = {
    bg:        '#0d1117',
    border:    '#30363d',
    text:      '#c9d1d9',
    brightText:'#f0f6fc',
    dimText:   '#8b949e',
    muted:     '#484f58',
    name:      '#DA7756',
    title:     '#e3b341',
    section:   '#e3b341',
    link:      '#DA7756',
    interest:  '#d2a8ff',
    bullet:    '#7ee787',
    shipped:   '#7ee787',
    wip:       '#e3b341',
    concept:   '#bc8cff',
    archived:  '#484f58',
  };

  // Helper: add text element
  const text = (x, yPos, content, opts = {}) => {
    const {
      size = 14,
      fill = colors.text,
      weight = 'normal',
      family = "'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace",
      anchor = 'start',
      style = '',
    } = opts;
    const styleAttr = style ? ` font-style="${style}"` : '';
    return `<text x="${x}" y="${yPos}" font-family="${family}" font-size="${size}" fill="${fill}" font-weight="${weight}" text-anchor="${anchor}"${styleAttr}>${esc(content)}</text>`;
  };

  // Helper: section divider
  const divider = (yPos) => {
    return `<line x1="${PAD}" y1="${yPos}" x2="${W - PAD}" y2="${yPos}" stroke="${colors.border}" stroke-width="1"/>`;
  };

  // -- Header: Name --
  y += 48;
  elements.push(text(PAD, y, data.name || 'Dev', {
    size: 28,
    fill: colors.name,
    weight: 'bold',
    family: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
  }));

  // Title
  if (data.title) {
    y += 28;
    elements.push(text(PAD, y, data.title, {
      size: 16,
      fill: colors.title,
      weight: '500',
      family: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
    }));
  }

  // Location
  if (data.location) {
    y += 22;
    elements.push(text(PAD, y, data.location, { size: 13, fill: colors.dimText }));
  }

  // Archetype — in header, attributed to Claude
  if (data.archetype) {
    y += 22;
    elements.push(text(PAD, y, 'Claude calls you', { size: 12, fill: colors.muted }));
    elements.push(text(PAD + 130, y, data.archetype, { size: 13, fill: '#bc8cff', weight: '500', style: 'italic' }));
  }

  // Divider after header
  y += 16;
  elements.push(divider(y));

  // Bio
  if (data.bio) {
    y += 26;
    const bioLines = wordWrap(`"${data.bio}"`, 65);
    for (const line of bioLines) {
      elements.push(text(PAD, y, line, {
        size: 13,
        fill: colors.text,
        style: 'italic',
      }));
      y += 20;
    }
    y -= 20; // undo last increment
  }

  // -- About --
  if (data.about) {
    y += 24;
    elements.push(divider(y));
    y += 28;
    elements.push(text(PAD, y, 'ABOUT', { size: 12, fill: colors.section, weight: 'bold' }));
    const aboutLines = wordWrap(data.about, 70);
    for (const line of aboutLines) {
      y += 20;
      elements.push(text(PAD, y, line, { size: 13, fill: colors.text }));
    }
  }

  // -- Stack --
  if (data.stack && typeof data.stack === 'object') {
    y += 24;
    elements.push(divider(y));
    y += 28;
    elements.push(text(PAD, y, 'STACK', { size: 12, fill: colors.section, weight: 'bold' }));
    for (const [category, techs] of Object.entries(data.stack)) {
      y += 22;
      const techStr = Array.isArray(techs) ? techs.join(', ') : String(techs);
      elements.push(text(PAD, y, category, { size: 12, fill: colors.muted, weight: '600' }));
      const techLines = wordWrap(techStr, 55);
      elements.push(text(PAD + 120, y, techLines[0], { size: 12, fill: colors.text }));
      for (let t = 1; t < techLines.length; t++) {
        y += 18;
        elements.push(text(PAD + 120, y, techLines[t], { size: 12, fill: colors.text }));
      }
    }
  }

  // -- Interests --
  if (data.interests && Array.isArray(data.interests) && data.interests.length > 0) {
    y += 24;
    elements.push(divider(y));
    y += 28;
    elements.push(text(PAD, y, 'INTERESTS', { size: 12, fill: colors.section, weight: 'bold' }));
    const interestStr = data.interests.join(' \u00B7 ');
    const interestLines = wordWrap(interestStr, 74);
    for (const line of interestLines) {
      y += 20;
      elements.push(text(PAD, y, line, { size: 12, fill: colors.interest }));
    }
  }

  // -- Projects --
  if (data.projects && Array.isArray(data.projects) && data.projects.length > 0) {
    y += 24;
    elements.push(divider(y));
    y += 28;
    elements.push(text(PAD, y, 'PROJECTS', { size: 12, fill: colors.section, weight: 'bold' }));
    for (const proj of data.projects) {
      y += 22;
      const status = proj.status || 'wip';
      const statusFill = colors[status] || colors.text;
      elements.push(text(PAD, y, `[${status}]`, { size: 11, fill: statusFill }));
      elements.push(text(PAD + 72, y, proj.name || '', { size: 13, fill: colors.brightText, weight: '600' }));
      if (proj.description) {
        const descLines = wordWrap(proj.description, 58);
        for (const line of descLines) {
          y += 18;
          elements.push(text(PAD + 72, y, line, { size: 12, fill: colors.dimText }));
        }
      }
    }
  }

  // -- Experience --
  if (data.experience && Array.isArray(data.experience) && data.experience.length > 0) {
    y += 24;
    elements.push(divider(y));
    y += 28;
    elements.push(text(PAD, y, 'EXPERIENCE', { size: 12, fill: colors.section, weight: 'bold' }));
    for (const exp of data.experience) {
      y += 22;
      const period = exp.period ? ` (${exp.period})` : '';
      elements.push(text(PAD, y, `${exp.role} @ ${exp.company}${period}`, {
        size: 13,
        fill: colors.text,
      }));
      if (exp.highlight) {
        y += 18;
        elements.push(text(PAD, y, `"${exp.highlight}"`, {
          size: 12,
          fill: colors.dimText,
          style: 'italic',
        }));
      }
    }
  }

  // -- Private Note --
  if (data.private_note) {
    y += 24;
    const noteLines = wordWrap(data.private_note, 70);
    const noteHeight = noteLines.length * 18 + 4;
    elements.push(`<rect x="${PAD}" y="${y - 4}" width="2" height="${noteHeight}" rx="1" fill="#DA7756" opacity="0.25"/>`);
    for (const line of noteLines) {
      elements.push(text(PAD + 14, y, line, {
        size: 12,
        fill: '#6e7681',
        style: 'italic',
      }));
      y += 18;
    }
    y -= 18; // undo last increment
  }

  // -- Links --
  if (data.links && typeof data.links === 'object') {
    y += 24;
    elements.push(divider(y));
    y += 28;
    elements.push(text(PAD, y, 'LINKS', { size: 12, fill: colors.section, weight: 'bold' }));
    for (const [label, url] of Object.entries(data.links)) {
      y += 22;
      elements.push(text(PAD, y, label, { size: 12, fill: colors.muted, weight: '600' }));
      elements.push(text(PAD + 90, y, url, { size: 12, fill: colors.link }));
    }
  }

  // -- Claude's Take --
  if (data.dna || data.next_project) {
    y += 24;
    elements.push(divider(y));
    y += 28;
    elements.push(text(PAD, y, "CLAUDE'S TAKE", { size: 12, fill: colors.section, weight: 'bold' }));

    if (data.dna) {
      y += 8;
      const dnaLines = wordWrap(data.dna, 65);
      const dnaHeight = dnaLines.length * 20 + 8;
      elements.push(`<rect x="${PAD}" y="${y - 4}" width="3" height="${dnaHeight}" rx="1.5" fill="#DA7756" opacity="0.7"/>`);
      for (const line of dnaLines) {
        y += 20;
        elements.push(text(PAD + 14, y, line, { size: 13, fill: colors.text, style: 'italic' }));
      }
    }
    if (data.next_project) {
      y += 20;
      const npLines = wordWrap(data.next_project, 62);
      const npHeight = npLines.length * 18 + 28;
      elements.push(`<rect x="${PAD}" y="${y}" width="${contentW}" height="${npHeight}" rx="6" fill="none" stroke="#58a6ff" stroke-width="1" stroke-dasharray="4,3" opacity="0.3"/>`);
      elements.push(`<rect x="${PAD}" y="${y}" width="${contentW}" height="${npHeight}" rx="6" fill="#58a6ff" opacity="0.03"/>`);
      y += 18;
      elements.push(text(PAD + 12, y, 'WHAT TO BUILD NEXT', { size: 10, fill: '#58a6ff', weight: '600' }));
      for (const line of npLines) {
        y += 18;
        elements.push(text(PAD + 12, y, line, { size: 12, fill: colors.text }));
      }
      y += 8;
    }
  }

  // Footer
  y += 32;
  elements.push(text(W / 2, y, 'devcard', {
    size: 10,
    fill: colors.muted,
    anchor: 'middle',
    style: 'italic',
  }));

  y += 24;
  const H = y;

  // Assemble SVG
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;family=JetBrains+Mono:wght@400;600&amp;display=swap');
    </style>
  </defs>
  <rect width="${W}" height="${H}" rx="12" fill="${colors.bg}"/>
  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="12" fill="none" stroke="${colors.border}" stroke-width="1"/>
  ${elements.join('\n  ')}
</svg>`;
}

export default generateSVG;
export { generateSVG, esc, wordWrap };
