import { FloatingInput } from "@/components/input/FloatingInput";
import { SectionTitle } from "./sectionTitle";
import { LocationFields } from "./locationFields";
import { fieldIds } from "./constants";

export function MailingAddress(): JSX.Element {
  return (
    <div>
      <SectionTitle title="Dirección de envío" />
      <div className="grid md:grid-cols-2 md:gap-6">
        <div>
          <FloatingInput
            type="text"
            id={fieldIds.mailingStreet}
            label="Calle"
            required
          />
        </div>
        <div className="grid md:grid-cols-2 md:gap-6">
          <FloatingInput
            type="text"
            label="No. Exterior"
            id={fieldIds.mailingExternalNumber}
            required
          />
          <FloatingInput
            type="text"
            label="No. Interior"
            id={fieldIds.mailingInternalNumber}
          />
        </div>
      </div>

      <LocationFields idPrefix="mailing" required></LocationFields>

      <div className="grid md:grid-cols-2 md:gap-6">
        <div className="grid md:grid-cols-2 md:gap-6">
          <FloatingInput
            type="text"
            label="Código Postal"
            id={fieldIds.mailingZipcode}
            onChange={(ev) => {
              ev.preventDefault();
              ev.target.value = ev.target.value.replace(/\D/g, "").slice(0, 5);
            }}
            required
          />
          <FloatingInput
            type="text"
            label="Número de teléfono"
            id={fieldIds.mailingPhone}
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
        />
      </div>

      <div className="grid md:grid-cols-2 md:gap-6">
        <FloatingInput
          type="text"
          id={fieldIds.mailingReferences}
          label="Referencia(s)"
        />
      </div>
    </div>
  );
}
