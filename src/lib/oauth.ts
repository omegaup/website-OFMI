import { prisma } from "@/lib/prisma";
import { basicAuth } from "@/utils/http";
import { OauthProvider, UserOauth } from "@prisma/client";
import config from "@/config/default";
import { exhaustiveMatchingGuard } from "@/utils";
import { getSecretOrError } from "./secret";

type UserOauthInput = Omit<UserOauth, "id" | "createdAt" | "updatedAt">;
type OauthInput = Omit<UserOauthInput, "userAuthId">;
const OAUTH_REDIRECT_BASE_URL = `${config.BASE_URL}/__/oauth`;

export class Intf {
  static async refreshToken(
    oauthInput: UserOauthInput,
  ): Promise<UserOauthInput> {
    throw Error(`Not implemented intf for ${oauthInput.provider}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async connect(_authorizationCode: string): Promise<OauthInput> {
    throw Error("Not implemented");
  }
}

export class GCloud {
  static GCLOUD_CLIENT_ID_KEY = "GCLOUD_CLIENT_ID";
  static GCLOUD_CLIENT_SECRET_KEY = "GCLOUD_CLIENT_SECRET";
  static REDIRECT_URI = `${OAUTH_REDIRECT_BASE_URL}/gcloud`;
  static REDIRECT_TO = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams(
    {
      client_id: GCloud.GCLOUD_CLIENT_ID_KEY,
      redirect_uri: GCloud.REDIRECT_URI,
      response_type: "code",
      scope:
        "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.appdata",
      access_type: "offline",
    },
  ).toString()}`;

  static async parseOauthResponse(
    refreshToken: string | null,
    response: Response,
  ): Promise<OauthInput> {
    const json = await response.json();
    if (response.status !== 200) {
      console.error("GCloud API error", json);
      throw new Error("GCloud API error");
    }
    const expiresInSeconds = Number(json["expires_in"]);
    return {
      provider: OauthProvider.GCLOUD,
      accessToken: json["access_token"] as string,
      refreshToken: refreshToken || (json["refresh_token"] as string),
      expiresAt: new Date(Date.now() + expiresInSeconds * 1000),
    };
  }

  static async sendRequest(
    grantType:
      | {
          grant_type: "authorization_code";
          code: string;
        }
      | {
          grant_type: "refresh_token";
          refresh_token: string;
        },
  ): Promise<OauthInput> {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: getSecretOrError(GCloud.GCLOUD_CLIENT_ID_KEY),
        client_secret: getSecretOrError(GCloud.GCLOUD_CLIENT_SECRET_KEY),
        redirect_uri: GCloud.REDIRECT_URI,
        ...grantType,
      }),
    };
    const res = await fetch("https://oauth2.googleapis.com/token", options);
    const refreshToken =
      grantType.grant_type === "refresh_token" ? grantType.refresh_token : null;
    return await GCloud.parseOauthResponse(refreshToken, res);
  }

  static async refreshToken(
    userOauth: UserOauthInput,
  ): Promise<UserOauthInput> {
    return {
      userAuthId: userOauth.userAuthId,
      ...(await GCloud.sendRequest({
        grant_type: "refresh_token",
        refresh_token: userOauth.refreshToken,
      })),
    };
  }

  static async connect(authorizationCode: string): Promise<OauthInput> {
    return await GCloud.sendRequest({
      grant_type: "authorization_code",
      code: authorizationCode,
    });
  }
}

export class Calendly {
  static CALENDLY_CLIENT_SECRET_KEY = "CALENDLY_CLIENT_SECRET";
  static CALENDLY_CLIENT_ID_KEY = "CALENDLY_CLIENT_ID";
  static AUTH_URL = "https://auth.calendly.com";
  static REDIRECT_URI = `${OAUTH_REDIRECT_BASE_URL}/calendly`;
  static REDIRECT_TO = `${Calendly.AUTH_URL}/oauth/authorize?client_id=${getSecretOrError(Calendly.CALENDLY_CLIENT_ID_KEY)}&response_type=code&redirect_uri=${Calendly.REDIRECT_URI}`;

