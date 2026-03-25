import { EmailProvider } from "../domain/domain";
import { Order, OrderProduct } from "../entities/entities";

export class EmailService {
    private emailProvider: EmailProvider;

    constructor(emailProvider: EmailProvider) {
        this.emailProvider = emailProvider;
    }

    async sendOrderConfirmationEmail(order: Order, products: OrderProduct[]): Promise<void> {
        await this.emailProvider.sendConfirmationOrderEmail(order, products);
    }
}