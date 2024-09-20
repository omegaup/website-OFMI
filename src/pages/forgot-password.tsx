import ChangePassword from "@/components/change-password";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";
import ForgotPassword from "@/components/forgot-password";

export interface IForgotPasswordProps {
  token: string;
}

export default function ChangePasswordPage({
  token,
}: IForgotPasswordProps): JSX.Element {
  return token.length ? <ChangePassword token={token} /> : <ForgotPassword />;
}

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  query,
}) => {
  const session = await getServerSession(req, res, authOptions);
  const token = query?.token;
  if (session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
  return {
    props: {
      token: typeof token === "string" ? token : "",
    },
  };
};
