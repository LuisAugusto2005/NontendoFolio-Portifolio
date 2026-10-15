// Speech bubble that follows the Mii's head, with a typewriter + text blips.
import { sfx } from '../audio.js';
import { getSetting } from '../settings.js';

export function createSpeech(el, stage) {
  const text = el.querySelector('.speech-text');
  text.setAttribute('aria-hidden', 'true');
  const live = document.createElement('span');
  live.className = 'sr-only';
  el.appendChild(live);

  let typeTimer = 0;
  let hideTimer = 0;
  let enabled = true;
  let currentPriority = -1;

  function hide() {
    el.classList.remove('is-visible');
    currentPriority = -1;
  }

  function say(message, { hold = null, priority = 1, blips = true } = {}) {
    if (!enabled || !message) return;
    if (el.classList.contains('is-visible') && priority < currentPriority) return;
    currentPriority = priority;
    clearTimeout(typeTimer);
    clearTimeout(hideTimer);
    const chars = [...message];
    // full text is laid out up front so the bubble doesn't jitter while typing
    text.innerHTML = '';
    const spans = chars.map((ch) => {
      const s = document.createElement('span');
      s.textContent = ch;
      s.style.visibility = 'hidden';
      text.appendChild(s);
      return s;
    });
    live.textContent = message;
    el.classList.add('is-visible');
    position();

    const reduced = getSetting('reducedMotion');
    const speed = chars.length > 40 ? 22 : 30;
    let i = 0;
    const step = () => {
      if (reduced) {
        spans.forEach((s) => (s.style.visibility = 'visible'));
        i = spans.length;
      } else {
        spans[i].style.visibility = 'visible';
        if (blips && i % 2 === 0 && chars[i].trim()) sfx.blip(chars[i].charCodeAt(0) % 5 * 30);
        i++;
      }
      if (i < spans.length) typeTimer = setTimeout(step, speed);
      else hideTimer = setTimeout(hide, hold ?? Math.max(2600, chars.length * 75));
    };
    typeTimer = setTimeout(step, 120);
  }

  // Pick a placement that fits on screen: right of the head, else left of it,
  // else centered above it. The tail always points at the head.
  let lastMax = '';
  function position() {
    const p = stage.getHeadClientPos();
    if (!p) return;
    const vw = window.innerWidth;
    const pad = 10;
    const pref = Math.min(320, vw * 0.72);
    const spaceRight = vw - pad - (p.x + 4);
    const spaceLeft = p.x - 4 - pad;
    let mode = 'above';
    let max = vw - pad * 2;
    if (spaceRight >= Math.min(pref, 230)) {
      mode = 'right';
      max = Math.min(pref, spaceRight);
    } else if (spaceLeft >= Math.min(pref, 230)) {
      mode = 'left';
      max = Math.min(pref, spaceLeft);
    } else {
      max = Math.min(pref + 40, vw - pad * 2);
    }
    const maxPx = `${Math.floor(max)}px`;
    if (maxPx !== lastMax) {
      el.style.setProperty('--max', maxPx);
      lastMax = maxPx;
    }
    const w = text.offsetWidth || 200;
    const h = text.offsetHeight || 50;
    let left;
    if (mode === 'right') left = p.x - 6;
    else if (mode === 'left') left = p.x + 6 - w;
    else left = Math.min(Math.max(p.x - w / 2, pad), vw - pad - w);
    const tail = Math.min(Math.max(p.x - left + (mode === 'right' ? 18 : mode === 'left' ? -18 : 0), 24), w - 24);
    el.style.setProperty('--tail', `${Math.round(tail)}px`);
    el.classList.toggle('is-tail-right', tail > w / 2);
    // keep it below the status bar
    const status = document.querySelector('.statusbar')?.getBoundingClientRect().bottom ?? 60;
    const y = Math.max(p.y - 4, status + 8 + h);
    el.style.setProperty('--x', `${Math.round(left)}px`);
    el.style.setProperty('--y', `${Math.round(y)}px`);
  }

  stage.onFrame({
    onTick: () => {
      if (el.classList.contains('is-visible')) position();
    },
  });

  el.addEventListener('click', hide);

  return {
    say,
    hide,
    setEnabled(v) {
      enabled = v;
      if (!v) hide();
    },
  };
}
