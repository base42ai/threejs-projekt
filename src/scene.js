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

    // Sonnenposition (Goldene Stunde – tief, warm, dramatisch)
    const sun = new THREE.Vector3();
    const elevation = 10; // Tiefe Sonne für goldene Stunde
    const azimuth = 200;
    const phi = THREE.MathUtils.degToRad(90 - elevation);
    const theta = THREE.MathUtils.degToRad(azimuth);
    sun.setFromSphericalCoords(1, phi, theta);
    skyUniforms['sunPosition'].value.copy(sun);
    skyUniforms['turbidity'].value = 8;        // Mehr Dunst → wärmerer Horizont
    skyUniforms['rayleigh'].value = 1.8;       // Mehr Streuung → rötlicherer Himmel
    skyUniforms['mieCoefficient'].value = 0.008;

    // Dunst am Horizont (warm, goldige Abenddämmerung)
    scene.fog = new THREE.FogExp2(0xFFBB80, 0.0009);

    // ===== BELEUCHTUNG =====

    // Hemisphären-Licht (Goldene Stunde – intensiv warm oben, sattes Grün unten)
    const hemisphereLight = new THREE.HemisphereLight(
        0xFFCC70,  // Goldenes Abendlicht von oben
        0x2D4A1E,  // Dunkles Grün vom Boden
        1.1
    );
    scene.add(hemisphereLight);

    // Sanftes Umgebungslicht (warm orange)
    const ambientLight = new THREE.AmbientLight(0xFFDDAA, 0.45);
    scene.add(ambientLight);

    // Direktionales Sonnenlicht (orange-goldenes Abendlicht)
    const directionalLight = new THREE.DirectionalLight(0xFFAA40, 2.8);
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

    // ===== PLANET MIT RINGEN IM HIMMEL =====
    const planetGroup = new THREE.Group();

    // Planetenkugel (Erde-ähnlich: Ozeane + Kontinente)
    const planetGeo = new THREE.SphereGeometry(70, 40, 40);
    const planetMat = new THREE.MeshStandardMaterial({
        color: 0x2266BB,      // Tiefseeblau (Ozean)
        roughness: 0.85,
        metalness: 0.0,
        emissive: 0x112244,
        emissiveIntensity: 0.2
    });
    const planetMesh = new THREE.Mesh(planetGeo, planetMat);
    planetMesh.castShadow = false;
    planetGroup.add(planetMesh);

    // Kontinente (grüne Patches auf der Oberfläche)
    const continentColors = [0x2D6B1E, 0x3A8A26, 0x1E5512, 0x4A9030, 0x266020];
    for (let i = 0; i < 14; i++) {
        const r = 12 + Math.random() * 28;
        const cGeo = new THREE.SphereGeometry(r, 12, 12);
        const cMat = new THREE.MeshStandardMaterial({
            color: continentColors[Math.floor(Math.random() * continentColors.length)],
            roughness: 1.0,
            metalness: 0.0,
            emissive: 0x0A1A05,
            emissiveIntensity: 0.08
        });
        const continent = new THREE.Mesh(cGeo, cMat);
        const theta2 = Math.random() * Math.PI * 2;
        const phi2 = (Math.random() * 0.8 + 0.1) * Math.PI; // Nicht an den Polen
        continent.position.set(
            Math.sin(phi2) * Math.cos(theta2) * 69,
            Math.sin(phi2) * Math.sin(theta2) * 69,
            Math.cos(phi2) * 69
        );
        continent.scale.set(1.0, 0.18, 1.0); // Flach aufgedrückt
        planetGroup.add(continent);
    }

    // Eispolkappen (weiß an den Polen)
    for (const poleSide of [1, -1]) {
        const icGeo = new THREE.SphereGeometry(22, 16, 16);
        const icMat = new THREE.MeshStandardMaterial({
            color: 0xEEEEFF,
            roughness: 0.9,
            metalness: 0.0,
            emissive: 0x8899BB,
            emissiveIntensity: 0.15
        });
        const icecap = new THREE.Mesh(icGeo, icMat);
        icecap.position.set(0, poleSide * 68, 0);
        icecap.scale.set(1.0, 0.2, 1.0);
        planetGroup.add(icecap);
    }

    // Atmosphären-Glühen (leicht blaue Hülle)
    const atmoGeo = new THREE.SphereGeometry(76, 32, 32);
    const atmoMat = new THREE.MeshStandardMaterial({
        color: 0x4488FF,
        transparent: true,
        opacity: 0.12,
        roughness: 1.0,
        metalness: 0.0,
        side: THREE.BackSide
    });
    const atmosphere = new THREE.Mesh(atmoGeo, atmoMat);
    planetGroup.add(atmosphere);

    // Wolkenschicht über dem Planeten
    const pCloudGeo = new THREE.SphereGeometry(73, 28, 28);
    const pCloudMat = new THREE.MeshStandardMaterial({
        color: 0xFFFFFF,
        transparent: true,
        opacity: 0.22,
        roughness: 1.0,
        metalness: 0.0
    });
    const pCloud = new THREE.Mesh(pCloudGeo, pCloudMat);
    planetGroup.add(pCloud);

    // Saturn-ähnliche Ringe (innerer Ring)
    const ringGeo = new THREE.RingGeometry(88, 130, 80);
    const ringMat = new THREE.MeshStandardMaterial({
        color: 0xC8A85A,
        transparent: true,
        opacity: 0.72,
        side: THREE.DoubleSide,
        roughness: 0.6,
        metalness: 0.15
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI * 0.4;
    planetGroup.add(ring);

    // Äußerer, dünnerer Ring
    const ring2Geo = new THREE.RingGeometry(136, 165, 80);
    const ring2Mat = new THREE.MeshStandardMaterial({
        color: 0xA08858,
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide,
        roughness: 0.75,
        metalness: 0.05
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = Math.PI * 0.4;
    planetGroup.add(ring2);

    // Planet positionieren – hoch am Himmel, gut sichtbar
    planetGroup.position.set(500, 380, -1300);
    planetGroup.rotation.z = 0.18;
    scene.add(planetGroup);

    // ===== WOLKEN IM HIMMEL =====
    function createCloud(x, y, z, scale) {
        const cloudGroup = new THREE.Group();
        const cloudMat = new THREE.MeshStandardMaterial({
            color: 0xFFEEDD,   // Leicht golden durch Abendlicht
            transparent: true,
            opacity: 0.82,
            roughness: 1.0,
            metalness: 0.0
        });
        const count = 7 + Math.floor(Math.random() * 6);
        for (let i = 0; i < count; i++) {
            const r = (10 + Math.random() * 22) * scale;
            const geo = new THREE.SphereGeometry(r, 8, 8);
            const mesh = new THREE.Mesh(geo, cloudMat);
            mesh.position.set(
                (Math.random() - 0.5) * 90 * scale,
                (Math.random() - 0.5) * 12 * scale,
                (Math.random() - 0.5) * 35 * scale
            );
            mesh.scale.set(1, 0.5, 1);
            cloudGroup.add(mesh);
        }
        cloudGroup.position.set(x, y, z);
        return cloudGroup;
    }

    const cloudDefs = [
        [120, 180, -250, 1.2],  [-280, 200, -160, 1.0],
        [60,  170, -380, 0.9],  [-160, 230, -300, 1.3],
        [320, 195, -190, 1.1],  [-60,  185, -420, 0.8],
        [10,  210, -510, 1.4],  [240, 220, -130, 0.7],
        [-330, 195, -90, 1.0],  [410, 175, -310, 1.2],
        [-420, 215, -360, 0.9], [90,  245, -600, 1.5],
        [180, 160, -100, 0.8],  [-200, 180, -480, 1.1],
        [370, 240, -450, 1.3],  [-100, 165, -230, 0.7],
    ];
    cloudDefs.forEach(([x, y, z, s]) => scene.add(createCloud(x, y, z, s)));

    return { scene, planetGroup };
}
