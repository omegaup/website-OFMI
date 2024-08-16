import { tw, type Tailwindest } from "@/styles/twcss";
import { GetVariants } from "tailwindest";

export const defaultStyles = tw.variants({
  base: {},
  variants: {},
});

export type LinkVariantProps = GetVariants<typeof defaultStyles> & {
  twcss?: Tailwindest;
};
