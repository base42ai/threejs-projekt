// Visuelle Effekte für Realismus
import { 
    ShaderEffect, 
    HolographicPortal, 
    EnergyShield, 
    GlitchPlane,
    WaveFloor,
    ChromaticSphere
} from './shader.js';

export class DustParticles {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.maxParticles = 50;
    }
    
    emit(position, velocity) {
        if (this.particles.length >= this.maxParticles) {
            const oldest = this.particles.shift();
            this.scene.remove(oldest.mesh);
        }
        
        const particleGeo = new THREE.SphereGeometry(0.2 + Math.random() * 0.3, 4, 4);
        const particleMat = new THREE.MeshBasicMaterial({ 
            color: 0xD2B48C,
            transparent: true,
            opacity: 0.6
        });
        const particle = new THREE.Mesh(particleGeo, particleMat);
        
        particle.position.copy(position);
        particle.position.y = 0.3;
        
        this.scene.add(particle);
        
        const speedFactor = Math.abs(velocity) * 2;
        this.particles.push({
            mesh: particle,
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * speedFactor,
                0.5 + Math.random() * 0.5,
                (Math.random() - 0.5) * speedFactor
            ),
            life: 1.0,
            decay: 0.02 + Math.random() * 0.02
        });
    }
    
    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            // Position aktualisieren
            p.mesh.position.add(p.velocity);
            p.velocity.y -= 0.02; // Gravitation
            p.velocity.multiplyScalar(0.95); // Luftwiderstand
            
            // Leben verringern
            p.life -= p.decay;
            p.mesh.material.opacity = p.life * 0.6;
            
            // Entfernen wenn ausgeblendet
            if (p.life <= 0) {
                this.scene.remove(p.mesh);
                this.particles.splice(i, 1);
            }
        }
    }
}

export class TireMarks {
    constructor(scene) {
        this.scene = scene;
        this.marks = [];
        this.maxMarks = 200;
    }
    
    addMark(position, direction, intensity) {
        if (this.marks.length >= this.maxMarks) {
            const oldest = this.marks.shift();
            this.scene.remove(oldest);
        }
        
        const markGeo = new THREE.PlaneGeometry(0.4, 1.5);
        const markMat = new THREE.MeshBasicMaterial({ 
            color: 0x1a1a1a,
            transparent: true,
            opacity: intensity * 0.3,
            side: THREE.DoubleSide
        });
        const mark = new THREE.Mesh(markGeo, markMat);
        
        mark.rotation.x = -Math.PI / 2;
        mark.rotation.z = direction;
        mark.position.copy(position);
        mark.position.y = 0.02;
        
        this.scene.add(mark);
        this.marks.push(mark);
    }
    
    fadeMarks() {
        for (let i = this.marks.length - 1; i >= 0; i--) {
            const mark = this.marks[i];
            mark.material.opacity *= 0.995;
            
            if (mark.material.opacity < 0.02) {
                this.scene.remove(mark);
                this.marks.splice(i, 1);
            }
        }
    }
    
    update() {
        this.fadeMarks();
    }
}

export class SpeedLines {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.lines = [];
        this.maxLines = 30;
        this.enabled = false;
    }
    
    update(carPosition, speed) {
        // Speed lines nur bei hoher Geschwindigkeit
        const speedThreshold = 0.35;
        
        if (speed > speedThreshold) {
            this.enabled = true;
            
            // Neue Lines spawnen
            if (Math.random() < 0.3) {
                this.spawnLine(carPosition);
            }
        } else {
            this.enabled = false;
        }
        
        // Bestehende Lines updaten
        for (let i = this.lines.length - 1; i >= 0; i--) {
            const line = this.lines[i];
            
            line.mesh.position.z += 2; // Nach hinten bewegen
            line.life -= 0.05;
            line.mesh.material.opacity = line.life;
            
            if (line.life <= 0) {
                this.scene.remove(line.mesh);
                this.lines.splice(i, 1);
            }
        }
    }
    
    spawnLine(carPosition) {
        if (this.lines.length >= this.maxLines) {
            const oldest = this.lines.shift();
            this.scene.remove(oldest.mesh);
        }
        
        const lineGeo = new THREE.BoxGeometry(0.2, 0.1, 2);
        const lineMat = new THREE.MeshBasicMaterial({ 
            color: 0xFFFFFF,
            transparent: true,
            opacity: 0.5
        });
        const line = new THREE.Mesh(lineGeo, lineMat);
        
        // Position relativ zur Kamera
        const offset = new THREE.Vector3(
            (Math.random() - 0.5) * 20,
            0.5,
            -15 + Math.random() * 5
        );
        
        line.position.copy(carPosition).add(offset);
        
        this.scene.add(line);
        this.lines.push({
            mesh: line,
            life: 1.0
        });
    }
}

// ===== SHADER-BASIERTE EFFEKTE =====

// Manager für alle Shader-Effekte
export class ShaderEffectsManager {
    constructor(scene) {
        this.scene = scene;
        this.effects = [];
    }
    
    addEffect(effect) {
        this.effects.push(effect);
        return effect;
    }
    
    removeEffect(effect) {
        const index = this.effects.indexOf(effect);
        if (index > -1) {
            effect.remove(this.scene);
            this.effects.splice(index, 1);
        }
    }
    
    update(deltaTime) {
        this.effects.forEach(effect => effect.update(deltaTime));
    }
    
    clear() {
        this.effects.forEach(effect => effect.remove(this.scene));
        this.effects = [];
    }
}

