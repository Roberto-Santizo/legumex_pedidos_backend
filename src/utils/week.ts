

/**
 * Given any date, returns the Monday and Sunday of that ISO week as YYYY-MM-DD strings.
 * Weeks start on Monday (ISO 8601).
 */
export function getWeekBounds(date: Date): { start: string; end: string } {
    const inputDate = new Date(date);
    const dayOfWeek = inputDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    // How many days to go back to reach Monday
    const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    const weekStart = new Date(inputDate);
    weekStart.setDate(inputDate.getDate() + daysToMonday);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    return {
        start: weekStart.toISOString().slice(0, 10),
        end: weekEnd.toISOString().slice(0, 10),
    };
}

/**
 * Returns the Monday and Sunday of the current week.
 */
export function getCurrentWeekBounds(): { start: string; end: string } {
    return getWeekBounds(new Date());
}

/**
 * Returns the ISO week number and ISO year for a given date.
 * The ISO year can differ from the calendar year at year boundaries.
 */
export function getISOWeekAndYear(date: Date): { year: number; week: number } {
    const thursday = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayOfWeek = thursday.getUTCDay() || 7; // Sunday=0 → 7, rest stay as-is
    thursday.setUTCDate(thursday.getUTCDate() + 4 - dayOfWeek); // Shift to Thursday of this week
    const firstDayOfYear = new Date(Date.UTC(thursday.getUTCFullYear(), 0, 1));
    const weekNumber = Math.ceil((((thursday.getTime() - firstDayOfYear.getTime()) / 86400000) + 1) / 7);
    return { year: thursday.getUTCFullYear(), week: weekNumber };
}
