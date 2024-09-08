import { prisma } from "@/lib/prisma";
import { getAccessToken } from "./oauth";
import { OauthProvider } from "@prisma/client";
import * as google from "googleapis";

const DRIVE_API_BASE_URL = "https://www.googleapis.com/drive/v3";

export async function listOFMIFolders(): Promise<void> {
  const oauth = await prisma.userOauth.findFirst({
    where: {
      UserAuth: { email: "ofmi@omegaup.com" },
    },
    include: {
      UserAuth: true,
    },
  });
  const userAuthId = oauth?.UserAuth.id;
  if (!userAuthId) {
    return;
  }
  const token = await getAccessToken(userAuthId, OauthProvider.GCLOUD, oauth);

  const options = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const res = await fetch(`${DRIVE_API_BASE_URL}/files`, options);
  console.log(await res.json());

  const auth = new google.Auth.OAuth2Client({
    credentials: {
      access_token: token,
    },
  });
  const service = new google.drive_v3.Drive({
    auth: auth,
  });

  const file = service.files.create({
    requestBody: {
      name: "test.txt",
      parents: ["1Jrpl6n5zhdCdhXLXehHlNoaxtDvo51Sd"],
    },
  });
  console.log((await file).data);
}
