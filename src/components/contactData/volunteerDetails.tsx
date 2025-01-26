import { ParticipationRequestInput } from "@/types/participation.schema";
import { SectionTitle } from "./sectionTitle";
import { fieldIds } from "./constants";

const OptIn = ({
  id,
  label,
  defaultChecked,
}: {
  id: string;
  label: string;
  defaultChecked?: boolean;
}): JSX.Element => {
  return (
    <div className="peer block w-full appearance-none border-gray-300 bg-transparent px-0 py-2.5 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0">
      <label>
        <input
          id={id}
          name={id}
          className="mx-2"
          type="checkbox"
          defaultChecked={defaultChecked}
        />
        {label}
      </label>
    </div>
  );
};

export function VolunteerDetails({
  participation,
}: {
  participation: ParticipationRequestInput | null;
}): JSX.Element {
  const volunteer = participation?.userParticipation;
  if (volunteer && volunteer.role !== "VOLUNTEER") {
    return <></>;
  }

  return (
    <div>
      <SectionTitle title="Datos de voluntario" />
      <div className="group relative z-0 mb-5 w-full">
        <div className="peer block w-full appearance-none border-gray-300 bg-transparent px-0 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0">
          ¿En qué área(s) te gustaría ayudar?
        </div>
        <OptIn
          id={fieldIds.problemSetterOptIn}
          label="Desarrollo de problemas y concursos"
          defaultChecked={volunteer?.problemSetterOptIn}
        ></OptIn>
        <OptIn
          id={fieldIds.trainerOptIn}
          label="Entrenamientos"
          defaultChecked={volunteer?.trainerOptIn}
        ></OptIn>
        <OptIn
          id={fieldIds.mentorOptIn}
          label="Mentorías"
          defaultChecked={volunteer?.mentorOptIn}
        ></OptIn>
        <OptIn
          id={fieldIds.fundraisingOptIn}
          label="Recaudación de fondos"
          defaultChecked={volunteer?.fundraisingOptIn}
        ></OptIn>
        <OptIn
          id={fieldIds.communityOptIn}
          label="Redes sociales"
          defaultChecked={volunteer?.communityOptIn}
        ></OptIn>
        <OptIn
          id={fieldIds.educationalLinkageOptIn}
          label="Vinculación académica"
          defaultChecked={volunteer?.educationalLinkageOptIn}
        ></OptIn>
        <div className="peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent px-0 py-2.5 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0"></div>
      </div>
    </div>
  );
}
