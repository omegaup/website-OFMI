import React from "react";
import type { Tailwindest } from "tailwindest";
import { VStack } from "./VStack";
import { TwProps, twClassName, twCompose } from "./twcss";

export interface TextInputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    TwProps {
  label?: string;
}

// Add an alias

const commonStyle: Tailwindest = {
  display: "block",
  fontSize: "text-sm",
  color: "text-white",
};

const defaultLabelStyle = twCompose(
  {
    margin: "m-2",
    fontWeight: "font-medium",
  },
  commonStyle,
);

const defaultTextInputStyle = twCompose(
  {
    borderColor: "border-gray-600",
    backgroundColor: "bg-gray-700",
    color: "text-white",
    "::placeholder": {
      color: "placeholder:text-gray-400",
    },
    ":focus": {
      borderColor: "focus:border-blue-500",
      ringColor: "focus:ring-blue-500",
    },
    display: "block",
    width: "w-full",
    borderRadius: "rounded-lg",
    borderWidth: "border",
    padding: "p-2.5",
    fontSize: "text-sm",
  },
  commonStyle,
);

export const TextInput = React.forwardRef(function TextInput(
  { className, label, twCss, ...props }: TextInputProps,
  ref: React.Ref<HTMLInputElement>,
) {
  return (
    <VStack>
      {label && (
        <label className={twClassName(defaultLabelStyle)}>{label}</label>
      )}
      <input
        ref={ref}
        className={twClassName(
          twCompose(defaultTextInputStyle, twCss),
          className,
        )}
        {...props}
      />
    </VStack>
  );
});

