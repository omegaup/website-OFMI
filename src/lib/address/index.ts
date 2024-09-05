import type {
  Country,
  CountryName,
  LocalityName,
  MunicipalityName,
  StateName,
} from "./types";
import mexicoJSON from "./data.json";

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
