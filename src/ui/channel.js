// Opening a channel, Wii style:
//   tile ──zoom──▶ banner (Menu / Start) ──Start──▶ page (banner morphs into its header)
//   page/banner ──Menu──▶ zooms back into the tile it came from.
import { channelById, artHTML } from './arts.js';
import { t, applyTranslations, onLangChange } from '../i18n.js';
import { sfx } from '../audio.js';
import { motion } from '../settings.js';
import { done } from './fx.js';

const HOME_ICON =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.2 2.6 11a1 1 0 0 0 .64 1.77H5v7.03c0 .66.54 1.2 1.2 1.2h3.9v-5.4h3.8V21h3.9c.66 0 1.2-.54 1.2-1.2v-7.03h1.76A1 1 0 0 0 21.4 11z"/></svg>';

const EASE_ZOOM = 'cubic-bezier(.25,.9,.25,1)';
const EASE_OUT = 'cubic-bezier(.22,1,.36,1)';

function visibleRect(el) {
  if (!el || !document.contains(el)) return null;
  // zoom from/to a tile's inner art so the banner lands exactly on it
  el = el.querySelector?.(':scope > .art') || el;
  const r = el.getBoundingClientRect();
  if (r.width < 4 || r.height < 4 || r.bottom < 0 || r.top > innerHeight) return null;
  return r;
}

function fallbackRect() {
  const w = Math.min(260, innerWidth * 0.4);
  const h = w / 1.6;
  return new DOMRect((innerWidth - w) / 2, (innerHeight - h) / 2, w, h);
}

const insetFor = (r, radius = 20) =>
  `inset(${r.top}px ${innerWidth - r.right}px ${innerHeight - r.bottom}px ${r.left}px round ${radius}px)`;

