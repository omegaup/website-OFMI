import { expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Login from "@/components/login";

vi.mock("next/router", () => ({
  useRouter: vi.fn(),
}));

test("Login", () => {
  render(<Login />);
  expect(screen.getByText("Correo electrónico")).toBeDefined();
  expect(screen.getByText("Contraseña")).toBeDefined();
  expect(screen.getByRole("button", { name: "Iniciar sesión" })).toBeDefined();
});
