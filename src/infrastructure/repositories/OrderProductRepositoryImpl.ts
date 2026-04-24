import { DeleteResult, FindManyOptions, InsertResult, UpdateResult } from 'typeorm';
import { OrderProductDatasource, OrderProductRepository } from '../../domain/domain';
import { Order, OrderProduct } from '../../entities/entities';
import { OrderProductPayload } from '../../interfaces/interfaces';

export class OrderProductRepositoryImpl implements OrderProductRepository {
    constructor(private datasource: OrderProductDatasource) { }

    getItems(options: FindManyOptions<OrderProduct>): Promise<OrderProduct[]> {
        return this.datasource.getItems(options);
    }

    createProducts(payload: OrderProductPayload[]): Promise<InsertResult> {
        return this.datasource.createProducts(payload);
    }

    updateItemById(id: OrderProduct['id'], payload: OrderProductPayload): Promise<UpdateResult> {
        return this.datasource.updateItemById(id, payload);
    }

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