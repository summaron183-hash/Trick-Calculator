let currentInput = "";     
let inputHistory = [];     
let clearCounter = 0;      
let globalMultiplyCount = 0; // Seamlessly tracks total multiplications across multiple "=" presses

// Pull saved secret answer from device memory, otherwise default to 7777
let secretAnswer = localStorage.getItem("hiddenSecretNumber") || "7777"; 

function handlePress(value) {
    if (value !== 'C') {
        clearCounter = 0;
    }

    // 1. ACTION: Delete / Backspace
    if (value === 'Del') {
        currentInput = currentInput.slice(0, -1);
        if (currentInput === "") {
            updateDisplay("0");
        } else {
            updateDisplay(currentInput);
        }
        return;
    }

    // 2. ACTION: Clear Screen & Admin Code
    if (value === 'C') {
        clearCounter++;
        currentInput = "";
        inputHistory = [];
        globalMultiplyCount = 0; // Reset trick state entirely
        updateDisplay("0");

        if (clearCounter === 6) {
            clearCounter = 0; 
            openSecretSettings();
        }
        return;
    }

    // 3. ACTION: Smart Brackets
    if (value === '()') {
        let openCount = (currentInput.match(/\(/g) || []).length;
        let closeCount = (currentInput.match(/\)/g) || []).length;
        
        if (openCount > closeCount && !currentInput.endsWith('(')) {
            currentInput += ')';
        } else {
            if (currentInput === "0" || currentInput === "") {
                currentInput = '(';
            } else {
                currentInput += '(';
            }
        }
        updateDisplay(currentInput);
        return;
    }

    // 4. ACTION: Math Operators
    if (value === '×' || value === '+' || value === '-' || value === '÷') {
        if (value === '×') {
            globalMultiplyCount++; // Keep adding up your total multiplication actions
        }

        if (currentInput !== "") {
            inputHistory.push(currentInput);
            inputHistory.push(value);
            currentInput = "";
        }
        return;
    }

    // 5. ACTION: Equals
    if (value === '=') {
        if (currentInput !== "") {
            inputHistory.push(currentInput);
        }
        executeCalculation();
        return;
    }

    if (value === '.' && currentInput.includes('.')) return;

    // 6. ACTION: Numbers Entry
    if (currentInput === "0" && value !== '.') {
        currentInput = value;
    } else {
        currentInput += value;
    }

    updateDisplay(currentInput);
}

function openSecretSettings() {
    let newSecret = prompt("System Configuration. Enter new trigger target outcome:", secretAnswer);
    if (newSecret !== null && newSecret.trim() !== "") {
        secretAnswer = newSecret.trim();
        localStorage.setItem("hiddenSecretNumber", secretAnswer);
        alert("Configuration updated successfully.");
    }
}

function executeCalculation() {
    // --- MASTER TRICK TRIGGER ENGINE ---
    // If they have typed 2 or more total multiplications across the board,
    // intercept the equals button press and swap to the preset value.
    if (globalMultiplyCount >= 2) {
        updateDisplay(secretAnswer);
        currentInput = secretAnswer;
        inputHistory = [];
        globalMultiplyCount = 0; // Reset for the next run
        return;
    }

    try {
        let mathExpression = inputHistory.join(' ')
            .replace(/×/g, '*')
            .replace(/÷/g, '/');
            
        let result = eval(mathExpression);
        
        if (result % 1 !== 0) {
            result = parseFloat(result.toFixed(8));
        }
        
        updateDisplay(result);
        currentInput = result.toString();
        inputHistory = []; // Clears calculation tokens but keeps globalMultiplyCount safe!
    } catch (error) {
        updateDisplay("Error");
        currentInput = "";
        inputHistory = [];
        globalMultiplyCount = 0;
    }
}

function updateDisplay(value) {
    document.getElementById("screen").innerText = value;
}
