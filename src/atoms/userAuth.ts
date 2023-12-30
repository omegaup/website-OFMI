import { UserAuth } from "@/lib/prisma";
import { atom } from "jotai";

export const userAuthAtom = atom<UserAuth | null>(null);
