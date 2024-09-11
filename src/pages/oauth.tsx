import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
} from "next/types";
import { Calendly, GCloud, findConnectedProviders } from "@/lib/oauth";
import Oauth from "@/components/oauth";
import { OauthProvider } from "@prisma/client";
import { X_USER_AUTH_ID_HEADER } from "@/lib/auth";

export default function OauthPage({
  userAuthId,
  connectedProviders,
  calendlyRedirectTo,
  gCloudRedirectTo,
}: InferGetServerSidePropsType<typeof getServerSideProps>): JSX.Element {
  return (
    <Oauth
      userAuthId={userAuthId}
      connectedProviders={connectedProviders}
      calendlyRedirectTo={calendlyRedirectTo}
      gCloudRedirectTo={gCloudRedirectTo}
    />
  );
}

export const getServerSideProps: GetServerSideProps<{
  userAuthId: string;
  connectedProviders: Array<OauthProvider>;
  calendlyRedirectTo: string;
  gCloudRedirectTo: string;
}> = async ({ req }) => {
  const userAuthId = req.headers[X_USER_AUTH_ID_HEADER];
  if (!userAuthId || typeof userAuthId !== "string") {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  const connectedProviders = await findConnectedProviders(userAuthId);

  return {
    props: {
      userAuthId,
      connectedProviders,
      calendlyRedirectTo: Calendly.REDIRECT_TO,
      gCloudRedirectTo: GCloud.REDIRECT_TO,
    },
  };
};
