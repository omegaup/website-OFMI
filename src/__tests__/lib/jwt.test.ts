import { expect, describe, it } from "vitest";
import { jwtVerify, jwtSign } from "@/lib/jwt";
import { Type } from "@sinclair/typebox";

const dummySecret = "testsecret";

describe("encrypt/decrypt successfully", () => {
  it("string", async () => {
    const msg = "Hi";
    const token = await jwtSign(msg, dummySecret);
    expect(token).not.equal(msg);
    const payload = await jwtVerify(Type.String(), token, dummySecret);
    expect(payload).equals(msg);
  });
});

it("invalid secret", async () => {
  const msg = "Hi";
  const token = await jwtSign(msg, dummySecret);

  await expect(
    async () => await jwtVerify(Type.String(), token, "othersecret"),
  ).rejects.toThrow();
});

it("invalid schema", async () => {
  const msg = "Hi";
  const token = await jwtSign(msg, dummySecret);

  await expect(
    async () => await jwtVerify(Type.String(), token, "othersecret"),
  ).rejects.toThrow();
});
