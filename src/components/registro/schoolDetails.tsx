import { useState } from "react";
import { FloatingInput } from "@/components/input/FloatingInput";
import { SectionTitle } from "./sectionTitle";
import { LocationFields } from "./locationFields";
import { fieldIds } from "./constants";
import { SchoolStage } from "@prisma/client";
import { SchoolStageName } from "@/types/school";
import type { ContestantParticipationInput } from "@/types/participation.schema";

export function SchoolDetails({
  contestantParticipation,
}: {
  contestantParticipation: ContestantParticipationInput | null;
}): JSX.Element {
  const [schoolStageValue, setSchoolStage] = useState<string | undefined>(
    contestantParticipation?.schoolStage,
  );
  const schoolGrades = schoolStageValue
    ? schoolStageValue === "elementary"
      ? 6
      : 3
    : undefined;

  return (
    <div>
      <SectionTitle title="Escolaridad" />
      <div className="grid md:grid-cols-2 md:gap-6">
        <FloatingInput
          type="text"
          label="Nombre de la escuela *"
          id={fieldIds.schoolName}
          defaultValue={contestantParticipation?.schoolName}
          required
        />
        <LocationFields
          countryFieldId={fieldIds.schoolCountry}
          stateFieldId={fieldIds.schoolState}
          defaultCountryValue={contestantParticipation?.schoolCountry}
          defaultStateValue={contestantParticipation?.schoolState}
          onlyCountryState
          required
        />
      </div>
      <div className="grid md:grid-cols-4 md:gap-6">
        <div className="group relative z-0 mb-5 w-full">
          <select
            id={fieldIds.schoolStage}
            name={fieldIds.schoolStage}
            className="peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent px-0 py-2.5 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0"
            value={schoolStageValue}
            onChange={(ev) => {
              ev.preventDefault();
              setSchoolStage(ev.target.value);
            }}
            required
          >
            <option value=""></option>
            {Object.values(SchoolStage).map((value) => {
              return (
                <option key={value} value={value}>
                  {SchoolStageName(value)}
                </option>
              );
            })}
          </select>
          <label
            htmlFor={fieldIds.schoolStage}
            className="absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:start-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600 rtl:peer-focus:left-auto rtl:peer-focus:translate-x-1/4"
          >
            Escolaridad *
          </label>
        </div>
        <div className="group relative z-0 mb-5 w-full">
          <select
            id={fieldIds.schoolGrade}
            name={fieldIds.schoolGrade}
            defaultValue={contestantParticipation?.schoolGrade}
            className="peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent px-0 py-2.5 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0"
            required
          >
            <option value=""></option>
            {schoolGrades &&
              Array.from(Array(schoolGrades).keys()).map((_, index) => {
                const grade = index + 1;
                return (
                  <option value={grade} key={index}>
                    {grade}°
                  </option>
                );
              })}
          </select>
          <label
            htmlFor={fieldIds.schoolGrade}
            className="absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:start-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600 rtl:peer-focus:left-auto rtl:peer-focus:translate-x-1/4"
          >
            Grado / Año *
          </label>
        </div>
      </div>
    </div>
  );
}
