import z from "zod";

export const ProductSchema = z.object({
    quantity: z.number(),
    code: z.string()
});

export const OrderSchema = z.object({
    client: z.object({
        id: z.number(),
        name: z.string()
    }).nullable(),
    po: z.string(),
    dc: z.object({
        id: z.number(),
        name: z.string(),
    }).nullable(),

    products: z.array(ProductSchema)
});

export const OrdersIAResponseSchema = z.array(OrderSchema);