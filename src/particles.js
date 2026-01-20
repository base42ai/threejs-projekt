// Simple Particle System for Explosions

export class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.activeExplosions = [];
    }

    spawnExplosion(position, color = 0xFF6600, intensity = 1) {
        const particleCount = Math.floor(30 * intensity);
        const particles = [];
        const velocities = [];
        
        // Create particle geometry
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        
        const baseColor = new THREE.Color(color);
        const orangeColor = new THREE.Color(0xFF8800);
        const yellowColor = new THREE.Color(0xFFFF00);
        
        for (let i = 0; i < particleCount; i++) {
            // Initial position at explosion point
            positions[i * 3] = position.x;
            positions[i * 3 + 1] = position.y;
            positions[i * 3 + 2] = position.z;
            
            // Random color variation (red/orange/yellow)
            const colorChoice = Math.random();
            const particleColor = colorChoice < 0.3 ? baseColor : 
                                 colorChoice < 0.7 ? orangeColor : yellowColor;
            colors[i * 3] = particleColor.r;
            colors[i * 3 + 1] = particleColor.g;
            colors[i * 3 + 2] = particleColor.b;
            
            // Random size
            sizes[i] = (Math.random() * 2 + 1) * intensity;
            
            // Random velocity
            const speed = (Math.random() * 0.8 + 0.4) * intensity;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            
            velocities.push({
                x: Math.sin(phi) * Math.cos(theta) * speed,
                y: Math.abs(Math.cos(phi) * speed), // Mostly upward
                z: Math.sin(phi) * Math.sin(theta) * speed
            });
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        // Create material
        const material = new THREE.PointsMaterial({
            size: 3,
            vertexColors: true,
            transparent: true,
            opacity: 1,
            sizeAttenuation: true,
            blending: THREE.AdditiveBlending
        });
        
        // Create points mesh
        const points = new THREE.Points(geometry, material);
        this.scene.add(points);
        
        // Store explosion data
        this.activeExplosions.push({
            points,
            velocities,
            age: 0,
            maxAge: 1000, // 1 second lifetime
            positions: geometry.attributes.position.array,
            sizes: geometry.attributes.size.array
        });
    }

    update(deltaTime = 16) {
        const dt = deltaTime / 1000; // Convert to seconds
        
        for (let i = this.activeExplosions.length - 1; i >= 0; i--) {
            const explosion = this.activeExplosions[i];
            explosion.age += deltaTime;
            
            const particleCount = explosion.velocities.length;
            const positions = explosion.positions;
            const sizes = explosion.sizes;
            
            // Update each particle
            for (let j = 0; j < particleCount; j++) {
                const vel = explosion.velocities[j];
                
                // Apply gravity
                vel.y -= 9.8 * dt * 0.5;
                
                // Update position
                positions[j * 3] += vel.x * dt * 10;
                positions[j * 3 + 1] += vel.y * dt * 10;
                positions[j * 3 + 2] += vel.z * dt * 10;
                
                // Shrink particles over time
                const lifeRatio = explosion.age / explosion.maxAge;
                sizes[j] *= 0.97;
            }
            
            // Update buffers
            explosion.points.geometry.attributes.position.needsUpdate = true;
            explosion.points.geometry.attributes.size.needsUpdate = true;
            
            // Fade out
            const lifeRatio = explosion.age / explosion.maxAge;
            explosion.points.material.opacity = 1 - lifeRatio;
            
            // Remove expired explosions
            if (explosion.age >= explosion.maxAge) {
                this.scene.remove(explosion.points);
                explosion.points.geometry.dispose();
                explosion.points.material.dispose();
                this.activeExplosions.splice(i, 1);
            }
        }
    }

    clear() {
        for (const explosion of this.activeExplosions) {
            this.scene.remove(explosion.points);
            explosion.points.geometry.dispose();
            explosion.points.material.dispose();
        }
        this.activeExplosions = [];
    }
}
