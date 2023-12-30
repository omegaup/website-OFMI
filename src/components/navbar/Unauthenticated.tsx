import { classNames } from "./styles";
import { navbarStyle } from "./styles";

const buttonStyleClassNames = "p-2 rounded-lg w-32 m-1";

export const Unauthenticated = (): JSX.Element => {
  return (
    <>
      <button
        className={classNames(
          navbarStyle.textSize,
          navbarStyle.textColor.primary,
          navbarStyle.hoverTextColor.primary,
          buttonStyleClassNames,
          "border border-blue-500 bg-transparent font-semibold hover:border-transparent hover:bg-blue-500 hover:text-white",
        )}
      >
        Iniciar sesión
      </button>
      <button
        className={classNames(
          navbarStyle.textSize,
          navbarStyle.textColor.secondary,
          navbarStyle.hoverTextColor.primary,
          buttonStyleClassNames,
          "bg-blue-500 font-bold hover:bg-blue-700",
        )}
      >
        Regístrate
      </button>
    </>
  );
};
