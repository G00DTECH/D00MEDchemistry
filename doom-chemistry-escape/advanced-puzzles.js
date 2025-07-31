// Advanced Chemistry Puzzles Extension
// This file contains additional puzzle types that can be integrated

const advancedChemistryPuzzles = [
    {
        id: 7,
        type: 'orbital-configuration',
        title: 'Electron Configuration',
        question: 'What is the electron configuration of Iron (Fe, atomic number 26)?',
        options: [
            '[Ar] 3d⁶ 4s²',
            '[Ar] 3d⁸',
            '[Ar] 4s² 3d⁶',
            '[Ne] 3s² 3p⁶ 3d⁶ 4s²'
        ],
        correct: 0,
        explanation: 'Iron has 26 electrons. Following the Aufbau principle: [Ar] 3d⁶ 4s²',
        reward: 220,
        hints: [
            'Remember the Aufbau principle',
            'Fill orbitals in order of increasing energy',
            'Iron is in period 4, group 8'
        ]
    },
    {
        id: 8,
        type: 'thermodynamics',
        title: 'Thermodynamics Challenge',
        question: 'For an endothermic reaction, which statement is correct?',
        options: [
            'ΔH < 0, energy is released',
            'ΔH > 0, energy is absorbed',
            'ΔH = 0, no energy change',
            'ΔH < 0, energy is absorbed'
        ],
        correct: 1,
        explanation: 'Endothermic reactions have ΔH > 0 because they absorb energy from surroundings.',
        reward: 180,
        molecular_diagram: `
    Energy
      ↑
      |     Products
      |    /
      |   /
      |  /
      | /
      |/____Reactants
      └─────────→ Reaction Progress
        `
    },
    {
        id: 9,
        type: 'organic-chemistry',
        title: 'Organic Structure',
        question: 'Which functional group is present in carboxylic acids?',
        options: [
            '-OH (hydroxyl)',
            '-COOH (carboxyl)',
            '-CHO (aldehyde)',
            '-CO- (ketone)'
        ],
        correct: 1,
        explanation: 'Carboxylic acids contain the -COOH (carboxyl) functional group.',
        reward: 150,
        structure_hint: 'R-COOH where R is an alkyl group'
    },
    {
        id: 10,
        type: 'kinetics',
        title: 'Reaction Kinetics',
        question: 'If you double the concentration of a reactant and the reaction rate increases by a factor of 4, what is the order of reaction with respect to that reactant?',
        options: ['0', '1', '2', '3'],
        correct: 2,
        explanation: 'Rate = k[A]ⁿ. If [A] doubles and rate increases 4×, then 2ⁿ = 4, so n = 2 (second order).',
        reward: 250
    },
    {
        id: 11,
        type: 'equilibrium',
        title: 'Chemical Equilibrium',
        question: 'For the reaction N₂ + 3H₂ ⇌ 2NH₃, if pressure increases, the equilibrium will:',
        options: [
            'Shift left (toward reactants)',
            'Shift right (toward products)',
            'Remain unchanged',
            'Stop completely'
        ],
        correct: 1,
        explanation: 'According to Le Chatelier\'s principle, increased pressure favors the side with fewer gas molecules (4 → 2).',
        reward: 190
    },
    {
        id: 12,
        type: 'electrochemistry',
        title: 'Electrochemistry',
        question: 'In a galvanic cell, electrons flow from:',
        options: [
            'Cathode to anode through external circuit',
            'Anode to cathode through external circuit',
            'Positive to negative electrode internally',
            'Salt bridge to electrodes'
        ],
        correct: 1,
        explanation: 'In galvanic cells, electrons flow from anode (oxidation) to cathode (reduction) through the external circuit.',
        reward: 170
    }
];

// Interactive molecular builder for advanced puzzles
class MolecularBuilder {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.atoms = [];
        this.bonds = [];
        this.selectedAtom = null;
    }

    addAtom(element, x, y) {
        this.atoms.push({
            element: element,
            x: x,
            y: y,
            radius: this.getAtomicRadius(element),
            color: this.getAtomicColor(element)
        });
        this.redraw();
    }

    addBond(atom1Index, atom2Index, bondType = 'single') {
        this.bonds.push({
            atom1: atom1Index,
            atom2: atom2Index,
            type: bondType
        });
        this.redraw();
    }

    getAtomicRadius(element) {
        const radii = {
            'H': 15, 'C': 20, 'N': 18, 'O': 16, 'F': 14, 'P': 22, 'S': 20, 'Cl': 18
        };
        return radii[element] || 20;
    }

    getAtomicColor(element) {
        const colors = {
            'H': '#ffffff', 'C': '#000000', 'N': '#0000ff', 'O': '#ff0000',
            'F': '#00ff00', 'P': '#ff8000', 'S': '#ffff00', 'Cl': '#00ff00'
        };
        return colors[element] || '#888888';
    }

    redraw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw bonds
        this.bonds.forEach(bond => {
            const atom1 = this.atoms[bond.atom1];
            const atom2 = this.atoms[bond.atom2];
            
            this.ctx.strokeStyle = '#333333';
            this.ctx.lineWidth = bond.type === 'double' ? 4 : bond.type === 'triple' ? 6 : 2;
            this.ctx.beginPath();
            this.ctx.moveTo(atom1.x, atom1.y);
            this.ctx.lineTo(atom2.x, atom2.y);
            this.ctx.stroke();
        });

        // Draw atoms
        this.atoms.forEach(atom => {
            this.ctx.fillStyle = atom.color;
            this.ctx.beginPath();
            this.ctx.arc(atom.x, atom.y, atom.radius, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.strokeStyle = '#000000';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            // Draw element symbol
            this.ctx.fillStyle = atom.color === '#000000' ? '#ffffff' : '#000000';
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(atom.element, atom.x, atom.y);
        });
    }

    validateMolecule(targetFormula) {
        // Count atoms by element
        const atomCounts = {};
        this.atoms.forEach(atom => {
            atomCounts[atom.element] = (atomCounts[atom.element] || 0) + 1;
        });

        // Compare with target formula (simplified check)
        // This would need more sophisticated parsing for real use
        return JSON.stringify(atomCounts) === JSON.stringify(targetFormula);
    }
}

