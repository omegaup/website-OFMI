import { exhaustiveMatchingGuard } from "@/utils";
import { SchoolStage } from "@prisma/client";

export const SchoolStageName = (schoolStage: SchoolStage): string => {
  switch (schoolStage) {
    case "ELEMENTARY":
      return "Primaria";
    case "SECONDARY":
      return "Secundaria";
    case "HIGH":
      return "Preparatoria / Bachillerato";
    default: {
      return exhaustiveMatchingGuard(schoolStage);
    }
  }
};
