import { t } from '../i18n.js';
import { profile } from '../content.js';
import { sfx, music } from '../audio.js';
import { toast, sparkles, wait } from '../ui/fx.js';
import { getSetting } from '../settings.js';
import { esc, displayName } from './util.js';

const BLOCKS = 20;

export function render(root, ctx) {
  const name = displayName();
  root.innerHTML = `
    <div class="page-head reveal">
      <div>
        <h2 class="page-title" id="page-title">${esc(t('shop.welcome'))}</h2>
        <p class="page-sub">${esc(t('ch.shop.desc'))}</p>
      </div>
      <p class="shop-balance">${esc(t('shop.balance'))}</p>
    </div>
    <section class="shop-card glass reveal">
      <div class="shop-thumb" aria-hidden="true">
        <div class="shop-doc">
          <span class="doc-face"><img class="mii-face" alt="" /></span>
          <i></i><i></i><i></i><i></i><i></i>
        </div>
        <span class="shop-ribbon">PDF</span>
      </div>
      <div class="shop-info">
        <h3 class="shop-item-name">${esc(t('shop.item', { name }))}</h3>
        <p class="shop-item-desc">${esc(t('shop.desc'))}</p>
        <p class="shop-price"><span>${esc(t('shop.price'))}</span> <strong>${esc(t('shop.points'))}</strong></p>
        <button class="wii-btn wii-btn--blue shop-buy" type="button">${esc(t('shop.download'))}</button>
      </div>
      <div class="shop-progress" hidden>
        <p class="shop-status" aria-live="polite">${esc(t('shop.downloading'))}</p>
        <div class="blocks">${Array.from({ length: BLOCKS }, () => '<i></i>').join('')}</div>
        <p class="shop-count"><span class="n">0</span> / ${BLOCKS} ${esc(t('shop.blocks'))}</p>
      </div>
    </section>`;

  root.querySelectorAll('.mii-face').forEach((img) => ctx.miiFace && (img.src = ctx.miiFace));

  const buy = root.querySelector('.shop-buy');
  const progress = root.querySelector('.shop-progress');
  const blocks = [...root.querySelectorAll('.blocks i')];
  const count = root.querySelector('.shop-count .n');
  const status = root.querySelector('.shop-status');
  let running = false;
  let alive = true;

  buy.addEventListener('click', async () => {
    if (running) return;
    if (!profile.cvUrl) {
      sfx.error();
      toast(t('shop.unavailable'));
      buy.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(-4deg)' }, { transform: 'rotate(4deg)' }, { transform: 'none' }], { duration: 360 });
      return;
    }
    running = true;
    sfx.coin();
    buy.disabled = true;
    progress.hidden = false;
    status.textContent = t('shop.downloading');
    blocks.forEach((b) => b.classList.remove('on'));
    music.duck(0.35, 3);
    const step = getSetting('reducedMotion') ? 10 : 85;
    for (let i = 0; i < BLOCKS; i++) {
      if (!alive) return;
      await wait(step + Math.random() * step * 0.6);
      blocks[i].classList.add('on');
      count.textContent = String(i + 1);
      sfx.tick();
    }
    status.textContent = t('shop.done');
    sfx.sparkle();
    const r = buy.getBoundingClientRect();
    sparkles(r.left + r.width / 2, r.top, 12, 70);
    const a = document.createElement('a');
    a.href = profile.cvUrl;
    a.download = '';
    document.body.appendChild(a);
    a.click();
    a.remove();
    buy.textContent = t('shop.again');
    buy.disabled = false;
    running = false;
  });

  return () => {
    alive = false;
  };
}
