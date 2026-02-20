import * as THREE from 'three';
import { CAR_PHYSICS, WORLD_BOUNDS, ANIMATION } from './constants.js';

export class Car {
    constructor(scene, terrain = null) {
        // Position, velocity, direction
        this.position = new THREE.Vector3(0, 0, 0);
        this.velocity = 0;
        this.direction = 0; // rotation in radians
        this.lateralVelocity = 0; // Seitliche Geschwindigkeit für Drift
        
        // Terrain reference für Höhenberechnung
        this.terrain = terrain;
        
        // Check if mobile device for speed adjustment
        this.isMobile = navigator.maxTouchPoints > 0 || window.matchMedia('(pointer: coarse)').matches;
        this.mobileSpeedMultiplier = 2.5; // 150% schneller auf Mobile
        
        // Jump physics
        this.verticalVelocity = 0;
        this.isAirborne = false;
        this.groundLevel = 0;
        this.gravity = -0.02; // Etwas weniger Gravitation für längere Flugzeit
        
        // Physics properties (from constants)
        this.maxSpeed = CAR_PHYSICS.MAX_SPEED * (this.isMobile ? this.mobileSpeedMultiplier : 1);
        this.acceleration = CAR_PHYSICS.ACCELERATION * (this.isMobile ? this.mobileSpeedMultiplier : 1);
        this.brakeForce = CAR_PHYSICS.BRAKE_FORCE;
        this.friction = CAR_PHYSICS.FRICTION;
        this.turnSpeed = CAR_PHYSICS.TURN_SPEED;
        this.rotationSpeed = 0;
        this.currentSteerAngle = 0; // Aktueller Lenkwinkel der Vorderräder
        this.targetSteerAngle = 0;  // Ziel-Lenkwinkel

        // Mesh group
        this.mesh = new THREE.Group();
        scene.add(this.mesh);

        // ============================================================
        //  JEEP / GELÄNDEWAGEN
        // ============================================================

        // --- Materialien ---
        const jeepBodyMat = new THREE.MeshStandardMaterial({
            color: 0x4E6B3A,   // Militär-Olivgrün
            roughness: 0.75,
            metalness: 0.15
        });
        const jeepDarkMat = new THREE.MeshStandardMaterial({
            color: 0x2C3E2D,
            roughness: 0.85,
            metalness: 0.1
        });
        const jeepBlackMat = new THREE.MeshStandardMaterial({
            color: 0x111111,
            roughness: 0.9,
            metalness: 0.05
        });
        const jeepMetalMat = new THREE.MeshStandardMaterial({
            color: 0x888888,
            roughness: 0.4,
            metalness: 0.8
        });
        const glassMat = new THREE.MeshPhongMaterial({
            color: 0x88CCFF,
            transparent: true,
            opacity: 0.55,
            shininess: 150
        });
        const headlightMat = new THREE.MeshPhongMaterial({
            color: 0xFFFFCC,
            emissive: 0xFFFF88,
            emissiveIntensity: 0.7
        });
        const taillightMat = new THREE.MeshPhongMaterial({
            color: 0xFF2200,
            emissive: 0xFF0000,
            emissiveIntensity: 0.5
        });
        const exhaustMat = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.6, metalness: 0.7 });

        // --- Unterrahmen (Leiterrahmen) – hohe Bodenfreiheit ---
        const frameGeo = new THREE.BoxGeometry(2.6, 0.25, 5.8);
        const frame = new THREE.Mesh(frameGeo, jeepDarkMat);
        frame.position.y = 1.05;
        frame.castShadow = true;
        frame.receiveShadow = true;
        this.mesh.add(frame);

        // --- Hauptkarosserie (Jeep-typisch: boxy, aufrecht) ---
        const bodyGeo = new THREE.BoxGeometry(2.7, 1.1, 5.6);
        const body = new THREE.Mesh(bodyGeo, jeepBodyMat);
        body.position.y = 1.75;
        body.castShadow = true;
        body.receiveShadow = true;
        this.mesh.add(body);

        // --- Kabinendach (flach, typischer Jeep) ---
        const roofGeo = new THREE.BoxGeometry(2.55, 0.12, 2.7);
        const roof = new THREE.Mesh(roofGeo, jeepDarkMat);
        roof.position.set(0, 2.95, -0.2);
        roof.castShadow = true;
        this.mesh.add(roof);

        // --- Windschutzscheibe (leicht schräg) ---
        const wsGeo = new THREE.BoxGeometry(2.3, 0.95, 0.12);
        const ws = new THREE.Mesh(wsGeo, glassMat);
        ws.position.set(0, 2.42, 1.14);
        ws.rotation.x = -0.18;
        this.mesh.add(ws);

        // --- Heckscheibe ---
        const rearGlassGeo = new THREE.BoxGeometry(2.1, 0.85, 0.12);
        const rearGlass = new THREE.Mesh(rearGlassGeo, glassMat);
        rearGlass.position.set(0, 2.42, -1.54);
        rearGlass.rotation.x = 0.12;
        this.mesh.add(rearGlass);

        // --- Seitenfenster links & rechts ---
        for (let side of [-1, 1]) {
            const sideWinGeo = new THREE.BoxGeometry(0.1, 0.78, 2.4);
            const sideWin = new THREE.Mesh(sideWinGeo, glassMat);
            sideWin.position.set(side * 1.28, 2.42, -0.18);
            this.mesh.add(sideWin);
        }

        // --- Motorhaube (leicht gewölbt / hochgestellt) ---
        const hoodGeo = new THREE.BoxGeometry(2.55, 0.18, 2.0);
        const hood = new THREE.Mesh(hoodGeo, jeepBodyMat);
        hood.position.set(0, 2.35, 1.95);
        hood.castShadow = true;
        this.mesh.add(hood);

        // Lufthutze auf der Haube
        const scoopGeo = new THREE.BoxGeometry(0.6, 0.15, 0.5);
        const scoop = new THREE.Mesh(scoopGeo, jeepDarkMat);
        scoop.position.set(0, 2.47, 1.8);
        this.mesh.add(scoop);

        // --- Kotflügel (ausgestellte Jeep-Backen) ---
        for (let side of [-1, 1]) {
            const fenderGeo = new THREE.BoxGeometry(0.22, 0.45, 5.2);
            const fender = new THREE.Mesh(fenderGeo, jeepBodyMat);
            fender.position.set(side * 1.47, 1.65, 0);
            fender.castShadow = true;
            this.mesh.add(fender);
        }

        // --- Frontgrill (charakteristisches Jeep-Sieben-Schlitz-Design) ---
        const grillBaseGeo = new THREE.BoxGeometry(2.55, 0.85, 0.12);
        const grillBase = new THREE.Mesh(grillBaseGeo, jeepBlackMat);
        grillBase.position.set(0, 1.75, 2.88);
        this.mesh.add(grillBase);
        // Schlitze
        for (let i = -3; i <= 3; i++) {
            const slotGeo = new THREE.BoxGeometry(0.18, 0.55, 0.15);
            const slot = new THREE.Mesh(slotGeo, jeepDarkMat);
            slot.position.set(i * 0.32, 1.75, 2.92);
            this.mesh.add(slot);
        }

        // --- Stoßstange vorne (massiver Offroad-Bumper) ---
        const bumperFrontGeo = new THREE.BoxGeometry(2.9, 0.45, 0.35);
        const bumperFront = new THREE.Mesh(bumperFrontGeo, jeepMetalMat);
        bumperFront.position.set(0, 1.2, 3.0);
        bumperFront.castShadow = true;
        this.mesh.add(bumperFront);

        // Seilwinde an der Stoßstange
        const winchGeo = new THREE.CylinderGeometry(0.22, 0.22, 1.0, 8);
        const winch = new THREE.Mesh(winchGeo, exhaustMat);
        winch.rotation.z = Math.PI / 2;
        winch.position.set(0, 1.2, 3.2);
        this.mesh.add(winch);

        // --- Stoßstange hinten ---
        const bumperRearGeo = new THREE.BoxGeometry(2.7, 0.4, 0.3);
        const bumperRear = new THREE.Mesh(bumperRearGeo, jeepMetalMat);
        bumperRear.position.set(0, 1.2, -3.0);
        bumperRear.castShadow = true;
        this.mesh.add(bumperRear);

        // --- Überrollbügel (Roll Cage) ---
        const rollBarMat = jeepMetalMat;
        const makeTube = (geo, x, y, z, rx, ry, rz) => {
            const m = new THREE.Mesh(geo, rollBarMat);
            m.position.set(x, y, z);
            m.rotation.set(rx, ry, rz);
            m.castShadow = true;
            this.mesh.add(m);
        };
        const rollBarV = new THREE.CylinderGeometry(0.08, 0.08, 1.55, 7);
        // Vertikale Stützen
        makeTube(rollBarV.clone(), -1.2, 2.25, 0.3,  0, 0, 0);
        makeTube(rollBarV.clone(),  1.2, 2.25, 0.3,  0, 0, 0);
        makeTube(rollBarV.clone(), -1.2, 2.25, -1.4, 0, 0, 0);
        makeTube(rollBarV.clone(),  1.2, 2.25, -1.4, 0, 0, 0);
        // Querstäbe oben
        const rollBarH = new THREE.CylinderGeometry(0.08, 0.08, 2.4, 7);
        makeTube(rollBarH.clone(), 0, 3.0,  0.3, 0, 0, Math.PI / 2);
        makeTube(rollBarH.clone(), 0, 3.0, -1.4, 0, 0, Math.PI / 2);
        // Diagonalen
        const rollBarD = new THREE.CylinderGeometry(0.07, 0.07, 1.5, 6);
        makeTube(rollBarD.clone(), 0, 2.55, -0.55, Math.PI / 2, 0, 0);

        // --- Reserverad auf der Heckklappe ---
        const spareRimGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.45, 14);
        const spareTireGeo = new THREE.CylinderGeometry(0.9, 0.9, 0.52, 14);
        const spareTire = new THREE.Mesh(spareTireGeo, jeepBlackMat);
        spareTire.rotation.x = Math.PI / 2;
        spareTire.position.set(0, 2.1, -3.1);
        spareTire.castShadow = true;
        this.mesh.add(spareTire);
        const spareRim = new THREE.Mesh(spareRimGeo, jeepMetalMat);
        spareRim.rotation.x = Math.PI / 2;
        spareRim.position.set(0, 2.1, -2.87);
        this.mesh.add(spareRim);

        // --- Dachgepäckträger ---
        const rackLongGeo = new THREE.CylinderGeometry(0.06, 0.06, 2.4, 6);
        for (let side of [-1.1, 1.1]) {
            const rack = new THREE.Mesh(rackLongGeo, jeepMetalMat);
            rack.rotation.z = Math.PI / 2;
            rack.position.set(side * 0.9, 3.07, -0.2);
            this.mesh.add(rack);
        }
        const rackCrossGeo = new THREE.CylinderGeometry(0.05, 0.05, 2.1, 6);
        for (let fz of [0.7, -0.2, -1.1]) {
            const cross = new THREE.Mesh(rackCrossGeo, jeepMetalMat);
            cross.position.set(0, 3.07, fz);
            this.mesh.add(cross);
        }

        // --- Kanister auf dem Dach ---
        const canGeo = new THREE.BoxGeometry(0.4, 0.28, 0.7);
        const canMat = new THREE.MeshStandardMaterial({ color: 0xB71C1C, roughness: 0.8 });
        for (let cx of [-0.7, 0.1]) {
            const can = new THREE.Mesh(canGeo, canMat);
            can.position.set(cx, 3.2, 0.5);
            this.mesh.add(can);
        }

        // --- Scheinwerfer (rechteckig, typisch Jeep) ---
        for (let side of [-1, 1]) {
            // Hauptscheinwerfer (rund)
            const hlGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.12, 10);
            const hl = new THREE.Mesh(hlGeo, headlightMat);
            hl.rotation.x = Math.PI / 2;
            hl.position.set(side * 0.9, 1.88, 2.93);
            this.mesh.add(hl);

            // Blinker
            const blinkGeo = new THREE.BoxGeometry(0.28, 0.18, 0.1);
            const blinkMat = new THREE.MeshPhongMaterial({ color: 0xFFAA00, emissive: 0xFF8800, emissiveIntensity: 0.3 });
            const blink = new THREE.Mesh(blinkGeo, blinkMat);
            blink.position.set(side * 1.25, 1.88, 2.87);
            this.mesh.add(blink);
        }

        // Zusatz-Spotlights auf der Stoßstange
        for (let side of [-0.7, 0, 0.7]) {
            const spotGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.1, 8);
            const spot = new THREE.Mesh(spotGeo, headlightMat);
            spot.rotation.x = Math.PI / 2;
            spot.position.set(side, 1.42, 3.17);
            this.mesh.add(spot);
        }

        // --- Rücklichter ---
        for (let side of [-1, 1]) {
            const tlGeo = new THREE.BoxGeometry(0.45, 0.3, 0.1);
            const tl = new THREE.Mesh(tlGeo, taillightMat);
            tl.position.set(side * 1.0, 1.85, -2.92);
            this.mesh.add(tl);
        }

        // --- Auspuff ---
        const exhGeo = new THREE.CylinderGeometry(0.1, 0.12, 1.5, 8);
        const exh = new THREE.Mesh(exhGeo, exhaustMat);
        exh.rotation.z = Math.PI / 2;
        exh.position.set(-1.6, 0.95, -1.5);
        this.mesh.add(exh);

        // --- Trittbrett ---
        for (let side of [-1, 1]) {
            const stepGeo = new THREE.BoxGeometry(0.25, 0.1, 4.2);
            const step = new THREE.Mesh(stepGeo, jeepMetalMat);
            step.position.set(side * 1.58, 0.9, 0);
            step.castShadow = true;
            this.mesh.add(step);
        }

        // --- RÄDER (groß, geländetauglich) ---
        const wheelMaterial = new THREE.MeshStandardMaterial({
            color: 0x1A1A1A,
            roughness: 0.95,
            metalness: 0.05
        });
        const rimMaterial = new THREE.MeshStandardMaterial({
            color: 0xAAAAAA,
            roughness: 0.3,
            metalness: 0.9
        });
        const rimAccentMat = new THREE.MeshStandardMaterial({
            color: 0x555555,
            roughness: 0.5,
            metalness: 0.7
        });

        this.wheels = [];
        this.wheelGroups = [];

        // Breite Geländereifen mit Speichenfelge
        const wheelPositions = [
            { x: -1.52, y: 0.82, z:  2.1, isFront: true  },
            { x:  1.52, y: 0.82, z:  2.1, isFront: true  },
            { x: -1.52, y: 0.82, z: -2.1, isFront: false },
            { x:  1.52, y: 0.82, z: -2.1, isFront: false }
        ];

        wheelPositions.forEach(pos => {
            const wheelGroup = new THREE.Group();
            wheelGroup.position.set(pos.x, pos.y, pos.z);
            this.mesh.add(wheelGroup);

            // Reifen (breite Geländereifen)
            const tireGeo = new THREE.CylinderGeometry(0.82, 0.82, 0.72, 18);
            const tire = new THREE.Mesh(tireGeo, wheelMaterial);
            tire.rotation.z = Math.PI / 2;
            tire.castShadow = true;
            tire.receiveShadow = true;
            wheelGroup.add(tire);

            // Felge (Stern-Speichen)
            const rimGeo = new THREE.CylinderGeometry(0.52, 0.52, 0.74, 12);
            const rim = new THREE.Mesh(rimGeo, rimMaterial);
            rim.rotation.z = Math.PI / 2;
            wheelGroup.add(rim);

            // Speichen (5 Stück)
            for (let s = 0; s < 5; s++) {
                const angle = (s / 5) * Math.PI * 2;
                const spokeGeo = new THREE.BoxGeometry(0.1, 0.42, 0.76);
                const spoke = new THREE.Mesh(spokeGeo, rimAccentMat);
                spoke.rotation.x = angle;
                spoke.position.x = pos.x > 0 ? 0.01 : -0.01;
                wheelGroup.add(spoke);
            }

            // Nabenkappe
            const hubGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.78, 8);
            const hub = new THREE.Mesh(hubGeo, rimMaterial);
            hub.rotation.z = Math.PI / 2;
            wheelGroup.add(hub);

            this.wheels.push({ mesh: tire, group: wheelGroup, isFront: pos.isFront });
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
            steerInput = -input.steer;  // Invertiert für korrekte Richtung
        } else {
            if (input.left) steerInput = 1;   // Links = positiv (nach links lenken)
            else if (input.right) steerInput = -1;  // Rechts = negativ (nach rechts lenken)
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
        if (Math.abs(this.velocity) > CAR_PHYSICS.MIN_SPEED_TO_STEER) {
            // Realistische Ackermann-Lenkung:
            // Drehung basiert auf Lenkwinkel UND Geschwindigkeit
            // Aber nicht einfach multipliziert - das wäre zu stark!
            
            // Basis-Drehrate vom Lenkwinkel
            const baseTurnRate = this.currentSteerAngle * CAR_PHYSICS.TURN_RATE;
            
            // Geschwindigkeits-Einfluss (normalisiert)
            const speedInfluence = Math.min(Math.abs(this.velocity) / this.maxSpeed, 1.0);
            
            // Finale Drehgeschwindigkeit: Basis + kleine Geschwindigkeitsabhängigkeit
            this.rotationSpeed = baseTurnRate * (0.8 + speedInfluence * 0.2);
            
            // Drift bei hoher Geschwindigkeit und starker Lenkung
            if (speedInfluence > CAR_PHYSICS.DRIFT_THRESHOLD && Math.abs(steerInput) > 0.5) {
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
        
        // Terrain-Höhe berechnen (wenn nicht in der Luft)
        if (this.terrain) {
            const terrainHeight = this.terrain.getHeightAt(this.position.x, this.position.z);
            this.groundLevel = terrainHeight;
            
            // Neigung des Terrains für Auto-Rotation
            const slope = this.terrain.getSlopeAt(this.position.x, this.position.z);
            
            // Auto neigt sich mit dem Terrain
            this.mesh.rotation.x = -slope.slopeZ; // Pitch (vor/zurück)
            this.mesh.rotation.z = slope.slopeX;  // Roll (seitlich)
        }
        
        // Sprung-Physik (Gravitation)
        if (this.isAirborne) {
            this.verticalVelocity += this.gravity;
            this.position.y += this.verticalVelocity;
            
            // Landung
            if (this.position.y <= this.groundLevel) {
                this.position.y = this.groundLevel;
                this.verticalVelocity = 0;
                this.isAirborne = false;
                
                // Leichte Bremsung bei Landung
                this.velocity *= 0.9;
            }
        } else {
            // Auf dem Boden: Folge dem Terrain
            this.position.y = this.groundLevel;
        }
        
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
    
    // Sprung von Rampe - GROSSER SPRUNG!
    launchFromRamp(rampAngle, launchSpeed) {
        if (!this.isAirborne) {
            this.isAirborne = true;
            this.groundLevel = this.position.y;
            
            // MAXIMALE Sprungkraft für spektakuläre Sprünge!
            const jumpForce = Math.abs(launchSpeed) * 1.5; // 150% der Geschwindigkeit!
            this.verticalVelocity = Math.sin(rampAngle) * jumpForce + 0.5; // +0.5 Basis-Boost
            
            console.log(`🚀 MEGA JUMP! Speed: ${launchSpeed.toFixed(2)}, Vertical Velocity: ${this.verticalVelocity.toFixed(3)}, Max Height: ~${(this.verticalVelocity * this.verticalVelocity / (2 * Math.abs(this.gravity))).toFixed(1)} units! 🌟`);
        }
    }
}
