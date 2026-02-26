/**
 * Parse a date-only string (YYYY-MM-DD) as local time instead of UTC.
 * `new Date("2026-02-26")` interprets as UTC midnight, which shifts back
 * a day in negative-offset timezones (e.g. Colombia UTC-5).
 * Appending `T00:00:00` forces local interpretation.
 */
export function parseLocalDate(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00')
}

const currencyFormatters = new Map<string, Intl.NumberFormat>()

export function formatCurrency(amount: number, currency: string) {
  let formatter = currencyFormatters.get(currency)
  if (!formatter) {
    formatter = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    })
    currencyFormatters.set(currency, formatter)
  }
  return formatter.format(amount)
}
