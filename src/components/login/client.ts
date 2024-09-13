import {
  ResendEmailVerificationRequest,
  ResendEmailVerificationResponse,
} from "@/types/auth.schema";
import { BadRequestError } from "@/types/errors";

export async function resendEmailVerification({
  email,
}: {
  email: string;
}): Promise<
  | {
      success: false;
      error: Error;
    }
  | {
      success: true;
      data: ResendEmailVerificationResponse;
    }
> {
  const payload: ResendEmailVerificationRequest = {
    email,
  };

  const response = await fetch("/api/user/resendEmailVerification", {
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

  if (response.status !== 200) {
    const data: BadRequestError = await response.json();
    return {
      success: false,
      error: new Error(data.message),
    };
  }

  const data: ResendEmailVerificationResponse = await response.json();
  return {
    success: true,
    data,
  };
}
