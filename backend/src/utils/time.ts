/**
 * Calendar-day helpers in a user's timezone. Days are "YYYY-MM-DD" strings,
 * which compare correctly as plain strings.
 */

const formatters = new Map<string, Intl.DateTimeFormat>();

export function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
    return true;
  } catch {
    return false;
  }
}

export function safeTimeZone(timeZone: string | null | undefined): string {
  return timeZone && isValidTimeZone(timeZone) ? timeZone : "UTC";
}

/** The calendar date of `date` as seen in `timeZone`. */
export function localDateKey(date: Date, timeZone: string): string {
  let formatter = formatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" });
    formatters.set(timeZone, formatter);
  }
  return formatter.format(date);
}

export function todayKey(timeZone: string): string {
  return localDateKey(new Date(), timeZone);
}

export function addDays(day: string, amount: number): string {
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
}

/**
 * A UTC instant safely before local midnight of `day` in any timezone
 * (offsets range from -12h to +14h). Callers re-filter by local date.
 */
export function lowerBoundFor(day: string): Date {
  return new Date(new Date(`${day}T00:00:00Z`).getTime() - 14 * 60 * 60 * 1000);
}
