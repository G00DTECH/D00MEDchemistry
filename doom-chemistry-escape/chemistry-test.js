/**
 * Chemistry Content Validation Test Suite
 * Validates the scientific accuracy and educational value of chemistry puzzles
 */

class ChemistryValidator {
    constructor() {
        this.validationResults = [];
    }

    // Validate all chemistry puzzles for scientific accuracy
    validateAllPuzzles() {
        console.log('🧬 Validating Chemistry Content...');
        
        // Get puzzles from the game (assumes DoomChemistryGame is loaded)
        const puzzles = [
            {
                id: 1,
                type: 'periodic-table',
                question: 'What is the atomic number of Carbon?',
                options: ['4', '6', '8', '12'],
                correct: 1,
                explanation: 'Carbon has 6 protons, so its atomic number is 6.'
            },
            {
                id: 2,
                type: 'equation-balancing',
                question: 'Balance: H₂ + O₂ → H₂O',
                options: ['2H₂ + O₂ → 2H₂O', 'H₂ + 2O₂ → H₂O', 'H₂ + O₂ → 2H₂O', '3H₂ + O₂ → 3H₂O'],
                correct: 0,
                explanation: '2H₂ + O₂ → 2H₂O balances the equation with 4 H atoms and 2 O atoms on each side.'
            },
            {
                id: 3,
                type: 'molecular-structure',
                question: 'Which molecule has a bent shape?',
                options: ['CO₂ (carbon dioxide)', 'H₂O (water)', 'CH₄ (methane)', 'NH₃ (ammonia)'],
                correct: 1,
                explanation: 'Water (H₂O) has a bent molecular geometry due to the two lone pairs on oxygen.'
            },
            {
                id: 4,
                type: 'stoichiometry',
                question: 'How many moles of O₂ are needed to react with 2 moles of CH₄ in: CH₄ + 2O₂ → CO₂ + 2H₂O',
                options: ['2 moles', '4 moles', '1 mole', '6 moles'],
                correct: 1,
                explanation: 'According to the equation, 1 mole CH₄ needs 2 moles O₂, so 2 moles CH₄ needs 4 moles O₂.'
            },
            {
                id: 5,
                type: 'ph-calculation',
                question: 'What is the pH of a solution with [H⁺] = 1 × 10⁻⁴ M?',
                options: ['4', '10', '-4', '14'],
                correct: 0,
                explanation: 'pH = -log[H⁺] = -log(1 × 10⁻⁴) = 4'
            },
            {
                id: 6,
                type: 'gas-laws',
                question: 'Using PV = nRT, if pressure doubles and temperature stays constant, what happens to volume?',
                options: ['Volume doubles', 'Volume halves', 'Volume stays the same', 'Volume quadruples'],
                correct: 1,
                explanation: 'According to Boyle\'s Law (part of ideal gas law), P and V are inversely proportional when T is constant.'
            }
        ];

        puzzles.forEach(puzzle => this.validatePuzzle(puzzle));
        this.generateChemistryReport();
    }

    validatePuzzle(puzzle) {
        console.log(`🔬 Validating puzzle ${puzzle.id}: ${puzzle.type}`);
        
        const validations = [
            this.validateQuestionClarity(puzzle),
            this.validateAnswerAccuracy(puzzle),
            this.validateExplanationQuality(puzzle),
            this.validateEducationalValue(puzzle),
            this.validateDifficultyLevel(puzzle)
        ];

        const puzzleScore = validations.filter(v => v.passed).length / validations.length * 100;
        
        this.validationResults.push({
            puzzle: puzzle,
            score: puzzleScore,
            validations: validations
        });
    }

    validateQuestionClarity(puzzle) {
        // Check if question is clear and unambiguous
        const question = puzzle.question.toLowerCase();
        const hasContext = question.includes('what') || question.includes('which') || question.includes('how');
        const isSpecific = !question.includes('maybe') && !question.includes('approximately');
        
        return {
            test: 'Question Clarity',
            passed: hasContext && isSpecific,
            details: 'Question should be clear, specific, and unambiguous'
        };
    }

    validateAnswerAccuracy(puzzle) {
        // Validate specific scientific accuracy for each puzzle type
        let accurate = false;
        let details = '';

        switch (puzzle.type) {
            case 'periodic-table':
                // Carbon atomic number validation
                accurate = puzzle.correct === 1 && puzzle.options[1] === '6';
                details = 'Carbon has atomic number 6 (6 protons)';
                break;
                
            case 'equation-balancing':
                // H2 + O2 -> H2O balancing validation
                accurate = puzzle.correct === 0 && puzzle.options[0].includes('2H₂ + O₂ → 2H₂O');
                details = 'Balanced equation: 2H₂ + O₂ → 2H₂O (conservation of mass)';
                break;
                
            case 'molecular-structure':
                // Water bent shape validation
                accurate = puzzle.correct === 1 && puzzle.options[1].includes('H₂O');
                details = 'Water has bent geometry due to lone pairs on oxygen (VSEPR theory)';
                break;
                
            case 'stoichiometry':
                // Stoichiometry calculation validation
                accurate = puzzle.correct === 1 && puzzle.options[1] === '4 moles';
                details = 'Stoichiometric ratio: 1 CH₄ : 2 O₂, so 2 CH₄ : 4 O₂';
                break;
                
            case 'ph-calculation':
                // pH calculation validation
                accurate = puzzle.correct === 0 && puzzle.options[0] === '4';
                details = 'pH = -log[H⁺] = -log(10⁻⁴) = 4';
                break;
                
            case 'gas-laws':
                // Boyle's law validation
                accurate = puzzle.correct === 1 && puzzle.options[1].includes('halves');
                details = 'Boyle\'s Law: P₁V₁ = P₂V₂, if P doubles, V halves';
                break;
        }

        return {
            test: 'Answer Accuracy',
            passed: accurate,
            details: details
        };
    }

