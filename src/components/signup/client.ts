import { userAuthAtom } from "@/atoms/userAuth";
import { CreateUserRequest, CreateUserResponse } from "@/types/auth.schema";
import { atom } from "jotai";

export const sendSignUpAtom = atom(
  null,
  async (
    _get,
    set,
    {
      email,
      password,
    }: {
      email: string;
      password: string;
    },
  ) => {
    const payload: CreateUserRequest = {
        email,
        password,
    };

    const response = await fetch("/api/user/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data: CreateUserResponse = await response.json();
    set(userAuthAtom, data.user);
    return data;
  },
);
