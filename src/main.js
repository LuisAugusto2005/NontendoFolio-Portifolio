import './styles/base.css';
import './styles/boot.css';
import './styles/home.css';
import './styles/arts.css';
import './styles/channel.css';
import './styles/views.css';

import { LANGS, setLang, getLang, detectLang, onLangChange, t, L, applyTranslations } from './i18n.js';
import { loadSettings, getSetting, setSetting, onSettingChange } from './settings.js';
import { profile } from './content.js';
import { sfx, music, unlockAudio } from './audio.js';
import { Stage } from './three/stage.js';
import { initCursor } from './ui/cursor.js';
import { initBubbles } from './ui/bubbles.js';
import { ripple } from './ui/fx.js';
import { createSpeech } from './ui/speech.js';
import { initBottomBar } from './ui/bottombar.js';
import { runBoot } from './ui/boot.js';
import { initMenu } from './ui/menu.js';
import { createChannels } from './ui/channel.js';
import { channelById } from './ui/arts.js';
import { displayName, firstName } from './views/util.js';
import * as about from './views/about.js';
import * as projects from './views/projects.js';
import * as skills from './views/skills.js';
import * as journey from './views/journey.js';
import * as contact from './views/contact.js';
import * as shop from './views/shop.js';
import * as settingsView from './views/settings.js';

const $ = (sel) => document.querySelector(sel);
const MODEL_URL = `${import.meta.env.BASE_URL}models/MyCoolMii.glb`;
const SESSION_KEY = 'nontendofolio.booted';
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ── settings & language ────────────────────────────────────────────────────
loadSettings();
setLang(getSetting('lang') || detectLang());
const syncMotionClass = () => document.documentElement.classList.toggle('reduce-motion', !!getSetting('reducedMotion'));
syncMotionClass();

const app = $('#app');
const bootEl = $('#boot');
let booted = false;

// ── 3D stage ──────────────────────────────────────────────────────────────
const stage = new Stage();
const homeHost = $('#stage-host');
stage.mount(homeHost, 'home');
stage.start();

const progressListeners = new Set();
const ctx = {
  stage,
  homeHost,
  miiFace: null,
  requestClose: () => requestClose(),
  replayIntro: () => replayIntro(),
};

const loaded = stage
  .load(MODEL_URL, (p) => progressListeners.forEach((fn) => fn(p)))
  .then(() => {
    const face = stage.snapshot({ kind: 'head', size: 256 });
    ctx.miiFace = face;
    document.querySelectorAll('img.mii-face').forEach((img) => (img.src = face));
    const icon = document.querySelector('link[rel="icon"]');
    if (icon && face) {
      icon.type = 'image/png';
      icon.href = face;
    }
    stage.mii.root.position.set(-3.2, 0, 0.5);
  })
  .catch((err) => {
    console.error('Could not load the Mii model', err);
  });

// ── UI modules ────────────────────────────────────────────────────────────
initCursor($('#cursor'));
const bubbles = initBubbles($('#bubbles'));
const speech = createSpeech($('#speech'), stage);
initBottomBar($('.bottombar'));

const views = { about, projects, skills, journey, contact, shop, settings: settingsView };
const channels = createChannels({
  layer: $('#channel-layer'),
  app,
  stage,
  bubbles,
  views,
  ctx,
  onStateChange,
});

const menu = initMenu($('#channel-grid'), {
  stage,
  speech,
  onOpen: (id, el) => {
    sfx.select();
    channels.open(id, el);
  },
});

document.querySelectorAll('[data-open]').forEach((btn) => {
  btn.addEventListener('click', () => {
    sfx.select();
    channels.open(btn.dataset.open, btn);
  });
});

document.querySelectorAll('.icon-btn, .round-btn, .status-user').forEach((el) => el.addEventListener('pointerenter', () => sfx.hover()));

// ── status bar: language + sound toggles ─────────────────────────────────
const langSwitch = $('.lang-switch');
function renderLangSwitch() {
  langSwitch.innerHTML = '';
  for (const l of LANGS) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = l.short;
    b.lang = l.locale;
    b.setAttribute('aria-label', l.label);
    b.setAttribute('aria-pressed', String(l.id === getLang()));
    b.addEventListener('pointerenter', () => sfx.hover());
    b.addEventListener('click', () => {
      if (l.id === getLang()) return;
      sfx.select();
      setSetting('lang', l.id);
      setLang(l.id);
    });
    langSwitch.appendChild(b);
  }
}

function syncToggles() {
  document.querySelectorAll('[data-toggle]').forEach((b) => b.setAttribute('aria-pressed', String(!!getSetting(b.dataset.toggle))));
}

document.querySelectorAll('[data-toggle]').forEach((b) =>
  b.addEventListener('click', () => {
    const key = b.dataset.toggle;
    const on = !getSetting(key);
    unlockAudio();
    setSetting(key, on);
    sfx.toggle(on);
  }),
);

onSettingChange((key) => {
  syncToggles();
  if (key === 'reducedMotion') syncMotionClass();
});

// ── text that depends on language/profile ────────────────────────────────
function fillProfile() {
  document.querySelectorAll('[data-profile="name"]').forEach((el) => (el.textContent = displayName()));
  document.querySelectorAll('[data-profile="role"]').forEach((el) => (el.textContent = L(profile.role)));
  document.title = t('meta.title', { name: displayName() });
}

