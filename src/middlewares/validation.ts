import { validationResult } from "express-validator";
import type { Request, Response, NextFunction } from "express";

export const returnValidationErrors = (req: Request, res: Response, next: NextFunction) => {
    console.log('[VALIDATION] req.body:', req.body);
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
        const errorsArray = errors.array();
        const flatErrors = errorsArray.map(error => error.msg);

        res.status(400).json({ errors: flatErrors });
        return;
    }
    
    next();
};