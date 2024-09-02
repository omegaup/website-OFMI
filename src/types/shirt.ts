import { exhaustiveMatchingGuard } from "@/utils";
import { ShirtSize } from "@prisma/client";

export const ShirtStyles = ["STRAIGHT", "WAISTED"] as const;

export type ShirtStyle = (typeof ShirtStyles)[number];

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

export const ShirtSizeName = (shirtSize: ShirtSize): string => {
  switch (shirtSize) {
    case "XS":
      return "XS (extra chica)";
    case "S":
      return "S (chica)";
    case "M":
      return "M (mediana)";
    case "L":
      return "L (grande)";
    case "XL":
      return "XL (extra grande)";
    case "XXL":
      return "XXL (extra extra grande)";
    default: {
      return exhaustiveMatchingGuard(shirtSize);
    }
  }
};
