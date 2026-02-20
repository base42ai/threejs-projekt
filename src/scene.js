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

    // ===== BODEN =====
    const groundGeometry = new THREE.PlaneGeometry(WORLD_GEN.GROUND_SIZE, WORLD_GEN.GROUND_SIZE);
    const groundMaterial = new THREE.MeshStandardMaterial({
        color: WORLD_GEN.GROUND_COLOR,
        roughness: 0.95,
        metalness: 0.0
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Grasflecken mit PBR-Material
    const grassSpots = new THREE.Group();
    for (let i = 0; i < WORLD_GEN.GRASS_SPOT_COUNT; i++) {
        const spotGeometry = new THREE.PlaneGeometry(20 + Math.random() * 30, 20 + Math.random() * 30);
        const spotMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color().setHSL(0.28, 0.55, 0.27 + Math.random() * 0.09),
            roughness: 1.0,
            metalness: 0.0
        });
        const spot = new THREE.Mesh(spotGeometry, spotMaterial);
        spot.rotation.x = -Math.PI / 2;
        spot.position.set(
            (Math.random() - 0.5) * 480,
            0.01,
            (Math.random() - 0.5) * 480
        );
        grassSpots.add(spot);
    }
    scene.add(grassSpots);

    return { scene };
}
