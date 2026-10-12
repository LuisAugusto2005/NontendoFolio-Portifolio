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

  function position() {
    const p = stage.getHeadClientPos();
    if (!p) return;
    let x = p.x + 14;
    const y = p.y - 2;
    const width = text.offsetWidth || 240;
    const flip = x + width > window.innerWidth - 12;
    el.classList.toggle('is-flipped', flip);
    if (flip) x = p.x - 14;
    el.style.setProperty('--x', `${Math.round(x)}px`);
    el.style.setProperty('--y', `${Math.round(Math.max(y, 72 + text.offsetHeight))}px`);
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
