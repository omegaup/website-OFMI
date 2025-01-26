import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
} from "next/types";
import { findOrCreateDriveFolderForParticipant } from "@/lib/admin";
import {
  findMostRecentOfmi,
  findParticipation,
  friendlyOfmiName,
} from "@/lib/ofmi";
import { Alert } from "@/components/alert";
import { X_USER_AUTH_EMAIL_HEADER } from "@/lib/auth";

export default function ResourcesPage(
  props: InferGetServerSidePropsType<typeof getServerSideProps>,
): JSX.Element {
  return (
    <div className="flex w-full items-center justify-center">
      <Alert
        className="block w-1/2 items-center justify-center"
        errorMsg={props.errorMsg}
      />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<{
  errorMsg: string;
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

  const ofmi = await findMostRecentOfmi();
  const participation =
    ofmi && email ? await findParticipation(ofmi, email) : null;

  let errorMsg = "";
  if (participation === null) {
    errorMsg = `Asegúrate que estás inscrita a la ${friendlyOfmiName(ofmi.edition)}`;
  } else {
    const gDriveFolderUrl = await findOrCreateDriveFolderForParticipant({
      email,
      ofmiEdition: ofmi.edition,
    });
    return {
      redirect: {
        destination: gDriveFolderUrl,
        permanent: false,
      },
    };
  }

  return {
    props: {
      errorMsg,
    },
  };
};
