export const ShirtSizes = ["XS", "S", "M", "L", "XL"] as const;

export type ShirtSize = (typeof ShirtSizes)[number];

export const ShirtStyles = ["UNISEX"] as const;

export type ShirtStyle = (typeof ShirtStyles)[number];
