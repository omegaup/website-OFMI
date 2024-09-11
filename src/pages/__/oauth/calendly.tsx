import { getServerSession } from "next-auth/next";
import type { GetServerSideProps } from "next/types";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { connectOauth } from "@/lib/oauth";
import { getToken } from "next-auth/jwt";

export default function Oauth(): JSX.Element {
  return <div className="flex w-full items-center justify-center">FAILED</div>;
}

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  query,
}) => {
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

  const authorizationCode = query.code;

  if (typeof authorizationCode === "string") {
    const success = await connectOauth({
      userAuthId,
      provider: "CALENDLY",
      authorizationCode,
    });
    if (success) {
      return {
        redirect: {
          destination: "/oauth",
          permanent: false,
        },
      };
    }
  }

  return {
    props: {},
  };
};
