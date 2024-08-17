import { FloatingInput } from "@/components/input/FloatingInput";
import { SectionTitle } from "./sectionTitle";
import { LocationFields } from "./locationFields";

export function MailingAddress(): JSX.Element {
  return (
    <div>
      <SectionTitle title="Dirección de envío" />
      <div className="grid md:grid-cols-2 md:gap-6">
        <div>
          <FloatingInput type="text" id="street" label="Calle" required />
        </div>
        <div className="grid md:grid-cols-2 md:gap-6">
          <FloatingInput
            type="text"
            label="No. Exterior"
            id="external_number"
            required
          />
          <FloatingInput
            type="text"
            label="No. Interior"
            id="internal_number"
          />
        </div>
      </div>

      <LocationFields idPrefix="mailing"></LocationFields>

      <div className="grid md:grid-cols-2 md:gap-6">
        <div className="grid md:grid-cols-2 md:gap-6">
          <FloatingInput
            type="text"
            label="Código Postal"
            id="zip_code"
            onChange={(ev) => {
              ev.preventDefault();
              ev.target.value = ev.target.value.replace(/\D/g, "").slice(0, 5);
            }}
            required
          />
          <FloatingInput
            type="text"
            label="Número de teléfono"
            id="phone"
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
          id="recipient"
          onChange={(ev) => {
            ev.preventDefault();
            ev.target.value = ev.target.value.replace(/\D/g, "").slice(0, 10);
          }}
          required
        />
      </div>

      <div className="grid md:grid-cols-2 md:gap-6">
        <FloatingInput type="text" id="references" label="Referencia(s)" />
      </div>
    </div>
  );
}
