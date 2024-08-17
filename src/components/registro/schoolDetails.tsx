import { useState } from "react";
import { FloatingInput } from "@/components/input/FloatingInput";
import { SectionTitle } from "./sectionTitle";
import { LocationFields } from "./locationFields";

export function SchoolDetails(): JSX.Element {
  const [schoolStage, setSchoolStage] = useState<string | undefined>();
  const schoolGrades = schoolStage
    ? schoolStage === "elementary"
      ? 6
      : 3
    : undefined;
  return (
    <div>
      <SectionTitle title="Escolaridad" />
      <div className="grid md:grid-cols-2 md:gap-6">
        <FloatingInput
          type="text"
          label="Nombre de la escuela"
          id="school_name"
          required
        />
        <LocationFields idPrefix="school" onlyCountryState />
      </div>
      <div className="grid md:grid-cols-4 md:gap-6">
        <div className="group relative z-0 mb-5 w-full">
          <select
            id="school_stage"
            className="peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent px-0 py-2.5 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0"
            value={schoolStage}
            onChange={(ev) => {
              ev.preventDefault();
              setSchoolStage(ev.target.value);
            }}
          >
            <option value=""></option>
            <option value="elementary">Primaria</option>
            <option value="secondary">Secundaria</option>
            <option value="high">Preparatoria / Bachillerato</option>
          </select>
          <label
            htmlFor="school_stage"
            className="absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:start-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600 rtl:peer-focus:left-auto rtl:peer-focus:translate-x-1/4"
          >
            Escolaridad
          </label>
        </div>
        <div className="group relative z-0 mb-5 w-full">
          <select
            id="school_grade"
            className="peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent px-0 py-2.5 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0"
          >
            <option value=""></option>
            {schoolGrades ? (
              Array.from(Array(schoolGrades).keys()).map((_, index) => {
                const grade = index + 1;
                return (
                  <option value={grade} key={index}>
                    {grade}°
                  </option>
                );
              })
            ) : (
              <></>
            )}
          </select>
          <label
            htmlFor="school_stage"
            className="absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:start-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600 rtl:peer-focus:left-auto rtl:peer-focus:translate-x-1/4"
          >
            Grado
          </label>
        </div>
      </div>
    </div>
  );
}
