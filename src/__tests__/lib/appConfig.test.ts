import { describe, beforeAll, afterAll, beforeEach, it, expect } from "vitest";
import { prisma } from "@/lib/prisma";
import { getFlag, getBooleanFlag, clearAppConfigCache } from "@/lib/appConfig";

const TEST_FLAG = "TEST_FLAG_LIB";
const TEST_BOOL_FLAG = "TEST_BOOL_FLAG_LIB";

beforeAll(async () => {
  await prisma.appConfig.upsert({
    where: { flagName: TEST_FLAG },
    update: { value: "some-value" },
    create: { flagName: TEST_FLAG, value: "some-value" },
  });
  await prisma.appConfig.upsert({
    where: { flagName: TEST_BOOL_FLAG },
    update: { value: "true" },
    create: { flagName: TEST_BOOL_FLAG, value: "true" },
  });
});

beforeEach(() => {
  clearAppConfigCache();
});

afterAll(async () => {
  await prisma.appConfig.deleteMany({
    where: { flagName: { in: [TEST_FLAG, TEST_BOOL_FLAG] } },
  });
});

describe("getFlag", () => {
  it("returns the value of an existing flag", async () => {
    const value = await getFlag(TEST_FLAG);
    expect(value).toBe("some-value");
  });

  it("returns null for a non-existing flag", async () => {
    const value = await getFlag("NON_EXISTING_FLAG_XYZ");
    expect(value).toBeNull();
  });

  it("caches the value on subsequent calls", async () => {
    const value1 = await getFlag(TEST_FLAG);
    expect(value1).toBe("some-value");

    await prisma.appConfig.update({
      where: { flagName: TEST_FLAG },
      data: { value: "updated-value" },
    });

    const value2 = await getFlag(TEST_FLAG);
    expect(value2).toBe("some-value");

    clearAppConfigCache();

    const value3 = await getFlag(TEST_FLAG);
    expect(value3).toBe("updated-value");

    await prisma.appConfig.update({
      where: { flagName: TEST_FLAG },
      data: { value: "some-value" },
    });
  });
});

describe("getBooleanFlag", () => {
  it("returns true when the flag value is 'true'", async () => {
    const value = await getBooleanFlag(TEST_BOOL_FLAG);
    expect(value).toBe(true);
  });

  it("returns false when the flag value is not 'true'", async () => {
    await prisma.appConfig.update({
      where: { flagName: TEST_BOOL_FLAG },
      data: { value: "false" },
    });
    clearAppConfigCache();

    const value = await getBooleanFlag(TEST_BOOL_FLAG);
    expect(value).toBe(false);

    await prisma.appConfig.update({
      where: { flagName: TEST_BOOL_FLAG },
      data: { value: "true" },
    });
  });

  it("returns false for a non-existing flag", async () => {
    const value = await getBooleanFlag("NON_EXISTING_BOOL_FLAG_XYZ");
    expect(value).toBe(false);
  });
});
