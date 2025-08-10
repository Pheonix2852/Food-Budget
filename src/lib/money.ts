export const toCents = (input: number | string) =>
  Math.round(Number(input) * 100)

export const fromCents = (cents: number) => cents / 100

export const formatCurrency = (
  cents: number,
  currency = 'INR',
  locale = 'en-IN'
) =>
  new Intl.NumberFormat(locale, { style: 'currency', currency }).format(
    fromCents(cents || 0)
  )