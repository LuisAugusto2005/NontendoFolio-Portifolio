// Wii-menu channel grid.
import { CHANNELS, createArt } from './arts.js';
import { t } from '../i18n.js';
import { sfx } from '../audio.js';
import { getSetting } from '../settings.js';

const TOTAL_SLOTS = 12;

// Only keyboard focus should make the Mii describe a channel (not programmatic focus).
let keyboardMode = false;
window.addEventListener('keydown', () => (keyboardMode = true), true);
window.addEventListener('pointerdown', () => (keyboardMode = false), true);
//
export function initMenu(grid, { stage, speech, onOpen }) {
  const visible = CHANNELS.filter((c) => !c.hidden);
  const tiles = [];
  let hoverTimer = 0;
  let lastSpoken = '';

  for (let i = 0; i < TOTAL_SLOTS; i++) {
    const ch = visible[i];
    if (ch) {
      const tile = document.createElement('button');
      tile.type = 'button';
      tile.className = 'tile';
      tile.dataset.channel = ch.id;
      tile.appendChild(createArt(ch.id));
      tiles.push(tile);
      grid.appendChild(tile);

      const enter = () => {
        sfx.hover();
        const r = tile.getBoundingClientRect();
        stage.lookAtScreen({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
        clearTimeout(hoverTimer);
        hoverTimer = setTimeout(() => {
          if (lastSpoken === ch.id) return;
          lastSpoken = ch.id;
          speech.say(t(`ch.${ch.id}.desc`), { priority: 1, hold: 2600 });
          // occasionally point at the menu while explaining
          if (stage.mii && !stage.mii.busy && Math.random() < 0.35 && window.innerWidth > 1080) stage.mii.play('point');
        }, 550);
      };
      const leave = () => {
        clearTimeout(hoverTimer);
        stage.lookAtScreen(null);
      };
      tile.addEventListener('pointerenter', (e) => e.pointerType === 'mouse' && enter());
      tile.addEventListener('pointerleave', leave);
      tile.addEventListener('focus', () => keyboardMode && enter());
      tile.addEventListener('blur', leave);
      tile.addEventListener('click', () => {
        clearTimeout(hoverTimer);
        onOpen(ch.id, tile);
      });
    } else {
      const empty = document.createElement('div');
      empty.className = 'tile is-empty';
      empty.setAttribute('aria-hidden', 'true');
      const art = document.createElement('div');
      art.className = 'art';
      empty.appendChild(art);
      grid.appendChild(empty);
    }
  }

  function updateLabels() {
    tiles.forEach((tile) => {
      const id = tile.dataset.channel;
      tile.setAttribute('aria-label', `${t(`ch.${id}.title`)} — ${t(`ch.${id}.desc`)}`);
      tile.querySelector('.art-title').textContent = t(`ch.${id}.title`);
    });
    lastSpoken = '';
  }
  updateLabels();

  // Arrow-key navigation between channels (visual grid order)
  grid.addEventListener('keydown', (e) => {
    const idx = tiles.indexOf(document.activeElement);
    if (idx < 0) return;
    const cols = getComputedStyle(grid).gridTemplateColumns.split(' ').length;
    const moves = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: cols, ArrowUp: -cols };
    if (!(e.key in moves)) return;
    const next = tiles[idx + moves[e.key]];
    if (next) {
      e.preventDefault();
      next.focus();
    }
  });

  /** Staggered "pop in" for every slot (diagonal wave like the console). */
  function intro() {
    const all = [...grid.children];
    const cols = getComputedStyle(grid).gridTemplateColumns.split(' ').length;
    if (getSetting('reducedMotion')) return;
    all.forEach((el, i) => {
      const row = Math.floor(i / cols);
      const col = i % cols;
      el.animate(
        [
          { opacity: 0, transform: 'translateY(30px) scale(0.6)' },
          { opacity: 1, transform: 'translateY(-4px) scale(1.04)', offset: 0.7 },
          { opacity: 1, transform: 'none' },
        ],
        { duration: 650, delay: 180 + (row + col) * 70, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' },
      );
    });
  }

  return { tiles, intro, updateLabels, tileFor: (id) => tiles.find((x) => x.dataset.channel === id) };
}
