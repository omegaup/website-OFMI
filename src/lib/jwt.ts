import jwt from "jsonwebtoken";
import { Static, TSchema } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";

export async function encrypt(
  payload: string | object | Buffer,
  secret: jwt.Secret,
  options?: jwt.SignOptions,
): Promise<string> {
  return await jwt.sign(payload, secret, options);
}

export async function decrypt<T extends TSchema>(
  schema: T,
  token: string,
  secret: jwt.Secret,
): Promise<Static<T>> {
  const payload = jwt.verify(token, secret);
  if (!Value.Check(schema, payload)) {
    throw Error("Invalid format");
  }
  return payload;
}
