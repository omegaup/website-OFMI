import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
} from "next/types";
import { findMostRecentOfmi, findParticipation } from "@/lib/ofmi";
import Mentorias from "@/components/mentorias";
import { X_USER_AUTH_EMAIL_HEADER } from "@/lib/auth";

export default function MentoriasPage({
  ofmiEdition,
  contestantParticipantId,
}: InferGetServerSidePropsType<typeof getServerSideProps>): JSX.Element {
  return (
    <Mentorias
      contestantParticipantId={contestantParticipantId}
      ofmiEdition={ofmiEdition}
    />
  );
}

export const getServerSideProps: GetServerSideProps<{
  ofmiEdition: number;
  contestantParticipantId: string | null;
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
  const participation = await findParticipation(ofmi, email);

  if (participation === null) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  // TODO: cambiar esto a un campo bool o algo así y que se pueda hacer un bulk update para cada etapa
  //   Comentando, ahora todas las participantes pueden agendar mentoria.
  //   const contestantParticipation = await findContestantParticipation(
  //     participation.contestantParticipantId,
  //   );
  //  if (
  //     contestantParticipation != null &&
  //     contestantParticipation.medal == null
  //   ) {

  //     return {
  //       redirect: {
  //         destination: "/",
  //         permanent: false,
  //       },
  //     };
  //   }

  return {
    props: {
      ofmiId: ofmi.id,
      ofmiEdition: ofmi.edition,
      contestantParticipantId: participation.contestantParticipantId,
    },
  };
};
