// Tiny Event Bus
class EventBus {
    constructor() {
        this.listeners = {};
    }

    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    off(event, callback) {
        if (!this.listeners[event]) return;
        
        this.listeners[event] = this.listeners[event].filter(
            listener => listener !== callback
        );
    }

    emit(event, data) {
        if (!this.listeners[event]) return;
        
        this.listeners[event].forEach(callback => {
            callback(data);
        });
    }

    clear(event) {
        if (event) {
            delete this.listeners[event];
        } else {
            this.listeners = {};
        }
    }
}

// Export singleton instance
export const events = new EventBus();

// Event names constants for consistency
export const EVENT_TYPES = {
    SPOT_ENTERED: 'spot_entered',
    SPOT_EXITED: 'spot_exited',
    MISSION_COMPLETE: 'mission_complete',
    MISSION_PROGRESS: 'mission_progress',
    SCORE_CHANGED: 'score_changed',
    CAR_COLLISION: 'car_collision',
    GAME_PAUSE: 'game_pause',
    GAME_RESUME: 'game_resume'
};
