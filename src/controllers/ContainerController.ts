import { Request, Response } from 'express';
import { errorHandler, responseHandler } from '../helpers/httpHelpers';
import { containerProvider } from '../providers/containerRepositoryProvider';

export abstract class ContainerController {
    static async getWeekView(req: Request, res: Response) {
        try {
            const date = (req.query.date as string) ?? new Date().toISOString().slice(0, 10);
            const weekSchedule = await containerProvider.getWeekContainerSchedule(date);
            responseHandler(res, 200, 'Week view retrieved successfully', weekSchedule);
        } catch (error) {
            errorHandler(error, res);
        }
    }

    static async createContainer(req: Request, res: Response) {
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

    static async confirmContainer(req: Request, res: Response) {
        try {
            const containerId = Number(req.params.id);
            const confirmedContainer = await containerProvider.confirmContainer(containerId, req.user.id);
            responseHandler(res, 200, 'Container confirmed successfully', confirmedContainer);
        } catch (error) {
            errorHandler(error, res);
        }
    }

    static async deleteContainer(req: Request, res: Response) {
        try {
            const containerId = Number(req.params.id);
            await containerProvider.deleteContainer(containerId);
            responseHandler(res, 200, 'Container deleted successfully');
        } catch (error) {
            errorHandler(error, res);
        }
    }

    static async getContainerById(req: Request, res: Response) {
        try {
            const containerId = Number(req.params.id);
            const container = await containerProvider.getContainerById(containerId);
            responseHandler(res, 200, 'Container retrieved successfully', container);
        } catch (error) {
            errorHandler(error, res);
        }
    }

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

    static async setDeliverySchedule(req: Request, res: Response) {
        try {
            const containerId = Number(req.params.id);
            const { deliveryDate, deliveryTime } = req.body;
            const container = await containerProvider.setDeliverySchedule(containerId, deliveryDate, deliveryTime);
            responseHandler(res, 200, 'Delivery schedule updated successfully', container);
        } catch (error) {
            errorHandler(error, res);
        }
    }
}
