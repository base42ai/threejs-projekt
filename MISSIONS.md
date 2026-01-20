# Mission System - Developer Guide

## Overview
The mission system tracks player objectives like visiting locations, destroying objects, or reaching positions.

## Mission Types
- **VISIT_SPOT**: Visit specific locations or a number of any locations
- **DESTROY_OBJECTS**: Destroy a number of specific object types (e.g., crates)
- **REACH_POSITION**: Reach specific positions in the world

## Using Missions (Console Commands)

### List all available missions:
```javascript
getAvailableMissions()
```

### Start a mission:
```javascript
startMission('explorer')        // Visit 3 locations
startMission('demolition')      // Destroy 5 crates
startMission('lake_visitor')    // Visit the lake
startMission('town_explorer')   // Visit the town
startMission('windmill_finder') // Find the windmill
startMission('destruction_master') // Destroy all 10 crates
startMission('world_traveler')  // Visit all 5 locations
```

### Check mission progress:
```javascript
getMissionProgress()
```

### Access game state:
```javascript
gameState.score              // Current score
gameState.spotsVisited       // Set of visited spot IDs
gameState.missionsCompleted  // Array of completed mission IDs
```

## Mission Data Structure
Each mission has:
- `id`: Unique identifier
- `title`: Display name
- `description`: What the player needs to do
- `type`: Mission type (VISIT_SPOT, DESTROY_OBJECTS, etc.)
- `target`: Number required to complete
- `progress`: Current progress (0 to target)
- `completed`: Boolean completion status
- `reward`: Score points awarded on completion

## Events
The mission system listens to these events:
- `spot_entered` - Fired when entering an info spot
- `car_collision` - Fired when destroying objects
- `position_reached` - Fired when reaching specific positions

And emits:
- `mission_complete` - Fired when a mission is completed

## Adding New Missions
Edit `src/missions.js` and add to the `MISSIONS` object:

```javascript
new_mission: {
    id: 'new_mission',
    title: 'Mission Title',
    description: 'What to do',
    type: MISSION_TYPES.VISIT_SPOT,
    target: 1,
    targetSpot: 'lake', // Optional: specific spot
    progress: 0,
    completed: false,
    reward: 50
}
```

## Integration with UI
The mission data is available for UI rendering:
- `missionManager.getActiveMission()` - Get current mission
- `missionManager.getMissionProgress()` - Get progress info
- `missionManager.getAvailableMissions()` - List all missions
- Listen to `EVENT_TYPES.MISSION_COMPLETE` event for completion notifications
