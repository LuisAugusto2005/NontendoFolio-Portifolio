import { getLang } from '../i18n.js';
import { profile } from '../content.js';

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

export const displayName = () => (getLang() === 'ja' && profile.nameJa ? profile.nameJa : profile.name);

export const firstName = () => displayName().split(/[\s・]/)[0];
