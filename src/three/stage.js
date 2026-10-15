// The 3D stage: renderer, lights, pedestal and the Mii's "brain" (idle behaviours,
// reacting to the pointer, walking in, playing 3DS when you go idle…).
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Mii } from './mii.js';
import { getSetting } from '../settings.js';

const { clamp, damp } = THREE.MathUtils;
const wrapAngle = (a) => Math.atan2(Math.sin(a), Math.cos(a));

function radialTexture(stops, size = 256) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  stops.forEach(([o, col]) => grad.addColorStop(o, col));
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function pedestalTopTexture(size = 512) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  const r = size / 2;
  const grad = g.createRadialGradient(r, r * 0.9, 0, r, r, r);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.62, '#f3fbff');
  grad.addColorStop(0.9, '#cdefff');
  grad.addColorStop(1, '#9fdfff');
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  // soft concentric rings (Wii-ish pinstripe feel)
  g.strokeStyle = 'rgba(120, 190, 230, 0.16)';
  g.lineWidth = 2;
  for (let i = 1; i <= 5; i++) {
    g.beginPath();
    g.arc(r, r, r * (0.3 + i * 0.12), 0, Math.PI * 2);
    g.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

// Framing presets: visible world box around the Mii + where to place it on screen.
const FRAMES = {
  home: { minY: -0.56, maxY: 2.5, halfW: 1.05, centerY: 0.98, shiftX: 0 },
  homeWide: { minY: -0.58, maxY: 2.2, halfW: 0.95, centerY: 0.95, shiftX: 0.55 },
  // phones: Mii centered with headroom so the speech bubble fits above him
  phone: { minY: -0.62, maxY: 2.85, halfW: 0.95, centerY: 0.98, shiftX: 0 },
  profile: { minY: -0.2, maxY: 2.02, halfW: 0.8, centerY: 0.91, shiftX: 0 },
};

export class Stage {
  constructor() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.NeutralToneMapping;
    this.renderer.toneMappingExposure = 1.06;
    this.canvas = this.renderer.domElement;
    this.canvas.className = 'stage-canvas';
    this.canvas.setAttribute('aria-hidden', 'true');

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(28, 1, 0.1, 60);
    this.camLook = new THREE.Vector3(0, 0.95, 0);
    this.camPos = new THREE.Vector3(0, 1.2, 6);
    this.camPosTarget = this.camPos.clone();
    this.camLookTarget = this.camLook.clone();

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environmentIntensity = 0.55;
    pmrem.dispose();

    this.scene.add(new THREE.HemisphereLight('#eaf6ff', '#ffe8d4', 1.45));
    const key = new THREE.DirectionalLight('#ffffff', 2.1);
    key.position.set(2.5, 4, 4);
    this.scene.add(key);
    const rim = new THREE.DirectionalLight('#7fdcff', 2.4);
    rim.position.set(-3, 2.6, -2.6);
    this.scene.add(rim);
    const fill = new THREE.DirectionalLight('#ffffff', 0.45);
    fill.position.set(-3, 1, 3);
    this.scene.add(fill);
    // screen glow on the face while playing 3DS
    this.dsLight = new THREE.PointLight('#9fe8ff', 0, 1.2, 2);
    this.scene.add(this.dsLight);

    this.buildPedestal();

    this.mode = 'home';
    this.frameKey = 'home';
    this.host = null;
    this.size = { w: 1, h: 1 };
    this.running = false;
    this.visible = true;
    this.lastTime = performance.now();
    this.elapsed = 0;
    this.pointer = { x: 0, y: 0, active: false, lastMove: performance.now() };
    this.lookScreen = null; // explicit screen point to look at (hovered tile)
    this.hooks = new Set();
    this.mii = null;
    this.idle = { nextFidget: 6, playing: false };
    this.drag = { active: false, lastX: 0, vel: 0, yaw: 0 };
    this.entered = false;

    this.resizeObserver = new ResizeObserver(() => this.resize());
    window.addEventListener('pointermove', (e) => this.onPointerMove(e), { passive: true });
    this.canvas.addEventListener('pointerdown', (e) => this.onPointerDown(e));
    window.addEventListener('pointerup', () => this.onPointerUp());
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) this.lastTime = performance.now();
    });
  }

  buildPedestal() {
    const g = new THREE.Group();
    const R = 0.78;
    const side = new THREE.MeshPhysicalMaterial({
      color: '#53c8f5',
      roughness: 0.18,
      metalness: 0,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      emissive: '#0a88c8',
      emissiveIntensity: 0.25,
    });
    const top = new THREE.MeshPhysicalMaterial({
      map: pedestalTopTexture(),
      roughness: 0.28,
      clearcoat: 1,
      clearcoatRoughness: 0.12,
    });
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(R, R * 0.94, 0.12, 96, 1), [side, top, side]);
    disc.position.y = -0.06;
    g.add(disc);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(R, 0.014, 12, 160),
      new THREE.MeshBasicMaterial({ color: '#c9f3ff' }),
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.001;
    g.add(ring);

    // floating halo ring of light dots
    const dots = new THREE.Group();
    const dotGeo = new THREE.SphereGeometry(0.018, 12, 8);
    const dotMat = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.85 });
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      const d = new THREE.Mesh(dotGeo, dotMat);
      d.position.set(Math.cos(a) * (R + 0.16), 0.02, Math.sin(a) * (R + 0.16));
      d.scale.setScalar(i % 3 === 0 ? 1.3 : 0.7);
      dots.add(d);
    }
    g.add(dots);
    this.halo = dots;

    const glow = new THREE.Mesh(
      new THREE.PlaneGeometry(2.9, 2.9),
      new THREE.MeshBasicMaterial({
        map: radialTexture([
          [0, 'rgba(160,230,255,0.55)'],
          [0.5, 'rgba(160,230,255,0.18)'],
          [1, 'rgba(160,230,255,0)'],
        ]),
        transparent: true,
        depthWrite: false,
      }),
    );
    glow.rotation.x = -Math.PI / 2;
    glow.position.y = -0.11;
    g.add(glow);

    this.shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({
        map: radialTexture([
          [0, 'rgba(20,60,100,0.42)'],
          [0.55, 'rgba(20,60,100,0.16)'],
          [1, 'rgba(20,60,100,0)'],
        ]),
        transparent: true,
        depthWrite: false,
      }),
    );
    this.shadow.rotation.x = -Math.PI / 2;
    this.shadow.position.y = 0.003;
    this.shadow.renderOrder = 1;
    g.add(this.shadow);

    this.pedestal = g;
    this.scene.add(g);
  }

  async load(url, onProgress) {
    const loader = new GLTFLoader();
    const gltf = await loader.loadAsync(url, (e) => {
      if (e.total) onProgress?.(e.loaded / e.total);
    });
    gltf.scene.traverse((o) => {
      if (o.isMesh && o.material) {
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        mats.forEach((m) => {
          if (m.map) m.map.anisotropy = 4;
          // slightly softer, more "Mii" plastic
          if ('envMapIntensity' in m) m.envMapIntensity = 0.8;
        });
      }
    });
    this.mii = new Mii(gltf);
    this.scene.add(this.mii.root);
    this.mii.on('land', () => this.hooks.forEach((h) => h.onLand?.()));
    this.makeDSScreens();
    this.mii.update(0);
    return this.mii;
  }

  /** Replace the 3DS screen textures with tiny live canvases. */
  makeDSScreens() {
    if (!this.mii?.ds) return;
    const mk = (w, h) => {
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.flipY = false;
      return { c, g: c.getContext('2d'), tex };
    };
    this.dsTop = mk(256, 128);
    this.dsBottom = mk(256, 128);
    this.mii.ds.traverse((o) => {
      if (!o.isMesh) return;
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      mats.forEach((m) => {
        const screen = m.name === 'M_Screen_Top' ? this.dsTop : m.name === 'M_Screen_Bottom' ? this.dsBottom : null;
        if (!screen) return;
        const old = m.emissiveMap;
        if (old) {
          screen.tex.offset.copy(old.offset);
          screen.tex.repeat.copy(old.repeat);
          screen.tex.rotation = old.rotation;
          screen.tex.center.copy(old.center);
          screen.tex.wrapS = old.wrapS;
          screen.tex.wrapT = old.wrapT;
        }
        m.emissiveMap = screen.tex;
        m.map = null;
        m.emissive = new THREE.Color('#ffffff');
        m.emissiveIntensity = 1.15;
        m.needsUpdate = true;
      });
    });
    this.drawDSScreens(0);
  }

  drawDSScreens(t) {
    if (!this.dsTop) return;
    for (const [s, hue] of [
      [this.dsTop, 195],
      [this.dsBottom, 140],
    ]) {
      const { g, c } = s;
      const grd = g.createLinearGradient(0, 0, 0, c.height);
      grd.addColorStop(0, `hsl(${hue}, 90%, 78%)`);
      grd.addColorStop(1, `hsl(${hue + 20}, 85%, 55%)`);
      g.fillStyle = grd;
      g.fillRect(0, 0, c.width, c.height);
      g.fillStyle = 'rgba(255,255,255,0.85)';
      for (let i = 0; i < 6; i++) {
        const x = (i * 53 + t * 60) % (c.width + 40) - 20;
        const y = 30 + ((i * 37) % 70) + Math.sin(t * 3 + i) * 6;
        g.beginPath();
        g.arc(x, y, 6 + (i % 3) * 3, 0, Math.PI * 2);
        g.fill();
      }
      g.fillStyle = '#ffffff';
      g.font = 'bold 26px sans-serif';
      g.textAlign = 'center';
      g.fillText('★', c.width / 2 + Math.sin(t * 4) * 30, c.height / 2 + 10 + Math.abs(Math.sin(t * 6)) * -16);
      s.tex.needsUpdate = true;
    }
  }

  // ── mounting & sizing ────────────────────────────────────────────────────
  mount(host, mode = 'home') {
    if (this.host) this.resizeObserver.unobserve(this.host);
    this.host = host;
    host.appendChild(this.canvas);
    this.resizeObserver.observe(host);
    this.setMode(mode);
    this.resize();
  }

  setMode(mode) {
    this.mode = mode;
    if (this.mii) {
      if (mode === 'profile') {
        this.mii.setPlaying(false);
        this.mii.walkTarget = null;
        this.mii.root.position.set(0, 0, 0);
        this.drag.yaw = 0;
        this.drag.vel = 7.5; // little twirl when the profile opens
      } else {
        this.mii.extraYaw = 0;
      }
    }
    this.resize(true);
  }

  resize(snap = false) {
    if (!this.host) return;
    const w = Math.max(1, this.host.clientWidth);
    const h = Math.max(1, this.host.clientHeight);
    this.size = { w, h };
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.frameKey = this.mode === 'profile' ? 'profile' : w < 560 ? 'phone' : w / h > 1.25 ? 'homeWide' : 'home';
    this.computeFraming();
    if (snap) {
      this.camPos.copy(this.camPosTarget);
      this.camLook.copy(this.camLookTarget);
    }
    this.camera.updateProjectionMatrix();
  }

  computeFraming() {
    const f = FRAMES[this.frameKey];
    const tanH = Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2));
    const halfH = (f.maxY - f.minY) / 2;
    const distV = halfH / tanH;
    const distW = (f.halfW + Math.abs(f.shiftX)) / (tanH * this.camera.aspect);
    const dist = Math.max(distV, distW) + 0.6;
    const cy = (f.maxY + f.minY) / 2;
    // shiftX > 0 moves the camera right so the Mii sits left of center (room for the speech bubble)
    const sx = f.shiftX * Math.min(1, (this.camera.aspect - 1) * 0.9);
    this.camLookTarget.set(sx, cy, 0);
    this.camPosTarget.set(sx, cy + 0.32, dist);
  }

  // ── input ────────────────────────────────────────────────────────────────
  onPointerMove(e) {
    this.pointer.x = e.clientX;
    this.pointer.y = e.clientY;
    this.pointer.active = true;
    this.markActivity();
    if (this.drag.active) {
      const dx = e.clientX - this.drag.lastX;
      this.drag.lastX = e.clientX;
      this.drag.yaw += dx * 0.012;
      this.drag.vel = dx * 0.012 * 60;
    }
  }

  markActivity() {
    this.pointer.lastMove = performance.now();
    if (this.mii?.isPlaying && this.mode === 'home' && this.visible) this.wakeUp();
  }

  onPointerDown(e) {
    if (!this.mii) return;
    if (this.mode === 'profile') {
      this.drag.active = true;
      this.drag.lastX = e.clientX;
      this.canvas.setPointerCapture?.(e.pointerId);
      return;
    }
    if (this.hitMii(e.clientX, e.clientY)) this.hooks.forEach((h) => h.onPoke?.());
  }

  onPointerUp() {
    this.drag.active = false;
  }

  /** Approximate hit test using the Mii's projected bounding box. */
  hitMii(cx, cy) {
    const r = this.getMiiScreenRect();
    return r && cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom;
  }

  getMiiScreenRect() {
    if (!this.mii || !this.host) return null;
    const rect = this.canvas.getBoundingClientRect();
    const p = this.mii.root.position;
    const pts = [
      [p.x - 0.42, p.y + this.mii.hopY, p.z],
      [p.x + 0.42, p.y + this.mii.hopY, p.z],
      [p.x - 0.42, p.y + this.mii.hopY + 1.85, p.z],
      [p.x + 0.42, p.y + this.mii.hopY + 1.85, p.z],
    ];
    let l = Infinity;
    let r = -Infinity;
    let t = Infinity;
    let b = -Infinity;
    const v = new THREE.Vector3();
    for (const q of pts) {
      v.set(...q).project(this.camera);
      const x = rect.left + ((v.x + 1) / 2) * rect.width;
      const y = rect.top + ((1 - v.y) / 2) * rect.height;
      l = Math.min(l, x);
      r = Math.max(r, x);
      t = Math.min(t, y);
      b = Math.max(b, y);
    }
    return { left: l, right: r, top: t, bottom: b };
  }

  /** Head-top position in client (viewport) pixels, for the speech bubble. */
  getHeadClientPos() {
    if (!this.mii) return null;
    const rect = this.canvas.getBoundingClientRect();
    const v = this.mii.bones.Head.getWorldPosition(new THREE.Vector3());
    v.y += 0.62;
    v.project(this.camera);
    return { x: rect.left + ((v.x + 1) / 2) * rect.width, y: rect.top + ((1 - v.y) / 2) * rect.height, rect };
  }

  screenToWorld(cx, cy, planeZ = 2.2) {
    const rect = this.canvas.getBoundingClientRect();
    const ndc = new THREE.Vector3(((cx - rect.left) / rect.width) * 2 - 1, -((cy - rect.top) / rect.height) * 2 + 1, 0.5);
    ndc.unproject(this.camera);
    const dir = ndc.sub(this.camera.position).normalize();
    const t = (planeZ - this.camera.position.z) / dir.z;
    return this.camera.position.clone().addScaledVector(dir, t);
  }

  /** Make the Mii look at a screen point (e.g. a hovered channel). null = follow pointer. */
  lookAtScreen(pt) {
    this.lookScreen = pt;
  }

  // ── behaviours ───────────────────────────────────────────────────────────
  enter(onDone) {
    const m = this.mii;
    if (!m) return;
    this.entered = true;
    if (getSetting('reducedMotion') || this.mode === 'profile') {
      m.root.position.set(0, 0, 0);
      m.play('wave');
      onDone?.();
      return;
    }
    m.root.position.set(-3.2, 0, 0.5);
    m.facing = m.facingTarget = Math.PI / 2;
    m.walkTo(0, 0, () => {
      m.play('wave');
      onDone?.();
    });
  }

  poke() {
    const m = this.mii;
    if (!m || m.walkTarget) return;
    if (m.isPlaying) {
      this.wakeUp();
      return;
    }
    const options = ['cheer', 'spin', 'surprise', 'wave', 'shrug'];
    m.play(options[Math.floor(Math.random() * options.length)]);
  }

  wakeUp() {
    const m = this.mii;
    if (!m?.isPlaying) return;
    m.setPlaying(false);
    this.idle.nextFidget = 8;
    setTimeout(() => {
      m.play('surprise');
      this.hooks.forEach((h) => h.onWake?.());
    }, 260);
  }

  startPlaying() {
    const m = this.mii;
    if (!m || m.isPlaying || m.busy) return;
    m.setPlaying(true);
    this.hooks.forEach((h) => h.onPlay?.());
  }

  updateBrain(dt) {
    const m = this.mii;
    if (!m || !this.entered) return;

    // where to look
    if (this.mode === 'profile') {
      m.lookPoint = this.camera.position.clone();
      m.lookStrength = 0.8;
    } else {
      const pt = this.lookScreen || (this.pointer.active ? this.pointer : null);
      m.lookPoint = pt ? this.screenToWorld(pt.x, pt.y) : this.camera.position.clone();
      m.lookStrength = 1;
    }

    if (this.mode !== 'home') return;
    // idle → play 3DS
    const idleFor = (performance.now() - this.pointer.lastMove) / 1000;
    if (idleFor > 16 && !m.isPlaying && !m.busy) this.startPlaying();

    // occasional fidgets while the user is around
    if (!m.isPlaying && !m.busy) {
      this.idle.nextFidget -= dt;
      if (this.idle.nextFidget <= 0) {
        this.idle.nextFidget = 9 + Math.random() * 8;
        const pool = ['stretch', 'tap', 'nod', 'shrug'];
        m.play(pool[Math.floor(Math.random() * pool.length)]);
      }
    }
  }

  // ── snapshots (Mii icons for the UI) ─────────────────────────────────────
  snapshot({ size = 256, kind = 'head' } = {}) {
    if (!this.mii) return null;
    const m = this.mii;
    const prevPos = m.root.position.clone();
    const prevFacing = m.facing;
    m.root.position.set(0, 0, 0);
    m.root.rotation.y = 0;
    m.root.updateMatrixWorld(true);
    this.pedestal.visible = false;

    const cam = new THREE.PerspectiveCamera(kind === 'head' ? 20 : 24, 1, 0.1, 30);
    const head = m.bones.Head.getWorldPosition(new THREE.Vector3());
    if (kind === 'head') {
      const c = head.clone().add(new THREE.Vector3(0, 0.3, 0));
      cam.position.set(c.x + 0.35, c.y + 0.12, c.z + 2.6);
      cam.lookAt(c);
    } else {
      cam.position.set(0.8, 1.3, 6.2);
      cam.lookAt(0, 0.92, 0);
    }
    const prevRatio = this.renderer.getPixelRatio();
    const prevSize = this.renderer.getSize(new THREE.Vector2());
    this.renderer.setPixelRatio(1);
    this.renderer.setSize(size * 2, size * 2, false);
    this.renderer.render(this.scene, cam);
    const out = document.createElement('canvas');
    out.width = out.height = size;
    const g = out.getContext('2d');
    g.imageSmoothingQuality = 'high';
    g.drawImage(this.canvas, 0, 0, size, size);
    const url = out.toDataURL('image/png');

    this.renderer.setPixelRatio(prevRatio);
    this.renderer.setSize(prevSize.x, prevSize.y, false);
    this.pedestal.visible = true;
    m.root.position.copy(prevPos);
    m.root.rotation.y = prevFacing;
    return url;
  }

  // ── loop ─────────────────────────────────────────────────────────────────
  onFrame(hook) {
    this.hooks.add(hook);
    return () => this.hooks.delete(hook);
  }

  setVisible(v) {
    this.visible = v;
    if (v) this.lastTime = performance.now();
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    const loop = (now) => {
      if (!this.running) return;
      requestAnimationFrame(loop);
      if (!this.visible || document.hidden || !this.host) return;
      const dt = Math.min(Math.max(0, (now - this.lastTime) / 1000), 1 / 20);
      this.lastTime = now;
      this.tick(dt);
    };
    requestAnimationFrame(loop);
  }

  tick(dt) {
    const m = this.mii;
    this.elapsed += dt;
    const t = this.elapsed;
    if (m) {
      this.updateBrain(dt);
      if (this.mode === 'profile') {
        if (!this.drag.active) {
          // inertia, then ease back to a gentle sway facing the camera
          this.drag.vel *= Math.exp(-2.2 * dt);
          this.drag.yaw += this.drag.vel * dt;
          if (Math.abs(this.drag.vel) < 1.2) {
            const sway = Math.sin(this.elapsed * 0.55) * 0.42;
            this.drag.yaw += wrapAngle(sway - this.drag.yaw) * (1 - Math.exp(-2 * dt));
          }
        }
        m.extraYaw = this.drag.yaw;
      }
      m.update(dt);
      const p = m.root.position;
      const lift = m.hopY;
      this.shadow.position.set(p.x, 0.003, p.z);
      this.shadow.scale.setScalar(clamp(1.05 - lift * 0.9, 0.45, 1.1) * 1.05);
      this.shadow.material.opacity = clamp(1 - lift * 1.4, 0.3, 1);
      // 3DS glow on the face
      this.dsLight.intensity = 2.2 * m.dsScale * m.hold;
      if (m.ds?.visible) {
        m.ds.getWorldPosition(this.dsLight.position);
        this.dsLight.position.y += 0.15;
        this.dsLight.position.z -= 0.05;
        if (Math.floor(t * 12) !== this._dsFrame) {
          this._dsFrame = Math.floor(t * 12);
          this.drawDSScreens(t);
        }
      }
    }
    this.halo.rotation.y = t * 0.15;
    this.halo.position.y = Math.sin(t * 1.2) * 0.015;

    // camera easing (+ subtle parallax from the pointer)
    const px = this.pointer.active ? (this.pointer.x / window.innerWidth - 0.5) : 0;
    const py = this.pointer.active ? (this.pointer.y / window.innerHeight - 0.5) : 0;
    const k = 1 - Math.exp(-4 * dt);
    const target = this.camPosTarget.clone();
    if (this.mode === 'home') {
      target.x += px * 0.35;
      target.y -= py * 0.18;
    }
    this.camPos.lerp(target, k);
    this.camLook.lerp(this.camLookTarget, k);
    this.camera.position.copy(this.camPos);
    this.camera.lookAt(this.camLook);

    this.hooks.forEach((h) => h.onTick?.(dt));
    this.renderer.render(this.scene, this.camera);
  }
}
