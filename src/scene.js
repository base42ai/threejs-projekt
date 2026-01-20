import { LIGHTING, WORLD_GEN } from './constants.js';

export function createScene() {
    const scene = new THREE.Scene();
    
    // Realistischer Himmel-Gradient
    scene.background = new THREE.Color(0x87CEEB); // Sky blue
    scene.fog = new THREE.Fog(0xCCE0FF, 300, 500); // Atmosphärischer Nebel

    // Realistisches Licht (Sonne + Himmelslicht)
    const ambientLight = new THREE.AmbientLight(0x7799BB, 0.4); // Bläuliches Himmelslicht
    scene.add(ambientLight);

    // Sonnenlicht (warm und hell)
    const directionalLight = new THREE.DirectionalLight(0xFFFFDD, 1.2);
    directionalLight.position.set(100, 150, 50); // Sonne schräg von oben
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.left = -300;
    directionalLight.shadow.camera.right = 300;
    directionalLight.shadow.camera.top = 300;
    directionalLight.shadow.camera.bottom = -300;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.bias = -0.0001;
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    // Zusätzliches Fülllicht (weicher)
    const fillLight = new THREE.DirectionalLight(0xBBDDFF, 0.3);
    fillLight.position.set(-50, 40, -50);
    scene.add(fillLight);

    // Realistischer Boden mit mehreren Schichten
    const groundGeometry = new THREE.PlaneGeometry(WORLD_GEN.GROUND_SIZE, WORLD_GEN.GROUND_SIZE, 50, 50);
    
    // Leichte Terrain-Variation
    const vertices = groundGeometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
        vertices[i + 2] = Math.random() * 0.5; // Kleine Höhen-Variation
    }
    groundGeometry.attributes.position.needsUpdate = true;
    groundGeometry.computeVertexNormals();
    
    const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x5D7B3C, // Realistisches Grasgrün
        roughness: 0.9,
        metalness: 0.0
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    ground.castShadow = false;
    scene.add(ground);

    // Verschiedene Gras-Schichten für Tiefe
    const grassSpots = new THREE.Group();
    for (let i = 0; i < WORLD_GEN.GRASS_SPOT_COUNT; i++) {
        const spotGeometry = new THREE.PlaneGeometry(20 + Math.random() * 40, 20 + Math.random() * 40);
        const hue = 0.25 + Math.random() * 0.05; // Grün-Variationen
        const saturation = 0.3 + Math.random() * 0.3;
        const lightness = 0.35 + Math.random() * 0.15;
        const spotMaterial = new THREE.MeshStandardMaterial({ 
            color: new THREE.Color().setHSL(hue, saturation, lightness),
            roughness: 0.95,
            metalness: 0.0
        });
        const spot = new THREE.Mesh(spotGeometry, spotMaterial);
        spot.rotation.x = -Math.PI / 2;
        spot.position.set(
            (Math.random() - 0.5) * 480,
            0.02,
            (Math.random() - 0.5) * 480
        );
        spot.receiveShadow = true;
        grassSpots.add(spot);
    }
    scene.add(grassSpots);

    // Realistischer Himmel mit Gradient
    const skyGeometry = new THREE.SphereGeometry(450, 32, 15);
    const skyMaterial = new THREE.ShaderMaterial({
        vertexShader: `
            varying vec3 vWorldPosition;
            void main() {
                vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                vWorldPosition = worldPosition.xyz;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            varying vec3 vWorldPosition;
            void main() {
                float h = normalize(vWorldPosition + vec3(0.0, 450.0, 0.0)).y;
                vec3 skyTop = vec3(0.2, 0.5, 0.95); // Dunkelblau oben
                vec3 skyHorizon = vec3(0.75, 0.85, 1.0); // Hellblau am Horizont
                gl_FragColor = vec4(mix(skyHorizon, skyTop, h), 1.0);
            }
        `,
        side: THREE.BackSide
    });
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    scene.add(sky);
    
    // Einfache Wolken
    const cloudGroup = new THREE.Group();
    for (let i = 0; i < 15; i++) {
        const cloudGeometry = new THREE.SphereGeometry(20 + Math.random() * 15, 8, 6);
        const cloudMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xFFFFFF,
            transparent: true,
            opacity: 0.6
        });
        const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
        cloud.position.set(
            (Math.random() - 0.5) * 600,
            80 + Math.random() * 40,
            (Math.random() - 0.5) * 600
        );
        cloud.scale.set(1 + Math.random(), 0.5 + Math.random() * 0.3, 1 + Math.random());
        cloudGroup.add(cloud);
    }
    scene.add(cloudGroup);

    return { scene };
}
