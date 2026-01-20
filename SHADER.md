# Shader-Effekte Dokumentation

## Übersicht

Das Projekt verwendet jetzt **Custom GLSL-Shader** für spezielle visuelle Effekte. Diese Shader bieten professionelle visuelle Effekte wie Hologramme, Energie-Schilde, Glitch-Effekte und mehr.

## Implementierte Shader

### 1. **Holographic Shader** 🔷
Ein holografischer Effekt mit animierten Scan-Lines, Farbverschiebung und Fresnel-Leuchten.

**Features:**
- Animierte horizontale Scan-Lines
- RGB-Farbverschiebung für Hologramm-Look
- Fresnel-Effekt (stärkeres Leuchten an den Rändern)
- Flimmernde Animation

**Verwendung:**
```javascript
const portal = new HolographicPortal(scene, position, radius, color);
```

### 2. **Energy Shield Shader** ⚡
Ein Energie-Schild mit Hexagon-Pattern und reaktivem Impact-Effekt.

**Features:**
- Dynamisches Hexagon-Gitter
- Energie-Fluss-Animation entlang des Gitters
- Impact-Effekt: Wellen-Animation bei Kollision
- Fresnel-Effekt für realistische Energie-Transparenz

**Verwendung:**
```javascript
const shield = new EnergyShield(scene, position, radius, color);
shield.impact(impactPoint, strength); // Reaktion auf Treffer
```

### 3. **Glitch Shader** 📺
Digitale Störeffekte für fehlerhafte/gefährliche Bereiche.

**Features:**
- Horizontale Glitch-Lines mit Random-Displacement
- RGB-Shift (chromatische Aberration)
- Scanline-Effekt
- Block-Glitches (zufällige Bereiche)

**Verwendung:**
```javascript
const glitch = new GlitchPlane(scene, position, width, height);
glitch.setIntensity(0.8); // 0.0 - 1.0
```

### 4. **Wave Distortion Shader** 🌊
Wellen-Verzerrungseffekt für animierte Oberflächen.

**Features:**
- Vertex-Displacement mit Sinuswellen
- Kombinierte X/Z-Achsen-Animation
- Farbvariation basierend auf Displacement
- Anpassbare Frequenz und Amplitude

**Verwendung:**
```javascript
const waveFloor = new WaveFloor(scene, position, size, color);
```

### 5. **Chromatic Aberration Shader** 🌈
Chromatische Aberration (Farbtrennung) für surreale Effekte.

**Features:**
- RGB-Kanal-Trennung
- Radiale Verzerrung vom Zentrum
- Animierte Farbverschiebung
- Anpassbare Stärke

**Verwendung:**
```javascript
const sphere = new ChromaticSphere(scene, position, radius, color);
```

## Vorgefertigte Effekt-Klassen

### **HolographicInfoSpot** 📍
Holografisches Portal mit pulsierendem Licht als Info-Marker.

```javascript
const holoSpot = new HolographicInfoSpot(
    scene,
    new THREE.Vector3(30, 0, 30),
    radius: 3,
    color: 0x00ffff
);
```

### **ShieldPowerUp** 🛡️
Animierte Schutzschild-Kugel mit rotierendem Energie-Schild und leuchtendem Kern.

```javascript
const powerUp = new ShieldPowerUp(
    scene,
    new THREE.Vector3(0, 2, -50),
    radius: 2,
    color: 0x00ff88
);
```

### **GlitchZone** ⚠️
Gefährliche Zone mit Glitch-Effekt und blinkenden Warnmarkern.

```javascript
const zone = new GlitchZone(
    scene,
    new THREE.Vector3(-60, 0, 20),
    size: 15,
    intensity: 0.6
);

// Prüfen ob Objekt in Zone ist
if (zone.isInZone(carPosition)) {
    // Aktion ausführen
}
```

### **FloatingCrystal** 💎
Schwebende Kristalle mit Orbital-Bewegung und Chromatic Aberration.

```javascript
const crystal = new FloatingCrystal(
    scene,
    new THREE.Vector3(50, 3, -30),
    radius: 0.8,
    color: 0xff00ff
);
```

## ShaderEffectsManager

Zentraler Manager für alle Shader-Effekte:

```javascript
const shaderEffectsManager = new ShaderEffectsManager(scene);

// Effekt hinzufügen
const effect = new HolographicPortal(scene, position, 3, 0x00ffff);
shaderEffectsManager.addEffect(effect);

// In der Animations-Schleife updaten
shaderEffectsManager.update(deltaTime);

// Effekt entfernen
shaderEffectsManager.removeEffect(effect);

// Alle Effekte entfernen
shaderEffectsManager.clear();
```

