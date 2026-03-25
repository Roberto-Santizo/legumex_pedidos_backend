import jwt from "jsonwebtoken";
import { User } from "../entities/entities";

export const generateJWT = (user: User): string => {
    const token = jwt.sign({
        id: user.id,
        name: user.name,
        lastName: user.lastName,
        role: user.role,
        email: user.email
    }, process.env.JWT_SECRET, { expiresIn: '7d' })
    return token
}

export const generateRefreshJWT = (user: User): string => {
    const token = jwt.sign({
        id: user.id,
        name: user.name,
        lastName: user.lastName,
        role: user.role,
        email: user.email
    }, process.env.JWT_SECRET, { expiresIn: '30d' })
    return token
}