import { ScriptType } from 'playcanvas';

class Autorotate extends ScriptType {
    initialize() {
        this.rotationSpeed = this.data.rotationSpeed || 30; // Degrees per second
    }

    update(dt) {
        // Rotate around Y-axis continuously
        this.entity.rotate(0, this.rotationSpeed * dt, 0);
    }
}

export { Autorotate };
