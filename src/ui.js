// UI Overlay Manager
export class UIOverlay {
    constructor() {
        this.overlay = document.getElementById('info-overlay');
        this.title = document.getElementById('overlay-title');
        this.text = document.getElementById('overlay-text');
        this.currentSpotId = null;
        this.currentLink = null;
        
        // Enter-Taste für Link-Öffnung
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && this.currentLink && this.isVisible()) {
                window.open(this.currentLink, '_blank');
            }
        });
    }

    show(title, text, spotId, link = null) {
        // Don't re-trigger if we're already showing this spot
        if (this.currentSpotId === spotId) {
            return;
        }

        this.title.textContent = title;
        this.text.textContent = text;
        this.currentLink = link;
        this.overlay.classList.add('visible');
        this.currentSpotId = spotId;
    }

    hide() {
        this.overlay.classList.remove('visible');
        this.currentSpotId = null;
        this.currentLink = null;
    }

    isVisible() {
        return this.overlay.classList.contains('visible');
    }

    getCurrentSpotId() {
        return this.currentSpotId;
    }
}
