import { NextFunction, Request, Response } from "express";


export const userRegister = async(req : Request , res : Response , next : NextFunction )=>{
    try {

        const {name , email , role , company_id , password  , email_verified_at  } = req.body()
        
    } catch (error) {
        
    }
}