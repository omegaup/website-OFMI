import { useEffect, useState, ChangeEvent } from "react";
import useSWR from "swr";
import { SectionTitle } from "./sectionTitle";
import { VenueQuota } from "@/types/venue.schema";
import { Alert } from "../alert";

const fetcher = async <T,>(url: string): Promise<T> => {
  const res = await fetch(url);
  return res.json();
};

const EmptyVenues: React.FC = () => {
  return (
    <div className="my-4 rounded-md bg-blue-50 p-4 sm:col-span-6">
      <h4 className="text-sm font-bold text-blue-800">
        No hay sedes disponibles.
      </h4>
      <p className="mt-1 text-sm text-blue-700">
        No te preocupes, puedes enviarnos un correo a{" "}
        <a href="mailto:ofmi@omegaup.com" className="underline">
          ofmi@omegaup.com
        </a>{" "}
        para dar seguimiento a tu participación.
      </p>
    </div>
  );
};

const RequiredVenue: React.FC = () => {
  return (
    <div className="my-4 rounded-md bg-red-50 p-4 sm:col-span-6">
      <h4 className="text-sm font-bold text-red-800">
        Es necesario seleccionar una sede.
      </h4>
      <p className="mt-1 text-sm text-red-700">
        Por favor, selecciona una sede de participación; en caso de no poder
        asistir a ninguna sede, puedes enviarnos un correo a{" "}
        <a href="mailto:ofmi@omegaup.com" className="underline">
          ofmi@omegaup.com
        </a>{" "}
        para dar seguimiento a tu participación.
      </p>
    </div>
  );
};

interface VenueSelectionProps {
  ofmiEdition: number;
  subtitle?: string;
  selectedVenueId: string;
  setSelectedVenueId: (venueId: string) => void;
}

function sortAlphabetically(a: VenueQuota, b: VenueQuota): number {
  if (a.venue.state === b.venue.state) {
    return a.venue.name.localeCompare(b.venue.name);
  }
  return a.venue.state.localeCompare(b.venue.state);
}

export function VenueSelection({
  ofmiEdition,
  selectedVenueId,
  subtitle = "Sedes Disponibles",
  setSelectedVenueId,
}: VenueSelectionProps): JSX.Element {
  const { data, error, isLoading } = useSWR<{ venues: VenueQuota[] }>(
    `/api/ofmi/venues?ofmiEdition=${ofmiEdition}`,
    fetcher,
  );

  const [sortedVenues, setSortedVenues] = useState<VenueQuota[]>([]);

  useEffect((): void => {
    if (data?.venues) {
      const availableVenues = data.venues.filter((venue) => {
        if (selectedVenueId && venue.id === selectedVenueId) return true;
        if (venue.capacity > venue.occupied) return true;
        return false;
      });
      setSortedVenues(availableVenues.sort(sortAlphabetically));
    }
  }, [data, selectedVenueId]);

  if (error) return <Alert errorMsg="Error cargando sedes disponibles" />;
  if (isLoading)
    return <div className="p-4 text-center">Cargando sedes...</div>;
  if (!sortedVenues.length) return <EmptyVenues />;

  const selectedVenue = sortedVenues.find((v) => v.id === selectedVenueId);

  return (
    <>
      {!selectedVenueId ? <RequiredVenue /> : <></>}
      <div className="border-b border-gray-900/10 pb-12">
        <SectionTitle title="Sede de Participación" />

        <input type="hidden" name="venueQuotaId" value={selectedVenueId} />

        <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
          <div className="sm:col-span-4">
            <label
              htmlFor="venue-select"
              className="block text-sm font-medium capitalize leading-6 text-gray-900"
            >
              {subtitle}
            </label>
            <div className="mt-2">
              <select
                id="venue-select"
                value={selectedVenueId}
                onChange={(e: ChangeEvent<HTMLSelectElement>): void => {
                  setSelectedVenueId(e.target.value);
                }}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset
       focus:ring-blue-600 sm:max-w-md sm:text-sm sm:leading-6"
              >
                <option value="">-- Selecciona una sede --</option>
                {sortedVenues.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.venue.state} - {v.venue.name} (
                    {v.capacity - (v.occupied || 0)} lugares)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedVenue && (
            <div className="rounded-md bg-blue-50 p-4 sm:col-span-6">
              <h4 className="text-sm font-bold text-blue-800">
                Detalles de la Sede
              </h4>
              <p className="mt-1 text-sm text-blue-700">
                <strong>Dirección:</strong> {selectedVenue.venue.address}
              </p>
              {selectedVenue.venue.googleMapsUrl && (
                <a
                  href={selectedVenue.venue.googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-sm font-medium text-blue-600 underline hover:text-blue-500"
                >
                  Ver en Google Maps
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