function refreshTexts() {
  applyTranslations(app);
  fillProfile();
  renderLangSwitch();
  menu.updateLabels();
  bootEl._refresh?.();
}

refreshTexts();
syncToggles();

onLangChange(() => {
  refreshTexts();
  if (booted && channels.state.phase === 'closed') {
    speech.say(t('mii.lang'), { priority: 2 });
    stage.mii?.play('nod');
  }
});

// ── Mii reactions ────────────────────────────────────────────────────────
stage.onFrame({
  onPoke() {
    sfx.boing();
    stage.poke();
    speech.say(pick(t('mii.poke')), { priority: 2 });
  },
  onPlay() {
    if (channels.state.phase === 'closed') speech.say(t('mii.idle'), { priority: 0, hold: 3200 });
  },
  onWake() {
    if (channels.state.phase === 'closed') speech.say(t('mii.wake'), { priority: 2 });
  },
});

// ── routing (#/channel deep links + browser back) ────────────────────────
let pushed = false;
const parseHash = () => {
  const id = location.hash.replace(/^#\/?/, '');
  return channelById(id) ? id : null;
};

function onStateChange(phase, id) {
  if (phase === 'opening') {
    speech.hide();
    stage.lookAtScreen(null);
  }
  if (phase === 'page') {
    const hash = `#/${id}`;
    if (location.hash !== hash) {
      history.pushState({ ch: id }, '', hash);
      pushed = true;
    }
  }
  if (phase === 'closed') {
    if (location.hash === `#/${id}`) history.replaceState(null, '', location.pathname + location.search);
    pushed = false;
    setTimeout(() => {
      if (channels.state.phase !== 'closed') return;
      stage.mii?.play(Math.random() < 0.5 ? 'wave' : 'cheer');
      if (Math.random() < 0.6) speech.say(pick(t('mii.back')), { priority: 1 });
    }, 420);
  }
  // a navigation may have arrived while we were animating
  if (phase === 'closed' || phase === 'idle') queueMicrotask(syncRoute);
}

function requestClose() {
  if (pushed && history.state?.ch) history.back();
  else channels.close();
}

/** Make the open channel match the URL hash (deep links, back/forward). */
function syncRoute() {
  const st = channels.state;
  if (!booted || st.busy) return;
  const want = parseHash();
  if (want) {
    if (st.phase === 'closed') channels.open(want, menu.tileFor(want), { direct: true });
    else if (st.id !== want) channels.close({ instant: true });
  } else if (st.phase === 'page') {
    pushed = false;
    channels.close();
  }
}

window.addEventListener('popstate', syncRoute);

// ── global input: keyboard shortcuts, ripples, popping bubbles ───────────
const INTERACTIVE = 'a, button, input, textarea, select, label, .tile, .channel-layer';

window.addEventListener('keydown', (e) => {
  if (!booted) return;
  const typing = e.target.closest?.('input, textarea, select, [contenteditable]');
  if (typing) return;
  const open = channels.state.phase !== 'closed';
  if (open && (e.key === 'Escape' || e.key === 'b' || e.key === 'B' || e.key === 'Backspace')) {
    e.preventDefault();
    requestClose();
  } else if (open && channels.state.phase === 'banner' && (e.key === 'a' || e.key === 'A')) {
    e.preventDefault();
    channels.start();
  }
  stage.markActivity();
});

window.addEventListener('pointerdown', (e) => {
  if (!booted) return;
  ripple(e.clientX, e.clientY);
  if (channels.state.phase !== 'closed') return;
  if (e.target.closest(INTERACTIVE)) return;
  if (stage.hitMii(e.clientX, e.clientY)) return;
  if (bubbles.popAt(e.clientX, e.clientY)) sfx.pop();
});

// ── boot & intro ─────────────────────────────────────────────────────────
function startIntro() {
  booted = true;
  app.classList.remove('is-booting');
  menu.intro();
  music.start();
  const deepLink = parseHash();
  setTimeout(() => {
    stage.enter(() => {
      if (channels.state.phase === 'closed') speech.say(t('mii.hello', { name: firstName() }), { priority: 2, hold: 4600 });
    });
  }, 450);
  if (deepLink) setTimeout(syncRoute, 250);
}

async function boot({ force = false } = {}) {
  const skip = !force && sessionStorage.getItem(SESSION_KEY) === '1';
  if (skip) {
    bootEl.hidden = true;
    await loaded;
    // audio needs a gesture: start it on the first interaction
    const unlock = () => {
      unlockAudio();
      music.start();
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
    startIntro();
    return;
  }
  await runBoot(bootEl, { loaded, onProgress: (fn) => progressListeners.add(fn) });
  try {
    sessionStorage.setItem(SESSION_KEY, '1');
  } catch {
    /* ignore */
  }
  startIntro();
}

async function replayIntro() {
  await channels.close({ instant: true });
  history.replaceState(null, '', location.pathname + location.search);
  music.stop();
  speech.hide();
  booted = false;
  app.classList.add('is-booting');
  if (stage.mii) {
    stage.mii.setPlaying(false);
    stage.mii.walkTarget = null;
    stage.mii.root.position.set(-3.2, 0, 0.5);
  }
  boot({ force: true });
}

boot();

if (import.meta.env.DEV) window.__nf = { channels, stage, menu, speech };
