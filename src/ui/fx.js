// Small shared UI effects: click ripples, sparkle bursts, toast messages.
import { getSetting } from '../settings.js';

const layer = () => document.getElementById('fx');

export function ripple(x, y) {
  if (getSetting('reducedMotion')) return;
  const el = document.createElement('i');
  el.className = 'fx-ring';
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  layer().appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}

export function sparkles(x, y, count = 8, spread = 60) {
  if (getSetting('reducedMotion')) return;
  for (let i = 0; i < count; i++) {
    const el = document.createElement('i');
    el.className = 'fx-spark';
    el.textContent = i % 3 ? '✦' : '★';
    const a = (i / count) * Math.PI * 2 + Math.random() * 0.5;
    const d = spread * (0.6 + Math.random() * 0.6);
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.setProperty('--dx', `${Math.cos(a) * d}px`);
    el.style.setProperty('--dy', `${Math.sin(a) * d}px`);
    el.style.animationDelay = `${Math.random() * 60}ms`;
    layer().appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }
}

let toastTimer = 0;
export function toast(message, ms = 2600) {
  const el = document.getElementById('toast');
  el.textContent = message;
  el.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('is-visible'), ms);
}

/** Await a WAAPI animation without throwing when it gets cancelled. */
export const done = (anim) => anim.finished.catch(() => {});

export const wait = (ms) => new Promise((r) => setTimeout(r, ms));
