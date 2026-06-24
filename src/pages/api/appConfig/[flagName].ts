import { NextApiRequest, NextApiResponse } from "next";
import { getBooleanFlag, getFlag } from "@/lib/appConfig";
import { BadRequestError } from "@/types/errors";

type FlagResponse = {
  flagName: string;
  value: string | boolean | null;
};

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse<FlagResponse | BadRequestError>,
): Promise<void> {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not allowed" });
  }

  const { flagName, type } = req.query;

  if (!flagName || typeof flagName !== "string") {
    return res.status(400).json({ message: "flagName is required" });
  }

  if (type === "boolean") {
    const value = await getBooleanFlag(flagName);
    return res.status(200).json({ flagName, value });
  }

  const value = await getFlag(flagName);
  return res.status(200).json({ flagName, value });
}
