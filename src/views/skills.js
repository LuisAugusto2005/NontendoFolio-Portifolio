import { L, t } from '../i18n.js';
import { skills } from '../content.js';
import { sfx } from '../audio.js';
import { sparkles } from '../ui/fx.js';
import { esc } from './util.js';

export function render(root) {
  root.innerHTML = `
    <div class="page-head reveal">
      <div>
        <h2 class="page-title" id="page-title">${esc(t('ch.skills.title'))}</h2>
        <p class="page-sub">${esc(t('skills.hint'))}</p>
      </div>
    </div>
    <div class="skills-layout">
      <section class="glass card reveal">
        <h3 class="card-title">${esc(t('skills.meters'))}</h3>
        <ul class="meters">
          ${skills.meters
            .map(
              (m) => `
            <li class="meter" style="--c:${esc(m.color)};--lvl:${m.level}">
              <div class="meter-top"><strong>${esc(L(m.label))}</strong><small>${esc(t(`skills.level.${m.level}`))}</small></div>
              <div class="meter-track" role="meter" aria-valuemin="0" aria-valuemax="5" aria-valuenow="${m.level}" aria-label="${esc(L(m.label))}">
                ${[1, 2, 3, 4, 5].map((n) => `<i class="${n <= m.level ? 'on' : ''}" style="--n:${n}"></i>`).join('')}
              </div>
            </li>`,
            )
            .join('')}
        </ul>
      </section>
      <section class="glass card reveal">
        <h3 class="card-title">${esc(t('skills.badges'))}</h3>
        <ul class="badge-grid">
          ${skills.badges
            .map(
              (b, i) => `
            <li><button class="skill-badge" type="button" style="--c:${esc(b.color)};--i:${i};--gs:${[...b.glyph].length > 3 ? 15 : [...b.glyph].length > 2 ? 18 : 22}px">
              <span class="skill-badge-disc"><b>${esc(b.glyph)}</b></span>
              <span class="skill-badge-name">${esc(b.name)}</span>
            </button></li>`,
            )
            .join('')}
        </ul>
      </section>
    </div>`;

  root.querySelectorAll('.skill-badge').forEach((b) => {
    b.addEventListener('pointerenter', () => sfx.tick());
    b.addEventListener('click', () => {
      sfx.coin();
      const r = b.querySelector('.skill-badge-disc').getBoundingClientRect();
      sparkles(r.left + r.width / 2, r.top + r.height / 2, 10, 56);
      b.classList.remove('is-popped');
      void b.offsetWidth;
      b.classList.add('is-popped');
    });
  });
}
