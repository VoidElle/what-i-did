import { describe, it, expect } from "vitest";
import { dayWindow } from "../../src/application/fetchYesterdayActivity";

describe("dayWindow", () => {
  it("returns start of day and end of day for a given date", () => {
    const date = new Date("2024-03-15T14:30:00");
    const { start, end } = dayWindow(date);
    const startDate = new Date(start);
    expect(startDate.getFullYear()).toBe(2024);
    expect(startDate.getMonth()).toBe(2); // March = index 2
    expect(startDate.getDate()).toBe(15);
    expect(startDate.getHours()).toBe(0);
    expect(end - start).toBe(86_400_000);
  });

  it("window spans exactly 24 hours", () => {
    const { start, end } = dayWindow(new Date("2024-06-01"));
    expect(end - start).toBe(86_400_000);
  });

  it("start is midnight (00:00:00.000)", () => {
    const { start } = dayWindow(new Date("2024-11-20T18:45:22.123"));
    const d = new Date(start);
    expect(d.getHours()).toBe(0);
    expect(d.getMinutes()).toBe(0);
    expect(d.getSeconds()).toBe(0);
    expect(d.getMilliseconds()).toBe(0);
  });

  it("end is the following midnight", () => {
    const date = new Date("2024-03-15");
    const { end } = dayWindow(date);
    const endDate = new Date(end);
    expect(endDate.getDate()).toBe(16);
    expect(endDate.getHours()).toBe(0);
  });
});
