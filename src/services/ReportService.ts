import ExcelJS from "exceljs";
import appDatasource from "../config/datasource";
import { Container } from "../entities/Container";
import { Between } from "typeorm";

export interface TransportCostReportFilters {
    from: string;
    to: string;
    carrierId?: number;
    dc?: string;
    status?: string;
}

export class ReportService {
    async getTransportCostReport(filters: TransportCostReportFilters): Promise<ExcelJS.Workbook> {
        const repo = appDatasource.getRepository(Container);

        const where: Record<string, unknown> = {
            weekStart: Between(filters.from, filters.to),
            status: 'confirmed', // only confirmed containers appear in the report — drafts can still be deleted
        };
        if (filters.carrierId) where.carrier = { id: filters.carrierId };
        if (filters.dc) where.dc = filters.dc;

        const containers = await repo.find({
            where,
            relations: [
                'carrier',
                'createdBy',
                'confirmedBy',
                'containerOrders',
                'containerOrders.order',
                'containerOrders.order.dc',
                'containerOrders.order.client',
            ],
            order: { weekStart: 'ASC', id: 'ASC' },
        });

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet("Transport Cost");

        sheet.columns = [
            { header: "Container",      key: "containerId",   width: 12 },
            { header: "PO",             key: "po",            width: 18 },
            { header: "Client",         key: "client",        width: 24 },
            { header: "DC",             key: "dc",            width: 20 },
            { header: "Warehouse",      key: "warehouse",     width: 16 },
            { header: "Transport Type", key: "transportType", width: 16 },
            { header: "Required By",    key: "requiredByDate",width: 16 },
            { header: "Total Pallets",  key: "totalPallets",  width: 14 },
            { header: "Total Pounds",   key: "totalPounds",   width: 14 },
            { header: "Carrier",        key: "carrier",       width: 24 },
            { header: "Shipping Cost",  key: "shippingCost",  width: 14 },
            { header: "Delivery Date",  key: "deliveryDate",  width: 14 },
            { header: "Delivery Time",  key: "deliveryTime",  width: 14 },
        ];

        // Style header row
        sheet.getRow(1).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF00C853" },
        };
        sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };

        for (const c of containers) {
            const carrierName = c.carrier?.name ?? "—";
            const shippingCost = c.carrierCostSnapshot != null
                ? Number(c.carrierCostSnapshot)
                : (c.carrier ? Number(c.carrier.shippingCost) : null);

            for (const co of c.containerOrders) {
                const order = co.order;
                sheet.addRow({
                    containerId:    `C-${c.id}`,
                    po:             order.po ?? "—",
                    client:         order.client?.name ?? "—",
                    dc:             order.dc?.name ?? "—",
                    warehouse:      order.dc?.warehouse ?? "—",
                    transportType:  c.transportType,
                    requiredByDate: order.requiredByDate
                        ? new Date(order.requiredByDate).toISOString().slice(0, 10)
                        : "—",
                    totalPallets:   order.total_pallets,
                    totalPounds:    order.total_lbs,
                    carrier:        carrierName,
                    shippingCost:   shippingCost,
                    deliveryDate:   c.deliveryDate ?? "",
                    deliveryTime:   c.deliveryTime ?? "",
                });
            }
        }

        return workbook;
    }

    async getOrdersReportByClientDate(): Promise<ExcelJS.Workbook> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Reporte");

        worksheet.columns = [
            { header: "Nombre", key: "name", width: 30 },
            { header: "Edad", key: "age", width: 10 },
        ];

        worksheet.addRow({ name: "Juan", age: 25 });
        worksheet.addRow({ name: "Ana", age: 30 });

        return workbook;
    }
}