// Offroad-Sandwege für Abenteuer
import * as THREE from 'three';

export function createRoads(scene) {
    const roads = [];
    
    // Material für Sandwege (heller Sand mit Textur-Effekt)
    const sandPathMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xD2B48C,  // Sand-braun
        shininess: 2,
        flatShading: false
    });
    
    // Hilfsfunktion: Erstelle geschwungenen Sandweg zwischen zwei Punkten
    function createSandPath(x1, z1, x2, z2, width = 8, segments = 50) {
        const path = [];
        const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(z2 - z1, 2));
        
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            // Leichte Kurve für natürlichen Look
            const curve = Math.sin(t * Math.PI) * 15;
            const x = x1 + (x2 - x1) * t + curve * Math.cos(t * Math.PI * 4);
            const z = z1 + (z2 - z1) * t + curve * Math.sin(t * Math.PI * 3);
            
            // Segment des Weges
            const segmentGeo = new THREE.PlaneGeometry(width, distance / segments + 2);
            const segment = new THREE.Mesh(segmentGeo, sandPathMaterial.clone());
            segment.rotation.x = -Math.PI / 2;
            
            // Berechne Rotation basierend auf Richtung
            if (i < segments) {
                const nextX = x1 + (x2 - x1) * ((i + 1) / segments);
                const nextZ = z1 + (z2 - z1) * ((i + 1) / segments);
                const angle = Math.atan2(nextZ - z, nextX - x);
                segment.rotation.z = -angle + Math.PI / 2;
            }
            
            segment.position.set(x, 0.02, z);
            segment.receiveShadow = true;
            scene.add(segment);
            roads.push(segment);
            
            // Kleine Steine am Wegrand für Offroad-Look
            if (Math.random() < 0.3) {
                const stoneGeo = new THREE.DodecahedronGeometry(0.3 + Math.random() * 0.4, 0);
                const stoneMat = new THREE.MeshPhongMaterial({ color: 0x696969, flatShading: true });
                const stone = new THREE.Mesh(stoneGeo, stoneMat);
                stone.position.set(
                    x + (Math.random() - 0.5) * (width + 2),
                    0.2,
                    z + (Math.random() - 0.5) * 2
                );
                stone.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
                stone.castShadow = true;
                scene.add(stone);
            }
        }
    }
    
    // Zentrale Kreuzung (Ritterburg im Norden)
    const center = { x: 0, z: 0 };
    
    // Wege zu den Spots (basierend auf INFO_SPOTS Positionen)
    // Zur Ritterburg (Norden)
    createSandPath(center.x, center.z, 0, 200, 8, 40);
    
    // Zum Icy Beach (Südost)
    createSandPath(center.x, center.z, 300, -300, 8, 60);
    
    // Zum Icy Hügel (Nordwest)
    createSandPath(center.x, center.z, -200, 150, 8, 50);
    
    // Zur Icy Industrie (Nordwest)
    createSandPath(-200, 150, -300, 300, 8, 40);
    
    // Zum Icy Dorf (Ost-Zentrum)
    createSandPath(center.x, center.z, 150, 85, 8, 35);
    
    // Zur Icy Mühle (Südwest vom Zentrum)
    createSandPath(center.x, center.z, 80, -150, 8, 35);
    
    // Zum Icy Schneegebiet (Nordost)
    createSandPath(center.x, center.z, 300, 300, 8, 60);
    
    // Zum See (Westen)
    createSandPath(center.x, center.z, -150, -100, 8, 35);
    
    // Zum Wald (Südwest)
    createSandPath(-150, -100, -120, -150, 6, 25);
    
    // Zur Wüste (Südwest)
    createSandPath(-120, -150, -300, -300, 8, 50);
    
    // Verbindung Dorf zu Beach
    createSandPath(150, 85, 300, -300, 7, 50);
    
    // Verbindung Mühle zu Wald
    createSandPath(80, -150, -120, -150, 6, 30);
    
    return roads;
}
