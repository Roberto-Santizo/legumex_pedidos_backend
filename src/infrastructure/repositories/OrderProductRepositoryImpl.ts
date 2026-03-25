import { DeleteResult } from 'typeorm';
import { OrderProductDatasource, OrderProductRepository } from '../../domain/domain';
import { Order, OrderProduct } from '../../entities/entities';
import { OrderProductPayload } from '../../interfaces/interfaces';

export class OrderProductRepositoryImpl implements OrderProductRepository {
    constructor(private datasource: OrderProductDatasource) { }

    getItemById(id: OrderProduct['id']): Promise<OrderProduct> {
        return this.datasource.getItemById(id);
    }

    deleteItem(id: OrderProduct['id']): Promise<DeleteResult> {
        return this.datasource.deleteItem(id);
    }

    getProductsByOrderId(id: Order['id']): Promise<OrderProduct[]> {
        return this.datasource.getProductsByOrderId(id);
    }

    createProduct(payload: OrderProductPayload): Promise<OrderProduct> {
        return this.datasource.createProduct(payload);
    }

}