# DOOM Chemistry Escape Room

A browser-based educational game that combines the classic DOOM aesthetic with chemistry puzzles. Navigate through a laboratory facility, solve chemistry challenges to unlock doors, and escape!

## Features

- **DOOM-inspired 3D graphics** with raycasting-style rendering
- **5 Different Chemistry Puzzle Types:**
  - Periodic Table challenges
  - Chemical equation balancing
  - Molecular structure identification
  - Stoichiometry problems
  - pH calculations
- **Escape room mechanics** with locked doors and keys
- **Progressive difficulty** - puzzles unlock as you progress
- **Real-time 3D movement** with mouse look and WASD controls
- **Educational feedback** with explanations for each answer
- **Scoring system** and time tracking
- **Minimap** for navigation

## How to Play

### Controls
- **W, A, S, D** - Move around
- **Mouse** - Look around (click to enable mouse lock)
- **E** - Interact with puzzle stations
- **ESC** - Toggle instructions

### Objective
1. Navigate through the laboratory facility
2. Find and interact with glowing puzzle stations (cyan squares)
3. Solve chemistry puzzles to unlock doors (red = locked, green = unlocked)
4. Collect health items (red squares) and keys (yellow squares)
5. Progress through all 5 puzzle rooms to complete the escape

### Puzzle Types

1. **Periodic Table Challenge** - Test your knowledge of atomic numbers and element properties
2. **Equation Balancing** - Balance chemical equations by selecting the correct coefficients
3. **Molecular Structure** - Identify molecular geometries and shapes
4. **Stoichiometry** - Calculate molar relationships in chemical reactions
5. **pH Calculations** - Determine pH values from hydrogen ion concentrations

## Running the Game

### Method 1: Python Server (Recommended)
1. Make sure you have Python 3 installed
2. Open a terminal/command prompt in the game directory
3. Run: `python server.py`
4. The game will automatically open in your browser at `http://localhost:8000`

### Method 2: Direct File Opening
1. Simply open `index.html` in a modern web browser
2. Note: Some features may be limited due to browser security restrictions

## Educational Value

This game teaches:
- **Periodic Table** knowledge and atomic structure
- **Chemical equation balancing** skills
- **Molecular geometry** concepts
- **Stoichiometric calculations** 
- **Acid-base chemistry** and pH
- **Problem-solving** under time pressure
- **Spatial navigation** and puzzle-solving strategies

## Technical Details

- Built with HTML5 Canvas and JavaScript
- Uses simplified raycasting for 3D rendering
- Responsive design works on desktop and tablets
- No external dependencies - runs entirely in the browser
- Educational content based on standard chemistry curriculum

## Browser Requirements

- Modern web browser with HTML5 Canvas support
- JavaScript enabled
- Mouse and keyboard for optimal experience
- Recommended: Chrome, Firefox, Safari, or Edge

## Development

The game is built with vanilla JavaScript and can be easily modified:
- `index.html` - Main game structure and UI
- `game.js` - Core game engine and logic
- `server.py` - Development server (optional)

To add new puzzles, modify the `chemistryPuzzles` array in `game.js`.

## License

This educational game is created for learning purposes. The original DOOM source code is licensed under GPL. This chemistry educational version is provided for educational use.

## Credits

- Inspired by id Software's DOOM engine
- Educational chemistry content designed for classroom use
- Built as a rapid prototype for educational gaming