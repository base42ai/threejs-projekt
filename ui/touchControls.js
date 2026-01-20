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
        // Check if device supports touch (navigator.maxTouchPoints or pointer:coarse)
        const hasTouch = navigator.maxTouchPoints > 0;
        const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
        
        if (!hasTouch && !isCoarsePointer) {
            console.log('Touch not supported, skipping touch controls');
            return;
        }

        this.enabled = true;
        this.setupDOM();
        this.setupEventListeners();
        this.preventMobileScrollZoom();
        
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
        // Joystick events with Pointer API
        if (this.elements.joystickArea) {
            this.elements.joystickArea.addEventListener('pointerdown', (e) => this.handleJoystickStart(e));
            this.elements.joystickArea.addEventListener('pointermove', (e) => this.handleJoystickMove(e));
            this.elements.joystickArea.addEventListener('pointerup', (e) => this.handleJoystickEnd(e));
            this.elements.joystickArea.addEventListener('pointercancel', (e) => this.handleJoystickEnd(e));
        }

        // Throttle button events with Pointer API
        if (this.elements.throttleBtn) {
            this.elements.throttleBtn.addEventListener('pointerdown', (e) => this.handleButtonStart(e, 'throttle'));
            this.elements.throttleBtn.addEventListener('pointerup', (e) => this.handleButtonEnd(e, 'throttle'));
            this.elements.throttleBtn.addEventListener('pointercancel', (e) => this.handleButtonEnd(e, 'throttle'));
        }

        // Brake button events with Pointer API
        if (this.elements.brakeBtn) {
            this.elements.brakeBtn.addEventListener('pointerdown', (e) => this.handleButtonStart(e, 'brake'));
            this.elements.brakeBtn.addEventListener('pointerup', (e) => this.handleButtonEnd(e, 'brake'));
            this.elements.brakeBtn.addEventListener('pointercancel', (e) => this.handleButtonEnd(e, 'brake'));
        }
    }

    preventMobileScrollZoom() {
        // Only prevent scroll/zoom on mobile in game area
        if (!this.enabled) return;
        
        // Prevent default touch behavior on game canvas and controls
        document.addEventListener('touchmove', (e) => {
            // Only prevent default for our control elements
            if (e.target.closest('#joystick-area') || 
                e.target.closest('#throttle-btn') || 
                e.target.closest('#brake-btn') ||
                e.target.tagName === 'CANVAS') {
                e.preventDefault();
            }
        }, { passive: false });

        // Prevent pinch-zoom on canvas
        document.addEventListener('gesturestart', (e) => {
            if (e.target.tagName === 'CANVAS') {
                e.preventDefault();
            }
        });

        // Prevent double-tap zoom on canvas
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300 && e.target.tagName === 'CANVAS') {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
    }

    handleJoystickStart(e) {
        e.preventDefault();
        
        // Only handle touch/pen pointers, not mouse
        if (e.pointerType === 'mouse') return;
        
        if (this.joystick.active) return; // Already have a pointer
        
        const rect = this.elements.joystickArea.getBoundingClientRect();
        
        this.joystick.active = true;
        this.joystick.touchId = e.pointerId;
        this.joystick.startX = e.clientX - rect.left;
        this.joystick.startY = e.clientY - rect.top;
        this.joystick.currentX = this.joystick.startX;
        this.joystick.currentY = this.joystick.startY;
        
        // Capture pointer for this element
        this.elements.joystickArea.setPointerCapture(e.pointerId);
        
        // Position joystick base
        this.elements.joystickBase.style.left = `${this.joystick.startX}px`;
        this.elements.joystickBase.style.top = `${this.joystick.startY}px`;
        this.elements.joystickBase.style.opacity = '1';
        this.elements.joystickStick.style.opacity = '1';
        
        this.updateJoystickVisuals();
    }

    handleJoystickMove(e) {
        e.preventDefault();
        
        if (!this.joystick.active || e.pointerId !== this.joystick.touchId) return;
        
        const rect = this.elements.joystickArea.getBoundingClientRect();
        this.joystick.currentX = e.clientX - rect.left;
        this.joystick.currentY = e.clientY - rect.top;
        
        this.updateJoystickVisuals();
        this.updateJoystickInput();
    }

    handleJoystickEnd(e) {
        e.preventDefault();
        
        if (e.pointerId !== this.joystick.touchId) return;
        
        this.joystick.active = false;
        this.joystick.touchId = null;
        this.touchInput.steer = 0; // Reset steer to 0 on release
        
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
        
        // Only handle touch/pen pointers, not mouse
        if (e.pointerType === 'mouse') return;
        
        if (this.buttons[buttonName].active) return; // Already pressed
        
        this.buttons[buttonName].active = true;
        this.buttons[buttonName].touchId = e.pointerId;
        this.touchInput[buttonName] = true; // Set boolean for throttle/brake
        
        // Capture pointer for this element
        e.currentTarget.setPointerCapture(e.pointerId);
        
        // Visual feedback
        e.currentTarget.classList.add('active');
    }

    handleButtonEnd(e, buttonName) {
        e.preventDefault();
        
        if (e.pointerId !== this.buttons[buttonName].touchId) return;
        
        this.buttons[buttonName].active = false;
        this.buttons[buttonName].touchId = null;
        this.touchInput[buttonName] = false; // Reset boolean for throttle/brake
        
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
