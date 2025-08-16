export function getMonthDays(date = new Date()){
  const year = date.getUTCFullYear();
  const month0 = date.getUTCMonth();
  const start = new Date(Date.UTC(year, month0, 1));
  const end = new Date(Date.UTC(year, month0 + 1, 0));
  const days: string[] = [];
  for(let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate()+1)){
    days.push(d.toLocaleDateString('en-CA'));
  }
  return { year, month0, days };
}
export function todayISO(){
  const now = new Date();
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

// Local YYYY-MM-DD (useful for input type=date defaults)
export function todayLocalYmd(){
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}
export function toYmdUTC(d: Date) {
  const yyyy = d.getUTCFullYear()
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(d.getUTCDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}
export function parseYmdUTC(ymd: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd)
  if (!m) return null
  const [_, y, mo, d] = m
  const dt = new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d)))
  return isNaN(dt.getTime()) ? null : dt
}
export function isTodayOrFutureUTC(date: Date) {
  const now = new Date()
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  return date.getTime() >= today.getTime()
}

export function isFirstDayOfMonth(date = new Date()) {
  return date.getUTCDate() === 1
}
