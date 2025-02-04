import { NextFunction, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

export const newLead = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {

        const {} = req.body
        
    } catch (error) {
        
    }
  }