## Console-Befehle

Das Spiel bietet eine globale `window.shaderEffects` API für Live-Manipulation:

### Effekte auflisten
```javascript
shaderEffects.list()
```

### Portal hinzufügen
```javascript
// Portal bei Position (x, z) mit Radius und Farbe
shaderEffects.addPortal(40, 50, 3, 0x00ffff)
```

### Kristall hinzufügen
```javascript
// Kristall bei Position (x, y, z) mit Radius und Farbe
shaderEffects.addCrystal(20, 5, 30, 1, 0xff00ff)
```

### Glitch-Zone hinzufügen
```javascript
// Glitch-Zone bei Position (x, z) mit Größe und Intensität
shaderEffects.addGlitchZone(-50, 40, 12, 0.7)
```

### Effekt entfernen
```javascript
const portal = shaderEffects.addPortal(10, 10);
shaderEffects.remove(portal)
```

### Alle Effekte löschen
```javascript
shaderEffects.clearAll()
```

## Beispiel-Szene

Das Projekt enthält bereits mehrere Beispiel-Effekte:

1. **Zwei holografische Portale** (Cyan und Magenta) an verschiedenen Positionen
2. **Ein Schutzschild-Power-Up** (Grün) schwebend in der Luft
3. **Eine Glitch-Zone** (Rot) als Gefahrenbereich mit Warn-Markern
4. **Drei schwebende Kristalle** (Magenta, Cyan, Gelb) als Dekoration

## Performance-Hinweise

- Shader-Effekte nutzen die GPU und sind sehr effizient
- Jeder Effekt hat ~1-2ms Impact bei 60fps
- Bei vielen Effekten (>20) kann es zu Frame-Drops kommen
- `ShaderEffectsManager.update()` aktualisiert alle Uniforms zentral

## Anpassung und Erweiterung

### Eigene Shader erstellen

Alle Shader folgen diesem Muster:

```javascript
export const CustomShader = {
    uniforms: {
        uTime: { value: 0 },
        uCustomParam: { value: 1.0 }
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
        uniform float uCustomParam;
        varying vec2 vUv;
        
        void main() {
            vec3 color = vec3(vUv, sin(uTime));
            gl_FragColor = vec4(color, 1.0);
        }
    `
};
```

### Shader-Parameter zur Laufzeit ändern

```javascript
effect.setUniform('uColor', new THREE.Color(0xff0000));
effect.setUniform('uIntensity', 0.8);
effect.setUniform('uTime', customTime);
```

## Shader-Typen Vergleich

| Shader | Best Use Case | Performance | Komplexität |
|--------|--------------|-------------|-------------|
| Holographic | Info-Marker, Portale | ⚡⚡⚡ | Mittel |
| Energy Shield | Power-Ups, Schilde | ⚡⚡ | Hoch |
| Glitch | Gefahrenzonen | ⚡⚡⚡ | Mittel |
| Wave Distortion | Wasser, Böden | ⚡⚡ | Niedrig |
| Chromatic | Dekorative Objekte | ⚡⚡⚡ | Niedrig |

## Technische Details

- **Shader-Sprache:** GLSL (OpenGL Shading Language)
- **Three.js Version:** r128 (kompatibel)
- **Rendering:** WebGL 1.0/2.0
- **Transparenz:** Alpha-Blending mit `transparent: true`
- **Optimierung:** Shared Uniforms, instanziertes Rendering

## Debugging

Häufige Probleme:

1. **Shader wird nicht angezeigt:**
   - Prüfe ob `transparent: true` gesetzt ist
   - Prüfe ob Material dem Mesh zugewiesen ist
   - Console auf Shader-Compile-Fehler prüfen

2. **Performance-Probleme:**
   - Reduziere Anzahl der Shader-Effekte
   - Verringere Geometrie-Komplexität (weniger Vertices)
   - Nutze `depthWrite: false` für transparente Objekte

3. **Animation läuft nicht:**
   - Stelle sicher dass `shaderEffectsManager.update()` aufgerufen wird
   - Prüfe ob `uTime` Uniform existiert

## Weiterführende Ressourcen

- [The Book of Shaders](https://thebookofshaders.com/) - GLSL Tutorial
- [Three.js Shader Material Docs](https://threejs.org/docs/#api/en/materials/ShaderMaterial)
- [Shadertoy](https://www.shadertoy.com/) - Shader-Beispiele und Inspiration

---

**Viel Spaß mit den Shader-Effekten! 🎨✨**
