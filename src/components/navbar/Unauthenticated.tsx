import { Button } from "../button";
import Link from "next/link";

export const Unauthenticated = (): JSX.Element => {
  return (
    <div className="space-x-2">
      <Link href="/login">
        <Button buttonSize="sm" buttonType="primary">
          Inicia sesión
        </Button>
      </Link>
      <Link href="/signup">
        <Button buttonType="secondary" buttonSize="sm">
          Crea tu cuenta
        </Button>
      </Link>
    </div>
  );
};
