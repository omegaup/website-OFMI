import { BadRequestError } from "@/types/badRequestError.schema";
import { useSetAtom } from "jotai";
import { sendSignUpAtom } from "./client";
import { useState } from "react";
import { Alert, SuccessAlert } from "../alert";
import { Button } from "../button";

const SuccessSignUp = (): JSX.Element => {
  return (
    <div className="mx-auto flex min-h-full w-96 flex-1 flex-col items-center justify-center px-6 py-12 lg:px-8">
      <SuccessAlert
        title="Registro exitoso."
        text="Te hemos enviado un correo electrónico de verificación para que confirmes tu cuenta y puedas hacer login."
      />
    </div>
  );
};

export default function SignUp(): JSX.Element {
  const [error, setError] = useState<BadRequestError | null>(null);
  const [successSignUp, setSuccessSignUp] = useState(false);
  const sendSignUp = useSetAtom(sendSignUpAtom);

  if (successSignUp) {
    return <SuccessSignUp />;
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = data.get("email")?.toString();
    const password = data.get("password")?.toString();
    const confirmPassword = data.get("confirmPassword")?.toString();
    if (email == null || password == null || confirmPassword == null) {
      setError({ message: "Todos los campos son requeridos" });
      return;
    }
    if (password !== confirmPassword) {
      setError({ message: "Las contraseñas no coinciden" });
      return;
    }

    setError(null);
    const response = await sendSignUp({ email, password });
    if (!response.success) {
      setError(response.error);
      return;
    }
    setSuccessSignUp(true);
  }

  return (
    <>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <img
            className="mx-auto my-8 h-28 w-auto"
            src="/lightLogo.svg"
            alt="OFMI"
          />
          <h2 className="text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Crea una cuenta
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form
            className="space-y-6"
            method="POST"
            onSubmit={(ev) => handleSubmit(ev)}
          >
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Correo electrónico
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Contraseña
                </label>
              </div>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Confirmar contraseña
                </label>
              </div>
              <div className="mt-2">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <Button type="submit" buttonType="primary" className="w-full">
                Crear cuenta
              </Button>
            </div>

            <div className="text-sm">
              <p className="font-light text-gray-700">
                ¿Ya tienes una cuenta?{" "}
                <a
                  href="/login"
                  className="font-medium text-blue-500 hover:text-blue-700 hover:underline"
                >
                  Inicia sesión
                </a>
              </p>
            </div>
          </form>
          {error != null && <Alert text={error.message} />}
        </div>
      </div>
    </>
  );
}
