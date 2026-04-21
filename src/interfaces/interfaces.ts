import { Order, Product, User, Client, Dc } from "../entities/entities";
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
    dc: Dc;
    transportType: TransportOptions;
}

export interface UpdateProductPricePayload {
    new_price: number;
    last_price: number;
    product: Product;
    createdAt: string;
}

export interface ProductFilters {
    limit: number;
    offset: number;
    client: string;
    internationalCode: string;
    localCode: string;
    name: string;
    dc: Dc['id'];
}


//ORDERS
export interface OrderProductPayload {
    product_id: Product['id'];
    product: Product;
    order: Order;
    total_boxes: number;
}

export interface CreateOrderProductPayload {
    products: OrderProductPayload[];
}

export interface CreateOrderPayload {
    date: string;
    dc_id: Dc['id'];
    dc: Dc;
    user: User;
    client_id: number;
    client: Client;
    transportType: TransportOptions;
    requiredByDate: string;
    createdAt: string;
    po: string;
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


//DC
export interface CreateOrUpdateDc {
    name: string;
    client_id: Client['id'];
    client: Client;
    code: string;
}

//ERRORS
export interface OrderMapperResult {
    success: boolean;
    message: string;
}