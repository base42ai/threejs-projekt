// Touch Controls for Mobile Devices
// Virtual joystick on left, accelerate/brake buttons on right

export class TouchControls {
    constructor() {
        this.enabled = false;
        this.touchInput = {
            steer: 0,      // -1 (left) to 1 (right)
            throttle: false,
            brake: false
        };

        // Joystick state
        this.joystick = {
            active: false,
            touchId: null,
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0,
            maxDistance: 60
        };

        // Button states
        this.buttons = {
            throttle: {
                active: false,
                touchId: null
            },
            brake: {
                active: false,
                touchId: null
            }
        };

        // DOM elements
        this.elements = {
            joystickArea: null,
            joystickBase: null,
            joystickStick: null,
            throttleBtn: null,
            brakeBtn: null
        };

        this.init();
    }

    init() {
        // Check if device supports touch
        const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        if (!hasTouch) {
            console.log('Touch not supported, skipping touch controls');
            return;
        }

        this.enabled = true;
        this.setupDOM();
        this.setupEventListeners();
        
        console.log('🎮 Touch controls enabled');
    }

    setupDOM() {
        // Get references to DOM elements
        this.elements.joystickArea = document.getElementById('joystick-area');
        this.elements.joystickBase = document.getElementById('joystick-base');
        this.elements.joystickStick = document.getElementById('joystick-stick');
        this.elements.throttleBtn = document.getElementById('throttle-btn');
        this.elements.brakeBtn = document.getElementById('brake-btn');

        // Show touch controls on touch devices
        if (this.elements.joystickArea) {
            this.elements.joystickArea.style.display = 'block';
        }
        if (this.elements.throttleBtn && this.elements.brakeBtn) {
            this.elements.throttleBtn.style.display = 'flex';
            this.elements.brakeBtn.style.display = 'flex';
        }
    }

    setupEventListeners() {
        // Prevent default touch behavior
        document.addEventListener('touchmove', (e) => {
            // Only prevent default for our control elements
            if (e.target.closest('#joystick-area') || 
                e.target.closest('#throttle-btn') || 
                e.target.closest('#brake-btn')) {
                e.preventDefault();
            }
        }, { passive: false });

        // Joystick events
        if (this.elements.joystickArea) {
            this.elements.joystickArea.addEventListener('touchstart', (e) => this.handleJoystickStart(e), { passive: false });
            this.elements.joystickArea.addEventListener('touchmove', (e) => this.handleJoystickMove(e), { passive: false });
            this.elements.joystickArea.addEventListener('touchend', (e) => this.handleJoystickEnd(e), { passive: false });
            this.elements.joystickArea.addEventListener('touchcancel', (e) => this.handleJoystickEnd(e), { passive: false });
        }

        // Throttle button events
        if (this.elements.throttleBtn) {
            this.elements.throttleBtn.addEventListener('touchstart', (e) => this.handleButtonStart(e, 'throttle'), { passive: false });
            this.elements.throttleBtn.addEventListener('touchend', (e) => this.handleButtonEnd(e, 'throttle'), { passive: false });
            this.elements.throttleBtn.addEventListener('touchcancel', (e) => this.handleButtonEnd(e, 'throttle'), { passive: false });
        }

        // Brake button events
        if (this.elements.brakeBtn) {
            this.elements.brakeBtn.addEventListener('touchstart', (e) => this.handleButtonStart(e, 'brake'), { passive: false });
            this.elements.brakeBtn.addEventListener('touchend', (e) => this.handleButtonEnd(e, 'brake'), { passive: false });
            this.elements.brakeBtn.addEventListener('touchcancel', (e) => this.handleButtonEnd(e, 'brake'), { passive: false });
        }
    }

    handleJoystickStart(e) {
        e.preventDefault();
        
        if (this.joystick.active) return; // Already have a touch
        
        const touch = e.changedTouches[0];
        const rect = this.elements.joystickArea.getBoundingClientRect();
        
        this.joystick.active = true;
        this.joystick.touchId = touch.identifier;
        this.joystick.startX = touch.clientX - rect.left;
        this.joystick.startY = touch.clientY - rect.top;
        this.joystick.currentX = this.joystick.startX;
        this.joystick.currentY = this.joystick.startY;
        
        // Position joystick base
        this.elements.joystickBase.style.left = `${this.joystick.startX}px`;
        this.elements.joystickBase.style.top = `${this.joystick.startY}px`;
        this.elements.joystickBase.style.opacity = '1';
        this.elements.joystickStick.style.opacity = '1';
        
        this.updateJoystickVisuals();
    }

