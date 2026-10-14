// Wii-remote style hand pointer. Position follows the mouse 1:1 (no lag);
// only the tilt is spring-animated, like the pointer rolling with the remote.
import { getSetting, onSettingChange } from '../settings.js';

// ── Cursor images ─────────────────────────────────────────────────────────
// Any PNG (or SVG/WebP) works. Both images should share the same canvas size
// and alignment so swapping between them doesn't make the hand jump.
//   idle   → shown normally
//   hover  → shown over anything clickable
//   size   → on-screen width/height in CSS px
//   hotspot→ the "click point", in pixels of the source image
const BASE = import.meta.env.BASE_URL;
export const CURSOR = {
  idle: `${BASE}cursor/hand-open.png`,
  hover: `${BASE}cursor/hand-point.png`,
  imageSize: 128,
  size: 56,
  hotspot: [48, 4],
};

const scale = CURSOR.size / CURSOR.imageSize;
const HOT_X = CURSOR.hotspot[0] * scale;
const HOT_Y = CURSOR.hotspot[1] * scale;

const INTERACTIVE = 'a, button, [role="button"], input, textarea, select, label, summary, .tile:not(.is-empty), [data-hover]';

export function initCursor(el) {
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  el.innerHTML = `
    <span class="cursor-hand">
      <img class="cursor-img cursor-idle" src="${CURSOR.idle}" alt="" draggable="false" />
      <img class="cursor-img cursor-hover" src="${CURSOR.hover}" alt="" draggable="false" />
    </span>`;
  el.style.width = el.style.height = `${CURSOR.size}px`;
  el.style.setProperty('--hot', `${HOT_X}px ${HOT_Y}px`);
  el.style.opacity = '0';
  let x = -100;
  let y = -100;
  let lastX = 0;
  let angle = 0;
  let angleV = 0;
  let vx = 0;
  let raf = 0;
  let visible = false;

  const enabled = () => fine.matches && getSetting('cursor');

  function apply() {
    document.documentElement.classList.toggle('cursor-on', enabled());
  }
  apply();
  fine.addEventListener?.('change', apply);
  onSettingChange((key) => key === 'cursor' && apply());

  function frame() {
    raf = 0;
    // spring the tilt toward the horizontal velocity
    const target = Math.max(-20, Math.min(20, vx * 0.9));
    angleV += ((target - angle) * 140 - angleV * 14) / 60;
    angle += angleV / 60;
    vx *= 0.82;
    el.style.transform = `translate3d(${x - HOT_X}px, ${y - HOT_Y}px, 0) rotate(${angle.toFixed(2)}deg)`;
    if (Math.abs(angle) > 0.05 || Math.abs(vx) > 0.05 || Math.abs(angleV) > 0.05) raf = requestAnimationFrame(frame);
  }
  const kick = () => {
    if (!raf) raf = requestAnimationFrame(frame);
  };

  window.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType !== 'mouse') return;
      x = e.clientX;
      y = e.clientY;
      vx = vx * 0.5 + (x - lastX) * 0.5;
      lastX = x;
      if (!visible) {
        visible = true;
        el.style.opacity = '1';
      }
      kick();
    },
    { passive: true },
  );

  document.addEventListener('mouseleave', () => {
    visible = false;
    el.style.opacity = '0';
  });

  document.addEventListener('pointerover', (e) => {
    const hit = e.target.closest?.(INTERACTIVE);
    el.classList.toggle('is-hover', !!hit);
  });
  window.addEventListener('pointerdown', () => el.classList.add('is-down'));
  window.addEventListener('pointerup', () => el.classList.remove('is-down'));
  window.addEventListener('blur', () => el.classList.remove('is-down'));
}
