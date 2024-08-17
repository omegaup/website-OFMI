import { Button } from "@/components/button";
import { Alert } from "@/components/alert";
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

export default function Registro({
  ofmiEdition,
}: {
  ofmiEdition: number;
}): JSX.Element {
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);
  const [successfulUpsert, setSuccessfulUpsert] = useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    setError(null);

    const data = new FormData(event.currentTarget);
    console.log(data);
    data.forEach((value, key) => console.log(`${key}: ${value}`));

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

    console.log({
      pronouns,
      shirtSize,
      birthDate,
      shirtStyle,
      schoolStage,
    });

    if (!pronouns || !shirtSize || !birthDate || !shirtStyle || !schoolStage) {
      return setError(new Error("Todos los campos son requeridos"));
    }

    const request: UpsertParticipationRequest = {
      ofmiEdition,
      country: data.get(fieldIds.schoolCountry)?.toString() ?? "",
      state: data.get(fieldIds.schoolState)?.toString() ?? "",
      user: {
        email: "", // TODO: Add email
        firstName: data.get(fieldIds.firstName)?.toString() ?? "",
        lastName: data.get(fieldIds.lastName)?.toString() ?? "",
        preferredName: data.get(fieldIds.preferredName)?.toString() ?? "",
        birthDate: new Date(birthDate),
        governmentId: data.get(fieldIds.governmentId)?.toString() ?? "",
        pronouns,
        shirtSize,
        shirtStyle,
        mailingAddress: {
          recipient: data.get(fieldIds.mailingRecipient)?.toString() ?? "",
          street: data.get(fieldIds.mailingStreet)?.toString() ?? "",
          externalNumber:
            data.get(fieldIds.mailingExternalNumber)?.toString() ?? "",
          internalNumber: data.get(fieldIds.mailingInternalNumber)?.toString(),
          zipcode: data.get(fieldIds.mailingZipcode)?.toString() ?? "",
          country: data.get(fieldIds.mailingCountry)?.toString() ?? "",
          state: data.get(fieldIds.mailingState)?.toString() ?? "",
          municipality: data.get(fieldIds.mailingMunicipality)?.toString(),
          locality: data.get(fieldIds.mailingLocality)?.toString(),
          references: data.get(fieldIds.mailingReferences)?.toString(),
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
      <form
        className="mb-8"
        action="#"
        method="POST"
        onSubmit={(ev) => handleSubmit(ev)}
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
            Submit
          </Button>
        </div>
      </form>
      {error != null && <Alert errorMsg={error.message} />}
    </div>
  );
}
