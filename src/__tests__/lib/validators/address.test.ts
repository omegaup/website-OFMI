import { expect, test } from "vitest";
import { validateAddressLocation } from "@/lib/validators/address";
import {
  localityNames,
  MEX,
  municipalityNames,
  stateNames,
} from "@/lib/address";

test("validate format", () => {
  // Ok
  expect(validateAddressLocation({ country: "USA", state: "" })).toMatchObject({
    ok: true,
  });
  // Invalid state
  expect(
    validateAddressLocation({ country: "MEX", state: "Juan" }),
  ).toMatchObject({
    ok: false,
    message: "Estado inválido.",
  });
  // Municipality invalid
  expect(
    validateAddressLocation({
      country: "MEX",
      state: "Aguascalientes",
      municipality: "Juan",
    }),
  ).toMatchObject({
    ok: false,
    message: "Municipio inválido.",
  });
  // Invalid locality
  expect(
    validateAddressLocation({
      country: "MEX",
      state: "Aguascalientes",
      municipality: "Aguascalientes",
      locality: "Juan",
    }),
  ).toMatchObject({
    ok: false,
    message: "Localidad inválida.",
  });
  // Valid one
  expect(
    validateAddressLocation({
      country: "MEX",
      state: "Aguascalientes",
      municipality: "Aguascalientes",
      locality: "Aguascalientes",
    }),
  ).toMatchObject({
    ok: true,
  });
});

test("Mexico json valid", () => {
  const country = MEX;
  const states = stateNames(country);
  expect(states).length(32);
  states.forEach((state) => {
    const municipalities = municipalityNames(country, state);
    expect(municipalities.length).greaterThan(
      0,
      `${state} had no municipalities`,
    );
    municipalities.forEach((municipality) => {
      const localities = localityNames(country, state, municipality);
      expect(localities.length).greaterThan(
        0,
        `${municipality}, ${state} had not localities`,
      );
    });
  });
});
