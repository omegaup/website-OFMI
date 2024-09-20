import { useState } from "react";
import { Button } from "../button";
import { SuccessAlert } from "../alert";

export default function ForgotPassword(): JSX.Element {
  const [emailHasBeenSent, setEmailHasBeenSet] = useState<boolean>(false);
  return (
    <main className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <figure className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img
          className="mx-auto my-8 h-28 w-auto"
          src="/lightLogo.svg"
          alt="OFMI"
        />
        <figcaption className="text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          <h2>Recuperar cuenta</h2>
        </figcaption>
      </figure>
      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        {emailHasBeenSent ? (
          <SuccessAlert
            title="Listo!"
            text="Te hemos enviado un correo con un enlace para cambiar tu contraseña"
          />
        ) : (
          <form
            className="space-y-6"
            method="POST"
            onSubmit={async (ev) => {
              ev.preventDefault();
              const data = new FormData(ev.currentTarget);
              const email = data.get("email")?.toString();
              await fetch("/api/user/change-password", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  email,
                }),
              });
              setEmailHasBeenSet(true);
            }}
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
              <Button
                type="submit"
                buttonType="primary"
                className="w-full"
                disabled={false}
              >
                Recuperar cuenta
              </Button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
