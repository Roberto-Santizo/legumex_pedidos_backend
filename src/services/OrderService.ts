import { Between, FindManyOptions, FindOptionsWhere } from "typeorm";
import { clientProvider } from "../providers/clientRepositoryProvider";
import { BadRequestError, ConflictError, NotFoundError } from "../infrastructure/infrastructure";
import { CreateOrderPayload } from "../interfaces/interfaces";
import { dcProvider } from "../providers/dcRepositoryProvider";
import { emailService } from '../providers/emailProvider';
import { getCurrentDate } from "../utils/date";
import { IAProvider } from "../domain/providers/IAProvider";
import { Order, User } from "../entities/entities";
import { OrderMapper } from "../infrastructure/mappers/OrderMapper";
import { orderProductProvider } from "../providers/orderProductRepositoryProvider";
import { OrderRepository } from "../domain/domain";
import { OrderResource } from "../resources/OrderResource";
import { OrderSchema, OrdersIAResponseSchema } from "../domain/schemas/schemas";
import { TransportOptions } from "../entities/Order";
import { productProvider } from "../providers/productRepositoryProvider";
import z from "zod";

export class OrderService {
    constructor(private repository: OrderRepository, private ia: IAProvider) { }

    _validateTransportType(type: TransportOptions) {
        if (!Object.values(TransportOptions).includes(type)) {
            throw new ConflictError("El tipo de transporte no existe");
        }
    }

    async _processOrderInformation(data: z.infer<typeof OrderSchema>, user: User) {
        if (data.dc == null) throw new BadRequestError('No sé pudo determinar el dc')
        if (data.client == null) throw new BadRequestError('No sé pudo determinar el cliente')

        const products = await productProvider.getProducts(null, null, data.dc.name);

        const transportType = await OrderMapper.getTransportType(data.dc.name, products);
        const order = OrderMapper.formatOrder(data);
        order.transportType = transportType;
        const newOrder = await this.createOrder(user, order);

        const formattedProducts = await OrderMapper.productsMapper(data.products, products, newOrder);
        await orderProductProvider.createProducts(formattedProducts);
    }

    async createOrder(user: User, payload: CreateOrderPayload) {
        this._validateTransportType(payload.transportType);
        const client = await clientProvider.getClientById(payload.client_id);

        payload.user = user;
        payload.client = client;

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

        for (const order of data) {
            await this._processOrderInformation(order, user);
        }

        return true;
    }
}