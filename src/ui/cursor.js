// Wii-remote style hand pointer. Position follows the mouse 1:1 (no lag);
// only the tilt is spring-animated, like the pointer rolling with the remote.
import { getSetting, onSettingChange } from '../settings.js';

const SHAPES = `
  <rect x="10" y="1.5" width="10" height="27" rx="5"/>
  <rect x="18.5" y="14" width="9.5" height="13" rx="4.75"/>
  <rect x="26" y="16" width="9" height="12" rx="4.5"/>
  <rect x="32.5" y="19.5" width="7.5" height="11" rx="3.75"/>
  <rect x="7.5" y="19" width="32.5" height="26" rx="11"/>
  <rect x="1.5" y="23" width="9" height="17" rx="4.5" transform="rotate(-32 6 31.5)"/>`;

const SVG = `
<svg viewBox="0 0 46 56" aria-hidden="true">
  <defs>
    <linearGradient id="handFill" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="0.6" stop-color="#f4f8fb"/>
      <stop offset="1" stop-color="#d9e4ec"/>
    </linearGradient>
  </defs>
  <g class="glow" fill="#46cdfb" stroke="#46cdfb" stroke-width="9" stroke-linejoin="round" opacity="0.45">${SHAPES}</g>
  <g fill="#43525f" stroke="#43525f" stroke-width="3.4" stroke-linejoin="round">${SHAPES}</g>
  <g fill="url(#handFill)">${SHAPES}</g>
  <path d="M19.2 21.5v5 M26.4 23v4.4 M32.8 25.2v3.6" stroke="#aebdc9" stroke-width="1.4" stroke-linecap="round" fill="none"/>
  <text x="24" y="39.5" font-size="11.5" font-weight="800" fill="#27a6ec" text-anchor="middle" font-family="M PLUS Rounded 1c, sans-serif">1</text>
</svg>`;

const HOT_X = 15;
const HOT_Y = 3;
const INTERACTIVE = 'a, button, [role="button"], input, textarea, select, label, summary, .tile:not(.is-empty), [data-hover]';

export function initCursor(el) {
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  el.innerHTML = SVG;
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
