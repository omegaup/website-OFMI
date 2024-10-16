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

export const getMexStateCode = (name: string): string => {
  const exceptions = new Map([
    ["Baja California", "BCN"],
    ["Ciudad de México", "CMX"],
    ["Chiapas", "CHP"],
    ["Chihuahua", "CHH"],
    ["Guerrero", "GRO"],
    ["México", "MEX"],
    ["Nuevo León", "NLE"],
    ["Quintana Roo", "ROO"],
    ["San Luis Potosi", "SLP"],
  ]);
  let state = exceptions.get(name);
  if (!state) {
    state = name.substring(0, 3).toUpperCase();
  }
  return state;
};

export const capitalizeInitials = (words: string): string => {
  // Capitalizes the first letter of every word in a sentence, removing extra spaces
  const separated = words.split(" ").filter((word) => word.length);
  return separated
    .map((word) => {
      let initial = word[0];
      if ("a" <= initial && initial <= "z") {
        initial += -32;
      }
      return initial + word.substring(1).toLowerCase();
    })
    .join(" ");
};
