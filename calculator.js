class Calculator {
    currentOperation;
    prevOperand;
    currentOperand;
    currentResult;

    constructor() {
        this.clear();
    }

    clear() {
        this.currentOperation = [];
        this.prevOperand = [];
        this.currentOperand = [];
        this.currentResult = [];
    }

    undo() {
        // must go in this order
        this.#undoResult() && this.#undoOperand() && this.#undoOperation();
    }

    inputDigit(digit) {
        if (this.currentResult.length > 0) this.clear();
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
            this.currentOperation = [operation];
        } catch (error) {
            // console.log(error);
            if (error instanceof PreviousOperandMissingError) {
                this.prevOperand = [...this.currentOperand];
                this.currentOperand = [];
                this.currentOperation.push(operation);
            } else if (error instanceof CurrentOperandMissingError) {
                // replace old operation with a new one
                this.currentOperation = [operation];
            } else if (error instanceof ResultExistsError) {
                // start new calculation with result as previous operand
                this.prevOperand = [...this.currentResult];
                this.currentOperand = [];
                this.currentResult = [];
                this.currentOperation = [operation];
            }
        }
    }

    evaluate() {
        try {
            const result = this.#attemptEval();
            this.currentResult = result.toString().split("");
        } catch (error) {
            // console.log(error);
            if (error instanceof MathError) {
                this.clear();
            }
        }
    }

    #attemptEval() {
        if (this.prevOperand.length === 0 && this.currentOperand.length === 0) {
            throw new ZeroOperandsError();
        }
        if (this.prevOperand.length === 0 && this.currentOperand.length > 0) {
            throw new PreviousOperandMissingError();
        }
        if (this.prevOperand.length > 0 && this.currentOperand.length === 0) {
            throw new CurrentOperandMissingError();
        }
        if (this.currentResult.length > 0) {
            throw new ResultExistsError();
        }
        if (this.currentOperation.length === 0) {
            throw new Error("no operation");
        }

        const result = this.#attemptCalc(
            parseFloat(this.prevOperand.join("")),
            parseFloat(this.currentOperand.join("")),
            this.currentOperation[0]
        );

        if (result instanceof Error) {
            throw new MathError(result.message);
        }
        // console.log(result);
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

    #undoResult() {
        if (this.currentResult.length === 0) return true;

        this.currentResult = [];
        return false;
    }
    #undoOperand() {
        if (this.currentOperand.length === 0) return true;

        this.currentOperand.pop();
        if (this.currentOperand.length === 1 && this.currentOperand[0] === "-") {
            this.currentOperand.pop();
        }
        return false;
    }
    #undoOperation() {
        if (this.currentOperation.length === 0) return true;

        this.currentOperation.pop();
        this.currentOperand = [...this.prevOperand];
        this.prevOperand = [];
        return false;
    }
}

class CustomError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
}
class ZeroOperandsError extends CustomError {}
class PreviousOperandMissingError extends CustomError {}
class CurrentOperandMissingError extends CustomError {}
class ResultExistsError extends CustomError {}
class MathError extends CustomError {}
