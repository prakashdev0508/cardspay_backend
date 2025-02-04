import { Response } from "express";

class CustomError extends Error {
  status: number;
  error: any;

  constructor(status: number, message: string, error?: any) {
    super(message);
    this.status = status;
    this.error = error;
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}

export const createError = (status: number, message: string, error?: any) => {
  return new CustomError(status, message, error);
};

export const createSuccess = (
  res: Response,
  message: string,
  data?: any,
  status?: number
) => {
  return res
    .status(status ? status : 200)
    .json({ success: true, message: message, data });
};
