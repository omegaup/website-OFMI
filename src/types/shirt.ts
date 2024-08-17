export const ShirtSizes = ["XS", "S", "M", "L", "XL"] as const;

export type ShirtSize = (typeof ShirtSizes)[number];

export const ShirtStyles = ["UNISEX"] as const;

export type ShirtStyle = (typeof ShirtStyles)[number];

export const ShirtSizeOfString = (shirtSize: string): ShirtSize | undefined => {
  return ShirtSizes.find((value) => value === shirtSize);
};

export const ShirtStyleOfString = (
  shirtStyle: string,
): ShirtStyle | undefined => {
  return ShirtStyles.find((value) => value === shirtStyle);
};
