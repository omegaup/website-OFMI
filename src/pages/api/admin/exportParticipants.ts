import { BadRequestError } from "@/types/errors";
import type { NextApiRequest, NextApiResponse } from "next/types";

type ExportParticipantsResponse = {
  success: true;
  spreadsheetUrl: string;
};

async function exportParticipantsHandler(
  req: NextApiRequest,
  res: NextApiResponse<ExportParticipantsResponse | BadRequestError>,
): Promise<void> {
  const userAuthId = await ofmiUserAuthId();
  const ofmi = await findMostRecentOfmi();
  const spreadsheetId = await exportParticipants({
    userAuthId,
    ofmi,
    spreadsheetName: registrationSpreadsheetsPath(ofmi.edition),
  });

  console.log(
    `Spreadsheet: https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
  );
}

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse<ExportParticipantsResponse | BadRequestError>,
): Promise<void> {
  if (req.method === "GET") {
    // register to OFMI
    await exportParticipantsHandler(req, res);
  } else {
    return res.status(405).json({ message: "Method Not allowed" });
  }
}
