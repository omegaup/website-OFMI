import { getServerSession } from "next-auth/next";
import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
} from "next/types";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import Registro from "@/components/registro";
import { findMostRecentOfmi, findParticipation } from "@/lib/ofmi";
import { Alert } from "@/components/alert";
import { Value } from "@sinclair/typebox/value";
import {
  ParticipationRequestInput,
  ParticipationRequestInputSchema,
} from "@/types/participation.schema";

export default function RegistroPage({
  ofmiEdition,
  participationJSON,
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

  let participation: ParticipationRequestInput | null = null;
  const body = participationJSON ? JSON.parse(participationJSON) : null;

  if (Value.Check(ParticipationRequestInputSchema, body)) {
    participation = body;
  } else {
    console.info("Estan corruptos los datos");
  }
  return <Registro ofmiEdition={ofmiEdition} participation={participation} />;
}

export const getServerSideProps: GetServerSideProps<{
  ofmiEdition: number | null;
  registrationClosingTime: number | null;
  participationJSON: string | null;
}> = async ({ req, res }) => {
  const session = await getServerSession(req, res, authOptions);
  const email = session?.user?.email;
  if (!session?.user?.email) {
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

  return {
    props: {
      session,
      participationJSON: JSON.stringify(participation),
      ofmiEdition: ofmi?.edition ?? null,
      registrationClosingTime: ofmi?.registrationCloseTime.getTime() ?? null,
    },
  };
};
