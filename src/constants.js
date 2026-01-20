// Tunable Game Constants

// Car Physics
export const CAR_PHYSICS = {
    MAX_SPEED: 0.8,              // Höhere Maximalgeschwindigkeit
    ACCELERATION: 0.015,          // Langsamere Beschleunigung (realistischer)
    BRAKE_FORCE: 0.04,           // Stärkere Bremskraft
    FRICTION: 0.98,              // Weniger Reibung (Auto rollt weiter)
    ROLLING_RESISTANCE: 0.008,   // Verlangsamung ohne Gas
    TURN_SPEED: 0.025,
    TURN_SPEED_MULTIPLIER: 1.8,
    DRIFT_FACTOR: 0.92,          // Drift bei hoher Geschwindigkeit
    DRIFT_THRESHOLD: 0.4,        // Ab dieser Geschwindigkeit kann gedriftet werden
    REVERSE_SPEED_MULTIPLIER: 0.6, // Rückwärtsgang langsamer
    WEIGHT: 1200,                // Gewicht in kg (für Trägheit)
    STEERING_RETURN_SPEED: 0.2,  // Lenkräder kehren zur Mitte zurück (schneller)
    MAX_STEER_ANGLE: 0.7        // Maximaler Lenkwinkel (40°) - deutlich sichtbar!
};

// World Boundaries
export const WORLD_BOUNDS = {
    MIN_X: -240,
    MAX_X: 240,
    MIN_Z: -240,
    MAX_Z: 240
};

// Camera Settings
export const CAMERA_SETTINGS = {
    FOV: 75,
    NEAR: 0.1,
    FAR: 2000,
    OFFSET_Y: 5,
    OFFSET_Z: -12,
    LERP_FACTOR: 0.1,
    LOOKAT_LERP_FACTOR: 0.15
};

// Lighting
export const LIGHTING = {
    AMBIENT_COLOR: 0xffffff,
    AMBIENT_INTENSITY: 0.5,
    DIRECTIONAL_COLOR: 0xffffcc,
    DIRECTIONAL_INTENSITY: 1,
    DIRECTIONAL_POSITION: { x: 100, y: 150, z: 100 },
    SHADOW_MAP_SIZE: 4096
};

// Renderer
export const RENDERER_SETTINGS = {
    ANTIALIAS: true,
    SHADOW_MAP_ENABLED: true
};

// World Generation
export const WORLD_GEN = {
    GROUND_SIZE: 500,
    GROUND_COLOR: 0x3a8f3a,
    GRASS_SPOT_COUNT: 50,
    SKY_COLOR: 0x87CEEB,
    SKY_SIZE: 1000
};

// Animation
export const ANIMATION = {
    WINDMILL_ROTATION_SPEED: 0.02,
    WHEEL_ROTATION_MULTIPLIER: 0.15
};

// UI
export const UI_SETTINGS = {
    OVERLAY_FADE_DURATION: 300, // ms
    SCORE_INCREMENT_PER_SPOT: 10
};

// Audio (for future use)
export const AUDIO = {
    MASTER_VOLUME: 0.5,
    ENGINE_VOLUME: 0.3,
    EXPLOSION_VOLUME: 0.7,
    SUCCESS_VOLUME: 0.8,
    AMBIENT_VOLUME: 0.3,
    MUSIC_VOLUME: 0.4,
    ENGINE_IDLE_RATE: 0.8,
    ENGINE_MAX_RATE: 2.0
};
