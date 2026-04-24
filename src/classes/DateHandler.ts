export class DateHandler {
    static formatSpanishDate(date: Date) {
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    static addDays(date: Date, days: number) {
        const receiptDate = new Date(date);
        receiptDate.setDate(receiptDate.getDate() + days);
        return receiptDate;
    }
}