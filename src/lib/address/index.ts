import type {
  Country,
  CountryName,
  LocalityName,
  MunicipalityName,
  StateName,
} from "./types";
import mexicoJSON from "./data.json";
import isoCountriesJson from "./iso-3166-countries.json";

export const ALFA3_CODES = isoCountriesJson.map((v) => v["alpha-3"]);
export const MEX = "MEX";
const mexico = mexicoJSON as Country;

export function country(name: CountryName): Country {
  if (name === MEX) {
    return mexico;
  }
  return {};
}

export function stateNames(countryName: CountryName): Array<StateName> {
  return Object.keys(country(countryName));
}

export function municipalityNames(
  countryName: CountryName,
  stateName: StateName,
): Array<MunicipalityName> {
  const countryMap = country(countryName);
  if (!countryMap || !Object.keys(countryMap).includes(stateName)) {
    return [];
  }
  const state = countryMap[stateName];
  return Object.keys(state);
}

export function localityNames(
  countryName: CountryName,
  stateName: StateName,
  municipalityName: MunicipalityName,
): Array<LocalityName> {
  const countryMap = country(countryName);
  if (!Object.keys(countryMap).includes(stateName)) {
    return [];
  }
  const stateMap = countryMap[stateName];
  if (!Object.keys(stateMap).includes(municipalityName)) {
    return [];
  }
  return stateMap[municipalityName];
}
