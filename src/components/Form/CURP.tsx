import Text from "./Text";
import { Text as IText } from "@/types/input.types";
import { Object as Obj } from "@/utils/initializeDefaults";

interface CURP extends IText {
  fullLast: string;
  fullFirst: string;
  birthday: string;
  state: string;
}

const letter = /[A-Z]/;
const vocal = /[AEIOU]/;
const consonant = /[BCDFGHJKLMNPQRSTVXYZ]/;

const clearName = (name: string): string[] => {
  const prepositions = [
    "DA",
    "DAS",
    "DE",
    "DEL",
    "DER",
    "DI",
    "DIE",
    "DD",
    "EL",
    "LA",
    "LOS",
    "LAS",
    "LE",
    "LES",
    "MAC",
    "MC",
    "VAN",
    "VON",
    "Y",
  ];
  const clear = name.replace(/\s+/g, " ").trim().toUpperCase();
  const names = clear.split(" ").filter((name) => {
    return !prepositions.includes(name);
  });
  return names;
};

const getFirstMatch = (regex: RegExp, str: string): string => {
  const result = regex.exec(str);
  if (result === null) {
    return "X";
  }
  return result[0];
};

const parseName = (cleanName = ""): Obj<string> => {
  const internal = cleanName.substring(1);
  return {
    firstVocal: getFirstMatch(vocal, internal),
    firstLetter: getFirstMatch(letter, cleanName),
    firstConsonant: getFirstMatch(consonant, internal),
  };
};

const pickFirstName = (fullFirstName: string): Obj<string> => {
  const [first, second] = clearName(fullFirstName);
  let name = "";
  if (!second) {
    name = first;
  } else if (first === "MARIA") {
    name = second;
  } else if (first === "JOSE") {
    name = second;
  } else {
    name = first;
  }
  return parseName(name);
};

const createSegment = (letters: string[]): string => {
  return letters.join("");
};

const reverseStr = (str: string, delimiter = ""): string => {
  return str.split(delimiter).reverse().join("");
};

export default function CURP({
  fullLast,
  fullFirst,
  birthday,
  state,
  ...others
}: CURP): JSX.Element {
  const [firstLastName, secondLastName] = clearName(fullLast);

  const {
    firstLetter: FLNI,
    firstVocal: FLNV,
    firstConsonant: FLNC,
  } = parseName(firstLastName);

  const { firstLetter: SLNI, firstConsonant: SLNC } = parseName(secondLastName);

  const { firstLetter: FNI, firstConsonant: FNC } = pickFirstName(fullFirst);

  const formatted = Intl.DateTimeFormat("es-MX", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(`${birthday}T00:00:00`));
  const birthdayStr = reverseStr(formatted, "/");
  const stateLastCons = getFirstMatch(
    consonant,
    reverseStr(state).toUpperCase(),
  );

  const firstRule = createSegment([FLNI, FLNV, SLNI, FNI, birthdayStr]);
  const secondRule = createSegment([
    state[0].toUpperCase(),
    stateLastCons,
    FLNC,
    SLNC,
    FNC,
  ]);
  const fullRule = new RegExp(`${firstRule}[MH]${secondRule}[A-Z][0-9]`);
  return (
    <Text
      validate={{
        func: (curp: string) => {
          if (curp.length !== 18) {
            return false;
          }
          return fullRule.test(curp);
        },
        message: "La CURP no es válida",
      }}
      {...others}
    />
  );
}
