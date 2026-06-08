import { BadRequestError, ConflictError, NotAuthorizedError, NotFoundError, WrongCredentials } from "../infrastructure/errors/errors";
import { Response } from "express";

export function errorHandler(err: Error, res: Response) {
    if (err instanceof BadRequestError) {
        return res.status(400).json({
            statusCode: 400,
            message: err.message
        });
    }

    if (err instanceof NotFoundError) {
        return res.status(404).json({
            statusCode: 404,
            message: err.message
        });
    }

    if (err instanceof WrongCredentials) {
        return res.status(401).json({
            statusCode: 401,
            message: err.message
        });
    }

    if (err instanceof ConflictError) {
        return res.status(409).json({
            statusCode: 409,
            message: err.message
        });
    }

    if (err instanceof NotAuthorizedError) {
        return res.status(401).json({
            statusCode: 401,
            message: err.message
        });
    }

    if (err instanceof BadRequestError) {
        return res.status(400).json({
            statusCode: 400,
            message: err.message
        });
    }

    console.error('[500]', err);
    return res.status(500).json({
        statusCode: 500,
        message: err.message
    });
}

export function responseHandler(res: Response, statusCode: number, message: string, data?: any) {
    return res.status(statusCode).json({
        statusCode,
        message,
        data
    });
}
