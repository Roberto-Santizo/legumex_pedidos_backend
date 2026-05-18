import { Client, Dc, Order, OrderProduct, Product, User } from "../entities/entities";
import { clientProvider } from "../providers/clientRepositoryProvider";
import { ConflictError, NotFoundError } from "../infrastructure/infrastructure";
import { CreateOrderPayload, OrderMapperResult, UpdateOrderPayload } from "../interfaces/interfaces";
import { dcProvider } from "../providers/dcRepositoryProvider";
import { ExcelHandler } from "../classes/ExcelHandler";
import { FindManyOptions, FindOptionsWhere, In } from "typeorm";
import { headersColumns, itemsColumns, orderDetailsColumns } from "../data/reports";
import { IAProvider } from "../domain/providers/IAProvider";
import { OrderMapper } from "../infrastructure/mappers/OrderMapper";
import { orderProductProvider } from "../providers/orderProductRepositoryProvider";
import { OrderRepository } from "../domain/domain";
import { OrderResource } from "../resources/OrderResource";
import { OrderSchema, OrdersIAResponseSchema } from "../domain/schemas/schemas";
import { productProvider } from "../providers/productRepositoryProvider";
import { Request } from 'express';
import { TransportOptions } from "../entities/Order";
import ExcelJS from 'exceljs';
import z from "zod";
import { formatCell } from "../utils/excel";

export class OrderService {
    constructor(private repository: OrderRepository, private ia: IAProvider) { }

    _validateTransportType(type: TransportOptions) {
        if (!Object.values(TransportOptions).includes(type)) {
            throw new ConflictError("El tipo de transporte no existe");
        }
    }

    async _validateOrderProducts(order: z.infer<typeof OrderSchema>, products: Product[]): Promise<OrderMapperResult> {
        const productErrors = await OrderMapper.validateProducts(order.products, products);
        if (productErrors.length > 0) return { success: false, message: `La orden con PO ${order.po} tiene productos no válidos: ${productErrors.map(e => e.message).join(', ')}` }
    }

    async _validateOrderInformation(data: z.infer<typeof OrderSchema>, products: Product[], dc: Dc, client: Client): Promise<TransportOptions | OrderMapperResult> {
        const firstProduct = await OrderMapper.getTransportType(products, data.products[0].code);

        if (products.length == 0) return { success: false, message: `No se encontraron productos válidos para la orden con PO ${data.po}` }
        if (!firstProduct) return { success: false, message: `No se pudo determinar el tipo de transporte para la orden con PO ${data.po}` }
        if (!dc) return { success: false, message: `El DC ${dc.name} no pudo ser encontrado` }
        if (!client) return { success: false, message: `El cliente ${data.client.name} no pudo ser encontrado` }

        return firstProduct.transportType;
    }

    async _createOrder(data: z.infer<typeof OrderSchema>, user: User, transportType: TransportOptions, dc: Dc, year: number, week: number): Promise<Order> {
        const order = OrderMapper.formatOrder(data, transportType, dc, year, week);
        const newOrder = await this.createOrder(user, order);
        return newOrder;
    }

    async _addProductsToOrder(data: z.infer<typeof OrderSchema>, order: Order, products: Product[]) {
        const orderProducts = await OrderMapper.productsMapper(data.products, products, order);
        await orderProductProvider.createProducts(orderProducts);
    }

    async _processOrderInformation(data: z.infer<typeof OrderSchema>, user: User, clients: Client[], dcs: Dc[], products: Product[], year: number, week: number): Promise<OrderMapperResult> {
        try {
            const dc = dcs.filter((dc) => dc.id === data.dc.id)[0];
            const client = clients.filter((client) => client.id === data.client.id)[0];
            const filterdProducts = products.filter((product) => product.dc.id === data.dc.id);
            await this._validateOrderProducts(data, products);

            const validationOrder = await this._validateOrderInformation(data, filterdProducts, dc, client);

            if (typeof validationOrder === 'object') {
                return validationOrder;
            }

            const newOrder = await this._createOrder(data, user, validationOrder, dc, year, week);
            await this._addProductsToOrder(data, newOrder, filterdProducts);

            return { success: true, message: `Orden con PO ${data.po} procesada correctamente` }
        } catch (error) {
            return { success: false, message: `${error.message}` }
        }
    }

    async createOrder(user: User, payload: CreateOrderPayload) {
        this._validateTransportType(payload.transportType);
        if (!payload.requiredByDate) {
            throw new ConflictError('Required by date is mandatory');
        }
        const client = await clientProvider.getClientById(payload.client_id);
        const dc = await dcProvider.getDcById(payload.dc_id);

        payload.user = user;
        payload.client = client;
        payload.dc = dc;
        payload.date = new Date().toISOString();

        return this.repository.createOrder(payload);
    }

    async getOrderById(id: Order['id']) {
        const order = await this.repository.getOrderById(id);
        if (!order) throw new NotFoundError("La orden no existe");
        return order;
    }

