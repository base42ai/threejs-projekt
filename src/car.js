import { CAR_PHYSICS, WORLD_BOUNDS, ANIMATION } from './constants.js';

export class Car {
    constructor(scene) {
        // Position, velocity, direction
        this.position = new THREE.Vector3(0, 0, 0);
        this.velocity = 0;
        this.direction = 0; // rotation in radians
        this.lateralVelocity = 0; // Seitliche Geschwindigkeit für Drift
        
        // Physics properties (from constants)
        this.maxSpeed = CAR_PHYSICS.MAX_SPEED;
        this.acceleration = CAR_PHYSICS.ACCELERATION;
        this.brakeForce = CAR_PHYSICS.BRAKE_FORCE;
        this.friction = CAR_PHYSICS.FRICTION;
        this.turnSpeed = CAR_PHYSICS.TURN_SPEED;
        this.rotationSpeed = 0;
        this.currentSteerAngle = 0; // Aktueller Lenkwinkel der Vorderräder
        this.targetSteerAngle = 0;  // Ziel-Lenkwinkel

        // Mesh group
        this.mesh = new THREE.Group();
        scene.add(this.mesh);

        // Chassis (längeres, flacheres Auto)
        const chassisGeometry = new THREE.BoxGeometry(2.2, 0.8, 5);
        const chassisMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xFF0000,
            shininess: 100
        });
        const chassis = new THREE.Mesh(chassisGeometry, chassisMaterial);
        chassis.position.y = 0.8;
        chassis.castShadow = true;
        chassis.receiveShadow = true;
        this.mesh.add(chassis);

        // Kabine (Fahrerkabine)
        const cabinGeometry = new THREE.BoxGeometry(2, 1, 2.2);
        const cabinMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xCC0000,
            shininess: 100
        });
        const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
        cabin.position.set(0, 1.6, -0.3);
        cabin.castShadow = true;
        cabin.receiveShadow = true;
        this.mesh.add(cabin);

        // Windschutzscheibe
        const windshieldGeometry = new THREE.BoxGeometry(1.9, 0.7, 0.1);
        const windshieldMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x88CCFF,
            transparent: true,
            opacity: 0.6,
            shininess: 100
        });
        const windshield = new THREE.Mesh(windshieldGeometry, windshieldMaterial);
        windshield.position.set(0, 1.9, 0.8);
        windshield.rotation.x = -0.3;
        this.mesh.add(windshield);

        // Motorhaube (vorne)
        const hoodGeometry = new THREE.BoxGeometry(1.8, 0.3, 1.5);
        const hoodMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xFF0000,
            shininess: 100
        });
        const hood = new THREE.Mesh(hoodGeometry, hoodMaterial);
        hood.position.set(0, 1.2, 1.8);
        hood.castShadow = true;
        this.mesh.add(hood);

        // Kofferraum (hinten)
        const trunkGeometry = new THREE.BoxGeometry(1.8, 0.3, 0.8);
        const trunk = new THREE.Mesh(trunkGeometry, chassisMaterial);
        trunk.position.set(0, 1.2, -2.1);
        trunk.castShadow = true;
        this.mesh.add(trunk);

        // Scheinwerfer (vorne)
        const headlightGeometry = new THREE.SphereGeometry(0.2, 8, 8);
        const headlightMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xFFFFCC,
            emissive: 0xFFFF88,
            emissiveIntensity: 0.5
        });
        
        const headlightLeft = new THREE.Mesh(headlightGeometry, headlightMaterial);
        headlightLeft.position.set(-0.8, 1, 2.5);
        this.mesh.add(headlightLeft);
        
        const headlightRight = new THREE.Mesh(headlightGeometry, headlightMaterial);
        headlightRight.position.set(0.8, 1, 2.5);
        this.mesh.add(headlightRight);

        // Rücklichter
        const taillightMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xFF0000,
            emissive: 0xFF0000,
            emissiveIntensity: 0.3
        });
        
        const taillightLeft = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), taillightMaterial);
        taillightLeft.position.set(-0.8, 1, -2.5);
        this.mesh.add(taillightLeft);
        
        const taillightRight = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), taillightMaterial);
        taillightRight.position.set(0.8, 1, -2.5);
        this.mesh.add(taillightRight);

        // Spoiler (hinten)
        const spoilerGeometry = new THREE.BoxGeometry(2, 0.1, 0.6);
        const spoilerMaterial = new THREE.MeshPhongMaterial({ color: 0x222222 });
        const spoiler = new THREE.Mesh(spoilerGeometry, spoilerMaterial);
        spoiler.position.set(0, 1.8, -2.3);
        spoiler.castShadow = true;
        this.mesh.add(spoiler);

        // Räder (detaillierter)
        const wheelGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.5, 16);
        const wheelMaterial = new THREE.MeshPhongMaterial({ color: 0x222222 });
        const rimMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x888888,
            shininess: 80
        });
        
        this.wheels = [];
        this.wheelGroups = []; // Gruppen für Lenkung
        const wheelPositions = [
            { x: -1.1, y: 0.5, z: 1.5, isFront: true },   // Vorne links
            { x: 1.1, y: 0.5, z: 1.5, isFront: true },    // Vorne rechts
            { x: -1.1, y: 0.5, z: -1.5, isFront: false }, // Hinten links
            { x: 1.1, y: 0.5, z: -1.5, isFront: false }   // Hinten rechts
        ];
        
        wheelPositions.forEach(pos => {
            // Gruppe für Rad (für Lenkung der Vorderräder)
            const wheelGroup = new THREE.Group();
            wheelGroup.position.set(pos.x, pos.y, pos.z);
            this.mesh.add(wheelGroup);
            
            // Rad
            const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            wheel.rotation.z = Math.PI / 2;
            wheel.castShadow = true;
            wheel.receiveShadow = true;
            wheelGroup.add(wheel);
            
            // Felge (Ring in der Mitte)
            const rimGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.52, 16);
            const rim = new THREE.Mesh(rimGeometry, rimMaterial);
            rim.rotation.z = Math.PI / 2;
            wheelGroup.add(rim);
            
            this.wheels.push({ mesh: wheel, group: wheelGroup, isFront: pos.isFront });
            this.wheelGroups.push(wheelGroup);
        });

        // Bounding box for collision detection
        this.boundingBox = new THREE.Box3();
        this.updateBoundingBox();
    }

    updateBoundingBox() {
        this.boundingBox.setFromObject(this.mesh);
    }

    update(input, deltaTime = 1) {
        // Realistische Beschleunigung/Bremsung
        const isAccelerating = input.forward;
        const isBraking = input.backward;
        
        if (isAccelerating && this.velocity < this.maxSpeed) {
            // Beschleunigung nimmt mit höherer Geschwindigkeit ab (realistisch)
            const speedRatio = Math.abs(this.velocity) / this.maxSpeed;
            const currentAccel = this.acceleration * (1 - speedRatio * 0.7);
            this.velocity += currentAccel;
        } else if (isBraking) {
            if (this.velocity > 0.05) {
                // Bremsen bei Vorwärtsfahrt
                this.velocity -= this.brakeForce;
            } else if (this.velocity > -this.maxSpeed * CAR_PHYSICS.REVERSE_SPEED_MULTIPLIER) {
                // Rückwärtsgang
                this.velocity -= this.acceleration * 0.7;
            }
        } else {
            // Keine Eingabe: Rollwiderstand
            if (Math.abs(this.velocity) > 0.001) {
                this.velocity -= Math.sign(this.velocity) * CAR_PHYSICS.ROLLING_RESISTANCE;
            } else {
                this.velocity = 0;
            }
        }

        // Reibung
        this.velocity *= this.friction;

        // Lenkung mit analog/digital support
        let steerInput = 0;
        
        if (input.steer !== undefined) {
            steerInput = input.steer;
        } else {
            if (input.left) steerInput = -1;
            else if (input.right) steerInput = 1;
        }
        
        // Ziel-Lenkwinkel setzen (deutlich sichtbar!)
        this.targetSteerAngle = steerInput * CAR_PHYSICS.MAX_STEER_ANGLE; // Bis zu 40° Einschlag
        
        // Lenkwinkel sanft anpassen (realistische Lenkung)
        const steerDiff = this.targetSteerAngle - this.currentSteerAngle;
        this.currentSteerAngle += steerDiff * CAR_PHYSICS.STEERING_RETURN_SPEED;
        
        // Vorderräder visuell lenken - DEUTLICH SICHTBAR!
        this.wheels.forEach(wheel => {
            if (wheel.isFront) {
                wheel.group.rotation.y = this.currentSteerAngle;
            }
        });

        // Lenkung - NUR wenn Auto fährt (echte Auto-Physik!)
        if (Math.abs(this.velocity) > 0.05) {  // Höherer Schwellwert - Auto muss wirklich fahren
            // Lenkgeschwindigkeit direkt proportional zur Geschwindigkeit
            // Je schneller = desto weiter dreht es bei gleichem Lenkwinkel
            this.rotationSpeed = -this.currentSteerAngle * Math.abs(this.velocity) * CAR_PHYSICS.TURN_SPEED_MULTIPLIER;
            
            // Drift bei hoher Geschwindigkeit und starker Lenkung
            const speedFactor = Math.abs(this.velocity) / this.maxSpeed;
            if (speedFactor > CAR_PHYSICS.DRIFT_THRESHOLD && Math.abs(steerInput) > 0.5) {
                this.lateralVelocity += steerInput * 0.002;
                this.lateralVelocity *= CAR_PHYSICS.DRIFT_FACTOR;
            } else {
                this.lateralVelocity *= 0.95; // Seitliche Geschwindigkeit abbremsen
            }
        } else {
            // KEIN Lenken wenn Auto steht oder kaum rollt!
            this.rotationSpeed = 0;
            this.lateralVelocity = 0;
        }

        // Direction/Rotation aktualisieren
        this.direction += this.rotationSpeed;
        this.mesh.rotation.y = this.direction;
        
        // Position aktualisieren (mit Drift)
        const moveX = Math.sin(this.direction) * this.velocity;
        const moveZ = Math.cos(this.direction) * this.velocity;
        
        // Seitliche Bewegung (Drift)
        const lateralX = Math.cos(this.direction) * this.lateralVelocity;
        const lateralZ = -Math.sin(this.direction) * this.lateralVelocity;
        
        this.position.x += moveX + lateralX;
        this.position.z += moveZ + lateralZ;
        
        this.mesh.position.copy(this.position);

        // Grenzen setzen
        if (this.position.x > WORLD_BOUNDS.MAX_X) {
            this.position.x = WORLD_BOUNDS.MAX_X;
            this.velocity *= 0.5; // Abbremsen bei Kollision mit Grenze
        }
        if (this.position.x < WORLD_BOUNDS.MIN_X) {
            this.position.x = WORLD_BOUNDS.MIN_X;
            this.velocity *= 0.5;
        }
        if (this.position.z > WORLD_BOUNDS.MAX_Z) {
            this.position.z = WORLD_BOUNDS.MAX_Z;
            this.velocity *= 0.5;
        }
        if (this.position.z < WORLD_BOUNDS.MIN_Z) {
            this.position.z = WORLD_BOUNDS.MIN_Z;
            this.velocity *= 0.5;
        }

        // Räder drehen (um ihre eigene Achse)
        this.wheels.forEach(wheel => {
            wheel.mesh.rotation.x += this.velocity * ANIMATION.WHEEL_ROTATION_MULTIPLIER;
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
