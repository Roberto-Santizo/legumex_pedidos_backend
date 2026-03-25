import { authProvider } from '../providers/authRepositoryProvider'
import { errorHandler } from '../helpers/httpHelpers'
import { NotAuthorizedError } from '../infrastructure/errors/errors'
import { Request, Response, NextFunction } from 'express'
import { User } from '../entities/entities'
import jwt from 'jsonwebtoken'

declare global {
    namespace Express {
        interface Request {
            user?: User
        }
    }
}

export const authenticated = async (req: Request, res: Response, next: NextFunction) => {
    const bearer = req.headers.authorization
    if (!bearer) {
        const error = new NotAuthorizedError('No Autorizado')
        errorHandler(error, res);
        return;
    }

    const [, token] = bearer.split(' ')

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if (typeof decoded === 'object' && decoded.id) {

            const user = await authProvider.getUserById(decoded.id);

            if (user) {
                req.user = user
                next();
            } else {
                errorHandler(new Error("Token inválido"), res);
            }
        }
    } catch (error) {
        errorHandler(error, res);
    }
}

