import ChangePassword from "@/components/change-password";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";

export interface IChangePasswordProps {
  token: string;
}

export default function ChangePasswordPage({
  token,
}: IChangePasswordProps): JSX.Element {
  return <ChangePassword token={token} />;
}

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  query,
}) => {
  const session = await getServerSession(req, res, authOptions);
  const token = query?.token;
  if (session || token == undefined) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
  return {
    props: {
      token: token,
    },
  };
};
