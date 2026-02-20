import * as THREE from 'three';
import { Sky } from 'three/addons/objects/Sky.js';
import { LIGHTING, WORLD_GEN } from './constants.js';

export function createScene() {
    const scene = new THREE.Scene();

    // ===== PHYSIKALISCHER HIMMEL =====
    const sky = new Sky();
    sky.scale.setScalar(450000);
    scene.add(sky);

    const skyUniforms = sky.material.uniforms;
    skyUniforms['turbidity'].value = 6;
    skyUniforms['rayleigh'].value = 1.2;
    skyUniforms['mieCoefficient'].value = 0.005;
    skyUniforms['mieDirectionalG'].value = 0.85;

    // Sonnenposition (Nachmittag, leicht tief für warme Stimmung)
    const sun = new THREE.Vector3();
    const elevation = 22; // Grad über dem Horizont
    const azimuth = 200;
    const phi = THREE.MathUtils.degToRad(90 - elevation);
    const theta = THREE.MathUtils.degToRad(azimuth);
    sun.setFromSphericalCoords(1, phi, theta);
    skyUniforms['sunPosition'].value.copy(sun);

    // Dunst am Horizont (passend zum Himmel)
    scene.fog = new THREE.FogExp2(0xc8d8e8, 0.0012);

    // ===== BELEUCHTUNG =====

    // Hemisphären-Licht (Himmel warm, Boden kühl-grün)
    const hemisphereLight = new THREE.HemisphereLight(
        0xFFF4D6,  // Warmes Sonnenlicht von oben
        0x2D4A1E,  // Dunkles Grün vom Boden
        0.9
    );
    scene.add(hemisphereLight);

    // Sanftes Umgebungslicht
    const ambientLight = new THREE.AmbientLight(0xFFEEDD, 0.35);
    scene.add(ambientLight);

    // Direktionales Sonnenlicht
    const directionalLight = new THREE.DirectionalLight(0xFFF8E0, 2.2);
    directionalLight.position.set(80, 120, -80);
    directionalLight.shadow.mapSize.width = LIGHTING.SHADOW_MAP_SIZE;
    directionalLight.shadow.mapSize.height = LIGHTING.SHADOW_MAP_SIZE;
    directionalLight.shadow.camera.left = -500;
    directionalLight.shadow.camera.right = 500;
    directionalLight.shadow.camera.top = 500;
    directionalLight.shadow.camera.bottom = -500;
    directionalLight.shadow.camera.far = 900;
    directionalLight.shadow.bias = -0.0002;
    directionalLight.shadow.normalBias = 0.02;
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Fülllicht von der Gegenseite (simuliert indirektes Licht)
    const fillLight = new THREE.DirectionalLight(0xADD8F0, 0.4);
    fillLight.position.set(-80, 40, 80);
    scene.add(fillLight);

    // ===== BODEN (WIESE) =====
    const groundGeometry = new THREE.PlaneGeometry(WORLD_GEN.GROUND_SIZE, WORLD_GEN.GROUND_SIZE, 40, 40);
    const groundMaterial = new THREE.MeshStandardMaterial({
        color: 0x4CAF50,   // Sattes Wiesengrün
        roughness: 1.0,
        metalness: 0.0
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Grasflecken – unterschiedliche Grüntöne wie eine echte Wiese
    const grassSpots = new THREE.Group();
    for (let i = 0; i < 300; i++) {
        const spotGeometry = new THREE.PlaneGeometry(8 + Math.random() * 20, 8 + Math.random() * 20);
        const spotMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color().setHSL(0.28 + Math.random() * 0.06, 0.65 + Math.random() * 0.2, 0.22 + Math.random() * 0.14),
            roughness: 1.0,
            metalness: 0.0
        });
        const spot = new THREE.Mesh(spotGeometry, spotMaterial);
        spot.rotation.x = -Math.PI / 2;
        spot.position.set(
            (Math.random() - 0.5) * 700,
            0.01,
            (Math.random() - 0.5) * 700
        );
        grassSpots.add(spot);
    }
    scene.add(grassSpots);

    // ===== GRASHALME (Büschel) =====
    const grassTuftMat = new THREE.MeshStandardMaterial({ color: 0x2E7D32, roughness: 1.0, metalness: 0.0, side: THREE.DoubleSide });
    const grassTuftMat2 = new THREE.MeshStandardMaterial({ color: 0x388E3C, roughness: 1.0, metalness: 0.0, side: THREE.DoubleSide });
    const grassTuftMat3 = new THREE.MeshStandardMaterial({ color: 0x558B2F, roughness: 1.0, metalness: 0.0, side: THREE.DoubleSide });
    const grassMats = [grassTuftMat, grassTuftMat2, grassTuftMat3];

    // Instanced Mesh für Grashalme – sehr performant
    const bladeGeo = new THREE.PlaneGeometry(0.3, 1.2);
    // Halme leicht nach oben versetzen
    bladeGeo.translate(0, 0.6, 0);

    const bladeCount = 6000;
    const bladeInstanced = new THREE.InstancedMesh(bladeGeo, grassTuftMat, bladeCount);
    bladeInstanced.receiveShadow = false;
    bladeInstanced.castShadow = false;

    const dummy = new THREE.Object3D();
    for (let i = 0; i < bladeCount; i++) {
        dummy.position.set(
            (Math.random() - 0.5) * 700,
            0,
            (Math.random() - 0.5) * 700
        );
        dummy.rotation.y = Math.random() * Math.PI * 2;
        // Leicht schräg für natürlichen Look
        dummy.rotation.z = (Math.random() - 0.5) * 0.4;
        const scale = 0.8 + Math.random() * 0.8;
        dummy.scale.set(scale, scale, scale);
        dummy.updateMatrix();
        bladeInstanced.setMatrixAt(i, dummy.matrix);
        // Verschiedene Grüntöne per Farbe
        const g = 0.4 + Math.random() * 0.35;
        bladeInstanced.setColorAt(i, new THREE.Color(0.1 + Math.random()*0.15, g, 0.05 + Math.random()*0.1));
    }
    bladeInstanced.instanceMatrix.needsUpdate = true;
    if (bladeInstanced.instanceColor) bladeInstanced.instanceColor.needsUpdate = true;
    scene.add(bladeInstanced);

    // Zweite Schicht Grashalme – gedreht für Kreuzeffekt
    const bladeInstanced2 = new THREE.InstancedMesh(bladeGeo, grassTuftMat2, bladeCount);
    for (let i = 0; i < bladeCount; i++) {
        dummy.position.set(
            (Math.random() - 0.5) * 700,
            0,
            (Math.random() - 0.5) * 700
        );
        dummy.rotation.y = Math.random() * Math.PI * 2;
        dummy.rotation.z = (Math.random() - 0.5) * 0.5;
        const scale = 0.6 + Math.random() * 0.7;
        dummy.scale.set(scale, scale * 1.2, scale);
        dummy.updateMatrix();
        bladeInstanced2.setMatrixAt(i, dummy.matrix);
        const g = 0.35 + Math.random() * 0.3;
        bladeInstanced2.setColorAt(i, new THREE.Color(0.08 + Math.random()*0.12, g, 0.04 + Math.random()*0.08));
    }
    bladeInstanced2.instanceMatrix.needsUpdate = true;
    if (bladeInstanced2.instanceColor) bladeInstanced2.instanceColor.needsUpdate = true;
    scene.add(bladeInstanced2);

    // ===== WILDBLUMEN =====
    const flowerColors = [0xFF4081, 0xFFD600, 0xFF6D00, 0xAA00FF, 0xFFFFFF, 0xF06292, 0x69F0AE];
    for (let i = 0; i < 800; i++) {
        const flowerGroup = new THREE.Group();
        const color = flowerColors[Math.floor(Math.random() * flowerColors.length)];

        // Stängel
        const stemGeo = new THREE.CylinderGeometry(0.04, 0.06, 0.8 + Math.random() * 0.5, 5);
        const stemMat = new THREE.MeshStandardMaterial({ color: 0x33691E });
        const stem = new THREE.Mesh(stemGeo, stemMat);
        stem.position.y = 0.4;
        flowerGroup.add(stem);

        // Blüte (kleine Kugel oder abgeflachte Scheibe)
        const flowerGeo = new THREE.SphereGeometry(0.12 + Math.random() * 0.1, 6, 6);
        const flowerMat = new THREE.MeshStandardMaterial({ color, roughness: 0.9, metalness: 0.0 });
        const flower = new THREE.Mesh(flowerGeo, flowerMat);
        flower.position.y = 0.85 + Math.random() * 0.4;
        flower.scale.set(1.5, 0.7, 1.5);
        flowerGroup.add(flower);

        flowerGroup.position.set(
            (Math.random() - 0.5) * 650,
            0,
            (Math.random() - 0.5) * 650
        );
        flowerGroup.rotation.y = Math.random() * Math.PI * 2;
        flowerGroup.rotation.z = (Math.random() - 0.5) * 0.2;
        scene.add(flowerGroup);
    }

    return { scene };
}
