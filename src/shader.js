// Custom GLSL Shader für spezielle visuelle Effekte

// ===== 1. HOLOGRAPHIC SHADER =====
// Holografischer Effekt mit Scan-Lines und Farbverschiebung
export const HolographicShader = {
    uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(0x00ffff) },
        uAlpha: { value: 0.8 },
        uFrequency: { value: 20.0 }
    },
    vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        varying vec3 vNormal;
        
        void main() {
            vUv = uv;
            vPosition = position;
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float uTime;
        uniform vec3 uColor;
        uniform float uAlpha;
        uniform float uFrequency;
        
        varying vec2 vUv;
        varying vec3 vPosition;
        varying vec3 vNormal;
        
        void main() {
            // Scan-Lines-Effekt
            float scanLine = sin(vUv.y * uFrequency + uTime * 5.0) * 0.5 + 0.5;
            
            // Holografisches Flimmern
            float flicker = sin(uTime * 10.0) * 0.1 + 0.9;
            
            // Farbverschiebung
            vec3 color = uColor;
            color.r += sin(vUv.y * 10.0 + uTime) * 0.2;
            color.g += cos(vUv.y * 10.0 + uTime * 1.5) * 0.2;
            color.b += sin(vUv.y * 10.0 + uTime * 0.8) * 0.2;
            
            // Fresnel-Effekt (Rand-Leuchten)
            vec3 viewDirection = normalize(cameraPosition - vPosition);
            float fresnel = pow(1.0 - dot(viewDirection, vNormal), 3.0);
            
            // Finale Farbe kombinieren
            vec3 finalColor = color * (scanLine * 0.5 + 0.5) * flicker + fresnel * uColor * 0.5;
            
            gl_FragColor = vec4(finalColor, uAlpha * scanLine);
        }
    `
};

// ===== 2. ENERGY SHIELD SHADER =====
// Energie-Schild mit Hexagon-Pattern und Impact-Effekt
export const EnergyShieldShader = {
    uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(0x00ffff) },
        uImpactPoint: { value: new THREE.Vector3() },
        uImpactStrength: { value: 0.0 },
        uScale: { value: 10.0 }
    },
    vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        
        void main() {
            vUv = uv;
            vPosition = position;
            vNormal = normalize(normalMatrix * normal);
            vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float uTime;
        uniform vec3 uColor;
        uniform vec3 uImpactPoint;
        uniform float uImpactStrength;
        uniform float uScale;
        
        varying vec2 vUv;
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        
        // Hexagon-Pattern Generator
        float hexagon(vec2 p) {
            const vec2 h = vec2(1.0, 1.732);
            vec2 q = abs(p);
            return max(q.x * 0.866025 + q.y * 0.5, q.y) - 1.0;
        }
        
        float hexagonPattern(vec2 uv, float scale) {
            vec2 grid = uv * scale;
            vec2 r = vec2(1.0, 1.732);
            vec2 h = r * 0.5;
            vec2 a = mod(grid, r) - h;
            vec2 b = mod(grid - h, r) - h;
            return min(length(a), length(b));
        }
        
        void main() {
            // Hexagon-Pattern
            float hex = hexagonPattern(vUv, uScale);
            float hexLines = smoothstep(0.05, 0.1, hex);
            
            // Energie-Fluss Animation
            float flow = sin(hex * 5.0 - uTime * 2.0) * 0.5 + 0.5;
            
            // Impact-Effekt (Wellen von Trefferpunkt)
            float dist = distance(vWorldPosition, uImpactPoint);
            float impact = uImpactStrength * (1.0 - smoothstep(0.0, 5.0, dist));
            impact *= sin(dist * 2.0 - uTime * 10.0) * 0.5 + 0.5;
            
            // Fresnel-Effekt
            vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
            float fresnel = pow(1.0 - abs(dot(viewDirection, vNormal)), 2.0);
            
            // Finale Farbe
            vec3 color = uColor * (hexLines * 0.3 + fresnel * 0.7);
            color += uColor * flow * 0.2;
            color += uColor * impact;
            
            float alpha = fresnel * 0.6 + hexLines * 0.2 + impact * 0.5;
            
            gl_FragColor = vec4(color, alpha);
        }
    `
};

