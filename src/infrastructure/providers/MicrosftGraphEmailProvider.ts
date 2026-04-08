import { ClientSecretCredential } from "@azure/identity";
import { EmailProvider } from "../../domain/domain";
import { Order, OrderProduct } from "../../entities/entities";
import { Client } from '@microsoft/microsoft-graph-client';
import { OrderConfirmationTemplate } from "../email/confirmOrderTemplate";

export class MicrosoftGraphEmailProvider implements EmailProvider {
    private client: Client;

    constructor() {
        const credential = new ClientSecretCredential(process.env.MICROSOFT_TENANT_ID, process.env.MICROSOFT_CLIENT_ID, process.env.MICROSOFT_CLIENT_SECRET);
        this.client = Client.initWithMiddleware({
            authProvider: {
                getAccessToken: async () => {
                    const token = await credential.getToken("https://graph.microsoft.com/.default");
                    return token.token;
                }
            }
        });
    }


    async sendConfirmationOrderEmail(order: Order, products: OrderProduct[]): Promise<void> {
        await this.client.api(`/users/${process.env.NOREPLY_USER}/sendMail`).post({
            message: {
                subject: "Order Confirmation",
                body: { contentType: "HTML", content: OrderConfirmationTemplate.build(order, products) },
                toRecipients: [{ emailAddress: { address: process.env.ORDER_COMFIRMATION_EMAIL } }, { emailAddress: { address: order.user.email } }]
            },
        });
    }

}