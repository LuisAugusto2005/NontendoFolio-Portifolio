import { L, t } from '../i18n.js';
import { projects } from '../content.js';
import { sfx } from '../audio.js';
import { motion } from '../settings.js';
import { esc } from './util.js';
import { done } from '../ui/fx.js';

const coverHTML = (p) => `
  <span class="case-band band--${esc(p.band || 'wii')}"><b>${esc(p.bandLabel || '')}</b></span>
  <span class="case-cover" style="--from:${esc(p.cover?.from || '#9fe0ff')};--to:${esc(p.cover?.to || '#1679d6')}">
    ${p.image ? `<img src="${esc(p.image)}" alt="" loading="lazy" />` : `<span class="case-glyph">${esc(p.cover?.glyph || '★')}</span>`}
    <span class="case-title">${esc(L(p.title))}</span>
  </span>
  <span class="case-gloss"></span>`;

export function render(root) {
  root.innerHTML = `
    <div class="page-head reveal">
      <div>
        <h2 class="page-title" id="page-title">${esc(t('ch.projects.title'))}</h2>
        <p class="page-sub">${esc(t('projects.subtitle'))}</p>
      </div>
    </div>
    <div class="shelf reveal">
      <div class="shelf-row">
        ${projects
          .map(
            (p, i) => `
          <button class="case" type="button" data-index="${i}" aria-label="${esc(t('projects.open'))}: ${esc(L(p.title))}">
            <span class="case-box">${coverHTML(p)}</span>
            ${p.sample ? `<span class="case-sample">${esc(t('projects.sample'))}</span>` : ''}
            <span class="case-label">${esc(L(p.title))}</span>
          </button>`,
          )
          .join('')}
      </div>
      <div class="shelf-board" aria-hidden="true"></div>
    </div>
    <div class="project-modal" hidden></div>`;

  // the modal lives on the channel layer so it stacks above the banner header
  const modal = root.querySelector('.project-modal');
  (root.closest('.channel-layer') || document.body).appendChild(modal);
  let openIndex = -1;
  let originEl = null;

  root.querySelectorAll('.case').forEach((btn) => {
    btn.addEventListener('pointerenter', () => sfx.hover());
    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      btn.style.setProperty('--ry', `${px * 22}deg`);
      btn.style.setProperty('--rx', `${-py * 14}deg`);
    });
    btn.addEventListener('pointerleave', () => {
      btn.style.setProperty('--ry', '0deg');
      btn.style.setProperty('--rx', '0deg');
    });
    btn.addEventListener('click', () => openProject(+btn.dataset.index, btn));
  });

  async function openProject(i, btn) {
    const p = projects[i];
    openIndex = i;
    originEl = btn;
    sfx.select();
    const links = [
      p.links?.live && `<a class="wii-btn wii-btn--blue wii-btn--small" href="${esc(p.links.live)}" target="_blank" rel="noopener">${esc(t('projects.live'))} ↗</a>`,
      p.links?.code && `<a class="wii-btn wii-btn--small" href="${esc(p.links.code)}" target="_blank" rel="noopener">${esc(t('projects.code'))} ↗</a>`,
    ]
      .filter(Boolean)
      .join('');
    modal.innerHTML = `
      <div class="pm-backdrop" data-close></div>
      <div class="pm-panel glass" role="dialog" aria-modal="true" aria-labelledby="pm-title">
        <button class="pm-close" type="button" data-close aria-label="${esc(t('projects.close'))}">×</button>
        <div class="pm-visual">
          <div class="pm-disc" style="--from:${esc(p.cover?.from || '#9fe0ff')};--to:${esc(p.cover?.to || '#1679d6')}"><span>${esc(p.cover?.glyph || '★')}</span></div>
          <div class="case-box pm-case">${coverHTML(p)}</div>
        </div>
        <div class="pm-info">
          <span class="pm-band band--${esc(p.band || 'wii')}">${esc(p.bandLabel || '')}${p.sample ? ` · ${esc(t('projects.sample'))}` : ''}</span>
          <h3 class="pm-title" id="pm-title">${esc(L(p.title))}</h3>
          <p class="pm-summary">${esc(L(p.summary))}</p>
          <dl class="pm-meta">
            <div><dt>${esc(t('projects.year'))}</dt><dd>${esc(L(p.year))}</dd></div>
            <div><dt>${esc(t('projects.role'))}</dt><dd>${esc(L(p.role))}</dd></div>
          </dl>
          <p class="pm-tech-label">${esc(t('projects.tech'))}</p>
          <ul class="pm-tags">${(p.tags || []).map((tag) => `<li>${esc(tag)}</li>`).join('')}</ul>
          ${links ? `<div class="pm-links">${links}</div>` : ''}
        </div>
      </div>`;
    modal.hidden = false;
    modal.querySelectorAll('[data-close]').forEach((el) => el.addEventListener('click', closeProject));

    // FLIP the shelf case into the modal
    const panel = modal.querySelector('.pm-panel');
    const bigCase = modal.querySelector('.pm-case');
    const from = btn.querySelector('.case-box').getBoundingClientRect();
    const to = bigCase.getBoundingClientRect();
    const s = from.width / to.width;
    const D = motion(560);
    modal.querySelector('.pm-backdrop').animate([{ opacity: 0 }, { opacity: 1 }], { duration: D * 0.6, fill: 'backwards' });
    panel.animate([{ opacity: 0, transform: 'scale(.94)' }, { opacity: 1, transform: 'none' }], { duration: D * 0.7, easing: 'cubic-bezier(.22,1,.36,1)' });
    bigCase.animate(
      [
        {
          transform: `translate(${from.left + from.width / 2 - (to.left + to.width / 2)}px, ${from.top + from.height / 2 - (to.top + to.height / 2)}px) scale(${s})`,
        },
        { transform: 'none' },
      ],
      { duration: D, easing: 'cubic-bezier(.3,1.2,.4,1)' },
    );
    modal.querySelector('.pm-disc').animate(
      [
        { transform: 'translateX(0) rotate(0deg)', opacity: 0 },
        { transform: 'translateX(0) rotate(0deg)', opacity: 1, offset: 0.3 },
        { transform: `translateX(${Math.round(to.width * 0.46)}px) rotate(300deg)`, opacity: 1 },
      ],
      { duration: motion(900), delay: D * 0.6, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'both' },
    );
    modal.querySelectorAll('.pm-info > *').forEach((el, k) =>
      el.animate([{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }], {
        duration: motion(420),
        delay: D * 0.45 + k * 50,
        easing: 'cubic-bezier(.22,1,.36,1)',
        fill: 'backwards',
      }),
    );
    setTimeout(() => sfx.sparkle(), D * 0.7);
    modal.querySelector('.pm-close').focus({ preventScroll: true });
  }

  async function closeProject() {
    if (openIndex < 0) return;
    openIndex = -1;
    sfx.back();
    await done(modal.animate([{ opacity: 1 }, { opacity: 0 }], { duration: motion(220), easing: 'ease-in' }));
    modal.hidden = true;
    modal.innerHTML = '';
    originEl?.focus({ preventScroll: true });
  }

  const onKey = (e) => {
    if (e.key === 'Escape' && openIndex >= 0) {
      e.stopImmediatePropagation();
      closeProject();
    }
  };
  window.addEventListener('keydown', onKey, true);
  return () => {
    window.removeEventListener('keydown', onKey, true);
    modal.remove();
  };
}
