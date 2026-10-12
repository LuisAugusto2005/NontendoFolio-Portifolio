// Glossy Frutiger Aero bubbles drifting up the background. Click empty space to pop them.
import { getSetting } from '../settings.js';

function makeSprite(size = 128) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  const r = size / 2;
  // body: transparent center, tinted rim
  let grd = g.createRadialGradient(r, r, r * 0.55, r, r, r);
  grd.addColorStop(0, 'rgba(255,255,255,0.02)');
  grd.addColorStop(0.75, 'rgba(160,225,255,0.22)');
  grd.addColorStop(0.93, 'rgba(255,255,255,0.75)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd;
  g.beginPath();
  g.arc(r, r, r, 0, Math.PI * 2);
  g.fill();
  // iridescent hint
  grd = g.createLinearGradient(0, size, size, 0);
  grd.addColorStop(0, 'rgba(255,170,230,0.10)');
  grd.addColorStop(0.5, 'rgba(170,255,230,0.06)');
  grd.addColorStop(1, 'rgba(150,200,255,0.12)');
  g.fillStyle = grd;
  g.beginPath();
  g.arc(r, r, r * 0.96, 0, Math.PI * 2);
  g.fill();
  // highlights
  g.fillStyle = 'rgba(255,255,255,0.9)';
  g.beginPath();
  g.ellipse(r * 0.62, r * 0.55, r * 0.22, r * 0.12, -0.7, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = 'rgba(255,255,255,0.55)';
  g.beginPath();
  g.arc(r * 1.42, r * 1.38, r * 0.07, 0, Math.PI * 2);
  g.fill();
  return c;
}

export function initBubbles(canvas) {
  const g = canvas.getContext('2d');
  const sprite = makeSprite();
  let W = 0;
  let H = 0;
  let dpr = 1;
  let bubbles = [];
  let pops = [];
  let paused = false;
  let last = performance.now();

  const spawn = (initial = false) => {
    const r = 8 + Math.pow(Math.random(), 1.8) * 34;
    return {
      x: Math.random() * W,
      y: initial ? Math.random() * H : H + r + Math.random() * 60,
      r,
      speed: 10 + Math.random() * 18 + r * 0.25,
      wob: Math.random() * Math.PI * 2,
      wobSpeed: 0.6 + Math.random() * 0.8,
      wobAmp: 6 + Math.random() * 14,
      alpha: 0.55 + Math.random() * 0.45,
    };
  };

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    const target = Math.round(Math.min(26, Math.max(10, (W * H) / 60000)));
    while (bubbles.length < target) bubbles.push(spawn(true));
    bubbles.length = target;
  }
  resize();
  window.addEventListener('resize', resize);

  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (paused || document.hidden) return;
    const slow = getSetting('reducedMotion') ? 0.25 : 1;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, W, H);
    for (const b of bubbles) {
      b.y -= b.speed * dt * slow;
      b.wob += b.wobSpeed * dt * slow;
      if (b.y < -b.r * 2) Object.assign(b, spawn());
      const x = b.x + Math.sin(b.wob) * b.wobAmp;
      b.sx = x;
      // fade in from the bottom, fade out near the top
      const fade = Math.min(1, (H - b.y) / 160) * Math.min(1, (b.y + b.r) / 140);
      g.globalAlpha = Math.max(0, b.alpha * fade);
      g.drawImage(sprite, x - b.r, b.y - b.r, b.r * 2, b.r * 2);
    }
    g.globalAlpha = 1;
    pops = pops.filter((p) => p.t < 0.45);
    for (const p of pops) {
      p.t += dt;
      const k = p.t / 0.45;
      g.strokeStyle = `rgba(255,255,255,${(1 - k) * 0.9})`;
      g.lineWidth = 2;
      g.beginPath();
      g.arc(p.x, p.y, p.r * (1 + k * 0.6), 0, Math.PI * 2);
      g.stroke();
      g.fillStyle = `rgba(190,235,255,${1 - k})`;
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + p.r;
        const d = p.r * (0.9 + k * 1.4);
        g.beginPath();
        g.arc(p.x + Math.cos(a) * d, p.y + Math.sin(a) * d, 2.4 * (1 - k) + 0.6, 0, Math.PI * 2);
        g.fill();
      }
    }
  }
  requestAnimationFrame(frame);

  return {
    setPaused(v) {
      paused = v;
      if (!v) last = performance.now();
    },
    /** Pop the bubble under (x, y). Returns true when something popped. */
    popAt(x, y) {
      for (const b of bubbles) {
        const bx = b.sx ?? b.x;
        if (Math.hypot(bx - x, b.y - y) <= b.r + 8) {
          pops.push({ x: bx, y: b.y, r: b.r, t: 0 });
          Object.assign(b, spawn());
          return true;
        }
      }
      return false;
    },
  };
}
