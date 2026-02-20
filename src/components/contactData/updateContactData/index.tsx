import { Button } from "@/components/button";
import { Alert, SuccessAlert } from "@/components/alert";
import { UserMailingAddress } from "../mailingAddress";
import { ContactData } from "../personalDetails";
import { fieldIds } from "../constants";
import { useEffect, useState } from "react";
import { PronounsOfString } from "@/types/pronouns";
import { ShirtStyleOfString } from "@/types/shirt";
import { ShirtSize } from "@prisma/client";
import { useSession } from "next-auth/react";
import { undefinedIfEmpty } from "@/utils";
import { sendUpdateContactData } from "./client";
import {
  type UpdateContactDataRequest,
  type UserRequestInput,
} from "@/types/user.schema";
import { VenueSelection } from "../venueSelection";

export default function UpdateContactData({
  user,
  ofmiEdition,
  venueId,
}: {
  user: UserRequestInput | null;
  ofmiEdition: number;
  venueId: string | null;
}): JSX.Element {
  const { data: session } = useSession();
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);
  const [successfulUpdate, setSuccessfulUpdate] = useState(false);
  const [selectedVenueId, setSelectedVenueId] = useState<string>("");

  useEffect(() => {
    setSelectedVenueId(venueId ?? "");
  }, [venueId]);

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

    const request: UpdateContactDataRequest = {
      user: {
        email,
        firstName: data.get(fieldIds.firstName)?.toString() ?? "",
        lastName: data.get(fieldIds.lastName)?.toString() ?? "",
        preferredName: undefinedIfEmpty(
          data.get(fieldIds.preferredName)?.toString(),
        ),
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
      venueQuotaId: selectedVenueId,
    };

    setLoading(true);
    const response = await sendUpdateContactData(request);
    if (!response.success) {
      setError(response.error);
    } else {
      setSuccessfulUpdate(true);
    }
    setLoading(false);
  }

  if (successfulUpdate) {
    return (
      <div className="mx-auto max-w-3xl px-2 pt-4">
        <SuccessAlert text="Hemos actualizado tus datos correctamente." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-2 pt-4">
      <h2 className="text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
        Actualizar datos
      </h2>
      <form
        className="mb-8"
        action="#"
        method="POST"
        onSubmit={(ev) => handleSubmit(ev)}
      >
        {/* Personal information */}
        <ContactData user={user} isUpdate={true} />
        {/* Mailing address */}
        <UserMailingAddress user={user} />
        <VenueSelection
          ofmiEdition={ofmiEdition}
          selectedVenueId={selectedVenueId}
          setSelectedVenueId={setSelectedVenueId}
          subtitle="Sede Seleccionada"
        />

        {/* Submit form */}
        <div className="flex justify-center">
          <Button
            type="submit"
            className="min-w-full md:w-64 md:min-w-0"
            disabled={loading || selectedVenueId === ""}
          >
            {"Guardar cambios"}
          </Button>
        </div>
      </form>
      {error != null && <Alert errorMsg={error.message} />}
    </div>
  );
}
