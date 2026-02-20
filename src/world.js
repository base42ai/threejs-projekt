import * as THREE from 'three';
import { createRoads } from './roads.js';
import { TerrainHeightMap } from './terrain.js';
import { INFO_SPOTS } from './infoSpots.js';

export function createWorld(scene) {
    // Terrain-Höhenkarte erstellen
    const terrain = new TerrainHeightMap();
    
    // Straßennetzwerk erstellen (für Realismus)
    const roads = createRoads(scene);
    
    // Funktion um Baum zu erstellen
    function createTree(x, z) {
        const treeGroup = new THREE.Group();
        
        // Stamm
        const trunkGeometry = new THREE.CylinderGeometry(1.5, 2, 8, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x5C3D2E, roughness: 0.95, metalness: 0.0 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 4;
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        treeGroup.add(trunk);

        // Krone (mehrere Kugeln)
        const foliageGeometry = new THREE.IcosahedronGeometry(5, 3);
        const foliageMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22, roughness: 0.9, metalness: 0.0 });
        
        const foliageLevels = [
            { y: 13, scale: 1 },
            { y: 10, scale: 0.85 },
            { y: 7.5, scale: 0.7 }
        ];

        foliageLevels.forEach(level => {
            const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
            foliage.scale.set(level.scale, level.scale, level.scale);
            foliage.position.y = level.y;
            foliage.castShadow = true;
            foliage.receiveShadow = true;
            treeGroup.add(foliage);
        });

        treeGroup.position.set(x, 0, z);
        return treeGroup;
    }

    // Bäume verteilt in der Welt - VIEL MEHR BÄUME!
    const treePositions = [
        // Original Bäume
        [-100, -80], [-150, 50], [80, -120], [120, 100],
        [-200, 100], [200, -150], [50, 150], [-80, 200],
        [150, 50], [-120, -150], [0, 150], [180, -80],
        [-180, 50], [100, -150], [-100, 120], [70, -70],
        [-150, -100], [160, 120], [-70, -200], [130, -200],
        [0, -100], [-200, -150], [200, 100], [-50, 80],
        [180, 0], [-130, 160], [90, 180], [-160, 0],
        // Neue Bäume für vollere Welt
        [-220, 50], [220, 50], [-220, -50], [220, -50],
        [-50, -220], [50, -220], [-180, 180], [180, 180],
        [-30, 100], [30, 100], [-100, 30], [100, 30],
        [-180, -120], [180, -120], [-60, -160], [60, -160],
        [140, -100], [-140, -100], [20, -180], [-20, -180],
        [110, 180], [-110, 180], [200, 0], [-200, 0],
        [0, 200], [0, -200], [160, 160], [-160, 160],
        [160, -160], [-160, -160], [-90, 150], [90, 150],
        [-120, 80], [120, 80], [-140, -50], [140, -50],
        [40, 120], [-40, 120], [70, -140], [-70, -140],
        [190, 120], [-190, 120], [130, -180], [-130, -180],
        [10, 90], [-10, 90], [50, -50], [-50, -50]
    ];

    treePositions.forEach(pos => {
        const tree = createTree(pos[0], pos[1]);
        scene.add(tree);
    });

    // ===== BESONDERE ORTE =====
    
    // See (PBR-Wasser mit Reflektion)
    const lakeGeometry = new THREE.CircleGeometry(60, 64);
    const lakeMaterial = new THREE.MeshStandardMaterial({
        color: 0x1A6FA8,
        roughness: 0.05,
        metalness: 0.9,
        transparent: true,
        opacity: 0.88
    });
    const lake = new THREE.Mesh(lakeGeometry, lakeMaterial);
    lake.rotation.x = -Math.PI / 2;
    lake.position.set(-150, 0.05, -100);
    lake.receiveShadow = true;
    scene.add(lake);

    // Kleine Brücke über See
    const bridgeDeckGeometry = new THREE.BoxGeometry(40, 1, 8);
    const bridgeMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
    const bridgeDeck = new THREE.Mesh(bridgeDeckGeometry, bridgeMaterial);
    bridgeDeck.position.set(-150, 2, -100);
    bridgeDeck.castShadow = true;
    bridgeDeck.receiveShadow = true;
    scene.add(bridgeDeck);

    // Brückenpfosten
    for (let i = -20; i <= 20; i += 10) {
        const postGeometry = new THREE.CylinderGeometry(0.8, 0.8, 10, 8);
        const post = new THREE.Mesh(postGeometry, bridgeMaterial);
        post.position.set(-150 + i, -2.5, -100);
        post.castShadow = true;
        post.receiveShadow = true;
        scene.add(post);
    }

    // Kleine Stadt mit Häusern - VERTEILT in der Stadt!
    const buildingPositions = [
        [150, 80], [190, 95], [125, 115], [175, 55],
        // Neue Häuser - weit verteilt
        [135, 145], [200, 130], [110, 85], [165, 125],
        [120, 65], [185, 75], [140, 100], [160, 140],
        [205, 110], [115, 125], [195, 60]
    ];

    buildingPositions.forEach(pos => {
        const buildingGroup = new THREE.Group();
        
        // Haus Basis
        const houseGeometry = new THREE.BoxGeometry(20, 15, 20);
        const houseMaterial = new THREE.MeshPhongMaterial({ color: 0xCD853F });
        const house = new THREE.Mesh(houseGeometry, houseMaterial);
        house.position.y = 7.5;
        house.castShadow = true;
        house.receiveShadow = true;
        buildingGroup.add(house);

        // Dach
        const roofGeometry = new THREE.ConeGeometry(15, 10, 4);
        const roofMaterial = new THREE.MeshPhongMaterial({ color: 0x8B0000 });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = 20;
        roof.castShadow = true;
        roof.receiveShadow = true;
        buildingGroup.add(roof);

        // Fenster
        for (let i = 0; i < 4; i++) {
            const windowGeometry = new THREE.BoxGeometry(3, 3, 0.5);
            const windowMaterial = new THREE.MeshPhongMaterial({ color: 0xFFFF99 });
            const window = new THREE.Mesh(windowGeometry, windowMaterial);
            window.position.set(-6 + i * 4, 10, 10.3);
            window.castShadow = true;
            buildingGroup.add(window);
        }

        buildingGroup.position.set(pos[0], 0, pos[1]);
        scene.add(buildingGroup);
    });

    // Windmühle
    const windmillBase = new THREE.Group();
    
    // Basis
    const baseGeometry = new THREE.CylinderGeometry(8, 10, 3, 8);
    const baseMaterial = new THREE.MeshPhongMaterial({ color: 0xA9A9A9 });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = 1.5;
    base.castShadow = true;
    base.receiveShadow = true;
    windmillBase.add(base);

    // Turm
    const towerGeometry = new THREE.CylinderGeometry(5, 5, 40, 8);
    const towerMaterial = new THREE.MeshPhongMaterial({ color: 0xFFFFFF });
    const tower = new THREE.Mesh(towerGeometry, towerMaterial);
    tower.position.y = 22;
    tower.castShadow = true;
    tower.receiveShadow = true;
    windmillBase.add(tower);

    // Flügel
    const bladesGroup = new THREE.Group();
    for (let i = 0; i < 4; i++) {
        const bladeGeometry = new THREE.BoxGeometry(3, 18, 0.5);
        const bladeMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
        const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
        blade.position.z = 12;
        blade.rotation.z = (Math.PI / 2) * i;
        blade.castShadow = true;
        blade.receiveShadow = true;
        bladesGroup.add(blade);
    }
    bladesGroup.position.y = 38;
    windmillBase.add(bladesGroup);

    // Windmühle rotiert
    windmillBase.position.set(80, 0, -150);
    scene.add(windmillBase);
    
    // RITTERBURG
    const castleGroup = new THREE.Group();
    
    // Hauptturm (Bergfried)
    const mainTowerGeo = new THREE.CylinderGeometry(12, 14, 50, 8);
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x808080, roughness: 0.92, metalness: 0.05 });
    const mainTower = new THREE.Mesh(mainTowerGeo, stoneMat);
    mainTower.position.y = 25;
    mainTower.castShadow = true;
    mainTower.receiveShadow = true;
    castleGroup.add(mainTower);
    
    // Zinnen auf Hauptturm
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const zinneGeo = new THREE.BoxGeometry(3, 4, 2);
        const zinne = new THREE.Mesh(zinneGeo, stoneMat);
        zinne.position.set(
            Math.cos(angle) * 12,
            52,
            Math.sin(angle) * 12
        );
        zinne.castShadow = true;
        castleGroup.add(zinne);
    }
    
    // Dach des Hauptturms (spitz)
    const roofGeo = new THREE.ConeGeometry(13, 15, 8);
    const roofMat = new THREE.MeshPhongMaterial({ color: 0x8B0000 });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = 60;
    roof.castShadow = true;
    castleGroup.add(roof);
    
    // 4 Ecktürme
    const towerPositions = [
        { x: 25, z: 25 },
        { x: -25, z: 25 },
        { x: 25, z: -25 },
        { x: -25, z: -25 }
    ];
    
    towerPositions.forEach(pos => {
        const towerGeo = new THREE.CylinderGeometry(6, 7, 35, 8);
        const tower = new THREE.Mesh(towerGeo, stoneMat);
        tower.position.set(pos.x, 17.5, pos.z);
        tower.castShadow = true;
        tower.receiveShadow = true;
        castleGroup.add(tower);
        
        // Zinnen auf Eckturm
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const zinneGeo = new THREE.BoxGeometry(2, 3, 1.5);
            const zinne = new THREE.Mesh(zinneGeo, stoneMat);
            zinne.position.set(
                pos.x + Math.cos(angle) * 6,
                36,
                pos.z + Math.sin(angle) * 6
            );
            zinne.castShadow = true;
            castleGroup.add(zinne);
        }
        
        // Spitzdach auf Eckturm
        const towerRoofGeo = new THREE.ConeGeometry(7, 10, 8);
        const towerRoof = new THREE.Mesh(towerRoofGeo, roofMat);
        towerRoof.position.set(pos.x, 42, pos.z);
        towerRoof.castShadow = true;
        castleGroup.add(towerRoof);
    });
    
    // Burgmauern zwischen den Türmen
    const wallGeo = new THREE.BoxGeometry(50, 25, 4);
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x707070, roughness: 0.95, metalness: 0.0 });
    
    // Mauer Nord
    const wallN = new THREE.Mesh(wallGeo, wallMat);
    wallN.position.set(0, 12.5, 25);
    wallN.castShadow = true;
    wallN.receiveShadow = true;
    castleGroup.add(wallN);
    
    // Mauer Süd
    const wallS = new THREE.Mesh(wallGeo, wallMat);
    wallS.position.set(0, 12.5, -25);
    wallS.castShadow = true;
    wallS.receiveShadow = true;
    castleGroup.add(wallS);
    
    // Mauer Ost
    const wallE = new THREE.Mesh(wallGeo, wallMat);
    wallE.position.set(25, 12.5, 0);
    wallE.rotation.y = Math.PI / 2;
    wallE.castShadow = true;
    wallE.receiveShadow = true;
    castleGroup.add(wallE);
    
    // Mauer West (mit Tor)
    const wallW = new THREE.Mesh(wallGeo, wallMat);
    wallW.position.set(-25, 12.5, 0);
    wallW.rotation.y = Math.PI / 2;
    wallW.castShadow = true;
    wallW.receiveShadow = true;
    castleGroup.add(wallW);
    
    // Burgtor
    const gateGeo = new THREE.BoxGeometry(8, 15, 5);
    const gateMat = new THREE.MeshPhongMaterial({ color: 0x4B3621 });
    const gate = new THREE.Mesh(gateGeo, gateMat);
    gate.position.set(-25, 7.5, 0);
    gate.castShadow = true;
    castleGroup.add(gate);
    
    // Flagge auf Hauptturm
    const flagPoleGeo = new THREE.CylinderGeometry(0.3, 0.3, 12, 8);
    const flagPoleMat = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
    const flagPole = new THREE.Mesh(flagPoleGeo, flagPoleMat);
    flagPole.position.y = 73;
    castleGroup.add(flagPole);
    
    const flagGeo = new THREE.PlaneGeometry(8, 5);
    const flagMat = new THREE.MeshPhongMaterial({ 
        color: 0xFF0000,
        side: THREE.DoubleSide
    });
    const flag = new THREE.Mesh(flagGeo, flagMat);
    flag.position.set(4, 75, 0);
    castleGroup.add(flag);
    
    castleGroup.position.set(0, 0, 200);
    scene.add(castleGroup);
    
    // DRACHE bei der Ritterburg - GROß UND ROT!
    const dragonGroup = new THREE.Group();
    
    // Drachenkörper
    const bodyGeo = new THREE.CylinderGeometry(3, 4, 12, 8);
    const dragonMat = new THREE.MeshPhongMaterial({ 
        color: 0xCC0000,  // Rot!
        emissive: 0x550000,
        shininess: 30
    });
    const body = new THREE.Mesh(bodyGeo, dragonMat);
    body.rotation.z = Math.PI / 2;
    body.position.y = 6;
    body.castShadow = true;
    dragonGroup.add(body);
    
    // Drachenkopf
    const headGeo = new THREE.ConeGeometry(3, 5, 8);
    const head = new THREE.Mesh(headGeo, dragonMat);
    head.rotation.z = -Math.PI / 2;
    head.position.set(8, 6, 0);
    head.castShadow = true;
    dragonGroup.add(head);
    
    // Augen
    const eyeGeo = new THREE.SphereGeometry(0.5, 8, 8);
    const eyeMat = new THREE.MeshPhongMaterial({ color: 0xFFFF00, emissive: 0xFFFF00 });
    const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
    eyeL.position.set(9, 7, -1);
    dragonGroup.add(eyeL);
    const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
    eyeR.position.set(9, 7, 1);
    dragonGroup.add(eyeR);
    
    // Hörner
    const hornGeo = new THREE.ConeGeometry(0.5, 2, 6);
    const hornL = new THREE.Mesh(hornGeo, new THREE.MeshPhongMaterial({ color: 0x000000 }));
    hornL.position.set(8, 9, -1.5);
    hornL.rotation.z = Math.PI / 4;
    hornL.castShadow = true;
    dragonGroup.add(hornL);
    const hornR = new THREE.Mesh(hornGeo, new THREE.MeshPhongMaterial({ color: 0x000000 }));
    hornR.position.set(8, 9, 1.5);
    hornR.rotation.z = Math.PI / 4;
    hornR.castShadow = true;
    dragonGroup.add(hornR);
    
    // Flügel (links)
    const wingGeo = new THREE.ConeGeometry(6, 10, 3);
    const wingMat = new THREE.MeshPhongMaterial({ 
        color: 0x8B0000, 
        side: THREE.DoubleSide,
        emissive: 0x330000
    });
    const wingL = new THREE.Mesh(wingGeo, wingMat);
    wingL.rotation.x = Math.PI / 2;
    wingL.rotation.z = -Math.PI / 6;
    wingL.position.set(0, 10, -5);
    wingL.castShadow = true;
    dragonGroup.add(wingL);
    
    // Flügel (rechts)
    const wingR = new THREE.Mesh(wingGeo, wingMat);
    wingR.rotation.x = Math.PI / 2;
    wingR.rotation.z = Math.PI / 6;
    wingR.position.set(0, 10, 5);
    wingR.castShadow = true;
    dragonGroup.add(wingR);
    
    // Schwanz
    const tailSegments = 5;
    for (let i = 0; i < tailSegments; i++) {
        const size = 2.5 - i * 0.4;
        const tailGeo = new THREE.SphereGeometry(size, 8, 8);
        const tailSegment = new THREE.Mesh(tailGeo, dragonMat);
        tailSegment.position.set(-6 - i * 2, 6 - i * 0.5, 0);
        tailSegment.castShadow = true;
        dragonGroup.add(tailSegment);
    }
    
    // Schwanzspitze
    const tailTipGeo = new THREE.ConeGeometry(2, 4, 6);
    const tailTip = new THREE.Mesh(tailTipGeo, new THREE.MeshPhongMaterial({ color: 0xFF4500 }));
    tailTip.rotation.z = Math.PI / 2;
    tailTip.position.set(-16, 4, 0);
    tailTip.castShadow = true;
    dragonGroup.add(tailTip);
    
    // Beine
    const legGeo = new THREE.CylinderGeometry(0.8, 1, 4, 6);
    const legMat = new THREE.MeshPhongMaterial({ color: 0x990000 }); // Dunkelrot für Beine
    
    // Vorderbeine
    const legFL = new THREE.Mesh(legGeo, legMat);
    legFL.position.set(3, 2, -2);
    legFL.castShadow = true;
    dragonGroup.add(legFL);
    const legFR = new THREE.Mesh(legGeo, legMat);
    legFR.position.set(3, 2, 2);
    legFR.castShadow = true;
    dragonGroup.add(legFR);
    
    // Hinterbeine
    const legBL = new THREE.Mesh(legGeo, legMat);
    legBL.position.set(-3, 2, -2);
    legBL.castShadow = true;
    dragonGroup.add(legBL);
    const legBR = new THREE.Mesh(legGeo, legMat);
    legBR.position.set(-3, 2, 2);
    legBR.castShadow = true;
    dragonGroup.add(legBR);
    
    // Drache positionieren und vergrößern
    dragonGroup.scale.set(2.5, 2.5, 2.5); // VIEL GRÖßER!
    dragonGroup.rotation.y = Math.PI; // 180° Drehung - Kopf zeigt jetzt richtig!
    dragonGroup.position.set(0, 0, 200);
    scene.add(dragonGroup);
    
    // Speichere Drache für Animation (mit Referenzen auf Beine)
    const dragon = dragonGroup;
    dragon.legs = {
        frontLeft: legFL,
        frontRight: legFR,
        backLeft: legBL,
        backRight: legBR
    };

    // Hügel
    const hillGeometry = new THREE.ConeGeometry(100, 30, 32);
    const hillMaterial = new THREE.MeshLambertMaterial({ color: 0x2d5016 });
    const hill = new THREE.Mesh(hillGeometry, hillMaterial);
    hill.position.set(-200, -5, 150);
    hill.castShadow = true;
    hill.receiveShadow = true;
    scene.add(hill);
    
    // Hügel zum Terrain hinzufügen (für fahrende Physik)
    terrain.addHill(-200, 150, 100, 30);
    
    // Weitere Hügel in der Welt verteilen
    const additionalHills = [
        { x: 150, z: 100, radius: 70, height: 20 },
        { x: -100, z: -150, radius: 80, height: 25 },
        { x: 200, z: -200, radius: 60, height: 18 },
        { x: -180, z: -80, radius: 65, height: 22 },
        { x: 100, z: 180, radius: 75, height: 24 },
        { x: 0, z: -100, radius: 55, height: 16 }
    ];
    
    additionalHills.forEach(h => {
        const hillGeo = new THREE.ConeGeometry(h.radius, h.height, 32);
        const hillMat = new THREE.MeshLambertMaterial({ 
            color: 0x2d5016 + Math.floor(Math.random() * 0x101010) 
        });
        const hillMesh = new THREE.Mesh(hillGeo, hillMat);
        hillMesh.position.set(h.x, -5, h.z);
        hillMesh.castShadow = true;
        hillMesh.receiveShadow = true;
        scene.add(hillMesh);
        
        // Zum Terrain hinzufügen
        terrain.addHill(h.x, h.z, h.radius, h.height);
    });

    // Speichere Windmühle für Animation
    const windmillBlades = windmillBase.children[2];

    // ===== MEHR DETAILS FÜR VOLLERE WELT =====
    
    // Felsen/Steine überall verteilt
    const rockPositions = [
        [-60, -50], [60, 50], [-180, -180], [180, -180],
        [-100, -120], [100, 120], [-220, 0], [220, 0],
        [0, -150], [0, 170], [-140, 140], [140, -140],
        [-75, 100], [75, -100], [-200, -80], [200, 80],
        [-50, 180], [50, -180], [-160, -30], [160, 30]
    ];
    
    rockPositions.forEach(pos => {
        const rockGroup = new THREE.Group();
        const numRocks = Math.floor(Math.random() * 3) + 2; // 2-4 Felsen pro Gruppe
        
        for (let i = 0; i < numRocks; i++) {
            const size = Math.random() * 4 + 2; // 2-6 Größe
            const rockGeometry = new THREE.DodecahedronGeometry(size, 0);
            const rockMaterial = new THREE.MeshPhongMaterial({ 
                color: 0x808080,
                flatShading: true
            });
            const rock = new THREE.Mesh(rockGeometry, rockMaterial);
            rock.position.set(
                (Math.random() - 0.5) * 10,
                size * 0.3,
                (Math.random() - 0.5) * 10
            );
            rock.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            rock.castShadow = true;
            rock.receiveShadow = true;
            rockGroup.add(rock);
        }
        
        rockGroup.position.set(pos[0], 0, pos[1]);
        scene.add(rockGroup);
    });
    
    // Büsche/Sträucher
    const bushPositions = [
        [-70, -80], [70, 80], [-130, 100], [130, -100],
        [-190, 50], [190, -50], [-40, 140], [40, -140],
        [110, 150], [-110, -150], [0, 120], [0, -120],
        [-160, 120], [160, -120], [-90, -90], [90, 90],
        [-200, 150], [200, -150], [-120, -30], [120, 30],
        [-30, -200], [30, 200], [-170, -60], [170, 60]
    ];
    
    bushPositions.forEach(pos => {
        const bushGroup = new THREE.Group();
        
        // Busch besteht aus mehreren Kugeln
        for (let i = 0; i < 3; i++) {
            const bushGeometry = new THREE.SphereGeometry(2 + Math.random() * 2, 8, 8);
            const bushMaterial = new THREE.MeshPhongMaterial({ color: 0x228B22 });
            const bush = new THREE.Mesh(bushGeometry, bushMaterial);
            bush.position.set(
                (Math.random() - 0.5) * 4,
                1.5,
                (Math.random() - 0.5) * 4
            );
            bush.scale.set(1, 0.8, 1); // Etwas platter
            bush.castShadow = true;
            bush.receiveShadow = true;
            bushGroup.add(bush);
        }
        
        bushGroup.position.set(pos[0], 0, pos[1]);
        scene.add(bushGroup);
    });
    
    // Laternen/Straßenlaternen in der Stadt
    const streetLightPositions = [
        [145, 75], [175, 95], [135, 105], [165, 65],
        [125, 85], [185, 125], [155, 115], [150, 135]
    ];
    
    streetLightPositions.forEach(pos => {
        const lightGroup = new THREE.Group();
        
        // Mast
        const poleGeometry = new THREE.CylinderGeometry(0.3, 0.4, 12, 8);
        const poleMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
        const pole = new THREE.Mesh(poleGeometry, poleMaterial);
        pole.position.y = 6;
        pole.castShadow = true;
        lightGroup.add(pole);
        
        // Lampe
        const lampGeometry = new THREE.SphereGeometry(1, 8, 8);
        const lampMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xFFFF99,
            emissive: 0xFFFF66,
            emissiveIntensity: 0.5
        });
        const lamp = new THREE.Mesh(lampGeometry, lampMaterial);
        lamp.position.y = 12;
        lightGroup.add(lamp);
        
        lightGroup.position.set(pos[0], 0, pos[1]);
        scene.add(lightGroup);
    });
    
    // Zäune rund um die Stadt
    function createFence(startX, startZ, endX, endZ) {
        const fenceGroup = new THREE.Group();
        const distance = Math.sqrt((endX - startX) ** 2 + (endZ - startZ) ** 2);
        const segments = Math.floor(distance / 8); // Alle 8 Einheiten ein Pfosten
        
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const x = startX + (endX - startX) * t;
            const z = startZ + (endZ - startZ) * t;
            
            // Pfosten
            const postGeometry = new THREE.CylinderGeometry(0.3, 0.3, 5, 8);
            const postMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
            const post = new THREE.Mesh(postGeometry, postMaterial);
            post.position.set(x, 2.5, z);
            post.castShadow = true;
            fenceGroup.add(post);
            
            // Horizontale Balken (außer beim letzten Pfosten)
            if (i < segments) {
                const nextX = startX + (endX - startX) * ((i + 1) / segments);
                const nextZ = startZ + (endZ - startZ) * ((i + 1) / segments);
                const barLength = Math.sqrt((nextX - x) ** 2 + (nextZ - z) ** 2);
                const angle = Math.atan2(nextZ - z, nextX - x);
                
                for (let h = 0; h < 2; h++) {
                    const barGeometry = new THREE.CylinderGeometry(0.15, 0.15, barLength, 8);
                    const bar = new THREE.Mesh(barGeometry, postMaterial);
                    bar.position.set((x + nextX) / 2, 2 + h * 1.5, (z + nextZ) / 2);
                    bar.rotation.z = Math.PI / 2;
                    bar.rotation.y = -angle;
                    fenceGroup.add(bar);
                }
            }
        }
        
        scene.add(fenceGroup);
    }
    
    // Zaun-Linien rund um die Stadt
    createFence(120, 55, 190, 55);  // Nord
    createFence(190, 55, 190, 145); // Ost
    createFence(190, 145, 120, 145); // Süd
    createFence(120, 145, 120, 55); // West

    // ===== COLLIDABLE OBSTACLES (Crates) =====
    const colliders = [];

    // Create wooden crates scattered around
    const cratePositions = [
        [50, 0, 50], [-80, 0, 30], [100, 0, -80], [-120, 0, -50],
        [30, 0, 120], [-50, 0, -120], [150, 0, 20], [-30, 0, 100],
        [70, 0, -30], [-100, 0, 80]
    ];

    cratePositions.forEach((pos, index) => {
        const crateGroup = new THREE.Group();
        
        // Crate body
        const crateGeometry = new THREE.BoxGeometry(8, 8, 8);
        const crateMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
        const crate = new THREE.Mesh(crateGeometry, crateMaterial);
        crate.position.y = 4;
        crate.castShadow = true;
        crate.receiveShadow = true;
        crateGroup.add(crate);

        // Add wood texture appearance (dark lines)
        const lineGeometry = new THREE.BoxGeometry(8.2, 1, 8.2);
        const lineMaterial = new THREE.MeshPhongMaterial({ color: 0x654321 });
        
        for (let i = 0; i < 3; i++) {
            const line = new THREE.Mesh(lineGeometry, lineMaterial);
            line.position.y = i * 3 + 1;
            line.castShadow = true;
            crateGroup.add(line);
        }

        crateGroup.position.set(pos[0], pos[1], pos[2]);
        crateGroup.userData.colliderId = `crate_${index}`;
        crateGroup.userData.isActive = true;
        scene.add(crateGroup);

        // Create bounding box
        const bbox = new THREE.Box3().setFromObject(crateGroup);

        colliders.push({
            id: `crate_${index}`,
            mesh: crateGroup,
            bbox: bbox,
            isActive: true
        });
    });

    // ===== INFO SPOTS (Invisible Trigger Zones) =====
    // InfoSpots aus separater Datei laden und in THREE.Vector3 konvertieren
    const infoSpots = INFO_SPOTS.map(spot => ({
        ...spot,
        position: new THREE.Vector3(spot.position.x, spot.position.y, spot.position.z)
    }));

    // Sprungschanzen (Rampen)
    const ramps = [];
    
    function createRamp(x, z, rotation, scale = 1) {
        const rampGroup = new THREE.Group();
        
        // Rampe (Keil-Form)
        const rampGeometry = new THREE.BufferGeometry();
        const vertices = new Float32Array([
            // Basis (unten)
            -5, 0, 0,    5, 0, 0,    5, 0, 10,
            -5, 0, 0,    5, 0, 10,  -5, 0, 10,
            // Top (oben/schräg)
            -5, 0, 0,    5, 0, 0,    5, 3, 10,
            -5, 0, 0,    5, 3, 10,  -5, 3, 10,
            // Seiten
            -5, 0, 0,   -5, 0, 10,  -5, 3, 10,
             5, 0, 0,    5, 3, 10,   5, 0, 10,
            // Rückseite
            -5, 0, 10,   5, 0, 10,   5, 3, 10,
            -5, 0, 10,   5, 3, 10,  -5, 3, 10
        ]);
        
        rampGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        rampGeometry.computeVertexNormals();
        
        const rampMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xFFAA00,
            side: THREE.DoubleSide,
            flatShading: true
        });
        const ramp = new THREE.Mesh(rampGeometry, rampMaterial);
        ramp.castShadow = true;
        ramp.receiveShadow = true;
        ramp.scale.set(scale, scale, scale);
        rampGroup.add(ramp);
        
        rampGroup.position.set(x, 0, z);
        rampGroup.rotation.y = rotation;
        scene.add(rampGroup);
        
        // Bounding Box für Kollision
        const bbox = new THREE.Box3().setFromObject(rampGroup);
        
        return {
            mesh: rampGroup,
            bbox: bbox,
            position: new THREE.Vector3(x, 0, z),
            rotation: rotation,
            angle: Math.atan(3 / 10) // Neigungswinkel der Rampe (ca. 17°)
        };
    }
    
    // Mehrere Sprungschanzen in der Welt verteilen
    ramps.push(createRamp(50, 50, 0, 1));           // Nach Norden
    ramps.push(createRamp(-80, -100, Math.PI, 1.2)); // Nach Süden, größer
    ramps.push(createRamp(150, -50, Math.PI / 2, 1)); // Nach Osten
    ramps.push(createRamp(-150, 80, -Math.PI / 2, 0.8)); // Nach Westen, kleiner
    ramps.push(createRamp(0, -180, Math.PI / 4, 1.5)); // Diagonal, größte Rampe!
    ramps.push(createRamp(-300, 200, 0, 1.3)); // Wüsten-Rampe
    ramps.push(createRamp(300, -300, Math.PI, 1.2)); // Berg-Rampe

    // ===== NEUE BEREICHE FÜR GRÖSSERE WELT =====
    
    // 1. WÜSTEN-BEREICH (Südwest: -400 bis -250)
    function createCactus(x, z) {
        const cactusGroup = new THREE.Group();
        
        // Hauptstamm
        const trunkGeo = new THREE.CylinderGeometry(1, 1.2, 8, 8);
        const cactusMat = new THREE.MeshPhongMaterial({ color: 0x228B22 });
        const trunk = new THREE.Mesh(trunkGeo, cactusMat);
        trunk.position.y = 4;
        trunk.castShadow = true;
        cactusGroup.add(trunk);
        
        // Arme
        const armGeo = new THREE.CylinderGeometry(0.7, 0.8, 4, 8);
        const leftArm = new THREE.Mesh(armGeo, cactusMat);
        leftArm.position.set(-2, 5, 0);
        leftArm.rotation.z = Math.PI / 3;
        leftArm.castShadow = true;
        cactusGroup.add(leftArm);
        
        const rightArm = new THREE.Mesh(armGeo, cactusMat);
        rightArm.position.set(2, 4, 0);
        rightArm.rotation.z = -Math.PI / 3;
        rightArm.castShadow = true;
        cactusGroup.add(rightArm);
        
        cactusGroup.position.set(x, 0, z);
        return cactusGroup;
    }
    
    // Wüstenboden (Sand) - VIEL GRÖSSER!
    const desertGround = new THREE.Mesh(
        new THREE.CircleGeometry(180, 32),
        new THREE.MeshPhongMaterial({ color: 0xEDC9AF })
    );
    desertGround.rotation.x = -Math.PI / 2;
    desertGround.position.set(-300, 0.1, -300);
    desertGround.receiveShadow = true;
    scene.add(desertGround);
    
    // Kakteen in der Wüste - VIEL MEHR!
    for (let i = 0; i < 40; i++) {
        const x = -400 + Math.random() * 200;
        const z = -400 + Math.random() * 200;
        scene.add(createCactus(x, z));
    }
    
    // Sanddünen - MEHR UND GRÖSSER!
    for (let i = 0; i < 15; i++) {
        const duneGeo = new THREE.SphereGeometry(25 + Math.random() * 20, 16, 16);
        const duneMat = new THREE.MeshPhongMaterial({ color: 0xF4A460 });
        const dune = new THREE.Mesh(duneGeo, duneMat);
        dune.scale.set(1, 0.3, 1);
        const duneX = -380 + Math.random() * 160;
        const duneZ = -380 + Math.random() * 160;
        dune.position.set(duneX, -3, duneZ);
        dune.receiveShadow = true;
        dune.castShadow = true;
        scene.add(dune);
        
        // Dünen zum Terrain hinzufügen (flache Hügel)
        const duneRadius = (25 + Math.random() * 20);
        const duneHeight = duneRadius * 0.3;
        terrain.addDune(duneX, duneZ, duneRadius, duneHeight);
    }
    
    // Wüsten-Felsen
    for (let i = 0; i < 12; i++) {
        const rockGeo = new THREE.DodecahedronGeometry(5 + Math.random() * 10, 0);
        const rockMat = new THREE.MeshPhongMaterial({ color: 0xA0522D, flatShading: true });
        const rock = new THREE.Mesh(rockGeo, rockMat);
        rock.position.set(-380 + Math.random() * 160, 3, -380 + Math.random() * 160);
        rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        rock.castShadow = true;
        rock.receiveShadow = true;
        scene.add(rock);
    }
    
    // 2. SCHNEE/BERG-BEREICH (Nordost: 250 bis 400)
    function createPineTree(x, z) {
        const treeGroup = new THREE.Group();
        
        // Stamm
        const trunkGeo = new THREE.CylinderGeometry(0.8, 1, 10, 8);
        const trunkMat = new THREE.MeshPhongMaterial({ color: 0x4A2511 });
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 5;
        trunk.castShadow = true;
        treeGroup.add(trunk);
        
        // Nadel-Ebenen
        for (let i = 0; i < 4; i++) {
            const needleGeo = new THREE.ConeGeometry(5 - i * 1, 5, 8);
            const needleMat = new THREE.MeshPhongMaterial({ color: 0x1B4D3E });
            const needle = new THREE.Mesh(needleGeo, needleMat);
            needle.position.y = 10 + i * 3;
            needle.castShadow = true;
            treeGroup.add(needle);
        }
        
        treeGroup.position.set(x, 0, z);
        return treeGroup;
    }
    
    // Schnee-Boden - VIEL GRÖSSER!
    const snowGround = new THREE.Mesh(
        new THREE.CircleGeometry(190, 32),
        new THREE.MeshPhongMaterial({ color: 0xFFFAFA })
    );
    snowGround.rotation.x = -Math.PI / 2;
    snowGround.position.set(300, 0.1, 300);
    snowGround.receiveShadow = true;
    scene.add(snowGround);
    
    // Tannenbäume - VIEL MEHR!
    for (let i = 0; i < 50; i++) {
        const x = 220 + Math.random() * 160;
        const z = 220 + Math.random() * 160;
        scene.add(createPineTree(x, z));
    }
    
    // Berge (Schneebedeckt) - MEHR UND GRÖSSER!
    for (let i = 0; i < 6; i++) {
        const mountainRadius = 45 + Math.random() * 20;
        const mountainHeight = 70 + Math.random() * 30;
        const mountainGeo = new THREE.ConeGeometry(mountainRadius, mountainHeight, 8);
        const mountainMat = new THREE.MeshPhongMaterial({ color: 0xA9A9A9 });
        const mountain = new THREE.Mesh(mountainGeo, mountainMat);
        const mountainX = 240 + Math.random() * 120;
        const mountainZ = 240 + Math.random() * 120;
        mountain.position.set(mountainX, 35, mountainZ);
        mountain.castShadow = true;
        mountain.receiveShadow = true;
        scene.add(mountain);
        
        // Berge zum Terrain hinzufügen (steil!)
        terrain.addMountain(mountainX, mountainZ, mountainRadius, mountainHeight);
        
        // Schnee-Kappe
        const snowCapGeo = new THREE.ConeGeometry(45 + Math.random() * 20, 25, 8);
        const snowCapMat = new THREE.MeshPhongMaterial({ color: 0xFFFFFF });
        const snowCap = new THREE.Mesh(snowCapGeo, snowCapMat);
        snowCap.position.copy(mountain.position);
        snowCap.position.y += 40;
        snowCap.castShadow = true;
        scene.add(snowCap);
    }
    
    // Schnee-Hügel
    for (let i = 0; i < 10; i++) {
        const hillRadius = 15 + Math.random() * 10;
        const hillHeight = hillRadius * 0.5;
        const hillGeo = new THREE.SphereGeometry(hillRadius, 16, 16);
        const hillMat = new THREE.MeshPhongMaterial({ color: 0xFFFAFA });
        const hill = new THREE.Mesh(hillGeo, hillMat);
        hill.scale.set(1, 0.5, 1);
        const hillX = 240 + Math.random() * 120;
        const hillZ = 240 + Math.random() * 120;
        hill.position.set(hillX, -2, hillZ);
        hill.receiveShadow = true;
        hill.castShadow = true;
        scene.add(hill);
        
        // Schnee-Hügel zum Terrain hinzufügen
        terrain.addHill(hillX, hillZ, hillRadius, hillHeight);
    }
    
    // Eiszapfen/Kristalle
    for (let i = 0; i < 15; i++) {
        const crystalGeo = new THREE.ConeGeometry(2, 6, 6);
        const crystalMat = new THREE.MeshPhongMaterial({ 
            color: 0xCCFFFF,
            transparent: true,
            opacity: 0.8,
            shininess: 100
        });
        const crystal = new THREE.Mesh(crystalGeo, crystalMat);
        crystal.position.set(240 + Math.random() * 120, 3, 240 + Math.random() * 120);
        crystal.rotation.set(Math.random() * 0.3, Math.random() * Math.PI * 2, Math.random() * 0.3);
        crystal.castShadow = true;
        scene.add(crystal);
    }
    
    // 3. STRAND-BEREICH (Südost: 220 bis 380, -380 bis -220) - VIEL GRÖSSER!
    // Strand (Sand)
    const beachGround = new THREE.Mesh(
        new THREE.CircleGeometry(160, 32),
        new THREE.MeshPhongMaterial({ color: 0xF0E68C })
    );
    beachGround.rotation.x = -Math.PI / 2;
    beachGround.position.set(300, 0.1, -300);
    beachGround.receiveShadow = true;
    scene.add(beachGround);
    
    // Meer (PBR-Wasser)
    const oceanGeo = new THREE.CircleGeometry(130, 32);
    const oceanMat = new THREE.MeshStandardMaterial({
        color: 0x004E7A,
        roughness: 0.03,
        metalness: 0.95,
        transparent: true,
        opacity: 0.85
    });
    const ocean = new THREE.Mesh(oceanGeo, oceanMat);
    ocean.rotation.x = -Math.PI / 2;
    ocean.position.set(320, 0.05, -330);
    ocean.receiveShadow = true;
    scene.add(ocean);
    
    // Palmen
    function createPalm(x, z) {
        const palmGroup = new THREE.Group();
        
        // Stamm
        const trunkGeo = new THREE.CylinderGeometry(0.8, 1, 12, 8);
        const trunkMat = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 6;
        trunk.castShadow = true;
        palmGroup.add(trunk);
        
        // Palmwedel
        const leafMat = new THREE.MeshPhongMaterial({ color: 0x228B22 });
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const leafGeo = new THREE.BoxGeometry(1, 8, 0.5);
            const leaf = new THREE.Mesh(leafGeo, leafMat);
            leaf.position.set(Math.cos(angle) * 2, 12, Math.sin(angle) * 2);
            leaf.rotation.z = angle;
            leaf.rotation.x = Math.PI / 6;
            leaf.castShadow = true;
            palmGroup.add(leaf);
        }
        
        palmGroup.position.set(x, 0, z);
        return palmGroup;
    }
    
    // Palmen am Strand - VIEL MEHR!
    for (let i = 0; i < 30; i++) {
        const x = 230 + Math.random() * 140;
        const z = -360 + Math.random() * 120;
        scene.add(createPalm(x, z));
    }
    
    // Strandmuscheln und Felsen
    for (let i = 0; i < 20; i++) {
        const shellGeo = new THREE.SphereGeometry(1.5 + Math.random(), 8, 8);
        const shellMat = new THREE.MeshPhongMaterial({ color: 0xFFE4B5 });
        const shell = new THREE.Mesh(shellGeo, shellMat);
        shell.scale.set(1, 0.5, 1.2);
        shell.position.set(230 + Math.random() * 140, 0.5, -360 + Math.random() * 120);
        shell.rotation.set(Math.random() * 0.5, Math.random() * Math.PI * 2, Math.random() * 0.5);
        shell.castShadow = true;
        scene.add(shell);
    }
    
    // Strandsteine
    for (let i = 0; i < 15; i++) {
        const rockGeo = new THREE.DodecahedronGeometry(2 + Math.random() * 3);
        const rockMat = new THREE.MeshPhongMaterial({ color: 0x808080 });
        const rock = new THREE.Mesh(rockGeo, rockMat);
        rock.position.set(230 + Math.random() * 140, 1, -360 + Math.random() * 120);
        rock.castShadow = true;
        scene.add(rock);
    }
    
    // 4. INDUSTRIEGEBIET (Nordwest: -380 bis -220, 220 bis 380) - VIEL GRÖSSER!
    // Fabrik - GRÖSSERES HAUPTGEBÄUDE
    const factoryBase = new THREE.Mesh(
        new THREE.BoxGeometry(70, 35, 60),
        new THREE.MeshPhongMaterial({ color: 0x696969 })
    );
    factoryBase.position.set(-300, 17.5, 300);
    factoryBase.castShadow = true;
    factoryBase.receiveShadow = true;
    scene.add(factoryBase);
    
    // Schornsteine - MEHR!
    for (let i = 0; i < 6; i++) {
        const chimneyGeo = new THREE.CylinderGeometry(3, 4, 35, 8);
        const chimneyMat = new THREE.MeshPhongMaterial({ color: 0x8B0000 });
        const chimney = new THREE.Mesh(chimneyGeo, chimneyMat);
        chimney.position.set(-330 + i * 12, 52.5, 290 + (i % 2) * 20);
        chimney.castShadow = true;
        scene.add(chimney);
    }
    
    // Lagerhallen - MEHR!
    for (let i = 0; i < 8; i++) {
        const warehouseGeo = new THREE.BoxGeometry(30, 15, 25);
        const warehouseMat = new THREE.MeshPhongMaterial({ color: 0xA0522D });
        const warehouse = new THREE.Mesh(warehouseGeo, warehouseMat);
        warehouse.position.set(-360 + (i % 4) * 40, 7.5, 250 + Math.floor(i / 4) * 100);
        warehouse.castShadow = true;
        warehouse.receiveShadow = true;
        scene.add(warehouse);
    }
    
    // Container
    for (let i = 0; i < 12; i++) {
        const containerGeo = new THREE.BoxGeometry(8, 8, 20);
        const colors = [0xFF6347, 0x4169E1, 0x32CD32, 0xFFD700];
        const containerMat = new THREE.MeshPhongMaterial({ color: colors[i % 4] });
        const container = new THREE.Mesh(containerGeo, containerMat);
        container.position.set(-360 + Math.random() * 140, 4, 240 + Math.random() * 120);
        container.rotation.y = Math.random() * Math.PI;
        container.castShadow = true;
        scene.add(container);
    }
    
    // Industrielle Rohre und Tanks
    for (let i = 0; i < 8; i++) {
        const tankGeo = new THREE.CylinderGeometry(5, 5, 12, 16);
        const tankMat = new THREE.MeshPhongMaterial({ color: 0x708090 });
        const tank = new THREE.Mesh(tankGeo, tankMat);
        tank.position.set(-350 + Math.random() * 100, 6, 260 + Math.random() * 80);
        tank.castShadow = true;
        scene.add(tank);
    }


    return { windmillBlades, infoSpots, colliders, ramps, roads, terrain, dragon };
}
