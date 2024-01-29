import type { Tailwindest } from "tailwindest";
import { Container, type ContainerProps } from "./Container";
import { twCompose } from "./twcss";

const hStackStyle: Tailwindest = {
  display: "flex",
  flexDirection: "flex-row",
};

export const HStack = ({ twCss, ...props }: ContainerProps) => {
  return <Container twCss={twCompose(hStackStyle, twCss)} {...props} />;
};
