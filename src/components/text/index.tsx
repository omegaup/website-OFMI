import { Size } from "@/types/components.types";
import classNames from "classnames";

export interface TextProps {
  className?: string;
  children: React.ReactNode;
  size?: Size;
  tag?: "p" | "span" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  color?: string;
}

export const Text = ({
  className,
  tag: Tag = "span",
  children,
  size = "base",
  color = "current",
  ...rest
}: TextProps): JSX.Element => {
  return (
    <Tag
      className={classNames(className, `text-${size}`, `text-${color}`)}
      {...rest}
    >
      {children}
    </Tag>
  );
};