export function createChannels({ layer, app, stage, bubbles, views, ctx, onStateChange }) {
  const state = { id: null, phase: 'closed', origin: null, cleanup: null, busy: false, io: null, appAnim: null };
  const q = (sel) => layer.querySelector(sel);

  function build(id) {
    const ch = channelById(id);
    layer.className = `channel-layer ch--${id}`;
    layer.style.setProperty('--accent', ch.accent);
    layer.innerHTML = `
      <div class="page" tabindex="-1"><div class="page-inner"></div></div>
      <div class="banner">
        <div class="banner-art"><div class="art art--${id}">${artHTML(id)}</div></div>
        <div class="banner-actions">
          <button class="wii-btn" type="button" data-act="menu" data-i18n="banner.menu"></button>
          <button class="wii-btn" type="button" data-act="start" data-i18n="banner.start"></button>
        </div>
      </div>
      <div class="page-bar" aria-hidden="true"><i class="dot"></i><span data-i18n="ch.${id}.title"></span></div>
      <button class="home-btn" type="button" data-act="menu" data-i18n-aria="page.backToMenu">
        <span class="home-icon">${HOME_ICON}</span><span data-i18n="page.home"></span>
      </button>
      <div class="flash"></div>`;
    layer.setAttribute('role', 'dialog');
    layer.setAttribute('aria-modal', 'true');
    layer.setAttribute('aria-label', t(`ch.${id}.title`));
    applyTranslations(layer);
    applyFace(layer);
    layer.querySelectorAll('[data-act="menu"]').forEach((b) => b.addEventListener('click', () => ctx.requestClose()));
    q('[data-act="start"]').addEventListener('click', () => start());
    layer.querySelectorAll('.wii-btn, .home-btn').forEach((b) => b.addEventListener('pointerenter', () => sfx.hover()));
    q('.page').addEventListener('scroll', onScroll, { passive: true });
  }

  function applyFace(root) {
    if (ctx.miiFace) root.querySelectorAll('img.mii-face').forEach((img) => (img.src = ctx.miiFace));
  }

  function onScroll() {
    const page = q('.page');
    if (!page || state.phase !== 'page') return;
    const H1 = parseFloat(getComputedStyle(page).paddingTop);
    const sc = page.scrollTop;
    q('.banner').style.transform = `translate3d(0, ${-Math.min(sc, H1 + 10)}px, 0)`;
    layer.classList.toggle('is-scrolled', sc > H1 - 70);
  }

  function hideHome() {
    app.style.visibility = 'hidden';
    app.inert = true;
    stage.setVisible(false);
    bubbles.setPaused(true);
  }

  function showHome() {
    app.style.visibility = '';
    app.inert = false;
    stage.setVisible(true);
    bubbles.setPaused(false);
  }

  function renderView({ reveal = true } = {}) {
    state.cleanup?.();
    state.cleanup = null;
    state.io?.disconnect();
    const inner = q('.page-inner');
    inner.innerHTML = '';
    const view = views[state.id];
    state.cleanup = view?.render(inner, ctx) || null;
    applyTranslations(inner);
    applyFace(inner);
    const items = [...inner.querySelectorAll('.reveal')];
    if (!reveal) {
      items.forEach((el) => el.classList.add('is-in'));
      return;
    }
    let first = true;
    state.io = new IntersectionObserver(
      (entries) => {
        const shown = entries.filter((e) => e.isIntersecting);
        shown.forEach((e, k) => {
          e.target.style.setProperty('--d', `${(first ? 160 : 0) + k * 75}ms`);
          e.target.classList.add('is-in');
          state.io.unobserve(e.target);
        });
        first = false;
      },
      { root: q('.page'), threshold: 0.06 },
    );
    requestAnimationFrame(() => items.forEach((el) => state.io?.observe(el)));
  }

  async function open(id, originEl, { direct = false } = {}) {
    if (state.busy || !channelById(id)) return;
    if (state.phase !== 'closed') {
      if (state.id === id) return;
      await close({ instant: true });
    }
    Object.assign(state, { id, phase: 'banner', origin: originEl, busy: true });
    build(id);
    layer.hidden = false;
    onStateChange?.('opening', id);

    if (direct) {
      hideHome();
      layer.animate([{ opacity: 0 }, { opacity: 1 }], { duration: motion(380), easing: 'ease-out' });
      await start({ direct: true });
      state.busy = false;
      onStateChange?.('idle', id);
      return;
    }

    sfx.open();
    stage.mii?.jump(2.4, 0.02);
    const banner = q('.banner');
    const art = q('.banner-art');
    const actions = q('.banner-actions');
    const from = visibleRect(originEl) || fallbackRect();
    const to = art.getBoundingClientRect();
    const s = from.width / to.width;
    const dx = from.left + from.width / 2 - (to.left + to.width / 2);
    const dy = from.top + from.height / 2 - (to.top + to.height / 2);
    const D = motion(640);
    app.style.transformOrigin = `${from.left + from.width / 2}px ${from.top + from.height / 2}px`;
    state.appAnim = app.animate(
      [
        { transform: 'scale(1)', filter: 'blur(0px)', opacity: 1 },
        { transform: 'scale(1.22)', filter: 'blur(8px)', opacity: 0.6 },
      ],
      { duration: D, easing: EASE_ZOOM, fill: 'forwards' },
    );
    const anims = [
      banner.animate([{ clipPath: insetFor(from) }, { clipPath: insetFor(new DOMRect(0, 0, innerWidth, innerHeight), 0) }], {
        duration: D,
        easing: EASE_ZOOM,
      }),
      art.animate([{ transform: `translate(${dx}px, ${dy}px) scale(${s})` }, { transform: 'none' }], { duration: D, easing: EASE_ZOOM }),
      actions.animate([{ opacity: 0, transform: 'translateY(40px) scale(.9)' }, { opacity: 1, transform: 'none' }], {
        duration: motion(520),
        delay: D * 0.5,
        easing: 'cubic-bezier(.34,1.56,.64,1)',
        fill: 'backwards',
      }),
    ];
    await Promise.all(anims.map(done));
    hideHome();
    state.busy = false;
    q('[data-act="start"]')?.focus({ preventScroll: true });
    onStateChange?.('idle', id);
  }

  async function start({ direct = false } = {}) {
    if (state.phase !== 'banner') return;
    state.phase = 'page';
    state.busy = true;
    const banner = q('.banner');
    const art = q('.banner-art');
    const page = q('.page');
    renderView();
    onStateChange?.('page', state.id);

    const first = art.getBoundingClientRect();
    const H0 = layer.clientHeight;
    layer.classList.add('is-page');
    const last = art.getBoundingClientRect();
    const H1 = parseFloat(getComputedStyle(page).paddingTop);

    if (!direct) {
      sfx.start();
      q('.flash').animate([{ opacity: 0 }, { opacity: 0.5 }, { opacity: 0 }], { duration: motion(420), easing: 'ease-out' });
      const s = first.width / last.width;
      const dx = first.left + first.width / 2 - (last.left + last.width / 2);
      const dy = first.top + first.height / 2 - (last.top + last.height / 2);
      const D = motion(720);
      art.animate([{ transform: `translate(${dx}px, ${dy}px) scale(${s})` }, { transform: 'none' }], {
        duration: D,
        easing: 'cubic-bezier(.3,1.18,.4,1)',
      });
      banner.animate([{ clipPath: 'inset(0px 0px 0px 0px)' }, { clipPath: `inset(0px 0px ${H0 - H1}px 0px)` }], {
        duration: D,
        easing: EASE_OUT,
      });
      page.animate([{ opacity: 0, transform: 'translateY(80px)' }, { opacity: 1, transform: 'none' }], {
        duration: D,
        delay: 60,
        easing: EASE_OUT,
        fill: 'backwards',
      });
    }
    page.focus({ preventScroll: true });
    state.busy = false;
    if (!direct) onStateChange?.('idle', state.id);
  }

  async function close({ instant = false } = {}) {
    if (state.phase === 'closed' || state.busy) return;
    state.busy = true;
    const id = state.id;
    const banner = q('.banner');
    const art = q('.banner-art');
    const page = q('.page');
    const target = visibleRect(state.origin) || fallbackRect();

    state.cleanup?.();
    state.cleanup = null;
    state.io?.disconnect();
    showHome();
    stage.lookAtScreen(null);

    if (!instant) {
      sfx.back();
      layer.classList.add('is-closing');
      const D = motion(560);
      // where things are right now (the banner may be scrolled away)
      const bannerShift = banner.style.transform;
      banner.style.transform = '';
      const base = art.getBoundingClientRect();
      const s = target.width / base.width;
      const dx = target.left + target.width / 2 - (base.left + base.width / 2);
      const dy = target.top + target.height / 2 - (base.top + base.height / 2);
      const fromClip =
        state.phase === 'page'
          ? `inset(0px 0px ${layer.clientHeight - parseFloat(getComputedStyle(page).paddingTop)}px 0px round 0px)`
          : 'inset(0px 0px 0px 0px round 0px)';
      const anims = [
        banner.animate(
          [
            { clipPath: fromClip, transform: bannerShift || 'none' },
            { clipPath: insetFor(target), transform: 'none' },
          ],
          { duration: D, easing: EASE_ZOOM, fill: 'forwards' },
        ),
        art.animate([{ transform: 'none' }, { transform: `translate(${dx}px, ${dy}px) scale(${s})` }], {
          duration: D,
          easing: EASE_ZOOM,
          fill: 'forwards',
        }),
        page.animate([{ opacity: 1 }, { opacity: 0 }], { duration: motion(220), easing: 'ease-out', fill: 'forwards' }),
        q('.home-btn').animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, fill: 'forwards' }),
        q('.banner-actions').animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, fill: 'forwards' }),
      ];
      const appIn = app.animate(
        [
          { transform: 'scale(1.22)', filter: 'blur(8px)', opacity: 0.6 },
          { transform: 'scale(1)', filter: 'blur(0px)', opacity: 1 },
        ],
        { duration: D, easing: EASE_ZOOM },
      );
      state.appAnim?.cancel();
      await Promise.all([...anims, appIn].map(done));
      await done(layer.animate([{ opacity: 1 }, { opacity: 0 }], { duration: motion(140), fill: 'forwards' }));
    } else {
      state.appAnim?.cancel();
    }
    state.appAnim = null;
    layer.getAnimations({ subtree: true }).forEach((a) => a.cancel());
    layer.hidden = true;
    layer.innerHTML = '';
    layer.className = 'channel-layer';
    const origin = state.origin;
    Object.assign(state, { id: null, phase: 'closed', origin: null });
    state.busy = false;
    if (origin && document.contains(origin)) origin.focus({ preventScroll: true });
    onStateChange?.('closed', id);
  }

  onLangChange(() => {
    if (state.phase === 'closed') return;
    applyTranslations(layer);
    layer.setAttribute('aria-label', t(`ch.${state.id}.title`));
    if (state.phase === 'page') {
      const page = q('.page');
      const sc = page.scrollTop;
      renderView({ reveal: false });
      page.scrollTop = sc;
    }
  });

  return {
    open,
    start,
    close,
    get state() {
      return state;
    },
  };
}
