import React from "react";
import classnames from "classnames";
import { type LinkVariantProps, defaultStyles } from "./twcss";

export interface LinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    LinkVariantProps {}

export const Link = React.forwardRef<
  HTMLAnchorElement,
  React.PropsWithChildren<LinkProps>
>(function Link(
  { twcss, children, className, ...props }: LinkProps,
  ref: React.Ref<HTMLAnchorElement>,
) {
  const linkTw = twcss ? defaultStyles.compose(twcss) : defaultStyles;
  return (
    <a ref={ref} className={classnames(linkTw.class({}), className)} {...props}>
      {children}
    </a>
  );
});
