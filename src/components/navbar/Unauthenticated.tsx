import { Button } from "../button";

export const Unauthenticated = (): JSX.Element => {
  return (
    <div className="space-x-2">
      <a href="/login">
        <Button size="sm">Iniciar sesión</Button>
      </a>
      <a href="/signup">
        <Button styleType="secondary" size="sm">
          Regístrate
        </Button>
      </a>
    </div>
  );
};
