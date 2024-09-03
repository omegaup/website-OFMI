import { ParticipationRequestInput } from "@/types/participation.schema";
import { SectionTitle } from "./sectionTitle";

export function VolunteerDetails({
  participation,
}: {
  participation: ParticipationRequestInput | null;
}): JSX.Element {
  const volunteer = participation?.userParticipation;
  if (volunteer?.role !== "VOLUNTEER") {
    return <></>;
  }
  return (
    <div>
      <SectionTitle title="Datos de voluntario" />
    </div>
  );
}
