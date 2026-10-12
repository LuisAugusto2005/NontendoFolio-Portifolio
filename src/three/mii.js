// Procedural animation for the Mii model (the GLB has a skeleton but no clips).
//
// Every bone gets a "pose" quaternion expressed in model space *as if the bone's
// parents were at rest*. Because each bone's offset is applied in its own rest
// frame, poses compose hierarchically (classic FK): rotate the shoulder and the
// elbow follows. Layers (idle, walk, gestures, look-at) premultiply into the
// pose each frame, then two-bone IK can override the arms (holding the 3DS).
import * as THREE from 'three';

const { clamp, damp } = THREE.MathUtils;
const TAU = Math.PI * 2;
const _q = new THREE.Quaternion();
const _q2 = new THREE.Quaternion();
const _e = new THREE.Euler();
const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _v3 = new THREE.Vector3();
const _v4 = new THREE.Vector3();
const AXIS_POS_X = new THREE.Vector3(1, 0, 0);
const AXIS_NEG_X = new THREE.Vector3(-1, 0, 0);

const smooth = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
const envelope = (t, dur, fadeIn = 0.2, fadeOut = 0.3) =>
  Math.min(smooth(t / fadeIn), smooth((dur - t) / fadeOut));
const easeInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const wrapAngle = (a) => Math.atan2(Math.sin(a), Math.cos(a));

// ── gesture library ────────────────────────────────────────────────────────
// Each gesture: duration + apply(mii, t, w) where w is the blend envelope.
const GESTURES = {
  wave: {
    dur: 2.3,
    apply(m, t, w) {
      const osc = Math.sin(t * 11) * 0.42;
      m.rot('Arm_1_R', 0, 0.25 * w, -1.62 * w);
      m.rot('Arm_2_R', 0, 0, (-1.15 + osc) * w);
      m.rot('Wrist_R', 0, 0, osc * 0.5 * w);
      m.rot('Head', 0, 0.12 * w, -0.1 * w);
      m.rot('Spine_2', 0, 0, -0.05 * w);
    },
  },
  cheer: {
    dur: 1.5,
    fadeIn: 0.12,
    onStart: (m) => m.jump(3.0, 0.08),
    apply(m, t, w) {
      const wob = Math.sin(t * 18) * 0.12;
      m.rot('Arm_1_L', 0, 0, (2.2 + wob) * w);
      m.rot('Arm_1_R', 0, 0, (-2.2 - wob) * w);
      m.rot('Arm_2_L', 0, 0, 0.12 * w);
      m.rot('Arm_2_R', 0, 0, -0.12 * w);
      m.rot('Head', -0.18 * w, 0, 0);
    },
  },
  surprise: {
    dur: 1.1,
    fadeIn: 0.08,
    onStart: (m) => m.jump(2.2, 0.03),
    apply(m, t, w) {
      m.rot('Arm_1_L', 0, -0.3 * w, 0.75 * w);
      m.rot('Arm_1_R', 0, 0.3 * w, -0.75 * w);
      m.rot('Arm_2_L', 0, -0.7 * w, 0);
      m.rot('Arm_2_R', 0, 0.7 * w, 0);
      m.rot('Head', -0.2 * w, 0, 0);
      m.rot('Spine_1', -0.08 * w, 0, 0);
    },
  },
  spin: {
    dur: 1.0,
    fadeIn: 0.05,
    fadeOut: 0.15,
    onStart: (m) => m.jump(3.4, 0.05),
    apply(m, t, w, g) {
      g.spin = TAU * easeInOut(clamp(t / 0.85, 0, 1));
      m.rot('Arm_1_L', 0, 0, 0.9 * w);
      m.rot('Arm_1_R', 0, 0, -0.9 * w);
    },
  },
  shrug: {
    dur: 1.4,
    apply(m, t, w) {
      m.rot('Arm_1_L', 0, 0, 0.25 * w);
      m.rot('Arm_1_R', 0, 0, -0.25 * w);
      m.rot('Arm_2_L', 0, -1.25 * w, 0.3 * w);
      m.rot('Arm_2_R', 0, 1.25 * w, -0.3 * w);
      m.rot('Clavicle_L', 0, 0, 0.12 * w);
      m.rot('Clavicle_R', 0, 0, -0.12 * w);
      m.rot('Head', 0, 0, 0.18 * w);
    },
  },
  nod: {
    dur: 0.9,
    apply(m, t, w) {
      m.rot('Head', Math.sin(t * 13) * 0.16 * w, 0, 0);
    },
  },
  point: {
    // points toward the character's left (+X) = right side of the screen
    dur: 1.8,
    apply(m, t, w) {
      m.rot('Arm_1_L', -0.15 * w, -0.55 * w, 1.1 * w);
      m.rot('Arm_2_L', 0, -0.1 * w, 0);
      m.rot('Head', 0, 0.45 * w, 0);
      m.rot('Spine_2', 0, 0.12 * w, 0);
    },
  },
  stretch: {
    dur: 2.6,
    fadeIn: 0.6,
    fadeOut: 0.7,
    apply(m, t, w) {
      const s = Math.sin(t * 2) * 0.05;
      m.rot('Arm_1_L', 0, 0, (2.6 + s) * w);
      m.rot('Arm_1_R', 0, 0, (-2.6 - s) * w);
      m.rot('Arm_2_L', 0, 0, 0.5 * w);
      m.rot('Arm_2_R', 0, 0, -0.5 * w);
      m.rot('Spine_1', -0.12 * w, 0, 0);
      m.rot('Head', -0.3 * w, 0, 0);
    },
  },
  tap: {
    // impatient foot tap + hands behind back
    dur: 2.4,
    apply(m, t, w) {
      const tap = Math.max(0, Math.sin(t * 9)) * 0.35 * w;
      m.rot('Leg_1_R', -0.05 * w, 0, 0);
      m.rot('Ankle_R', -tap, 0, 0);
      m.rot('Arm_1_L', 0.45 * w, 0, 0);
      m.rot('Arm_1_R', 0.45 * w, 0, 0);
      m.rot('Head', 0, Math.sin(t * 1.5) * 0.25 * w, 0);
    },
  },
};

