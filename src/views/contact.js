import { L, t } from '../i18n.js';
import { profile, friends } from '../content.js';
import { sfx } from '../audio.js';
import { toast, sparkles, done } from '../ui/fx.js';
import { motion } from '../settings.js';
import { esc, displayName } from './util.js';

const ICONS = {
  github:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2z"/></svg>',
  linkedin:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.75h4v11H3zM9.5 9.75h3.8v1.5h.06c.53-1 1.83-2.06 3.77-2.06 4.03 0 4.77 2.65 4.77 6.1v5.46h-4v-4.84c0-1.16-.02-2.64-1.61-2.64-1.61 0-1.86 1.26-1.86 2.56v4.92h-4z"/></svg>',
  email:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6.5A1.5 1.5 0 0 1 4.5 5h15A1.5 1.5 0 0 1 21 6.5v11a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5zm2 .9v.3l7 4.9 7-4.9v-.3z"/></svg>',
};

export function render(root) {
  const name = displayName();
  const list = friends.map((f) => ({ ...f, url: f.id === 'email' && profile.email ? `mailto:${profile.email}` : f.url }));

  root.innerHTML = `
    <div class="page-head reveal">
      <div>
        <h2 class="page-title" id="page-title">${esc(t('ch.contact.title'))}</h2>
        <p class="page-sub">${esc(t('ch.contact.desc'))}</p>
      </div>
    </div>
    <div class="contact-layout">
      <form class="letter glass reveal" novalidate>
        <h3 class="card-title">${esc(t('contact.letterTitle'))}</h3>
        <div class="letter-paper">
          <p class="letter-to"><span>${esc(t('contact.to'))}:</span> <strong>${esc(name)}</strong></p>
          <label class="letter-field">
            <span>${esc(t('contact.from'))}</span>
            <input name="from" type="text" autocomplete="name" maxlength="80" />
          </label>
          <label class="letter-field">
            <span>${esc(t('contact.message'))}</span>
            <textarea name="msg" rows="6" maxlength="2000" placeholder="${esc(t('contact.placeholder'))}"></textarea>
          </label>
        </div>
        <div class="letter-actions">
          <button class="wii-btn wii-btn--blue" type="submit">
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="currentColor"><path d="M2.5 11.2 20.6 3.6c.8-.3 1.5.4 1.2 1.2l-7.6 18.1c-.3.8-1.5.8-1.8 0l-2.3-6.3-6.3-2.3c-.8-.3-.8-1.5 0-1.8zm7.4 4.7 1.6 4.3 5.5-13.2z"/></svg>
            ${esc(t('contact.send'))}
          </button>
        </div>
        <div class="letter-fly" aria-hidden="true">
          <svg viewBox="0 0 64 44"><rect x="2" y="2" width="60" height="40" rx="6" fill="#fff" stroke="#9fd8f3" stroke-width="3"/><path d="M4 6 32 26 60 6" fill="none" stroke="#9fd8f3" stroke-width="3" stroke-linejoin="round"/><circle cx="32" cy="28" r="6" fill="#ff6b81"/></svg>
        </div>
      </form>

      <section class="friends glass reveal">
        <h3 class="card-title">${esc(t('contact.friends'))}</h3>
        <ul class="friend-list">
          ${list
            .map(
              (f) => `
            <li class="friend" style="--c:${esc(f.color)}">
              <span class="friend-icon">${ICONS[f.id] || '★'}</span>
              <div class="friend-text">
                <strong>${esc(f.label)}</strong>
                <small>${esc(L(f.handle))}</small>
                <small class="friend-code">${esc(t('contact.friendCode'))}: <b>${esc(f.code)}</b></small>
              </div>
              ${
                f.url
                  ? `<a class="wii-btn wii-btn--small" href="${esc(f.url)}" ${f.url.startsWith('mailto:') ? '' : 'target="_blank" rel="noopener"'}>${esc(t(f.url.startsWith('mailto:') ? 'contact.write' : 'contact.visit'))}</a>`
                  : ''
              }
            </li>`,
            )
            .join('')}
        </ul>
      </section>
    </div>`;

  const form = root.querySelector('.letter');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const from = form.from.value.trim();
    const msg = form.msg.value.trim();
    if (!msg) {
      sfx.error();
      form.animate(
        [{ transform: 'translateX(0)' }, { transform: 'translateX(-10px)' }, { transform: 'translateX(9px)' }, { transform: 'translateX(-5px)' }, { transform: 'none' }],
        { duration: 380 },
      );
      toast(t('contact.empty'));
      form.msg.focus();
      return;
    }
    if (!profile.email) {
      sfx.error();
      toast(t('contact.noEmail'));
      return;
    }
    // fold the letter into an envelope and send it flying
    sfx.whoosh();
    const paper = form.querySelector('.letter-paper');
    const fly = form.querySelector('.letter-fly');
    await done(
      paper.animate(
        [
          { transform: 'none', opacity: 1 },
          { transform: 'scale(.6, .2) rotate(-3deg)', opacity: 0.4 },
        ],
        { duration: motion(380), easing: 'cubic-bezier(.5,0,.75,0)' },
      ),
    );
    paper.style.opacity = '0';
    fly.style.display = 'block';
    const r = fly.getBoundingClientRect();
    await done(
      fly.animate(
        [
          { transform: 'translate(0,0) scale(.6) rotate(0deg)', opacity: 1 },
          { transform: 'translate(0,-30px) scale(1) rotate(-8deg)', opacity: 1, offset: 0.3 },
          { transform: `translate(${innerWidth - r.left}px, ${-r.top - 120}px) scale(.5) rotate(18deg)`, opacity: 0.2 },
        ],
        { duration: motion(900), easing: 'cubic-bezier(.4,0,.2,1)' },
      ),
    );
    fly.style.display = '';
    sfx.sparkle();
    const sr = form.getBoundingClientRect();
    sparkles(sr.right - 40, sr.top + 40, 10, 60);
    toast(t('contact.sent'));
    const subject = encodeURIComponent(t('contact.subject'));
    const body = encodeURIComponent(`${msg}${from ? `\n\n— ${from}` : ''}`);
    window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
    paper.animate([{ opacity: 0, transform: 'translateY(20px)' }, { opacity: 1, transform: 'none' }], { duration: motion(400), easing: 'ease-out' });
    paper.style.opacity = '';
    form.reset();
  });
}
