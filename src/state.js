// Central Game State
export const gameState = {
    // Player stats
    score: 0,
    distanceTraveled: 0,
    
    // Mission / Objectives
    activeMissionId: null,
    missionProgress: 0,
    missionsCompleted: [],
    
    // Discovery flags
    spotsVisited: new Set(),
    
    // Game flags
    isPaused: false,
    isGameStarted: true,
    
    // Runtime data
    currentInfoSpot: null,
    
    // Methods to update state
    visitSpot(spotId) {
        if (!this.spotsVisited.has(spotId)) {
            this.spotsVisited.add(spotId);
            this.score += 10;
            return true; // First time visiting
        }
        return false; // Already visited
    },
    
    addDistance(distance) {
        this.distanceTraveled += distance;
    },
    
    startMission(missionId) {
        this.activeMissionId = missionId;
        this.missionProgress = 0;
    },
    
    updateMissionProgress(progress) {
        this.missionProgress = progress;
    },
    
    completeMission(missionId, reward) {
        this.missionsCompleted.push(missionId);
        this.score += reward;
        this.activeMissionId = null;
        this.missionProgress = 0;
    },
    
    reset() {
        this.score = 0;
        this.distanceTraveled = 0;
        this.activeMissionId = null;
        this.missionProgress = 0;
        this.missionsCompleted = [];
        this.spotsVisited.clear();
        this.currentInfoSpot = null;
    },
    
    getVisitedCount() {
        return this.spotsVisited.size;
    }
};
