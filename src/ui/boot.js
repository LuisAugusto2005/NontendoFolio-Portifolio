// "Health & Safety" boot screen. Resolves when the visitor presses A / clicks
// (which also unlocks Web Audio), but only once the 3D model has loaded.
import { LANGS, getLang, setLang, t, applyTranslations } from '../i18n.js';
import { getSetting, setSetting } from '../settings.js';
import { unlockAudio, sfx } from '../audio.js';

export function runBoot(el, { loaded, onProgress }) {
  const langs = el.querySelector('.boot-langs');
  const soundBtn = el.querySelector('.boot-sound');
  const loading = el.querySelector('.boot-loading');
  const pct = el.querySelector('.boot-pct');
  const cont = el.querySelector('.boot-continue');
  const touch = matchMedia('(hover: none)').matches;
  let ready = false;

  el.hidden = false;
  el.classList.remove('is-leaving');

  function renderPress() {
    if (touch) cont.textContent = t('boot.tap');
    else cont.innerHTML = t('boot.press').replace('{A}', '<span class="a-btn" aria-hidden="true">A</span>');
    cont.setAttribute('aria-label', t('boot.press').replace('{A}', 'A'));
  }

  function renderLangs() {
    langs.innerHTML = '';
    for (const l of LANGS) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip';
      b.lang = l.locale;
      b.textContent = l.label;
      b.setAttribute('aria-pressed', String(l.id === getLang()));
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        setSetting('lang', l.id);
        setLang(l.id);
      });
      langs.appendChild(b);
    }
  }

  const syncSound = () => {
    const on = getSetting('sfx') || getSetting('music');
    soundBtn.setAttribute('aria-pressed', String(on));
  };

  soundBtn.onclick = (e) => {
    e.stopPropagation();
    const on = !(getSetting('sfx') || getSetting('music'));
    setSetting('sfx', on);
    setSetting('music', on);
    syncSound();
    unlockAudio();
    if (on) sfx.toggle(true);
  };

  const refresh = () => {
    applyTranslations(el);
    renderLangs();
    renderPress();
  };
  refresh();
  syncSound();

  onProgress((p) => {
    pct.textContent = `${Math.round(p * 100)}%`;
  });

  return new Promise((resolve) => {
    loaded.then(() => {
      ready = true;
      loading.hidden = true;
      cont.hidden = false;
      renderPress();
      cont.focus({ preventScroll: true });
    });

    const go = () => {
      if (!ready) return;
      cleanup();
      unlockAudio();
      sfx.boot();
      el.classList.add('is-leaving');
      setTimeout(() => {
        el.hidden = true;
      }, 850);
      resolve();
    };
    const onKey = (e) => {
      if (['Enter', ' ', 'a', 'A'].includes(e.key) && !e.target.closest?.('.boot-options')) {
        e.preventDefault();
        go();
      }
    };
    const onClick = (e) => {
      if (e.target.closest('.boot-options')) return;
      go();
    };
    el.addEventListener('click', onClick);
    window.addEventListener('keydown', onKey);
    const cleanup = () => {
      el.removeEventListener('click', onClick);
      window.removeEventListener('keydown', onKey);
    };
    // language changes while on the boot screen
    el._refresh = refresh;
  });
}
