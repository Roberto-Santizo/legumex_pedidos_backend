import ExcelJS from "exceljs";
import appDatasource from "../config/datasource";
import { Container } from "../entities/Container";
import { Between } from "typeorm";

export interface ContainerReportFilters {
    from: string;
    to: string;
    carrierId?: number;
    dc?: string;
}

export class ContainerCarrierExcelReport {
    async generate(filters: ContainerReportFilters): Promise<ExcelJS.Workbook> {
        const repo = appDatasource.getRepository(Container);

        const where: Record<string, unknown> = {
            weekStart: Between(filters.from, filters.to),
            status: 'confirmed',
        };
        if (filters.carrierId) where.carrier = { id: filters.carrierId };

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

        // Filter by DC through the orders (a container matches if any of its orders belongs to that DC)
        const filtered = filters.dc
            ? containers.filter((container) =>
                  container.containerOrders.some((co) => co.order?.dc?.name === filters.dc),
              )
            : containers;

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

        sheet.getRow(1).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF00C853" },
        };
        sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };

        for (const container of filtered) {
            const carrierName = container.carrier?.name ?? "—";
            const shippingCost = container.carrierCostSnapshot != null
                ? Number(container.carrierCostSnapshot)
                : (container.carrier ? Number(container.carrier.shippingCost) : null);

            for (const containerOrder of container.containerOrders) {
                const order = containerOrder.order;
                sheet.addRow({
                    containerId:    `C-${container.id}`,
                    po:             order.po ?? "—",
                    client:         order.client?.name ?? "—",
                    dc:             order.dc?.name ?? "—",
                    warehouse:      order.dc?.warehouse ?? "—",
                    transportType:  container.transportType,
                    requiredByDate: order.requiredByDate
                        ? new Date(order.requiredByDate).toISOString().slice(0, 10)
                        : "—",
                    totalPallets:   order.total_pallets,
                    totalPounds:    order.total_lbs,
                    carrier:        carrierName,
                    shippingCost:   shippingCost,
                    deliveryDate:   container.deliveryDate ?? "",
                    deliveryTime:   container.deliveryTime ?? "",
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
