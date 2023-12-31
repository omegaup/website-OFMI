import Login from "@/components/login";
import { getServerSession } from "next-auth/next";
import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
} from "next/types";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export default function LoginPage(
  props: InferGetServerSidePropsType<typeof getServerSideProps>,
): JSX.Element {
  return <Login verified={props.verified} initialEmail={props.email} />;
}

export const getServerSideProps: GetServerSideProps<{
  verified: boolean | null;
  email: string | null;
}> = async ({ req, res, query }) => {
  const session = await getServerSession(req, res, authOptions);

  if (session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const verified = query.verified;
  const email = query.email;

  return {
    props: {
      verified: typeof verified === "string" ? verified === "true" : null,
      email: typeof email === "string" ? email : null,
    },
  };
};
