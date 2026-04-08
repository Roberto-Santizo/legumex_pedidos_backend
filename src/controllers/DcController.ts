import { Request, Response } from "express";
import { errorHandler, responseHandler } from "../helpers/httpHelpers";
import { CreateOrUpdateDc } from "../interfaces/interfaces";
import { dcProvider } from "../providers/dcRepositoryProvider";
import { DcResource } from '../resources/DcResource';

export abstract class DcController {
    static async store(req: Request<{}, {}, CreateOrUpdateDc>, res: Response) {
        try {
            await dcProvider.createDc(req.body);

            responseHandler(res, 201, 'DC creado correctamente');
        } catch (error) {
            errorHandler(error, res);
        }
    }

    static async index(req: Request, res: Response) {
        try {
            const { client_id } = req.query;

            const dcs = await dcProvider.getDcs(+client_id);

            responseHandler(res, 200, 'DCs obtenidos correctamente', DcResource.collection(dcs));
        } catch (error) {
            errorHandler(error, res);
        }
    }
}