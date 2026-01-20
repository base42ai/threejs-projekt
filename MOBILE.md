# Mobile Touch Controls

## Features

✅ **Virtual Joystick** (Left side)
- Touch and drag to steer
- Analog steering: -1 (full left) to 1 (full right)
- Deadzone prevents drift
- Visual feedback with movable stick

✅ **Accelerate Button** (Right side, top)
- Green button with ⬆ arrow
- Hold to accelerate
- Multi-touch support

✅ **Brake Button** (Right side, bottom)
- Red button with ⬇ arrow
- Hold to brake/reverse
- Multi-touch support

## How It Works

### Automatic Detection
- Touch controls automatically show on devices with touch support
- Desktop keyboard controls remain functional
- Touch input **overrides** keyboard when active

### Input Merging
The `input.js` module merges both input types:
- **Touch active**: Uses joystick + buttons
- **Touch inactive**: Falls back to keyboard (WASD/Arrows)

### Analog Steering
- Touch joystick provides smooth analog steering (-1 to 1)
- Keyboard provides digital steering (converted to -1, 0, or 1)
- Car physics handle both input types

## Files Created/Modified

### New Files:
- `ui/touchControls.js` - Touch input handler

### Modified Files:
- `index.html` - Added touch control HTML elements
- `ui/overlay.css` - Added touch control styles
- `src/input.js` - Merged keyboard + touch input
- `src/car.js` - Support analog steering

## Technical Details

### TouchControls Class
```javascript
// Main API
touchControls.getTouchInput()  // Returns: { steer, throttle, brake }
touchControls.isActive()       // Returns: true if any touch active
```

### Input State
```javascript
{
    forward: boolean,    // Throttle (keyboard W/↑ or touch button)
    backward: boolean,   // Brake (keyboard S/↓ or touch button)
    left: boolean,       // Digital left (for compatibility)
    right: boolean,      // Digital right (for compatibility)
    steer: number       // Analog steering -1..1 (from joystick or keyboard)
}
```

### Multi-Touch Support
- Joystick and buttons work simultaneously
- Each touch tracked by `identifier`
- Prevents accidental input when releasing one finger

### Visual Feedback
- Joystick appears at touch position
- Stick moves to show steering amount
- Buttons change color when pressed
- Semi-transparent when inactive

## Responsive Design

### Mobile (touch devices):
- Joystick visible (bottom-left)
- Buttons visible (bottom-right)
- Desktop controls hidden
- Smaller minimap

### Desktop:
- Touch controls hidden
- Keyboard controls info shown
- Full-size minimap

## Browser Support

- ✅ Chrome/Edge (Android, iOS)
- ✅ Safari (iOS)
- ✅ Firefox (Android)
- ✅ All touch-enabled devices

## Testing

### Desktop Testing:
- Use Chrome DevTools Device Emulation (F12 → Toggle Device Toolbar)
- Select mobile device (e.g., iPhone, Pixel)
- Reload page
- Touch controls should appear

### Real Device Testing:
1. Host the game (e.g., `python -m http.server 8000`)
2. Open on mobile: `http://[your-ip]:8000`
3. Touch controls should work immediately

## Customization

### Adjust Joystick Sensitivity
Edit `ui/touchControls.js`:
```javascript
this.joystick.maxDistance = 60;  // Increase for less sensitivity
```

### Adjust Deadzone
Edit `ui/touchControls.js`:
```javascript
const deadzone = 0.15;  // Increase to ignore small movements
```

### Adjust Button Position
Edit `ui/overlay.css`:
```css
#throttle-btn {
    bottom: 120px;  /* Distance from bottom */
    right: 20px;    /* Distance from right */
}
```

## Performance

- Minimal overhead (event-based)
- No polling loops
- Efficient touch tracking
- Visual updates only when active
