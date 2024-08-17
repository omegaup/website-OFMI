import type { SchoolStage } from "@prisma/client";
import type { ValidationResult } from "./types";

function schoolGrades(schoolStage: SchoolStage): number {
  switch (schoolStage) {
    case "Elementary":
      return 6;
    case "Secondary":
      return 3;
    case "High":
      return 3;
  }
}

export function validateGraduationDate({
  schoolStage,
  schoolGrade,
  started,
  highSchoolGraduationLimit,
}: {
  schoolStage: SchoolStage;
  schoolGrade: number;
  started: Date;
  highSchoolGraduationLimit: Date;
}): ValidationResult {
  function expectedGraduationYear(): number {
    const startYear = started.getFullYear();
    switch (schoolStage) {
      case "Elementary":
        return (
          startYear +
          (schoolGrades("Elementary") - schoolGrade + 1) +
          schoolGrades("Secondary") +
          schoolGrades("High")
        );
      case "Secondary":
        return (
          startYear +
          (schoolGrades("Secondary") - schoolGrade + 1) +
          schoolGrades("High")
        );
      case "High":
        return startYear + (schoolGrades("High") - schoolGrade + 1);
    }
  }
  const expectedGraduationDate = new Date(
    expectedGraduationYear(),
    started.getMonth(),
    started.getDay(),
  );
  if (expectedGraduationDate < highSchoolGraduationLimit) {
    return {
      ok: false,
      message: `Fecha de graduación después de la fecha límite ${highSchoolGraduationLimit.toDateString()}`,
    };
  }
  return { ok: true };
}

export function validateSchoolGrade({
  schoolStage,
  schoolGrade,
}: {
  schoolStage: SchoolStage;
  schoolGrade: number;
}): ValidationResult {
  if (schoolGrade > schoolGrades(schoolStage)) {
    return { ok: false, message: "" };
  }
  return { ok: true };
}
