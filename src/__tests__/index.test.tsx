import { expect, test } from "vitest";
import { render } from "@testing-library/react";
import Page from "@/pages";
import { SessionProvider } from "next-auth/react";

test("Page", () => {
  render(
    <SessionProvider session={null}>
      <Page />
    </SessionProvider>,
  );
  expect(true, "dummy test success!");
});