// Periodic table interactive component
class PeriodicTableWidget {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.selectedElement = null;
        this.createTable();
    }

    createTable() {
        const elements = [
            {symbol: 'H', name: 'Hydrogen', number: 1, period: 1, group: 1},
            {symbol: 'He', name: 'Helium', number: 2, period: 1, group: 18},
            {symbol: 'Li', name: 'Lithium', number: 3, period: 2, group: 1},
            {symbol: 'Be', name: 'Beryllium', number: 4, period: 2, group: 2},
            {symbol: 'B', name: 'Boron', number: 5, period: 2, group: 13},
            {symbol: 'C', name: 'Carbon', number: 6, period: 2, group: 14},
            {symbol: 'N', name: 'Nitrogen', number: 7, period: 2, group: 15},
            {symbol: 'O', name: 'Oxygen', number: 8, period: 2, group: 16},
            {symbol: 'F', name: 'Fluorine', number: 9, period: 2, group: 17},
            {symbol: 'Ne', name: 'Neon', number: 10, period: 2, group: 18}
        ];

        let tableHTML = '<div class="periodic-table">';
        elements.forEach(element => {
            tableHTML += `
                <div class="element" data-symbol="${element.symbol}" 
                     style="grid-column: ${element.group}; grid-row: ${element.period};">
                    <div class="element-number">${element.number}</div>
                    <div class="element-symbol">${element.symbol}</div>
                    <div class="element-name">${element.name}</div>
                </div>
            `;
        });
        tableHTML += '</div>';

        this.container.innerHTML = tableHTML;

        // Add click handlers
        this.container.querySelectorAll('.element').forEach(el => {
            el.addEventListener('click', (e) => {
                this.selectElement(e.currentTarget.dataset.symbol);
            });
        });
    }

    selectElement(symbol) {
        // Remove previous selection
        this.container.querySelectorAll('.element').forEach(el => {
            el.classList.remove('selected');
        });

        // Add selection to clicked element
        const element = this.container.querySelector(`[data-symbol="${symbol}"]`);
        if (element) {
            element.classList.add('selected');
            this.selectedElement = symbol;
        }
    }

    getSelectedElement() {
        return this.selectedElement;
    }
}

// pH Calculator component
class PHCalculator {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.createCalculator();
    }

    createCalculator() {
        this.container.innerHTML = `
            <div class="ph-calculator">
                <h3>pH Calculator</h3>
                <div class="input-group">
                    <label>H⁺ Concentration (M):</label>
                    <input type="number" id="h-concentration" step="0.000001" placeholder="1e-7">
                </div>
                <div class="input-group">
                    <label>OH⁻ Concentration (M):</label>
                    <input type="number" id="oh-concentration" step="0.000001" placeholder="1e-7">
                </div>
                <button id="calculate-ph">Calculate pH</button>
                <div id="ph-result"></div>
                <div class="ph-scale">
                    <div class="ph-indicator" id="ph-indicator"></div>
                </div>
            </div>
        `;

        document.getElementById('calculate-ph').addEventListener('click', () => {
            this.calculatePH();
        });
    }

    calculatePH() {
        const hConc = parseFloat(document.getElementById('h-concentration').value);
        const ohConc = parseFloat(document.getElementById('oh-concentration').value);

        let ph, poh;
        
        if (hConc) {
            ph = -Math.log10(hConc);
            poh = 14 - ph;
        } else if (ohConc) {
            poh = -Math.log10(ohConc);
            ph = 14 - poh;
        } else {
            document.getElementById('ph-result').innerHTML = 'Please enter a concentration value.';
            return;
        }

        const result = document.getElementById('ph-result');
        result.innerHTML = `
            <strong>pH: ${ph.toFixed(2)}</strong><br>
            <strong>pOH: ${poh.toFixed(2)}</strong><br>
            Solution is ${ph < 7 ? 'Acidic' : ph > 7 ? 'Basic' : 'Neutral'}
        `;

        // Update pH indicator
        const indicator = document.getElementById('ph-indicator');
        const position = (ph / 14) * 100;
        indicator.style.left = `${Math.min(100, Math.max(0, position))}%`;
        
        // Color coding
        if (ph < 7) {
            indicator.style.backgroundColor = '#ff0000'; // Red for acidic
        } else if (ph > 7) {
            indicator.style.backgroundColor = '#0000ff'; // Blue for basic
        } else {
            indicator.style.backgroundColor = '#00ff00'; // Green for neutral
        }
    }
}

// Export for use in main game
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        advancedChemistryPuzzles,
        MolecularBuilder,
        PeriodicTableWidget,
        PHCalculator
    };
}