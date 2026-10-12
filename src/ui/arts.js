// Channel artwork. The same markup is used for the small tile and the
// full-screen banner: everything is sized in container-query units so the
// zoom from tile → banner is a pure scale.
import { t } from '../i18n.js';

export const CHANNELS = [
  { id: 'about', accent: '#22a7ee' },
  { id: 'projects', accent: '#1679d6' },
  { id: 'skills', accent: '#3fae3f' },
  { id: 'journey', accent: '#e58a10' },
  { id: 'contact', accent: '#f0646a' },
  { id: 'shop', accent: '#1d8fe0' },
  { id: 'settings', accent: '#6b7c8c', hidden: true },
];

export const channelById = (id) => CHANNELS.find((c) => c.id === id);

const sparkle = (cls) => `<i class="art-spark ${cls}">✦</i>`;

const ART = {
  about: () => `
    <div class="about-rays"></div>
    <div class="about-cloud c1"></div><div class="about-cloud c2"></div>
    <div class="about-face"><img class="mii-face" alt="" /></div>
    ${sparkle('s1')}${sparkle('s2')}${sparkle('s3')}`,

  projects: () => `
    <div class="proj-shine"></div>
    <div class="proj-case"><span class="proj-band"></span><span class="proj-cover">✦</span></div>
    <div class="proj-disc"><div class="proj-disc-spin"></div><div class="proj-disc-gloss"></div></div>
    ${sparkle('s1')}${sparkle('s2')}`,

  skills: () => `
    <div class="skills-sun"></div>
    <div class="skills-hill h1"></div><div class="skills-hill h2"></div>
    <div class="skills-badges">
      <span class="badge b1"><b>JS</b></span>
      <span class="badge b2"><b>3D</b></span>
      <span class="badge b3"><b>&lt;/&gt;</b></span>
    </div>
    ${sparkle('s1')}${sparkle('s2')}`,

  journey: () => `
    <svg class="journey-path" viewBox="0 0 160 100" preserveAspectRatio="none" aria-hidden="true">
      <path d="M8 86 C 40 86, 30 52, 66 54 S 104 76, 118 46 S 136 14, 154 18" fill="none" stroke="#e6a548" stroke-width="1.6" stroke-dasharray="0.6 3.6" stroke-linecap="round"/>
      <circle r="3.4" fill="#ff9d2e" stroke="#fff" stroke-width="1.3">
        <animateMotion dur="7s" repeatCount="indefinite" keyPoints="0;1;1" keyTimes="0;0.85;1" calcMode="linear" path="M8 86 C 40 86, 30 52, 66 54 S 104 76, 118 46 S 136 14, 154 18"/>
      </circle>
    </svg>
    <div class="journey-note"><i class="pin"></i><span></span><span></span><span></span></div>
    <div class="journey-cal"><b class="cal-top"></b><b class="cal-num">★</b><b class="cal-page"></b></div>`,

  contact: () => `
    <div class="contact-sun"></div>
    <div class="contact-env">
      <div class="env-letter"><span></span><span></span></div>
      <div class="env-back"></div>
      <div class="env-front"></div>
      <div class="env-flap"></div>
    </div>
    <i class="heart h1">♥</i><i class="heart h2">♥</i><i class="heart h3">♥</i>`,

  shop: () => `
    <div class="shop-bag">
      <span class="shop-handle"></span>
      <span class="shop-cv">CV</span>
    </div>
    <div class="shop-tag">0P</div>
    <i class="shop-coin c1"></i><i class="shop-coin c2"></i><i class="shop-coin c3"></i>
    ${sparkle('s1')}`,

  settings: () => `
    <svg class="gear g1" viewBox="0 0 48 48" aria-hidden="true"><path d="M24 15.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17zm16.3 11.5v-6l-4.5-.9a12 12 0 0 0-1.3-3.1l2.6-3.8-4.3-4.3-3.8 2.6a12 12 0 0 0-3.1-1.3l-.9-4.5h-6l-.9 4.5a12 12 0 0 0-3.1 1.3l-3.8-2.6-4.3 4.3 2.6 3.8a12 12 0 0 0-1.3 3.1l-4.5.9v6l4.5.9c.3 1.1.7 2.1 1.3 3.1l-2.6 3.8 4.3 4.3 3.8-2.6c1 .6 2 1 3.1 1.3l.9 4.5h6l.9-4.5c1.1-.3 2.1-.7 3.1-1.3l3.8 2.6 4.3-4.3-2.6-3.8c.6-1 1-2 1.3-3.1z"/></svg>
    <svg class="gear g2" viewBox="0 0 48 48" aria-hidden="true"><path d="M24 15.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17zm16.3 11.5v-6l-4.5-.9a12 12 0 0 0-1.3-3.1l2.6-3.8-4.3-4.3-3.8 2.6a12 12 0 0 0-3.1-1.3l-.9-4.5h-6l-.9 4.5a12 12 0 0 0-3.1 1.3l-3.8-2.6-4.3 4.3 2.6 3.8a12 12 0 0 0-1.3 3.1l-4.5.9v6l4.5.9c.3 1.1.7 2.1 1.3 3.1l-2.6 3.8 4.3 4.3 3.8-2.6c1 .6 2 1 3.1 1.3l.9 4.5h6l.9-4.5c1.1-.3 2.1-.7 3.1-1.3l3.8 2.6 4.3-4.3-2.6-3.8c.6-1 1-2 1.3-3.1z"/></svg>
    <div class="settings-toggle"><i></i></div>`,
};

/** Returns the inner HTML for a channel's art box (including its title). */
export function artHTML(id) {
  const body = ART[id] ? ART[id]() : '';
  return `${body}<span class="art-title" data-i18n="ch.${id}.title">${t(`ch.${id}.title`)}</span>`;
}

/** Creates a full `.art` element. */
export function createArt(id) {
  const el = document.createElement('div');
  el.className = `art art--${id}`;
  el.innerHTML = artHTML(id);
  return el;
}
