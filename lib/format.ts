/**
 * Parse a date-only string (YYYY-MM-DD) as local time instead of UTC.
 * `new Date("2026-02-26")` interprets as UTC midnight, which shifts back
 * a day in negative-offset timezones (e.g. Colombia UTC-5).
 * Appending `T00:00:00` forces local interpretation.
 */
export function parseLocalDate(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00')
}

const usdFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
})

const copFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 2,
})

export function formatCurrency(amount: number, currency: string): string {
  if (currency === 'COP') return copFormatter.format(amount)
  return usdFormatter.format(amount)
}
