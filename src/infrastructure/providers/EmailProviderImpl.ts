import { EmailProvider } from '../../domain/domain';
import { MailtrapTransport } from 'mailtrap';
import { Order } from '../../entities/Order';
import { OrderConfirmationTemplate } from '../email/confirmOrderTemplate';
import { OrderProduct } from '../../entities/OrderProduct';
import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

export class EmailProviderImpl implements EmailProvider {

    private mailtrapClient: Transporter;

    constructor() {
        this.mailtrapClient = nodemailer.createTransport(
            MailtrapTransport({
                token: process.env.EMAIL_TOKEN || '',
                sandbox: true,
                testInboxId: parseInt(process.env.TEST_INBOX_ID || '0', 10),
            })
        );
    }
    async sendConfirmationOrderEmail(order: Order, products: OrderProduct[]): Promise<void> {
        await this.mailtrapClient.sendMail({
            from: { address: "legumexorders@example.com", name: "Mailtrap Test" },
            to: [order.user.email, process.env.USER_EMAIL],
            subject: "Order Confirmation",
            html: OrderConfirmationTemplate.build(order, products),
        });
    }
}