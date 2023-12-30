import { UserAuth } from "@/types/schema.types";
import { atom } from "jotai";

export const userAuthAtom = atom<UserAuth | null>(null);
