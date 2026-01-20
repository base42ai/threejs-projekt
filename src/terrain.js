// Terrain-Höhenberechnung für fahrendes Auto

export class TerrainHeightMap {
    constructor() {
        this.hills = [];
        this.mountains = [];
        this.dunes = [];
    }
    
    addHill(x, z, radius, height) {
        this.hills.push({ x, z, radius, height });
    }
    
    addMountain(x, z, radius, height) {
        this.mountains.push({ x, z, radius, height });
    }
    
    addDune(x, z, radius, height) {
        this.dunes.push({ x, z, radius, height });
    }
    
    getHeightAt(x, z) {
        let maxHeight = 0;
        
        // Überprüfe alle Hügel
        for (const hill of this.hills) {
            const distance = Math.sqrt(
                Math.pow(x - hill.x, 2) + Math.pow(z - hill.z, 2)
            );
            
            if (distance < hill.radius) {
                // Sanfte Höhe mit Cosinus-Kurve
                const normalizedDist = distance / hill.radius;
                const height = hill.height * Math.cos(normalizedDist * Math.PI / 2);
                maxHeight = Math.max(maxHeight, height);
            }
        }
        
        // Überprüfe alle Berge (steilere Kurve)
        for (const mountain of this.mountains) {
            const distance = Math.sqrt(
                Math.pow(x - mountain.x, 2) + Math.pow(z - mountain.z, 2)
            );
            
            if (distance < mountain.radius) {
                const normalizedDist = distance / mountain.radius;
                // Steilere Kurve für Berge
                const height = mountain.height * Math.pow(Math.cos(normalizedDist * Math.PI / 2), 0.5);
                maxHeight = Math.max(maxHeight, height);
            }
        }
        
        // Überprüfe alle Dünen (flachere Kurve)
        for (const dune of this.dunes) {
            const distance = Math.sqrt(
                Math.pow(x - dune.x, 2) + Math.pow(z - dune.z, 2)
            );
            
            if (distance < dune.radius) {
                const normalizedDist = distance / dune.radius;
                // Flachere Kurve für Dünen
                const height = dune.height * Math.pow(Math.cos(normalizedDist * Math.PI / 2), 2);
                maxHeight = Math.max(maxHeight, height);
            }
        }
        
        return maxHeight;
    }
    
    // Berechne Neigung (für Auto-Rotation)
    getSlopeAt(x, z) {
        const delta = 0.5; // Kleiner Abstand für Neigungsberechnung
        
        const heightCenter = this.getHeightAt(x, z);
        const heightForward = this.getHeightAt(x, z + delta);
        const heightRight = this.getHeightAt(x + delta, z);
        
        // Neigungswinkel in X und Z Richtung
        const slopeZ = Math.atan2(heightForward - heightCenter, delta);
        const slopeX = Math.atan2(heightRight - heightCenter, delta);
        
        return { slopeX, slopeZ };
    }
}
