let currentInput = "";     
let inputHistory = [];     
let clearCounter = 0;      

// Load saved secret answer from device memory, defaults to 7777
let secretAnswer = localStorage.getItem("hiddenSecretNumber") || "7777"; 

// Helper function to cleanly format numbers with commas
function formatNumberWithCommas(str) {
    if (!str) return "";
    let parts = str.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

// Builds the formula text line with cyan colored operators
function buildFormulaHTML() {
    let html = "";
    inputHistory.forEach(item => {
        if (item === '×' || item === '+' || item === '-' || item === '÷') {
            html += `<span class="operator-cyan">${item}</span>`;
        } else {
            html += formatNumberWithCommas(item);
        }
    });
    if (currentInput !== "") {
        html += formatNumberWithCommas(currentInput);
    }
    return html || "0";
}

function handlePress(value) {
    if (value !== 'C') {
        clearCounter = 0;
    }

    // 1. ACTION: Backspace
    if (value === 'Del') {
        currentInput = currentInput.slice(0, -1);
        updateDisplay();
        calculateLiveSubset();
        return;
    }

    // 2. ACTION: Clear & Settings Trigger
    if (value === 'C') {
        clearCounter++;
        currentInput = "";
        inputHistory = [];
        updateDisplay();
        document.getElementById("result-line").innerText = "";

        if (clearCounter === 6) {
            clearCounter = 0; 
            openSecretSettings();
        }
        return;
    }

    // 3. ACTION: Parentheses
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
        updateDisplay();
        calculateLiveSubset();
        return;
    }

    // 4. ACTION: Operators
    if (value === '×' || value === '+' || value === '-' || value === '÷') {
        if (currentInput !== "") {
            inputHistory.push(currentInput);
            currentInput = "";
        } else if (inputHistory.length > 0 && isNaN(inputHistory[inputHistory.length - 1])) {
            // Replace last operator if clicked sequentially
            inputHistory[inputHistory.length - 1] = value;
            updateDisplay();
            return;
        }
        
        inputHistory.push(value);
        updateDisplay();
        return;
    }

    // 5. ACTION: Equals (Calculation Execution)
    if (value === '=') {
        if (currentInput !== "") {
            inputHistory.push(currentInput);
            currentInput = "";
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
        // Intercept right on the 4th digit of the 3rd number entry
        currentInput = secretAnswer;
        inputHistory = []; 
        updateDisplay();
        document.getElementById("result-line").innerText = "";
        return;
    }

    updateDisplay();
    calculateLiveSubset(); 
}

function calculateLiveSubset() {
    if (inputHistory.length < 2) {
        document.getElementById("result-line").innerText = "";
        return;
    }
    try {
        let tempHistory = [...inputHistory];
        if (currentInput !== "") tempHistory.push(currentInput);
        
        // Ensure expression doesn't end with a trailing raw operator for evaluation
        if (isNaN(tempHistory[tempHistory.length - 1]) && tempHistory[tempHistory.length - 1] !== ')') {
            tempHistory.pop();
        }

        let mathExpression = tempHistory.join(' ')
            .replace(/×/g, '*')
            .replace(/÷/g, '/');
            
        let result = eval(mathExpression);
        if (result % 1 !== 0) result = parseFloat(result.toFixed(6));
        
        document.getElementById("result-line").innerText = formatNumberWithCommas(result);
    } catch (e) {
        // Keep display clean during incomplete typing stages
    }
}

function openSecretSettings() {
    let newSecret = prompt("System Configuration. Enter secret outcome:", secretAnswer);
    if (newSecret !== null && newSecret.trim() !== "") {
        secretAnswer = newSecret.trim();
        localStorage.setItem("hiddenSecretNumber", secretAnswer);
        alert("Configuration updated successfully.");
    }
}

function executeCalculation() {
    if (inputHistory.length === 0) return;
    try {
        let mathExpression = inputHistory.join(' ')
            .replace(/×/g, '*')
            .replace(/÷/g, '/');
            
        let result = eval(mathExpression);
        
        if (result % 1 !== 0) {
            result = parseFloat(result.toFixed(8));
        }
        
        document.getElementById("formula-line").innerHTML = formatNumberWithCommas(result);
        document.getElementById("result-line").innerText = "";
        currentInput = result.toString();
        inputHistory = [];
    } catch (error) {
        document.getElementById("formula-line").innerText = "Error";
        document.getElementById("result-line").innerText = "";
        currentInput = "";
        inputHistory = [];
    }
}

function updateDisplay() {
    document.getElementById("formula-line").innerHTML = buildFormulaHTML();
}
