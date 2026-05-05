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
        };
        if (filters.carrierId) where.carrier = { id: filters.carrierId };
        if (filters.dc) where.dc = filters.dc;
        if (filters.status) where.status = filters.status;

        const containers = await repo.find({
            where,
            relations: ['carrier', 'carrier.dc', 'createdBy', 'confirmedBy'],
            order: { weekStart: 'ASC', dc: 'ASC' },
        });

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet("Transport Cost");

        sheet.columns = [
            { header: "ID",             key: "id",           width: 8  },
            { header: "DC",             key: "dc",           width: 20 },
            { header: "Transport Type", key: "transportType",width: 16 },
            { header: "Week Start",     key: "weekStart",    width: 14 },
            { header: "Week End",       key: "weekEnd",      width: 14 },
            { header: "Status",         key: "status",       width: 12 },
            { header: "Carrier",        key: "carrier",      width: 24 },
            { header: "Shipping Cost",  key: "shippingCost", width: 14 },
            { header: "Total Pallets",  key: "totalPallets", width: 14 },
            { header: "Total Pounds",   key: "totalPounds",  width: 14 },
            { header: "Total Orders",   key: "totalOrders",  width: 13 },
        ];

        // Style header row
        sheet.getRow(1).font = { bold: true };
        sheet.getRow(1).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF00C853" },
        };
        sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };

        for (const c of containers) {
            sheet.addRow({
                id:           c.id,
                dc:           c.dc,
                transportType: c.transportType,
                weekStart:    c.weekStart,
                weekEnd:      c.weekEnd,
                status:       c.status,
                carrier:      c.carrier?.name ?? "—",
                shippingCost: c.carrierCostSnapshot != null
                    ? Number(c.carrierCostSnapshot)
                    : (c.carrier ? Number(c.carrier.shippingCost) : null),
                totalPallets: c.totalPallets,
                totalPounds:  c.totalPounds,
                totalOrders:  c.totalOrders,
            });
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