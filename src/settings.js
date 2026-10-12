// Persistent user preferences (per browser).
const KEY = 'nontendofolio.settings.v1';

const prefersReducedMotion = () =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

const defaults = () => ({
  lang: null, // null = auto-detect
  music: true,
  sfx: true,
  cursor: true,
  reducedMotion: prefersReducedMotion(),
});

let data = defaults();
const listeners = new Set();

export function loadSettings() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) data = { ...defaults(), ...JSON.parse(raw) };
  } catch {
    /* storage unavailable: keep defaults */
  }
  return data;
}

export function getSetting(key) {
  return data[key];
}

export function setSetting(key, value) {
  if (data[key] === value) return;
  data[key] = value;
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
  listeners.forEach((fn) => fn(key, value));
}

export function onSettingChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Multiplier for scripted animation durations (near-zero when motion is reduced). */
export function motion(ms) {
  return data.reducedMotion ? Math.min(ms, 120) * 0.5 : ms;
}
