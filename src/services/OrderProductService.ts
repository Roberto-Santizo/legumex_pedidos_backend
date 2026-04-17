import { OrderProductRepository } from "../domain/domain";
import { Order, OrderProduct } from "../entities/entities";
import { NotFoundError } from "../infrastructure/infrastructure";
import { OrderProductPayload } from "../interfaces/interfaces";
import { orderProvider } from "../providers/orderRepositoryProvider";
import { productProvider } from "../providers/productRepositoryProvider";

export class OrderProductService {
    constructor(private repository: OrderProductRepository) { }

    async createProduct(payload: OrderProductPayload, id: Order['id']) {
        const product = await productProvider.getProductById(payload.product_id);
        payload.product = product;
        const order = await orderProvider.getOrderById(id)
        payload.order = order;

        return this.repository.createProduct(payload);
    }

    async createProducts(payload: OrderProductPayload[]) {
        return this.repository.createProducts(payload);
    }

    async getProductsByOrderId(id: Order['id']) {
        return this.repository.getProductsByOrderId(id);
    }

    async getItemById(id: OrderProduct['id']) {
        const item = await this.repository.getItemById(id);
        if (!item) throw new NotFoundError('Item no encotrado');
        return item;
    }

    async updateItemById(id: Order['id'], itemId: OrderProduct['id'], payload: OrderProductPayload) {
        await this.getItemById(itemId);

        const product = await productProvider.getProductById(payload.product_id);
        payload.product = product;
        const order = await orderProvider.getOrderById(id)
        payload.order = order;


        return this.repository.updateItemById(itemId, payload);
    }

    async deleteOrderProductById(id: OrderProduct['id']) {
        await this.getItemById(id);
        return this.repository.deleteItem(id);
    }
}