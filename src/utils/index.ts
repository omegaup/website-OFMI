export const exhaustiveMatchingGuard = (x: never): never => {
  throw new Error(`Unhandled type for item: ${x}`);
};

export const undefinedIfEmpty = (s?: string): string | undefined => {
  // Returns undefined if the string is empty
  return s ? s : undefined;
};
