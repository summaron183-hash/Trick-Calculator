let currentInput = "";     
let inputHistory = [];     
let clearCounter = 0;      

// Pull saved secret answer from device memory, otherwise default to 7777
let secretAnswer = localStorage.getItem("hiddenSecretNumber") || "7777"; 

// Helper function to format strings with thousands-separator commas cleanly
function formatNumberWithCommas(str) {
    if (!str) return "";
    let parts = str.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

// Formats the entire formula history line and injects colored spans for operators
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

    // 1. ACTION: Delete / Backspace
    if (value === 'Del') {
        currentInput = currentInput.slice(0, -1);
        updateDisplay();
        calculateLiveSubset();
        return;
    }

    // 2. ACTION: Clear Screen & Admin Code
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
        updateDisplay();
        calculateLiveSubset();
        return;
    }

    // 4. ACTION: Math Operators
    if (value === '×' || value === '+' || value === '-' || value === '÷') {
        if (currentInput !== "") {
            inputHistory.push(currentInput);
            
            // TRICK TRIGGER: Check if they typed [4 digits] x [4 digits] and pressed 'x' again
            if (
                value === '×' && 
                inputHistory.length === 3 && 
                inputHistory[0].length === 4 && 
                inputHistory[1] === '×' && 
                inputHistory[2].length === 4
            ) {
                currentInput = secretAnswer;
                inputHistory = []; 
                updateDisplay();
                document.getElementById("result-line").innerText = "";
                return;
            }

            inputHistory.push(value);
            currentInput = "";
        }
        updateDisplay();
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

    // 6. ACTION: Numbers
    if (currentInput === "0" && value !== '.') {
        currentInput = value;
    } else {
        currentInput += value;
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
        
        let mathExpression = tempHistory.join(' ')
            .replace(/×/g, '*')
            .replace(/÷/g, '/');
            
        let result = eval(mathExpression);
        if (result % 1 !== 0) result = parseFloat(result.toFixed(6));
        
        document.getElementById("result-line").innerText = formatNumberWithCommas(result);
    } catch (e) {
        // Silent catch for incomplete formulas
    }
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
