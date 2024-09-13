import { expect, test, describe } from "vitest";
import {
  validateMailingAddressLocation,
  validateCountryState,
} from "@/lib/validators/address";
import {
  localityNames,
  MEX,
  municipalityNames,
  stateNames,
} from "@/lib/address";

test("validate format", () => {
  // Invalid state
  expect(
    validateMailingAddressLocation({ country: "MEX", state: "Juan" }),
  ).toMatchObject({
    ok: false,
    message: "Estado inválido.",
  });
  // Municipality invalid
  expect(
    validateMailingAddressLocation({
      country: "MEX",
      state: "Aguascalientes",
      municipality: "Juan",
    }),
  ).toMatchObject({
    ok: false,
    message: "Municipio inválido.",
  });
  // Valid one
  expect(
    validateMailingAddressLocation({
      country: "MEX",
      state: "Aguascalientes",
      municipality: "Aguascalientes",
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

describe("validate country state", () => {
  test("validate country", () => {
    ["MEX", "USA", "PER"].forEach((c) =>
      expect(
        validateCountryState({ country: c, state: "Aguascalientes" }),
      ).toMatchObject({
        ok: true,
      }),
    );

    ["MX", "Mexico"].forEach((c) =>
      expect(
        validateCountryState({ country: c, state: "Aguascalientes" }),
      ).toMatchObject({
        ok: false,
      }),
    );
  });

  test("invalid state", () => {
    expect(
      validateCountryState({ country: "MEX", state: "Juan" }),
    ).toMatchObject({ ok: false });
  });
});
