import { header } from "express-validator";
import ExcelJS from 'exceljs';

export const itemsColumns = [
    { header: 'Orden de venta', key: 'order', width: 10 },
    { header: 'Po', key: 'po', width: 10 },
    { header: 'Articulo', key: 'productCode', width: 10 },
    { header: 'CantidadPC', key: 'totalBoxes', width: 10 },
    { header: 'Cantidad', key: 'totalPounds', width: 10 },
    { header: 'Unidad Medida', key: 'unit', width: 10 },
    { header: 'Precio Venta', key: 'price', width: 10 },
    { header: 'Precio Unitario', key: 'unitPrice', width: 10 },
    { header: 'Almacen', key: 'warehouse', width: 10 }
];

export const headersColumns = [
    { header: 'Codigo de Cliente', key: 'clientCode', width: 10 },
    { header: 'Tipo de documento', key: 'documentType', width: 10 },
    { header: 'Orden de Cliente', key: 'po', width: 10 },
    { header: 'Referencia de Cliente', key: 'client', width: 10 },
    { header: 'Moneda', key: 'currency', width: 10 },
    { header: 'Sitio', key: 'site', width: 10 },
    { header: 'Almacen', key: 'warehouse', width: 10 },
    { header: 'Nombre dirección de entrega', key: 'deliveryAddressName', width: 10 },
    { header: 'Fecha de envío solicitada', key: 'deliveryDate', width: 10 },
    { header: 'Fecha de recepción solicitada', key: 'receiptDate', width: 10 },
];

export const orderDetailsColumns: Partial<ExcelJS.Column>[] = [
    { header: 'Po', key: 'po', width: 10 },
    { header: 'Dc', key: 'dc', width: 10 },
    { header: 'Transport Type', key: 'transportType', width: 10 },
    { header: 'Product', key: 'productName', width: 10 },
    { header: 'Warehouse', key: 'warehouse', width: 10 },
    { header: 'Weight', key: 'weight', width: 10 },
    { header: 'Pallets', key: 'pallets', width: 10 },
    { header: 'International Code', key: 'productInternationalCode', width: 10 },
    { header: 'Supplier Stock', key: 'supplierStock', width: 10 },
    { header: 'Boxes', key: 'boxes', width: 10 },
    { header: 'Date', key: 'date', width: 10 },
];