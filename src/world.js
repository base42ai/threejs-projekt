export function createWorld(scene) {
    // Funktion um realistischen Baum zu erstellen
    function createTree(x, z) {
        const treeGroup = new THREE.Group();
        
        // Variation für jeden Baum
        const scale = 0.8 + Math.random() * 0.4;
        const rotation = Math.random() * Math.PI * 2;
        
        // Realistischer Stamm mit Textur
        const trunkGeometry = new THREE.CylinderGeometry(1.5, 2.2, 10, 12);
        const trunkMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x3D2817,
            roughness: 0.9,
            metalness: 0.0
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 5;
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        treeGroup.add(trunk);

        // Realistische Baumkrone mit mehr Details
        const foliageGeometry = new THREE.DodecahedronGeometry(5, 1);
        const greenShade = 0x1A5D1A + Math.floor(Math.random() * 0x103010);
        const foliageMaterial = new THREE.MeshStandardMaterial({ 
            color: greenShade,
            roughness: 0.9,
            metalness: 0.0,
            flatShading: true
        });
        
        const foliageLevels = [
            { y: 15, scale: 1.0, offsetX: 0, offsetZ: 0 },
            { y: 12, scale: 1.1, offsetX: 0.5, offsetZ: 0.3 },
            { y: 9, scale: 1.0, offsetX: -0.3, offsetZ: 0.5 },
            { y: 6.5, scale: 0.8, offsetX: 0.2, offsetZ: -0.4 }
        ];

        foliageLevels.forEach(level => {
            const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
            foliage.scale.set(level.scale, level.scale, level.scale);
            foliage.position.set(level.offsetX, level.y, level.offsetZ);
            foliage.rotation.y = Math.random() * Math.PI;
            foliage.castShadow = true;
            foliage.receiveShadow = true;
            treeGroup.add(foliage);
        });

        treeGroup.position.set(x, 0, z);
        treeGroup.rotation.y = rotation;
        treeGroup.scale.set(scale, scale, scale);
        return treeGroup;
    }

    // Bäume verteilt in der Welt
    const treePositions = [
        [-100, -80], [-150, 50], [80, -120], [120, 100],
        [-200, 100], [200, -150], [50, 150], [-80, 200],
        [150, 50], [-120, -150], [0, 150], [180, -80],
        [-180, 50], [100, -150], [-100, 120], [70, -70],
        [-150, -100], [160, 120], [-70, -200], [130, -200],
        [0, -100], [-200, -150], [200, 100], [-50, 80],
        [180, 0], [-130, 160], [90, 180], [-160, 0]
    ];

    treePositions.forEach(pos => {
        const tree = createTree(pos[0], pos[1]);
        scene.add(tree);
    });

    // ===== BESONDERE ORTE =====
    
    // Realistischer See mit Reflexion
    const lakeGeometry = new THREE.CircleGeometry(60, 64);
    const lakeMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x2B5A8E,
        roughness: 0.1,
        metalness: 0.8,
        transparent: true,
        opacity: 0.9
    });
    const lake = new THREE.Mesh(lakeGeometry, lakeMaterial);
    lake.rotation.x = -Math.PI / 2;
    lake.position.set(-150, 0.05, -100);
    lake.receiveShadow = true;
    scene.add(lake);
    
    // Wasser-Rand mit Schilf-Andeutung
    for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI * 2;
        const radius = 58 + Math.random() * 4;
        const reedGeometry = new THREE.CylinderGeometry(0.2, 0.3, 4, 4);
        const reedMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x4A6B3A,
            roughness: 0.8
        });
        const reed = new THREE.Mesh(reedGeometry, reedMaterial);
        reed.position.set(
            -150 + Math.cos(angle) * radius,
            2,
            -100 + Math.sin(angle) * radius
        );
        reed.rotation.z = (Math.random() - 0.5) * 0.3;
        reed.castShadow = true;
        scene.add(reed);
    }

    // Realistischere Brücke über See
    const bridgeMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x6B4423,
        roughness: 0.8,
        metalness: 0.0
    });
    
    // Brückendeck mit Planken
    const bridgeDeckGeometry = new THREE.BoxGeometry(40, 1.5, 10);
    const bridgeDeck = new THREE.Mesh(bridgeDeckGeometry, bridgeMaterial);
    bridgeDeck.position.set(-150, 2, -100);
    bridgeDeck.castShadow = true;
    bridgeDeck.receiveShadow = true;
    scene.add(bridgeDeck);
    
    // Planken-Details
    for (let i = -19; i <= 19; i += 2) {
        const plankGeometry = new THREE.BoxGeometry(1.5, 0.2, 10);
        const plank = new THREE.Mesh(plankGeometry, bridgeMaterial);
        plank.position.set(-150 + i, 2.8, -100);
        plank.castShadow = true;
        scene.add(plank);
    }

    // Brückenpfosten
    for (let i = -20; i <= 20; i += 10) {
        const postGeometry = new THREE.CylinderGeometry(0.8, 0.9, 12, 8);
        const post = new THREE.Mesh(postGeometry, bridgeMaterial);
        post.position.set(-150 + i, -2.5, -100);
        post.castShadow = true;
        post.receiveShadow = true;
        scene.add(post);
    }
    
    // Geländer
    for (let side = -1; side <= 1; side += 2) {
        const railGeometry = new THREE.BoxGeometry(42, 0.5, 0.5);
        const rail = new THREE.Mesh(railGeometry, bridgeMaterial);
        rail.position.set(-150, 4.5, -100 + side * 5);
        rail.castShadow = true;
        scene.add(rail);
        
        // Geländerpfosten
        for (let i = -18; i <= 18; i += 6) {
            const postGeometry = new THREE.BoxGeometry(0.4, 3, 0.4);
            const post = new THREE.Mesh(postGeometry, bridgeMaterial);
            post.position.set(-150 + i, 3.5, -100 + side * 5);
            post.castShadow = true;
            scene.add(post);
        }
    }

    // Kleine Stadt mit Häusern
    const buildingPositions = [
        [150, 80], [170, 100], [130, 110], [160, 60]
    ];

    buildingPositions.forEach((pos, index) => {
        const buildingGroup = new THREE.Group();
        
        // Variation für jedes Haus
        const houseColor = [0xE8D5B7, 0xD4A574, 0xC9B28C, 0xB89968][index % 4];
        
        // Haus Basis mit Details
        const houseGeometry = new THREE.BoxGeometry(20, 15, 20);
        const houseMaterial = new THREE.MeshStandardMaterial({ 
            color: houseColor,
            roughness: 0.7,
            metalness: 0.0
        });
        const house = new THREE.Mesh(houseGeometry, houseMaterial);
        house.position.y = 7.5;
        house.castShadow = true;
        house.receiveShadow = true;
        buildingGroup.add(house);

        // Realistisches Dach
        const roofGeometry = new THREE.ConeGeometry(15, 10, 4);
        const roofMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x7B1E1E,
            roughness: 0.6,
            metalness: 0.1
        });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = 20;
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        roof.receiveShadow = true;
        buildingGroup.add(roof);

        // Schornstein
        const chimneyGeometry = new THREE.BoxGeometry(1.5, 5, 1.5);
        const chimneyMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x5A3A3A,
            roughness: 0.9
        });
        const chimney = new THREE.Mesh(chimneyGeometry, chimneyMaterial);
        chimney.position.set(6, 23, 6);
        chimney.castShadow = true;
        buildingGroup.add(chimney);

        // Fenster (mehrere Etagen)
        const windowMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x8BB8E8,
            emissive: 0x445566,
            emissiveIntensity: 0.3,
            roughness: 0.2,
            metalness: 0.5
        });
        
        // Erdgeschoss Fenster
        for (let i = 0; i < 3; i++) {
            const windowGeometry = new THREE.BoxGeometry(2.5, 3.5, 0.3);
            const window = new THREE.Mesh(windowGeometry, windowMaterial);
            window.position.set(-6 + i * 6, 8, 10.2);
            buildingGroup.add(window);
            
            // Fensterrahmen
            const frameGeometry = new THREE.BoxGeometry(2.8, 3.8, 0.2);
            const frameMaterial = new THREE.MeshStandardMaterial({ 
                color: 0xFFFFFF,
                roughness: 0.4
            });
            const frame = new THREE.Mesh(frameGeometry, frameMaterial);
            frame.position.set(-6 + i * 6, 8, 10.15);
            buildingGroup.add(frame);
        }
        
        // Obergeschoss Fenster
        for (let i = 0; i < 2; i++) {
            const windowGeometry = new THREE.BoxGeometry(2.5, 2.5, 0.3);
            const window = new THREE.Mesh(windowGeometry, windowMaterial);
            window.position.set(-3 + i * 6, 13, 10.2);
            buildingGroup.add(window);
        }
        
        // Tür
        const doorGeometry = new THREE.BoxGeometry(3, 6, 0.3);
        const doorMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x3D2817,
            roughness: 0.7
        });
        const door = new THREE.Mesh(doorGeometry, doorMaterial);
        door.position.set(0, 3, 10.2);
        buildingGroup.add(door);
        
        // Türknauf
        const knobGeometry = new THREE.SphereGeometry(0.2, 8, 8);
        const knobMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xFFD700,
            roughness: 0.3,
            metalness: 0.8
        });
        const knob = new THREE.Mesh(knobGeometry, knobMaterial);
        knob.position.set(1, 3, 10.35);
        buildingGroup.add(knob);

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

    // Hügel
    const hillGeometry = new THREE.ConeGeometry(100, 30, 32);
    const hillMaterial = new THREE.MeshLambertMaterial({ color: 0x2d5016 });
    const hill = new THREE.Mesh(hillGeometry, hillMaterial);
    hill.position.set(-200, -5, 150);
    hill.castShadow = true;
    hill.receiveShadow = true;
    scene.add(hill);

    // Speichere Windmühle für Animation
    const windmillBlades = windmillBase.children[2];

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
    const infoSpots = [
        {
            id: 'lake',
            position: new THREE.Vector3(-150, 0, -100),
            radius: 50,
            title: 'Der See',
            description: 'Ein ruhiger See mit einer malerischen Brücke.'
        },
        {
            id: 'town',
            position: new THREE.Vector3(150, 0, 85),
            radius: 60,
            title: 'Die Stadt',
            description: 'Eine kleine Stadt mit vier Häusern.'
        },
        {
            id: 'windmill',
            position: new THREE.Vector3(80, 0, -150),
            radius: 40,
            title: 'Die Windmühle',
            description: 'Eine traditionelle Windmühle mit rotierenden Flügeln.'
        },
        {
            id: 'hill',
            position: new THREE.Vector3(-200, 0, 150),
            radius: 70,
            title: 'Der Hügel',
            description: 'Ein großer grüner Hügel mit schöner Aussicht.'
        },
        {
            id: 'forest',
            position: new THREE.Vector3(-120, 0, -150),
            radius: 55,
            title: 'Der Wald',
            description: 'Ein dichter Wald voller Bäume.'
        }
    ];

    return { windmillBlades, infoSpots, colliders };
}
