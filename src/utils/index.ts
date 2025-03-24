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
      return (
        word[0].toUpperCase() + word.substring(1, word.length).toLowerCase()
      );
    })
    .join(" ");
};

export const shuffleArray = <T>(array: T[]): T[] => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

export const getRandomIndex = (length: number): number => {
  return Math.floor(Math.random() * length);
};

export const generatePassword = (length = 10): string => {
  let password = "";
  const choices =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*()-_=+[]{}|;:,.<>?";
  for (let i = 0; i < length; i++) {
    password += choices[getRandomIndex(choices.length)];
  }
  return password;
};

export const generateString = (length: number): string => {
  let string = "";
  const choices = "abcdefghijklmnopqrstuvwxyz";
  for (let i = 0; i < length; i++) {
    string += choices[getRandomIndex(choices.length)];
  }
  return string;
};

export const generatePhoneNumber = (): string => {
  let phone = "";
  const choices = "0123456789";
  for (let i = 0; i < 3; i++) {
    phone += choices[1 + getRandomIndex(9)];
  }
  for (let i = 3; i < 10; i++) {
    phone += choices[getRandomIndex(10)];
  }
  return phone;
};

export const replaceSpanishLetters = (original: string) => {
  const substitutions = new Map([
    ["Á", "A"],
    ["É", "E"],
    ["Í", "I"],
    ["Ó", "O"],
    ["Ú", "U"],
    ["Ñ", "N"],
    ["Ü", "U"],
  ]);
  let changed = "";
  for (const letter of original) {
    if (substitutions.has(letter)) {
      changed += substitutions.get(letter);
    } else {
      changed += letter;
    }
  }
  return changed;
};

export const findNthVowel = (str: string, pos = 0) => {
  return str.match(/[AEIOU]/g)?.at(pos);
};

export const findNthConsonant = (str: string, pos = 0) => {
  return str.match(/[^AEIOU]/g)?.at(pos);
};

export const isVowel = (letter: string) => {
  return letter in ["A", "E", "I", "O", "U"];
};

export const generateCURP = (
  fullFirstName: string,
  fullLastName: string,
  birthday: Date,
  state: string,
  sex: "H" | "M",
) => {
  state.toUpperCase();
  const firstNames = replaceSpanishLetters(fullFirstName.toUpperCase()).split(
    " ",
  );
  const lastNames = replaceSpanishLetters(fullLastName.toUpperCase()).split(
    " ",
  );
  const states = new Map([
    ["BAJA CALIFORNIA", "BC"],
    ["BAJA CALIFORNIA SUR", "BCS"],
    ["CAMPECHE", "CC"],
    ["DISTRITO FEDERAL", "DF"],
    ["NUEVO LEON", "NL"],
    ["QUERETARO", "QT"],
    ["SAN LUIS POTOSI", "SP"],
  ]);
  return (
    lastNames[0][0] +
    findNthVowel(lastNames[0]) +
    lastNames[1][0] +
    firstNames[0][0] +
    String(birthday.getFullYear()).slice(-2) +
    String(birthday.getMonth() + 1).padStart(2, "0") +
    String(birthday.getDate()).padStart(2, "0") +
    sex +
    (states.get(replaceSpanishLetters(state)) ??
      state[0] + findNthConsonant(state, -1)) +
    findNthConsonant(lastNames[0], isVowel(lastNames[0][0]) ? 0 : 1) +
    findNthConsonant(lastNames[1], isVowel(lastNames[1][0]) ? 0 : 1) +
    findNthConsonant(firstNames[0], isVowel(firstNames[0][1]) ? 0 : 1) +
    String.fromCharCode(getRandomIndex(26) + 65) +
    String(getRandomIndex(10))
  );
};

export const generateRandomDateBetween = (start: Date, end: Date) => {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  );
};
