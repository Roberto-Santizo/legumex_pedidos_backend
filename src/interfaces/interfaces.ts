import { Order, Product, User, Client } from "../entities/entities";
import { TransportOptions } from "../entities/Order";

//LOGIN FORM
export interface LoginFormPayload {
    email: string;
    password: string;
}

//USER FORM
export interface CreateOrUpdateUserPayload {
    name: string;
    lastName: string;
    email: string;
    role: string;
    password: string;
    clients: string[]
}

//PRODUCTS
export interface CreateOrUpdateProductPayload {
    name: string;
    localCode: string;
    internationalCode: string;
    price: number;
    presentation: number;
    client_id: number;
    units_per_box: number;
    boxes_per_pallet: number;
    client: Client;
}


//ORDERS
export interface OrderProductPayload {
    product_id: Product['id'];
    product: Product;
    order: Order;
    total_boxes: number;
    po: string;
}

export interface CreateOrderProductPayload {
    products: OrderProductPayload[];
}

export interface CreateOrderPayload {
    date: string;
    dc: string;
    user: User;
    client_id: number;
    client: Client;
    transportType: TransportOptions;
    requiredByDate: string;
    createdAt: string;
}

export interface ConfirmOrderPayload {
    total_boxes: number,
    total_price: number;
    total_lbs: number,
    total_pallets: number
}

//USER CLIENTS
export interface AddUserClientPayload {
    client: Client;
    user: User;
}