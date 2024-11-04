import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
} from "next/types";
import Registro from "@/components/registro";
import { findMostRecentOfmi, findParticipation } from "@/lib/ofmi";
import { Alert } from "@/components/alert";
import { Value } from "@sinclair/typebox/value";
import {
  ParticipationRequestInput,
  ParticipationRequestInputSchema,
  ParticipationRoleOfString,
} from "@/types/participation.schema";
import { ParticipationRole } from "@prisma/client";
import { X_USER_AUTH_EMAIL_HEADER } from "@/lib/auth";
import { validateOFMIOpenAndCloseTime } from "@/lib/validators/ofmi";
import type { ValidationResult } from "@/lib/validators/types";

export default function RegistroPage({
  ofmiEdition,
  participationJSON,
  validationResult,
  role,
}: InferGetServerSidePropsType<typeof getServerSideProps>): JSX.Element {
  if (!validationResult.ok) {
    return (
      <div className="flex w-full items-center justify-center">
        <Alert
          className="block w-1/2 items-center justify-center"
          errorMsg={validationResult.message}
        >
          <p>
            Si tienes alguna duda por favor envía un correo a &nbsp;
            <a href="mailto:ofmi@omegaup.com">ofmi@omegaup.com</a>
          </p>
        </Alert>
      </div>
    );
  }

  const participation: ParticipationRequestInput | null = participationJSON
    ? JSON.parse(participationJSON)
    : null;

  if (participation !== null) {
    if (!Value.Check(ParticipationRequestInputSchema, participation)) {
      console.log(
        "Error. Participation was filled but does not have correct schema",
        participation,
      );
    }
  }

  return (
    <Registro
      ofmiEdition={ofmiEdition}
      role={role}
      participation={participation}
    />
  );
}

export const getServerSideProps: GetServerSideProps<{
  ofmiEdition: number;
  validationResult: ValidationResult;
  participationJSON: string | null;
  role: ParticipationRole;
}> = async ({ req, query }) => {
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

  const roleRequested =
    typeof query.role === "string"
      ? ParticipationRoleOfString(query.role)
      : undefined;
  const role =
    roleRequested ||
    participation?.input.userParticipation.role ||
    "CONTESTANT";

  return {
    props: {
      participationJSON: participation && JSON.stringify(participation.input),
      ofmiEdition: ofmi.edition,
      validationResult: validateOFMIOpenAndCloseTime(ofmi, {
        registrationTime: new Date(Date.now()),
        role,
      }),
      role,
    },
  };
};
