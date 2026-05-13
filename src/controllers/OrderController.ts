import { errorHandler, responseHandler } from "../helpers/httpHelpers";
import { Order, OrderProduct } from "../entities/entities";
import { CreateOrderPayload, OrderProductPayload, UpdateOrderPayload } from "../interfaces/interfaces";
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

    static async index(req: Request<{}, {}, {}, { client: string, year: number, week: number }>, res: Response) {
        try {
            const { client, year, week } = req.query;
            const orders = await orderProvider.getOrders(req.user, client, year, week);

            responseHandler(res, 201, 'Ordenes Obtenidas Correctamente', OrderResource.collection(orders));
        } catch (error) {
            errorHandler(error, res);
        }
    }

    static async getPaginatedOrders(req: Request, res: Response) {
        try {
            const { limit, offset } = req.query;
            const [data, total] = await orderProvider.getPaginatedOrders(req.user, req, +limit, +offset);

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

    static async uploadFile(req: Request<{}, {}, { year: number, week: number }>, res: Response) {
        try {
            const results = await orderProvider.uploadFile(req.file, req.user, req.body.year, req.body.week);

            responseHandler(res, 200, 'Archivo subido correctamente', results);
        } catch (error) {
            errorHandler(error, res);
        }
    }

    static async generateOrdersHeadersReport(req: Request<{}, {}, { week: number, year: number }>, res: Response) {
        try {
            const file = await orderProvider.generateOrdersHeadersReport(req.body.week, req.body.year, req.user);

            res.send(file);
        } catch (error) {
            errorHandler(error, res);
        }
    }

    static async generateOrdersItemsReport(req: Request<{}, {}, { year: number, week: number }>, res: Response) {
        try {
            const file = await orderProvider.generateOrdersItemsReport(req.body.year, req.body.week, req.user);

            res.send(file);
        } catch (error) {
            errorHandler(error, res);
        }
    }

    static async getOrderEditDetails(req: Request<{ id: Order['id'] }>, res: Response) {
        try {
            const order = await orderProvider.getOrderById(req.params.id);

            responseHandler(res, 200, 'Datos de la orden obtenidos correctamente', OrderResource.orderEditDetails(order));
        } catch (error) {
            errorHandler(error, res);
        }
    }

    static async update(req: Request<{ id: Order['id'] }, {}, UpdateOrderPayload>, res: Response) {
        try {
            await orderProvider.updateOrder(req.params.id, req.body);

            responseHandler(res, 200, 'Orden Actualizada Correctamente');
        } catch (error) {
            errorHandler(error, res);
        }
    }

    static async deleteOrder(req: Request<{ id: Order['id'] }>, res: Response) {
        try {
            await orderProvider.deleteOrder(req.params.id);
            responseHandler(res, 200, 'Orden Eliminada Correctamente');
        } catch (error) {
            errorHandler(error, res);
        }
    }
}