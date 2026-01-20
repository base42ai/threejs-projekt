// Visuelle Effekte für Realismus

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
