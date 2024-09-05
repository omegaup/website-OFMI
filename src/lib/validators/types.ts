export type OK = {
  ok: true;
};

export type ValidationError = {
  ok: false;
  message: string;
};

export type ValidationResult = OK | ValidationError;
