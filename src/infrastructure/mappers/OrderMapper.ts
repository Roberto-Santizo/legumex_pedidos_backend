import { CreateOrderPayload, OrderProductPayload } from "../../interfaces/interfaces";
import { getCurrentDate } from "../../utils/date";
import { OrderSchema, ProductSchema } from "../../domain/schemas/schemas";
import { Product } from "../../entities/entities";
import { Order, TransportOptions } from "../../entities/Order";
import z from "zod";
import { NotFoundError } from "../infrastructure";

export class OrderMapper {
    static formatOrder(order: z.infer<typeof OrderSchema>): CreateOrderPayload {
        return {
            client_id: order.client.id,
            client: null,
            dc: order.dc.name,
            po: order.po,
            transportType: TransportOptions.COLLECT,
            date: getCurrentDate(),
            createdAt: getCurrentDate(),
            requiredByDate: getCurrentDate(),
            user: null
        }
    }

    static async getTransportType(dc: string, products: Product[], firstProductCode: string): Promise<TransportOptions> {
        const transportType  = products.filter((product) => (product.internationalCode == firstProductCode))[0].transportType;
        if(transportType == null) throw new NotFoundError(`No se pudo determinar el tipo de transporte de la orden ${firstProductCode}`);
        return transportType;
    }

    static async productsMapper(orderProducts: z.infer<typeof ProductSchema>[], products: Product[], order: Order): Promise<OrderProductPayload[]> {
        let formattedProducts: OrderProductPayload[] = [];

        for (const item of orderProducts) {
            const product = products.filter((product) => (product.internationalCode == item.code && product.transportType == order.transportType))[0];
            if (!product) throw new NotFoundError(`El producto ${item.code} no existe`);

            const newItem: OrderProductPayload = {
                order,
                product: product,
                product_id: product.id,
                total_boxes: item.quantity
            }

            formattedProducts.push(newItem);
        }
        
        return formattedProducts;
    }
}