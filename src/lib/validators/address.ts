import {
  MEX,
  stateNames,
  municipalityNames,
  localityNames,
} from "@/lib/address";
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

export function validateAddressLocation({
  country,
  state,
  municipality,
  locality,
}: {
  country: string;
  state: string;
  municipality?: string;
  locality?: string;
}): ValidationResult {
  if (country !== MEX) {
    return { ok: true };
  }
  const stateValidation = validateCountryState({ country, state });
  if (!stateValidation.ok) {
    return stateValidation;
  }
  const municipalities = municipalityNames(country, state);
  if (!municipality || !municipalities.includes(municipality)) {
    return { ok: false, message: "Municipio inválido." };
  }
  const localities = localityNames(country, state, municipality);
  if (!locality || !localities.includes(locality)) {
    return { ok: false, message: "Localidad inválida." };
  }
  return { ok: true };
}
