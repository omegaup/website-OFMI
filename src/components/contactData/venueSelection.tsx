import { useEffect, useState } from "react";
import useSWR from "swr";
import { SectionTitle } from "./sectionTitle";
import { VenueQuota } from "@/types/venue.schema";
import { Alert } from "../alert";
import { fieldIds } from "./constants";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface VenueSelectionProps {
  ofmiEdition: number;
  initialVenueQuotaId?: string;
}

// futura implementacion de feature si queremos orden por distancia
function getDistanceFromLatLonInKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) {
  const R = 6371; 
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; 
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

function sortAlphabetically(a: VenueQuota, b: VenueQuota) {
  if (a.venue.state === b.venue.state) {
    return a.venue.name.localeCompare(b.venue.name);
  }
  return a.venue.state.localeCompare(b.venue.state);
}

export function VenueSelection({
  ofmiEdition,
  initialVenueQuotaId,
}: VenueSelectionProps) {
  const { data, error, isLoading } = useSWR<{ venues: VenueQuota[] }>(
    `/api/ofmi/venues?ofmiEdition=${ofmiEdition}`,
    fetcher,
  );
  
  const [sortedVenues, setSortedVenues] = useState<VenueQuota[]>([]);
  const [selectedVenueId, setSelectedVenueId] = useState<string>(
    initialVenueQuotaId || "",
  );
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    if (data?.venues) {
      setSortedVenues([...data.venues].sort(sortAlphabetically));
    }
  }, [data]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            setPermissionDenied(true);
          }
        },
      );
    }
  }, []);

  useEffect(() => {
    if (userLocation && data?.venues) {
      // Sort by distance
    }
  }, [userLocation, data]);

  if (error) return <Alert errorMsg="Error cargando sedes disponibles" />;
  if (isLoading) return <div className="text-center p-4">Cargando sedes...</div>;

  const selectedVenue = sortedVenues.find((v) => v.id === selectedVenueId);

  return (
    <div className="border-b border-gray-900/10 pb-12">
      <SectionTitle
        title="Sede de Participación"
        subtitle="Selecciona el lugar donde presentarás el examen."
      />

      <input type="hidden" name="venueQuotaId" value={selectedVenueId} />

      <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
        <div className="sm:col-span-4">
          <label
            htmlFor="venue-select"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Sede Disponible
          </label>
          <div className="mt-2">
            <select
              id="venue-select"
              value={selectedVenueId}
              onChange={(e) => setSelectedVenueId(e.target.value)}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:max-w-md sm:text-sm sm:leading-6"
            >
              <option value="">-- Selecciona una sede --</option>
              {sortedVenues.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.venue.state} - {v.venue.name} ({v.capacity - (v.occupied || 0)} lugares)
                </option>
              ))}
            </select>
            {permissionDenied && (
              <p className="mt-1 text-xs text-gray-500">
                (Activa tu ubicación para ver las sedes más cercanas primero)
              </p>
            )}
          </div>
        </div>

        {selectedVenue && (
          <div className="sm:col-span-6 rounded-md bg-blue-50 p-4">
            <h4 className="text-sm font-bold text-blue-800">Detalles de la Sede</h4>
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
  );
}
