import React from "react";
import { Tailwindest } from "tailwindest";
import { WidgetProps, twClassName, twCompose } from "./twcss";

export interface TextProps extends WidgetProps<HTMLSpanElement> {}

const defaultStyle: Tailwindest = {
  display: "block",
  fontSize: "text-sm",
  color: "text-white",
  margin: "m-2",
  fontWeight: "font-medium",
};

export const Text = React.forwardRef<
  HTMLSpanElement,
  React.PropsWithChildren<TextProps>
>(function Text(
  { twCss, children, className, ...props }: TextProps,
  ref: React.Ref<HTMLSpanElement>,
) {
  return (
    <span
      ref={ref}
      className={twClassName(twCompose(defaultStyle, twCss), className)}
      {...props}
    >
      {children}
    </span>
  );
});
