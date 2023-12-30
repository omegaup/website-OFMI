import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import Page from "../src/pages";

test("Page", () => {
  render(<Page />);
  expect(true, "dummy test success!");
});
