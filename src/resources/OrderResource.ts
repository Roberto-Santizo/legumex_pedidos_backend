import { Order, OrderProduct } from '../entities/entities';

export class OrderResource {
    static orderDetails(order: Order) {
        return {
            id: order.id,
            status: order.status,
            customer: order.user.name + ' ' + order.user.lastName,
            email: order.user.email,
            dc_id: order.dc.id,
            dc: order.dc.name,
            po: order.po,
            client: order.client.name,
            client_id: order.client.id,
            transportType: order.transportType,
            date: order.date,
            confirmationDate: order.confirmationDate,
            requiredDate: order.requiredByDate,
            receviedConfirmatioDate: order.receviedConfirmatioDate,
            confirmedBy: order.confirmedBy ? order.confirmedBy.name + ' ' + order.confirmedBy.lastName : null
        }
    }

    static orderTotals(products: OrderProduct[]) {
        const total_boxes = products.reduce((ac, item) => ac = ac + item.total_boxes, 0);
        const total_price = products.reduce((ac, item) => ac = ac + (item.total_boxes) * item.product.price, 0);
        const total_lbs = products.reduce((ac, item) => ac = ac + (item.total_boxes) * item.product.presentation, 0);
        const total_pallets = products.reduce((acc, item) => acc = acc + (item.total_boxes / item.product.boxes_per_pallet), 0);
        return {
            total_boxes: total_boxes,
            total_price: +total_price.toFixed(2),
            total_lbs: +total_lbs.toFixed(2),
            total_pallets: total_pallets
        }
    }

    static orderProductItemDetails(product: OrderProduct) {
        return {
            id: product.id,
            total_boxes: product.total_boxes,
            total_lbs: (product.total_boxes * product.product.presentation),
            total_amount: (product.total_boxes) * product.product.price,
            total_pallets: (product.total_boxes / product.product.boxes_per_pallet),
            product: product.product.name,
            internationalCode: product.product.internationalCode,
            dc: product.product.dc
        }
    }

    static orderItem(product: OrderProduct) {
        return {
            id: product.id,
            total_boxes: product.total_boxes,
            product_id: product.product.id
        }
    }

    static orderJson(order: Order) {
        return {
            id: order.id,
            createdAt: order.date,
            user: order.user.name + ' ' + order.user.lastName,
            status: order.status,
            total_lbs: order.total_lbs,
            total_pallets: order.total_pallets,
            total_price: order.total_price,
            total_boxes: order.total_boxes,
            client: order.client.name,
            transportType: order.transportType,
            requiredByDate: order.requiredByDate,
            confirmedBy: order.confirmedBy != null ? order.confirmedBy.name : null,
            dc: order.dc.name
        }
    }

    static collection(orders: Order[]) {
        return orders.map((order) => this.orderJson(order));
    }

    static orderItemDetails(orders: OrderProduct[]) {
        return orders.map((order) => this.orderProductItemDetails(order));
    }
}