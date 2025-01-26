import { FloatingInput } from "@/components/input/FloatingInput";
import { SectionTitle } from "./sectionTitle";
import { LocationFields } from "./locationFields";
import { fieldIds } from "./constants";
import { ParticipationRequestInput } from "@/types/participation.schema";
import { UserRequestInput } from "@/types/user.schema";

export function MailingAddress({
  participation,
}: {
  participation: ParticipationRequestInput | null;
}): JSX.Element {
  const address = participation?.user.mailingAddress;
  return (
    <div>
      <SectionTitle title="Dirección de envío" />
      <div className="grid md:grid-cols-2 md:gap-6">
        <div>
          <FloatingInput
            type="text"
            id={fieldIds.mailingStreet}
            label="Calle *"
            defaultValue={address?.street}
            required
          />
        </div>
        <div className="grid md:grid-cols-2 md:gap-6">
          <FloatingInput
            type="text"
            label="No. Exterior *"
            id={fieldIds.mailingExternalNumber}
            defaultValue={address?.externalNumber}
            required
          />
          <FloatingInput
            type="text"
            label="No. Interior"
            defaultValue={address?.internalNumber}
            id={fieldIds.mailingInternalNumber}
          />
        </div>
      </div>

      <LocationFields
        countryFieldId={fieldIds.mailingCountry}
        stateFieldId={fieldIds.mailingState}
        municipalityFieldId={fieldIds.mailingMunicipality}
        localityFieldId={fieldIds.mailingLocality}
        defaultCountryValue={address?.country}
        defaultStateValue={address?.state}
        defaultMunicipalityValue={address?.municipality}
        defaultLocalityValue={address?.locality}
        required
      ></LocationFields>

      <div className="grid md:grid-cols-2 md:gap-6">
        <div className="grid md:grid-cols-2 md:gap-6">
          <FloatingInput
            type="text"
            label="Código Postal *"
            defaultValue={address?.zipcode}
            id={fieldIds.mailingZipcode}
            onChange={(ev) => {
              ev.preventDefault();
              ev.target.value = ev.target.value.replace(/\D/g, "").slice(0, 5);
            }}
            required
          />
          <FloatingInput
            type="text"
            label="Número de teléfono *"
            id={fieldIds.mailingPhone}
            defaultValue={address?.phone}
            onChange={(ev) => {
              ev.preventDefault();
              ev.target.value = ev.target.value.replace(/\D/g, "").slice(0, 10);
            }}
            required
          />
        </div>
        <FloatingInput
          type="text"
          label="Nombre de la persona que recibe"
          id={fieldIds.mailingRecipient}
          defaultValue={address?.recipient}
        />
      </div>

      <div className="grid md:grid-cols-2 md:gap-6">
        <FloatingInput
          type="text"
          id={fieldIds.mailingReferences}
          label="Referencia(s)"
          defaultValue={address?.references}
        />
      </div>
    </div>
  );
}

export function UserMailingAddress({
  user,
}: {
  user: UserRequestInput | null;
}): JSX.Element {
  const address = user?.mailingAddress;
  return (
    <div>
      <SectionTitle title="Dirección de envío" />
      <div className="grid md:grid-cols-2 md:gap-6">
        <div>
          <FloatingInput
            type="text"
            id={fieldIds.mailingStreet}
            label="Calle *"
            defaultValue={address?.street}
            required
          />
        </div>
        <div className="grid md:grid-cols-2 md:gap-6">
          <FloatingInput
            type="text"
            label="No. Exterior *"
            id={fieldIds.mailingExternalNumber}
            defaultValue={address?.externalNumber}
            required
          />
          <FloatingInput
            type="text"
            label="No. Interior"
            defaultValue={address?.internalNumber}
            id={fieldIds.mailingInternalNumber}
          />
        </div>
      </div>

      <LocationFields
        countryFieldId={fieldIds.mailingCountry}
        stateFieldId={fieldIds.mailingState}
        municipalityFieldId={fieldIds.mailingMunicipality}
        localityFieldId={fieldIds.mailingLocality}
        defaultCountryValue={address?.country}
        defaultStateValue={address?.state}
        defaultMunicipalityValue={address?.municipality}
        defaultLocalityValue={address?.locality}
        required
      ></LocationFields>

      <div className="grid md:grid-cols-2 md:gap-6">
        <div className="grid md:grid-cols-2 md:gap-6">
          <FloatingInput
            type="text"
            label="Código Postal *"
            defaultValue={address?.zipcode}
            id={fieldIds.mailingZipcode}
            onChange={(ev) => {
              ev.preventDefault();
              ev.target.value = ev.target.value.replace(/\D/g, "").slice(0, 5);
            }}
            required
          />
          <FloatingInput
            type="text"
            label="Número de teléfono *"
            id={fieldIds.mailingPhone}
            defaultValue={address?.phone}
            onChange={(ev) => {
              ev.preventDefault();
              ev.target.value = ev.target.value.replace(/\D/g, "").slice(0, 10);
            }}
            required
          />
        </div>
        <FloatingInput
          type="text"
          label="Nombre de la persona que recibe"
          id={fieldIds.mailingRecipient}
          defaultValue={address?.recipient}
        />
      </div>

      <div className="grid md:grid-cols-2 md:gap-6">
        <FloatingInput
          type="text"
          id={fieldIds.mailingReferences}
          label="Referencia(s)"
          defaultValue={address?.references}
        />
      </div>
    </div>
  );
}
