export function createWorld(scene) {
    // Funktion um Baum zu erstellen
    function createTree(x, z) {
        const treeGroup = new THREE.Group();
        
        // Stamm
        const trunkGeometry = new THREE.CylinderGeometry(1.5, 2, 8, 8);
        const trunkMaterial = new THREE.MeshPhongMaterial({ color: 0x5C3D2E });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 4;
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        treeGroup.add(trunk);

        // Krone (mehrere Kugeln)
        const foliageGeometry = new THREE.IcosahedronGeometry(5, 3);
        const foliageMaterial = new THREE.MeshPhongMaterial({ color: 0x228B22 });
        
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
    
    // See
    const lakeGeometry = new THREE.CircleGeometry(60, 64);
    const lakeMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x1E90FF,
        shininess: 100
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

    // Kleine Stadt mit Häusern
    const buildingPositions = [
        [150, 80], [170, 100], [130, 110], [160, 60]
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
