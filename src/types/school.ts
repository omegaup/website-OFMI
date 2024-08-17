import { exhaustiveMatchingGuard } from "@/utils";
import { SchoolStage } from "@prisma/client";

export const SchoolStageName = (schoolStage: SchoolStage): string => {
  switch (schoolStage) {
    case "Elementary":
      return "Primaria";
    case "Secondary":
      return "Secundaria";
    case "High":
      return "Preparatoria / Bachillerato";
    default: {
      return exhaustiveMatchingGuard(schoolStage);
    }
  }
};
