import z from "zod";
import { OrderSchema } from "../schemas/schemas";

export type OrderResponse = z.infer<typeof OrderSchema>;