export class Mii {
  constructor(gltf) {
    this.root = new THREE.Group(); // world placement + facing
    this.root.name = 'MiiRoot';
    this.body = new THREE.Group(); // hop + squash & stretch (origin at the feet)
    this.root.add(this.body);

    this.model = gltf.scene.getObjectByName('Mii');
    this.body.add(this.model);
    this.model.traverse((o) => {
      if (o.isMesh) o.frustumCulled = false;
    });

    // Collect bones + rest data (computed while everything is at the origin).
    this.bones = {};
    this.model.traverse((o) => {
      if (o.isBone) this.bones[o.name] = o;
    });
    this.root.updateWorldMatrix(true, true);
    this.rest = {};
    this.pose = {};
    for (const [name, b] of Object.entries(this.bones)) {
      const wq = b.getWorldQuaternion(new THREE.Quaternion());
      this.rest[name] = { q: b.quaternion.clone(), p: b.position.clone(), wq, wqi: wq.clone().invert() };
      this.pose[name] = new THREE.Quaternion();
    }
    this.upperLen = this.bones.Arm_2_L.position.length();
    this.foreLen = this.bones.Wrist_L.position.length() + this.bones.Item_Wrist_L.position.length() * 0.6;

    // The 3DS prop shipped in the same file: keep it, re-pivot it around its center.
    this.ds = null;
    const dsNode = gltf.scene.getObjectByName('Sketchfab_model');
    if (dsNode) {
      dsNode.updateWorldMatrix(true, true);
      const box = new THREE.Box3().setFromObject(dsNode);
      const center = box.getCenter(new THREE.Vector3());
      this.ds = new THREE.Group();
      this.ds.name = 'DSPivot';
      this.ds.position.copy(center);
      this.body.add(this.ds);
      this.ds.attach(dsNode);
      this.dsHome = center.clone().add(new THREE.Vector3(0, -0.07, 0.03));
      this.ds.scale.setScalar(0.0001);
      this.ds.visible = false;
      dsNode.traverse((o) => {
        if (o.isMesh) o.frustumCulled = false;
      });
    }

    // animation state
    this.time = 0;
    this.facing = 0;
    this.facingTarget = 0;
    this.extraYaw = 0;
    this.walkWeight = 0;
    this.walkPhase = 0;
    this.speed = 0;
    this.walkTarget = null;
    this.onArrive = null;
    this.look = { yaw: 0, pitch: 0 };
    this.lookPoint = null; // THREE.Vector3 in world space, or null
    this.lookStrength = 1;
    this.gestures = [];
    this.hold = 0; // 3DS play blend
    this.holdTarget = 0;
    this.dsScale = 0;
    this.hopY = 0;
    this.hopV = 0;
    this.pendingJump = null;
    this.squash = 1;
    this.squashV = 0;
    this.grounded = true;
    this.listeners = {};
  }

