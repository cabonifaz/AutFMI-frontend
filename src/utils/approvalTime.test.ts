import {
  approvalDays,
  formatApprovalDate,
  formatApprovalDays,
} from "./approvalTime";
describe("Tiempo en bandeja", () => {
  test("hoy y cruce de medianoche en Lima", () => {
    expect(
      approvalDays(
        "2026-11-02 00:01",
        null,
        true,
        new Date("2026-11-02T23:59:00-05:00"),
      ),
    ).toBe(0);
    expect(
      approvalDays(
        "2026-11-01 23:59",
        null,
        true,
        new Date("2026-11-02T00:01:00-05:00"),
      ),
    ).toBe(1);
  });
  test("fin de mes, año y año bisiesto", () => {
    expect(
      approvalDays(
        "2025-12-31 23:59",
        null,
        true,
        new Date("2026-01-01T00:01:00-05:00"),
      ),
    ).toBe(1);
    expect(
      approvalDays(
        "2024-02-28 12:00",
        null,
        true,
        new Date("2024-03-01T12:00:00-05:00"),
      ),
    ).toBe(2);
  });
  test("histórico se detiene en resolución; no usa última modificación", () => {
    expect(
      approvalDays(
        "2026-10-25 10:00",
        "2026-10-28 09:00",
        false,
        new Date("2026-11-02T12:00:00-05:00"),
      ),
    ).toBe(3);
    expect(approvalDays("2026-10-25 10:00", null, false)).toBeNull();
  });
  test("fechas ausentes o futuras no se inventan", () => {
    expect(approvalDays(undefined)).toBeNull();
    expect(approvalDays("no-fecha")).toBeNull();
    expect(
      approvalDays(
        "2026-11-03 10:00",
        null,
        true,
        new Date("2026-11-02T12:00:00-05:00"),
      ),
    ).toBeNull();
    expect(formatApprovalDays(null)).toBe("Sin información");
    expect(formatApprovalDays(1)).toBe("1 día");
    expect(formatApprovalDays(3)).toBe("3 días");
  });
  test("fecha y hora am/pm con offset y sin offset", () => {
    expect(formatApprovalDate("2026-11-02 13:05")).toBe("02-11-2026 01:05 pm");
    expect(formatApprovalDate("2026-11-02T05:00:00Z")).toBe(
      "02-11-2026 12:00 am",
    );
    expect(formatApprovalDate("2026-11-02 12:00")).toBe("02-11-2026 12:00 pm");
  });
});
