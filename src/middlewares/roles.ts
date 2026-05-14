import { NextFunction, Request, Response } from "express";
import { NotAuthorizedError } from "../infrastructure/errors/errors";
import { errorHandler } from "../helpers/httpHelpers";

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    try {
        if (req.user.role != 'admin') throw new NotAuthorizedError("No autorizado");
        next();
    } catch (error) {
        errorHandler(error, res);
    }
}

export const isAdministrativeUser = (req: Request, res: Response, next: NextFunction) => {
    try {
        if (req.user.role != 'admin' && req.user.role != 'administrator') throw new NotAuthorizedError("No autorizado");
        next();
    } catch (error) {
        errorHandler(error, res);
    }
}