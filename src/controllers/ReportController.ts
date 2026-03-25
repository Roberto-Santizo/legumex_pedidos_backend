import { Request, Response } from "express";
import { errorHandler } from "../helpers/httpHelpers";
import { ReportService } from "../services/ReportService";

export abstract class ReportController {
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