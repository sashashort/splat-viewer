// orbit-no-pan.mjs
import { Script, Vec3, math } from 'playcanvas';

export class OrbitNoPan extends Script {
  static scriptName = 'orbitNoPan';

  /** @attribute */ focusPoint = new Vec3(0, 0, 0);
  /** @attribute */ pitchRange = new Vec2(-80, -10); // degrees
  /** @attribute */ zoomRange  = new Vec2(1.6, 3.2);
  /** @attribute */ rotateSpeed = 0.25;
  /** @attribute */ touchRotateSpeed = 0.2;
  /** @attribute */ zoomSpeed = 0.003;

  initialize() {
    const cam = this.entity;
    const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

    let dist  = cam.getLocalPosition().distance(this.focusPoint);
    let yaw   = 16 * math.DEG_TO_RAD;
    let pitch = -28 * math.DEG_TO_RAD;

    const apply = () => {
      const cp = this.focusPoint;
      const x = cp.x + dist * Math.cos(pitch) * Math.sin(yaw);
      const y = cp.y + dist * Math.sin(pitch);
      const z = cp.z + dist * Math.cos(pitch) * Math.cos(yaw);
      cam.setLocalPosition(x, y, z);
      cam.lookAt(cp);
    };
    apply();

    // Mouse: left-drag rotate, wheel zoom (no pan)
    let dragging = false;
    this.app.mouse?.on('mousedown', e => { if (e.button===0) dragging = true; }, this);
    this.app.mouse?.on('mouseup',   () => { dragging = false; }, this);
    this.app.mouse?.on('mousemove', e => {
      if (!dragging) return;
      yaw   -= (e.dx * this.rotateSpeed) * 0.01;
      pitch -= (e.dy * this.rotateSpeed) * 0.01;
      pitch  = clamp(pitch, this.pitchRange.x*math.DEG_TO_RAD, this.pitchRange.y*math.DEG_TO_RAD);
      apply();
    }, this);
    this.app.mouse?.on('mousewheel', e => {
      dist += e.deltaY * this.zoomSpeed * dist;
      dist  = clamp(dist, this.zoomRange.x, this.zoomRange.y);
      apply();
    }, this);

    // Touch: 1-finger rotate, 2-finger pinch-zoom; NO PAN
    const state = { rotating:false, lastX:0, lastY:0, lastPinch:null };
    this.app.touch?.on('touchstart', e => {
      if (e.touches.length === 1) {
        const t=e.touches[0]; state.rotating=true; state.lastX=t.x; state.lastY=t.y;
      } else if (e.touches.length === 2) {
        const [t0,t1]=e.touches; state.lastPinch = Math.hypot(t1.x-t0.x, t1.y-t0.y);
      }
      e.event?.preventDefault();
    }, this);

    this.app.touch?.on('touchmove', e => {
      if (e.touches.length === 1 && state.rotating) {
        const t=e.touches[0];
        const dx=t.x-state.lastX, dy=t.y-state.lastY;
        state.lastX=t.x; state.lastY=t.y;
        yaw   -= dx * this.touchRotateSpeed * 0.01;
        pitch -= dy * this.touchRotateSpeed * 0.01;
        pitch  = clamp(pitch, this.pitchRange.x*math.DEG_TO_RAD, this.pitchRange.y*math.DEG_TO_RAD);
        apply();
      } else if (e.touches.length === 2) {
        const [t0,t1]=e.touches;
        const d = Math.hypot(t1.x-t0.x, t1.y-t0.y);
        if (state.lastPinch != null) {
          const delta = d - state.lastPinch;
          dist -= (delta * this.zoomSpeed * 0.05) * dist;
          dist  = clamp(dist, this.zoomRange.x, this.zoomRange.y);
          apply();
        }
        state.lastPinch = d;
      }
      e.event?.preventDefault();
    }, this);

    const end = () => { state.rotating=false; state.lastPinch=null; };
    this.app.touch?.on('touchend', end, this);
    this.app.touch?.on('touchcancel', end, this);
  }
}
