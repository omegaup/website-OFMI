import { MEX, municipalityNames, stateNames } from "@/lib/address";
import isoCountriesJson from "@/lib/address/iso-3166-countries.json";
import { useState } from "react";
import { FloatingInput } from "../input/FloatingInput";

function SelectWithFallback({
  id,
  label,
  value,
  defaultValue,
  options,
  required,
  onChange,
}: {
  id: string;
  label: string;
  value?: string;
  defaultValue?: string;
  options: Array<string>;
  required?: boolean;
  onChange?: (ev: string) => void;
}): JSX.Element {
  if (options.length == 0) {
    return (
      <FloatingInput
        id={id}
        value={value}
        defaultValue={defaultValue}
        label={label}
        onChange={(ev) => {
          ev.preventDefault();
          onChange?.(ev.target.value);
        }}
        required={required}
      />
    );
  }
  return (
    <>
      <select
        id={id}
        name={id}
        className="peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent px-0 py-2.5 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0"
        value={value}
        defaultValue={defaultValue}
        required={required}
        onChange={(ev) => {
          ev.preventDefault();
          onChange?.(ev.target.value);
        }}
      >
        <option value={""}></option>
        {options.map((name) => (
          <option value={name} key={name}>
            {name}
          </option>
        ))}
      </select>
      <label
        htmlFor={id}
        className="absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:start-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600 rtl:peer-focus:left-auto rtl:peer-focus:translate-x-1/4"
      >
        {label}
      </label>
    </>
  );
}

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
  const [country, setCountry] = useState(defaultCountryValue ?? MEX);
  const states = stateNames(country);
  const [state, setState] = useState<string | undefined>(defaultStateValue);
  if (state && states.length > 0 && !states.includes(state)) {
    setState(undefined);
  }
  const municipalities = state ? municipalityNames(country, state) : [];

  return (
    <div
      className={`grid md:grid-cols-${onlyCountryState ? "2" : "4"} md:gap-6`}
    >
      <div className="group relative z-0 mb-5 w-full">
        <select
          id={countryFieldId}
          name={countryFieldId}
          value={country}
          onChange={(ev) => {
            ev.preventDefault();
            setCountry(ev.target.value);
            setState(undefined);
          }}
          className="peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent px-0 py-2.5 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0"
          required={required}
        >
          {isoCountriesJson.map((d) => {
            return (
              <option key={d["alpha-3"]} value={d["alpha-3"]}>
                {d["name"]}
              </option>
            );
          })}
        </select>
        <label
          htmlFor={countryFieldId}
          className="absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:start-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600 rtl:peer-focus:left-auto rtl:peer-focus:translate-x-1/4"
        >
          País *
        </label>
      </div>
      <div className="group relative z-0 mb-5 w-full">
        <SelectWithFallback
          id={stateFieldId}
          label="Estado *"
          value={state}
          onChange={(ev) => setState(ev)}
          options={states}
          required={required}
        ></SelectWithFallback>
      </div>
      {!onlyCountryState && municipalities.length > 0 && (
        <>
          <div className="group relative z-0 mb-5 w-full">
            <SelectWithFallback
              id={municipalityFieldId ?? ""}
              label="Delegación / Municipio *"
              defaultValue={defaultMunicipalityValue}
              options={municipalities}
            ></SelectWithFallback>
          </div>
          <div className="group relative z-0 mb-5 w-full">
            <FloatingInput
              id={localityFieldId}
              defaultValue={defaultLocalityValue}
              label="Colonia / Localidad *"
              required
            />
          </div>
        </>
      )}
    </div>
  );
};
