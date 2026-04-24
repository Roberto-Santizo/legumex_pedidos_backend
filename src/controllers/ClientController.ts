import { Request, Response } from "express";
import { errorHandler, responseHandler } from "../helpers/httpHelpers";
import { clientProvider } from "../providers/clientRepositoryProvider";
import { Client } from "../entities/entities";
import { userClientProvider } from "../providers/userClientRepositoryProvider";
import { ClientResource } from "../resources/ClientResorce";

export abstract class ClientController {
    static async store(req: Request<{}, {}, { name: string, code: string }>, res: Response) {
        try {
            await clientProvider.createClient(req.body.name, req.body.code);
            responseHandler(res, 201, 'Cliente creado correctamente');
        } catch (error) {
            errorHandler(error, res);
        }
    }

    static async index(req: Request, res: Response) {
        try {
            const clients = await clientProvider.getClients();
            responseHandler(res, 201, 'Clientes obtenidos correctamente', clients);
        } catch (error) {
            errorHandler(error, res);
        }
    }

    static async getUserClients(req: Request, res: Response) {
        try {
            const clients = await userClientProvider.getUserClients(req.user);
            responseHandler(res, 201, 'Clientes del usuario obtenidos correctamente', ClientResource.collection(clients));
        } catch (error) {
            errorHandler(error, res);
        }
    }

    static async get(req: Request<{ id: Client['id'] }>, res: Response) {
        try {
            const clients = await clientProvider.getClientById(req.params.id);
            responseHandler(res, 201, 'Cliente creado correctamente', clients);
        } catch (error) {
            errorHandler(error, res);
        }
    }

    static async update(req: Request<{ id: Client['id'] }, {}, { name: string }>, res: Response) {
        try {
            await clientProvider.updateClientById(req.params.id, req.body.name);
            responseHandler(res, 201, 'Cliente actualizado correctamente');
        } catch (error) {
            errorHandler(error, res);
        }
    }
}