    async getOrders(user: User, clientId?: string, year?: number, week?: number) {
        let options: FindManyOptions<Order> = { relations: ['client', 'confirmedBy', 'dc'] }

        if (user.role === 'client') {
            options = { ...options, where: { user: { id: user.id } } }
        }

        if (clientId) {
            options = { ...options, where: { ...options.where, client: { id: +clientId } } }
        }

        if (week && year) {
            options = { ...options, where: { ...options.where, year: year, week: week } }
        }

        return this.repository.getOrders(options);
    }

    async getPaginatedOrders(user: User, req: Request, limit?: number, offset?: number) {
        let ops: FindOptionsWhere<Order> = user.role == 'client' ? { user: { id: user.id } } : {}

        if (req.query.po) {
            ops = { ...ops, po: `${req.query.po}` }
        }

        if (req.query.year) {
            ops = { ...ops, year: +req.query.year }
        }

        if (req.query.week) {
            ops = { ...ops, week: +req.query.week }
        }

        if (req.query.client) {
            ops = { ...ops, client: { id: +req.query.client } }
        }

        if (req.query.dc) {
            ops = { ...ops, dc: { id: +req.query.dc } }
        }

        if (req.query.transportType) {
            ops = { ...ops, transportType: req.query.tranportType as TransportOptions }
        }


        let options: FindManyOptions<Order> = {
            order: { id: 'DESC' },
            where: ops,
            take: limit,
            skip: (offset - 1) * limit,
            relations: ['client', 'confirmedBy']
        }
        return this.repository.getPaginatedOrders(options);
    }

    async confirmOrder(id: Order['id']) {
        const order = await this.getOrderById(id);
        const products = await orderProductProvider.getProductsByOrderId(id);
        if (products.length == 0) throw new ConflictError("La orden no tiene productos asociados");
        const totals = OrderResource.orderTotals(products);

        if (order.status == 2) throw new ConflictError("La orden ya fue confirmada");
        // await emailService.sendOrderConfirmationEmail(order, products);
        return this.repository.confirmOrder(id, totals);
    }

    async confirmReceivedOrder(user: User, id: Order['id']) {
        const order = await this.getOrderById(id);
        const products = await orderProductProvider.getProductsByOrderId(id);
        if (products.length == 0) throw new ConflictError("La orden no tiene productos asociados");
        const totals = OrderResource.orderTotals(products);

        return this.repository.confirmReceivedOrder(user, id, totals);
    }

    async uploadFile(file: Express.Multer.File, user: User, year: number, week: number) {
        const dcs = await dcProvider.getDcs();
        const clients = await clientProvider.getClients();
        const text = await this.ia.uploadFile(file, dcs, clients);
        const { data } = OrdersIAResponseSchema.safeParse(text);

        const flatProductCodes = data.flatMap(order => order.products.map(product => product.code));

        const uniqueProductCodes = [...new Set(flatProductCodes)];

        const products = await productProvider.gerProductsByOptions({ relations: ['dc'], where: { internationalCode: In(uniqueProductCodes) } });

        const results: OrderMapperResult[] = [];
        for (const order of data) {
            const result = await this._processOrderInformation(order, user, clients, dcs, products, year, week);
            results.push(result);
        }

        return {
            total: results.length,
            success: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length,
            results
        };
    }

    async getOrderItemsByOrdersIds(orders: Order[]): Promise<OrderProduct[]> {
        const orderIds = orders.flatMap((order) => order.id);
        const items = await orderProductProvider.getItems(orderIds);
        return items;
    }

    async generateOrdersHeadersReport(week: number, year: number, user: User): Promise<ExcelJS.Buffer> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('headers');
        const orders = await this.getOrders(user, null, year, week);

        worksheet.columns = headersColumns;
        ExcelHandler.addRowsToHeaderWorksheet(orders, worksheet);

        return workbook.xlsx.writeBuffer();
    }

    async generateOrdersItemsReport(year: number, week: number, user: User): Promise<ExcelJS.Buffer> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('items');
        const orders = await this.getOrders(user, null, year, week);
        const items = await this.getOrderItemsByOrdersIds(orders);
        worksheet.columns = itemsColumns;

        ExcelHandler.addRowsItemsToWorksheet(items, worksheet);
        return workbook.xlsx.writeBuffer();
    }

    async generateOrdersDetailsReport(year: number, week: number, user: User): Promise<ExcelJS.Buffer> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('orders');
        worksheet.columns = orderDetailsColumns;
        worksheet.getRow(1).eachCell(formatCell);
        const orders = await this.getOrders(user, null, year, week);
        const items = await this.getOrderItemsByOrdersIds(orders);

        ExcelHandler.addRowsOrdersDetailsToWorksheet(items, worksheet);

        return workbook.xlsx.writeBuffer();;
    }

    async updateOrder(id: Order['id'], payload: UpdateOrderPayload) {
        if (!payload.requiredByDate) {
            throw new ConflictError('Required by date is mandatory');
        }
        const client = await clientProvider.getClientById(payload.client_id);
        payload.client = client;
        const dc = await dcProvider.getDcById(payload.dc_id);
        payload.dc = dc;

        return this.repository.updateOrder(id, payload);
    }

    async deleteOrder(id: Order['id']) {
        await this.getOrderById(id);
        await orderProductProvider.deleteOrderProducts(id);
        await this.repository.deleteOrder(id);

        return true;
    }
}