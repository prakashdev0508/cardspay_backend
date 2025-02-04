"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createError = void 0;
class CustomError extends Error {
    constructor(status, message, error) {
        super(message);
        this.status = status;
        this.error = error;
        Object.setPrototypeOf(this, CustomError.prototype);
    }
}
const createError = (status, message, error) => {
    return new CustomError(status, message, error);
};
exports.createError = createError;
