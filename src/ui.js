// UI Overlay Manager
export class UIOverlay {
    constructor() {
        this.overlay = document.getElementById('info-overlay');
        this.title = document.getElementById('overlay-title');
        this.text = document.getElementById('overlay-text');
        this.currentSpotId = null;
    }

    show(title, text, spotId) {
        // Don't re-trigger if we're already showing this spot
        if (this.currentSpotId === spotId) {
            return;
        }

        this.title.textContent = title;
        this.text.textContent = text;
        this.overlay.classList.add('visible');
        this.currentSpotId = spotId;
    }

    hide() {
        this.overlay.classList.remove('visible');
        this.currentSpotId = null;
    }

    isVisible() {
        return this.overlay.classList.contains('visible');
    }

    getCurrentSpotId() {
        return this.currentSpotId;
    }
}
