import { LANGS, getLang, setLang, t } from '../i18n.js';
import { getSetting, setSetting } from '../settings.js';
import { sfx, unlockAudio } from '../audio.js';
import { esc } from './util.js';

const ICON = {
  music: '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M9 18.5a2.5 2.5 0 1 1-2.5-2.5c.4 0 .7.05 1 .2V5.5l11-2.5v12a2.5 2.5 0 1 1-2.5-2.5c.4 0 .7.05 1 .2V7.4L9 9.2z"/></svg>',
  sfx: '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" stroke="currentColor"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15 8.5c1.6 1.8 1.6 5.2 0 7M17.6 6c2.9 3.3 2.9 8.7 0 12" fill="none" stroke-width="2" stroke-linecap="round"/></svg>',
  cursor: '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M9 2.5a1.8 1.8 0 0 1 1.8 1.8v6.2l5.6 1c1.6.3 2.6 1.7 2.4 3.3l-.7 4.6A3.2 3.2 0 0 1 15 22h-4.3a3 3 0 0 1-2.4-1.2L4.6 16a1.6 1.6 0 0 1 2.3-2.2l.3.3V4.3A1.8 1.8 0 0 1 9 2.5z"/></svg>',
};

const TOGGLES = [
  { key: 'music', label: 'settings.music', icon: ICON.music },
  { key: 'sfx', label: 'settings.sfx', icon: ICON.sfx },
  { key: 'cursor', label: 'settings.cursor', icon: ICON.cursor },
];

export function render(root, ctx) {
  const reduced = getSetting('reducedMotion');
  root.innerHTML = `
    <div class="page-head reveal">
      <div>
        <h2 class="page-title" id="page-title">${esc(t('ch.settings.title'))}</h2>
        <p class="page-sub">${esc(t('ch.settings.desc'))}</p>
      </div>
    </div>
    <div class="settings-list">
      <div class="setting-row glass reveal">
        <span class="setting-icon" aria-hidden="true">あ</span>
        <span class="setting-label" id="set-lang">${esc(t('settings.language'))}</span>
        <div class="seg" role="group" aria-labelledby="set-lang">
          ${LANGS.map((l) => `<button type="button" lang="${l.locale}" data-lang="${l.id}" aria-pressed="${l.id === getLang()}">${esc(l.label)}</button>`).join('')}
        </div>
      </div>
      ${TOGGLES.map(
        (tg) => `
      <div class="setting-row glass reveal">
        <span class="setting-icon" aria-hidden="true">${tg.icon}</span>
        <span class="setting-label" id="set-${tg.key}">${esc(t(tg.label))}</span>
        <button class="switch" type="button" data-key="${tg.key}" aria-labelledby="set-${tg.key}" aria-pressed="${!!getSetting(tg.key)}">
          <span class="switch-text">${esc(t(getSetting(tg.key) ? 'settings.on' : 'settings.off'))}</span><i class="knob"></i>
        </button>
      </div>`,
      ).join('')}
      <div class="setting-row glass reveal">
        <span class="setting-icon" aria-hidden="true">✦</span>
        <span class="setting-label" id="set-motion">${esc(t('settings.motion'))}</span>
        <div class="seg" role="group" aria-labelledby="set-motion">
          <button type="button" data-motion="full" aria-pressed="${!reduced}">${esc(t('settings.motion.full'))}</button>
          <button type="button" data-motion="reduced" aria-pressed="${reduced}">${esc(t('settings.motion.reduced'))}</button>
        </div>
      </div>
      <div class="setting-actions reveal">
        <button class="wii-btn" type="button" data-act="replay">${esc(t('settings.replay'))}</button>
      </div>
      <section class="glass card credits reveal">
        <h3 class="card-title">${esc(t('settings.credits'))}</h3>
        <p>${esc(t('settings.creditsText'))}</p>
      </section>
    </div>`;

  root.querySelectorAll('[data-lang]').forEach((b) =>
    b.addEventListener('click', () => {
      sfx.select();
      setSetting('lang', b.dataset.lang);
      setLang(b.dataset.lang);
    }),
  );

  root.querySelectorAll('.switch').forEach((b) =>
    b.addEventListener('click', () => {
      const key = b.dataset.key;
      const on = !getSetting(key);
      unlockAudio();
      setSetting(key, on);
      b.setAttribute('aria-pressed', String(on));
      b.querySelector('.switch-text').textContent = t(on ? 'settings.on' : 'settings.off');
      sfx.toggle(on);
    }),
  );

  root.querySelectorAll('[data-motion]').forEach((b) =>
    b.addEventListener('click', () => {
      const r = b.dataset.motion === 'reduced';
      setSetting('reducedMotion', r);
      root.querySelectorAll('[data-motion]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      sfx.toggle(!r);
    }),
  );

  root.querySelector('[data-act="replay"]').addEventListener('click', () => ctx.replayIntro());
}
