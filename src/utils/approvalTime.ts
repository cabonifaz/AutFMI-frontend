const ZONE = "America/Lima";
const parts = (date: Date) =>
  Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(date)
      .map((p) => [p.type, p.value]),
  );
const parse = (value?: string | null): Date | null => {
  if (!value) return null;
  const text = value.trim().replace(" ", "T");
  // SQL devuelve hora local sin offset; los timestamps con offset se convierten a Lima.
  const date = new Date(
    /(?:Z|[+-]\d{2}:?\d{2})$/i.test(text) ? text : text + "-05:00",
  );
  return Number.isNaN(date.getTime()) ? null : date;
};
export const formatApprovalDate = (value?: string | null) => {
  const date = parse(value);
  if (!date) return "Sin información";
  const p = parts(date);
  const hour = Number(p.hour);
  return `${p.day}-${p.month}-${p.year} ${String(hour % 12 || 12).padStart(2, "0")}:${p.minute} ${hour < 12 ? "am" : "pm"}`;
};
export const approvalDays = (
  created?: string | null,
  resolved?: string | null,
  pending = true,
  now = new Date(),
): number | null => {
  const start = parse(created);
  const end = pending ? now : parse(resolved);
  if (!start || !end || end.getTime() < start.getTime()) return null;
  const day = (d: Date) => {
    const p = parts(d);
    return Date.UTC(Number(p.year), Number(p.month) - 1, Number(p.day));
  };
  return Math.floor((day(end) - day(start)) / 86400000);
};
export const formatApprovalDays = (days: number | null) =>
  days === null ? "Sin información" : `${days} ${days === 1 ? "día" : "días"}`;
