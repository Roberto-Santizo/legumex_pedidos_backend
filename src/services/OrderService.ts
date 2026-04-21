import { BadRequestError, ConflictError, NotFoundError } from "../infrastructure/infrastructure";
import { Between, FindManyOptions, FindOptionsWhere } from "typeorm";
import { clientProvider } from "../providers/clientRepositoryProvider";
import { CreateOrderPayload, OrderMapperResult } from "../interfaces/interfaces";
import { dcProvider } from "../providers/dcRepositoryProvider";
import { emailService } from '../providers/emailProvider';
import { IAProvider } from "../domain/providers/IAProvider";
import { Order, Product, User } from "../entities/entities";
import { OrderMapper } from "../infrastructure/mappers/OrderMapper";
import { orderProductProvider } from "../providers/orderProductRepositoryProvider";
import { OrderRepository } from "../domain/domain";
import { OrderResource } from "../resources/OrderResource";
import { OrderSchema, OrdersIAResponseSchema, ProductSchema } from "../domain/schemas/schemas";
import { productProvider } from "../providers/productRepositoryProvider";
import { TransportOptions } from "../entities/Order";
import z from "zod";

export class OrderService {
    constructor(private repository: OrderRepository, private ia: IAProvider) { }

    _validateTransportType(type: TransportOptions) {
        if (!Object.values(TransportOptions).includes(type)) {
            throw new ConflictError("El tipo de transporte no existe");
        }
    }

    async _validateOrderProducts(orderProducts: z.infer<typeof ProductSchema>[], products: Product[]): Promise<OrderMapperResult[]> {
        return await OrderMapper.validateProducts(orderProducts, products);
    }

    async _validateOrderInformation(data: z.infer<typeof OrderSchema>, products: Product[]) {
        if (products.length == 0) {
            throw new BadRequestError(`No se encontraron productos para el DC ${data.dc.name}`);
        }

        const firstProduct = await OrderMapper.getTransportType(products, data.products[0].code);

        if (!firstProduct) {
            throw new BadRequestError(`No se pudo determinar el tipo de transporte para la orden con PO ${data.po}`);
        }

        return firstProduct.transportType;
    }

    async _processOrderInformation(data: z.infer<typeof OrderSchema>, user: User): Promise<OrderMapperResult> {
        try {
            const products = await productProvider.getProducts(null, null, data.dc.id);
            const dc = await dcProvider.getDcById(data.dc.id);
            const client = await clientProvider.getClientById(data.client.id);

            if (!dc) throw new NotFoundError(`El DC de la PO ${data.po} no existe`);
            if (!client) throw new NotFoundError(`El cliente de la PO ${data.po} no existe`);

            const errors = await this._validateOrderProducts(data.products, products);

            if (errors.length > 0) {
                return { success: false, message: `La orden con PO ${data.po} tiene productos no válidos: ${errors.map(e => e.message).join(', ')}` }
            }

            const transportType = await this._validateOrderInformation(data, products);

            const order = OrderMapper.formatOrder(data, transportType, dc);
            const newOrder = await this.createOrder(user, order);
            const orderProducts = await OrderMapper.productsMapper(data.products, products, newOrder);
            await orderProductProvider.createProducts(orderProducts);

            return { success: true, message: `Orden con PO ${data.po} procesada correctamente` }
        } catch (error) {
            return { success: false, message: `${error.message}` }
        }
    }

    async createOrder(user: User, payload: CreateOrderPayload) {
        this._validateTransportType(payload.transportType);
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

    async getOrders(user: User, clientId?: string, startDate?: string, endDate?: string) {
        let options: FindManyOptions<Order> = { relations: ['client', 'confirmedBy'] }

        if (user.role === 'client') {
            options = { ...options, where: { user: { id: user.id } } }
        }

        if (clientId) {
            options = { ...options, where: { ...options.where, client: { id: +clientId } } }
        }

        if (startDate && endDate) {
            options = { ...options, where: { ...options.where, createdAt: Between(new Date(startDate), new Date(endDate)) } }
        }

        return this.repository.getOrders(options);
    }

    async getPaginatedOrders(user: User, limit?: number, offset?: number) {
        const ops: FindOptionsWhere<Order> = user.role == 'client' ? { user: { id: user.id } } : {}
        let options: FindManyOptions<Order> = {
            order: { id: 'ASC' },
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
        await emailService.sendOrderConfirmationEmail(order, products);
        return this.repository.confirmOrder(id, totals);
    }

    async confirmReceivedOrder(user: User, id: Order['id']) {
        const order = await this.getOrderById(id);
        if (order.status == 3) throw new ConflictError("La orden ya fue confirmada de recibida");
        return this.repository.confirmReceivedOrder(user, id);
    }

    async uploadFile(file: Express.Multer.File, user: User) {
        const dcs = await dcProvider.getDcs();
        const clients = await clientProvider.getClients();

        const text = await this.ia.uploadFile(file, dcs, clients);
        const { data } = OrdersIAResponseSchema.safeParse(text);

        const results: OrderMapperResult[] = [];

        for (const order of data) {
            const result = await this._processOrderInformation(order, user);
            results.push(result);
        }

        return {
            total: results.length,
            success: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length,
            results
        };
    }
}