import { Order, OrderProduct } from "../../entities/entities";

export abstract class EmailProvider {
    abstract sendConfirmationOrderEmail(order: Order, products: OrderProduct[]): Promise<void>;
}