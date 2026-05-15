import { DateHandler } from './DateHandler';
import { Order } from '../entities/Order';
import { OrderProduct } from '../entities/OrderProduct';
import { OrderResource } from '../resources/OrderResource';
import ExcelJS from 'exceljs';

export class ExcelHandler {
    static addRowsToHeaderWorksheet(orders: Order[], worksheet: ExcelJS.Worksheet): void {
        orders.map(order => {
            worksheet.addRow({
                clientCode: order.client.code,
                documentType: '',
                po: order.po,
                client: `${order.client.name} ${order.week}-${order.year}`,
                currency: '',
                site: '1',
                warehouse: order.dc.warehouse,
                deliveryAddressName: order.dc.extended_name,
                deliveryDate: DateHandler.formatSpanishDate(order.requiredByDate),
                receiptDate: DateHandler.addDays(order.requiredByDate, 2),
            });
        });
    }

    static addRowsItemsToWorksheet(items: OrderProduct[], worksheet: ExcelJS.Worksheet) {
        items.map(item => {
            worksheet.addRow({
                order: '',
                po: item.order.po,
                productCode: item.product.auxCode,
                totalBoxes: item.total_boxes,
                totalPounds: item.total_boxes * item.product.presentation,
                unit: '',
                price: item.product.price,
                unitPrice: '',
                warehouse: item.order.dc.warehouse
            });
        });
    }

    static addRowsOrdersDetailsToWorksheet(items: OrderProduct[], worksheet: ExcelJS.Worksheet) {
        items.map(item => {
            const total_lbs = item.total_boxes * item.product.presentation;
            const total_pallets = item.total_boxes / item.product.boxes_per_pallet;

            worksheet.addRow({
                po: item.order.po,
                transportType: item.order.transportType,
                productName: item.product.name,
                warehouse: item.order.dc.warehouse,
                weight: total_lbs,
                pallets: total_pallets,
                productInternationalCode: item.product.internationalCode,
                supplierStock: item.supplierStock,
                dc: item.order.dc.extended_name,
                boxes: item.total_boxes
            });
        })
    }
}