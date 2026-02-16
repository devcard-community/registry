// Validate a devcard YAML file against the schema.
// Usage: node site/validate.mjs cards/@username.yaml
//
// Exits 0 with { valid: true, errors: [] } on success,
// exits 1 with { valid: false, errors: [...] } on failure.

import { readFileSync } from 'node:fs';
import { basename } from 'node:path';
import parseYaml from './lib/parse-yaml.mjs';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_LENGTHS = {
  name: 100,
  title: 200,
  bio: 500,
  dna: 300,
  about: 2000,
  private_note: 300,
};

const MAX_INTERESTS = 10;

// Patterns that indicate XSS / HTML injection attempts.
// Uses an allowlist approach: any HTML-like tag is rejected, plus event handlers and dangerous URIs.
const DANGEROUS_PATTERNS = [
  /<[a-zA-Z]/,        // any HTML tag opening (<script, <img, <svg, <style, <math, etc.)
  /on\w+\s*=/i,       // onclick=, onload=, onerror=, etc.
  /javascript\s*:/i,
  /data\s*:\s*text\/html/i,
  /vbscript\s*:/i,
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function extractUsernameFromFilename(filePath) {
  const base = basename(filePath); // @username.yaml
  const match = base.match(/^@(.+)\.ya?ml$/);
  return match ? match[1] : null;
}

function extractUsernameFromGitHub(url) {
  if (typeof url !== 'string') return null;
  const match = url.match(/^https?:\/\/github\.com\/([A-Za-z0-9_-]+)\/?$/);
  return match ? match[1] : null;
}

function isString(v) {
  return typeof v === 'string';
}

/** Recursively collect every string value from a nested object/array. */
function collectStrings(obj) {
  const strings = [];
  if (isString(obj)) {
    strings.push(obj);
  } else if (Array.isArray(obj)) {
    for (const item of obj) strings.push(...collectStrings(item));
  } else if (obj && typeof obj === 'object') {
    for (const val of Object.values(obj)) strings.push(...collectStrings(val));
  }
  return strings;
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function validate(data, filePath) {
  const errors = [];

  // -- schema_version --
  if (data.schema_version !== '1') {
    errors.push(`schema_version must be "1", got "${data.schema_version ?? '(missing)'}"`);
  }

  // -- Required scalar fields --
  for (const field of ['name', 'title', 'bio']) {
    if (!data[field] || !isString(data[field]) || data[field].trim() === '') {
      errors.push(`Required field "${field}" is missing or empty`);
    }
  }

  // -- stack: must be object with at least one category containing items --
  if (!data.stack || typeof data.stack !== 'object' || Array.isArray(data.stack)) {
    errors.push('Required field "stack" must be a map with at least one category');
  } else {
    const categories = Object.entries(data.stack);
    if (categories.length === 0) {
      errors.push('"stack" must contain at least one category');
    } else {
      for (const [cat, techs] of categories) {
        if (!Array.isArray(techs) && !isString(techs)) {
          errors.push(`stack.${cat} must be a string or array, not an object`);
        }
      }
      const hasItems = categories.some(([, techs]) =>
        Array.isArray(techs) ? techs.length > 0 : (isString(techs) && techs.trim() !== '')
      );
      if (!hasItems) {
        errors.push('"stack" categories must contain at least one technology');
      }
    }
  }

  // -- links.github required --
  if (!data.links || typeof data.links !== 'object') {
    errors.push('Required field "links.github" is missing (no links section)');
  } else if (!data.links.github || !isString(data.links.github)) {
    errors.push('Required field "links.github" is missing or empty');
  }

  // -- Identity check: filename username must match links.github username --
  const fileUser = extractUsernameFromFilename(filePath);
  const githubUser = data.links ? extractUsernameFromGitHub(data.links.github) : null;

  if (fileUser && githubUser) {
    if (fileUser.toLowerCase() !== githubUser.toLowerCase()) {
      errors.push(
        `Username mismatch: filename says "${fileUser}" but links.github points to "${githubUser}"`
      );
    }
  } else if (fileUser && data.links?.github) {
    // Could not parse a username from the github URL -- malformed
    errors.push(
      `Could not extract username from links.github URL: "${data.links.github}"`
    );
  }

  // -- URL fields must be strings starting with https:// --
  if (data.links && typeof data.links === 'object') {
    for (const [label, url] of Object.entries(data.links)) {
      if (!isString(url)) {
        errors.push(`links.${label} must be a string URL, not an object`);
      } else if (url.trim() !== '' && !url.startsWith('https://')) {
        errors.push(`links.${label} must start with https:// (got "${url}")`);
      }
    }
  }

  // -- Max field lengths --
  for (const [field, max] of Object.entries(MAX_LENGTHS)) {
    if (isString(data[field]) && data[field].length > max) {
      errors.push(`"${field}" exceeds max length of ${max} (got ${data[field].length})`);
    }
  }

  // -- interests --
  if (data.interests !== undefined) {
    if (!Array.isArray(data.interests)) {
      errors.push('"interests" must be an array');
    } else if (data.interests.length > MAX_INTERESTS) {
      errors.push(`"interests" has ${data.interests.length} items (max ${MAX_INTERESTS})`);
    }
  }

  // -- projects --
  if (data.projects !== undefined) {
    if (!Array.isArray(data.projects)) {
      errors.push('"projects" must be an array');
    } else {
      data.projects.forEach((proj, i) => {
        if (!proj.name || !isString(proj.name) || proj.name.trim() === '') {
          errors.push(`projects[${i}] is missing required field "name"`);
        }
      });
    }
  }

  // -- experience --
  if (data.experience !== undefined) {
    if (!Array.isArray(data.experience)) {
      errors.push('"experience" must be an array');
    } else {
      data.experience.forEach((exp, i) => {
        if (!exp.role || !isString(exp.role) || exp.role.trim() === '') {
          errors.push(`experience[${i}] is missing required field "role"`);
        }
        if (!exp.company || !isString(exp.company) || exp.company.trim() === '') {
          errors.push(`experience[${i}] is missing required field "company"`);
        }
      });
    }
  }

  // -- XSS / HTML injection check across all string values --
  const allStrings = collectStrings(data);
  for (const str of allStrings) {
    for (const pattern of DANGEROUS_PATTERNS) {
      if (pattern.test(str)) {
        errors.push(`Dangerous content detected: "${str.slice(0, 80)}..." matches ${pattern}`);
        break; // one error per string is enough
      }
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const filePath = process.argv[2];

  if (!filePath) {
    console.error('Usage: node site/validate.mjs cards/@username.yaml');
    process.exit(1);
  }

  let raw;
  try {
    raw = readFileSync(filePath, 'utf-8');
  } catch (err) {
    const result = { valid: false, errors: [`Cannot read file: ${err.message}`] };
    console.log(JSON.stringify(result, null, 2));
    process.exit(1);
  }

  let data;
  try {
    data = parseYaml(raw);
  } catch (err) {
    const result = { valid: false, errors: [`YAML parse error: ${err.message}`] };
    console.log(JSON.stringify(result, null, 2));
    process.exit(1);
  }

  const errors = validate(data, filePath);
  const valid = errors.length === 0;
  const result = { valid, errors };

  console.log(JSON.stringify(result, null, 2));
  process.exit(valid ? 0 : 1);
}

main();
