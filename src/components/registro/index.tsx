import { Button } from "@/components/button";
import { Alert, SuccessAlert, WarningAlert } from "@/components/alert";
import { MailingAddress } from "./mailingAddress";
import { PersonalDetails } from "./personalDetails";
import { SchoolDetails } from "./schoolDetails";
import {
  ParticipationRoleName,
  type ParticipationRequestInput,
  type UpsertParticipationRequest,
  UserParticipation,
} from "@/types/participation.schema";
import { fieldIds } from "./constants";
import { useState } from "react";
import { PronounsOfString } from "@/types/pronouns";
import { ShirtStyleOfString } from "@/types/shirt";
import { ParticipationRole, SchoolStage, ShirtSize } from "@prisma/client";
import { sendUpsertParticipation } from "./client";
import { useSession } from "next-auth/react";
import { exhaustiveMatchingGuard, undefinedIfEmpty } from "@/utils";

export default function Registro({
  ofmiEdition,
  role,
  participation,
}: {
  ofmiEdition: number;
  role: ParticipationRole;
  participation: ParticipationRequestInput | null;
}): JSX.Element {
  const [showAlreadyRegistered, setShowAlreadyRedistered] = useState(
    participation !== null,
  );
  const { data: session } = useSession();
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);
  const [successfulUpsert, setSuccessfulUpsert] = useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    setError(null);

    const data = new FormData(event.currentTarget);

    const email = session?.user?.email;
    if (!email) {
      return setError(new Error("Inicia sesión primero"));
    }
    const birthDate = data.get(fieldIds.birthDate)?.toString();
    const pronouns = PronounsOfString(
      data.get(fieldIds.pronouns)?.valueOf().toString() ?? "",
    );
    const shirtSizeStr = data.get(fieldIds.shirtSize)?.toString() ?? "";
    const shirtSize =
      shirtSizeStr in ShirtSize
        ? ShirtSize[shirtSizeStr as keyof typeof ShirtSize]
        : undefined;
    const shirtStyle = ShirtStyleOfString(
      data.get(fieldIds.shirtStyle)?.toString() ?? "",
    );

    if (!pronouns || !shirtSize || !birthDate || !shirtStyle) {
      return setError(new Error("Todos los campos son requeridos"));
    }

    function getUserParticipation(): UserParticipation | null {
      switch (role) {
        case "CONTESTANT": {
          const schoolStageStr =
            data.get(fieldIds.schoolStage)?.toString() ?? "";
          const schoolStage =
            schoolStageStr in SchoolStage
              ? SchoolStage[schoolStageStr as keyof typeof SchoolStage]
              : undefined;

          if (!schoolStage) {
            setError(new Error("Todos los campos son requeridos"));
            return null;
          }

          return {
            role, // TODO: Add more roles
            schoolName: data.get(fieldIds.schoolName)?.toString() ?? "",
            schoolStage,
            schoolGrade: Number(data.get(fieldIds.schoolGrade)?.toString()),
            schoolCountry: data.get(fieldIds.schoolCountry)?.toString() ?? "",
            schoolState: data.get(fieldIds.schoolState)?.toString() ?? "",
          };
        }
        case "MENTOR": {
          return {
            role,
          };
        }
        default: {
          return exhaustiveMatchingGuard(role);
        }
      }
    }

    const userParticipation = getUserParticipation();
    if (!userParticipation) {
      return;
    }

    const request: UpsertParticipationRequest = {
      ofmiEdition,
      user: {
        email,
        firstName: data.get(fieldIds.firstName)?.toString() ?? "",
        lastName: data.get(fieldIds.lastName)?.toString() ?? "",
        preferredName: data.get(fieldIds.preferredName)?.toString() ?? "",
        birthDate: new Date(birthDate).toISOString(),
        governmentId: data.get(fieldIds.governmentId)?.toString() ?? "",
        pronouns,
        shirtSize,
        shirtStyle,
        mailingAddress: {
          recipient: undefinedIfEmpty(
            data.get(fieldIds.mailingRecipient)?.toString(),
          ),
          street: data.get(fieldIds.mailingStreet)?.toString() ?? "",
          externalNumber:
            data.get(fieldIds.mailingExternalNumber)?.toString() ?? "",
          internalNumber: undefinedIfEmpty(
            data.get(fieldIds.mailingInternalNumber)?.toString(),
          ),
          zipcode: data.get(fieldIds.mailingZipcode)?.toString() ?? "",
          country: data.get(fieldIds.mailingCountry)?.toString() ?? "",
          state: data.get(fieldIds.mailingState)?.toString() ?? "",
          municipality:
            data.get(fieldIds.mailingMunicipality)?.toString() ?? "",
          locality: undefinedIfEmpty(
            data.get(fieldIds.mailingLocality)?.toString(),
          ),
          references: undefinedIfEmpty(
            data.get(fieldIds.mailingReferences)?.toString(),
          ),
          phone: data.get(fieldIds.mailingPhone)?.toString() ?? "",
        },
      },
      userParticipation: userParticipation,
    };

    setLoading(true);
    const response = await sendUpsertParticipation(request);
    if (!response.success) {
      setError(response.error);
    } else {
      setSuccessfulUpsert(true);
    }
    setLoading(false);
  }

  if (showAlreadyRegistered) {
    return (
      <div className="mx-auto max-w-3xl px-2 pt-4">
        <SuccessAlert
          title="Ya estas registrada!"
          text="Quieres modificar tu registro?"
        />
        <div className="text-center">
          <Button
            buttonSize="sm"
            buttonType="secondary"
            onClick={() => setShowAlreadyRedistered(false)}
          >
            Modificar
          </Button>
        </div>
      </div>
    );
  }

  if (successfulUpsert) {
    return (
      <div className="mx-auto max-w-3xl px-2 pt-4">
        <SuccessAlert text="Hemos registrado tus datos correctamente." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-2 pt-4">
      <h2 className="text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
        Registro {ofmiEdition}
        <sup>a</sup> OFMI
      </h2>
      {role !== "CONTESTANT" && (
        <WarningAlert
          title="¡Atención!"
          text={`Este es registro para ${ParticipationRoleName(role)}`}
        />
      )}
      {participation?.userParticipation.role &&
        participation?.userParticipation.role !== role && (
          <Alert
            errorTitle="¡PELIGRO!"
            errorMsg={`Ya tenemos un registro tuyo como
              ${ParticipationRoleName(participation.userParticipation.role)}. 
              Este es el registro para ${ParticipationRoleName(role)}`}
          />
        )}
      <form
        className="mb-8"
        action="#"
        method="POST"
        onSubmit={(ev) => handleSubmit(ev)}
      >
        {/* Personal information */}
        <PersonalDetails participation={participation} />
        {/* Mailing address */}
        <MailingAddress participation={participation} />

        {/* CONTESTANT specific */}
        {/* School */}
        {role === "CONTESTANT" && (
          <SchoolDetails
            contestantParticipation={
              participation?.userParticipation.role === "CONTESTANT"
                ? participation.userParticipation
                : null
            }
          />
        )}

        {/* Submit form */}
        <div className="flex justify-center">
          <Button
            type="submit"
            className="min-w-full md:w-64 md:min-w-0"
            disabled={loading}
          >
            Enviar
          </Button>
        </div>
      </form>
      {error != null && <Alert errorMsg={error.message} />}
    </div>
  );
}
