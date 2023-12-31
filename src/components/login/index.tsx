import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { Alert, SuccessAlert } from "../alert";
import { Button } from "../button";
import { PasswordInput } from "../password";
import Link from "next/link";
import { resendEmailVerification } from "./client";

const SuccessResendEmail = ({ msg }: { msg: string }): JSX.Element => {
  return (
    <div className="mx-auto flex min-h-full w-96 flex-1 flex-col items-center justify-center px-6 py-12 lg:px-8">
      <SuccessAlert title="Email enviado!" text={msg} />
    </div>
  );
};

interface LoginError {
  errorMsg: string;
  email: string;
  emailNotVerified?: boolean;
}

interface LoginProps {
  verified?: boolean | null;
  initialEmail?: string | null;
}

export default function Login({
  verified,
  initialEmail,
}: LoginProps): JSX.Element {
  const router = useRouter();
  const [successResendEmailMsg, setSuccessResendEmailMsg] = useState<
    string | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<LoginError | null>(null);

  if (successResendEmailMsg != null) {
    return <SuccessResendEmail msg={successResendEmailMsg} />;
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const data = new FormData(event.currentTarget);
    const email = data.get("email")?.toString();
    const password = data.get("password")?.toString();
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
        errorMsg: userError,
        email: email ?? "",
        emailNotVerified: response.status === 401,
      });
    } else {
      await router.push(response?.url ?? "/");
    }
    setLoading(false);
  }

  async function handleResendEmailVerification(email: string): Promise<void> {
    console.log("resend email verification");
    const response = await resendEmailVerification({ email });
    if (!response.success) {
      console.log("error", response.error);
      setError({ errorMsg: response.error.message, email });
      return;
    }
    setSuccessResendEmailMsg(response.data.message);
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
                defaultValue={initialEmail ?? ""}
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

          <Button
            type="submit"
            buttonType="primary"
            className="w-full"
            disabled={loading}
          >
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

        {/* Success email verification */}
        {verified && (
          <SuccessAlert
            title="Email verificado!"
            text="Ahora puedes iniciar sesión."
          />
        )}

        {/* Error alert */}
        {error != null && (
          <Alert errorMsg={error.errorMsg}>
            {error.emailNotVerified && (
              <p className="mt-2">
                <span>Has click </span>
                <Link
                  className="font-semibold hover:underline"
                  href="#"
                  onClick={async (ev) => {
                    ev.preventDefault();
                    await handleResendEmailVerification(error.email);
                  }}
                >
                  aquí
                </Link>
                <span> para enviar el correo de verificación nuevamente.</span>
              </p>
            )}
          </Alert>
        )}
      </div>
    </div>
  );
}
