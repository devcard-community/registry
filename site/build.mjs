#!/usr/bin/env node

// build.mjs — Static site generator for the devcard registry.
//
// Generates per-card static pages (needed for OG meta tags / social crawlers):
//   docs/cards/@username/index.html  — full card page with OG tags, share buttons, CTA
//   docs/cards/@username/card.svg    — SVG card for embedding
//   docs/cards/@username/og.png      — Social preview image (1200x630, via Puppeteer)
//   docs/cards-index.json            — Machine-readable card index (consumed by React gallery)
//
// The gallery (docs/index.html) is a React app built separately by Vite.
//
// Incremental by default: only rebuilds cards whose YAML is newer than output.
// Pass --full to force rebuild all cards (e.g. after template changes).
//
// Usage:
//   node site/build.mjs          # incremental build
//   node site/build.mjs --full   # full rebuild

import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import parseYaml from './lib/parse-yaml.mjs';
import { generateCardHTML } from './lib/generate-html.mjs';
import generateSVG from './lib/generate-svg.mjs';
import { SITE_URL } from './config.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CARDS_DIR = join(ROOT, 'cards');
const DOCS_DIR = join(ROOT, 'docs');
const BASE_URL = SITE_URL;

const fullRebuild = process.argv.includes('--full');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function needsRebuild(yamlPath, outDir) {
  if (fullRebuild) return true;
  if (!existsSync(outDir)) return true;
  const htmlPath = join(outDir, 'index.html');
  const svgPath = join(outDir, 'card.svg');
  if (!existsSync(htmlPath) || !existsSync(svgPath)) return true;
  const yamlMtime = statSync(yamlPath).mtimeMs;
  const htmlMtime = statSync(htmlPath).mtimeMs;
  return yamlMtime > htmlMtime;
}

function extractUsername(filename) {
  const m = filename.match(/^@([A-Za-z0-9_-]+)\.ya?ml$/);
  return m ? m[1] : null;
}

// ---------------------------------------------------------------------------
// OG image screenshot via Puppeteer
// ---------------------------------------------------------------------------

async function generateOGImage(htmlPath, pngPath) {
  let puppeteer;
  try {
    puppeteer = await import('puppeteer');
  } catch {
    console.warn('  [skip] puppeteer not available — skipping og.png');
    return;
  }

  const browser = await puppeteer.default.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 2 });
    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0', timeout: 15000 });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: pngPath, type: 'png' });
  } finally {
    await browser.close();
  }
}

// ---------------------------------------------------------------------------
// Main build
// ---------------------------------------------------------------------------

async function main() {
  console.log(fullRebuild ? '[build] Full rebuild' : '[build] Incremental build');

  mkdirSync(DOCS_DIR, { recursive: true });

  let cardFiles;
  try {
    cardFiles = readdirSync(CARDS_DIR).filter(f => f.startsWith('@') && /\.ya?ml$/.test(f));
  } catch {
    console.error(`[error] Cannot read cards directory: ${CARDS_DIR}`);
    process.exit(1);
  }

  if (cardFiles.length === 0) {
    console.log('[build] No cards found. Writing empty index.');
    writeFileSync(join(DOCS_DIR, 'cards-index.json'), JSON.stringify([], null, 2));
    return;
  }

  console.log(`[build] Found ${cardFiles.length} card(s)`);

  const allCards = [];
  const cardsToRebuild = [];

  for (const file of cardFiles) {
    const username = extractUsername(file);
    if (!username) {
      console.warn(`[skip] Cannot extract username from: ${file}`);
      continue;
    }

    const yamlPath = join(CARDS_DIR, file);
    let raw;
    try {
      raw = readFileSync(yamlPath, 'utf-8');
    } catch (err) {
      console.warn(`[skip] Cannot read ${file}: ${err.message}`);
      continue;
    }

    let data;
    try {
      data = parseYaml(raw);
    } catch (err) {
      console.warn(`[skip] Parse error in ${file}: ${err.message}`);
      continue;
    }

    const cardEntry = { username, data, yamlPath };
    allCards.push(cardEntry);

    const outDir = join(DOCS_DIR, 'cards', username);
    if (needsRebuild(yamlPath, outDir)) {
      cardsToRebuild.push(cardEntry);
    }
  }

  allCards.sort((a, b) => (a.data.name || a.username).localeCompare(b.data.name || b.username));

  if (cardsToRebuild.length === 0) {
    console.log('[build] All cards up to date');
  } else {
    console.log(`[build] Rebuilding ${cardsToRebuild.length} card(s)`);
  }

  for (const { username, data } of cardsToRebuild) {
    const outDir = join(DOCS_DIR, 'cards', username);
    mkdirSync(outDir, { recursive: true });

    const html = generateCardHTML(data, username);
    const htmlPath = join(outDir, 'index.html');
    writeFileSync(htmlPath, html);

    const svg = generateSVG(data);
    writeFileSync(join(outDir, 'card.svg'), svg);

    const pngPath = join(outDir, 'og.png');
    await generateOGImage(htmlPath, pngPath);

    console.log(`  [ok] @${username}`);
  }

  // JSON index consumed by the React gallery app
  const cardsIndex = allCards.map(({ username, data }) => ({
    username,
    name: data.name || username,
    title: data.title || '',
    location: data.location || '',
    archetype: data.archetype || '',
    bio: data.bio || '',
    dna: data.dna || '',
    next_project: data.next_project || '',
    about: data.about || '',
    stack: data.stack || {},
    interests: data.interests || [],
    projects: data.projects || [],
    experience: data.experience || [],
    repo_count: Number(data.repo_count) || 0,
    links: data.links || {},
    private_note: data.private_note || '',
    claude: data.claude || null,
    created_at: data.created_at || '',
    updated_at: data.updated_at || '',
    url: `cards/${encodeURIComponent(username)}/`,
  }));
  writeFileSync(join(DOCS_DIR, 'cards-index.json'), JSON.stringify(cardsIndex, null, 2));

  console.log(`[build] ${allCards.length} card(s) indexed`);
  console.log('[build] Done — run "vite build" next for the gallery');
}

main().catch(err => {
  console.error('[error]', err);
  process.exit(1);
});