  static async parseOauthResponse(response: Response): Promise<OauthInput> {
    const json = await response.json();
    if (response.status !== 200) {
      console.error("Calendly API error", json);
      throw new Error("Calendly API error");
    }
    const expiresInSeconds = Number(json["expires_in"]);
    return {
      provider: OauthProvider.CALENDLY,
      accessToken: json["access_token"] as string,
      refreshToken: json["refresh_token"] as string,
      expiresAt: new Date(Date.now() + expiresInSeconds * 1000),
    };
  }

  static async refreshToken(
    userOauth: UserOauthInput,
  ): Promise<UserOauthInput> {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: basicAuth(
          getSecretOrError(Calendly.CALENDLY_CLIENT_ID_KEY),
          getSecretOrError(Calendly.CALENDLY_CLIENT_SECRET_KEY),
        ),
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: userOauth.refreshToken,
      }),
    };
    const res = await fetch(`${Calendly.AUTH_URL}/oauth/token`, options);
    return {
      userAuthId: userOauth.userAuthId,
      ...(await Calendly.parseOauthResponse(res)),
    };
  }

  static async connect(authorizationCode: string): Promise<OauthInput> {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: basicAuth(
          getSecretOrError(Calendly.CALENDLY_CLIENT_ID_KEY),
          getSecretOrError(Calendly.CALENDLY_CLIENT_SECRET_KEY),
        ),
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: authorizationCode,
        redirect_uri: Calendly.REDIRECT_URI,
      }),
    };
    const res = await fetch(`${Calendly.AUTH_URL}/oauth/token`, options);
    return await Calendly.parseOauthResponse(res);
  }
}

export function OauthProviderOfString(
  provider: string,
): OauthProvider | undefined {
  return provider in OauthProvider
    ? OauthProvider[provider as keyof typeof OauthProvider]
    : undefined;
}

async function store(userOauth: UserOauthInput): Promise<UserOauth> {
  return await prisma.userOauth.upsert({
    where: {
      userAuthId_provider: {
        userAuthId: userOauth.userAuthId,
        provider: userOauth.provider,
      },
    },
    update: {
      ...userOauth,
    },
    create: {
      ...userOauth,
    },
  });
}

function providerIntf(provider: OauthProvider): typeof Intf {
  switch (provider) {
    case "CALENDLY":
      return Calendly;
    case "GCLOUD":
      return GCloud;
    default:
      return exhaustiveMatchingGuard(provider);
  }
}

export async function findConnectedProviders(
  userAuthId: string,
): Promise<Array<OauthProvider>> {
  const userAuth = await prisma.userAuth.findUnique({
    where: { id: userAuthId },
    include: {
      UserOauth: true,
    },
  });
  if (!userAuth) {
    throw Error("User not found");
  }
  return userAuth.UserOauth.map((oauthInfo) => oauthInfo.provider);
}

export async function getAccessToken(
  userAuthId: string,
  provider: OauthProvider,
  userOauth?: UserOauth,
): Promise<string> {
  // Try to retrieve the token from the db
  let oauthInfo =
    userOauth ||
    (await prisma.userOauth.findUnique({
      where: {
        userAuthId_provider: {
          userAuthId,
          provider,
        },
      },
    }));
  if (!oauthInfo) {
    throw Error(`Tienes que conectarte con el servicio ${provider} primero`);
  }
  if (oauthInfo.expiresAt.getTime() <= Date.now()) {
    // Renew it
    const intf = providerIntf(provider);
    oauthInfo = await store(await intf.refreshToken(oauthInfo));
  }
  return oauthInfo.accessToken;
}

export async function connectOauth({
  userAuthId,
  authorizationCode,
  provider,
}: {
  userAuthId: string;
  authorizationCode: string;
  provider: OauthProvider;
}): Promise<boolean> {
  const intf = providerIntf(provider);
  const oauthInfo = {
    ...(await intf.connect(authorizationCode)),
    userAuthId,
  };
  return (await store(oauthInfo)) !== null;
}

export async function disconnectOauth({
  userAuthId,
  provider,
}: {
  userAuthId: string;
  provider: OauthProvider;
}): Promise<boolean> {
  await prisma.userOauth.delete({
    where: {
      userAuthId_provider: {
        userAuthId,
        provider,
      },
    },
  });
  return true;
}
