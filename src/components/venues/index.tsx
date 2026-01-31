import { UpsertQuota } from "./upsertQuota";
import { AddVenues } from "./addVenue";
import { AvailableVenues } from "@/types/venue.schema";

export default function Venues({
  allVenues,
  ofmiId,
}: {
  allVenues: AvailableVenues;
  ofmiId: string;
}): JSX.Element {
  return (
    <div className="mx-auto max-w-3xl px-2 pt-4">
      <h2 className="text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
        Administración de sedes
      </h2>
      <AddVenues />
      <UpsertQuota availableVenues={allVenues} ofmiId={ofmiId} />
    </div>
  );
}
