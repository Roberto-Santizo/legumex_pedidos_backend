import { Order, OrderProduct } from "../../entities/entities";
import { OrderProductDatasource } from "../../domain/domain";
import { OrderProductPayload } from "../../interfaces/interfaces";
import { DeleteResult, Repository } from "typeorm";
import appDatasource from "../../config/datasource";

export class OrderProductDatasourceImpl implements OrderProductDatasource {

    private repo: Repository<OrderProduct>;

    constructor() {
        this.repo = appDatasource.getRepository(OrderProduct);
    }

    getItemById(id: OrderProduct["id"]): Promise<OrderProduct> {
        return this.repo.findOneBy({ id });
    }

    deleteItem(id: OrderProduct["id"]): Promise<DeleteResult> {
        return this.repo.delete({ id });
    }

    getProductsByOrderId(id: Order["id"]): Promise<OrderProduct[]> {
        return this.repo.find({ where: { order: { id } } });
    }

    createProduct(payload: OrderProductPayload): Promise<OrderProduct> {
        const { product_id, ...data } = payload;
        return this.repo.save(data);
    }

}