import ExcelJS from "exceljs";

export class ReportService {
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