// Holografische Info-Spots
export class HolographicInfoSpot {
    constructor(scene, position, radius = 2, color = 0x00ffff) {
        this.portal = new HolographicPortal(scene, position, radius, color);
        
        // Leuchtendes Licht über dem Portal
        const light = new THREE.PointLight(color, 0.5, 10);
        light.position.copy(position);
        light.position.y += 1;
        scene.add(light);
        this.light = light;
    }
    
    update(deltaTime) {
        this.portal.update(deltaTime);
        
        // Pulsierendes Licht
        this.light.intensity = 0.3 + Math.sin(this.portal.material.uniforms.uTime.value * 2) * 0.2;
    }
    
    remove(scene) {
        this.portal.remove(scene);
        scene.remove(this.light);
    }
}

// Animierte Schutzschild-Kugel für Power-Ups
export class ShieldPowerUp {
    constructor(scene, position, radius = 1.5, color = 0x00ff88) {
        this.shield = new EnergyShield(scene, position, radius, color);
        this.position = position.clone();
        this.rotation = 0;
        this.hoverOffset = 0;
        
        // Innere leuchtende Kugel
        const coreGeo = new THREE.SphereGeometry(radius * 0.3, 16, 16);
        const coreMat = new THREE.MeshBasicMaterial({ 
            color: color,
            transparent: true,
            opacity: 0.8
        });
        this.core = new THREE.Mesh(coreGeo, coreMat);
        this.core.position.copy(position);
        scene.add(this.core);
        
        // Licht
        this.light = new THREE.PointLight(color, 1, 15);
        this.light.position.copy(position);
        scene.add(this.light);
    }
    
    update(deltaTime) {
        this.shield.update(deltaTime);
        
        // Rotation
        this.rotation += deltaTime;
        this.shield.mesh.rotation.y = this.rotation;
        
        // Hover-Animation
        this.hoverOffset += deltaTime * 2;
        const hover = Math.sin(this.hoverOffset) * 0.3;
        this.shield.mesh.position.y = this.position.y + hover;
        this.core.position.y = this.position.y + hover;
        this.light.position.y = this.position.y + hover;
        
        // Pulsierendes Licht
        this.light.intensity = 0.8 + Math.sin(this.hoverOffset * 2) * 0.4;
    }
    
    remove(scene) {
        this.shield.remove(scene);
        scene.remove(this.core);
        scene.remove(this.light);
    }
}

// Glitch-Zone (Gefahrenzone mit visueller Störung)
export class GlitchZone {
    constructor(scene, position, size = 10, intensity = 0.5) {
        this.glitch = new GlitchPlane(scene, position, size, size);
        this.glitch.setIntensity(intensity);
        this.glitch.mesh.rotation.x = -Math.PI / 2;
        this.glitch.mesh.position.y = 0.1;
        
        // Warnsignale an den Ecken
        this.markers = [];
        const markerPositions = [
            new THREE.Vector3(-size/2, 0, -size/2),
            new THREE.Vector3(size/2, 0, -size/2),
            new THREE.Vector3(-size/2, 0, size/2),
            new THREE.Vector3(size/2, 0, size/2)
        ];
        
        markerPositions.forEach(offset => {
            const markerGeo = new THREE.CylinderGeometry(0.3, 0.3, 2, 8);
            const markerMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
            const marker = new THREE.Mesh(markerGeo, markerMat);
            marker.position.copy(position).add(offset);
            marker.position.y = 1;
            scene.add(marker);
            this.markers.push(marker);
        });
    }
    
    update(deltaTime) {
        this.glitch.update(deltaTime);
        
        // Blinkende Marker
        const blink = Math.sin(this.glitch.material.uniforms.uTime.value * 4) > 0;
        this.markers.forEach(marker => {
            marker.visible = blink;
        });
    }
    
    isInZone(position) {
        const dx = Math.abs(position.x - this.glitch.mesh.position.x);
        const dz = Math.abs(position.z - this.glitch.mesh.position.z);
        const size = 10; // Hardcoded, sollte aus Konstruktor kommen
        return dx < size/2 && dz < size/2;
    }
    
    remove(scene) {
        this.glitch.remove(scene);
        this.markers.forEach(marker => scene.remove(marker));
    }
}

// Dekorative Chromatic-Sphere (schwebende Kristalle)
export class FloatingCrystal {
    constructor(scene, position, radius = 0.5, color = 0xff00ff) {
        this.sphere = new ChromaticSphere(scene, position, radius, color);
        this.basePosition = position.clone();
        this.orbitAngle = Math.random() * Math.PI * 2;
        this.orbitRadius = 1 + Math.random();
        this.orbitSpeed = 0.5 + Math.random() * 0.5;
        this.floatOffset = Math.random() * Math.PI * 2;
    }
    
    update(deltaTime) {
        this.sphere.update(deltaTime);
        
        // Orbital-Bewegung
        this.orbitAngle += deltaTime * this.orbitSpeed;
        
        // Float-Bewegung
        this.floatOffset += deltaTime * 2;
        const float = Math.sin(this.floatOffset) * 0.5;
        
        // Position berechnen
        this.sphere.mesh.position.x = this.basePosition.x + Math.cos(this.orbitAngle) * this.orbitRadius;
        this.sphere.mesh.position.y = this.basePosition.y + float;
        this.sphere.mesh.position.z = this.basePosition.z + Math.sin(this.orbitAngle) * this.orbitRadius;
        
        // Rotation
        this.sphere.mesh.rotation.y += deltaTime;
        this.sphere.mesh.rotation.x += deltaTime * 0.5;
    }
    
    remove(scene) {
        this.sphere.remove(scene);
    }
}
