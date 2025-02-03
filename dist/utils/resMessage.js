"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createError = void 0;
class CustomError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
        Object.setPrototypeOf(this, CustomError.prototype);
    }
}
const createError = (status, message) => {
    return new CustomError(status, message);
};
exports.createError = createError;
