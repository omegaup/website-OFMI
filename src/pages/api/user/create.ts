import { SHA256 as sha256 } from "crypto-js";
// We impot our prisma client
import { prisma } from "../../../lib/prisma";
// Prisma will help handle and catch errors
import { Prisma } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    // create user
    /* eslint-disable-next-line @typescript-eslint/no-use-before-define */
    await createUserHandler(req, res);
  } else {
    return res.status(405).json({ message: "Method Not allowed" });
  }
}
// We hash the user entered password using crypto.js
export const hashPassword = (string: string) => {
  return sha256(string).toString();
};
// function to create user in our database
async function createUserHandler(req: NextApiRequest, res: NextApiResponse) {
  let errors = [];
  const { email, password } = req.body;
  // console.log("req", req.toString());
  // console.log(`body ${req.body} password ${req.body.password} email ${req.body.email}`);

  if (password.length < 8) {
    errors.push("password length should be more than 8 characters");
    return res.status(400).json({ errors });
  }
  try {
    const user = await prisma.userAuth.create({
      data: { ...req.body, password: hashPassword(req.body.password) },
    });
    return res.status(201).json({ user });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") {
        return res.status(400).json({ message: e.message });
      }
      return res.status(400).json({ message: e.message });
    }
  }
}
