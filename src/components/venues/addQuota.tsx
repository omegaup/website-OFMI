import { SectionTitle } from "../contactData/sectionTitle";
import {
  AvailableVenues,
  CreateVenueQuotaInput,
} from "../../types/venue.schema";
import { useState } from "react";
import { FloatingInput } from "../input/FloatingInput";
import { Button } from "../button";
import { sendCreateUpdateVenueQuota } from "./client";
import { Alert } from "../alert";

export function AddVenueQuota({
  availableVenues,
  ofmiId,
}: {
  availableVenues: AvailableVenues;
  ofmiId: string;
}): JSX.Element {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [response, setResponse] = useState<string | null>(null);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    setError(null);

    const data = new FormData(event.currentTarget);

    const venueId = data.get("venueId")?.toString();

    if (!venueId || venueId === "") {
      return setError(new Error("Selecciona una sede para añadir el cupo"));
    }
    const quota = data.get("quota")?.toString();
    if (!quota) {
      return setError(new Error("Proporciona una capacidad para la sede"));
    }

    const quotaNum = parseInt(quota);

    if (quotaNum <= 0) {
      return setError(new Error("La cuota debe ser al menos 1"));
    }

    const req: CreateVenueQuotaInput = {
      ofmiId: ofmiId,
      venueId: venueId,
      capacity: quotaNum,
    };

    setLoading(true);
    const response = await sendCreateUpdateVenueQuota(req);
    if (!response.success) {
      setError(response.error);
    } else {
      setResponse("Se agrego la capacidad de la sede correctamente");
    }
    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-3xl px-2 pt-4">
      <div>
        <SectionTitle title="Agregar sedes" />
        <form
          className="space-y-6"
          action="#"
          method="POST"
          onSubmit={(ev) => handleSubmit(ev)}
        >
          <select id="venueId" name="venueId" required>
            <option value=""></option>
            {availableVenues &&
              availableVenues.map((v) => {
                return (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                );
              })}
          </select>

          <FloatingInput
            type="number"
            id="quota"
            name="quota"
            required
            label="Capacidad de la sede"
          />

          <div className="flex justify-center">
            <Button
              type="submit"
              className="min-w-full md:w-64 md:min-w-0"
              disabled={loading}
            >
              {"Registrar cuota para sede"}
            </Button>
          </div>
        </form>
        {error != null && <Alert errorMsg={error.message} />}
        {response && (
          <div>
            <div className="mt-6 rounded-md border border-gray-300 bg-gray-100 p-4">
              <pre className="whitespace-pre-wrap break-words">{response}</pre>
            </div>

            <button
              onClick={(ev) => {
                ev.preventDefault();
                setResponse(null);
              }}
            >
              Cerrar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
