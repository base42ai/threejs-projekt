import * as THREE from 'three';
import { CAMERA_SETTINGS } from './constants.js';

export function createFollowCamera() {
    const camera = new THREE.PerspectiveCamera(
        CAMERA_SETTINGS.FOV,
        window.innerWidth / window.innerHeight,
        CAMERA_SETTINGS.NEAR,
        CAMERA_SETTINGS.FAR
    );
    camera.position.set(0, 4, 8);

    // Camera offset (behind and above the car) - from constants
    const offset = new THREE.Vector3(0, CAMERA_SETTINGS.OFFSET_Y, CAMERA_SETTINGS.OFFSET_Z);
    
    // Smooth follow parameters - from constants
    const lerpFactor = CAMERA_SETTINGS.LERP_FACTOR;
    const lookAtLerpFactor = CAMERA_SETTINGS.LOOKAT_LERP_FACTOR;
    
    // Current target positions for smooth interpolation
    const currentTarget = new THREE.Vector3();
    const currentLookAt = new THREE.Vector3(0, 1, 0);

    function update(carGroup) {
        // Calculate desired camera position based on car's position and rotation
        const carPosition = carGroup.position.clone();
        const carRotation = carGroup.rotation.y;
        
        // Transform offset by car's rotation
        const rotatedOffset = offset.clone();
        rotatedOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), carRotation);
        
        // Desired camera position
        const desiredPosition = carPosition.clone().add(rotatedOffset);
        
        // Smoothly interpolate camera position (lerp)
        camera.position.lerp(desiredPosition, lerpFactor);
        
        // Desired look-at point (slightly above car center)
        const desiredLookAt = new THREE.Vector3(
            carPosition.x,
            carPosition.y + 1,
            carPosition.z
        );
        
        // Smoothly interpolate look-at target
        currentLookAt.lerp(desiredLookAt, lookAtLerpFactor);
        
        // Camera looks at the smoothed target
        camera.lookAt(currentLookAt);
    }

    return { camera, update };
}
