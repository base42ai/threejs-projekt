import { createScene } from './scene.js';
import { createWorld } from './world.js';
import { Car } from './car.js';
import { createFollowCamera } from './camera.js';
import { createInput } from './input.js';
import { UIOverlay } from './ui.js';
import { gameState } from './state.js';
import { events, EVENT_TYPES } from './events.js';
import { RENDERER_SETTINGS, ANIMATION, AUDIO } from './constants.js';
import { ParticleSystem } from './particles.js';
import { CameraShake } from './shake.js';
import { MissionManager } from './missions.js';
import { Minimap } from '../ui/minimap.js';
import { MissionUI } from './missionUI.js';
import { audioManager } from './audio-synthetic.js';

// Renderer mit Schatten (from constants)
const renderer = new THREE.WebGLRenderer({ antialias: RENDERER_SETTINGS.ANTIALIAS });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = RENDERER_SETTINGS.SHADOW_MAP_ENABLED;
renderer.shadowMap.type = THREE.PCFShadowShadowMap;
document.body.appendChild(renderer.domElement);

// Scene erstellen
const { scene } = createScene();

// Welt erstellen (Bäume, Häuser, See, etc.)
const { windmillBlades, infoSpots, colliders } = createWorld(scene);

// Auto erstellen
const car = new Car(scene);

// Kamera erstellen
const { camera, update: updateCamera } = createFollowCamera();

// Input erstellen
const { getState: getInputState } = createInput();

// UI Overlay erstellen
const uiOverlay = new UIOverlay();

// Particle system erstellen
const particleSystem = new ParticleSystem(scene);

// Camera shake erstellen
const cameraShake = new CameraShake();

// Mission manager erstellen
const missionManager = new MissionManager();

// Minimap erstellen
const minimap = new Minimap('minimap');

// Mission UI erstellen
const missionUI = new MissionUI(missionManager, gameState);

// Initialize audio manager and load sounds
let engineSoundId = null;
audioManager.init().then(() => {
    // Load sound files (will fail gracefully if files don't exist)
    audioManager.load('engine', 'assets/sounds/engine.mp3');
    audioManager.load('explosion', 'assets/sounds/explosion.mp3');
    audioManager.load('success', 'assets/sounds/success.mp3');
    
    // Set master volume from constants
    audioManager.setMasterVolume(AUDIO.MASTER_VOLUME);
});

// Start engine sound on first user interaction
let engineStarted = false;
window.addEventListener('keydown', () => {
    if (!engineStarted) {
        engineStarted = true;
        // Start engine loop sound
        engineSoundId = audioManager.loop('engine', { volume: AUDIO.ENGINE_VOLUME });
    }
}, { once: true });

// Start a default mission (optional)
// missionManager.startMission('explorer');
// gameState.startMission('explorer');

// Expose mission manager globally for debugging/console
window.missionManager = missionManager;
window.gameState = gameState;
window.audioManager = audioManager;

// Helper function to start a mission from console
window.startMission = (missionId) => {
    const mission = missionManager.startMission(missionId);
    if (mission) {
        gameState.startMission(missionId);
        console.log(`Mission started: ${mission.title}`);
        console.log(`Description: ${mission.description}`);
        console.log(`Target: ${mission.target}`);
    }
};

// Helper to get available missions
window.getAvailableMissions = () => {
    const missions = missionManager.getAvailableMissions();
    console.table(missions);
    return missions;
};

// Helper to get mission progress
window.getMissionProgress = () => {
    const progress = missionManager.getMissionProgress();
    if (progress) {
        console.log(`Mission: ${progress.title}`);
        console.log(`Progress: ${progress.progress}/${progress.target}`);
        console.log(`Completed: ${progress.completed}`);
    } else {
        console.log('No active mission');
    }
    return progress;
};

// Audio helper functions
window.setVolume = (volume) => {
    audioManager.setMasterVolume(volume);
    console.log(`Master volume set to ${volume}`);
};

window.playSound = (name) => {
    audioManager.play(name);
    console.log(`Playing sound: ${name}`);
};

window.stopSound = (name) => {
    audioManager.stop(name);
    console.log(`Stopped sound: ${name}`);
};

// Event listeners for game events
events.on(EVENT_TYPES.SPOT_ENTERED, (data) => {
    console.log(`Entered spot: ${data.spotId}`);
    
    // Update mission progress
    const result = missionManager.updateMission('spot_entered', data);
    if (result && result.completed) {
        gameState.completeMission(result.mission.id, result.mission.reward);
        events.emit(EVENT_TYPES.MISSION_COMPLETE, result.mission);
    } else if (result && result.progress !== undefined) {
        gameState.updateMissionProgress(result.progress);
    }
});

events.on(EVENT_TYPES.SPOT_EXITED, () => {
    console.log('Exited spot');
});

