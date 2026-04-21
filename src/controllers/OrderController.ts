import { errorHandler, responseHandler } from "../helpers/httpHelpers";
import { Order, OrderProduct } from "../entities/entities";
import { CreateOrderPayload, OrderProductPayload } from "../interfaces/interfaces";
import { orderProductProvider } from "../providers/orderProductRepositoryProvider";
import { orderProvider } from "../providers/orderRepositoryProvider";
import { OrderResource } from '../resources/OrderResource';
import { Request, Response } from "express";

export abstract class OrderController {
    static async store(req: Request<{}, {}, CreateOrderPayload>, res: Response) {
        try {
            await orderProvider.createOrder(req.user, req.body);

            responseHandler(res, 201, 'Orden Creada Correctamente');
        } catch (error) {
            errorHandler(error, res);
        }
    }

    static async index(req: Request<{}, {}, {}, { client: string, startDate: string, endDate: string }>, res: Response) {
        try {
            const { client, startDate, endDate } = req.query;
            const orders = await orderProvider.getOrders(req.user, client, startDate, endDate);

            responseHandler(res, 201, 'Ordenes Obtenidas Correctamente', OrderResource.collection(orders));
        } catch (error) {
            errorHandler(error, res);
        }
    }

    static async getPaginatedOrders(req: Request, res: Response) {
        try {
            const { limit, offset } = req.query;
            const [data, total] = await orderProvider.getPaginatedOrders(req.user, +limit, +offset);

            const response = {
                response: OrderResource.collection(data),
                total: total,
                page: +offset,
                lastPage: Math.ceil(total / +limit)
            }

            responseHandler(res, 201, 'Ordenes Obtenidas Correctamente', response);
        } catch (error) {
            errorHandler(error, res);
        }
    }

    static async get(req: Request<{ id: Order['id'] }>, res: Response) {
        try {
            const order = await orderProvider.getOrderById(req.params.id);

            responseHandler(res, 201, 'Orden Obtenida Correctamente', OrderResource.orderDetails(order));
        } catch (error) {
            errorHandler(error, res);
        }
    }

    static async confirmOrder(req: Request<{ id: Order['id'] }>, res: Response) {
        try {
            await orderProvider.confirmOrder(req.params.id);

            responseHandler(res, 200, 'Orden Confirmada Correctamente');
        } catch (error) {
            errorHandler(error, res);
        }
    }

    static async confirmReceivedOrder(req: Request<{ id: Order['id'] }>, res: Response) {
        try {
            await orderProvider.confirmReceivedOrder(req.user, req.params.id);

            responseHandler(res, 200, 'Orden Confirmada de Recibida Correctamente');
        } catch (error) {
            errorHandler(error, res);
        }
    }

    static async addItem(req: Request<{ id: Order['id'] }, {}, OrderProductPayload>, res: Response) {
        try {
            await orderProductProvider.createProduct(req.body, req.params.id);

            responseHandler(res, 200, 'Producto Agregado Correctamente');
        } catch (error) {
            errorHandler(error, res);
        }
    }

    static async getOrderTotals(req: Request<{ id: Order['id'] }>, res: Response) {
        try {
            const products = await orderProductProvider.getProductsByOrderId(req.params.id);
            responseHandler(res, 200, 'Totales de Orden Obtenidos Correctamente', OrderResource.orderTotals(products));
        } catch (error) {
            errorHandler(error, res);
        }
    }

    static async getOrderItems(req: Request<{ id: Order['id'] }>, res: Response) {
        try {
            const products = await orderProductProvider.getProductsByOrderId(req.params.id);
            responseHandler(res, 200, 'Items de Orden Obtenidos Correctamente', OrderResource.orderItemDetails(products));
        } catch (error) {
            errorHandler(error, res);
        }
    }

    static async getOrderItemById(req: Request<{ id: OrderProduct['id'] }>, res: Response) {
        try {
            const item = await orderProductProvider.getItemById(req.params.id);
            responseHandler(res, 200, 'Producto de Orden Obtenido Correctamente', OrderResource.orderItem(item));
        } catch (error) {
            errorHandler(error, res);
        }
    }

    static async updateOrderItemById(req: Request<{ id: Order['id'], itemId: OrderProduct['id'] }, {}, OrderProductPayload>, res: Response) {
        try {
            await orderProductProvider.updateItemById(req.params.id, req.params.itemId, req.body);

            responseHandler(res, 200, 'Producto de Orden actualizado Correctamente');
        } catch (error) {
            errorHandler(error, res);
        }
    }

    static async deleteItem(req: Request<{ id: Order['id'], itemId: OrderProduct['id'] }>, res: Response) {
        try {
            await orderProductProvider.deleteOrderProductById(req.params.itemId);
            responseHandler(res, 201, 'Item Eliminado Correctamente');
        } catch (error) {
            errorHandler(error, res);
        }
    }

    static async uploadFile(req: Request, res: Response) {
        try {
            const results = await orderProvider.uploadFile(req.file, req.user);

            responseHandler(res, 200, 'Archivo subido correctamente', results);
        } catch (error) {
            errorHandler(error, res);
        }
    }
}