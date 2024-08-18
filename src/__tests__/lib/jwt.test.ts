import { expect, describe, it } from "vitest";
import { decrypt, encrypt } from "@/lib/jwt";
import { Type } from "@sinclair/typebox";

const dummySecret = "testsecret";

describe("encrypt/decrypt successfully", () => {
  it("string", async () => {
    const msg = "Hi";
    const token = await encrypt(msg, dummySecret);
    expect(token).not.equal(msg);
    const payload = await decrypt(Type.String(), token, dummySecret);
    expect(payload).equals(msg);
  });
});

it("invalid secret", async () => {
  const msg = "Hi";
  const token = await encrypt(msg, dummySecret);

  await expect(
    async () => await decrypt(Type.String(), token, "othersecret"),
  ).rejects.toThrow();
});

it("invalid schema", async () => {
  const msg = "Hi";
  const token = await encrypt(msg, dummySecret);

  await expect(
    async () => await decrypt(Type.String(), token, "othersecret"),
  ).rejects.toThrow();
});
