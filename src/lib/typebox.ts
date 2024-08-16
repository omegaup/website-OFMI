import { type ValueError, ValueErrorType } from "@sinclair/typebox/errors";

export function parseValueError(error: ValueError): string {
  if (error.message.includes("Expected required property")) {
    return `Se esperaba el campo ${error.path}`;
  }
  if (error.message.includes("Expected")) {
    if (error.type == ValueErrorType.StringPattern) {
      return `El campo ${error.path} no cumple con los requerimientos. ${error.message}`;
    }
    if (error.type == ValueErrorType.Union) {
      const anyof = error.schema["anyOf"].map((choice: object) => {
        return `[${Object.values(choice)}]`;
      });
      return `El campo ${error.path} solo acepta los siguientes valores: ${anyof.join(", ")}`;
    }
    return `Se esperaba un ${ValueErrorType[error.type]} para el campo ${error.path}`;
  }
  return `Error: ${JSON.stringify(error, undefined, 2)}`;
}
