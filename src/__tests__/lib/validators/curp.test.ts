import { expect, describe, it } from "vitest";
import { validateCURP } from "@/lib/validators/curp";

describe("validate format", () => {
  it("no options", () => {
    // ok
    expect(validateCURP("HEGG560427MVZRRL04")).toMatchObject({
      ok: true,
    });
    // lowercase not accepted
    expect(validateCURP("hEGG560427MVZRRL04")).toMatchObject({
      ok: false,
      message: "No es un formato válido.",
    });
    // Digito verificador
    expect(validateCURP("HEGG560427MVZRRL03")).toMatchObject({
      ok: false,
      message: "Falló la validación del dígito verificador",
    });
    // spaces in between
    expect(validateCURP("HEGG 560427MVZRRL04")).toMatchObject({
      ok: false,
    });
  });
  it("w/options", () => {
    // ok
    expect(
      validateCURP("HEGG560427MVZRRL04", { birthDate: new Date("1956-04-27") }),
    ).toMatchObject({
      ok: true,
    });
    expect(
      validateCURP("HEGG560427MVZRRL04", { birthDate: new Date("0006-04-27") }),
    ).toMatchObject({
      ok: false,
      message: "La fecha de nacimiento no coincide con la de la CURP",
    });
  });
});
