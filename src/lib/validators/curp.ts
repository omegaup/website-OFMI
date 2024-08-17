import { ValidationResult } from "./types";

const curpReg =
  /^([A-Z][AEIOUX][A-Z]{2}\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])[HM](?:AS|B[CS]|C[CLMSH]|D[FG]|G[TR]|HG|JC|M[CNS]|N[ETL]|OC|PL|Q[TR]|S[PLR]|T[CSL]|VZ|YN|ZS)[B-DF-HJ-NP-TV-Z]{3}[A-Z\d])(\d)$/;

type options = {
  birthDate: Date;
};

export function validateCURP(
  curp: string,
  options?: options,
): ValidationResult {
  const validado = curp.match(curpReg);

  if (!validado) {
    return {
      ok: false,
      message: "No es un formato válido.",
    };
  }

  // Validar que coincida el dígito verificador
  function digitoVerificador(curp17: string): string {
    // Fuente https://consultas.curp.gob.mx/CurpSP/
    const diccionario = "0123456789ABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
    let lngSuma = 0.0;
    let lngDigito = 0.0;
    for (let i = 0; i < 17; i++)
      lngSuma = lngSuma + diccionario.indexOf(curp17.charAt(i)) * (18 - i);
    lngDigito = (10 - (lngSuma % 10)) % 10;
    return lngDigito.toString();
  }

  if (validado[2] !== digitoVerificador(validado[1])) {
    return {
      ok: false,
      message: "Falló la validación del dígito verificador",
    };
  }

  const datePart = curp.slice(4, 10); // YYMMDD
  // Extract year, month, and day from the datePart
  const year = parseInt(datePart.slice(0, 2), 10);
  const month = parseInt(datePart.slice(2, 4), 10) - 1; // JS months are 0-based
  const day = parseInt(datePart.slice(4, 6), 10);

  // Determine the full year (assuming it's in the 2000s for this example)
  const currentYear = new Date().getFullYear();
  const fullYear =
    year >= 0 && year <= currentYear % 100
      ? currentYear - (currentYear % 100) + year
      : currentYear - (currentYear % 100) + year - 100;

  const expectedBirthDate = new Date(fullYear, month, day);

  if (options && expectedBirthDate.getTime() !== options.birthDate.getTime()) {
    return {
      ok: false,
      message: `La fecha de nacimiento no coincide con la de la CURP`,
    };
  }

  return { ok: true };
}
