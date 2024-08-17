import { getServerSession } from "next-auth/next";
import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
} from "next/types";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import Registro from "@/components/registro";
import { findMostRecentOfmi } from "@/lib/ofmi";
import { Alert } from "@/components/alert";

export default function RegistroPage({
  ofmiEdition,
  registrationClosingTime,
}: InferGetServerSidePropsType<typeof getServerSideProps>): JSX.Element {
  if (
    ofmiEdition == null ||
    (registrationClosingTime && registrationClosingTime < Date.now())
  ) {
    const errorMsg = ofmiEdition ? "El registro de la OFMI ha finalizado." : "";
    return (
      <div className="flex w-full items-center justify-center">
        <Alert
          className="block w-1/2 items-center justify-center"
          errorMsg={errorMsg}
        >
          <p>
            Si tienes alguna duda por favor envía un correo a
            <a href="mailto:ofmi@omegaup.com">ofmi@omegaup.com</a>
          </p>
        </Alert>
      </div>
    );
  }

  return <Registro ofmiEdition={ofmiEdition} />;
}

export const getServerSideProps: GetServerSideProps<{
  ofmiEdition: number | null;
  registrationClosingTime: number | null;
}> = async ({ req, res }) => {
  const session = await getServerSession(req, res, authOptions);
  // Get current ofmi edition and user email
  console.log("Session", session);

  const ofmi = await findMostRecentOfmi();

  return {
    props: {
      ofmiEdition: ofmi?.edition ?? null,
      registrationClosingTime: ofmi?.registrationCloseTime.getTime() ?? null,
    },
  };
};
