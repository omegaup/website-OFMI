import { Button } from "../button";

export const Unauthenticated = (): JSX.Element => {
  return (
    <div className="space-x-2">
      <a href="/login">
        <Button buttonSize="sm" buttonType="primary">
          Iniciar sesión
        </Button>
      </a>
      <a href="/signup">
        <Button
          className="text-gray-900"
          buttonType="secondary"
          buttonSize="sm"
        >
          Regístrate
        </Button>
      </a>
    </div>
  );
};
