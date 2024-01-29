import React from "react";
import { Tailwindest } from "tailwindest";
import { TwProps, twClassName, twCompose } from "./twcss";

export interface LinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    TwProps {}

const defaultStyle: Tailwindest = {};

export const Link = React.forwardRef<
  HTMLAnchorElement,
  React.PropsWithChildren<LinkProps>
>(function Link(
  { twCss, children, className, ...props }: LinkProps,
  ref: React.Ref<HTMLAnchorElement>,
) {
  return (
    <a
      ref={ref}
      className={twClassName(twCompose(defaultStyle, twCss), className)}
      {...props}
    >
      {children}
    </a>
  );
});

