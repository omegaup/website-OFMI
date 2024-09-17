import { MEX, stateNames, municipalityNames, ALFA3_CODES } from "@/lib/address";
import type { ValidationResult } from "./types";

export const countryReg = "^[A-Z]{3}$";
export const zipcodeReg = "^\\d{5}$";
export const phoneReg = "^\\d{10}$";

function validateCountry(country: string): ValidationResult {
  if (!ALFA3_CODES.includes(country)) {
    return {
      ok: false,
      message: `El código del país ${country} no fue encontrado.`,
    };
  }
  return { ok: true };
}

export function validateCountryState({
  country,
  state,
}: {
  country: string;
  state: string;
}): ValidationResult {
  if (country !== MEX) {
    return validateCountry(country);
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
  const stateValidation = validateCountryState({ country, state });
  if (!stateValidation.ok || country !== MEX) {
    return stateValidation;
  }
  const municipalities = municipalityNames(country, state);
  if (!municipality || !municipalities.includes(municipality)) {
    return { ok: false, message: "Municipio inválido." };
  }
  return { ok: true };
}
