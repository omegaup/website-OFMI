import { NextApiRequest, NextApiResponse } from "next";
import { Value } from "@sinclair/typebox/value";
import { DisconnectOauthProviderRequestSchema } from "@/types/oauth.schema";
import { BadRequestError } from "@/types/errors";
import { disconnectOauth } from "@/lib/oauth";

async function disconnectOauthProviderHandler(
  req: NextApiRequest,
  res: NextApiResponse<{ success: boolean } | BadRequestError>,
): Promise<void> {
  const { body } = req;
  if (!Value.Check(DisconnectOauthProviderRequestSchema, body)) {
    return res.status(400).json({ message: "Invalid inputs" });
  }
  const { userAuthId, provider } = body;

  const status = await disconnectOauth({
    userAuthId,
    provider,
  });

  return res.status(200).json({ success: status });
}

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse<{ success: boolean } | BadRequestError>,
): Promise<void> {
  if (req.method === "POST") {
    await disconnectOauthProviderHandler(req, res);
  } else {
    return res.status(405).json({ message: "Method Not allowed" });
  }
}