  on(evt, fn) {
    (this.listeners[evt] ||= []).push(fn);
  }
  emit(evt, ...args) {
    (this.listeners[evt] || []).forEach((fn) => fn(...args));
  }

  // ── pose helpers ─────────────────────────────────────────────────────────
  rot(name, x, y, z) {
    const p = this.pose[name];
    if (!p) return;
    _e.set(x, y, z, 'YXZ');
    _q.setFromEuler(_e);
    p.premultiply(_q);
  }

  applyPose() {
    for (const name in this.bones) {
      const b = this.bones[name];
      const r = this.rest[name];
      _q2.copy(r.wqi).multiply(this.pose[name]).multiply(r.wq);
      b.quaternion.copy(r.q).multiply(_q2);
    }
  }

  /** Rotate `bone` (minimal arc) so its chain axis points along `dirWorld`. */
  aimBone(bone, axisLocal, dirWorld) {
    bone.updateWorldMatrix(true, false);
    const wq = bone.getWorldQuaternion(_q);
    const cur = _v4.copy(axisLocal).applyQuaternion(wq).normalize();
    const delta = _q2.setFromUnitVectors(cur, dirWorld.clone().normalize());
    const target = delta.multiply(wq); // new world rotation
    const parentQ = bone.parent.getWorldQuaternion(new THREE.Quaternion());
    bone.quaternion.copy(parentQ.invert().multiply(target));
    bone.updateWorldMatrix(false, true);
  }

  solveArmIK(side, targetWorld, poleWorld, weight) {
    if (weight <= 0.001) return;
    const upper = this.bones[`Arm_1_${side}`];
    const lower = this.bones[`Arm_2_${side}`];
    const axis = side === 'L' ? AXIS_POS_X : AXIS_NEG_X;
    const fkUpper = upper.quaternion.clone();
    const fkLower = lower.quaternion.clone();

    upper.updateWorldMatrix(true, false);
    const S = upper.getWorldPosition(new THREE.Vector3());
    const scale = this.root.scale.x;
    const a = this.upperLen * scale;
    const b = this.foreLen * scale;
    const toT = _v1.copy(targetWorld).sub(S);
    const d = clamp(toT.length(), Math.abs(a - b) + 1e-3, a + b - 1e-3);
    const n = toT.normalize();
    const cosA = clamp((a * a + d * d - b * b) / (2 * a * d), -1, 1);
    const sinA = Math.sqrt(1 - cosA * cosA);
    const pole = _v2.copy(poleWorld).sub(S);
    const m = pole.sub(_v3.copy(n).multiplyScalar(pole.dot(n))).normalize();
    const E = new THREE.Vector3().copy(S).addScaledVector(n, a * cosA).addScaledVector(m, a * sinA);
    const T = new THREE.Vector3().copy(S).addScaledVector(n, d);

    this.aimBone(upper, axis, E.clone().sub(S));
    this.aimBone(lower, axis, T.sub(E));
    if (weight < 0.999) {
      upper.quaternion.slerpQuaternions(fkUpper, upper.quaternion.clone(), weight);
      lower.quaternion.slerpQuaternions(fkLower, lower.quaternion.clone(), weight);
    }
  }

