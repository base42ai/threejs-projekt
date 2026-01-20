// Audio Manager with Synthetic Sound Support

export class AudioManager {
    constructor() {
        this.context = null;
        this.masterGain = null;
        this.sounds = new Map();
        this.playing = new Map();
        this.initialized = false;
        this.masterVolume = 1.0;
    }

    async init() {
        if (this.initialized) return;
        
        try {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.context.createGain();
            this.masterGain.gain.value = this.masterVolume;
            this.masterGain.connect(this.context.destination);
            this.initialized = true;
            console.log('🔊 AudioManager initialized with synthetic sounds');
        } catch (error) {
            console.warn('Failed to initialize AudioContext:', error);
        }
    }

    // Create synthetic engine sound using oscillators
    createEngineSound(frequency = 110) {
        if (!this.context) return null;
        
        const oscillator1 = this.context.createOscillator();
        const oscillator2 = this.context.createOscillator();
        const gainNode = this.context.createGain();
        const filter = this.context.createBiquadFilter();
        
        oscillator1.type = 'sawtooth';
        oscillator1.frequency.setValueAtTime(frequency, this.context.currentTime);
        
        oscillator2.type = 'square';
        oscillator2.frequency.setValueAtTime(frequency * 2.1, this.context.currentTime);
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, this.context.currentTime);
        filter.Q.setValueAtTime(1, this.context.currentTime);
        
        gainNode.gain.setValueAtTime(0.1, this.context.currentTime);
        
