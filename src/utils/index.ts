export const exhaustiveMatchingGuard = (x: never): never => {
  throw new Error(`Unhandled type for item: ${x}`);
};
