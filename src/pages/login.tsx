import Login from "@/components/login";
import { getServerSession } from "next-auth/next";
import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
} from "next/types";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { verifyEmail } from "@/lib/emailVerificationToken";
import { Alert } from "@/components/alert";

export default function LoginPage(
  props: InferGetServerSidePropsType<typeof getServerSideProps>,
): JSX.Element {
  if (props.errorMsg != null) {
    return (
      <div className="flex w-full items-center justify-center">
        <Alert
          className="block w-1/2 items-center justify-center"
          errorMsg={props.errorMsg}
        />
      </div>
    );
  }

  return (
    <Login
      verified={props.verified === null ? undefined : props.verified}
      initialEmail={props.email === null ? undefined : props.email}
      callbackUrl={props.callbackUrl === null ? undefined : props.callbackUrl}
    />
  );
}

export const getServerSideProps: GetServerSideProps<{
  verified: boolean | null;
  email: string | null;
  callbackUrl: string | null;
  errorMsg: string | null;
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

  const verifyToken = query.verifyToken;

  let email: string | null = null;
  let verified: boolean | null = null;
  let errorMsg: string | null = null;
  if (typeof verifyToken === "string") {
    try {
      const response = await verifyEmail({ token: verifyToken });
      if (response.success) {
        email = response.email;
        verified = true;
      } else {
        verified = false;
        errorMsg = response.errorMsg;
      }
    } catch (error) {
      verified = false;
      errorMsg = "Ocurrió un error al verificar tu email.";
    }
  }

  const callbackUrl =
    typeof query.callbackUrl === "string" ? query.callbackUrl : null;

  return {
    props: {
      verified,
      email,
      callbackUrl,
      errorMsg,
    },
  };
};
