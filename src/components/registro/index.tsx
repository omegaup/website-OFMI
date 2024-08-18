import { Button } from "@/components/button";
import { Alert, SuccessAlert } from "@/components/alert";
import { MailingAddress } from "./mailingAddress";
import { PersonalDetails } from "./personalDetails";
import { SchoolDetails } from "./schoolDetails";
import type { UpsertParticipationRequest } from "@/types/participation.schema";
import { fieldIds } from "./constants";
import { useState } from "react";
import { PronounsOfString } from "@/types/pronouns";
import { ShirtSizeOfString, ShirtStyleOfString } from "@/types/shirt";
import { SchoolStage } from "@prisma/client";
import { sendUpsertParticipation } from "./client";
import { useSession } from "next-auth/react";
import { undefinedIfEmpty } from "@/utils";

export default function Registro({
  ofmiEdition,
}: {
  ofmiEdition: number;
}): JSX.Element {
  const { data: session, status } = useSession();
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);
  const [successfulUpsert, setSuccessfulUpsert] = useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    setError(null);

    const data = new FormData(event.currentTarget);
    data.forEach((value, key) => console.log(`${key}: ${value}`));

    const email = session?.user?.email;
    if (!email) {
      return setError(new Error("Inicia sesión primero"));
    }
    const birthDate = data.get(fieldIds.birthDate)?.toString();
    const pronouns = PronounsOfString(
      data.get(fieldIds.pronouns)?.valueOf().toString() ?? "",
    );
    console.log(data.get(fieldIds.pronouns));
    const shirtSize = ShirtSizeOfString(
      data.get(fieldIds.shirtSize)?.toString() ?? "",
    );
    const shirtStyle = ShirtStyleOfString(
      data.get(fieldIds.shirtStyle)?.toString() ?? "",
    );
    const schoolStageStr = data.get(fieldIds.schoolStage)?.toString() ?? "";
    const schoolStage =
      schoolStageStr in SchoolStage
        ? SchoolStage[schoolStageStr as keyof typeof SchoolStage]
        : undefined;

    if (!pronouns || !shirtSize || !birthDate || !shirtStyle || !schoolStage) {
      return setError(new Error("Todos los campos son requeridos"));
    }

    const request: UpsertParticipationRequest = {
      ofmiEdition,
      country: data.get(fieldIds.schoolCountry)?.toString() ?? "",
      state: data.get(fieldIds.schoolState)?.toString() ?? "",
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
          municipality: undefinedIfEmpty(
            data.get(fieldIds.mailingMunicipality)?.toString(),
          ),
          locality: undefinedIfEmpty(
            data.get(fieldIds.mailingLocality)?.toString(),
          ),
          references: undefinedIfEmpty(
            data.get(fieldIds.mailingReferences)?.toString(),
          ),
          phone: data.get(fieldIds.mailingPhone)?.toString() ?? "",
        },
      },
      userParticipation: {
        role: "CONTESTANT", // TODO: Add more roles
        schoolName: data.get(fieldIds.schoolName)?.toString() ?? "",
        schoolStage,
        schoolGrade: Number(data.get(fieldIds.schoolGrade)?.toString()),
      },
    };

    console.log(request);
    setLoading(true);
    const response = await sendUpsertParticipation(request);
    if (!response.success) {
      setError(response.error);
    } else {
      setSuccessfulUpsert(true);
    }
    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-3xl px-2 pt-4">
      <h2 className="text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
        Registro {ofmiEdition}
        <sup>a</sup> OFMI
      </h2>
      <form
        className="mb-8"
        action="#"
        method="POST"
        onSubmit={(ev) => handleSubmit(ev)}
        hidden={status !== "authenticated"}
      >
        {/* Personal information */}
        <PersonalDetails />
        {/* Mailing address */}
        <MailingAddress />
        {/* School */}
        <SchoolDetails />
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
      {error == null && successfulUpsert && (
        <SuccessAlert text="Hemos registrado tus datos correctamente." />
      )}
      {status === "unauthenticated" && (
        <Alert errorMsg="Para registrarte a la OFMI, primero debes iniciar sesión." />
      )}
    </div>
  );
}
