let currentInput = "";     
let inputHistory = [];     
let clearCounter = 0;      
let globalMultiplyCount = 0; 

// Pull saved settings from device memory, with defaults
let secretAnswer = localStorage.getItem("hiddenSecretNumber") || "7777"; 
let requiredDigits = parseInt(localStorage.getItem("hiddenDigitLength")) || 4; 

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
        globalMultiplyCount = 0; 
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
            globalMultiplyCount++; 
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
    // Prompt 1: Set the Preset Output Number
    let newSecret = prompt("System Configuration.\n\nEnter your preset target outcome:", secretAnswer);
    if (newSecret !== null && newSecret.trim() !== "") {
        secretAnswer = newSecret.trim();
        localStorage.setItem("hiddenSecretNumber", secretAnswer);
        
        // Prompt 2: Set the required Digit Length restriction
        let newDigits = prompt("System Configuration.\n\nEnter required digit length for the numbers (e.g., 3, 4, 5):", requiredDigits);
        if (newDigits !== null && !isNaN(newDigits) && newDigits.trim() !== "") {
            requiredDigits = parseInt(newDigits.trim());
            localStorage.setItem("hiddenDigitLength", requiredDigits);
            alert("Settings Updated!\nPreset Ans: " + secretAnswer + "\nDigit Rule: Must be " + requiredDigits + " digits.");
        }
    }
}

function executeCalculation() {
    // Count only literal digits inside the final input entry (ignoring dots, brackets, percents)
    let cleanDigitCount = currentInput.replace(/[^0-9]/g, "").length;

    // --- ENHANCED TRICK TRIGGER ENGINE ---
    // The trick executes ONLY if:
    // 1. You have hit multiplication at least twice across the board.
    // 2. The final number typed matches your exact configured digit setting.
    if (globalMultiplyCount >= 2 && cleanDigitCount === requiredDigits) {
        updateDisplay(secretAnswer);
        currentInput = secretAnswer;
        inputHistory = [];
        globalMultiplyCount = 0; 
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
        inputHistory = []; 
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
