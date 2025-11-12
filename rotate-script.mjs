// Minimal Web Components-compatible script.
// Loaded via <pc-asset src="./rotate-script.mjs"> in index.html
// and attached with <pc-script name="rotateScript" ...>.

import { Script } from 'playcanvas';

export class RotateScript extends Script {
  // MUST match the <pc-script name="..."> value
  static scriptName = 'rotateScript';

  /** @attribute Speed in degrees per second */
  speed = 12;

  update(dt) {
    // Spin around local Y (rotate the camera rig smoothly)
    this.entity.rotateLocal(0, this.speed * dt, 0);
  }
}
