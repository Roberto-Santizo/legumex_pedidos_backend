import { DeleteResult, FindManyOptions } from "typeorm";
import { Order, OrderProduct } from "../../entities/entities";
import { OrderProductPayload } from "../../interfaces/interfaces";
import { UpdateResult, InsertResult } from "typeorm/browser";

export abstract class OrderProductDatasource {
    abstract createProduct(payload: OrderProductPayload): Promise<OrderProduct>;
    abstract createProducts(payload: OrderProductPayload[]): Promise<InsertResult>;
    abstract getProductsByOrderId(id: Order['id']): Promise<OrderProduct[]>;
    abstract getItemById(id: OrderProduct['id']): Promise<OrderProduct>;
    abstract updateItemById(id: OrderProduct['id'], payload: OrderProductPayload): Promise<UpdateResult>;
    abstract deleteItem(id: OrderProduct['id']): Promise<DeleteResult>;
    abstract getItems(options: FindManyOptions<OrderProduct>): Promise<OrderProduct[]>;
}