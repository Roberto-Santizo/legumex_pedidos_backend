// Created by Luis

import { Request, Response } from 'express';
import { errorHandler, responseHandler } from '../helpers/httpHelpers';
import { carrierProvider } from '../providers/carrierRepositoryProvider';

export abstract class CarrierController {
    // GET /api/carriers
    static async index(req: Request, res: Response) {
        try {
            const data = await carrierProvider.getAll();
            responseHandler(res, 200, 'Carriers retrieved successfully', data);
        } catch (error) {
            errorHandler(error, res);
        }
    }

    // POST /api/carriers
    static async store(req: Request, res: Response) {
        try {
            const { name, shippingCost, rateUpdatedAt } = req.body;
            const carrier = await carrierProvider.create({ name, shippingCost: Number(shippingCost), rateUpdatedAt });
            responseHandler(res, 201, 'Carrier created successfully', carrier);
        } catch (error) {
            errorHandler(error, res);
        }
    }

    // PUT /api/carriers/:id
    static async update(req: Request, res: Response) {
        try {
            const id = Number(req.params.id);
            const { name, shippingCost, rateUpdatedAt } = req.body;
            const payload: Record<string, unknown> = {};
            if (name !== undefined) payload.name = name;
            if (shippingCost !== undefined) payload.shippingCost = Number(shippingCost);
            if (rateUpdatedAt !== undefined) payload.rateUpdatedAt = rateUpdatedAt;
            const carrier = await carrierProvider.update(id, payload);
            responseHandler(res, 200, 'Carrier updated successfully', carrier);
        } catch (error) {
            errorHandler(error, res);
        }
    }

    // DELETE /api/carriers/:id
    static async destroy(req: Request, res: Response) {
        try {
            const id = Number(req.params.id);
            await carrierProvider.delete(id);
            responseHandler(res, 200, 'Carrier deleted successfully');
        } catch (error) {
            errorHandler(error, res);
        }
    }
}
