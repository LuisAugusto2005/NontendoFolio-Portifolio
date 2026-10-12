import { L, t, getLang } from '../i18n.js';
import { profile } from '../content.js';
import { esc, displayName } from './util.js';

export function render(root, ctx) {
  const name = displayName();
  const fields = [
    { label: t('about.from'), value: L(profile.location) },
    ...profile.card.map((f) => ({ label: L(f.label), value: L(f.value), swatch: f.swatch })),
  ];

  root.innerHTML = `
    <div class="about-grid">
      <div class="about-turntable glass reveal">
        <div class="about-stage" data-hover></div>
        <div class="turntable-floor" aria-hidden="true"></div>
        <p class="drag-hint"><span aria-hidden="true">⟲</span> ${esc(t('about.drag'))}</p>
      </div>

      <div class="about-side">
        <article class="mii-card reveal" style="--fav:${esc(profile.card.find((c) => c.swatch)?.swatch || '#22a7ee')}">
          <header class="mii-card-head">
            <span class="mii-card-face"><img class="mii-face" alt="" /></span>
            <div>
              <p class="mii-card-kicker">${esc(t('about.card'))}</p>
              <h2 class="mii-card-name" id="page-title">${esc(name)}</h2>
              <p class="mii-card-role">${esc(L(profile.role))}</p>
            </div>
          </header>
          <dl class="mii-card-fields">
            ${fields
              .map(
                (f) => `<div class="field"><dt>${esc(f.label)}</dt><dd>${f.swatch ? `<i class="swatch" style="background:${esc(f.swatch)}"></i>` : ''}${esc(f.value)}</dd></div>`,
              )
              .join('')}
          </dl>
          <div class="mii-card-greeting">
            <span class="greeting-label">${esc(t('about.greeting'))}</span>
            <p>“${esc(L(profile.greeting))}”</p>
          </div>
        </article>
      </div>

      <section class="glass card about-bio reveal">
        <h3 class="card-title">${esc(t('about.bioTitle'))}</h3>
        ${L(profile.bio)
          .map((p) => `<p>${esc(p)}</p>`)
          .join('')}
      </section>

      <section class="glass card about-langs reveal">
        <h3 class="card-title">${esc(t('about.languages'))}</h3>
        <ul class="lang-list">
          ${profile.spokenLanguages
            .map(
              (l, i) =>
                `<li><span class="lang-flag f${i}" aria-hidden="true"></span><strong>${esc(L(l.label))}</strong><small>${esc(L(l.level))}</small></li>`,
            )
            .join('')}
        </ul>
      </section>
    </div>`;

  root.querySelectorAll('.mii-face').forEach((img) => {
    if (ctx.miiFace) img.src = ctx.miiFace;
  });

  // Bring the live 3D Mii into the turntable.
  const host = root.querySelector('.about-stage');
  ctx.stage.mount(host, 'profile');
  ctx.stage.setVisible(true);
  ctx.stage.mii?.play(getLang() === 'ja' ? 'nod' : 'wave');

  return () => {
    ctx.stage.mount(ctx.homeHost, 'home');
  };
}
