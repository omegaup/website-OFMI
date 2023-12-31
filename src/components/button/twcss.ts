import { tw, type Tailwindest } from "@/styles/twcss";
import { GetVariants } from "tailwindest";

const _base: Tailwindest = {};

// buttonType
const _buttonTypeDefault: Tailwindest = {
  // rounded-lg border px-4 py-2 duration-300
  borderRadius: "rounded-lg",
  borderWidth: "border",
  paddingX: "px-4",
  paddingY: "py-2",
  transitionDuration: "duration-300",
  ":disabled": {
    // cursor-not-allowed opacity-50
    cursor: "disabled:cursor-not-allowed",
    opacity: "disabled:opacity-50",
  },
};
const _buttonTypePrimary: Tailwindest = {
  // border-yellow-400 bg-yellow-400 text-gray-900;
  borderColor: "border-yellow-400",
  backgroundColor: "bg-yellow-400",
  color: "text-gray-900",
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
const _buttonTypeSecondary: Tailwindest = {
  // border-yellow-400 bg-transparent text-gray-200;
  borderColor: "border-yellow-400",
  backgroundColor: "bg-transparent",
  color: "text-gray-200",
  ":enabled": {
    /*
    .secondary:not([disabled]) {
      @apply hover:border-transparent hover:bg-yellow-400 hover:text-white;
    }
    */
    ":hover": {},
    backgroundColor: "enabled:bg-yellow-500",
  },
};
const _buttonTypeError: Tailwindest = {};
const _buttonTypePending: Tailwindest = {};
const _buttonTypeSuccess: Tailwindest = {};

// buttonSize
const _buttonSizeSm: Tailwindest = {};
const _buttonSizeMd: Tailwindest = {};
const _buttonSizeLg: Tailwindest = {};

export const defaultStyles = tw.variants({
  base: _base,

  variants: {
    buttonType: {
      default: _buttonTypeDefault,
      primary: _buttonTypePrimary,
      secondary: _buttonTypeSecondary,
      error: _buttonTypeError,
      pending: _buttonTypePending,
      success: _buttonTypeSuccess,
    },
    buttonSize: {
      sm: _buttonSizeSm,
      md: _buttonSizeMd,
      lg: _buttonSizeLg,
    },
  },
});

export type ButtonVariantProps = GetVariants<typeof defaultStyles> & {
  twcss?: Tailwindest;
};
export type ButtonType = ButtonVariantProps["buttonType"];
export type ButtonSize = ButtonVariantProps["buttonSize"];
