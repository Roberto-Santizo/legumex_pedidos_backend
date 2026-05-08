export class DateHandler {
    static formatSpanishDate(date: Date) {
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    static formatEnglishDate(date: Date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    }

    static addDays(date: Date, days: number) {
        const receiptDate = new Date(date);
        receiptDate.setDate(receiptDate.getDate() + days);
        return receiptDate;
    }
}