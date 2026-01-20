// UI Overlay Manager
export class UIOverlay {
    constructor() {
        this.overlay = document.getElementById('info-overlay');
        this.title = document.getElementById('overlay-title');
        this.text = document.getElementById('overlay-text');
        this.linkHintDesktop = document.getElementById('link-hint-desktop');
        this.linkButtonMobile = document.getElementById('link-button-mobile');
        this.currentSpotId = null;
        this.currentLink = null;
        
        // Check if touch device
        this.isTouchDevice = navigator.maxTouchPoints > 0 || window.matchMedia('(pointer: coarse)').matches;
        
        // Enter-Taste für Link-Öffnung (Desktop)
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && this.currentLink && this.isVisible()) {
                window.open(this.currentLink, '_blank');
            }
        });
        
        // Click/Touch auf Mobile Link-Button
        if (this.linkButtonMobile) {
            // Use both click and touchend for better mobile compatibility
            const openLink = (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (this.currentLink && this.isVisible()) {
                    console.log('Opening link:', this.currentLink);
                    window.open(this.currentLink, '_blank');
                }
            };
            
            this.linkButtonMobile.addEventListener('click', openLink);
            this.linkButtonMobile.addEventListener('touchend', openLink);
        }
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
        
        // Show/hide link hints/buttons based on device and link presence
        if (link) {
            if (this.isTouchDevice) {
                this.linkHintDesktop.style.display = 'none';
                this.linkButtonMobile.style.display = 'block';
            } else {
                this.linkHintDesktop.style.display = 'block';
                this.linkButtonMobile.style.display = 'none';
            }
        } else {
            this.linkHintDesktop.style.display = 'none';
            this.linkButtonMobile.style.display = 'none';
        }
    }

    hide() {
        this.overlay.classList.remove('visible');
        this.currentSpotId = null;
        this.currentLink = null;
        this.linkHintDesktop.style.display = 'none';
        this.linkButtonMobile.style.display = 'none';
    }

    isVisible() {
        return this.overlay.classList.contains('visible');
    }

    getCurrentSpotId() {
        return this.currentSpotId;
    }
    
    getCurrentLink() {
        return this.currentLink;
    }
}
