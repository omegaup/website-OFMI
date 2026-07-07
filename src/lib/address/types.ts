export type CountryName = string;
export type StateName = string;
export type MunicipalityName = string;
export type LocalityName = string;

export type State = {
  [municipality: MunicipalityName]: Array<LocalityName>;
};

export type Country = {
  [state: StateName]: State;
};

export type Address = {
  postalCode: string;
  neighborhood: string;
  county: string;
  state: string;
};