  // ── behaviours ───────────────────────────────────────────────────────────
  play(name) {
    const def = GESTURES[name];
    if (!def) return;
    // one gesture at a time keeps the motion readable
    this.gestures = [{ name, def, t: 0, spin: 0 }];
    def.onStart?.(this);
    this.emit('gesture', name);
  }

  get busy() {
    return this.gestures.length > 0 || this.walkTarget !== null || !this.grounded;
  }

  jump(power = 3, delay = 0.1) {
    if (!this.grounded || this.pendingJump) return;
    this.pendingJump = { t: delay, power };
    this.squashV -= 2.2; // anticipation crouch
  }

  walkTo(x, z = 0, onArrive) {
    this.walkTarget = new THREE.Vector2(x, z);
    this.onArrive = onArrive || null;
  }

  setPlaying(on) {
    this.holdTarget = on ? 1 : 0;
  }

  get isPlaying() {
    return this.holdTarget > 0;
  }

  // ── per-frame update ─────────────────────────────────────────────────────
  update(dt) {
    this.time += dt;
    const t = this.time;

    // locomotion
    let moving = false;
    if (this.walkTarget) {
      const dx = this.walkTarget.x - this.root.position.x;
      const dz = this.walkTarget.y - this.root.position.z;
      const dist = Math.hypot(dx, dz);
      if (dist > 0.03) {
        moving = true;
        this.facingTarget = Math.atan2(dx, dz);
        const align = Math.max(0, Math.cos(wrapAngle(this.facingTarget - this.facing)));
        this.speed = damp(this.speed, Math.min(1.05, dist * 2.4 + 0.35) * align, 6, dt);
        const step = Math.min(dist, this.speed * dt);
        this.root.position.x += (dx / dist) * step;
        this.root.position.z += (dz / dist) * step;
      } else {
        this.walkTarget = null;
        this.facingTarget = 0;
        const cb = this.onArrive;
        this.onArrive = null;
        cb?.();
      }
    }
    if (!moving) this.speed = damp(this.speed, 0, 8, dt);
    this.walkWeight = damp(this.walkWeight, moving ? 1 : 0, 7, dt);
    this.walkPhase += dt * (this.speed / 0.95) * TAU;

    // facing (shortest path)
    this.facing += wrapAngle(this.facingTarget - this.facing) * (1 - Math.exp(-9 * dt));

    // jump physics + squash spring
    if (this.pendingJump) {
      this.pendingJump.t -= dt;
      if (this.pendingJump.t <= 0) {
        this.hopV = this.pendingJump.power;
        this.grounded = false;
        this.squashV += 3.2;
        this.pendingJump = null;
        this.emit('jump');
      }
    }
    if (!this.grounded) {
      this.hopV -= 15 * dt;
      this.hopY += this.hopV * dt;
      if (this.hopY <= 0) {
        this.hopY = 0;
        this.grounded = true;
        this.squashV -= Math.min(4.5, Math.abs(this.hopV) * 1.1);
        this.hopV = 0;
        this.emit('land');
      }
    }
    const k = 320;
    const c = 15;
    this.squashV += (-(this.squash - 1) * k - this.squashV * c) * dt;
    this.squash += this.squashV * dt;
    this.squash = clamp(this.squash, 0.72, 1.3);

    // gestures
    let spin = 0;
    for (const g of this.gestures) g.t += dt;
    this.gestures = this.gestures.filter((g) => g.t < g.def.dur);

    // 3DS hold blend
    this.hold = damp(this.hold, this.holdTarget, this.holdTarget ? 3 : 5, dt);
    this.updateDS(dt);

    // ── build pose ──
    for (const name in this.pose) this.pose[name].identity();
    const W = this.walkWeight;
    const breathe = Math.sin(t * 1.9);

    // base relaxed pose
    this.rot('Arm_1_L', 0, 0, -1.2 + breathe * 0.015);
    this.rot('Arm_1_R', 0, 0, 1.2 - breathe * 0.015);
    this.rot('Arm_1_L', -0.06, 0, 0);
    this.rot('Arm_1_R', -0.06, 0, 0);
    this.rot('Arm_2_L', 0, -0.22, 0);
    this.rot('Arm_2_R', 0, 0.22, 0);
    this.rot('Spine_2', breathe * 0.018, 0, 0);
    this.rot('Neck', -breathe * 0.012, 0, 0);
    const sway = Math.sin(t * 0.7);
    this.rot('Spine_1', 0, sway * 0.03, sway * 0.012 * (1 - W));
    this.rot('Head', 0, 0, Math.sin(t * 0.53) * 0.035 * (1 - W));

    // walk cycle
    if (W > 0.001) {
      const s = Math.sin(this.walkPhase);
      const cph = Math.cos(this.walkPhase);
      const A = 0.5 * W;
      const K = 0.85 * W;
      const kneeL = K * Math.max(0, cph);
      const kneeR = K * Math.max(0, -cph);
      this.rot('Leg_1_L', -A * s - kneeL * 0.35, 0, 0);
      this.rot('Leg_1_R', A * s - kneeR * 0.35, 0, 0);
      this.rot('Leg_2_L', kneeL, 0, 0);
      this.rot('Leg_2_R', kneeR, 0, 0);
      this.rot('Ankle_L', (A * s - kneeL * 0.65) * 0.7, 0, 0);
      this.rot('Ankle_R', (-A * s - kneeR * 0.65) * 0.7, 0, 0);
      this.rot('Arm_1_L', 0.55 * W * s, 0, 0);
      this.rot('Arm_1_R', -0.55 * W * s, 0, 0);
      this.rot('Arm_2_L', 0, -0.25 * W, 0);
      this.rot('Arm_2_R', 0, 0.25 * W, 0);
      this.rot('Spine_1', 0.07 * W, 0.12 * W * s, 0);
      this.rot('Waist', 0, -0.1 * W * s, 0.04 * W * s);
      this.rot('Head', -0.04 * W, -0.08 * W * s, 0);
    }

    // gestures
    for (const g of this.gestures) {
      const w = envelope(g.t, g.def.dur, g.def.fadeIn ?? 0.22, g.def.fadeOut ?? 0.32);
      g.def.apply(this, g.t, w, g);
      spin += g.spin || 0;
    }

    // airborne: tuck legs a little, arms up
    if (!this.grounded) {
      const air = clamp(this.hopY * 4, 0, 1);
      this.rot('Leg_1_L', -0.25 * air, 0, 0);
      this.rot('Leg_1_R', -0.25 * air, 0, 0);
      this.rot('Leg_2_L', 0.5 * air, 0, 0);
      this.rot('Leg_2_R', 0.5 * air, 0, 0);
      this.rot('Arm_1_L', 0, 0, 0.35 * air);
      this.rot('Arm_1_R', 0, 0, -0.35 * air);
    }

    // playing 3DS: hunch + look down (arms handled by IK below)
    const H = this.hold;
    if (H > 0.001) {
      this.rot('Spine_2', 0.12 * H, 0, 0);
      this.rot('Neck', 0.18 * H, 0, 0);
      this.rot('Head', 0.38 * H + Math.sin(t * 2.3) * 0.02 * H, Math.sin(t * 0.9) * 0.05 * H, 0);
    }

    // look-at (head & neck), faded while playing
    this.updateLook(dt);
    const lw = this.lookStrength * (1 - H);
    const { yaw, pitch } = this.look;
    this.rot('Spine_2', 0, yaw * 0.18 * lw, 0);
    this.rot('Neck', pitch * 0.35 * lw, yaw * 0.32 * lw, 0);
    this.rot('Head', pitch * 0.6 * lw, yaw * 0.5 * lw, -yaw * 0.06 * lw);

    this.applyPose();

    // root transforms
    this.root.rotation.y = this.facing + spin + this.extraYaw;
    const bob = W * (0.028 * Math.abs(Math.cos(this.walkPhase)) - 0.012);
    this.bones.Skl_Root.position.copy(this.rest.Skl_Root.p);
    this.bones.Skl_Root.position.y += bob + breathe * 0.002;
    this.body.position.y = this.hopY;
    const sq = this.squash;
    this.body.scale.set(1 / Math.sqrt(sq), sq, 1 / Math.sqrt(sq));

    // IK for holding the 3DS
    if (H > 0.001 && this.ds) {
      this.root.updateWorldMatrix(true, true);
      const wig = Math.sin(t * 7.3) * 0.006;
      const c = this.ds.position;
      const tl = this.body.localToWorld(_v1.set(c.x + 0.11, c.y - 0.085 + wig, c.z - 0.02));
      const tr = this.body.localToWorld(new THREE.Vector3(c.x - 0.11, c.y - 0.085 - wig, c.z - 0.02));
      const pl = this.body.localToWorld(new THREE.Vector3(0.6, 0.5, -0.1));
      const pr = this.body.localToWorld(new THREE.Vector3(-0.6, 0.5, -0.1));
      const w = smooth(H);
      this.solveArmIK('L', tl.clone(), pl, w);
      this.solveArmIK('R', tr, pr, w);
    }
  }

