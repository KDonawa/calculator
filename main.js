document.getElementById("equal-btn").addEventListener("click", () => calc.evaluate());
document.getElementById("decimal-btn").addEventListener("click", () => calc.inputDecimal());
document.getElementById("clear-btn").addEventListener("click", () => calc.clear());
document.getElementById("undo-btn").addEventListener("click", () => calc.undo());
document.getElementById("plus-minus-btn").addEventListener("click", () => calc.negate());

document.querySelectorAll(".number-key").forEach((key) => {
    key.addEventListener("click", () => calc.inputDigit(key.textContent));
});
document.querySelectorAll(".operation").forEach((key) => {
    key.addEventListener("click", () => calc.inputOperation(key.dataset.value));
});
// this must be called last
document.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => displayCalculator(calc));
});

function formatValue(value, maxLength, precision) {
    const formattedVal = document.createElement("span");
    if (value.length > maxLength) {
        formattedVal.textContent = parseFloat(value.join("")).toExponential(precision);
    } else {
        formattedVal.textContent = value.join("").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    return formattedVal;
}

function formatOperation(operation) {
    const formattedOp = document.createElement("span");
    formattedOp.classList.add("scheme-2");

    switch (operation.join("")) {
        case "+":
            formattedOp.innerHTML = "+";
            break;
        case "-":
            formattedOp.innerHTML = "&#150;";
            break;
        case "/":
            formattedOp.innerHTML = "÷";
            break;
        case "*":
            formattedOp.innerHTML = "&#215;";
            break;
        case "exp":
            formattedOp.innerHTML = "^";
            break;
        case "%":
            formattedOp.innerHTML = "%";
            break;
        default:
            formattedOp.innerHTML = "";
            break;
    }
    return formattedOp;
}

function displayCalculator(calc) {
    const upperText = document.getElementById("upper-text");
    const lowerText = document.getElementById("lower-text");
    upperText.textContent = "";
    lowerText.textContent = "";

    if (calc.currentError && calc.currentError.name === "MathError") {
        upperText.innerHTML = `<i><span class="">${calc.currentError.message}</span></i>`;
        calc.currentError = null;
        return;
    }

    const operation = formatOperation(calc.currentOperation);
    const operand1 = formatValue(calc.prevOperand, 10, 2);
    const operand2 = formatValue(calc.currentOperand, 10, 2);

    if (calc.currentResult.length > 0) {
        lowerText.append(formatValue(calc.currentResult, 10, 3));
        upperText.append(operand1, operation, operand2);
    } else {
        lowerText.append(operand2);
        upperText.append(operand1, operation);
    }
    // console.log(calc);
}

const calc = new Calculator();
displayCalculator(calc);
