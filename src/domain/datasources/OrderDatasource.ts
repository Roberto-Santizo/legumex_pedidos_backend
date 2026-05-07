import { DeleteResult, FindManyOptions, UpdateResult } from "typeorm";
import { Order, User } from "../../entities/entities";
import { ConfirmOrderPayload, CreateOrderPayload, UpdateOrderPayload } from "../../interfaces/interfaces";

export abstract class OrderDatasource {
    abstract createOrder(payload: CreateOrderPayload): Promise<Order>;
    abstract updateOrder(id: Order['id'], payload: UpdateOrderPayload): Promise<UpdateResult>;
    abstract getOrderById(id: Order['id']): Promise<Order>;
    abstract getOrders(options: FindManyOptions<Order>): Promise<Order[]>;
    abstract getPaginatedOrders(options: FindManyOptions<Order>, user?: User): Promise<[Order[], total: number]>;
    abstract confirmOrder(id: Order['id'], payload: ConfirmOrderPayload): Promise<UpdateResult>;
    abstract confirmReceivedOrder(user: User, id: Order['id']): Promise<UpdateResult>;
    abstract deleteOrder(id: Order['id']): Promise<DeleteResult>;
}