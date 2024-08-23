import { expect, test } from "vitest";
import {
  validateSchoolGrade,
  validateGraduationDate,
} from "@/lib/validators/school";

test("validate school grade", () => {
  expect(
    validateSchoolGrade({ schoolGrade: 6, schoolStage: "ELEMENTARY" }),
  ).toMatchObject({
    ok: true,
  });
  expect(
    validateSchoolGrade({ schoolGrade: 7, schoolStage: "ELEMENTARY" }),
  ).toMatchObject({
    ok: false,
  });
});

test("validate graduation date", () => {
  const highSchoolGraduationLimit = new Date("2025-01-01");
  expect(
    validateGraduationDate({
      schoolStage: "HIGH",
      schoolGrade: 3,
      started: new Date("2024-01-01"),
      highSchoolGraduationLimit: highSchoolGraduationLimit,
    }),
  ).toMatchObject({ ok: true });
  expect(
    validateGraduationDate({
      schoolStage: "HIGH",
      schoolGrade: 3,
      started: new Date("2023-01-01"),
      highSchoolGraduationLimit: highSchoolGraduationLimit,
    }),
  ).toMatchObject({ ok: false });
  expect(
    validateGraduationDate({
      schoolStage: "SECONDARY",
      schoolGrade: 3,
      started: new Date("2023-01-01"),
      highSchoolGraduationLimit: highSchoolGraduationLimit,
    }),
  ).toMatchObject({ ok: true });
});
