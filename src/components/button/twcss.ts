import { tw, type Tailwindest } from "@/styles/twcss";
import { GetVariants } from "tailwindest";

const base: Tailwindest = {
  // rounded-lg border px-4 py-2 duration-300
  borderRadius: "rounded-lg",
  borderWidth: "border-2",
  paddingX: "px-4",
  paddingY: "py-2",
  transitionDuration: "duration-300",
  ":disabled": {
    // cursor-not-allowed opacity-50
    cursor: "disabled:cursor-not-allowed",
    opacity: "disabled:opacity-50",
  },
};

// buttonType
const buttonTypePrimary: Tailwindest = {
  // border-yellow-400 bg-yellow-400 text-gray-900;
  borderColor: "border-yellow-400",
  backgroundColor: "bg-yellow-400",
  color: "text-gray-900",
  fontWeight: "font-bold",
  ":enabled": {
    /*
    .primary:not([disabled]) {
      @apply hover:bg-yellow-500;
    }
    */
    ":hover": {
      backgroundColor: "enabled:hover:bg-yellow-500",
    },
  },
};
const buttonTypeSecondary: Tailwindest = {
  // border-yellow-400 bg-transparent text-gray-200;
  borderColor: "border-yellow-400",
  backgroundColor: "bg-transparent",
  color: "text-gray-900",
  fontWeight: "font-semibold",
  ":enabled": {
    /*
    .secondary:not([disabled]) {
      @apply hover:border-transparent hover:bg-yellow-400 hover:text-white;
    }
    */
    ":hover": {
      backgroundColor: "enabled:hover:bg-yellow-500",
    },
  },
};

// buttonSize
const buttonSizeSm: Tailwindest = {
  // px-3 py-1
  fontSize: "text-sm",
  paddingX: "px-3",
  paddingY: "py-1",
};
const buttonSizeMd: Tailwindest = {
  // px-4 py-2
  fontSize: "text-base",
  paddingX: "px-4",
  paddingY: "py-2",
};
const buttonSizeLg: Tailwindest = {
  // px-6 py-3
  fontSize: "text-lg",
  paddingX: "px-5",
  paddingY: "py-3",
};

export const defaultStyles = tw.variants({
  base: base,

  variants: {
    buttonType: {
      primary: buttonTypePrimary,
      secondary: buttonTypeSecondary,
    },
    buttonSize: {
      sm: buttonSizeSm,
      md: buttonSizeMd,
      lg: buttonSizeLg,
    },
  },
});

export type ButtonVariantProps = GetVariants<typeof defaultStyles> & {
  twcss?: Tailwindest;
};
export type ButtonType = ButtonVariantProps["buttonType"];
export type ButtonSize = ButtonVariantProps["buttonSize"];
