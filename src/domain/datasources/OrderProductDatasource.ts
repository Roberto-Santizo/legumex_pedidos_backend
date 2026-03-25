import { DeleteResult } from "typeorm";
import { Order, OrderProduct } from "../../entities/entities";
import { OrderProductPayload } from "../../interfaces/interfaces";

export abstract class OrderProductDatasource {
    abstract createProduct(payload: OrderProductPayload): Promise<OrderProduct>;
    abstract getProductsByOrderId(id: Order['id']): Promise<OrderProduct[]>;
    abstract getItemById(id: OrderProduct['id']): Promise<OrderProduct>;
    abstract deleteItem(id: OrderProduct['id']): Promise<DeleteResult>;
}