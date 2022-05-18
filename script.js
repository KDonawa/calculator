const numberKeys = document.querySelectorAll(".number-key");
const operationKeys = document.querySelectorAll(".operation");
const decimalBtn = document.getElementById("decimal-btn");
const clearBtn = document.getElementById("clear-btn");
const undoBtn = document.getElementById("undo-btn");
const equalBtn = document.getElementById("equal-btn");
const upperText = document.getElementById("upper-text");
const lowerText = document.getElementById("lower-text");

numberKeys.forEach((key) => {
    key.addEventListener("click", () => {
        calc.inputDigit(key.textContent);
        console.log(calc);
    });
});
operationKeys.forEach((key) => {
    key.addEventListener("click", () => {
        calc.inputOperation(key.dataset.value);
        console.log(calc);
    });
});
decimalBtn.addEventListener("click", () => {
    calc.inputDecimal();
    console.log(calc);
});
equalBtn.addEventListener("click", () => {
    calc.evaluate();
    console.log(calc);
});
clearBtn.addEventListener("click", () => {
    calc.clear();
    console.log(calc);
});
undoBtn.addEventListener("click", () => {
    calc.undo();
    console.log(calc);
});

class CustomError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
}
class ZeroOperandsError extends CustomError {}
class FirstOperandMissingError extends CustomError {}
class SecondOperandMissingError extends CustomError {}
class MathError extends CustomError {}
class Calculator {
    constructor() {
        this.currentOperation = [];
        this.prevOperand = [];
        this.currentOperand = [];
        this.currentResult = [];
    }

    clear() {
        this.currentOperation = [];
        this.prevOperand = [];
        this.currentOperand = [];
        this.currentResult = [];
    }

    undo() {
        // must go in this order
        this.#undoHelper(this.currentResult) &&
            this.#undoHelper(this.currentOperand) &&
            this.#undoHelper(this.currentOperation) &&
            this.#undoHelper(this.prevOperand);
    }

    inputDigit(digit) {
        this.currentOperand.push(digit);
    }

    inputDecimal() {
        // cannot have multiple decimals
        if (this.currentOperand.includes(".")) return;

        // cannot add decimal without leading digit
        if (this.currentOperand.length === 0) {
            this.currentOperand.push("0");
        }
        this.currentOperand.push(".");
    }

    inputOperation(operation) {
        try {
            const result = this.#attemptEval();
            this.prevOperand = result.toString().split("");
            this.currentOperand = [];
            this.currentOperation.push(operation);
        } catch (error) {
            console.log(error);
            if (error instanceof ZeroOperandsError) {
                if (this.currentResult.length > 0) {
                    this.prevOperand.push(...this.currentResult);
                    this.currentResult = [];
                    this.currentOperation.push(operation);
                }
            } else if (error instanceof FirstOperandMissingError) {
                this.prevOperand.push(...this.currentOperand);
                this.currentOperand = [];
                this.currentOperation = [];
                this.currentOperation.push(operation);
            } else if (error instanceof SecondOperandMissingError) {
                // replace old operation with a new one
                this.currentOperation.pop();
                this.currentOperation.push(operation);
            }
        }
    }

    evaluate() {
        try {
            const result = this.#attemptEval();
            this.currentResult = result.toString().split("");
            this.prevOperand = [];
            this.currentOperand = [];
        } catch (error) {
            console.log(error);
            this.prevOperand = [];
            this.currentOperand = [];
        }
    }

    #attemptEval() {
        if (this.prevOperand.length === 0 && this.currentOperand.length === 0) {
            throw new ZeroOperandsError();
        }
        if (this.prevOperand.length === 0 && this.currentOperand.length > 0) {
            throw new FirstOperandMissingError();
        }
        if (this.prevOperand.length > 0 && this.currentOperand.length === 0) {
            throw new SecondOperandMissingError();
        }

        const result = this.#attemptCalc(
            parseFloat(this.prevOperand.join("")),
            parseFloat(this.currentOperand.join("")),
            this.currentOperation.pop()
        );

        if (result instanceof Error) {
            throw new MathError(result.message);
        }
        console.log(result);
        return result;
    }

    #attemptCalc(operand1, operand2, operation) {
        switch (operation) {
            case "+":
                return operand1 + operand2;
            case "-":
                return operand1 - operand2;
            case "*":
                return operand1 * operand2;
            case "/":
                if (operand2 === 0) {
                    return Error("Cannot divide by zero!");
                }
                return operand1 / operand2;
            case "%":
                return operand1 % operand2;
            case "exp":
                return operand1 ** operand2;
            default:
                break;
        }
    }

    #undoHelper(arr) {
        if (arr.length === 0) return true; // nothing to undo

        arr.pop();
        if (arr.length === 1 && arr[0] === "-") {
            arr.pop();
        }
        return false;
    }
}

const calc = new Calculator();
