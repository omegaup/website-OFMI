import React from "react";
import { Tailwindest } from "tailwindest";
import { TwProps, twClassName, twCompose } from "./twcss";
import { Text } from "./Text";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, TwProps {
  body: React.ReactNode;
}

const defaultStyle: Tailwindest = {};

export function Button({ twCss, className, ...props }: ButtonProps) {
  return (
    <button className={twClassName(twCompose(defaultStyle, twCss), className)} {...props}>
      <Text>{props.body}</Text>
    </button>
  );
}
