import { Order, User } from '../../entities/entities';
import { OrderDatasource, OrderRepository } from '../../domain/domain';
import { DeleteResult, FindManyOptions, UpdateResult } from 'typeorm';
import { ConfirmOrderPayload, CreateOrderPayload, UpdateOrderPayload } from '../../interfaces/interfaces';

export class OrderRepositoryImpl implements OrderRepository {
    constructor(private datasource: OrderDatasource) { }

    updateOrder(id: Order['id'], payload: UpdateOrderPayload): Promise<UpdateResult> {
        return this.datasource.updateOrder(id, payload);
    }

    deleteOrder(id: Order['id']): Promise<DeleteResult> {
        return this.datasource.deleteOrder(id);
    }

    confirmReceivedOrder(user: User, id: Order['id']): Promise<UpdateResult> {
        return this.datasource.confirmReceivedOrder(user, id);
    }

    getPaginatedOrders(options: FindManyOptions<Order>, user?: User): Promise<[Order[], total: number]> {
        return this.datasource.getPaginatedOrders(options);
    }

    confirmOrder(id: Order['id'], payload: ConfirmOrderPayload): Promise<UpdateResult> {
        return this.datasource.confirmOrder(id, payload);
    }

    getOrders(options: FindManyOptions<Order>): Promise<Order[]> {
        return this.datasource.getOrders(options);
    }

    getOrderById(id: Order['id']): Promise<Order> {
        return this.datasource.getOrderById(id);
    }

    createOrder(payload: CreateOrderPayload): Promise<Order> {
        return this.datasource.createOrder(payload);
    }

}