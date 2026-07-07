let currentInput = "";     
let inputHistory = [];     
let clearCounter = 0;     


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

    // TRICK TRIGGER CHECK: Check if they just typed the 3rd 4-digit number sequence
    if (
        inputHistory.length === 4 &&
        inputHistory[0].length === 4 &&
        inputHistory[1] === '×' &&
        inputHistory[2].length === 4 &&
        inputHistory[3] === '×' &&
        currentInput.length === 4
    ) {
        currentInput = secretAnswer;
        inputHistory = []; 
        updateDisplay(currentInput);
        return;
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
    }
}

function updateDisplay(value) {
    document.getElementById("screen").innerText = value;
}
