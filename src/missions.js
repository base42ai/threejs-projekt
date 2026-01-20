// Mission System

// Mission Types
export const MISSION_TYPES = {
    VISIT_SPOT: 'visit_spot',
    DESTROY_OBJECTS: 'destroy_objects',
    REACH_POSITION: 'reach_position'
};

// Mission Definitions
export const MISSIONS = {
    explorer: {
        id: 'explorer',
        title: 'Erkunde die Welt',
        description: 'Besuche 3 verschiedene Orte',
        type: MISSION_TYPES.VISIT_SPOT,
        target: 3,
        progress: 0,
        completed: false,
        reward: 50
    },
    
    demolition: {
        id: 'demolition',
        title: 'Demolition Derby',
        description: 'Zerstöre 5 Holzkisten',
        type: MISSION_TYPES.DESTROY_OBJECTS,
        target: 5,
        targetObjectType: 'crate',
        progress: 0,
        completed: false,
        reward: 75
    },
    
    lake_visitor: {
        id: 'lake_visitor',
        title: 'Seeblick',
        description: 'Besuche den See',
        type: MISSION_TYPES.VISIT_SPOT,
        targetSpot: 'lake',
        target: 1,
        progress: 0,
        completed: false,
        reward: 25
    },
    
    town_explorer: {
        id: 'town_explorer',
        title: 'Stadtbummel',
        description: 'Besuche die Stadt',
        type: MISSION_TYPES.VISIT_SPOT,
        targetSpot: 'town',
        target: 1,
        progress: 0,
        completed: false,
        reward: 25
    },
    
    windmill_finder: {
        id: 'windmill_finder',
        title: 'Windmühlen-Jäger',
        description: 'Finde die Windmühle',
        type: MISSION_TYPES.VISIT_SPOT,
        targetSpot: 'windmill',
        target: 1,
        progress: 0,
        completed: false,
        reward: 25
    },
    
    destruction_master: {
        id: 'destruction_master',
        title: 'Zerstörungsmeister',
        description: 'Zerstöre alle 10 Kisten',
        type: MISSION_TYPES.DESTROY_OBJECTS,
        target: 10,
        targetObjectType: 'crate',
        progress: 0,
        completed: false,
        reward: 150
    },
    
    world_traveler: {
        id: 'world_traveler',
        title: 'Weltenbummler',
        description: 'Besuche alle 5 Orte',
        type: MISSION_TYPES.VISIT_SPOT,
        target: 5,
        progress: 0,
        completed: false,
        reward: 100
    }
};

// Mission Manager
export class MissionManager {
    constructor() {
        this.activeMission = null;
        this.visitedSpots = new Set();
        this.destroyedObjects = new Set();
    }

    startMission(missionId) {
        if (!MISSIONS[missionId]) {
            console.error(`Mission ${missionId} not found`);
            return null;
        }

        // Clone mission to avoid mutating original
        this.activeMission = JSON.parse(JSON.stringify(MISSIONS[missionId]));
        this.activeMission.progress = 0;
        this.activeMission.completed = false;

        // Reset tracking
        this.visitedSpots.clear();
        this.destroyedObjects.clear();

        console.log(`Mission started: ${this.activeMission.title}`);
        return this.activeMission;
    }

    updateMission(eventType, eventData) {
        if (!this.activeMission || this.activeMission.completed) {
            return null;
        }

        let progressMade = false;

        switch (this.activeMission.type) {
            case MISSION_TYPES.VISIT_SPOT:
                if (eventType === 'spot_entered') {
                    const spotId = eventData.spotId;
                    
                    // Check if this spot counts for the mission
                    if (this.activeMission.targetSpot) {
                        // Specific spot mission
                        if (spotId === this.activeMission.targetSpot && !this.visitedSpots.has(spotId)) {
                            this.visitedSpots.add(spotId);
                            this.activeMission.progress++;
                            progressMade = true;
                        }
                    } else {
                        // Any spot mission
                        if (!this.visitedSpots.has(spotId)) {
                            this.visitedSpots.add(spotId);
                            this.activeMission.progress++;
                            progressMade = true;
                        }
                    }
                }
                break;

            case MISSION_TYPES.DESTROY_OBJECTS:
                if (eventType === 'car_collision') {
                    const colliderId = eventData.colliderId;
                    const objectType = colliderId.split('_')[0]; // Extract type from id like "crate_0"
                    
                    // Check if this object type matches mission target
                    if (this.activeMission.targetObjectType === objectType && !this.destroyedObjects.has(colliderId)) {
                        this.destroyedObjects.add(colliderId);
                        this.activeMission.progress++;
                        progressMade = true;
                    }
                }
                break;

            case MISSION_TYPES.REACH_POSITION:
                if (eventType === 'position_reached') {
                    if (eventData.positionId === this.activeMission.targetPosition) {
                        this.activeMission.progress++;
                        progressMade = true;
                    }
                }
                break;
        }

        // Check if mission is completed
        if (this.activeMission.progress >= this.activeMission.target) {
            this.activeMission.completed = true;
            console.log(`Mission completed: ${this.activeMission.title}! Reward: ${this.activeMission.reward}`);
            return {
                completed: true,
                mission: this.activeMission
            };
        }

        if (progressMade) {
            console.log(`Mission progress: ${this.activeMission.progress}/${this.activeMission.target}`);
        }

        return progressMade ? { progress: this.activeMission.progress } : null;
    }

    getActiveMission() {
        return this.activeMission;
    }

    clearActiveMission() {
        this.activeMission = null;
        this.visitedSpots.clear();
        this.destroyedObjects.clear();
    }

    getMissionProgress() {
        if (!this.activeMission) return null;
        
        return {
            id: this.activeMission.id,
            title: this.activeMission.title,
            description: this.activeMission.description,
            progress: this.activeMission.progress,
            target: this.activeMission.target,
            completed: this.activeMission.completed
        };
    }

    getAvailableMissions() {
        return Object.values(MISSIONS).map(m => ({
            id: m.id,
            title: m.title,
            description: m.description,
            reward: m.reward,
            type: m.type
        }));
    }
}
