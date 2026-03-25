import { Request, Response } from "express";
import { errorHandler, responseHandler } from "../helpers/httpHelpers";
import { authProvider } from "../providers/providers";
import { CreateOrUpdateUserPayload, LoginFormPayload } from "../interfaces/interfaces";
import { User } from "../entities/entities";
import { UserResource } from "../resources/UserResource";

export abstract class AuthController {
    static async register(req: Request<{}, {}, CreateOrUpdateUserPayload>, res: Response) {
        try {
            await authProvider.createUser(req.body);

            responseHandler(res, 201, 'Usuario Creado Correctamente')
        } catch (error) {
            errorHandler(error, res);
        }
    }

    static async login(req: Request<{}, {}, LoginFormPayload>, res: Response) {
        try {
            const user = await authProvider.login(req.body);

            responseHandler(res, 201, 'Sesión Iniciada Correctamente', user)
        } catch (error) {
            errorHandler(error, res);
        }
    }

    static async getUserById(req: Request<{ id: User['id'] }>, res: Response) {
        try {
            const user = await authProvider.getUserById(req.params.id);

            responseHandler(res, 201, 'Usuario Obtenido Correctamente', UserResource.userDetails(user))
        } catch (error) {
            errorHandler(error, res);
        }
    }

    static async getUsers(req: Request, res: Response) {
        try {
            const users = await authProvider.getUsers();

            responseHandler(res, 201, 'Usuarios Obtenidos Correctamente', UserResource.collection(users))
        } catch (error) {
            errorHandler(error, res);
        }
    }

    static async updateUserById(req: Request<{ id: User['id'] }, {}, CreateOrUpdateUserPayload>, res: Response) {
        try {
            //!REALIZAR IMPLEMENTACION DE ACTUALIZACIÓN DE CLIENTES
            await authProvider.updateUserById(req.params.id, req.body);

            responseHandler(res, 201, 'Usuario Actualizado Correctamente')
        } catch (error) {
            errorHandler(error, res);
        }
    }

    static async checkstatus(req: Request, res: Response) {
        try {
            const user = await authProvider.checkStatus(req.user);

            responseHandler(res, 201, 'Sesión Iniciada Correctamente', user)
        } catch (error) {
            errorHandler(error, res);
        }
    }
}