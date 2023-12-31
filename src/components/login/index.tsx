import { BadRequestError } from "@/types/badRequestError.schema";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { Alert } from "../alert";
import { Button } from "../button";
import { PasswordInput } from "../password";
import Link from "next/link";

interface LoginError extends BadRequestError {
  email: string;
  emailNotVerified?: boolean;
}

export default function Login(): JSX.Element {
  const router = useRouter();
  const [error, setError] = useState<LoginError | null>(null);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = data.get("email")?.toString();
    const password = data.get("password")?.toString();

    setError(null);
    const response = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (response?.error) {
      const userError =
        response.error === "CredentialsSignin"
          ? "Usuario o contraseña incorrectos."
          : response.error;
      setError({
        message: userError,
        email: email ?? "",
        emailNotVerified: response.status === 401,
      });
      return;
    } else {
      await router.push(response?.url ?? "/");
    }
  }

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img
          className="mx-auto my-8 h-28 w-auto"
          src="/lightLogo.svg"
          alt="OFMI"
        />
        <h2 className="text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Inicia sesión
        </h2>
      </div>

      <div className="mt-10 text-sm sm:mx-auto sm:w-full sm:max-w-sm">
        <form
          className="space-y-6"
          action="#"
          method="POST"
          onSubmit={(ev) => handleSubmit(ev)}
        >
          <div>
            <label
              htmlFor="email"
              className="block font-medium leading-6 text-gray-900"
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
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:leading-6"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block font-medium leading-6 text-gray-900"
              >
                Contraseña
              </label>
            </div>
            <div className="mt-2">
              <PasswordInput
                id="password"
                name="password"
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:leading-6"
              />
            </div>
          </div>

          <div className="text-right">
            <a
              href="#"
              className="font-semibold text-blue-500 hover:text-blue-700"
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          <Button type="submit" buttonType="primary" className="w-full">
            Iniciar sesión
          </Button>

          <div>
            <p className="font-light text-gray-700">
              ¿Aun no tienes una cuenta?{" "}
              <a
                href="/signup"
                className="font-medium text-blue-500 hover:text-blue-700 hover:underline"
              >
                Regístrate
              </a>
            </p>
          </div>
        </form>

        {/* Error alert */}
        {error != null && (
          <Alert errorMsg={error.message}>
            {error.emailNotVerified && (
              <p>
                Enviar correo de verificación{" "}
                <Link
                  className="font-semibold hover:underline"
                  href={`/api/token?token=${error.email}`}
                >
                  nuevamente
                </Link>
              </p>
            )}
          </Alert>
        )}
      </div>
    </div>
  );
}
