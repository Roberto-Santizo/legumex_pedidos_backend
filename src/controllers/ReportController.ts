import { Request, Response } from "express";
import { errorHandler } from "../helpers/httpHelpers";
import { ContainerCarrierExcelReport } from "../services/ContainerCarrierExcelReport";

export abstract class ReportController {
    static async getTransportCostReport(req: Request, res: Response) {
        try {
            const { from, to, carrierId, dc } = req.query as Record<string, string>;
            if (!from || !to) {
                res.status(400).json({ message: "from and to query params are required" });
                return;
            }
            const report = new ContainerCarrierExcelReport();
            const workbook = await report.generate({
                from,
                to,
                carrierId: carrierId ? Number(carrierId) : undefined,
                dc:        dc        || undefined,
            });

            res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            res.setHeader("Content-Disposition", `attachment; filename=transport_cost_${from}_${to}.xlsx`);
            await workbook.xlsx.write(res);
            res.end();
        } catch (error) {
            errorHandler(error, res);
        }
    }

    static async getOrdersReportByClientDate(_req: Request, res: Response) {
        try {
            const report = new ContainerCarrierExcelReport();
            const workbook = await report.getOrdersReportByClientDate();

            res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            res.setHeader("Content-Disposition", "attachment; filename=reporte.xlsx");
            await workbook.xlsx.write(res);
            res.end();
        } catch (error) {
            errorHandler(error, res);
        }
    }
}
