export const exhaustiveMatchingGuard = (x: never): never => {
  throw new Error(`Unhandled type for item: ${x}`);
};

export const undefinedIfEmpty = (s?: string): string | undefined => {
  // Returns undefined if the string is empty
  return s ? s : undefined;
};

export function filterNull<T>(arr: Array<T | null>): Array<T> {
  return arr
    .filter((v) => v !== null)
    .map((v) => {
      if (v === null) {
        throw Error("Bug: filterNull failed");
      }
      return v;
    });
}

export function jsonToCsv(items: Array<object>): string {
  if (items.length === 0) {
    return "";
  }
  const header = Object.keys(items[0]);
  const headerString = header.join(",");
  // handle null or undefined values here
  const replacer = (key: unknown, value: string): string => value ?? "";
  const rowItems = items.map((row) =>
    header
      .map((fieldName) =>
        JSON.stringify(row[fieldName as keyof typeof row], replacer),
      )
      .join(","),
  );
  // join header and body, and break into separate lines
  const csv = [headerString, ...rowItems].join("\r\n");
  return csv;
}
