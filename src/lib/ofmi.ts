import { prisma } from "@/lib/prisma";
import { Ofmi } from "@prisma/client";

export async function findMostRecentOfmi(): Promise<Ofmi | null> {
  return await prisma.ofmi.findFirst({
    orderBy: { edition: "desc" },
  });
}
