// Mission UI Overlay

export class MissionUI {
    constructor(missionManager, gameState) {
        this.missionManager = missionManager;
        this.gameState = gameState;
        this.isOpen = false;
        this.selectedIndex = 0;
        
        this.createUI();
        this.setupEventListeners();
    }

    createUI() {
        // Create mission menu overlay
        const overlay = document.createElement('div');
        overlay.id = 'mission-menu';
        overlay.className = 'mission-menu hidden';
        overlay.innerHTML = `
            <div class="mission-menu-content">
                <h2>🎯 Missionen</h2>
                <div id="mission-list"></div>
                <div class="mission-menu-footer">
                    <p><kbd>M</kbd> Schließen | <kbd>↑</kbd><kbd>↓</kbd> Auswählen | <kbd>Enter</kbd> Starten</p>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        
        this.overlay = overlay;
        this.missionList = document.getElementById('mission-list');
    }

    setupEventListeners() {
        // Toggle menu with M key
        window.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'm') {
                this.toggle();
                e.preventDefault();
            }
            
            // Navigation when menu is open
            if (this.isOpen) {
                if (e.key === 'ArrowUp') {
                    this.navigate(-1);
                    e.preventDefault();
                } else if (e.key === 'ArrowDown') {
                    this.navigate(1);
                    e.preventDefault();
                } else if (e.key === 'Enter') {
                    this.selectMission();
                    e.preventDefault();
                } else if (e.key === 'Escape') {
                    this.close();
                    e.preventDefault();
                }
            }
        });
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        this.isOpen = true;
        this.selectedIndex = 0;
        this.overlay.classList.remove('hidden');
        this.render();
    }

    close() {
        this.isOpen = false;
        this.overlay.classList.add('hidden');
    }

    navigate(direction) {
        const missions = this.missionManager.getAvailableMissions();
        this.selectedIndex += direction;
        
        if (this.selectedIndex < 0) this.selectedIndex = missions.length - 1;
        if (this.selectedIndex >= missions.length) this.selectedIndex = 0;
        
        this.render();
    }

    selectMission() {
        const missions = this.missionManager.getAvailableMissions();
        const selected = missions[this.selectedIndex];
        
        if (selected) {
            // Start mission
            const mission = this.missionManager.startMission(selected.id);
            if (mission) {
                this.gameState.startMission(selected.id);
                console.log(`Mission gestartet: ${mission.title}`);
                this.close();
            }
        }
    }

    render() {
        const missions = this.missionManager.getAvailableMissions();
        const activeMission = this.missionManager.getActiveMission();
        
        let html = '';
        
        // Show active mission if any
        if (activeMission && !activeMission.completed) {
            html += `
                <div class="mission-item active-mission">
                    <div class="mission-header">
                        <span class="mission-icon">⏳</span>
                        <span class="mission-title">${activeMission.title}</span>
                    </div>
                    <div class="mission-description">${activeMission.description}</div>
                    <div class="mission-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${(activeMission.progress / activeMission.target) * 100}%"></div>
                        </div>
                        <span class="progress-text">${activeMission.progress}/${activeMission.target}</span>
                    </div>
                </div>
                <div class="mission-divider"></div>
            `;
        }
        
        // Show available missions
        missions.forEach((mission, index) => {
            const isCompleted = this.gameState.missionsCompleted.includes(mission.id);
            const isActive = activeMission && activeMission.id === mission.id;
            const isSelected = index === this.selectedIndex && !isActive;
            
            let statusIcon = '⚪';
            let statusClass = '';
            
            if (isCompleted) {
                statusIcon = '✅';
                statusClass = 'completed';
            } else if (isActive) {
                return; // Skip, already shown above
            }
            
            html += `
                <div class="mission-item ${isSelected ? 'selected' : ''} ${statusClass}">
                    <div class="mission-header">
                        <span class="mission-icon">${statusIcon}</span>
                        <span class="mission-title">${mission.title}</span>
                        <span class="mission-reward">+${mission.reward}</span>
                    </div>
                    <div class="mission-description">${mission.description}</div>
                </div>
            `;
        });
        
        this.missionList.innerHTML = html;
    }

    update() {
        // Update if menu is open and mission is active
        if (this.isOpen) {
            this.render();
        }
    }
}
