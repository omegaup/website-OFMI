import { CreateUserRequest, CreateUserResponse } from "@/types/auth.schema";
import { BadRequestError } from "@/types/errors";

export async function sendSignUp({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<
  | {
      success: false;
      error: Error;
    }
  | {
      success: true;
      data: CreateUserResponse;
    }
> {
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

  if (response.status === 500) {
    return {
      success: false,
      error: new Error("Internal server error"),
    };
  }

  if (response.status !== 201) {
    const data: BadRequestError = await response.json();
    return {
      success: false,
      error: new Error(data.message),
    };
  }

  const data: CreateUserResponse = await response.json();
  return {
    success: true,
    data,
  };
}
