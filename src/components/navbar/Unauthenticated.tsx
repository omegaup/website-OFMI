import { Button } from "../button";
import { classNames } from "./styles";
import { navbarStyle } from "./styles";

const buttonStyleClassNames = "p-2 rounded-lg w-32 m-1";

export const Unauthenticated = (): JSX.Element => {
  return (
    <div className="space-x-2">
      <Button size="sm">Iniciar sesión</Button>
      <Button type="secondary" size="sm">
        Regístrate
      </Button>
    </div>
  );
};
