import { touchControls } from '../ui/touchControls.js';

export function createInput() {
    const keys = {};
    const triggerAction = touchControls.getTriggerAction();
    
    window.addEventListener('keydown', (e) => {
        keys[e.key.toLowerCase()] = true;
        
        // E-Taste für Desktop triggerAction
        if (e.key.toLowerCase() === 'e') {
            triggerAction();
        }
    });
    
    window.addEventListener('keyup', (e) => {
        keys[e.key.toLowerCase()] = false;
    });

    function getState() {
        const touch = touchControls.getTouchInput();
        const isTouchActive = touchControls.isActive();
        
        // Touch input overrides keyboard when active
        if (isTouchActive) {
            return {
                forward: touch.throttle,
                backward: touch.brake,
                left: touch.steer < -0.1,  // Threshold for digital input
                right: touch.steer > 0.1,
                // Add analog steering value for more precise control
                steer: touch.steer
            };
        }
        
        // Keyboard input
        const left = keys['a'] || keys['arrowleft'];
        const right = keys['d'] || keys['arrowright'];
        
        return {
            forward: keys['w'] || keys['arrowup'],
            backward: keys['s'] || keys['arrowdown'],
            left: left,
            right: right,
            // Convert digital keyboard to analog steer value
            steer: left ? -1 : (right ? 1 : 0)
        };
    }

    return { getState };
}

