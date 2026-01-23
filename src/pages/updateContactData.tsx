import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
} from "next/types";
import { Value } from "@sinclair/typebox/value";
import { X_USER_AUTH_EMAIL_HEADER } from "@/lib/auth";
import UpdateContactData from "@/components/contactData/updateContactData";
import { UserRequestInput, UserInputSchema } from "@/types/user.schema";
import { findUser } from "@/lib/user";
import { findMostRecentOfmi } from "@/lib/ofmi";

export default function UpdateContacDataPage({
  userJSON,
  ofmiEdition,
}: InferGetServerSidePropsType<typeof getServerSideProps>): JSX.Element {
  const user: UserRequestInput | null = userJSON ? JSON.parse(userJSON) : null;

  if (user !== null) {
    if (!Value.Check(UserInputSchema, user)) {
      console.log(
        "Error. User was filled but does not have correct schema",
        user,
      );
    }
  }

  return <UpdateContactData user={user} ofmiEdition={ofmiEdition} />;
}

export const getServerSideProps: GetServerSideProps<{
  userJSON: string | null;
  ofmiEdition: number;
}> = async ({ req }) => {
  const email = req.headers[X_USER_AUTH_EMAIL_HEADER];
  if (!email || typeof email !== "string") {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  const user = await findUser(email);
  const ofmiEdition = await findMostRecentOfmi();

  return {
    props: {
      userJSON: user && JSON.stringify(user.input),
      ofmiEdition: ofmiEdition.edition || 0,
    },
  };
};
