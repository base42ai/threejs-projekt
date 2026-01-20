import { CAR_PHYSICS, WORLD_BOUNDS, ANIMATION } from './constants.js';

export class Car {
    constructor(scene) {
        // Position, velocity, direction
        this.position = new THREE.Vector3(0, 0, 0);
        this.velocity = 0;
        this.direction = 0; // rotation in radians
        
        // Physics properties (from constants)
        this.maxSpeed = CAR_PHYSICS.MAX_SPEED;
        this.acceleration = CAR_PHYSICS.ACCELERATION;
        this.friction = CAR_PHYSICS.FRICTION;
        this.turnSpeed = CAR_PHYSICS.TURN_SPEED;
        this.rotationSpeed = 0;

        // Mesh group
        this.mesh = new THREE.Group();
        scene.add(this.mesh);

        // Chassis
        const chassisGeometry = new THREE.BoxGeometry(2, 1.2, 4.5);
        const chassisMaterial = new THREE.MeshPhongMaterial({ color: 0xFF0000 });
        const chassis = new THREE.Mesh(chassisGeometry, chassisMaterial);
        chassis.position.y = 0.8;
        chassis.castShadow = true;
        chassis.receiveShadow = true;
        this.mesh.add(chassis);

        // Kabine
        const cabinGeometry = new THREE.BoxGeometry(1.6, 1, 1.8);
        const cabinMaterial = new THREE.MeshPhongMaterial({ color: 0xCC0000 });
        const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
        cabin.position.set(0, 1.7, -0.5);
        cabin.castShadow = true;
        cabin.receiveShadow = true;
        this.mesh.add(cabin);

        // Räder
        const wheelGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.4, 16);
        const wheelMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
        
        this.wheels = [];
        const wheelPositions = [
            [-1, 0.5, 1.2],
            [1, 0.5, 1.2],
            [-1, 0.5, -1.2],
            [1, 0.5, -1.2]
        ];
        
        wheelPositions.forEach(pos => {
            const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            wheel.rotation.z = Math.PI / 2;
            wheel.position.set(...pos);
            wheel.castShadow = true;
            wheel.receiveShadow = true;
            this.wheels.push(wheel);
            this.mesh.add(wheel);
        });

        // Bounding box for collision detection
        this.boundingBox = new THREE.Box3();
        this.updateBoundingBox();
    }

    updateBoundingBox() {
        this.boundingBox.setFromObject(this.mesh);
    }

    update(input, deltaTime = 1) {
        // Beschleunigung/Bremsing
        if (input.forward && this.velocity < this.maxSpeed) {
            this.velocity += this.acceleration;
        } else if (input.backward && this.velocity > -this.maxSpeed * 0.5) {
            this.velocity -= this.acceleration;
        } else {
            this.velocity *= this.friction;
        }

        // Lenkung (nur wenn Auto fährt)
        // Support both digital (left/right) and analog (steer) input
        let steerInput = 0;
        
        if (input.steer !== undefined) {
            // Analog steering from touch or converted keyboard
            steerInput = input.steer;
        } else {
            // Legacy digital input
            if (input.left) steerInput = -1;
            else if (input.right) steerInput = 1;
        }
        
        if (steerInput !== 0 && Math.abs(this.velocity) > 0.01) {
            this.rotationSpeed = -steerInput * this.turnSpeed * Math.abs(this.velocity) * CAR_PHYSICS.TURN_SPEED_MULTIPLIER;
        } else {
            this.rotationSpeed = 0; // Kein Drehen wenn steht
        }

        // Direction/Rotation aktualisieren
        this.direction += this.rotationSpeed;
        this.mesh.rotation.y = this.direction;
        
        // Position aktualisieren
        const moveX = Math.sin(this.direction) * this.velocity;
        const moveZ = Math.cos(this.direction) * this.velocity;
        
        this.position.x += moveX;
        this.position.z += moveZ;
        
        this.mesh.position.copy(this.position);

        // Grenzen setzen (from constants)
        if (this.position.x > WORLD_BOUNDS.MAX_X) this.position.x = WORLD_BOUNDS.MAX_X;
        if (this.position.x < WORLD_BOUNDS.MIN_X) this.position.x = WORLD_BOUNDS.MIN_X;
        if (this.position.z > WORLD_BOUNDS.MAX_Z) this.position.z = WORLD_BOUNDS.MAX_Z;
        if (this.position.z < WORLD_BOUNDS.MIN_Z) this.position.z = WORLD_BOUNDS.MIN_Z;

        // Räder drehen
        this.wheels.forEach(wheel => {
            wheel.rotation.x += this.velocity * ANIMATION.WHEEL_ROTATION_MULTIPLIER;
        });

        // Bounding box aktualisieren
        this.updateBoundingBox();
    }

    getPosition() {
        return this.position.clone();
    }

    getDirection() {
        return this.direction;
    }

    getBoundingBox() {
        return this.boundingBox;
    }
}
