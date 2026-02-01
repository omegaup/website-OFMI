import { X_USER_AUTH_ID_HEADER, isImpersonatingOfmiUser } from "@/lib/auth";
import { exportVenueInfo, spreadsheetURL } from "@/lib/gcloud";
import { findMostRecentOfmi, venueSpreadsheetsPath } from "@/lib/ofmi";
import { ofmiUserAuthId } from "@/lib/ofmiUserImpersonator";
import { BadRequestError } from "@/types/errors";
import type { NextApiRequest, NextApiResponse } from "next/types";

type ExportVenueInfoResponse = {
  success: true;
  spreadsheetId: string;
  spreadsheetUrl: string;
};

type ExportParticipantsResponse = {
  success: true;
  spreadsheetId: string;
  spreadsheetUrl: string;
};

async function getRequestUserId(req: NextApiRequest): Promise<string | null> {
  const authIdHeader = req.headers[X_USER_AUTH_ID_HEADER];
  if (typeof authIdHeader === "string") {
    return authIdHeader;
  }
  if (isImpersonatingOfmiUser(req)) {
    return await ofmiUserAuthId();
  }
  return null;
}

async function exportVenueInfoHandler(
  req: NextApiRequest,
  res: NextApiResponse<ExportVenueInfoResponse | BadRequestError>,
): Promise<void> {
  const userAuthId = await getRequestUserId(req);
  if (!userAuthId) {
    return res.status(403).json({ message: "Forbidden" });
  }
  const ofmi = await findMostRecentOfmi();
  try {
    const spreadsheetId = await exportVenueInfo({
      userAuthId,
      ofmi,
      spreadsheetName: venueSpreadsheetsPath(ofmi.edition),
    });
    return res.status(200).json({
      success: true,
      spreadsheetId,
      spreadsheetUrl: spreadsheetURL(spreadsheetId),
    });
  } catch (e) {
    return res.status(500).json({
      message: `Internal Server Error. ${e}`,
    });
  }
}

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse<ExportParticipantsResponse | BadRequestError>,
): Promise<void> {
  if (req.method === "GET") {
    // register to OFMI
    await exportVenueInfoHandler(req, res);
  } else {
    return res.status(405).json({ message: "Method Not allowed" });
  }
}
