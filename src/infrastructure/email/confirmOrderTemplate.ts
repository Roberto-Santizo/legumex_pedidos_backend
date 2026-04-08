import { Order, OrderProduct } from "../../entities/entities";

export class OrderConfirmationTemplate {
    static build(order: Order, products: OrderProduct[]): string {

        const total = products.reduce((acc, item) => acc + (item.total_boxes || 0), 0);

        const orderUrl = `${process.env.FRONTEND_URL}/my-orders/${order.id}`;

        const rows = products.map(p => `
            <tr>
                <td style="padding:10px; border-bottom:1px solid #e2e8f0;">
                    ${p.product?.name ?? 'Product'}
                </td>
                <td align="center" style="padding:10px; border-bottom:1px solid #e2e8f0;">
                    ${p.total_boxes}
                </td>
            </tr>
        `).join('');

        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Order Confirmation</title>
        </head>

        <body style="margin:0; padding:0; background-color:#f8fafc; font-family: Arial, Helvetica, sans-serif;">
            
            <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
                <tr>
                    <td align="center">
                        
                        <table width="600" cellpadding="0" cellspacing="0"
                            style="background-color:#ffffff; border-radius:12px; padding:40px;">

                            <!-- Logo -->
                            <tr>
                                <td align="center" style="padding-bottom:30px;">
                                    <img 
                                        src=${process.env.LOGO_URL} 
                                        alt="Company Logo"
                                        width="160"
                                    />
                                </td>
                            </tr>

                            <!-- Title -->
                            <tr>
                                <td align="center" style="padding-bottom:20px;">
                                    <h1 style="margin:0; font-size:22px; color:#0f172a;">
                                        Order Confirmation
                                    </h1>
                                </td>
                            </tr>

                            <!-- Intro -->
                            <tr>
                                <td style="font-size:14px; color:#475569; padding-bottom:20px;">
                                    <p style="margin:0 0 10px 0;">
                                        Thank you for your order! Your order has been successfully received.
                                    </p>
                                    <p style="margin:0;">
                                        You can view your order details at any time using the button below:
                                    </p>
                                </td>
                            </tr>

                            <tr>
                                <td align="center" style="padding:25px 0;">
                                    <a href="${orderUrl}" target="_blank"
                                        style="
                                            background-color:#0ea5e9;
                                            color:#ffffff;
                                            text-decoration:none;
                                            padding:14px 28px;
                                            border-radius:8px;
                                            font-size:14px;
                                            font-weight:bold;
                                            display:inline-block;
                                        ">
                                        View Order
                                    </a>
                                </td>
                            </tr>

                            <!-- Order Info -->
                            <tr>
                                <td style="font-size:14px; color:#475569; padding-bottom:20px;">
                                    <p><strong>Order #:</strong> ${order.id}</p>
                                    <p><strong>Date:</strong> ${order.createdAt.toLocaleDateString()}</p>
                                    <p><strong>Customer:</strong> ${order.user?.name ?? ''}</p>
                                </td>
                            </tr>

                            <!-- Products Table -->
                            <tr>
                                <td>
                                    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                                        <thead>
                                            <tr style="background-color:#f1f5f9;">
                                                <th align="left" style="padding:10px;">Product</th>
                                                <th align="center" style="padding:10px;">Boxes</th>
                                                <th align="center" style="padding:10px;">PO</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${rows}
                                        </tbody>
                                    </table>
                                </td>
                            </tr>

                            <!-- Total -->
                            <tr>
                                <td style="padding-top:20px; text-align:right; font-size:16px;">
                                    <strong>Total Boxes: ${total}</strong>
                                </td>
                            </tr>

                            <!-- Footer -->
                            <tr>
                                <td style="padding-top:30px;">
                                    <hr style="border:none; border-top:1px solid #e2e8f0;" />
                                </td>
                            </tr>

                            <tr>
                                <td align="center" style="font-size:12px; color:#94a3b8;">
                                    © ${new Date().getFullYear()} Agroindustria Legumex, S.A<br/>
                                    All rights reserved.
                                </td>
                            </tr>

                        </table>

                    </td>
                </tr>
            </table>

        </body>
        </html>
        `;
    }
}