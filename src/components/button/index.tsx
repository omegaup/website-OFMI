import { defaultStyles, ButtonVariantProps } from "./twcss";
import classnames from "classnames";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonVariantProps {}

export const Button = ({
  className,
  twcss,
  buttonSize = "md",
  buttonType = "default",
  children,
  ...rest
}: ButtonProps): JSX.Element => {
  const buttonTw = twcss ? defaultStyles.compose(twcss) : defaultStyles;
  return (
    <button
      className={classnames(
        buttonTw.class({
          buttonSize,
          buttonType,
        }),
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
};
