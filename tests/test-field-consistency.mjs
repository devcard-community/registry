import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { generateCardHTML } from '../site/lib/generate-html.mjs';
import { generateSVG } from '../site/lib/generate-svg.mjs';

describe('registry field consistency — archetype', () => {
  it('generate-html shows archetype with prefix in header', () => {
    const data = { name: 'Test', archetype: 'The Visualizer' };
    const html = generateCardHTML(data, 'test');
    assert.ok(html.includes('The Visualizer'), 'HTML should show archetype');
    assert.ok(html.includes("Claude&#x27;s read:") || html.includes("Claude's read:"), 'HTML should show archetype prefix');
  });

  it('generate-svg shows archetype with prefix in header', () => {
    const data = { name: 'Test', archetype: 'The Visualizer' };
    const svg = generateSVG(data);
    assert.ok(svg.includes('The Visualizer'), 'SVG should show archetype');
    assert.ok(svg.includes("Claude&#x27;s read:") || svg.includes("Claude's read:"), 'SVG should show archetype prefix');
  });

  it('generate-svg does NOT show archetype-only card as having Claude\'s Take', () => {
    const data = { name: 'Test', archetype: 'The Visualizer' };
    const svg = generateSVG(data);
    assert.ok(!svg.includes("CLAUDE'S TAKE"), 'SVG should not have Claude\'s Take for archetype-only card');
  });

  it('generate-html does NOT show archetype-only card as having Claude\'s Take', () => {
    const data = { name: 'Test', archetype: 'The Visualizer' };
    const html = generateCardHTML(data, 'test');
    assert.ok(!html.includes("Claude&#x27;s Take") && !html.includes("Claude's Take"),
      'HTML should not have Claude\'s Take for archetype-only card');
  });
});

describe('registry renderers — missing sections', () => {
  it('generate-html renders without error when no sections present', () => {
    const html = generateCardHTML({ name: 'Empty' }, 'empty');
    assert.ok(html.includes('Empty'));
  });

  it('generate-svg renders without error when no sections present', () => {
    const svg = generateSVG({ name: 'Empty' });
    assert.ok(svg.includes('EMPTY'));
  });

  it('generate-html renders without error when data has no projects', () => {
    const html = generateCardHTML({ name: 'Test', bio: 'Hi' }, 'test');
    assert.ok(!html.includes('Projects'));
  });

  it('generate-svg renders without error when data has no projects', () => {
    const svg = generateSVG({ name: 'Test', bio: 'Hi' });
    assert.ok(!svg.includes('PROJECTS'));
  });
});

describe('registry escaping', () => {
  it('generate-html escapes script tags in name', () => {
    const html = generateCardHTML({ name: '<img onerror=alert(1)>' }, 'xss');
    assert.ok(!html.includes('<img onerror'), 'Should not contain raw img tag');
    assert.ok(html.includes('&lt;img'), 'Should escape img tag');
  });

  it('generate-svg escapes script tags in bio', () => {
    const svg = generateSVG({ name: 'Test', bio: '<script>evil</script>' });
    assert.ok(!svg.includes('<script>evil'), 'SVG should not contain raw script');
    assert.ok(svg.includes('&lt;script&gt;'), 'SVG should escape script tag');
  });
});