// ===== 3. GLITCH SHADER =====
// Glitch-Effekt für digitale Störungen
export const GlitchShader = {
    uniforms: {
        uTime: { value: 0 },
        uIntensity: { value: 0.5 },
        uColorShift: { value: 0.05 }
    },
    vertexShader: `
        varying vec2 vUv;
        
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float uTime;
        uniform float uIntensity;
        uniform float uColorShift;
        
        varying vec2 vUv;
        
        // Random-Funktion
        float random(vec2 st) {
            return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
        }
        
        void main() {
            vec2 uv = vUv;
            
            // Horizontale Glitches
            float glitchLine = floor(uv.y * 20.0);
            float glitchRandom = random(vec2(glitchLine, floor(uTime * 5.0)));
            
            if (glitchRandom > 1.0 - uIntensity * 0.1) {
                uv.x += (random(vec2(glitchLine, uTime)) - 0.5) * uIntensity * 0.5;
            }
            
            // RGB-Shift
            vec3 color;
            color.r = sin(uv.x * 10.0 + uTime) * 0.5 + 0.5;
            color.g = sin((uv.x + uColorShift) * 10.0 + uTime * 1.2) * 0.5 + 0.5;
            color.b = sin((uv.x - uColorShift) * 10.0 + uTime * 0.8) * 0.5 + 0.5;
            
            // Scanline-Effekt
            float scanline = sin(uv.y * 800.0) * 0.04;
            color -= scanline;
            
            // Block-Glitch
            float blockGlitch = step(0.98, random(vec2(floor(uv.y * 10.0), floor(uTime * 2.0))));
            color = mix(color, vec3(random(uv + uTime)), blockGlitch * uIntensity);
            
            gl_FragColor = vec4(color, 1.0);
        }
    `
};

// ===== 4. WAVE DISTORTION SHADER =====
// Wellen-Verzerrungseffekt
export const WaveDistortionShader = {
    uniforms: {
        uTime: { value: 0 },
        uAmplitude: { value: 0.5 },
        uFrequency: { value: 2.0 },
        uSpeed: { value: 1.0 },
        uColor: { value: new THREE.Color(0xffffff) }
    },
    vertexShader: `
        uniform float uTime;
        uniform float uAmplitude;
        uniform float uFrequency;
        uniform float uSpeed;
        
        varying vec2 vUv;
        varying float vDisplacement;
        
        void main() {
            vUv = uv;
            
            // Wellen-Displacement
            float displacement = sin(position.x * uFrequency + uTime * uSpeed) * 
                                sin(position.z * uFrequency + uTime * uSpeed * 0.7) * 
                                uAmplitude;
            
            vDisplacement = displacement;
            
            vec3 newPosition = position;
            newPosition.y += displacement;
            
            gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
        }
    `,
    fragmentShader: `
        uniform vec3 uColor;
        
        varying vec2 vUv;
        varying float vDisplacement;
        
        void main() {
            // Farbe basierend auf Displacement
            vec3 color = uColor;
            color += vDisplacement * 0.5;
            
            gl_FragColor = vec4(color, 1.0);
        }
    `
};

