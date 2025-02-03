import { Response } from "express";

class CustomError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}

export const createError = (status: number, message: string) => {
  return new CustomError(status, message);
};
