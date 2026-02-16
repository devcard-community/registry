// Shared heatmap utilities for devcard renderers.
// Duplicated from devcard/scripts/lib/heatmap.mjs for the React app.

export function buildHourDist(cl) {
  if (cl.hour_distribution && Array.isArray(cl.hour_distribution) && cl.hour_distribution.length === 24) {
    return cl.hour_distribution.map(Number);
  }
  if (cl.heatmap && Array.isArray(cl.heatmap)) {
    const dist = new Array(24).fill(0);
    for (const row of cl.heatmap) {
      let nums = [];
      if (typeof row === 'string') {
        try { nums = JSON.parse(row); } catch { /* skip malformed row */ }
        if (!Array.isArray(nums)) nums = [];
      } else if (Array.isArray(row)) {
        nums = row;
      }
      for (let i = 0; i < 24 && i < nums.length; i++) {
        dist[i] += Number(nums[i]) || 0;
      }
    }
    return dist;
  }
  return null;
}

export function rotateHeatmap(dist) {
  if (!dist || !Array.isArray(dist) || dist.length !== 24) {
    return { data: dist || new Array(24).fill(0), startHour: 0 };
  }

  const total = dist.reduce((s, v) => s + v, 0);
  if (total === 0) {
    return { data: [...dist], startHour: 0 };
  }

  const max = Math.max(...dist);
  const threshold = max * 0.1;

  let bestStart = 0;
  let bestLen = 0;
  let runStart = -1;
  let runLen = 0;

  for (let i = 0; i < 48; i++) {
    const hour = i % 24;
    if (dist[hour] <= threshold) {
      if (runStart < 0) runStart = i;
      runLen++;
      if (runLen > 24) runLen = 24;
      if (runLen > bestLen) {
        bestLen = runLen;
        bestStart = runStart;
      }
    } else {
      runStart = -1;
      runLen = 0;
    }
  }

  if (bestLen === 0) {
    return { data: [...dist], startHour: 0 };
  }

  const midpoint = (bestStart + Math.floor(bestLen / 2)) % 24;

  if (midpoint === 0 || bestLen < 3) {
    return { data: [...dist], startHour: 0 };
  }

  const rotated = new Array(24);
  for (let i = 0; i < 24; i++) {
    rotated[i] = dist[(i + midpoint) % 24];
  }

  return { data: rotated, startHour: midpoint };
}

export function heatmapAxisLabels(startHour) {
  const positions = [0, 6, 12, 18, 23];
  return positions.map(pos => String((pos + startHour) % 24));
}
