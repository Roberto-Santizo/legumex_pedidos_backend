// Created by Luis

/**
 * Given any date, returns the Monday and Sunday of that ISO week as YYYY-MM-DD strings.
 * Weeks start on Monday (ISO 8601).
 */
export function getWeekBounds(date: Date): { start: string; end: string } {
    const d = new Date(date);
    const day = d.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    // How many days to go back to reach Monday
    const diffToMonday = day === 0 ? -6 : 1 - day;

    const monday = new Date(d);
    monday.setDate(d.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    return {
        start: monday.toISOString().slice(0, 10),
        end: sunday.toISOString().slice(0, 10),
    };
}

/**
 * Returns the Monday and Sunday of the current week.
 */
export function getCurrentWeekBounds(): { start: string; end: string } {
    return getWeekBounds(new Date());
}
