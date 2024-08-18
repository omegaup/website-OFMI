import { exhaustiveMatchingGuard } from "@/utils";

export const ShirtSizes = ["XS", "S", "M", "L", "XL"] as const;

export type ShirtSize = (typeof ShirtSizes)[number];

export const ShirtStyles = ["STRAIGHT", "WAISTED"] as const;

export type ShirtStyle = (typeof ShirtStyles)[number];

export const ShirtSizeOfString = (shirtSize: string): ShirtSize | undefined => {
  return ShirtSizes.find((value) => value === shirtSize);
};

export const ShirtStyleOfString = (
  shirtStyle: string,
): ShirtStyle | undefined => {
  return ShirtStyles.find((value) => value === shirtStyle);
};

export const ShirtStyleName = (shirtStyle: ShirtStyle): string => {
  switch (shirtStyle) {
    case "STRAIGHT":
      return "Recto";
    case "WAISTED":
      return "Acinturado";
    default: {
      return exhaustiveMatchingGuard(shirtStyle);
    }
  }
};
