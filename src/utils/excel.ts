import ExcelJS from 'exceljs';

export const formatCell = (cell: ExcelJS.Cell, colNumber: number) => {
    cell.font = {
        bold: true,
        color: { argb: 'FFFFFFFF' },
    };

    cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' },
    };

    cell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
    };
}