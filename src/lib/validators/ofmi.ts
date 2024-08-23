import { Ofmi, ParticipationRole, SchoolStage } from "@prisma/client";
import type { ValidationResult } from "./types";
import { validateGraduationDate } from "./school";

export function validateOFMIOpenAndCloseTime(
  ofmi: Ofmi,
  {
    registrationTime,
    role,
  }: { registrationTime: Date; role: ParticipationRole },
): ValidationResult {
  if (ofmi.registrationOpenTime.getTime() > registrationTime.getTime()) {
    return {
      ok: false,
      message: `Las inscripciones para esta OFMI aun no han abierto.`,
    };
  }
  if (role === "MENTOR") {
    // Vamos a darles todo el año para registrarse
    if (
      ofmi.registrationCloseTime.getFullYear() < registrationTime.getFullYear()
    ) {
      return {
        ok: false,
        message: "Ya no puedes ser mentor para esta OFMI.",
      };
    }
  } else {
    if (ofmi.registrationCloseTime.getTime() < registrationTime.getTime()) {
      return {
        ok: false,
        message: "Las inscripciones para esta OFMI han finalizado.",
      };
    }
  }
  return {
    ok: true,
  };
}

export function validateOFMIContestantRequirements(
  ofmi: Ofmi,
  {
    birthDate,
    schoolStage,
    schoolGrade,
  }: { birthDate: Date; schoolStage: SchoolStage; schoolGrade: number },
): ValidationResult {
  if (ofmi.birthDateRequirement && birthDate < ofmi.birthDateRequirement) {
    return {
      ok: false,
      message: `No cumples con el requisito de haber nacido después del ${ofmi.birthDateRequirement.toDateString()}`,
    };
  }

  // Lets be optimistic and assume contestant was in schoolGrade when Ofmi registration began.
  // Assume also that it started on that day the schoolGrade
  if (ofmi.studyingHighScoolDateRequirement) {
    const result = validateGraduationDate({
      schoolGrade,
      schoolStage,
      started: ofmi.registrationOpenTime,
      highSchoolGraduationLimit: ofmi.studyingHighScoolDateRequirement,
    });
    if (!result.ok) {
      return result;
    }
  }

  return { ok: true };
}
