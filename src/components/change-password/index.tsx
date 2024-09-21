import { useState } from "react";
import { Button } from "../button";
import { Alert, SuccessAlert } from "../alert";
import { PasswordInput } from "../password";
import { IChangePasswordProps } from "@/pages/change-password";

export default function ChangePassword({
  token,
}: IChangePasswordProps): JSX.Element {
  const [error, setError] = useState<Error | null>(null);
  const [passHasBeenChanged, setPassHasBeenChanged] = useState<boolean>(false);
  return (
    <main className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <figure className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img
          className="mx-auto my-8 h-28 w-auto"
          src="/lightLogo.svg"
          alt="OFMI"
        />
        <figcaption className="text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          <h2>Cambiar contraseña</h2>
        </figcaption>
      </figure>
      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        {error && <Alert errorMsg={error.message} />}
        {passHasBeenChanged ? (
          <SuccessAlert
            title="Listo!"
            text="Has cambiado tu contraseña exitosamente!"
          />
        ) : (
          <form
            className="space-y-6"
            method="POST"
            onSubmit={async (ev) => {
              ev.preventDefault();
              setError(null);
              const data = new FormData(ev.currentTarget);
              const pass = data.get("password")?.toString();
              const passConfirm = data.get("confirmPassword")?.toString();
              if (pass == null || passConfirm == null) {
                setError(new Error("Todos los campos son requeridos"));
                return;
              }
              if (pass != passConfirm) {
                setError(new Error("Las contraseñas no coinciden"));
                return;
              }
              if (pass.length < 8) {
                setError(
                  new Error("La contraseña debe tener al menos 8 caracteres"),
                );
                return;
              }
              const response = await fetch("/api/user/change-password", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  token,
                  password: pass,
                }),
              });
              const req = await response.json();
              if (response.status == 400) {
                setError(new Error(req.message));
                return;
              }
              setPassHasBeenChanged(true);
            }}
          >
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
                <PasswordInput
                  id="password"
                  name="password"
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
                <PasswordInput
                  id="confirmPassword"
                  name="confirmPassword"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>
            <div>
              <Button
                type="submit"
                buttonType="primary"
                className="w-full"
                disabled={false}
              >
                Cambiar contraseña
              </Button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
