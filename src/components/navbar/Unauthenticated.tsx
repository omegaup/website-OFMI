import { Button } from "../button";

export const Unauthenticated = (): JSX.Element => {
  return (
    <div className="space-x-2">
      <a href="/login">
        <Button buttonSize="sm" buttonType="primary">
          Inicia sesión
        </Button>
      </a>
      <a href="/signup">
        <Button buttonType="secondary" buttonSize="sm">
          Crea tu cuenta
        </Button>
      </a>
    </div>
  );
};