  updateLook(dt) {
    let tYaw = 0;
    let tPitch = 0;
    if (this.lookPoint) {
      const head = this.bones.Head.getWorldPosition(_v1);
      head.y += 0.25;
      const dir = _v2.copy(this.lookPoint).sub(head);
      dir.applyAxisAngle(new THREE.Vector3(0, 1, 0), -this.root.rotation.y);
      tYaw = Math.atan2(dir.x, dir.z);
      tPitch = -Math.atan2(dir.y, Math.hypot(dir.x, dir.z));
      if (Math.abs(tYaw) > 1.5) tYaw = Math.sign(tYaw) * 1.5;
      tYaw = clamp(tYaw, -1.0, 1.0);
      tPitch = clamp(tPitch, -0.45, 0.5);
    }
    this.look.yaw = damp(this.look.yaw, tYaw, 5, dt);
    this.look.pitch = damp(this.look.pitch, tPitch, 5, dt);
  }

  updateDS(dt) {
    if (!this.ds) return;
    const show = this.hold > 0.35 && this.holdTarget > 0;
    // springy pop in / out
    const target = show ? 1 : 0;
    this.dsScaleV = (this.dsScaleV || 0) + ((target - this.dsScale) * 260 - (this.dsScaleV || 0) * 16) * dt;
    this.dsScale = Math.max(0, this.dsScale + this.dsScaleV * dt);
    if (!show && this.dsScale < 0.02) {
      this.dsScale = 0;
      this.dsScaleV = 0;
    }
    this.ds.visible = this.dsScale > 0.01;
    this.ds.scale.setScalar(Math.max(0.0001, this.dsScale));
    const t = this.time;
    this.ds.position.copy(this.dsHome);
    this.ds.position.y += Math.sin(t * 7.3) * 0.004;
    this.ds.rotation.set(Math.sin(t * 1.3) * 0.03, Math.sin(t * 0.9) * 0.04, Math.sin(t * 7.3) * 0.02);
  }
}
