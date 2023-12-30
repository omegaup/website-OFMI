import { prisma } from "@/lib/prisma";
import { hashPassword } from "./create";
import { NextApiRequest, NextApiResponse } from "next";
import { Value } from "@sinclair/typebox/value";
import { LoginUserRequestSchema, LoginUserResponse } from "@/types/auth.schema";
import { BadRequestError } from "@/types/badRequestError.schema";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  if (req.method === "POST") {
    /* eslint-disable-next-line @typescript-eslint/no-use-before-define */
    await loginUserHandler(req, res);
  } else {
    return res.status(405).json({ message: "Method Not allowed" });
  }
}
async function loginUserHandler(
  req: NextApiRequest,
  res: NextApiResponse<LoginUserResponse | BadRequestError>,
): Promise<void> {
  const { body } = req;
  if (!Value.Check(LoginUserRequestSchema, body)) {
    return res.status(400).json({ message: "invalid inputs" });
  }
  const { email, password } = body;
  if (email == null || password == null) {
    return res.status(400).json({ message: "invalid inputs" });
  }
  const user = await prisma.userAuth.findUnique({
    where: { email },
  });
  if (user != null && user.password === hashPassword(password)) {
    return res.status(200).json({ user });
  } else {
    return res.status(401).json({ message: "invalid credentials" });
  }
}
