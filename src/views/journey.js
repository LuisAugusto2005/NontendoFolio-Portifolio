import { L, t } from '../i18n.js';
import { journey } from '../content.js';
import { esc } from './util.js';

export function render(root) {
  root.innerHTML = `
    <div class="page-head reveal">
      <div>
        <h2 class="page-title" id="page-title">${esc(t('ch.journey.title'))}</h2>
        <p class="page-sub">${esc(t('journey.subtitle'))}</p>
      </div>
    </div>
    <ol class="board">
      ${journey
        .map(
          (j, i) => `
        <li class="note reveal ${i % 2 ? 'is-right' : 'is-left'}" style="--c:${esc(j.color || '#22a7ee')}">
          <span class="note-node" aria-hidden="true">${esc(j.icon || '★')}</span>
          <article class="note-card">
            <i class="note-tape" aria-hidden="true"></i>
            <p class="note-when">${esc(L(j.when))}${j.now ? ` <span class="note-now">${esc(t('journey.now'))}</span>` : ''}</p>
            <h3 class="note-title">${esc(L(j.title))}</h3>
            <p class="note-place">${esc(L(j.place))}</p>
            <p class="note-text">${esc(L(j.text))}</p>
          </article>
        </li>`,
        )
        .join('')}
    </ol>`;
}
