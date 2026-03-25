import { NotAuthorizedError } from "../infrastructure/infrastructure";
import { errorHandler } from "../helpers/httpHelpers";
import { Order } from "../entities/entities";
import { orderProvider } from "../providers/orderRepositoryProvider";
import { Request, Response, NextFunction } from "express";

export const isOrderOwner = async (req: Request<{ id: Order['id'] }>, res: Response, next: NextFunction) => {
    try {
        const order = await orderProvider.getOrderById(req.params.id);

        if (req.user.role == 'client' && (order.user.id != req.user.id)) {
            throw new NotAuthorizedError("Unauthorized");
        }
        next();
    } catch (error) {
        errorHandler(error, res);
    }
}