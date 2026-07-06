let currentInput = "";     
let inputHistory = [];     
let clearCounter = 0;      

// Pull saved secret answer from device memory, otherwise default to 7777
let secretAnswer = localStorage.getItem("hiddenSecretNumber") || "7777"; 

function handlePress(value) {
    // If anything other than 'C' is pressed, reset the 'C' streak counter
    if (value !== 'C') {
        clearCounter = 0;
    }

    if (value === 'C') {
        clearCounter++;
        currentInput = "";
        inputHistory = [];
        updateDisplay("0");

        // SECRET INTERCEPT 1: Pressing 'C' 6 times opens the menu
        if (clearCounter === 6) {
            clearCounter = 0; 
            openSecretSettings();
        }
        return;
    }

    // Handle math operators
    if (value === '×' || value === '+' || value === '-' || value === '÷') {
        if (currentInput !== "") {
            inputHistory.push(currentInput);
            inputHistory.push(value);
            currentInput = "";
        }
        return;
    }

    // Handle compilation when '=' is clicked
    if (value === '=') {
        if (currentInput !== "") {
            inputHistory.push(currentInput);
        }
        executeCalculation();
        return;
    }

    // Prevent multi-decimal bugs
    if (value === '.' && currentInput.includes('.')) return;

    // Normal digit entry
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
        localStorage.setItem("hiddenSecretNumber", secretAnswer); // Save it to device storage permanently
        alert("Configuration updated successfully.");
    }
}

function executeCalculation() {
    // SECRET INTERCEPT 2: Check if pattern is [4 digits] x [4 digits] x [4 digits]
    if (
        inputHistory.length === 5 &&
        inputHistory[0].length === 4 && inputHistory[1] === '×' &&
        inputHistory[2].length === 4 && inputHistory[3] === '×' &&
        inputHistory[4].length === 4
    ) {
        updateDisplay(secretAnswer);
        currentInput = secretAnswer;
        inputHistory = [];
    } else {
        // Run standard calculator math
        try {
            let mathExpression = inputHistory.join(' ')
                .replace(/×/g, '*')
                .replace(/÷/g, '/');
                
            let result = eval(mathExpression);
            
            // Format long floating numbers nicely
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
}

function updateDisplay(value) {
    document.getElementById("screen").innerText = value;
              }
