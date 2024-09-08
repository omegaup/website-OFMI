import { getServerSession } from "next-auth/next";
import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
} from "next/types";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { GCloud, findConnectedProviders } from "@/lib/oauth";
import { getToken } from "next-auth/jwt";
import Oauth from "@/components/oauth";
import { OauthProvider } from "@prisma/client";

export default function OauthPage({
  userAuthId,
  connectedProviders,
}: InferGetServerSidePropsType<typeof getServerSideProps>): JSX.Element {
  return (
    <Oauth userAuthId={userAuthId} connectedProviders={connectedProviders} />
  );
}

export const getServerSideProps: GetServerSideProps<{
  userAuthId: string;
  connectedProviders: Array<OauthProvider>;
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
    },
  };
};
