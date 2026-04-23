// Created by Luis

import { Request, Response } from 'express';
import { errorHandler, responseHandler } from '../helpers/httpHelpers';
import { containerProvider } from '../providers/containerRepositoryProvider';

export abstract class ContainerController {
    // GET /api/containers/week?date=YYYY-MM-DD
    static async getWeekView(req: Request, res: Response) {
        try {
            // Default to today if no date is provided
            const date = (req.query.date as string) ?? new Date().toISOString().slice(0, 10);
            const data = await containerProvider.getWeekView(date);
            responseHandler(res, 200, 'Week view retrieved successfully', data);
        } catch (error) {
            errorHandler(error, res);
        }
    }

    // POST /api/containers
    static async store(req: Request, res: Response) {
        try {
            const { transportType, dc, weekStart, orderIds } = req.body;
            const container = await containerProvider.createContainer(
                { transportType, dc, weekStart, orderIds },
                req.user.id,
            );
            responseHandler(res, 201, 'Container created successfully', container);
        } catch (error) {
            errorHandler(error, res);
        }
    }

    // POST /api/containers/:id/orders
    static async addOrders(req: Request, res: Response) {
        try {
            const containerId = Number(req.params.id);
            const { orderIds } = req.body;
            const container = await containerProvider.addOrders(containerId, orderIds, req.user.id);
            responseHandler(res, 200, 'Orders added to container successfully', container);
        } catch (error) {
            errorHandler(error, res);
        }
    }

    // DELETE /api/containers/:id/orders/:orderId
    static async removeOrder(req: Request, res: Response) {
        try {
            const containerId = Number(req.params.id);
            const orderId = Number(req.params.orderId);
            const container = await containerProvider.removeOrder(containerId, orderId);
            responseHandler(res, 200, 'Order removed from container successfully', container);
        } catch (error) {
            errorHandler(error, res);
        }
    }

    // POST /api/containers/:id/confirm
    static async confirm(req: Request, res: Response) {
        try {
            const containerId = Number(req.params.id);
            const result = await containerProvider.confirmContainer(containerId, req.user.id);
            responseHandler(res, 200, 'Container confirmed successfully', result);
        } catch (error) {
            errorHandler(error, res);
        }
    }

    // DELETE /api/containers/:id
    static async destroy(req: Request, res: Response) {
        try {
            const containerId = Number(req.params.id);
            await containerProvider.deleteContainer(containerId);
            responseHandler(res, 200, 'Container deleted successfully');
        } catch (error) {
            errorHandler(error, res);
        }
    }

    // GET /api/containers/:id
    static async show(req: Request, res: Response) {
        try {
            const containerId = Number(req.params.id);
            const container = await containerProvider.getContainerById(containerId);
            responseHandler(res, 200, 'Container retrieved successfully', container);
        } catch (error) {
            errorHandler(error, res);
        }
    }

    // POST /api/containers/:id/assign-carrier
    static async assignCarrier(req: Request, res: Response) {
        try {
            const containerId = Number(req.params.id);
            const { carrierId } = req.body;
            const container = await containerProvider.assignCarrier(containerId, Number(carrierId));
            responseHandler(res, 200, 'Carrier assigned successfully', container);
        } catch (error) {
            errorHandler(error, res);
        }
    }
}