// ===== 5. CHROMATIC ABERRATION SHADER =====
// Chromatische Aberration (Farbtrennung)
export const ChromaticAberrationShader = {
    uniforms: {
        uTime: { value: 0 },
        uStrength: { value: 0.02 },
        uColor: { value: new THREE.Color(0xffffff) }
    },
    vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        
        void main() {
            vUv = uv;
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float uTime;
        uniform float uStrength;
        uniform vec3 uColor;
        
        varying vec2 vUv;
        varying vec3 vNormal;
        
        void main() {
            vec2 uv = vUv;
            
            // Chromatische Aberration
            float angle = atan(uv.y - 0.5, uv.x - 0.5);
            float dist = length(uv - 0.5);
            
            vec2 offset = vec2(cos(angle), sin(angle)) * uStrength * dist;
            
            float r = sin(uv.x * 10.0 + offset.x + uTime) * 0.5 + 0.5;
            float g = sin(uv.x * 10.0 + uTime * 1.1) * 0.5 + 0.5;
            float b = sin(uv.x * 10.0 - offset.x + uTime * 0.9) * 0.5 + 0.5;
            
            vec3 color = vec3(r, g, b) * uColor;
            
            gl_FragColor = vec4(color, 1.0);
        }
    `
};

// ===== SHADER HELPER KLASSE =====
export class ShaderEffect {
    constructor(scene, shader, geometry, position = new THREE.Vector3(0, 0, 0)) {
        this.shader = shader;
        this.material = new THREE.ShaderMaterial({
            uniforms: THREE.UniformsUtils.clone(shader.uniforms),
            vertexShader: shader.vertexShader,
            fragmentShader: shader.fragmentShader,
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false
        });
        
        this.mesh = new THREE.Mesh(geometry, this.material);
        this.mesh.position.copy(position);
        scene.add(this.mesh);
    }
    
    update(deltaTime) {
        if (this.material.uniforms.uTime) {
            this.material.uniforms.uTime.value += deltaTime;
        }
    }
    
    setUniform(name, value) {
        if (this.material.uniforms[name]) {
            this.material.uniforms[name].value = value;
        }
    }
    
    remove(scene) {
        scene.remove(this.mesh);
        this.material.dispose();
    }
}

// ===== SPEZIELLE EFFEKT-INSTANZEN =====

// Holografisches Portal
export class HolographicPortal extends ShaderEffect {
    constructor(scene, position, radius = 3, color = 0x00ffff) {
        const geometry = new THREE.CircleGeometry(radius, 32);
        super(scene, HolographicShader, geometry, position);
        this.setUniform('uColor', new THREE.Color(color));
        this.mesh.rotation.x = -Math.PI / 2; // Horizontal ausrichten
    }
}

// Energie-Schild um Objekt
export class EnergyShield extends ShaderEffect {
    constructor(scene, position, radius = 2, color = 0x00ffff) {
        const geometry = new THREE.SphereGeometry(radius, 32, 32);
        super(scene, EnergyShieldShader, geometry, position);
        this.setUniform('uColor', new THREE.Color(color));
        this.radius = radius;
    }
    
    impact(point, strength = 1.0) {
        this.setUniform('uImpactPoint', point);
        this.setUniform('uImpactStrength', strength);
        
        // Fade-out des Impact-Effekts
        setTimeout(() => {
            this.setUniform('uImpactStrength', 0);
        }, 500);
    }
}

// Glitch-Ebene
export class GlitchPlane extends ShaderEffect {
    constructor(scene, position, width = 10, height = 10) {
        const geometry = new THREE.PlaneGeometry(width, height);
        super(scene, GlitchShader, geometry, position);
    }
    
    setIntensity(intensity) {
        this.setUniform('uIntensity', intensity);
    }
}

// Wellen-Boden
export class WaveFloor extends ShaderEffect {
    constructor(scene, position, size = 50, color = 0x4444ff) {
        const geometry = new THREE.PlaneGeometry(size, size, 50, 50);
        super(scene, WaveDistortionShader, geometry, position);
        this.setUniform('uColor', new THREE.Color(color));
        this.mesh.rotation.x = -Math.PI / 2;
    }
}

// Chromatische Aberrations-Kugel
export class ChromaticSphere extends ShaderEffect {
    constructor(scene, position, radius = 1, color = 0xffffff) {
        const geometry = new THREE.SphereGeometry(radius, 32, 32);
        super(scene, ChromaticAberrationShader, geometry, position);
        this.setUniform('uColor', new THREE.Color(color));
    }
}
