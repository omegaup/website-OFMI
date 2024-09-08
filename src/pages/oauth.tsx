import { getServerSession } from "next-auth/next";
import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
} from "next/types";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { Calendly, GCloud, findConnectedProviders } from "@/lib/oauth";
import { getToken } from "next-auth/jwt";
import Oauth from "@/components/oauth";
import { OauthProvider } from "@prisma/client";

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
}> = async ({ req, res }) => {
  const session = await getServerSession(req, res, authOptions);
  const token = await getToken({ req });
  const userAuthId = token?.sub;
  if (
    !session ||
    !token ||
    session.user?.email !== token.email ||
    !userAuthId
  ) {
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
