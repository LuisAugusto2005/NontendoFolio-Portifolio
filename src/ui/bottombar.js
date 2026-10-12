// Wii-menu bottom bar: the curved edge is computed from the real width so the
// bumps always hug the two round buttons, plus the big clock in the middle.
import { getLang, getLocale, onLangChange } from '../i18n.js';

export function initBottomBar(bar) {
  const svg = bar.querySelector('.bottombar-shape');
  const [fill, stroke] = svg.querySelectorAll('path');
  const hh = bar.querySelector('.hh');
  const mm = bar.querySelector('.mm');
  const date = bar.querySelector('.clock-date');

  function layout() {
    const W = bar.clientWidth;
    const H = bar.clientHeight;
    const small = W < 640;
    const size = small ? 60 : 80;
    const left = small ? 16 : Math.min(84, Math.max(28, W * 0.045));
    const line = small ? 30 : 42;
    const peak = 3;
    const R = size / 2 + (small ? 10 : 14);
    const cx1 = left + size / 2;
    const cx2 = W - left - size / 2;
    const d =
      `M0 ${peak + 14} C ${cx1 - R} ${peak}, ${cx1 - R * 0.5} ${peak}, ${cx1} ${peak} ` +
      `C ${cx1 + R * 0.95} ${peak}, ${cx1 + R} ${line}, ${cx1 + R + 50} ${line} ` +
      `L ${cx2 - R - 50} ${line} ` +
      `C ${cx2 - R} ${line}, ${cx2 - R * 0.95} ${peak}, ${cx2} ${peak} ` +
      `C ${cx2 + R * 0.5} ${peak}, ${cx2 + R} ${peak}, ${W} ${peak + 14}`;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    stroke.setAttribute('d', d);
    fill.setAttribute('d', `${d} L ${W} ${H} L 0 ${H} Z`);
    bar.style.setProperty('--btn-size', `${size}px`);
    bar.style.setProperty('--btn-left', `${left}px`);
    bar.style.setProperty('--btn-top', `${peak + (small ? 8 : 9)}px`);
    bar.style.setProperty('--clock-top', `${line + (small ? 6 : 8)}px`);
    bar.style.setProperty('--clock-size', small ? '30px' : '46px');
    bar.style.setProperty('--date-size', small ? '13px' : '17px');
  }

  function tick() {
    const now = new Date();
    const lang = getLang();
    let h = now.getHours();
    if (lang === 'en') h = h % 12 || 12;
    hh.textContent = lang === 'en' ? String(h) : String(h).padStart(2, '0');
    mm.textContent = String(now.getMinutes()).padStart(2, '0');
    const fmt = new Intl.DateTimeFormat(getLocale(), { weekday: 'short', day: 'numeric', month: 'numeric' });
    date.textContent = fmt.format(now).replace(/\.,/g, ',');
  }

  new ResizeObserver(layout).observe(bar);
  layout();
  tick();
  setInterval(tick, 1000);
  onLangChange(tick);
}
