export type JSONPrimitive = string | number | boolean | null | undefined;

export type JSONValue =
  | JSONPrimitive
  | {
      [key: string]: JSONValue;
    };
