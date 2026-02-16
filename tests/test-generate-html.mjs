import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { generateCardHTML } from '../site/lib/generate-html.mjs';

describe('generateCardHTML', () => {
  it('renders a basic card with name and title', () => {
    const html = generateCardHTML({ name: 'Jane', title: 'Engineer' }, 'janedoe');
    assert.ok(html.includes('Jane'), 'Should contain name');
    assert.ok(html.includes('Engineer'), 'Should contain title');
    assert.ok(html.includes('<!DOCTYPE html>'), 'Should be complete HTML document');
  });

  it('includes OG meta tags', () => {
    const html = generateCardHTML({ name: 'Jane', title: 'Dev', bio: 'Hello' }, 'janedoe');
    assert.ok(html.includes('og:title'), 'Should have og:title');
    assert.ok(html.includes('og:description'), 'Should have og:description');
    assert.ok(html.includes('og:image'), 'Should have og:image');
    assert.ok(html.includes('twitter:card'), 'Should have twitter card');
  });

  it('renders archetype in header', () => {
    const html = generateCardHTML({ name: 'Test', archetype: 'The Builder' }, 'test');
    assert.ok(html.includes('The Builder'), 'Should have archetype value');
    assert.ok(html.includes('archetype-line'), 'Should use archetype-line class');
  });

  it('does not render archetype inside Claude\'s Take section', () => {
    const html = generateCardHTML({ name: 'Test', archetype: 'The Builder', dna: 'Some DNA text' }, 'test');
    // The archetype-line div should appear before the divider, not inside Claude's Take
    const archetypePos = html.indexOf('archetype-line');
    const claudeTakePos = html.indexOf("Claude&#x27;s Take") !== -1
      ? html.indexOf("Claude&#x27;s Take")
      : html.indexOf("Claude's Take");
    // Archetype should be in header area, before sections start
    assert.ok(archetypePos > 0, 'Should have archetype-line class');
    assert.ok(archetypePos < html.indexOf('divider'), 'Archetype should appear before first divider');
  });

  it('renders all sections when data is complete', () => {
    const data = {
      name: 'Full Card',
      title: 'Engineer',
      bio: 'A bio',
      about: 'About text',
      stack: { languages: ['Python'] },
      interests: ['coding'],
      projects: [{ name: 'proj', status: 'shipped', description: 'desc' }],
      experience: [{ role: 'Dev', company: 'Co', period: '2020-now', highlight: 'Did stuff' }],
      links: { github: 'https://github.com/test' },
      dna: 'DNA text',
      next_project: 'Next project text',
    };
    const html = generateCardHTML(data, 'fullcard');
    assert.ok(html.includes('Bio'), 'Should have Bio section');
    assert.ok(html.includes('About'), 'Should have About section');
    assert.ok(html.includes('Stack'), 'Should have Stack section');
    assert.ok(html.includes('Interests'), 'Should have Interests section');
    assert.ok(html.includes('Projects'), 'Should have Projects section');
    assert.ok(html.includes('Experience'), 'Should have Experience section');
    assert.ok(html.includes('Links'), 'Should have Links section');
    assert.ok(html.includes('What to Build Next'), 'Should have next project section');
  });

  it('renders without error when data is minimal', () => {
    const html = generateCardHTML({ name: 'Min' }, 'min');
    assert.ok(html.includes('Min'), 'Should contain name');
    assert.ok(html.includes('<!DOCTYPE html>'), 'Should be valid HTML');
  });

  it('escapes special characters in user content', () => {
    const data = { name: '<script>alert("x")</script>', bio: 'A & B "C"' };
    const html = generateCardHTML(data, 'xss');
    assert.ok(!html.includes('<script>alert'), 'Should not contain raw script tags');
    assert.ok(html.includes('&lt;script&gt;'), 'Should escape script tags');
    assert.ok(html.includes('&amp;'), 'Should escape ampersand in bio');
  });

  it('includes share buttons', () => {
    const html = generateCardHTML({ name: 'Test' }, 'test');
    assert.ok(html.includes('copy link'), 'Should have copy link button');
    assert.ok(html.includes('share on X'), 'Should have X share button');
    assert.ok(html.includes('share on LinkedIn'), 'Should have LinkedIn share button');
  });

  it('includes CTA section', () => {
    const html = generateCardHTML({ name: 'Test' }, 'test');
    assert.ok(html.includes('devcard:init'), 'Should have devcard init command');
    assert.ok(html.includes('Get started'), 'Should have get started link');
  });
});
