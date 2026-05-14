import { CreateOrderPayload, OrderMapperResult, OrderProductPayload } from "../../interfaces/interfaces";
import { getCurrentDate } from "../../utils/date";
import { NotFoundError } from "../infrastructure";
import { Order, TransportOptions } from "../../entities/Order";
import { OrderSchema, ProductSchema } from "../../domain/schemas/schemas";
import { Dc, Product } from "../../entities/entities";
import z from "zod";

export class OrderMapper {
    static formatOrder(order: z.infer<typeof OrderSchema>, transportType: TransportOptions, dc: Dc, year: number, week: number): CreateOrderPayload {
        return {
            client_id: order.client.id,
            client: null,
            dc: dc,
            dc_id: dc.id,
            po: order.po,
            transportType: transportType,
            date: getCurrentDate(),
            createdAt: getCurrentDate(),
            requiredByDate: order.required_delivery_date ?? getCurrentDate(),
            user: null,
            year,
            week
        }
    }

    static async getTransportType(products: Product[], firstProductCode: string): Promise<Product> {
        const product = products.filter((product) => (product.internationalCode == firstProductCode))[0];
        return product;
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
                total_boxes: item.quantity,
                supplierStock: item.supplierStock
            }

            formattedProducts.push(newItem);
        }

        return formattedProducts;
    }

    static async validateProducts(orderProducts: z.infer<typeof ProductSchema>[], products: Product[]) {
        const errors: OrderMapperResult[] = [];

        for (const item of orderProducts) {
            const product = products.find((product) => (product.internationalCode == item.code));
            if (!product) {
                errors.push({ success: false, message: `El producto con código ${item.code} no existe` });
            }
        }

        return errors;
    }
}