import type { SchoolStage } from "@prisma/client";
import type { ValidationResult } from "./types";
import { exhaustiveMatchingGuard } from "@/utils";

function schoolGrades(schoolStage: SchoolStage): number {
  switch (schoolStage) {
    case "ELEMENTARY":
      return 6;
    case "SECONDARY":
      return 3;
    case "HIGH":
      return 3;
    default: {
      return exhaustiveMatchingGuard(schoolStage);
    }
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
      case "ELEMENTARY":
        return (
          startYear +
          (schoolGrades("ELEMENTARY") - schoolGrade + 1) +
          schoolGrades("SECONDARY") +
          schoolGrades("HIGH")
        );
      case "SECONDARY":
        return (
          startYear +
          (schoolGrades("SECONDARY") - schoolGrade + 1) +
          schoolGrades("HIGH")
        );
      case "HIGH":
        return startYear + (schoolGrades("HIGH") - schoolGrade + 1);
      default: {
        return exhaustiveMatchingGuard(schoolStage);
      }
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
