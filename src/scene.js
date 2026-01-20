import { LIGHTING, WORLD_GEN } from './constants.js';

export function createScene() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);

    // Licht mit Schatten (from constants)
    const ambientLight = new THREE.AmbientLight(LIGHTING.AMBIENT_COLOR, LIGHTING.AMBIENT_INTENSITY);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(LIGHTING.DIRECTIONAL_COLOR, LIGHTING.DIRECTIONAL_INTENSITY);
    directionalLight.position.set(
        LIGHTING.DIRECTIONAL_POSITION.x,
        LIGHTING.DIRECTIONAL_POSITION.y,
        LIGHTING.DIRECTIONAL_POSITION.z
    );
    directionalLight.shadow.mapSize.width = LIGHTING.SHADOW_MAP_SIZE;
    directionalLight.shadow.mapSize.height = LIGHTING.SHADOW_MAP_SIZE;
    directionalLight.shadow.camera.left = -300;
    directionalLight.shadow.camera.right = 300;
    directionalLight.shadow.camera.top = 300;
    directionalLight.shadow.camera.bottom = -300;
    directionalLight.shadow.camera.far = 500;
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Boden (große Welt) mit Texturen (from constants)
    const groundGeometry = new THREE.PlaneGeometry(WORLD_GEN.GROUND_SIZE, WORLD_GEN.GROUND_SIZE);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: WORLD_GEN.GROUND_COLOR });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    ground.castShadow = false;
    scene.add(ground);

    // Grasflecken für mehr Realismus (from constants)
    const grassSpots = new THREE.Group();
    for (let i = 0; i < WORLD_GEN.GRASS_SPOT_COUNT; i++) {
        const spotGeometry = new THREE.PlaneGeometry(20 + Math.random() * 30, 20 + Math.random() * 30);
        const spotMaterial = new THREE.MeshLambertMaterial({ 
            color: new THREE.Color().setHSL(0.3, 0.4, 0.35 + Math.random() * 0.1)
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

    // Himmel (from constants)
    const skyGeometry = new THREE.BoxGeometry(WORLD_GEN.SKY_SIZE, WORLD_GEN.SKY_SIZE, WORLD_GEN.SKY_SIZE);
    const skyMaterial = new THREE.MeshBasicMaterial({
        color: WORLD_GEN.SKY_COLOR,
        side: THREE.BackSide
    });
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    scene.add(sky);

    return { scene };
}
