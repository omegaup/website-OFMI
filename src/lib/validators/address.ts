import { MEX, stateNames, municipalityNames } from "@/lib/address";
import type { ValidationResult } from "./types";

export const countryReg = "^[A-Z]{3}$";
export const zipcodeReg = "^\\d{5}$";
export const phoneReg = "^\\d{10}$";

export function validateCountryState({
  country,
  state,
}: {
  country: string;
  state: string;
}): ValidationResult {
  if (country !== MEX) {
    return { ok: true };
  }
  const states = stateNames(country);
  if (!state || !states.includes(state)) {
    return { ok: false, message: "Estado inválido." };
  }
  return { ok: true };
}

export function validateMailingAddressLocation({
  country,
  state,
  municipality,
}: {
  country: string;
  state: string;
  municipality?: string;
}): ValidationResult {
  if (country !== MEX) {
    return {
      ok: false,
      message:
        "Lo sentimos, por el momento solo podemos hacer envíos a México.",
    };
  }
  const stateValidation = validateCountryState({ country, state });
  if (!stateValidation.ok) {
    return stateValidation;
  }
  const municipalities = municipalityNames(country, state);
  if (!municipality || !municipalities.includes(municipality)) {
    return { ok: false, message: "Municipio inválido." };
  }
  return { ok: true };
}
