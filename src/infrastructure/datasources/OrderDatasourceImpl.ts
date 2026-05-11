import { ConfirmOrderPayload, CreateOrderPayload, UpdateOrderPayload } from "../../interfaces/interfaces";
import { DeleteResult, FindManyOptions, Repository, UpdateResult } from "typeorm";
import { getCurrentDate } from "../../utils/date";
import { OrderDatasource } from "../../domain/domain";
import { User, Order } from "../../entities/entities";
import appDatasource from "../../config/datasource";

export class OrderDatasourceImpl implements OrderDatasource {
    private repo: Repository<Order>;

    constructor() {
        this.repo = appDatasource.getRepository(Order);
    }

    updateOrder(id: Order['id'], payload: UpdateOrderPayload): Promise<UpdateResult> {
        const { client_id, dc_id, ...data } = payload;
        return this.repo.update({ id }, data);
    }

    deleteOrder(id: Order["id"]): Promise<DeleteResult> {
        return this.repo.delete({ id });
    }

    confirmReceivedOrder(user: User, id: Order["id"], payload: ConfirmOrderPayload): Promise<UpdateResult> {
        return this.repo.update({ id }, { status: 3, confirmedBy: user, receviedConfirmatioDate: getCurrentDate(), ...payload })
    }

    async getPaginatedOrders(options: FindManyOptions<Order>, user?: User): Promise<[Order[], number]> {
        const [data, total] = await this.repo.findAndCount(options);
        return [data, total];
    }

    confirmOrder(id: Order['id'], payload: ConfirmOrderPayload): Promise<UpdateResult> {
        return this.repo.update({ id }, { ...payload, status: 2, confirmationDate: getCurrentDate() })
    }

    getOrders(options: FindManyOptions<Order>): Promise<Order[]> {
        return this.repo.find(options);
    }

    getOrderById(id: Order["id"]): Promise<Order> {
        return this.repo.findOne({ where: { id }, relations: ['client', 'confirmedBy'] });
    }

    createOrder(payload: CreateOrderPayload): Promise<Order> {
        const { client_id, dc_id, ...data } = payload;
        return this.repo.save(data);
    }
}