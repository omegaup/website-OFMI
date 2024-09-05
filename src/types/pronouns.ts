import { exhaustiveMatchingGuard } from "@/utils";

export const Pronouns = ["SHE", "HE", "ZE", "OTHER"] as const;

export type Pronoun = (typeof Pronouns)[number];

export const PronounName = (pronoun: Pronoun): string => {
  switch (pronoun) {
    case "HE":
      return "Él";
    case "SHE":
      return "Ella";
    case "ZE":
      return "Elle";
    case "OTHER":
      return "Otro";
    default: {
      return exhaustiveMatchingGuard(pronoun);
      // The type here is automatically narrowed  ^^^^  to `never`
    }
  }
};

export const PronounsOfString = (pronoun: string): Pronoun | undefined => {
  return Pronouns.find((value) => value === pronoun);
};
