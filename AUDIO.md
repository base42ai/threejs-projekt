# Audio System Guide

## Overview
The game includes a complete audio system with engine sounds, explosions, and success sounds.

## Features
- ✅ **Engine Sound**: Loops continuously, pitch changes with speed
- ✅ **Explosion Sound**: Plays when hitting crates
- ✅ **Success Sound**: Plays when completing missions
- ✅ **Graceful Degradation**: Game works without sound files

## How It Works

### AudioManager (`src/audio.js`)
Manages all game audio using Web Audio API:

```javascript
// Main methods:
audioManager.load(name, url)              // Load a sound
audioManager.play(name, options)          // Play once
audioManager.loop(name, options)          // Loop continuously
audioManager.stop(name)                   // Stop sound
audioManager.setMasterVolume(0.5)         // Set master volume (0-1)
audioManager.setPlaybackRate(id, rate)    // Change playback speed
audioManager.setVolume(id, volume)        // Change volume
```

### Engine Sound
- Starts on first keypress (required by browsers)
- Loops continuously
- Pitch varies: 0.8x (idle) → 2.0x (max speed)
- Volume varies with speed

### Sound Effects
- **Explosion**: Triggered on crate collision
- **Success**: Triggered on mission completion

## Adding Sound Files

1. Place audio files in `assets/sounds/`:
   - `engine.mp3` - Car engine loop
   - `explosion.mp3` - Explosion effect
   - `success.mp3` - Success/achievement sound

2. Supported formats: MP3, OGG, WAV

3. Recommended sources:
   - https://freesound.org/
   - https://mixkit.co/free-sound-effects/
   - https://www.zapsplat.com/

## Console Commands

```javascript
// Control volume
setVolume(0.5)           // Set master volume (0-1)

// Play sounds manually
playSound('explosion')   // Play explosion
playSound('success')     // Play success

// Stop sounds
stopSound('engine')      // Stop engine
audioManager.stopAll()   // Stop all sounds

// Check status
audioManager.getLoadedSounds()  // List loaded sounds
audioManager.isPlaying('engine') // Check if playing
```

## Volume Constants

Edit `src/constants.js` to adjust default volumes:

```javascript
export const AUDIO = {
    MASTER_VOLUME: 0.5,        // Overall volume
    ENGINE_VOLUME: 0.3,        // Engine sound
    EXPLOSION_VOLUME: 0.7,     // Explosion effect
    SUCCESS_VOLUME: 0.8,       // Success sound
    ENGINE_IDLE_RATE: 0.8,     // Engine pitch at idle
    ENGINE_MAX_RATE: 2.0       // Engine pitch at max speed
};
```

## Troubleshooting

### No Sound Playing
1. Check browser console for warnings
2. Ensure sound files exist in `assets/sounds/`
3. Try pressing a key (audio needs user interaction)
4. Check master volume: `audioManager.getMasterVolume()`

### Sound Not Loading
- Console will show: `Failed to load sound "name" from "url"`
- Game continues to work without sound (graceful degradation)
- Check file paths and formats

### Engine Sound Not Starting
- Must press any key first (browser requirement)
- Check console: `audioManager.isPlaying('engine')`

## Technical Details

- Uses **Web Audio API** for better control
- Sounds are loaded asynchronously
- Missing sounds fail gracefully (console warnings only)
- Engine pitch/volume controlled by car velocity
- All sounds respect master volume
