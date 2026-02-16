export const TAG_COLORS = ["#56d4dd", "#7ee787", "#f778ba", "#bc8cff", "#f0883e", "#e3b341", "#ff7b72", "#a5d6ff"];

export function flattenStack(stack) {
  if (!stack || typeof stack !== "object") return [];
  return Object.values(stack).flat().map(String);
}

export function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, "/");
}
