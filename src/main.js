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
import { DustParticles, TireMarks, SpeedLines } from './effects.js';

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
const { windmillBlades, infoSpots, colliders, ramps, roads, terrain, dragon } = createWorld(scene);

// Auto erstellen (mit Terrain-Referenz)
const car = new Car(scene, terrain);

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

// Realistische Effekte erstellen
const dustParticles = new DustParticles(scene);
const tireMarks = new TireMarks(scene);
const speedLines = new SpeedLines(scene, camera);

// Mission Progress Display UI
const progressDisplay = document.getElementById('mission-progress-display');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');

function updateMissionProgressDisplay() {
    const activeMission = missionManager.getActiveMission();
    
    if (activeMission) {
        const progress = missionManager.getMissionProgress();
        if (progress) {
            progressDisplay.classList.add('visible');
            const percentage = (progress.progress / progress.target) * 100;
            progressFill.style.width = `${percentage}%`;
            progressFill.textContent = `${Math.round(percentage)}%`;
            progressText.textContent = `${progress.progress} / ${progress.target}`;
        }
    } else {
        progressDisplay.classList.remove('visible');
    }
}

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
        events.emit(EVENT_TYPES.MISSION_PROGRESS, result);
        updateMissionProgressDisplay();
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
        events.emit(EVENT_TYPES.MISSION_PROGRESS, result);
        updateMissionProgressDisplay();
    }
});

events.on(EVENT_TYPES.MISSION_COMPLETE, (mission) => {
    console.log(`🎉 Mission Complete: ${mission.title}! Reward: +${mission.reward} points`);
    
    // Play success sound
    audioManager.play('success', { volume: AUDIO.SUCCESS_VOLUME });
    
    // Update display
    updateMissionProgressDisplay();
    
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
    
    // Check ramp collisions
    for (const ramp of ramps) {
        if (carBBox.intersectsBox(ramp.bbox) && !car.isAirborne) {
            // Car hit a ramp - launch it!
            car.launchFromRamp(ramp.angle, car.velocity);
            break; // Only one ramp at a time
        }
    }
    
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
    
    // Update realistische Effekte
    dustParticles.update();
    tireMarks.update();
    speedLines.update(car.getPosition(), Math.abs(car.velocity));
    
    // Staub-Partikel spawnen bei schneller Fahrt
    const speed = Math.abs(car.velocity);
    if (speed > 0.2 && Math.random() < 0.3) {
        const carPos = car.getPosition();
        const dustPos = carPos.clone();
        dustPos.x += (Math.random() - 0.5) * 2;
        dustPos.z += (Math.random() - 0.5) * 2;
        dustParticles.emit(dustPos, car.velocity);
    }
    
    // Reifenspuren bei starker Lenkung oder Drift
    if (speed > 0.15 && Math.abs(car.currentSteerAngle) > 0.3) {
        const intensity = Math.min(speed * 2, 1.0);
        const carPos = car.getPosition();
        tireMarks.addMark(carPos, car.direction, intensity);
    }

    // Update camera shake
    cameraShake.updateShake(camera);

    // Windmühlenflügel rotieren (from constants)
    if (windmillBlades) {
        windmillBlades.rotation.z += ANIMATION.WINDMILL_ROTATION_SPEED;
    }
    
    // Drache um die Ritterburg laufen lassen
    if (dragon) {
        const time = Date.now() * 0.0003; // Langsame Geschwindigkeit
        const radius = 50; // Radius um die Burg
        const dragonX = Math.cos(-time) * radius; // Negatives time für andere Richtung
        const dragonZ = Math.sin(-time) * radius + 200; // Burg ist bei z=200
        
        dragon.position.x = dragonX;
        dragon.position.z = dragonZ;
        
        // Drache schaut in Laufrichtung (mit 180° Korrektur wegen Drehung)
        dragon.rotation.y = time + Math.PI / 2;
        
        // Beine bewegen beim Laufen!
        const legWalk = Math.sin(Date.now() * 0.008) * 0.4;
        if (dragon.legs) {
            // Vorderbeine wechselseitig
            if (dragon.legs.frontLeft) dragon.legs.frontLeft.rotation.x = legWalk;
            if (dragon.legs.frontRight) dragon.legs.frontRight.rotation.x = -legWalk;
            // Hinterbeine wechselseitig (gegengleich zu vorne)
            if (dragon.legs.backLeft) dragon.legs.backLeft.rotation.x = -legWalk;
            if (dragon.legs.backRight) dragon.legs.backRight.rotation.x = legWalk;
        }
        
        // Flügel schlagen (leichte Animation)
        const wingFlap = Math.sin(Date.now() * 0.005) * 0.3;
        if (dragon.children[4]) dragon.children[4].rotation.z = -Math.PI / 6 + wingFlap; // Linker Flügel
        if (dragon.children[5]) dragon.children[5].rotation.z = Math.PI / 6 - wingFlap;  // Rechter Flügel
        
        // Feuer spucken! (Partikel)
        if (Math.random() < 0.1) { // 10% Chance pro Frame
            const fireParticle = new THREE.Mesh(
                new THREE.SphereGeometry(1 + Math.random() * 2, 8, 8),
                new THREE.MeshBasicMaterial({ 
                    color: Math.random() > 0.5 ? 0xFF4500 : 0xFFA500,
                    transparent: true,
                    opacity: 0.8
                })
            );
            
            // Position vor dem Drachenkopf
            const headX = dragonX + Math.cos(dragon.rotation.y) * 25;
            const headZ = dragonZ + Math.sin(dragon.rotation.y) * 25;
            fireParticle.position.set(headX, 15, headZ);
            
            // Geschwindigkeit in Blickrichtung
            fireParticle.velocity = new THREE.Vector3(
                Math.cos(dragon.rotation.y) * 2,
                Math.random() * 0.5 - 0.25,
                Math.sin(dragon.rotation.y) * 2
            );
            fireParticle.life = 1.0;
            
            scene.add(fireParticle);
            
            // Partikel nach kurzer Zeit entfernen
            setTimeout(() => {
                scene.remove(fireParticle);
                if (fireParticle.geometry) fireParticle.geometry.dispose();
                if (fireParticle.material) fireParticle.material.dispose();
            }, 1000);
        }
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
            
            uiOverlay.show(spot.title, spot.description, spot.id, spot.link);
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
        ramps: ramps,
        infoSpots: infoSpots,
        currentInfoSpot: gameState.currentInfoSpot,
        activeMission: missionManager.getActiveMission()
    });

    renderer.render(scene, camera);
}

// Animation starten
animate();