events.on(EVENT_TYPES.CAR_COLLISION, (data) => {
    // Play explosion sound
    audioManager.play('explosion', { volume: AUDIO.EXPLOSION_VOLUME });
    
    // Update mission progress for destruction missions
    const result = missionManager.updateMission('car_collision', data);
    if (result && result.completed) {
        gameState.completeMission(result.mission.id, result.mission.reward);
        events.emit(EVENT_TYPES.MISSION_COMPLETE, result.mission);
    } else if (result && result.progress !== undefined) {
        gameState.updateMissionProgress(result.progress);
    }
});

events.on(EVENT_TYPES.MISSION_COMPLETE, (mission) => {
    console.log(`🎉 Mission Complete: ${mission.title}! Reward: +${mission.reward} points`);
    
    // Play success sound
    audioManager.play('success', { volume: AUDIO.SUCCESS_VOLUME });
    
    // Update UI
    if (missionUI) {
        missionUI.update();
    }
});

// Window Resize Handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation Loop
function animate() {
    requestAnimationFrame(animate);

    // Input-Zustand abrufen
    const input = getInputState();

    // Auto aktualisieren
    car.update(input);

    // Update engine sound playback rate based on car speed
    if (engineSoundId && audioManager.isPlaying('engine')) {
        const speed = Math.abs(car.velocity);
        const normalizedSpeed = speed / car.maxSpeed;
        // Playback rate from constants
        const playbackRate = AUDIO.ENGINE_IDLE_RATE + normalizedSpeed * (AUDIO.ENGINE_MAX_RATE - AUDIO.ENGINE_IDLE_RATE);
        audioManager.setPlaybackRate(engineSoundId, playbackRate);
        
        // Adjust volume slightly with speed
        const volume = AUDIO.ENGINE_VOLUME * (0.7 + normalizedSpeed * 0.3);
        audioManager.setVolume(engineSoundId, volume);
    }

    // Check for collisions with crates
    const carBBox = car.getBoundingBox();
    for (const collider of colliders) {
        if (collider.isActive && carBBox.intersectsBox(collider.bbox)) {
            // Collision detected!
            const collisionPoint = collider.mesh.position.clone();
            collisionPoint.y = 4; // Middle of crate
            
            // Spawn explosion
            particleSystem.spawnExplosion(collisionPoint, 0xFF6600, 1.5);
            
            // Start camera shake
            cameraShake.startShake(400, 0.8);
            
            // Emit collision event
            events.emit(EVENT_TYPES.CAR_COLLISION, { colliderId: collider.id });
            
            // Remove/hide the crate
            collider.isActive = false;
            scene.remove(collider.mesh);
            
            // Dispose geometry and materials
            collider.mesh.traverse((child) => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(mat => mat.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            });
            
            console.log(`Collision with ${collider.id}!`);
        }
    }

    // Update particle system
    particleSystem.update();

    // Update camera shake
    cameraShake.updateShake(camera);

    // Windmühlenflügel rotieren (from constants)
    if (windmillBlades) {
        windmillBlades.rotation.z += ANIMATION.WINDMILL_ROTATION_SPEED;
    }

    // Check if car is in any infoSpot
    const carPos = car.getPosition();
    let inAnySpot = false;
    
    for (const spot of infoSpots) {
        const distance = carPos.distanceTo(spot.position);
        if (distance < spot.radius) {
            // Check if this is a new spot or first visit
            if (gameState.currentInfoSpot !== spot.id) {
                const isFirstVisit = gameState.visitSpot(spot.id);
                gameState.currentInfoSpot = spot.id;
                
                // Emit event
                events.emit(EVENT_TYPES.SPOT_ENTERED, {
                    spotId: spot.id,
                    title: spot.title,
                    isFirstVisit
                });
            }
            
            uiOverlay.show(spot.title, spot.description, spot.id);
            inAnySpot = true;
            break;
        }
    }
    
    // Hide overlay if not in any spot
    if (!inAnySpot && uiOverlay.isVisible()) {
        uiOverlay.hide();
        if (gameState.currentInfoSpot) {
            events.emit(EVENT_TYPES.SPOT_EXITED);
            gameState.currentInfoSpot = null;
        }
    }

    // Kamera aktualisieren
    updateCamera(car.mesh);

    // Apply camera shake offset if shaking
    const shakeOffset = cameraShake.getOffset();
    camera.position.add(shakeOffset);

    // Update minimap
    minimap.draw({
        carPosition: car.getPosition(),
        carDirection: car.getDirection(),
        colliders: colliders,
        infoSpots: infoSpots,
        currentInfoSpot: gameState.currentInfoSpot,
        activeMission: missionManager.getActiveMission()
    });

    renderer.render(scene, camera);
}

// Animation starten
animate();
