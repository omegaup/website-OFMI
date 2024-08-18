import { localityNames, municipalityNames, stateNames } from "@/lib/address";
import { useState } from "react";

export const LocationFields = ({
  onlyCountryState = false,
  countryFieldId,
  stateFieldId,
  municipalityFieldId,
  localityFieldId,
  defaultCountryValue,
  defaultStateValue,
  defaultMunicipalityValue,
  defaultLocalityValue,
  required,
}: {
  onlyCountryState?: boolean;
  countryFieldId: string;
  stateFieldId: string;
  municipalityFieldId?: string;
  localityFieldId?: string;
  defaultCountryValue?: string;
  defaultStateValue?: string;
  defaultMunicipalityValue?: string;
  defaultLocalityValue?: string;
  required?: boolean;
}): JSX.Element => {
  const [country, setCountry] = useState(defaultCountryValue ?? "MEX");
  const states = stateNames(country);
  const [state, setState] = useState<string | undefined>(defaultStateValue);
  if (state && !states.includes(state)) {
    setState(undefined);
  }
  const municipalities = state ? municipalityNames(country, state) : [];
  const [municipality, setMunicipality] = useState(defaultMunicipalityValue);
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
          id={countryFieldId}
          name={countryFieldId}
          value={country}
          defaultValue={defaultCountryValue}
          onChange={(ev) => {
            ev.preventDefault();
            setCountry(ev.target.value);
          }}
          className="peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent px-0 py-2.5 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0"
          required={required}
        >
          <option value="MEX">México</option>
          <option value="USA">Estados Unidos</option>
          <option value="Other">Otro</option>
        </select>
        <label
          htmlFor={countryFieldId}
          className="absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:start-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600 rtl:peer-focus:left-auto rtl:peer-focus:translate-x-1/4"
        >
          País
        </label>
      </div>
      <div className="group relative z-0 mb-5 w-full">
        <select
          id={stateFieldId}
          name={stateFieldId}
          defaultValue={defaultStateValue}
          className="peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent px-0 py-2.5 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0"
          value={state}
          onChange={(ev) => {
            ev.preventDefault();
            setState(ev.target.value);
          }}
          required={required}
        >
          <option value=""></option>
          {states.map((name) => (
            <option value={name} key={name}>
              {name}
            </option>
          ))}
        </select>
        <label
          htmlFor={stateFieldId}
          className="absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:start-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600 rtl:peer-focus:left-auto rtl:peer-focus:translate-x-1/4"
        >
          Estado
        </label>
      </div>
      {!onlyCountryState && (
        <>
          <div className="group relative z-0 mb-5 w-full">
            <select
              id={municipalityFieldId}
              name={municipalityFieldId}
              className="peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent px-0 py-2.5 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0"
              value={municipality}
              defaultValue={defaultMunicipalityValue}
              onChange={(ev) => {
                ev.preventDefault();
                setMunicipality(ev.target.value);
              }}
              required={required}
            >
              {municipalities.map((name) => (
                <option value={name} key={name}>
                  {name}
                </option>
              ))}
            </select>
            <label
              htmlFor={municipalityFieldId}
              className="absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:start-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600 rtl:peer-focus:left-auto rtl:peer-focus:translate-x-1/4"
            >
              Delegación / Municipio
            </label>
          </div>
          <div className="group relative z-0 mb-5 w-full">
            <select
              id={localityFieldId}
              name={localityFieldId}
              defaultValue={defaultLocalityValue}
              className="peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent px-0 py-2.5 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0"
            >
              {localities.map((name) => (
                <option value={name} key={name}>
                  {name}
                </option>
              ))}
              required={required}
            </select>
            <label
              htmlFor={localityFieldId}
              className="absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:start-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600 rtl:peer-focus:left-auto rtl:peer-focus:translate-x-1/4"
            >
              Localidad
            </label>
          </div>
        </>
      )}
    </div>
  );
};
