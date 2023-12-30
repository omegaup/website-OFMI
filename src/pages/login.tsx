import Login from "@/components/login";
import { getServerSession } from "next-auth/next";
import type { GetServerSideProps } from "next/types";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export default function LoginPage(): JSX.Element {
  return <Login />;
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await getServerSession(req, res, authOptions);

  if (session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};
