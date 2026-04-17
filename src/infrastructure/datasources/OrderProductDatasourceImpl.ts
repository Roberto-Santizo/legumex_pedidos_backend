import { DeleteResult, Repository, UpdateResult } from "typeorm";
import { InsertResult } from "typeorm/browser";
import { Order, OrderProduct } from "../../entities/entities";
import { OrderProductDatasource } from "../../domain/domain";
import { OrderProductPayload } from "../../interfaces/interfaces";
import appDatasource from "../../config/datasource";

export class OrderProductDatasourceImpl implements OrderProductDatasource {

    private repo: Repository<OrderProduct>;

    constructor() {
        this.repo = appDatasource.getRepository(OrderProduct);
    }

    updateItemById(id: OrderProduct["id"], payload: OrderProductPayload): Promise<UpdateResult> {
        const { product_id, ...data } = payload;
        return this.repo.update({ id: id }, data);
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

    createProducts(payload: OrderProductPayload[]): Promise<InsertResult> {
        const data = payload.map(({ product_id, ...rest }) => rest);
        return this.repo.insert(data);
    }

}