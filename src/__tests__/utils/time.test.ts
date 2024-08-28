import { expect, describe, it } from "vitest";
import { nextHalfHour } from "@/utils/time";

describe("nextHalfHour", () => {
  it("do not change the date", async () => {
    const time = new Date("2024-07-07T13:15:00.000Z");
    expect(nextHalfHour(time).toISOString()).toBe("2024-07-07T13:30:00.000Z");
    expect(time.toISOString()).toBe("2024-07-07T13:15:00.000Z");
  });
  it("13:15", async () => {
    const time = new Date("2024-07-07T13:15:00.000Z");
    expect(nextHalfHour(time).toISOString()).toBe("2024-07-07T13:30:00.000Z");
  });
  it("13:01", async () => {
    const time = new Date("2024-07-07T13:01:00.000Z");
    expect(nextHalfHour(time).toISOString()).toBe("2024-07-07T13:30:00.000Z");
  });
  it("13:00", async () => {
    const time = new Date("2024-07-07T13:00:00.000Z");
    expect(nextHalfHour(time).toISOString()).toBe("2024-07-07T13:30:00.000Z");
  });
  it("12:59", async () => {
    const time = new Date("2024-07-07T12:59:00.000Z");
    expect(nextHalfHour(time).toISOString()).toBe("2024-07-07T13:00:00.000Z");
  });
  it("12:45", async () => {
    const time = new Date("2024-07-07T12:45:00.000Z");
    expect(nextHalfHour(time).toISOString()).toBe("2024-07-07T13:00:00.000Z");
  });
  it("12:30", async () => {
    const time = new Date("2024-07-07T12:30:00.000Z");
    expect(nextHalfHour(time).toISOString()).toBe("2024-07-07T13:00:00.000Z");
  });
});
