# Sound Assets

This directory contains sound files for the game.

## 🎵 Schnellanleitung - MP3s herunterladen

### Mixkit (Kein Account nötig!) ⭐ EMPFOHLEN

**1. Engine Sound:**
```
🔗 https://mixkit.co/free-sound-effects/car/
Suche: "car engine"
Datei: "Car engine loop" oder "Diesel car engine running"
→ Umbenennen zu: engine.mp3
```

**2. Explosion Sound:**
```
🔗 https://mixkit.co/free-sound-effects/explosion/
Suche: "explosion"
Datei: "Explosion" oder "Cartoon explosion"
→ Umbenennen zu: explosion.mp3
```

**3. Success Sound:**
```
🔗 https://mixkit.co/free-sound-effects/win/
Suche: "complete"
Datei: "Game level complete" oder "Achievement bell"
→ Umbenennen zu: success.mp3
```

### Alternative: Freesound.org (Gratis Account nötig)

1. Gehe zu https://freesound.org/ und registriere dich (kostenlos)
2. Suche nach:
   - **Engine:** `car engine loop` oder `vehicle idle loop`
   - **Explosion:** `explosion short` oder `boom impact`
   - **Success:** `success jingle` oder `game win`
3. Lade herunter und benenne um

## 📋 Installation

1. **Lade 3 Sounds herunter** (siehe oben)
2. **Benenne sie um zu:**
   - `engine.mp3`
   - `explosion.mp3`
   - `success.mp3`
3. **Kopiere sie in diesen Ordner:** `assets/sounds/`
4. **Lade die Webseite neu** (F5 im Browser)
5. **Fertig!** Sound sollte jetzt funktionieren! 🎉

## Required Sound Files

Place the following audio files in this directory:

### Engine Sound
- **engine.mp3** or **engine.ogg**
  - Car engine sound (loopable)
  - Should loop seamlessly
  - Recommended: ~2-3 seconds duration

### Explosion Sound
- **explosion.mp3** or **explosion.ogg**
  - Explosion sound when hitting crates
  - Short, impactful sound effect
  - Recommended: ~1-2 seconds duration

### Success Sound
- **success.mp3** or **success.ogg**
  - Mission completion sound
  - Positive, rewarding sound
  - Recommended: ~1-2 seconds duration

## Audio Formats

Supported formats:
- MP3 (most compatible) ⭐
- OGG (good compression)
- WAV (high quality, large file size)

## Free Sound Resources

You can find free sounds at:
- **https://mixkit.co/free-sound-effects/** ⭐ Kein Account nötig!
- https://freesound.org/ (Account nötig)
- https://www.zapsplat.com/ (Account nötig)
- https://soundbible.com/

## Notes

- ⚠️ Das Spiel nutzt momentan **synthetische Sounds** (Web Audio API generiert)
- Mit echten MP3s klingt es deutlich besser!
- Missing sounds will generate console warnings but won't crash the game
- Sounds are loaded asynchronously on game start