    handleJoystickMove(e) {
        e.preventDefault();
        
        if (!this.joystick.active) return;
        
        // Find our touch
        let touch = null;
        for (let i = 0; i < e.touches.length; i++) {
            if (e.touches[i].identifier === this.joystick.touchId) {
                touch = e.touches[i];
                break;
            }
        }
        
        if (!touch) return;
        
        const rect = this.elements.joystickArea.getBoundingClientRect();
        this.joystick.currentX = touch.clientX - rect.left;
        this.joystick.currentY = touch.clientY - rect.top;
        
        this.updateJoystickVisuals();
        this.updateJoystickInput();
    }

    handleJoystickEnd(e) {
        e.preventDefault();
        
        // Check if our touch ended
        let touchEnded = false;
        for (let i = 0; i < e.changedTouches.length; i++) {
            if (e.changedTouches[i].identifier === this.joystick.touchId) {
                touchEnded = true;
                break;
            }
        }
        
        if (!touchEnded) return;
        
        this.joystick.active = false;
        this.joystick.touchId = null;
        this.touchInput.steer = 0;
        
        // Reset joystick visuals
        this.elements.joystickBase.style.opacity = '0.3';
        this.elements.joystickStick.style.opacity = '0.3';
        this.elements.joystickStick.style.transform = 'translate(-50%, -50%)';
    }

    updateJoystickVisuals() {
        const dx = this.joystick.currentX - this.joystick.startX;
        const dy = this.joystick.currentY - this.joystick.startY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Clamp to max distance
        const clampedDistance = Math.min(distance, this.joystick.maxDistance);
        const angle = Math.atan2(dy, dx);
        
        const offsetX = Math.cos(angle) * clampedDistance;
        const offsetY = Math.sin(angle) * clampedDistance;
        
        // Update stick position
        this.elements.joystickStick.style.transform = `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`;
    }

    updateJoystickInput() {
        const dx = this.joystick.currentX - this.joystick.startX;
        const distance = Math.sqrt(dx * dx);
        
        // Only use horizontal component for steering
        // Normalize to -1..1 range
        this.touchInput.steer = Math.max(-1, Math.min(1, dx / this.joystick.maxDistance));
        
        // Apply deadzone
        const deadzone = 0.15;
        if (Math.abs(this.touchInput.steer) < deadzone) {
            this.touchInput.steer = 0;
        } else {
            // Scale after deadzone
            const sign = Math.sign(this.touchInput.steer);
            const magnitude = (Math.abs(this.touchInput.steer) - deadzone) / (1 - deadzone);
            this.touchInput.steer = sign * magnitude;
        }
    }

    handleButtonStart(e, buttonName) {
        e.preventDefault();
        
        if (this.buttons[buttonName].active) return; // Already pressed
        
        const touch = e.changedTouches[0];
        this.buttons[buttonName].active = true;
        this.buttons[buttonName].touchId = touch.identifier;
        this.touchInput[buttonName] = true;
        
        // Visual feedback
        e.currentTarget.classList.add('active');
    }

    handleButtonEnd(e, buttonName) {
        e.preventDefault();
        
        // Check if our touch ended
        let touchEnded = false;
        for (let i = 0; i < e.changedTouches.length; i++) {
            if (e.changedTouches[i].identifier === this.buttons[buttonName].touchId) {
                touchEnded = true;
                break;
            }
        }
        
        if (!touchEnded) return;
        
        this.buttons[buttonName].active = false;
        this.buttons[buttonName].touchId = null;
        this.touchInput[buttonName] = false;
        
        // Visual feedback
        e.currentTarget.classList.remove('active');
    }

    getTouchInput() {
        return this.touchInput;
    }

    isActive() {
        return this.enabled && (
            this.joystick.active || 
            this.buttons.throttle.active || 
            this.buttons.brake.active
        );
    }
}

// Singleton instance
export const touchControls = new TouchControls();

// Export function for easy access
export function getTouchInput() {
    return touchControls.getTouchInput();
}
