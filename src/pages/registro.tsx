import { FloatingInput } from "@/components/input/FloatingInput";
import { stateNames, municipalityNames, localityNames } from "@/lib/address";
import { useState } from "react";

function SectionTitle({ title }: { title: string }): JSX.Element {
  return (
    <h2 className="my-2 text-center text-xl font-bold leading-9 tracking-tight text-gray-900">
      {title}
    </h2>
  );
}

function LocationFields({
  idPrefix,
  onlyCountryState = false,
}: {
  idPrefix: string;
  onlyCountryState?: boolean;
}): JSX.Element {
  const [country, setCountry] = useState("MEX");
  const states = stateNames(country); // TODO: Cambiar con el valor del current
  const [state, setState] = useState<string | undefined>();
  if (state && !states.includes(state)) {
    setState(undefined);
  }
  const municipalities = state ? municipalityNames(country, state) : [];
  const [municipality, setMunicipality] = useState(municipalities.at(0));
  if (
    (!municipality && municipalities.length > 0) ||
    (municipality && !municipalities.includes(municipality))
  ) {
    setMunicipality(municipalities.at(0));
  }
  const localities =
    state && municipality ? localityNames(country, state, municipality) : [];

  return (
    <div
      className={`grid md:grid-cols-${onlyCountryState ? "2" : "4"} md:gap-6`}
    >
      <div className="group relative z-0 mb-5 w-full">
        <select
          id={`${idPrefix}_country`}
          value={country}
          onChange={(ev) => {
            ev.preventDefault();
            setCountry(ev.target.value);
          }}
          className="peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent px-0 py-2.5 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0"
        >
          <option value="MEX">México</option>
          <option value="USA">Estados Unidos</option>
          <option value="Other">Otro</option>
        </select>
        <label
          htmlFor={`${idPrefix}_country`}
          className="absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:start-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600 rtl:peer-focus:left-auto rtl:peer-focus:translate-x-1/4"
        >
          País
        </label>
      </div>
      <div className="group relative z-0 mb-5 w-full">
        <select
          id={`${idPrefix}_state`}
          className="peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent px-0 py-2.5 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0"
          value={state}
          onChange={(ev) => {
            ev.preventDefault();
            setState(ev.target.value);
          }}
        >
          <option value=""></option>
          {states.map((name) => (
            <option value={name} key={name}>
              {name}
            </option>
          ))}
        </select>
        <label
          htmlFor={`${idPrefix}_state`}
          className="absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:start-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600 rtl:peer-focus:left-auto rtl:peer-focus:translate-x-1/4"
        >
          Estado
        </label>
      </div>
      {onlyCountryState ? (
        <></>
      ) : (
        <>
          <div className="group relative z-0 mb-5 w-full">
            <select
              id={`${idPrefix}_municipality`}
              className="peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent px-0 py-2.5 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0"
              value={municipality}
              onChange={(ev) => {
                ev.preventDefault();
                setMunicipality(ev.target.value);
              }}
            >
              {municipalities.map((name) => (
                <option value={name} key={name}>
                  {name}
                </option>
              ))}
            </select>
            <label
              htmlFor={`${idPrefix}_municipality`}
              className="absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:start-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600 rtl:peer-focus:left-auto rtl:peer-focus:translate-x-1/4"
            >
              Delegación / Municipio
            </label>
          </div>
          <div className="group relative z-0 mb-5 w-full">
            <select
              id={`${idPrefix}_locality`}
              className="peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent px-0 py-2.5 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0"
            >
              {localities.map((name) => (
                <option value={name} key={name}>
                  {name}
                </option>
              ))}
            </select>
            <label
              htmlFor={`${idPrefix}_locality`}
              className="absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:start-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600 rtl:peer-focus:left-auto rtl:peer-focus:translate-x-1/4"
            >
              Localidad
            </label>
          </div>
        </>
      )}
    </div>
  );
}

function PersonalDetails(): JSX.Element {
  return (
    <div>
      <SectionTitle title="Datos de contacto" />
      <div className="grid md:grid-cols-2 md:gap-6">
        <FloatingInput type="text" label="Nombre(s)" id="first_name" required />
        <FloatingInput
          type="text"
          label="Apellido(s)"
          id="last_name"
          required
        />
      </div>
      <div className="grid md:grid-cols-2 md:gap-6">
        <FloatingInput
          type="text"
          id="preferred_name"
          label="Nombre preferido"
          placeholder=" "
        />
        <div className="group relative z-0 mb-5 w-full">
          <select
            id="pronouns"
            defaultValue={"Her"}
            className="peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent px-0 py-2.5 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0"
          >
            <option value="ella">Ella</option>
            <option value="elle">Elle</option>
            <option value="el">Él</option>
            <option value="other">Otro</option>
          </select>
          <label
            htmlFor="pronouns"
            className="absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:start-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600 rtl:peer-focus:left-auto rtl:peer-focus:translate-x-1/4"
          >
            Pronombre
          </label>
        </div>
      </div>
      <div className="grid md:grid-cols-2 md:gap-6">
        <FloatingInput
          type="date"
          id="birth_date"
          label="Fecha de nacimiento"
          placeholder=" "
          required
        />
        <FloatingInput
          type="text"
          id="government_id"
          label="CURP"
          placeholder=" "
          required
        />
      </div>
    </div>
  );
}

function MailingAddress(): JSX.Element {
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
        <div>
          <FloatingInput type="text" id="references" label="Referencia(s)" />
        </div>
      </div>
    </div>
  );
}

function ScoolDetails(): JSX.Element {
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

export default function Registro(): JSX.Element {
  return (
    <form className="mx-auto max-w-3xl px-2 pt-4">
      {/* Personal information */}
      <PersonalDetails />
      {/* Mailing address */}
      <MailingAddress />
      {/* School */}
      <ScoolDetails />
      {/* Submit form */}
      <button
        type="submit"
        className="w-full rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 sm:w-auto"
      >
        Submit
      </button>
    </form>
  );
}
