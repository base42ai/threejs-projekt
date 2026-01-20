// Camera Shake Utility

export class CameraShake {
    constructor() {
        this.isShaking = false;
        this.duration = 0;
        this.elapsed = 0;
        this.strength = 0;
        this.originalPosition = new THREE.Vector3();
        this.offset = new THREE.Vector3();
    }

    startShake(durationMs, strength = 0.5) {
        this.isShaking = true;
        this.duration = durationMs;
        this.elapsed = 0;
        this.strength = strength;
    }

    updateShake(camera, deltaTime = 16) {
        if (!this.isShaking) return;

        this.elapsed += deltaTime;

        if (this.elapsed >= this.duration) {
            // Shake complete, reset
            this.isShaking = false;
            this.offset.set(0, 0, 0);
            return;
        }

        // Calculate shake intensity (decreases over time)
        const progress = this.elapsed / this.duration;
        const currentStrength = this.strength * (1 - progress);

        // Generate random offset
        this.offset.set(
            (Math.random() - 0.5) * currentStrength,
            (Math.random() - 0.5) * currentStrength,
            (Math.random() - 0.5) * currentStrength
        );
    }

    getOffset() {
        return this.offset;
    }

    reset() {
        this.isShaking = false;
        this.elapsed = 0;
        this.offset.set(0, 0, 0);
    }
}
