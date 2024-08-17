import { expect, test } from "vitest";
import {
  validateSchoolGrade,
  validateGraduationDate,
} from "@/lib/validators/school";

test("validate school grade", () => {
  expect(
    validateSchoolGrade({ schoolGrade: 6, schoolStage: "Elementary" }),
  ).toMatchObject({
    ok: true,
  });
  expect(
    validateSchoolGrade({ schoolGrade: 7, schoolStage: "Elementary" }),
  ).toMatchObject({
    ok: false,
  });
});

test("validate graduation date", () => {
  const highSchoolGraduationLimit = new Date("2025-01-01");
  expect(
    validateGraduationDate({
      schoolStage: "High",
      schoolGrade: 3,
      started: new Date("2024-01-01"),
      highSchoolGraduationLimit: highSchoolGraduationLimit,
    }),
  ).toMatchObject({ ok: true });
  expect(
    validateGraduationDate({
      schoolStage: "High",
      schoolGrade: 3,
      started: new Date("2023-01-01"),
      highSchoolGraduationLimit: highSchoolGraduationLimit,
    }),
  ).toMatchObject({ ok: false });
  expect(
    validateGraduationDate({
      schoolStage: "Secondary",
      schoolGrade: 3,
      started: new Date("2023-01-01"),
      highSchoolGraduationLimit: highSchoolGraduationLimit,
    }),
  ).toMatchObject({ ok: true });
});