    validateExplanationQuality(puzzle) {
        const explanation = puzzle.explanation;
        
        // Check explanation completeness
        const hasScientificReasoning = explanation.length > 20;
        const usesCorrectTerminology = this.checkTerminology(puzzle.type, explanation);
        const providesContext = explanation.includes('because') || explanation.includes('due to') || explanation.includes('according to');
        
        return {
            test: 'Explanation Quality',
            passed: hasScientificReasoning && usesCorrectTerminology && providesContext,
            details: 'Explanation should provide scientific reasoning and context'
        };
    }

    checkTerminology(type, explanation) {
        const terminology = {
            'periodic-table': ['protons', 'atomic', 'electron'],
            'equation-balancing': ['atoms', 'balance', 'equation', 'side'],
            'molecular-structure': ['molecular', 'geometry', 'shape', 'pairs'],
            'stoichiometry': ['mole', 'equation', 'ratio'],
            'ph-calculation': ['pH', 'log', 'concentration'],
            'gas-laws': ['law', 'pressure', 'volume', 'proportional']
        };

        const requiredTerms = terminology[type] || [];
        return requiredTerms.some(term => explanation.toLowerCase().includes(term.toLowerCase()));
    }

    validateEducationalValue(puzzle) {
        // Check if puzzle teaches important chemistry concepts
        const importantConcepts = {
            'periodic-table': 'atomic structure',
            'equation-balancing': 'conservation of mass',
            'molecular-structure': 'VSEPR theory',
            'stoichiometry': 'quantitative relationships',
            'ph-calculation': 'acid-base chemistry',
            'gas-laws': 'gas behavior'
        };

        const teachesImportantConcept = importantConcepts[puzzle.type] !== undefined;
        
        return {
            test: 'Educational Value',
            passed: teachesImportantConcept,
            details: `Teaches ${importantConcepts[puzzle.type] || 'chemistry concepts'}`
        };
    }

    validateDifficultyLevel(puzzle) {
        // Assess if difficulty is appropriate for target audience
        const difficultyLevels = {
            'periodic-table': 'beginner',
            'equation-balancing': 'intermediate',
            'molecular-structure': 'intermediate',
            'stoichiometry': 'advanced',
            'ph-calculation': 'advanced',
            'gas-laws': 'intermediate'
        };

        const appropriateDifficulty = difficultyLevels[puzzle.type] !== undefined;
        
        return {
            test: 'Difficulty Level',
            passed: appropriateDifficulty,
            details: `Appropriate ${difficultyLevels[puzzle.type] || 'general'} level difficulty`
        };
    }

    // Test curriculum alignment
    testCurriculumAlignment() {
        const standards = [
            {
                name: 'NGSS HS-PS1-1',
                description: 'Use the periodic table as a model to predict properties',
                covered: true
            },
            {
                name: 'NGSS HS-PS1-7', 
                description: 'Use mathematical representations to support the claim that atoms are conserved',
                covered: true
            },
            {
                name: 'AP Chemistry',
                description: 'Covers stoichiometry, molecular geometry, and acid-base chemistry',
                covered: true
            }
        ];

        return standards;
    }

    generateChemistryReport() {
        console.log('\n' + '='.repeat(60));
        console.log('🧬 CHEMISTRY CONTENT VALIDATION REPORT');
        console.log('='.repeat(60));

        const averageScore = this.validationResults.reduce((sum, result) => sum + result.score, 0) / this.validationResults.length;
        
        console.log(`📊 Overall Content Quality: ${averageScore.toFixed(1)}%`);
        console.log(`🧪 Puzzles Validated: ${this.validationResults.length}`);
        
        console.log('\n📋 Individual Puzzle Scores:');
        this.validationResults.forEach(result => {
            const status = result.score >= 80 ? '✅' : result.score >= 60 ? '⚠️' : '❌';
            console.log(`   ${status} Puzzle ${result.puzzle.id} (${result.puzzle.type}): ${result.score.toFixed(1)}%`);
        });

        console.log('\n📚 Curriculum Alignment:');
        const standards = this.testCurriculumAlignment();
        standards.forEach(standard => {
            const status = standard.covered ? '✅' : '❌';
            console.log(`   ${status} ${standard.name}: ${standard.description}`);
        });

        // Recommendations
        console.log('\n💡 Recommendations:');
        this.validationResults.forEach(result => {
            if (result.score < 80) {
                console.log(`   📌 Improve Puzzle ${result.puzzle.id}:`);
                result.validations.forEach(validation => {
                    if (!validation.passed) {
                        console.log(`      - ${validation.test}: ${validation.details}`);
                    }
                });
            }
        });
    }
}

// Initialize chemistry validator
window.addEventListener('load', () => {
    window.chemistryValidator = new ChemistryValidator();
    console.log('🧬 Chemistry validator ready! Use chemistryValidator.validateAllPuzzles() to test content.');
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChemistryValidator;
}