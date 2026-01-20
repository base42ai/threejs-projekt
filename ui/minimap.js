// Minimap - 2D Canvas Top-Down View

export class Minimap {
    constructor(canvasId, worldBounds = { minX: -240, maxX: 240, minZ: -240, maxZ: 240 }) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error(`Canvas element with id "${canvasId}" not found`);
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.worldBounds = worldBounds;
        
        // Canvas size (matches CSS)
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // World dimensions
        this.worldWidth = worldBounds.maxX - worldBounds.minX;
        this.worldHeight = worldBounds.maxZ - worldBounds.minZ;
        
        // Scale factors
        this.scaleX = this.width / this.worldWidth;
        this.scaleZ = this.height / this.worldHeight;
        
        // Frame throttling (draw at ~20 FPS to save performance)
        this.lastDrawTime = 0;
        this.drawInterval = 50; // ms (20 FPS)
    }

    // Convert world coordinates to canvas coordinates
    worldToCanvas(x, z) {
        const canvasX = (x - this.worldBounds.minX) * this.scaleX;
        const canvasZ = (z - this.worldBounds.minZ) * this.scaleZ;
        return { x: canvasX, y: canvasZ };
    }

    // Clear canvas
    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Draw background
        this.ctx.fillStyle = 'rgba(20, 30, 20, 0.9)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw border
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(0, 0, this.width, this.height);
    }

    // Draw the car
    drawCar(position, direction) {
        const pos = this.worldToCanvas(position.x, position.z);
        
        this.ctx.save();
        this.ctx.translate(pos.x, pos.y);
        this.ctx.rotate(direction + Math.PI); // +PI because canvas Y is down
        
        // Draw triangle pointing in direction
        this.ctx.beginPath();
        this.ctx.moveTo(0, -8);  // Front
        this.ctx.lineTo(-5, 8);  // Back left
        this.ctx.lineTo(5, 8);   // Back right
        this.ctx.closePath();
        
        this.ctx.fillStyle = '#FF0000';
        this.ctx.fill();
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
        
        this.ctx.restore();
    }

    // Draw obstacles/colliders
    drawColliders(colliders) {
        this.ctx.fillStyle = 'rgba(139, 69, 19, 0.8)'; // Brown for crates
        this.ctx.strokeStyle = 'rgba(101, 67, 33, 1)';
        this.ctx.lineWidth = 1;
        
        for (const collider of colliders) {
            if (!collider.isActive) continue;
            
            const pos = this.worldToCanvas(
                collider.mesh.position.x,
                collider.mesh.position.z
            );
            
            const size = 6; // Fixed size on minimap
            this.ctx.fillRect(pos.x - size/2, pos.y - size/2, size, size);
            this.ctx.strokeRect(pos.x - size/2, pos.y - size/2, size, size);
        }
    }

    // Draw info spots
    drawInfoSpots(infoSpots, currentSpotId = null) {
        for (const spot of infoSpots) {
            const pos = this.worldToCanvas(spot.position.x, spot.position.z);
            
            // Draw radius circle (faint)
            this.ctx.beginPath();
            this.ctx.arc(pos.x, pos.y, spot.radius * this.scaleX, 0, Math.PI * 2);
            this.ctx.strokeStyle = 'rgba(100, 150, 255, 0.2)';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
            
            // Draw center dot
            this.ctx.beginPath();
            this.ctx.arc(pos.x, pos.y, 4, 0, Math.PI * 2);
            
            // Highlight current spot
            if (spot.id === currentSpotId) {
                this.ctx.fillStyle = '#00FF00';
                this.ctx.strokeStyle = '#FFFFFF';
                this.ctx.lineWidth = 2;
            } else {
                this.ctx.fillStyle = 'rgba(100, 150, 255, 0.8)';
                this.ctx.strokeStyle = 'rgba(100, 150, 255, 1)';
                this.ctx.lineWidth = 1;
            }
            
            this.ctx.fill();
            this.ctx.stroke();
        }
    }

    // Draw mission target (if active)
    drawMissionTarget(mission, infoSpots) {
        if (!mission || mission.completed) return;
        
        // If mission has a specific target spot, highlight it
        if (mission.targetSpot) {
            const targetSpot = infoSpots.find(spot => spot.id === mission.targetSpot);
            if (targetSpot) {
                const pos = this.worldToCanvas(targetSpot.position.x, targetSpot.position.z);
                
                // Draw pulsing circle
                const time = Date.now() / 1000;
                const pulse = Math.sin(time * 3) * 0.5 + 0.5; // 0 to 1
                const radius = 6 + pulse * 3;
                
                this.ctx.beginPath();
                this.ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
                this.ctx.strokeStyle = '#FFD700';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
                
                // Draw star/marker
                this.drawStar(pos.x, pos.y, 5, 8, 4, '#FFD700', '#FFF');
            }
        }
    }

    // Helper to draw a star
    drawStar(cx, cy, spikes, outerRadius, innerRadius, fillColor, strokeColor) {
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        const step = Math.PI / spikes;

        this.ctx.beginPath();
        this.ctx.moveTo(cx, cy - outerRadius);

        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            this.ctx.lineTo(x, y);
            rot += step;

            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            this.ctx.lineTo(x, y);
            rot += step;
        }

        this.ctx.lineTo(cx, cy - outerRadius);
        this.ctx.closePath();
        
        this.ctx.fillStyle = fillColor;
        this.ctx.fill();
        this.ctx.strokeStyle = strokeColor;
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
    }

    // Main draw method
    draw(stateSnapshot) {
        // Throttle to ~20 FPS
        const now = Date.now();
        if (now - this.lastDrawTime < this.drawInterval) {
            return;
        }
        this.lastDrawTime = now;

        // Clear and prepare
        this.clear();

        // Draw in layers (back to front)
        if (stateSnapshot.infoSpots) {
            this.drawInfoSpots(stateSnapshot.infoSpots, stateSnapshot.currentInfoSpot);
        }

        if (stateSnapshot.colliders) {
            this.drawColliders(stateSnapshot.colliders);
        }

        if (stateSnapshot.activeMission && stateSnapshot.infoSpots) {
            this.drawMissionTarget(stateSnapshot.activeMission, stateSnapshot.infoSpots);
        }

        if (stateSnapshot.carPosition && stateSnapshot.carDirection !== undefined) {
            this.drawCar(stateSnapshot.carPosition, stateSnapshot.carDirection);
        }
    }

    // Update world bounds dynamically if needed
    updateWorldBounds(bounds) {
        this.worldBounds = bounds;
        this.worldWidth = bounds.maxX - bounds.minX;
        this.worldHeight = bounds.maxZ - bounds.minZ;
        this.scaleX = this.width / this.worldWidth;
        this.scaleZ = this.height / this.worldHeight;
    }
}
