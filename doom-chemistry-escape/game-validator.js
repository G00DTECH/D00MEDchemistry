/**
 * DOOM Chemistry Escape Room - Game Validation Suite
 * Tests the existing game implementation for functionality and bugs
 */

class GameValidator {
    constructor() {
        this.issues = [];
        this.fixes = [];
        this.testResults = [];
        this.gameInstance = null;
    }

    // Main validation function
    async validateGame() {
        console.log('🔍 Validating DOOM Chemistry Escape Room...');
        
        // Test 1: DOM Structure
        this.validateDOMStructure();
        
        // Test 2: Game Initialization
        this.validateGameInitialization();
        
        // Test 3: Chemistry Puzzles
        this.validateChemistryPuzzles();
        
        // Test 4: Game Mechanics
        this.validateGameMechanics();
        
        // Test 5: UI/UX
        this.validateUserInterface();
        
        // Test 6: Performance
        await this.validatePerformance();
        
        // Generate report
        this.generateValidationReport();
        
        return {
            issues: this.issues,
            fixes: this.fixes,
            testResults: this.testResults
        };
    }

    validateDOMStructure() {
        console.log('📋 Validating DOM structure...');
        
        const requiredElements = [
            'gameCanvas',
            'startScreen', 
            'startButton',
            'hud',
            'puzzleModal',
            'gameInstructions',
            'healthBar',
            'score',
            'puzzlesSolved'
        ];

        requiredElements.forEach(elementId => {
            const element = document.getElementById(elementId);
            if (!element) {
                this.reportIssue(`Missing required element: ${elementId}`, 'critical');
                this.suggestFix(`Add element with id="${elementId}" to index.html`);
            } else {
                this.recordTest(`DOM Element: ${elementId}`, true);
            }
        });

        // Check canvas setup
        const canvas = document.getElementById('gameCanvas');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                this.reportIssue('Canvas 2D context not available', 'critical');
            } else {
                this.recordTest('Canvas 2D Context', true);
            }
        }
    }

    validateGameInitialization() {
        console.log('🎮 Validating game initialization...');
        
        // Check if game class is defined
        if (typeof DoomChemistryGame === 'undefined') {
            this.reportIssue('DoomChemistryGame class not defined', 'critical');
            this.suggestFix('Ensure game.js is loaded before validation');
            return;
        }

        // Try to create game instance
        try {
            const canvas = document.getElementById('gameCanvas');
            if (canvas) {
                // Check if game auto-initializes
                this.recordTest('Game Class Available', true);
                
                // Test game initialization without breaking existing instance
                const testCanvas = document.createElement('canvas');
                testCanvas.id = 'testCanvas';
                testCanvas.width = 800;
                testCanvas.height = 600;
                document.body.appendChild(testCanvas);
                
                // Temporarily replace canvas for testing
                const originalCanvas = document.getElementById('gameCanvas');
                originalCanvas.id = 'gameCanvasOriginal';
                testCanvas.id = 'gameCanvas';
                
                try {
                    const testGame = new DoomChemistryGame();
                    this.recordTest('Game Initialization', true);
                    this.gameInstance = testGame;
                } catch (error) {
                    this.reportIssue(`Game initialization failed: ${error.message}`, 'critical');
                    this.recordTest('Game Initialization', false);
                }
                
                // Restore original canvas
                testCanvas.remove();
                originalCanvas.id = 'gameCanvas';
            }
        } catch (error) {
            this.reportIssue(`Game initialization error: ${error.message}`, 'critical');
        }
    }

    validateChemistryPuzzles() {
        console.log('🧪 Validating chemistry puzzles...');
        
        const expectedPuzzles = [
            { id: 1, type: 'periodic-table', expectedAnswer: 1 },
            { id: 2, type: 'equation-balancing', expectedAnswer: 0 },
            { id: 3, type: 'molecular-structure', expectedAnswer: 1 },
            { id: 4, type: 'stoichiometry', expectedAnswer: 1 },
            { id: 5, type: 'ph-calculation', expectedAnswer: 0 },
            { id: 6, type: 'gas-laws', expectedAnswer: 1 }
        ];

        // Test puzzle data structure
        if (this.gameInstance && this.gameInstance.chemistryPuzzles) {
            const puzzles = this.gameInstance.chemistryPuzzles;
            
            expectedPuzzles.forEach(expected => {
                const puzzle = puzzles.find(p => p.id === expected.id);
                
                if (!puzzle) {
                    this.reportIssue(`Missing puzzle ${expected.id}`, 'high');
                } else {
                    // Validate puzzle structure
                    if (!puzzle.question || !puzzle.options || !puzzle.explanation) {
                        this.reportIssue(`Incomplete puzzle ${expected.id}`, 'medium');
                    }
                    
                    // Validate correct answer
                    if (puzzle.correct !== expected.expectedAnswer) {
                        this.reportIssue(`Incorrect answer for puzzle ${expected.id}`, 'high');
                        this.suggestFix(`Puzzle ${expected.id} should have correct answer: ${expected.expectedAnswer}`);
                    }
                    
                    this.recordTest(`Puzzle ${expected.id} Structure`, true);
                }
            });
            
            this.recordTest('Chemistry Puzzles Available', puzzles.length === 6);
        } else {
            this.reportIssue('Chemistry puzzles not found in game instance', 'critical');
        }
    }

    validateGameMechanics() {
        console.log('⚙️ Validating game mechanics...');
        
        if (!this.gameInstance) {
            this.reportIssue('Cannot test game mechanics - no valid game instance', 'critical');
            return;
        }

        // Test player object
        if (this.gameInstance.player) {
            const player = this.gameInstance.player;
            const requiredPlayerProps = ['x', 'y', 'angle', 'health', 'keys', 'speed'];
            
            requiredPlayerProps.forEach(prop => {
                if (player[prop] === undefined) {
                    this.reportIssue(`Player missing property: ${prop}`, 'medium');
                } else {
                    this.recordTest(`Player Property: ${prop}`, true);
                }
            });
        }

        // Test level generation
        if (this.gameInstance.walls && this.gameInstance.doors && this.gameInstance.puzzleStations) {
            this.recordTest('Level Generation', true);
        } else {
            this.reportIssue('Level not properly generated', 'high');
        }

        // Test puzzle stations
        if (this.gameInstance.puzzleStations) {
            const activeStations = this.gameInstance.puzzleStations.filter(s => s.active);
            this.recordTest('Puzzle Stations', activeStations.length > 0);
        }
    }

    validateUserInterface() {
        console.log('🖥️ Validating user interface...');
        
        // Test modal functionality
        const puzzleModal = document.getElementById('puzzleModal');
        if (puzzleModal) {
            const isHidden = puzzleModal.style.display === 'none' || 
                           getComputedStyle(puzzleModal).display === 'none';
            this.recordTest('Puzzle Modal Initially Hidden', isHidden);
        }

        // Test HUD elements
        const hudElements = ['score', 'puzzlesSolved', 'keysFound', 'gameTime'];
        hudElements.forEach(elementId => {
            const element = document.getElementById(elementId);
            if (element) {
                this.recordTest(`HUD Element: ${elementId}`, true);
            } else {
                this.reportIssue(`Missing HUD element: ${elementId}`, 'medium');
            }
        });

        // Test responsive design
        const canvas = document.getElementById('gameCanvas');
        if (canvas) {
            const isResponsive = canvas.width === window.innerWidth && 
                               canvas.height === window.innerHeight;
            this.recordTest('Canvas Responsive', isResponsive);
        }
    }

    async validatePerformance() {
        console.log('⚡ Validating performance...');
        
        // Test frame rate measurement
        return new Promise((resolve) => {
            let frameCount = 0;
            const startTime = performance.now();
            
            const measureFrames = () => {
                frameCount++;
                if (performance.now() - startTime < 1000) {
                    requestAnimationFrame(measureFrames);
                } else {
                    const fps = frameCount;
                    this.recordTest('Frame Rate', fps >= 30, `${fps} FPS`);
                    
                    if (fps < 30) {
                        this.reportIssue(`Low frame rate: ${fps} FPS`, 'medium');
                        this.suggestFix('Optimize render loop and reduce computational complexity');
                    }
                    
                    resolve();
                }
            };
            
            requestAnimationFrame(measureFrames);
        });
    }

    // Utility methods
    reportIssue(description, severity = 'medium') {
        this.issues.push({
            description,
            severity,
            timestamp: Date.now()
        });
        
        const icon = severity === 'critical' ? '🚨' : severity === 'high' ? '⚠️' : '⚪';
        console.log(`${icon} ISSUE (${severity}): ${description}`);
    }

    suggestFix(suggestion) {
        this.fixes.push({
            suggestion,
            timestamp: Date.now()
        });
        console.log(`🔧 FIX: ${suggestion}`);
    }

    recordTest(name, passed, details = '') {
        this.testResults.push({
            name,
            passed,
            details,
            timestamp: Date.now()
        });
        
        const status = passed ? '✅' : '❌';
        console.log(`${status} ${name}${details ? ` (${details})` : ''}`);
    }

    generateValidationReport() {
        const criticalIssues = this.issues.filter(i => i.severity === 'critical').length;
        const highIssues = this.issues.filter(i => i.severity === 'high').length;
        const mediumIssues = this.issues.filter(i => i.severity === 'medium').length;
        
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(t => t.passed).length;
        const passRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0;

        console.log('\n' + '='.repeat(60));
        console.log('🏆 DOOM CHEMISTRY ESCAPE ROOM - VALIDATION REPORT');
        console.log('='.repeat(60));
        console.log(`📊 Tests: ${totalTests} (${passedTests} passed, ${totalTests - passedTests} failed)`);
        console.log(`📈 Pass Rate: ${passRate}%`);
        console.log(`🚨 Critical Issues: ${criticalIssues}`);
        console.log(`⚠️ High Priority Issues: ${highIssues}`);
        console.log(`⚪ Medium Priority Issues: ${mediumIssues}`);
        console.log(`🔧 Suggested Fixes: ${this.fixes.length}`);

        if (this.issues.length > 0) {
            console.log('\n📋 Issues Found:');
            this.issues.forEach((issue, index) => {
                const icon = issue.severity === 'critical' ? '🚨' : 
                           issue.severity === 'high' ? '⚠️' : '⚪';
                console.log(`   ${index + 1}. ${icon} ${issue.description} (${issue.severity})`);
            });
        }

        if (this.fixes.length > 0) {
            console.log('\n🔧 Suggested Fixes:');
            this.fixes.forEach((fix, index) => {
                console.log(`   ${index + 1}. ${fix.suggestion}`);
            });
        }

        // Overall assessment
        let assessment = '';
        if (criticalIssues > 0) {
            assessment = '🚨 CRITICAL - Game has critical issues that prevent proper functioning';
        } else if (highIssues > 0) {
            assessment = '⚠️ NEEDS ATTENTION - Game has high priority issues affecting gameplay';
        } else if (mediumIssues > 0) {
            assessment = '⚪ GOOD - Game functions well with minor issues';
        } else {
            assessment = '✅ EXCELLENT - Game passes all validation tests';
        }

        console.log(`\n🎯 Overall Assessment: ${assessment}`);
        
        return {
            totalTests,
            passedTests,
            passRate,
            criticalIssues,
            highIssues,
            mediumIssues,
            assessment
        };
    }
}

// Auto-run validation when page loads
window.addEventListener('load', async () => {
    // Wait a bit for game to initialize
    setTimeout(async () => {
        window.gameValidator = new GameValidator();
        console.log('🔍 Game validator ready! Use gameValidator.validateGame() to run validation.');
        
        // Auto-run validation
        await window.gameValidator.validateGame();
    }, 2000);
});

// Export for manual testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameValidator;
}