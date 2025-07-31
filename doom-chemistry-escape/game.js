class DoomChemistryGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        if (!this.canvas) {
            console.error('Game canvas not found! Make sure gameCanvas element exists.');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            console.error('Unable to get 2D context from canvas!');
            return;
        }
        
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        // Map grid system (for raycasting)
        this.TILE_SIZE = 64;
        this.MAP_WIDTH = 12;
        this.MAP_HEIGHT = 9;
        this.map = [];

        // Game state
        this.gameStarted = false;
        this.player = {
            x: 1.5 * this.TILE_SIZE,
            y: 1.5 * this.TILE_SIZE,
            angle: 0,
            health: 100,
            keys: 0,
            speed: 3
        };

        this.score = 0;
        this.puzzlesSolved = 0;
        this.gameTime = 0;
        this.gameStartTime = Date.now();

        // Input handling
        this.keys = {};
        this.mouseX = 0;
        this.mouseY = 0;
        this.mouseLocked = false;

        // Game objects
        this.walls = [];
        this.doors = [];
        this.puzzleStations = [];
        this.items = [];
        this.currentPuzzle = null;

        // 3D Rendering constants
        this.FOV = Math.PI / 3; // 60 degrees
        this.HALF_FOV = this.FOV / 2;
        this.NUM_RAYS = this.canvas.width;
        this.ANGLE_STEP = this.FOV / this.NUM_RAYS;
        this.MAX_DEPTH = 800;
        this.WALL_HEIGHT = 100;
        this.PROJECTION_DIST = (this.canvas.width / 2) / Math.tan(this.HALF_FOV);
        
        // Texture system
        this.textures = {};
        this.TEXTURE_SIZE = 64;
        this.initializeTextures();

        // Additional game features
        this.particles = [];
        this.explosions = [];
        this.soundEnabled = true;
        
        // Delightful features
        this.floatingMolecules = [];
        this.chemistryPuns = [
            "🧪 I've got my ion you!",
            "⚗️ Are you made of Copper and Tellurium? Because you're CuTe!",
            "🔬 I'm reading a book about Helium. I can't put it down!",
            "🧬 Never trust atoms, they make up everything!",
            "⚡ I have a joke about chemistry, but I don't think it will get a reaction!",
            "🌟 What do you call a tooth in a glass of water? A one molar solution!",
            "💫 Why can't you trust atoms? Because they make up literally everything!",
            "🎯 A photon checks into a hotel. The bellhop asks if he has luggage. The photon says 'No, I'm traveling light!'",
            "🚀 H2O is water, but what is H2O4? Drinking!",
            "⭐ What's a chemist's favorite type of tree? A chemis-tree!"
        ];
        this.currentPunIndex = 0;
        this.lastPunTime = 0;
        this.celebrationEffects = [];
        this.mouseTrail = [];
        
        // Sound effects (simple beep simulation)
        this.audioContext = null;
        this.initAudio();

        // Chemistry puzzles database with delightful facts
        this.chemistryPuzzles = [
            {
                id: 1,
                type: 'periodic-table',
                title: '🧪 Periodic Table Challenge',
                question: 'What is the atomic number of Carbon?',
                options: ['4', '6', '8', '12'],
                correct: 1,
                explanation: 'Carbon has 6 protons, so its atomic number is 6. 💎 Fun fact: Diamond and graphite are both made of carbon!',
                reward: 100,
                funFact: '🌟 Carbon is the building block of all life on Earth!'
            },
            {
                id: 2,
                type: 'equation-balancing',
                title: '⚖️ Balance the Chemical Equation',
                question: 'Balance: H₂ + O₂ → H₂O',
                options: ['2H₂ + O₂ → 2H₂O', 'H₂ + 2O₂ → H₂O', 'H₂ + O₂ → 2H₂O', '3H₂ + O₂ → 3H₂O'],
                correct: 0,
                explanation: '2H₂ + O₂ → 2H₂O balances the equation with 4 H atoms and 2 O atoms on each side. 💧 This is how water is made!',
                reward: 150,
                funFact: '🚀 This reaction powers rocket engines when hydrogen and oxygen combust!'
            },
            {
                id: 3,
                type: 'molecular-structure',
                title: '🔬 Molecular Structure',
                question: 'Which molecule has a bent shape?',
                options: ['CO₂ (carbon dioxide)', 'H₂O (water)', 'CH₄ (methane)', 'NH₃ (ammonia)'],
                correct: 1,
                explanation: 'Water (H₂O) has a bent molecular geometry due to the two lone pairs on oxygen. 🌊 This shape is why water has so many unique properties!',
                reward: 120,
                funFact: '❄️ The bent shape of water makes ice less dense than liquid water, so it floats!'
            },
            {
                id: 4,
                type: 'stoichiometry',
                title: '🧮 Stoichiometry Problem',
                question: 'How many moles of O₂ are needed to react with 2 moles of CH₄ in: CH₄ + 2O₂ → CO₂ + 2H₂O',
                options: ['2 moles', '4 moles', '1 mole', '6 moles'],
                correct: 1,
                explanation: 'According to the equation, 1 mole CH₄ needs 2 moles O₂, so 2 moles CH₄ needs 4 moles O₂. 🔥 This is methane combustion!',
                reward: 180,
                funFact: '🏠 This reaction happens in your gas stove when you cook with natural gas!'
            },
            {
                id: 5,
                type: 'ph-calculation',
                title: '🌡️ pH Calculation',
                question: 'What is the pH of a solution with [H⁺] = 1 × 10⁻⁴ M?',
                options: ['4', '10', '-4', '14'],
                correct: 0,
                explanation: 'pH = -log[H⁺] = -log(1 × 10⁻⁴) = 4. 🍋 This is slightly acidic, like weak coffee!',
                reward: 200,
                funFact: '🧪 The pH scale was invented by Danish chemist Søren Sørensen in 1909!'
            },
            {
                id: 6,
                type: 'gas-laws',
                title: '🎈 Gas Laws Challenge',
                question: 'Using PV = nRT, if pressure doubles and temperature stays constant, what happens to volume?',
                options: ['Volume doubles', 'Volume halves', 'Volume stays the same', 'Volume quadruples'],
                correct: 1,
                explanation: 'According to Boyle\'s Law (part of ideal gas law), P and V are inversely proportional when T is constant. 🎈 Like squeezing a balloon!',
                reward: 160,
                funFact: '🏔️ This is why your ears pop when you go up a mountain - air pressure changes!'
            }
        ];

        this.init();
        this.startFloatingMolecules();
    }

    // Initialize procedural textures for walls, floors, and chemistry lab equipment
    initializeTextures() {
        console.log('Creating procedural textures for chemistry lab...');
        
        // Create lab wall texture (metal panels with rivets)
        this.textures.labWall = this.createLabWallTexture();
        
        // Create brick wall texture
        this.textures.brick = this.createBrickTexture();
        
        // Create metal door texture
        this.textures.door = this.createMetalDoorTexture();
        
        // Create floor textures
        this.textures.labFloor = this.createLabFloorTexture();
        this.textures.metalGrating = this.createMetalGratingTexture();
        
        // Create ceiling texture
        this.textures.ceiling = this.createCeilingTexture();
        
        // Create equipment textures
        this.textures.computer = this.createComputerTexture();
        this.textures.microscope = this.createMicroscopeTexture();
        this.textures.periodicTable = this.createPeriodicTableTexture();
        
        console.log('All textures created successfully!');
    }
    
    createLabWallTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = this.TEXTURE_SIZE;
        const ctx = canvas.getContext('2d');
        
        // Base metal color
        const gradient = ctx.createLinearGradient(0, 0, this.TEXTURE_SIZE, 0);
        gradient.addColorStop(0, '#8a9ba8');
        gradient.addColorStop(0.5, '#b0c4de');
        gradient.addColorStop(1, '#708090');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.TEXTURE_SIZE, this.TEXTURE_SIZE);
        
        // Add panel lines
        ctx.strokeStyle = '#4a5568';
        ctx.lineWidth = 2;
        for (let i = 0; i <= this.TEXTURE_SIZE; i += 16) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, this.TEXTURE_SIZE);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(this.TEXTURE_SIZE, i);
            ctx.stroke();
        }
        
        // Add rivets
        ctx.fillStyle = '#2d3748';
        for (let x = 8; x < this.TEXTURE_SIZE; x += 16) {
            for (let y = 8; y < this.TEXTURE_SIZE; y += 16) {
                ctx.beginPath();
                ctx.arc(x, y, 2, 0, Math.PI * 2);
                ctx.fill();
                
                // Highlight
                ctx.fillStyle = '#e2e8f0';
                ctx.beginPath();
                ctx.arc(x - 1, y - 1, 1, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#2d3748';
            }
        }
        
        return canvas;
    }
    
    createBrickTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = this.TEXTURE_SIZE;
        const ctx = canvas.getContext('2d');
        
        // Base brick color
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(0, 0, this.TEXTURE_SIZE, this.TEXTURE_SIZE);
        
        // Brick pattern
        const brickWidth = 20;
        const brickHeight = 8;
        const mortarWidth = 2;
        
        ctx.fillStyle = '#696969'; // Mortar color
        
        for (let y = 0; y < this.TEXTURE_SIZE; y += brickHeight + mortarWidth) {
            const offsetX = ((y / (brickHeight + mortarWidth)) % 2) * (brickWidth / 2);
            
            for (let x = -brickWidth; x < this.TEXTURE_SIZE + brickWidth; x += brickWidth + mortarWidth) {
                // Draw mortar lines
                ctx.fillRect(x + offsetX, y, mortarWidth, brickHeight + mortarWidth);
                ctx.fillRect(x + offsetX, y + brickHeight, brickWidth + mortarWidth, mortarWidth);
            }
        }
        
        return canvas;
    }
    
    createMetalDoorTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = this.TEXTURE_SIZE;
        const ctx = canvas.getContext('2d');
        
        // Base door color (red-tinted metal)
        const gradient = ctx.createLinearGradient(0, 0, this.TEXTURE_SIZE, 0);
        gradient.addColorStop(0, '#8b0000');
        gradient.addColorStop(0.5, '#dc143c');
        gradient.addColorStop(1, '#b22222');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.TEXTURE_SIZE, this.TEXTURE_SIZE);
        
        // Door panel
        ctx.strokeStyle = '#4a0000';
        ctx.lineWidth = 3;
        ctx.strokeRect(8, 8, this.TEXTURE_SIZE - 16, this.TEXTURE_SIZE - 16);
        
        // Warning stripes
        ctx.fillStyle = '#ffff00';
        for (let i = 0; i < 4; i++) {
            const y = 12 + i * 12;
            ctx.fillRect(12, y, this.TEXTURE_SIZE - 24, 4);
        }
        
        // Chemistry safety symbols and jokes
        ctx.fillStyle = '#000000';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('⚗️', this.TEXTURE_SIZE / 2, 25);
        
        ctx.font = '8px Arial';
        ctx.fillText('CAUTION:', this.TEXTURE_SIZE / 2, 40);
        ctx.fillText('Chemistry', this.TEXTURE_SIZE / 2, 48);
        ctx.fillText('Ahead!', this.TEXTURE_SIZE / 2, 56);
        
        ctx.fillStyle = '#ffff00';
        ctx.font = '6px Arial';
        ctx.fillText('😄 Elements may', this.TEXTURE_SIZE / 2, this.TEXTURE_SIZE - 15);
        ctx.fillText('cause reactions!', this.TEXTURE_SIZE / 2, this.TEXTURE_SIZE - 8);
        
        // Add hidden chemistry joke
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.font = '4px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('O M G', 2, this.TEXTURE_SIZE - 2);
        
        return canvas;
    }
    
    createLabFloorTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = this.TEXTURE_SIZE;
        const ctx = canvas.getContext('2d');
        
        // Base floor color (clean lab tiles)
        ctx.fillStyle = '#e6e6fa';
        ctx.fillRect(0, 0, this.TEXTURE_SIZE, this.TEXTURE_SIZE);
        
        // Tile pattern
        const tileSize = 16;
        ctx.strokeStyle = '#d3d3d3';
        ctx.lineWidth = 1;
        
        for (let x = 0; x <= this.TEXTURE_SIZE; x += tileSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.TEXTURE_SIZE);
            ctx.stroke();
        }
        
        for (let y = 0; y <= this.TEXTURE_SIZE; y += tileSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.TEXTURE_SIZE, y);
            ctx.stroke();
        }
        
        // Add some subtle wear patterns and chemistry Easter eggs
        ctx.fillStyle = 'rgba(200, 200, 200, 0.3)';
        for (let i = 0; i < 5; i++) {
            const x = Math.random() * this.TEXTURE_SIZE;
            const y = Math.random() * this.TEXTURE_SIZE;
            ctx.beginPath();
            ctx.arc(x, y, Math.random() * 3 + 1, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Add tiny molecular formulas as Easter eggs
        const molecules = ['H₂O', 'CO₂', 'NH₃', 'CH₄'];
        ctx.fillStyle = 'rgba(0, 255, 0, 0.1)';
        ctx.font = '6px monospace';
        for (let i = 0; i < 2; i++) {
            const x = Math.random() * (this.TEXTURE_SIZE - 20) + 10;
            const y = Math.random() * (this.TEXTURE_SIZE - 10) + 10;
            ctx.fillText(molecules[i % molecules.length], x, y);
        }
        
        return canvas;
    }
    
    createMetalGratingTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = this.TEXTURE_SIZE;
        const ctx = canvas.getContext('2d');
        
        // Base color (dark metal)
        ctx.fillStyle = '#2f2f2f';
        ctx.fillRect(0, 0, this.TEXTURE_SIZE, this.TEXTURE_SIZE);
        
        // Grating pattern
        ctx.fillStyle = '#1a1a1a';
        const spacing = 8;
        
        for (let x = 0; x < this.TEXTURE_SIZE; x += spacing) {
            ctx.fillRect(x, 0, 2, this.TEXTURE_SIZE);
        }
        
        for (let y = 0; y < this.TEXTURE_SIZE; y += spacing) {
            ctx.fillRect(0, y, this.TEXTURE_SIZE, 2);
        }
        
        // Add metal shine
        ctx.fillStyle = '#707070';
        for (let x = 1; x < this.TEXTURE_SIZE; x += spacing) {
            ctx.fillRect(x, 0, 1, this.TEXTURE_SIZE);
        }
        
        for (let y = 1; y < this.TEXTURE_SIZE; y += spacing) {
            ctx.fillRect(0, y, this.TEXTURE_SIZE, 1);
        }
        
        return canvas;
    }
    
    createCeilingTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = this.TEXTURE_SIZE;
        const ctx = canvas.getContext('2d');
        
        // Base ceiling color
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(0, 0, this.TEXTURE_SIZE, this.TEXTURE_SIZE);
        
        // Panel lines
        ctx.strokeStyle = '#dcdcdc';
        ctx.lineWidth = 1;
        
        const panelSize = 32;
        for (let x = 0; x <= this.TEXTURE_SIZE; x += panelSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.TEXTURE_SIZE);
            ctx.stroke();
        }
        
        for (let y = 0; y <= this.TEXTURE_SIZE; y += panelSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.TEXTURE_SIZE, y);
            ctx.stroke();
        }
        
        // Light fixtures
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(8, 8, 16, 16);
        ctx.fillRect(40, 40, 16, 16);
        
        // Light glow effect
        ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
        ctx.fillRect(6, 6, 20, 20);
        ctx.fillRect(38, 38, 20, 20);
        
        return canvas;
    }
    
    createComputerTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = this.TEXTURE_SIZE;
        const ctx = canvas.getContext('2d');
        
        // Base color (computer terminal)
        ctx.fillStyle = '#2f4f4f';
        ctx.fillRect(0, 0, this.TEXTURE_SIZE, this.TEXTURE_SIZE);
        
        // Screen
        ctx.fillStyle = '#000000';
        ctx.fillRect(8, 8, this.TEXTURE_SIZE - 16, this.TEXTURE_SIZE - 24);
        
        // Screen glow
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(10, 10, this.TEXTURE_SIZE - 20, this.TEXTURE_SIZE - 28);
        
        // Screen content (periodic table representation)
        ctx.fillStyle = '#000000';
        ctx.font = '8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('PERIODIC', this.TEXTURE_SIZE / 2, 20);
        ctx.fillText('TABLE', this.TEXTURE_SIZE / 2, 30);
        
        // Draw mini element blocks with fun chemistry symbols
        const funElements = ['He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne', 'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar', 'K', 'Ca', 'Fe', 'Cu', 'Au'];
        let elementIndex = 0;
        
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 4; j++) {
                ctx.strokeStyle = '#00ff00';
                ctx.strokeRect(14 + i * 6, 35 + j * 3, 4, 2);
                
                // Add tiny element symbols
                if (elementIndex < funElements.length) {
                    ctx.fillStyle = '#00ff00';
                    ctx.font = '3px monospace';
                    ctx.textAlign = 'center';
                    ctx.fillText(funElements[elementIndex], 16 + i * 6, 37 + j * 3);
                    elementIndex++;
                }
            }
        }
        ctx.textAlign = 'left';
        
        // Base/keyboard area
        ctx.fillStyle = '#696969';
        ctx.fillRect(4, this.TEXTURE_SIZE - 12, this.TEXTURE_SIZE - 8, 8);
        
        return canvas;
    }
    
    createMicroscopeTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = this.TEXTURE_SIZE;
        const ctx = canvas.getContext('2d');
        
        // Base color
        ctx.fillStyle = '#4a5568';
        ctx.fillRect(0, 0, this.TEXTURE_SIZE, this.TEXTURE_SIZE);
        
        // Microscope base
        ctx.fillStyle = '#2d3748';
        ctx.fillRect(16, this.TEXTURE_SIZE - 16, 32, 12);
        
        // Microscope arm
        ctx.fillStyle = '#4a5568';
        ctx.fillRect(28, 20, 8, this.TEXTURE_SIZE - 36);
        
        // Objective lenses
        ctx.fillStyle = '#1a202c';
        ctx.fillRect(24, 30, 16, 8);
        ctx.fillRect(26, 32, 12, 4);
        
        // Eyepiece
        ctx.fillStyle = '#2d3748';
        ctx.fillRect(30, 16, 4, 8);
        
        // Focus knobs
        ctx.fillStyle = '#718096';
        ctx.fillRect(20, 40, 4, 4);
        ctx.fillRect(40, 40, 4, 4);
        
        // Sample stage
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(20, 45, 24, 4);
        
        return canvas;
    }
    
    createPeriodicTableTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = this.TEXTURE_SIZE;
        const ctx = canvas.getContext('2d');
        
        // Base color (white poster background)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, this.TEXTURE_SIZE, this.TEXTURE_SIZE);
        
        // Border
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeRect(2, 2, this.TEXTURE_SIZE - 4, this.TEXTURE_SIZE - 4);
        
        // Title
        ctx.fillStyle = '#000000';
        ctx.font = '8px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('PERIODIC TABLE', this.TEXTURE_SIZE / 2, 12);
        
        // Draw mini periodic table grid
        const elementSize = 3;
        const startX = 8;
        const startY = 18;
        
        // Sample elements with colors
        const elements = [
            { x: 0, y: 0, color: '#ff6b6b' }, // H
            { x: 17, y: 0, color: '#4ecdc4' }, // He
            { x: 0, y: 1, color: '#45b7d1' }, // Li
            { x: 1, y: 1, color: '#96ceb4' }, // Be
            { x: 12, y: 1, color: '#ffeaa7' }, // B
            { x: 13, y: 1, color: '#fab1a0' }, // C
            { x: 14, y: 1, color: '#fd79a8' }, // N
            { x: 15, y: 1, color: '#fdcb6e' }, // O
        ];
        
        elements.forEach(el => {
            ctx.fillStyle = el.color;
            ctx.fillRect(startX + el.x * (elementSize + 1), startY + el.y * (elementSize + 1), elementSize, elementSize);
        });
        
        // Fill in more elements as gray blocks
        for (let period = 0; period < 7; period++) {
            for (let group = 0; group < 18; group++) {
                if (!elements.find(el => el.x === group && el.y === period)) {
                    ctx.fillStyle = '#ddd';
                    ctx.fillRect(startX + group * (elementSize + 1), startY + period * (elementSize + 1), elementSize, elementSize);
                }
            }
        }
        
        return canvas;
    }

    init() {
        console.log('🧪 Initializing DOOM Chemistry Game with enhanced 3D raycasting and delightful features!');
        this.setupEventListeners();
        this.generateLevel();
        console.log('Map generated:', this.map);
        console.log('Player starting position:', this.player);
        console.log('Textures initialized:', Object.keys(this.textures));
        this.gameLoop();
    }
    
    // Initialize audio context for sound effects
    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Audio not available, continuing without sound effects');
            this.soundEnabled = false;
        }
    }
    
    // Play delightful sound effects
    playSound(frequency = 440, duration = 200, type = 'sine') {
        if (!this.soundEnabled || !this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration / 1000);
    }
    
    // Start floating molecules animation
    startFloatingMolecules() {
        const molecules = ['H₂O', 'CO₂', 'NH₃', 'CH₄', 'O₂', 'N₂', 'C₆H₁₂O₆', 'NaCl', 'CaCO₃', '⚛️', '🧬', '⚗️'];
        
        setInterval(() => {
            if (this.gameStarted && Math.random() < 0.3) {
                this.createFloatingMolecule(molecules[Math.floor(Math.random() * molecules.length)]);
            }
        }, 3000);
    }
    
    // Create floating molecule effect
    createFloatingMolecule(text) {
        const molecule = document.createElement('div');
        molecule.className = 'floating-molecule';
        molecule.textContent = text;
        molecule.style.left = Math.random() * window.innerWidth + 'px';
        molecule.style.animationDelay = Math.random() * 5 + 's';
        
        document.getElementById('floating-molecules').appendChild(molecule);
        
        // Remove after animation
        setTimeout(() => {
            if (molecule.parentNode) {
                molecule.parentNode.removeChild(molecule);
            }
        }, 15000);
    }
    
    // Show chemistry pun notification
    showChemistryPun() {
        const now = Date.now();
        if (now - this.lastPunTime < 10000) return; // Don't spam puns
        
        this.lastPunTime = now;
        const pun = this.chemistryPuns[this.currentPunIndex];
        this.currentPunIndex = (this.currentPunIndex + 1) % this.chemistryPuns.length;
        
        const punElement = document.createElement('div');
        punElement.className = 'chemistry-pun show';
        punElement.textContent = pun;
        
        document.getElementById('chemistry-puns').appendChild(punElement);
        
        // Auto-hide after 4 seconds
        setTimeout(() => {
            punElement.className = 'chemistry-pun hide';
            setTimeout(() => {
                if (punElement.parentNode) {
                    punElement.parentNode.removeChild(punElement);
                }
            }, 500);
        }, 4000);
    }
    
    // Create celebration confetti
    createConfetti() {
        const colors = ['#00ff00', '#ffff00', '#ff6b6b', '#4ecdc4', '#45b7d1', '#ff9ff3'];
        
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti-piece';
                confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.left = Math.random() * window.innerWidth + 'px';
                confetti.style.animationDelay = Math.random() * 2 + 's';
                
                document.body.appendChild(confetti);
                
                setTimeout(() => {
                    if (confetti.parentNode) {
                        confetti.parentNode.removeChild(confetti);
                    }
                }, 3000);
            }, i * 50);
        }
    }
    
    // Create celebration screen flash
    createCelebrationFlash() {
        const flash = document.createElement('div');
        flash.className = 'success-celebration';
        document.body.appendChild(flash);
        
        setTimeout(() => {
            if (flash.parentNode) {
                flash.parentNode.removeChild(flash);
            }
        }, 1000);
    }

    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (e.code === 'Escape') {
                this.toggleInstructions();
            }
            if (e.code === 'KeyE') {
                this.interact();
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        // Mouse events
        this.canvas.addEventListener('click', () => {
            if (!this.mouseLocked && this.gameStarted) {
                this.canvas.requestPointerLock();
            }
        });

        document.addEventListener('pointerlockchange', () => {
            this.mouseLocked = document.pointerLockElement === this.canvas;
        });

        document.addEventListener('mousemove', (e) => {
            if (this.mouseLocked) {
                this.player.angle += e.movementX * 0.003;
                // Normalize angle to prevent overflow
                while (this.player.angle > Math.PI * 2) this.player.angle -= Math.PI * 2;
                while (this.player.angle < 0) this.player.angle += Math.PI * 2;
            }
        });
        
        // Add delightful click sound to buttons
        document.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') {
                this.playSound(800, 100, 'square');
            }
        });

        // UI events
        const startButton = document.getElementById('startButton');
        if (startButton) {
            startButton.addEventListener('click', () => {
                this.startGame();
            });
        }

        const submitButton = document.getElementById('submitAnswer');
        if (submitButton) {
            submitButton.addEventListener('click', () => {
                this.submitPuzzleAnswer();
            });
        }

        const closeButton = document.getElementById('closePuzzle');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                this.closePuzzle();
            });
        }

        // Puzzle option selection
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('puzzle-option')) {
                document.querySelectorAll('.puzzle-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                e.target.classList.add('selected');
            }
        });

        // Window resize
        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        });
    }

    startGame() {
        console.log('🚀 Starting enhanced DOOM Chemistry game with textured 3D raycasting and delightful features!');
        document.getElementById('startScreen').style.display = 'none';
        this.gameStarted = true;
        this.gameStartTime = Date.now();
        this.canvas.requestPointerLock();
        
        // Play start sound
        this.playSound(523, 200); // C note
        setTimeout(() => this.playSound(659, 200), 100); // E note
        setTimeout(() => this.playSound(784, 300), 200); // G note
        
        console.log('✨ Enhanced 3D first-person view with lab textures and whimsy activated!');
        console.log('Available textures:', Object.keys(this.textures));
        
        // Show welcome pun
        setTimeout(() => {
            this.showChemistryPun();
        }, 2000);
    }

    generateLevel() {
        // Create 2D grid map for raycasting (1 = wall, 0 = empty, 2 = door, 3 = puzzle station, 4 = item)
        this.map = [
            [1,1,1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,1,0,0,0,1,0,0,1],
            [1,0,0,0,1,0,0,0,1,0,0,1],
            [1,0,0,0,2,0,0,0,2,0,0,1],
            [1,2,1,1,1,0,1,1,1,1,2,1],
            [1,0,0,0,2,0,0,0,2,0,0,1],
            [1,0,0,0,1,0,0,0,1,0,0,1],
            [1,0,0,0,1,0,0,0,1,0,0,1],
            [1,1,1,1,1,1,1,1,1,1,1,1]
        ];
        
        // Create wall type map for different textures
        this.wallTypes = [
            [1,1,1,1,2,2,2,1,1,1,1,1], // Different wall types for variety
            [1,0,0,0,1,0,0,0,1,0,0,1],
            [1,0,0,0,1,0,0,0,1,0,0,1],
            [1,0,0,0,2,0,0,0,2,0,0,1],
            [1,2,2,2,1,0,2,2,2,2,2,1],
            [1,0,0,0,2,0,0,0,2,0,0,1],
            [1,0,0,0,1,0,0,0,1,0,0,1],
            [1,0,0,0,1,0,0,0,1,0,0,1],
            [2,2,2,1,1,1,1,1,2,2,2,2]
        ];

        // Create doors with puzzle associations
        this.doors = [
            { mapX: 4, mapY: 3, locked: true, puzzleId: 1 },
            { mapX: 8, mapY: 3, locked: true, puzzleId: 2 },
            { mapX: 4, mapY: 5, locked: true, puzzleId: 3 },
            { mapX: 8, mapY: 5, locked: true, puzzleId: 4 },
            { mapX: 1, mapY: 4, locked: true, puzzleId: 5 },
            { mapX: 10, mapY: 4, locked: true, puzzleId: 6 }
        ];

        // Create puzzle stations with 3D properties
        this.puzzleStations = [
            { mapX: 2, mapY: 2, puzzleId: 1, active: true, type: 'computer', height: 40, width: 30 },
            { mapX: 6, mapY: 2, puzzleId: 2, active: false, type: 'periodicTable', height: 50, width: 40 },
            { mapX: 10, mapY: 2, puzzleId: 3, active: false, type: 'microscope', height: 45, width: 25 },
            { mapX: 2, mapY: 6, puzzleId: 4, active: false, type: 'computer', height: 40, width: 30 },
            { mapX: 6, mapY: 6, puzzleId: 5, active: false, type: 'periodicTable', height: 50, width: 40 },
            { mapX: 10, mapY: 6, puzzleId: 6, active: false, type: 'microscope', height: 45, width: 25 }
        ];
        
        // Update map to mark puzzle station positions
        this.puzzleStations.forEach(station => {
            this.map[station.mapY][station.mapX] = 3;
        });

        // Create items (health packs, keys)
        this.items = [
            { mapX: 1, mapY: 1, type: 'health', value: 25 },
            { mapX: 10, mapY: 7, type: 'health', value: 25 },
            { mapX: 5, mapY: 4, type: 'key', value: 1 }
        ];
        
        // Update map to mark item positions
        this.items.forEach(item => {
            if (this.map[item.mapY][item.mapX] === 0) {
                this.map[item.mapY][item.mapX] = 4;
            }
        });
    }

    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }

    update() {
        if (!this.gameStarted) return;

        // Update game time
        this.gameTime = Math.floor((Date.now() - this.gameStartTime) / 1000);
        this.updateHUD();

        // Handle movement
        this.handleMovement();

        // Check for interactions
        this.checkItemCollisions();

        // Update puzzle station availability
        this.updatePuzzleStations();

        // Update particles and effects
        this.updateParticles();
        this.updateExplosions();

        // Check win condition
        if (this.puzzlesSolved >= 6) {
            this.showWinScreen();
        }
        
        // Update delightful features
        this.updateFloatingMolecules();
        this.updateCelebrationEffects();
    }

    handleMovement() {
        let dx = 0;
        let dy = 0;

        // Forward/backward movement
        if (this.keys['KeyW']) {
            dx = Math.cos(this.player.angle) * this.player.speed;
            dy = Math.sin(this.player.angle) * this.player.speed;
        }
        if (this.keys['KeyS']) {
            dx = -Math.cos(this.player.angle) * this.player.speed;
            dy = -Math.sin(this.player.angle) * this.player.speed;
        }
        
        // Strafing movement
        if (this.keys['KeyA']) {
            dx += Math.cos(this.player.angle - Math.PI/2) * this.player.speed;
            dy += Math.sin(this.player.angle - Math.PI/2) * this.player.speed;
        }
        if (this.keys['KeyD']) {
            dx += Math.cos(this.player.angle + Math.PI/2) * this.player.speed;
            dy += Math.sin(this.player.angle + Math.PI/2) * this.player.speed;
        }

        // Check wall collisions using grid-based collision detection
        const newX = this.player.x + dx;
        const newY = this.player.y + dy;
        const playerRadius = 8;

        // Check X movement
        if (!this.checkGridCollision(newX, this.player.y, playerRadius)) {
            this.player.x = newX;
        }
        
        // Check Y movement
        if (!this.checkGridCollision(this.player.x, newY, playerRadius)) {
            this.player.y = newY;
        }
    }

    checkGridCollision(x, y, radius) {
        // Check collision with grid-based map
        const mapX = Math.floor(x / this.TILE_SIZE);
        const mapY = Math.floor(y / this.TILE_SIZE);
        
        // Check bounds
        if (mapX < 0 || mapX >= this.MAP_WIDTH || mapY < 0 || mapY >= this.MAP_HEIGHT) {
            return true;
        }
        
        // Check the main tile
        if (this.map[mapY][mapX] === 1) {
            return true;
        }
        
        // Check doors
        if (this.map[mapY][mapX] === 2) {
            const door = this.doors.find(d => d.mapX === mapX && d.mapY === mapY);
            if (door && door.locked) {
                return true;
            }
        }
        
        // Check surrounding tiles for corner collisions
        const corners = [
            { x: x - radius, y: y - radius },
            { x: x + radius, y: y - radius },
            { x: x - radius, y: y + radius },
            { x: x + radius, y: y + radius }
        ];
        
        for (let corner of corners) {
            const cornerMapX = Math.floor(corner.x / this.TILE_SIZE);
            const cornerMapY = Math.floor(corner.y / this.TILE_SIZE);
            
            if (cornerMapX >= 0 && cornerMapX < this.MAP_WIDTH && 
                cornerMapY >= 0 && cornerMapY < this.MAP_HEIGHT) {
                
                if (this.map[cornerMapY][cornerMapX] === 1) {
                    return true;
                }
                
                if (this.map[cornerMapY][cornerMapX] === 2) {
                    const door = this.doors.find(d => d.mapX === cornerMapX && d.mapY === cornerMapY);
                    if (door && door.locked) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    }

    // Enhanced raycasting algorithm with texture coordinate calculation
    castRay(angle) {
        let sin = Math.sin(angle);
        let cos = Math.cos(angle);
        
        // Prevent division by zero
        if (Math.abs(cos) < 0.0001) cos = cos < 0 ? -0.0001 : 0.0001;
        if (Math.abs(sin) < 0.0001) sin = sin < 0 ? -0.0001 : 0.0001;
        
        let x = this.player.x;
        let y = this.player.y;
        
        const deltaX = Math.abs(1 / cos);
        const deltaY = Math.abs(1 / sin);
        
        const mapX = Math.floor(x / this.TILE_SIZE);
        const mapY = Math.floor(y / this.TILE_SIZE);
        
        let stepX, stepY;
        let sideDistX, sideDistY;
        
        if (cos < 0) {
            stepX = -1;
            sideDistX = (x / this.TILE_SIZE - mapX) * deltaX;
        } else {
            stepX = 1;
            sideDistX = (mapX + 1.0 - x / this.TILE_SIZE) * deltaX;
        }
        
        if (sin < 0) {
            stepY = -1;
            sideDistY = (y / this.TILE_SIZE - mapY) * deltaY;
        } else {
            stepY = 1;
            sideDistY = (mapY + 1.0 - y / this.TILE_SIZE) * deltaY;
        }
        
        let hit = false;
        let side = 0; // 0 = X-side, 1 = Y-side
        let currentMapX = mapX;
        let currentMapY = mapY;
        let distance = 0;
        let wallType = 1;
        let hitX, hitY; // For texture coordinates
        
        // DDA algorithm
        let iterations = 0;
        const maxIterations = Math.max(this.MAP_WIDTH, this.MAP_HEIGHT) * 2;
        
        while (!hit && iterations < maxIterations) {
            iterations++;
            
            if (sideDistX < sideDistY) {
                sideDistX += deltaX;
                currentMapX += stepX;
                side = 0;
            } else {
                sideDistY += deltaY;
                currentMapY += stepY;
                side = 1;
            }
            
            // Check bounds
            if (currentMapX < 0 || currentMapX >= this.MAP_WIDTH || 
                currentMapY < 0 || currentMapY >= this.MAP_HEIGHT) {
                hit = true;
                wallType = 1;
            } else {
                const cell = this.map[currentMapY][currentMapX];
                if (cell === 1) {
                    hit = true;
                    wallType = this.wallTypes && this.wallTypes[currentMapY] && this.wallTypes[currentMapY][currentMapX] 
                              ? this.wallTypes[currentMapY][currentMapX] : 1;
                } else if (cell === 2) {
                    // Check if door is locked
                    const door = this.doors.find(d => d.mapX === currentMapX && d.mapY === currentMapY);
                    if (door && door.locked) {
                        hit = true;
                        wallType = 3; // Door type
                    }
                }
            }
        }
        
        // Calculate distance and hit position for texture mapping
        if (side === 0) {
            distance = (currentMapX - x / this.TILE_SIZE + (1 - stepX) / 2) / cos;
            hitY = y + distance * sin;
        } else {
            distance = (currentMapY - y / this.TILE_SIZE + (1 - stepY) / 2) / sin;
            hitX = x + distance * cos;
        }
        
        distance = Math.abs(distance * this.TILE_SIZE);
        
        // Calculate texture coordinate
        let textureX;
        if (side === 0) {
            textureX = hitY % this.TILE_SIZE;
        } else {
            textureX = hitX % this.TILE_SIZE;
        }
        
        // Normalize texture coordinate to [0, 1]
        textureX = textureX / this.TILE_SIZE;
        if (textureX < 0) textureX += 1;
        
        // Clamp distance to prevent rendering issues
        distance = Math.max(1, Math.min(distance, this.MAX_DEPTH));
        
        return {
            distance: distance,
            side: side,
            wallType: wallType,
            mapX: currentMapX,
            mapY: currentMapY,
            textureX: textureX
        };
    }

    checkItemCollisions() {
        for (let i = this.items.length - 1; i >= 0; i--) {
            const item = this.items[i];
            const itemX = item.mapX * this.TILE_SIZE + this.TILE_SIZE / 2;
            const itemY = item.mapY * this.TILE_SIZE + this.TILE_SIZE / 2;
            
            const distance = Math.sqrt(
                Math.pow(this.player.x - itemX, 2) + 
                Math.pow(this.player.y - itemY, 2)
            );

            if (distance < 30) {
                if (item.type === 'health') {
                    this.player.health = Math.min(100, this.player.health + item.value);
                    this.playSound(440, 300, 'sine'); // Happy pickup sound
                } else if (item.type === 'key') {
                    this.player.keys += item.value;
                    this.playSound(880, 200, 'triangle'); // Key pickup sound
                }
                this.items.splice(i, 1);
                this.createExplosion(itemX, itemY, '#ffff00');
                
                // Show encouraging message
                if (item.type === 'health') {
                    this.showTemporaryMessage('💚 Health Restored! Feeling refreshed!', '#00ff00');
                } else {
                    this.showTemporaryMessage('🗝️ Key Acquired! One step closer to freedom!', '#ffff00');
                }
            }
        }
    }

    updatePuzzleStations() {
        // Activate puzzle stations based on progress
        for (let station of this.puzzleStations) {
            if (station.puzzleId <= this.puzzlesSolved + 1) {
                station.active = true;
            }
        }
    }

    interact() {
        // Check if near a puzzle station
        for (let station of this.puzzleStations) {
            if (station.active) {
                const stationX = station.mapX * this.TILE_SIZE + this.TILE_SIZE / 2;
                const stationY = station.mapY * this.TILE_SIZE + this.TILE_SIZE / 2;
                
                const distance = Math.sqrt(
                    Math.pow(this.player.x - stationX, 2) + 
                    Math.pow(this.player.y - stationY, 2)
                );

                if (distance < 50) {
                    // Play interaction sound
                    this.playSound(660, 150, 'triangle');
                    this.showPuzzle(station.puzzleId);
                    return;
                }
            }
        }
        
        // Play "nothing to interact with" sound
        this.playSound(220, 100, 'sawtooth');
    }

    showPuzzle(puzzleId) {
        const puzzle = this.chemistryPuzzles.find(p => p.id === puzzleId);
        if (!puzzle) return;

        this.currentPuzzle = puzzle;
        
        document.getElementById('puzzleTitle').textContent = puzzle.title;
        
        let content = `<div class="puzzle-question">${puzzle.question}</div>`;
        content += '<div class="puzzle-options">';
        
        puzzle.options.forEach((option, index) => {
            content += `<div class="puzzle-option" data-index="${index}">${option}</div>`;
        });
        
        content += '</div>';
        
        document.getElementById('puzzleContent').innerHTML = content;
        
        // Add fun fact if available
        if (puzzle.funFact) {
            const funFactDiv = document.createElement('div');
            funFactDiv.style.cssText = `
                background: linear-gradient(45deg, #4ecdc4, #45b7d1);
                color: white;
                padding: 10px;
                border-radius: 10px;
                margin: 15px 0;
                font-size: 14px;
                text-align: center;
                border: 2px solid #4ecdc4;
                animation: fun-fact-glow 2s ease-in-out infinite alternate;
            `;
            funFactDiv.innerHTML = `<strong>💡 Did you know?</strong><br>${puzzle.funFact}`;
            document.getElementById('puzzleContent').appendChild(funFactDiv);
            
            // Add fun fact animation
            const style = document.createElement('style');
            style.textContent = `
                @keyframes fun-fact-glow {
                    0% { box-shadow: 0 0 10px rgba(78, 205, 196, 0.3); }
                    100% { box-shadow: 0 0 20px rgba(78, 205, 196, 0.6); }
                }
            `;
            document.head.appendChild(style);
        }
        document.getElementById('puzzleModal').style.display = 'block';
    }

    submitPuzzleAnswer() {
        if (!this.currentPuzzle) return;

        const selectedOption = document.querySelector('.puzzle-option.selected');
        if (!selectedOption) {
            alert('Please select an answer first!');
            return;
        }

        const selectedIndex = parseInt(selectedOption.dataset.index);
        const isCorrect = selectedIndex === this.currentPuzzle.correct;

        // Show feedback
        document.querySelectorAll('.puzzle-option').forEach((option, index) => {
            if (index === this.currentPuzzle.correct) {
                option.classList.add('correct');
            } else if (index === selectedIndex && !isCorrect) {
                option.classList.add('incorrect');
            }
        });

        setTimeout(() => {
            if (isCorrect) {
                this.solvePuzzle(this.currentPuzzle);
            }
            this.closePuzzle();
        }, 2000);
    }

    solvePuzzle(puzzle) {
        this.puzzlesSolved++;
        this.score += puzzle.reward;
        
        // Play success sound sequence
        this.playSound(523, 150); // C
        setTimeout(() => this.playSound(659, 150), 100); // E
        setTimeout(() => this.playSound(784, 150), 200); // G
        setTimeout(() => this.playSound(1047, 300), 300); // High C
        
        // Create celebration effects
        this.createConfetti();
        this.createCelebrationFlash();
        
        // Unlock corresponding door
        const door = this.doors.find(d => d.puzzleId === puzzle.id);
        if (door) {
            door.locked = false;
            const doorX = door.mapX * this.TILE_SIZE + this.TILE_SIZE / 2;
            const doorY = door.mapY * this.TILE_SIZE + this.TILE_SIZE / 2;
            this.createExplosion(doorX, doorY, '#00ff00');
        }

        // Deactivate puzzle station
        const station = this.puzzleStations.find(s => s.puzzleId === puzzle.id);
        if (station) {
            station.active = false;
            const stationX = station.mapX * this.TILE_SIZE + this.TILE_SIZE / 2;
            const stationY = station.mapY * this.TILE_SIZE + this.TILE_SIZE / 2;
            this.createExplosion(stationX, stationY, '#ffff00');
        }

        // Show success message with celebration
        const successMessages = [
            'Outstanding work, scientist! 🥽',
            'Brilliant deduction! 🧠',
            'Chemistry mastery achieved! ⚗️',
            'Molecular genius at work! 🧬',
            'Lab excellence confirmed! 🔬',
            'Scientific prowess unleashed! 🚀'
        ];
        const randomMessage = successMessages[Math.floor(Math.random() * successMessages.length)];
        
        this.showSuccessMessage(`🎉 Correct! ${puzzle.explanation}\n🏆 Reward: ${puzzle.reward} points\n✨ ${randomMessage}`);
        
        // Show chemistry pun after success
        setTimeout(() => {
            this.showChemistryPun();
        }, 2000);
    }

    closePuzzle() {
        document.getElementById('puzzleModal').style.display = 'none';
        this.currentPuzzle = null;
        
        // Clear option states
        document.querySelectorAll('.puzzle-option').forEach(option => {
            option.classList.remove('selected', 'correct', 'incorrect');
        });
    }

    toggleInstructions() {
        const instructions = document.getElementById('gameInstructions');
        instructions.style.display = instructions.style.display === 'none' ? 'block' : 'none';
    }

    updateHUD() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('puzzlesSolved').textContent = this.puzzlesSolved;
        document.getElementById('keysFound').textContent = this.player.keys;
        
        const minutes = Math.floor(this.gameTime / 60);
        const seconds = this.gameTime % 60;
        document.getElementById('gameTime').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        const healthPercent = (this.player.health / 100) * 100;
        document.getElementById('healthFill').style.width = `${healthPercent}%`;
    }

    render() {
        // Clear canvas
        this.ctx.fillStyle = '#222';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (!this.gameStarted) return;

        // Render 3D view using proper raycasting
        this.render3DView();
        this.renderHUD3D();
        this.renderMinimap();
    }

    render3DView() {
        const halfHeight = this.canvas.height / 2;
        
        // Render at adaptive resolution for best performance
        const renderWidth = Math.min(this.canvas.width, 400); // Reduced for texture performance
        const step = Math.max(1, this.canvas.width / renderWidth);
        
        // Cast rays for each vertical strip of the screen
        for (let i = 0; i < renderWidth; i++) {
            const x = i * step;
            const rayAngle = this.player.angle - this.HALF_FOV + (i / renderWidth) * this.FOV;
            const ray = this.castRay(rayAngle);
            
            // Fix fisheye effect
            const correctedDistance = ray.distance * Math.cos(rayAngle - this.player.angle);
            
            // Calculate wall height on screen
            const wallHeight = (this.WALL_HEIGHT / correctedDistance) * this.PROJECTION_DIST;
            
            // Calculate top and bottom of wall strip
            const wallTop = halfHeight - wallHeight / 2;
            const wallBottom = halfHeight + wallHeight / 2;
            
            // Apply lighting based on distance and wall side
            const lightFactor = Math.max(0.1, Math.min(1, 1 - correctedDistance / this.MAX_DEPTH));
            const sideFactor = ray.side === 0 ? 1 : 0.75; // Make Y-sides darker for depth
            const totalLightFactor = lightFactor * sideFactor;
            
            // Draw ceiling with texture
            this.drawTexturedCeiling(x, step, wallTop);
            
            // Draw wall with texture
            this.drawTexturedWall(x, step, wallTop, wallBottom, ray, totalLightFactor);
            
            // Draw floor with texture
            this.drawTexturedFloor(x, step, wallBottom, correctedDistance, rayAngle);
        }
    }
    
    drawTexturedCeiling(x, step, wallTop) {
        const ceilingHeight = Math.max(0, wallTop);
        if (ceilingHeight <= 0) return;
        
        // Simple ceiling texture mapping
        const texture = this.textures.ceiling;
        if (texture) {
            this.ctx.drawImage(texture, 
                0, 0, this.TEXTURE_SIZE, Math.min(this.TEXTURE_SIZE, ceilingHeight * 0.1),
                x, 0, Math.ceil(step), ceilingHeight
            );
        } else {
            this.ctx.fillStyle = '#1a1a1a';
            this.ctx.fillRect(x, 0, Math.ceil(step), ceilingHeight);
        }
    }
    
    drawTexturedWall(x, step, wallTop, wallBottom, ray, lightFactor) {
        const wallHeight = Math.max(1, wallBottom - wallTop);
        
        // Choose texture based on wall type
        let texture;
        switch (ray.wallType) {
            case 1:
                texture = this.textures.labWall;
                break;
            case 2:
                texture = this.textures.brick;
                break;
            case 3:
                texture = this.textures.door;
                break;
            default:
                texture = this.textures.labWall;
        }
        
        if (texture) {
            // Calculate texture coordinates
            const textureX = Math.floor(ray.textureX * this.TEXTURE_SIZE);
            
            // Create a temporary canvas for lighting effects
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = Math.ceil(step);
            tempCanvas.height = wallHeight;
            const tempCtx = tempCanvas.getContext('2d');
            
            // Draw texture strip
            tempCtx.drawImage(texture,
                textureX, 0, 1, this.TEXTURE_SIZE,
                0, 0, Math.ceil(step), wallHeight
            );
            
            // Apply lighting
            if (lightFactor < 1) {
                tempCtx.globalCompositeOperation = 'multiply';
                tempCtx.fillStyle = `rgba(${Math.floor(255 * lightFactor)}, ${Math.floor(255 * lightFactor)}, ${Math.floor(255 * lightFactor)}, 1)`;
                tempCtx.fillRect(0, 0, Math.ceil(step), wallHeight);
            }
            
            // Draw to main canvas
            this.ctx.drawImage(tempCanvas, x, Math.max(0, wallTop));
        } else {
            // Fallback to solid color
            let wallColor;
            switch (ray.wallType) {
                case 3: // Door
                    wallColor = { r: 255, g: 100, b: 100 };
                    break;
                case 2: // Brick
                    wallColor = { r: 139, g: 69, b: 19 };
                    break;
                default: // Lab wall
                    wallColor = { r: 176, g: 196, b: 222 };
            }
            
            const finalR = Math.floor(wallColor.r * lightFactor);
            const finalG = Math.floor(wallColor.g * lightFactor);
            const finalB = Math.floor(wallColor.b * lightFactor);
            
            this.ctx.fillStyle = `rgb(${finalR}, ${finalG}, ${finalB})`;
            this.ctx.fillRect(x, Math.max(0, wallTop), Math.ceil(step), wallHeight);
        }
    }
    
    drawTexturedFloor(x, step, wallBottom, distance, rayAngle) {
        const floorHeight = this.canvas.height - Math.min(this.canvas.height, wallBottom);
        if (floorHeight <= 0) return;
        
        // Simple floor texture mapping
        const texture = this.textures.labFloor;
        if (texture) {
            // Floor rendering with perspective (simplified)
            const floorY = Math.min(this.canvas.height, wallBottom);
            const perspective = Math.max(0.1, 1 - distance / this.MAX_DEPTH);
            
            this.ctx.globalAlpha = perspective;
            this.ctx.drawImage(texture,
                0, 0, this.TEXTURE_SIZE, Math.min(this.TEXTURE_SIZE, floorHeight * 0.1),
                x, floorY, Math.ceil(step), floorHeight
            );
            this.ctx.globalAlpha = 1;
        } else {
            this.ctx.fillStyle = '#2a2a2a';
            this.ctx.fillRect(x, Math.min(this.canvas.height, wallBottom), Math.ceil(step), floorHeight);
        }
    }
    
    renderHUD3D() {
        // Draw puzzle stations and items as 3D sprites
        this.renderSprites();
        
        // Draw crosshair
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const crosshairSize = 10;
        
        this.ctx.strokeStyle = '#00ff00';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(centerX - crosshairSize, centerY);
        this.ctx.lineTo(centerX + crosshairSize, centerY);
        this.ctx.moveTo(centerX, centerY - crosshairSize);
        this.ctx.lineTo(centerX, centerY + crosshairSize);
        this.ctx.stroke();
    }
    
    renderSprites() {
        const sprites = [];
        
        // Add puzzle stations as 3D sprites
        this.puzzleStations.forEach(station => {
            if (station.active) {
                const spriteX = station.mapX * this.TILE_SIZE + this.TILE_SIZE / 2;
                const spriteY = station.mapY * this.TILE_SIZE + this.TILE_SIZE / 2;
                const distance = Math.sqrt(
                    Math.pow(this.player.x - spriteX, 2) + 
                    Math.pow(this.player.y - spriteY, 2)
                );
                
                // Color based on equipment type
                let color;
                switch (station.type) {
                    case 'computer':
                        color = '#00ffff';
                        break;
                    case 'periodicTable':
                        color = '#ffff00';
                        break;
                    case 'microscope':
                        color = '#ff00ff';
                        break;
                    default:
                        color = '#00ffff';
                }
                
                sprites.push({
                    x: spriteX,
                    y: spriteY,
                    distance: distance,
                    type: 'puzzle',
                    color: color,
                    size: station.height,
                    equipment: station.type
                });
            }
        });
        
        // Add items as 3D sprites
        this.items.forEach(item => {
            const spriteX = item.mapX * this.TILE_SIZE + this.TILE_SIZE / 2;
            const spriteY = item.mapY * this.TILE_SIZE + this.TILE_SIZE / 2;
            const distance = Math.sqrt(
                Math.pow(this.player.x - spriteX, 2) + 
                Math.pow(this.player.y - spriteY, 2)
            );
            
            sprites.push({
                x: spriteX,
                y: spriteY,
                distance: distance,
                type: item.type,
                color: item.type === 'health' ? '#ff6666' : '#ffff00',
                size: 15
            });
        });
        
        // Sort sprites by distance (farthest first)
        sprites.sort((a, b) => b.distance - a.distance);
        
        // Render sprites
        sprites.forEach(sprite => {
            this.renderSprite(sprite);
        });
    }
    
    renderSprite(sprite) {
        // Calculate sprite position relative to player
        const dx = sprite.x - this.player.x;
        const dy = sprite.y - this.player.y;
        
        // Transform to screen coordinates
        const distance = sprite.distance;
        const angle = Math.atan2(dy, dx) - this.player.angle;
        
        // Check if sprite is in front of player
        if (Math.abs(angle) > this.HALF_FOV + 0.5) return;
        
        // Calculate sprite screen position
        const spriteScreenX = this.canvas.width / 2 + Math.tan(angle) * this.PROJECTION_DIST;
        
        // Don't render if too far or too close
        if (distance < 10 || distance > this.MAX_DEPTH) return;
        
        // Apply lighting
        const lightFactor = Math.max(0.3, Math.min(1, 1 - distance / this.MAX_DEPTH));
        
        if (sprite.type === 'puzzle') {
            this.render3DPuzzleStation(sprite, spriteScreenX, distance, lightFactor);
        } else {
            this.render3DItem(sprite, spriteScreenX, distance, lightFactor);
        }
    }
    
    render3DPuzzleStation(sprite, screenX, distance, lightFactor) {
        // Get puzzle station data
        const station = this.puzzleStations.find(s => 
            Math.abs(s.mapX * this.TILE_SIZE + this.TILE_SIZE / 2 - sprite.x) < 5 &&
            Math.abs(s.mapY * this.TILE_SIZE + this.TILE_SIZE / 2 - sprite.y) < 5
        );
        
        if (!station) return;
        
        // Calculate 3D dimensions
        const baseSize = (station.height / distance) * this.PROJECTION_DIST;
        const width = (station.width / distance) * this.PROJECTION_DIST;
        
        // Position on ground (not floating)
        const groundLevel = this.canvas.height / 2 + (this.WALL_HEIGHT / distance) * this.PROJECTION_DIST / 4;
        const spriteTop = groundLevel - baseSize;
        const spriteBottom = groundLevel;
        const spriteLeft = screenX - width / 2;
        const spriteRight = screenX + width / 2;
        
        // Choose texture based on equipment type
        let texture;
        switch (station.type) {
            case 'computer':
                texture = this.textures.computer;
                break;
            case 'periodicTable':
                texture = this.textures.periodicTable;
                break;
            case 'microscope':
                texture = this.textures.microscope;
                break;
            default:
                texture = this.textures.computer;
        }
        
        if (texture) {
            // Create 3D effect by drawing multiple layers
            this.ctx.globalAlpha = lightFactor * 0.3;
            
            // Shadow
            this.ctx.fillStyle = '#000000';
            this.ctx.fillRect(spriteLeft + 5, spriteBottom - 3, width, 8);
            
            this.ctx.globalAlpha = lightFactor;
            
            // Main equipment body
            this.ctx.drawImage(texture, spriteLeft, spriteTop, width, baseSize);
            
            // Add 3D depth effect
            const depthOffset = Math.max(2, width * 0.1);
            this.ctx.globalAlpha = lightFactor * 0.7;
            this.ctx.fillStyle = '#666666';
            
            // Right side (depth)
            this.ctx.beginPath();
            this.ctx.moveTo(spriteRight, spriteTop);
            this.ctx.lineTo(spriteRight + depthOffset, spriteTop - depthOffset);
            this.ctx.lineTo(spriteRight + depthOffset, spriteBottom - depthOffset);
            this.ctx.lineTo(spriteRight, spriteBottom);
            this.ctx.fill();
            
            // Top side (depth)
            this.ctx.beginPath();
            this.ctx.moveTo(spriteLeft, spriteTop);
            this.ctx.lineTo(spriteLeft + depthOffset, spriteTop - depthOffset);
            this.ctx.lineTo(spriteRight + depthOffset, spriteTop - depthOffset);
            this.ctx.lineTo(spriteRight, spriteTop);
            this.ctx.fill();
            
            this.ctx.globalAlpha = 1;
        } else {
            // Fallback 3D rendering
            this.ctx.globalAlpha = lightFactor;
            
            // Shadow
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            this.ctx.fillRect(spriteLeft + 3, spriteBottom - 2, width, 6);
            
            // Main body
            this.ctx.fillStyle = sprite.color;
            this.ctx.fillRect(spriteLeft, spriteTop, width, baseSize);
            
            // 3D effect
            const depthOffset = Math.max(2, width * 0.1);
            this.ctx.fillStyle = '#444444';
            
            // Right side
            this.ctx.beginPath();
            this.ctx.moveTo(spriteRight, spriteTop);
            this.ctx.lineTo(spriteRight + depthOffset, spriteTop - depthOffset);
            this.ctx.lineTo(spriteRight + depthOffset, spriteBottom - depthOffset);
            this.ctx.lineTo(spriteRight, spriteBottom);
            this.ctx.fill();
            
            // Top side
            this.ctx.beginPath();
            this.ctx.moveTo(spriteLeft, spriteTop);
            this.ctx.lineTo(spriteLeft + depthOffset, spriteTop - depthOffset);
            this.ctx.lineTo(spriteRight + depthOffset, spriteTop - depthOffset);
            this.ctx.lineTo(spriteRight, spriteTop);
            this.ctx.fill();
            
            this.ctx.globalAlpha = 1;
        }
        
        // Draw interaction prompt with fun animations
        if (distance < 80) {
            // Pulsing interaction text
            const pulseScale = 1 + Math.sin(Date.now() * 0.01) * 0.1;
            this.ctx.save();
            this.ctx.translate(screenX, spriteTop - 10);
            this.ctx.scale(pulseScale, pulseScale);
            
            this.ctx.fillStyle = '#ffff00';
            this.ctx.font = '16px Courier New';
            this.ctx.textAlign = 'center';
            this.ctx.strokeStyle = '#000000';
            this.ctx.lineWidth = 3;
            this.ctx.strokeText('⚡ Press E ⚡', 0, 0);
            this.ctx.fillText('⚡ Press E ⚡', 0, 0);
            
            this.ctx.restore();
            
            // Equipment label with icon
            this.ctx.font = '12px Courier New';
            this.ctx.textAlign = 'center';
            let label = station.type.charAt(0).toUpperCase() + station.type.slice(1);
            let icon = '🔬';
            if (station.type === 'computer') icon = '💻';
            if (station.type === 'periodicTable') icon = '📊';
            if (station.type === 'microscope') icon = '🔬';
            
            const fullLabel = `${icon} ${label} ${icon}`;
            this.ctx.strokeText(fullLabel, screenX, spriteBottom + 20);
            this.ctx.fillText(fullLabel, screenX, spriteBottom + 20);
            
            this.ctx.textAlign = 'left';
        }
    }
    
    render3DItem(sprite, screenX, distance, lightFactor) {
        const spriteSize = (sprite.size / distance) * this.PROJECTION_DIST;
        
        // Position on ground level
        const groundLevel = this.canvas.height / 2 + (this.WALL_HEIGHT / distance) * this.PROJECTION_DIST / 4;
        const spriteTop = groundLevel - spriteSize;
        const spriteBottom = groundLevel;
        const spriteLeft = screenX - spriteSize;
        const spriteRight = screenX + spriteSize;
        
        this.ctx.globalAlpha = lightFactor;
        
        // Shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(spriteLeft + 2, spriteBottom - 2, spriteSize * 2, 4);
        
        // Item glow effect
        const glowSize = spriteSize * 1.2;
        const gradient = this.ctx.createRadialGradient(
            screenX, groundLevel - spriteSize / 2, 0,
            screenX, groundLevel - spriteSize / 2, glowSize
        );
        gradient.addColorStop(0, sprite.color + '80');
        gradient.addColorStop(1, 'transparent');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(screenX - glowSize, groundLevel - spriteSize / 2 - glowSize, 
                         glowSize * 2, glowSize * 2);
        
        // Main item
        this.ctx.fillStyle = sprite.color;
        this.ctx.fillRect(spriteLeft, spriteTop, spriteSize * 2, spriteSize * 2);
        
        // Item icon with bounce animation
        const bounceOffset = Math.sin(Date.now() * 0.01) * 3;
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = `${Math.max(12, spriteSize)}px Arial`;
        this.ctx.textAlign = 'center';
        const icon = sprite.type === 'health' ? '💊' : '🔑';
        this.ctx.fillText(icon, screenX, groundLevel - spriteSize / 4 + bounceOffset);
        
        this.ctx.globalAlpha = 1;
        this.ctx.textAlign = 'left';
    }

    createExplosion(x, y, color = '#ffff00') {
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 30,
                maxLife: 30,
                color: color
            });
        }
        
        // Add explosion ring effect
        this.explosions.push({
            x: x,
            y: y,
            radius: 5,
            maxRadius: 50,
            speed: 3,
            life: 20,
            maxLife: 20,
            color: color
        });
    }

    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vx *= 0.98; // Friction
            particle.vy *= 0.98;
            particle.life--;
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    updateExplosions() {
        for (let i = this.explosions.length - 1; i >= 0; i--) {
            const explosion = this.explosions[i];
            explosion.radius += explosion.speed;
            explosion.life--;
            
            if (explosion.life <= 0 || explosion.radius > explosion.maxRadius) {
                this.explosions.splice(i, 1);
            }
        }
    }

    showSuccessMessage(message) {
        // Create a temporary success overlay with animation
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0);
            background: linear-gradient(45deg, #00ff00, #00aa00);
            color: black;
            padding: 25px;
            border-radius: 15px;
            font-family: 'Courier New', monospace;
            font-weight: bold;
            z-index: 1000;
            text-align: center;
            border: 3px solid #00aa00;
            box-shadow: 0 0 20px rgba(0, 255, 0, 0.5);
            animation: success-popup 0.5s ease-out forwards;
        `;
        
        // Add animation keyframes
        const style = document.createElement('style');
        style.textContent = `
            @keyframes success-popup {
                0% { transform: translate(-50%, -50%) scale(0) rotate(-10deg); opacity: 0; }
                50% { transform: translate(-50%, -50%) scale(1.1) rotate(5deg); opacity: 1; }
                100% { transform: translate(-50%, -50%) scale(1) rotate(0deg); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        overlay.innerHTML = message.replace(/\n/g, '<br>');
        document.body.appendChild(overlay);
        
        setTimeout(() => {
            overlay.style.animation = 'success-popup 0.3s ease-in reverse forwards';
            setTimeout(() => {
                if (overlay.parentNode) {
                    document.body.removeChild(overlay);
                }
                if (style.parentNode) {
                    document.head.removeChild(style);
                }
            }, 300);
        }, 3000);
    }
    
    // Show temporary message (for item pickups, etc.)
    showTemporaryMessage(message, color = '#00ff00') {
        const msgElement = document.createElement('div');
        msgElement.style.cssText = `
            position: fixed;
            top: 20%;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: ${color};
            padding: 15px 25px;
            border-radius: 20px;
            font-family: 'Courier New', monospace;
            font-weight: bold;
            z-index: 150;
            text-align: center;
            border: 2px solid ${color};
            animation: message-slide 0.3s ease-out;
        `;
        
        msgElement.textContent = message;
        document.body.appendChild(msgElement);
        
        setTimeout(() => {
            msgElement.style.animation = 'message-slide 0.3s ease-in reverse';
            setTimeout(() => {
                if (msgElement.parentNode) {
                    document.body.removeChild(msgElement);
                }
            }, 300);
        }, 2000);
    }

    showWinScreen() {
        // Play victory fanfare
        const victoryNotes = [523, 659, 784, 1047, 1319]; // C, E, G, C, E
        victoryNotes.forEach((note, index) => {
            setTimeout(() => this.playSound(note, 400), index * 200);
        });
        
        // Create massive confetti explosion
        setTimeout(() => this.createConfetti(), 500);
        setTimeout(() => this.createConfetti(), 1000);
        setTimeout(() => this.createConfetti(), 1500);
        
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(45deg, rgba(0, 50, 0, 0.9), rgba(0, 0, 50, 0.9));
            color: #00ff00;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            font-family: 'Courier New', monospace;
            z-index: 1000;
            animation: win-screen-glow 2s ease-in-out infinite alternate;
        `;
        
        const minutes = Math.floor(this.gameTime / 60);
        const seconds = this.gameTime % 60;
        const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Calculate grade based on performance
        let grade = 'A+';
        let gradeEmoji = '🏆';
        if (this.gameTime > 300) grade = 'A', gradeEmoji = '🥇';
        if (this.gameTime > 600) grade = 'B+', gradeEmoji = '🥈';
        if (this.gameTime > 900) grade = 'B', gradeEmoji = '🥉';
        if (this.player.health < 50) grade = grade.replace('+', ''), gradeEmoji = '🎯';
        
        overlay.innerHTML = `
            <h1 style="font-size: 64px; margin-bottom: 20px; animation: title-bounce 1s ease-in-out infinite;">🎉 EXPERIMENT COMPLETE! 🎉</h1>
            <h2 style="font-size: 28px; margin-bottom: 30px; color: #ffff00;">🧪 You have escaped the chemistry laboratory! 🧪</h2>
            <div style="font-size: 20px; text-align: center; background: rgba(0,0,0,0.3); padding: 20px; border-radius: 15px; margin: 20px;">
                <p>🏆 Final Score: <span style="color: #ffff00;">${this.score}</span> points</p>
                <p>⏱️ Time: <span style="color: #4ecdc4;">${timeStr}</span></p>
                <p>🧬 Puzzles Solved: <span style="color: #ff6b6b;">${this.puzzlesSolved}/6</span></p>
                <p>💚 Health Remaining: <span style="color: #00ff88;">${this.player.health}%</span></p>
                <p style="font-size: 24px; margin-top: 15px;">${gradeEmoji} Grade: <span style="color: #ffd700;">${grade}</span> ${gradeEmoji}</p>
            </div>
            <div style="font-size: 18px; color: #4ecdc4; margin: 20px; text-align: center;">
                <p>"Science is not only a disciple of reason but also one of romance and passion." - Stephen Hawking</p>
            </div>
            <button id="restartGame" style="
                background: linear-gradient(45deg, #006600, #008800);
                border: 3px solid #00ff00;
                color: #00ff00;
                padding: 20px 40px;
                font-size: 20px;
                font-family: 'Courier New', monospace;
                cursor: pointer;
                margin-top: 20px;
                border-radius: 10px;
                animation: button-pulse 2s ease-in-out infinite;
            ">🧪 Play Again 🧪</button>
        `;
        
        // Add win screen specific animations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes win-screen-glow {
                0% { box-shadow: inset 0 0 50px rgba(0, 255, 0, 0.1); }
                100% { box-shadow: inset 0 0 100px rgba(0, 255, 0, 0.3); }
            }
            @keyframes title-bounce {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }
            @keyframes button-pulse {
                0%, 100% { transform: scale(1); box-shadow: 0 0 20px rgba(0, 255, 0, 0.3); }
                50% { transform: scale(1.1); box-shadow: 0 0 30px rgba(0, 255, 0, 0.6); }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(overlay);
        
        document.getElementById('restartGame').addEventListener('click', () => {
            this.playSound(880, 200);
            location.reload();
        });
    }
    
    // Update floating molecules
    updateFloatingMolecules() {
        // This is handled by CSS animations and DOM manipulation
        // No additional updates needed in the game loop
    }
    
    // Update celebration effects
    updateCelebrationEffects() {
        // Handle any additional celebration effects here
        // Currently managed by CSS animations and timeouts
    }

    renderMinimap() {
        const minimapSize = 150;
        const minimapX = this.canvas.width - minimapSize - 20;
        const minimapY = 20;
        const tileSize = minimapSize / Math.max(this.MAP_WIDTH, this.MAP_HEIGHT);

        // Minimap background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(minimapX, minimapY, minimapSize, minimapSize);
        
        this.ctx.strokeStyle = '#666';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(minimapX, minimapY, minimapSize, minimapSize);

        // Draw map tiles
        for (let y = 0; y < this.MAP_HEIGHT; y++) {
            for (let x = 0; x < this.MAP_WIDTH; x++) {
                const tileX = minimapX + x * tileSize;
                const tileY = minimapY + y * tileSize;
                
                switch (this.map[y][x]) {
                    case 1: // Wall
                        this.ctx.fillStyle = '#666';
                        this.ctx.fillRect(tileX, tileY, tileSize, tileSize);
                        break;
                    case 2: // Door
                        const door = this.doors.find(d => d.mapX === x && d.mapY === y);
                        this.ctx.fillStyle = (door && door.locked) ? '#ff0000' : '#00ff00';
                        this.ctx.fillRect(tileX, tileY, tileSize, tileSize);
                        break;
                    case 3: // Puzzle station
                        const station = this.puzzleStations.find(s => s.mapX === x && s.mapY === y);
                        if (station && station.active) {
                            this.ctx.fillStyle = '#00ffff';
                            this.ctx.fillRect(tileX + 1, tileY + 1, tileSize - 2, tileSize - 2);
                        }
                        break;
                }
            }
        }
        
        // Draw items
        this.items.forEach(item => {
            const itemX = minimapX + item.mapX * tileSize + tileSize / 2;
            const itemY = minimapY + item.mapY * tileSize + tileSize / 2;
            
            this.ctx.fillStyle = item.type === 'health' ? '#ff6666' : '#ffff00';
            this.ctx.fillRect(itemX - 2, itemY - 2, 4, 4);
        });

        // Draw player
        const playerMinimapX = minimapX + (this.player.x / this.TILE_SIZE) * tileSize;
        const playerMinimapY = minimapY + (this.player.y / this.TILE_SIZE) * tileSize;
        
        this.ctx.fillStyle = '#00ff00';
        this.ctx.fillRect(playerMinimapX - 2, playerMinimapY - 2, 4, 4);

        // Draw player direction
        this.ctx.strokeStyle = '#00ff00';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(playerMinimapX, playerMinimapY);
        this.ctx.lineTo(
            playerMinimapX + Math.cos(this.player.angle) * 10,
            playerMinimapY + Math.sin(this.player.angle) * 10
        );
        this.ctx.stroke();
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    new DoomChemistryGame();
});