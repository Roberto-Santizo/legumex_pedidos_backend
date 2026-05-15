import { Request, Response } from 'express';
import { errorHandler, responseHandler } from '../helpers/httpHelpers';
import { carrierProvider } from '../providers/carrierRepositoryProvider';

export abstract class CarrierController {
    static async getAllCarriers(req: Request, res: Response) {
        try {
            const dcId = req.query.dc_id !== undefined ? Number(req.query.dc_id) : null;
            const carriers = dcId !== null && !isNaN(dcId)
                ? await carrierProvider.getByDcId(dcId)
                : await carrierProvider.getAll();
            responseHandler(res, 200, 'Carriers retrieved successfully', carriers);
        } catch (error) {
            errorHandler(error, res);
        }
    }

    static async createCarrier(req: Request, res: Response) {
        try {
            const { name, shippingCost, rateUpdatedAt, dcId } = req.body;
            const createdCarrier = await carrierProvider.create({
                name,
                shippingCost: Number(shippingCost),
                rateUpdatedAt,
                dcId: dcId !== undefined ? Number(dcId) : null,
            });
            responseHandler(res, 201, 'Carrier created successfully', createdCarrier);
        } catch (error) {
            errorHandler(error, res);
        }
    }

    static async updateCarrier(req: Request, res: Response) {
        try {
            const carrierId = Number(req.params.id);
            const { name, shippingCost, rateUpdatedAt, dcId } = req.body;
            const fieldsToUpdate: Record<string, unknown> = {};
            if (name !== undefined) fieldsToUpdate.name = name;
            if (shippingCost !== undefined) fieldsToUpdate.shippingCost = Number(shippingCost);
            if (rateUpdatedAt !== undefined) fieldsToUpdate.rateUpdatedAt = rateUpdatedAt;
            if (dcId !== undefined) fieldsToUpdate.dcId = Number(dcId);
            const updatedCarrier = await carrierProvider.update(carrierId, fieldsToUpdate);
            responseHandler(res, 200, 'Carrier updated successfully', updatedCarrier);
        } catch (error) {
            errorHandler(error, res);
        }
    }

    static async deleteCarrier(req: Request, res: Response) {
        try {
            const carrierId = Number(req.params.id);
            await carrierProvider.delete(carrierId);
            responseHandler(res, 200, 'Carrier deleted successfully');
        } catch (error) {
            errorHandler(error, res);
        }
    }

    static async getCarrierRates(req: Request, res: Response) {
        try {
            const carrierId = Number(req.params.id);
            const carrierRates = await carrierProvider.getRates(carrierId);
            responseHandler(res, 200, 'Carrier rates retrieved successfully', carrierRates);
        } catch (error) {
            errorHandler(error, res);
        }
    }
}
