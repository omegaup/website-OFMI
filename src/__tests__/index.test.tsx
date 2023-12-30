import { expect, test } from "vitest";
import { render } from "@testing-library/react";
import Page from "@/pages";

test("Page", () => {
  render(<Page />);
  expect(true, "dummy test success!");
});
