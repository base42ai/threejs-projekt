// Audio Manager using Web Audio API

export class AudioManager {
    constructor() {
        this.context = null;
        this.sounds = new Map();
        this.masterVolume = 1.0;
        this.masterGainNode = null;
        this.initialized = false;
        
        // Currently playing sounds
        this.playing = new Map();
    }

    // Initialize audio context (must be called after user interaction)
    async init() {
        if (this.initialized) return;
        
        try {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGainNode = this.context.createGain();
            this.masterGainNode.gain.value = this.masterVolume;
            this.masterGainNode.connect(this.context.destination);
            this.initialized = true;
            console.log('AudioManager initialized');
        } catch (error) {
            console.warn('Failed to initialize AudioContext:', error);
        }
    }

    // Load a sound file
    async load(name, url) {
        if (!this.initialized) {
            await this.init();
        }

        if (!this.context) {
            console.warn(`Cannot load sound "${name}": AudioContext not available`);
            return false;
        }

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
            
            this.sounds.set(name, audioBuffer);
            console.log(`Sound loaded: ${name}`);
            return true;
        } catch (error) {
            console.warn(`Failed to load sound "${name}" from "${url}":`, error.message);
            return false;
        }
    }

    // Play a sound
    play(name, options = {}) {
        if (!this.initialized || !this.context) return null;
        
        const buffer = this.sounds.get(name);
        if (!buffer) {
            console.warn(`Sound "${name}" not loaded`);
            return null;
        }

        const {
            volume = 1.0,
            playbackRate = 1.0,
            loop = false
        } = options;

        // Create source
        const source = this.context.createBufferSource();
        source.buffer = buffer;
        source.loop = loop;
        source.playbackRate.value = playbackRate;

        // Create gain node for this sound
        const gainNode = this.context.createGain();
        gainNode.gain.value = volume;

        // Connect: source -> gain -> master -> destination
        source.connect(gainNode);
        gainNode.connect(this.masterGainNode);

        // Start playback
        source.start(0);

        // Store reference
        const playbackId = `${name}_${Date.now()}_${Math.random()}`;
        this.playing.set(playbackId, {
            source,
            gainNode,
            name,
            isLooping: loop
        });

        // Remove from playing map when finished (if not looping)
        if (!loop) {
            source.onended = () => {
                this.playing.delete(playbackId);
            };
        }

        return playbackId;
    }

    // Play a sound in loop
    loop(name, options = {}) {
        return this.play(name, { ...options, loop: true });
    }

    // Stop a specific playback or all instances of a sound
    stop(nameOrId) {
        let stopped = false;

        for (const [id, playback] of this.playing.entries()) {
            if (id === nameOrId || playback.name === nameOrId) {
                try {
                    playback.source.stop();
                } catch (e) {
                    // Already stopped
                }
                this.playing.delete(id);
                stopped = true;
            }
        }

        return stopped;
    }

    // Stop all sounds
    stopAll() {
        for (const [id, playback] of this.playing.entries()) {
            try {
                playback.source.stop();
            } catch (e) {
                // Already stopped
            }
        }
        this.playing.clear();
    }

    // Set master volume (0.0 to 1.0)
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        if (this.masterGainNode) {
            this.masterGainNode.gain.value = this.masterVolume;
        }
    }

    // Get master volume
    getMasterVolume() {
        return this.masterVolume;
    }

    // Update playback rate of a playing sound
    setPlaybackRate(nameOrId, rate) {
        for (const [id, playback] of this.playing.entries()) {
            if (id === nameOrId || playback.name === nameOrId) {
                playback.source.playbackRate.value = rate;
            }
        }
    }

    // Update volume of a playing sound
    setVolume(nameOrId, volume) {
        for (const [id, playback] of this.playing.entries()) {
            if (id === nameOrId || playback.name === nameOrId) {
                playback.gainNode.gain.value = volume;
            }
        }
    }

    // Fade in a sound
    fadeIn(nameOrId, duration = 1000) {
        for (const [id, playback] of this.playing.entries()) {
            if (id === nameOrId || playback.name === nameOrId) {
                const now = this.context.currentTime;
                playback.gainNode.gain.setValueAtTime(0, now);
                playback.gainNode.gain.linearRampToValueAtTime(1, now + duration / 1000);
            }
        }
    }

    // Fade out and stop a sound
    fadeOut(nameOrId, duration = 1000) {
        for (const [id, playback] of this.playing.entries()) {
            if (id === nameOrId || playback.name === nameOrId) {
                const now = this.context.currentTime;
                playback.gainNode.gain.setValueAtTime(playback.gainNode.gain.value, now);
                playback.gainNode.gain.linearRampToValueAtTime(0, now + duration / 1000);
                
                setTimeout(() => {
                    this.stop(id);
                }, duration);
            }
        }
    }

    // Check if a sound is playing
    isPlaying(name) {
        for (const playback of this.playing.values()) {
            if (playback.name === name) {
                return true;
            }
        }
        return false;
    }

    // Get all loaded sound names
    getLoadedSounds() {
        return Array.from(this.sounds.keys());
    }
}

// Singleton instance
export const audioManager = new AudioManager();
