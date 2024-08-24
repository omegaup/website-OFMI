import { prisma } from "@/lib/prisma";
import { basicAuth } from "@/utils/http";
import { OauthProvider, UserOauth } from "@prisma/client";
import config from "@/config/default";
import { exhaustiveMatchingGuard } from "@/utils";

type UserOauthInput = Omit<UserOauth, "id" | "createdAt" | "updatedAt">;
type OauthInput = Omit<UserOauthInput, "userAuthId">;

export class Calendly {
  static AUTH_URL = "https://auth.calendly.com";
  static PROVIDER = OauthProvider.CALENDLY;

  static redirect(): string {
    return `${this.AUTH_URL}/oauth/authorize?client_id=${config.CALENDLY_CLIENT_ID}&response_type=code&redirect_uri=${config.CALENDLY_REDIRECT_URI}`;
  }

  static async parseOauthResponse(response: Response): Promise<OauthInput> {
    const json = await response.json();
    if (response.status !== 200) {
      console.error("Calendly API error", json);
      throw new Error("Calendly API error");
    }
    const expiresInSeconds = Number(json["expires_in"]);
    return {
      provider: Calendly.PROVIDER,
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
          config.CALENDLY_CLIENT_ID,
          config.CALENDLY_CLIENT_SECRET,
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
          config.CALENDLY_CLIENT_ID,
          config.CALENDLY_CLIENT_SECRET,
        ),
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: authorizationCode,
        redirect_uri: config.CALENDLY_REDIRECT_URI,
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

function providerIntf(provider: OauthProvider): typeof Calendly {
  switch (provider) {
    case "CALENDLY":
      return Calendly;
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