        oscillator1.connect(filter);
        oscillator2.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        return { oscillator1, oscillator2, gainNode, filter };
    }

    // Create synthetic explosion sound
    createExplosionBuffer() {
        if (!this.context) return null;
        
        const bufferSize = this.context.sampleRate * 0.5;
        const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            const t = i / this.context.sampleRate;
            const envelope = Math.exp(-t * 8);
            const noise = (Math.random() * 2 - 1);
            const tone = Math.sin(2 * Math.PI * 80 * Math.exp(-t * 5) * t);
            data[i] = (noise * 0.7 + tone * 0.3) * envelope;
        }
        
        return buffer;
    }

    // Create synthetic success sound
    createSuccessBuffer() {
        if (!this.context) return null;
        
        const bufferSize = this.context.sampleRate * 0.6;
        const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
        const data = buffer.getChannelData(0);
        
        const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
        
        for (let i = 0; i < bufferSize; i++) {
            const t = i / this.context.sampleRate;
            const envelope = Math.max(0, 1 - t * 1.5);
            let value = 0;
            
            notes.forEach((freq, idx) => {
                const delay = idx * 0.1;
                if (t > delay) {
                    value += Math.sin(2 * Math.PI * freq * (t - delay)) * envelope;
                }
            });
            
            data[i] = value * 0.2;
        }
        
        return buffer;
    }

    async load(name, url) {
        if (!this.context) {
            await this.init();
        }

        if (!this.context) return false;

        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
            
            this.sounds.set(name, audioBuffer);
            console.log(`✅ Loaded sound: ${name}`);
            return true;
        } catch (error) {
            console.log(`⚠️ Using synthetic sound for "${name}"`);
            
            // Create synthetic sound as fallback
            if (name === 'explosion') {
                const buffer = this.createExplosionBuffer();
                if (buffer) this.sounds.set(name, buffer);
            } else if (name === 'success') {
                const buffer = this.createSuccessBuffer();
                if (buffer) this.sounds.set(name, buffer);
            }
            
            return false;
        }
    }

    play(name, options = {}) {
        if (!this.context) return null;

        const buffer = this.sounds.get(name);
        if (!buffer) {
            console.warn(`Sound "${name}" not loaded`);
            return null;
        }

        const id = `${name}_${Date.now()}`;
        const source = this.context.createBufferSource();
        const gainNode = this.context.createGain();

        source.buffer = buffer;
        
        const volume = (options.volume !== undefined ? options.volume : 1.0) * this.masterVolume;
        gainNode.gain.setValueAtTime(volume, this.context.currentTime);

        source.connect(gainNode);
        gainNode.connect(this.masterGain);

        this.playing.set(id, { source, gainNode, type: 'buffer' });

        source.start(0);

        if (options.playbackRate !== undefined) {
            source.playbackRate.setValueAtTime(options.playbackRate, this.context.currentTime);
        }

        source.onended = () => {
            this.playing.delete(id);
        };

        return id;
    }

    loop(name, options = {}) {
        if (!this.context) return null;

        // Special handling for synthetic engine sound
        if (name === 'engine' && !this.sounds.has(name)) {
            const id = `${name}_${Date.now()}`;
            const engine = this.createEngineSound();
            
            if (engine) {
                this.playing.set(id, { 
                    source: [engine.oscillator1, engine.oscillator2], 
                    gainNode: engine.gainNode,
                    filter: engine.filter,
                    type: 'synthetic'
                });
                
                const volume = (options.volume !== undefined ? options.volume : 1.0) * this.masterVolume;
                engine.gainNode.gain.setValueAtTime(volume * 0.3, this.context.currentTime);
                
                engine.oscillator1.start(0);
                engine.oscillator2.start(0);
                
                console.log('🚗 Started synthetic engine sound');
                return id;
            }
        }

        const buffer = this.sounds.get(name);
        if (!buffer) {
            console.warn(`Sound "${name}" not loaded`);
            return null;
        }

        const id = `${name}_${Date.now()}`;
        const source = this.context.createBufferSource();
        const gainNode = this.context.createGain();

        source.buffer = buffer;
        source.loop = true;
        
        const volume = (options.volume !== undefined ? options.volume : 1.0) * this.masterVolume;
        gainNode.gain.setValueAtTime(volume, this.context.currentTime);

        source.connect(gainNode);
        gainNode.connect(this.masterGain);

        this.playing.set(id, { source, gainNode, type: 'buffer' });

        source.start(0);

        if (options.playbackRate !== undefined) {
            source.playbackRate.setValueAtTime(options.playbackRate, this.context.currentTime);
        }

        return id;
    }

    stop(id) {
        const sound = this.playing.get(id);
        if (sound) {
            try {
                if (sound.type === 'synthetic' && Array.isArray(sound.source)) {
                    sound.source.forEach(osc => osc.stop());
                } else {
                    sound.source.stop();
                }
            } catch (e) {
                // Already stopped
            }
            this.playing.delete(id);
        }
    }

    stopAll() {
        for (const id of this.playing.keys()) {
            this.stop(id);
        }
    }

    setPlaybackRate(id, rate) {
        const sound = this.playing.get(id);
        if (!sound) return;
        
        if (sound.type === 'synthetic') {
            // Adjust oscillator frequencies for synthetic engine sound
            const baseFreq = 110;
            const newFreq = baseFreq * rate;
            
            if (Array.isArray(sound.source)) {
                sound.source[0].frequency.setValueAtTime(newFreq, this.context.currentTime);
                sound.source[1].frequency.setValueAtTime(newFreq * 2.1, this.context.currentTime);
            }
            
            // Adjust filter frequency for more realistic sound
            if (sound.filter) {
                const filterFreq = 800 + (rate - 1) * 1200;
                sound.filter.frequency.setValueAtTime(filterFreq, this.context.currentTime);
            }
        } else if (sound.source.playbackRate) {
            sound.source.playbackRate.setValueAtTime(rate, this.context.currentTime);
        }
    }

    setVolume(id, volume) {
        const sound = this.playing.get(id);
        if (sound && sound.gainNode) {
            const adjustedVolume = volume * this.masterVolume;
            sound.gainNode.gain.setValueAtTime(adjustedVolume, this.context.currentTime);
        }
    }

    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        if (this.masterGain) {
            this.masterGain.gain.setValueAtTime(this.masterVolume, this.context.currentTime);
        }
    }

    getMasterVolume() {
        return this.masterVolume;
    }

    isPlaying(name) {
        for (const [id, sound] of this.playing.entries()) {
            if (id.startsWith(name + '_')) {
                return true;
            }
        }
        return false;
    }

    getLoadedSounds() {
        return Array.from(this.sounds.keys());
    }
}

export const audioManager = new AudioManager();
