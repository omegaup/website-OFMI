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

export function jsonToCsv(items: Array<Record<string, string>>): string {
  if (items.length === 0) {
    return "";
  }
  const header = Object.keys(items[0]);
  const headerString = header.join(",");
  // handle null or undefined values here
  // const replacer = (key: unknown, value: string): string => value ?? "";
  const csvContent = items.map((obj) =>
    header
      .map((key) => {
        const value = obj[key] || "";
        return `"${value.replace(/"/g, '""')}"`;
      })
      .join(","),
  );
  // join header and body, and break into separate lines
  const csv = [headerString, ...csvContent].join("\r\n");
  return csv;
}
