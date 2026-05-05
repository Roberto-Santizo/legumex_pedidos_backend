import { Request, Response } from "express";
import { errorHandler } from "../helpers/httpHelpers";
import { ReportService } from "../services/ReportService";

export abstract class ReportController {
    static async getTransportCostReport(req: Request, res: Response) {
        try {
            const { from, to, carrierId, dc, status } = req.query as Record<string, string>;
            if (!from || !to) {
                res.status(400).json({ message: "from and to query params are required" });
                return;
            }
            const service = new ReportService();
            const workbook = await service.getTransportCostReport({
                from,
                to,
                carrierId: carrierId ? Number(carrierId) : undefined,
                dc:        dc        || undefined,
                status:    status    || undefined,
            });

            res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            res.setHeader("Content-Disposition", `attachment; filename=transport_cost_${from}_${to}.xlsx`);
            await workbook.xlsx.write(res);
            res.end();
        } catch (error) {
            errorHandler(error, res);
        }
    }

    static async getOrdersReportByClientDate(req: Request, res: Response) {
        try {
            const service = new ReportService();
            const workbook = await service.getOrdersReportByClientDate();

            res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

            res.setHeader("Content-Disposition", "attachment; filename=reporte.xlsx");

            await workbook.xlsx.write(res);

            res.end();
        } catch (error) {
            errorHandler(error, res);
        }
    }
}